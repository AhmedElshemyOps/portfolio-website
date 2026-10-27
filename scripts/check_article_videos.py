"""Check local placements; optionally check public YouTube embed availability.

Offline checks never use credits. --online uses public player metadata and reports
blocked/ambiguous requests as unknown, not as deleted videos. No account changes.
"""
import argparse
from datetime import datetime, timezone
from html import unescape
import json
from pathlib import Path
import re
import urllib.request
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]

def availability(video_id, fetch=None):
    def request(url):
        req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
        with urllib.request.urlopen(req,timeout=20) as response:return response.read().decode()
    try:
        source=(fetch or request)('https://www.youtube.com/watch?v='+video_id+'&hl=en')
        match=re.search(r'var ytInitialPlayerResponse\s*=\s*(.*?);(?:var |</script>)',source)
        if not match:return 'unknown','YouTube did not return readable player metadata.'
        data=json.loads(match[1]);status=data.get('playabilityStatus',{});reason=status.get('reason','')
        if status.get('status')=='LOGIN_REQUIRED' or re.search(r'bot|sign in|confirm your age',reason,re.I):return 'unknown',reason or 'Sign-in required.'
        if status.get('playableInEmbed') is True:return 'available','Embedding allowed in public player metadata.'
        if status.get('playableInEmbed') is False:return 'unavailable',reason or 'YouTube reports embedding disabled.'
        if status.get('status') in {'ERROR','UNPLAYABLE'} and reason:return 'unavailable',reason
        return 'unknown',reason or 'No definitive embed status returned.'
    except Exception as error:return 'unknown',str(error)

def check(root=ROOT, online=False):
    matches=json.loads((root/'content/article-video-matches.json').read_text());issues=[];results=[];seen=set()
    for m in matches:
        vid=m['videoId'];p=root/m['article']
        if vid in seen:issues.append(vid+': duplicate manifest placement')
        seen.add(vid)
        if not p.is_file():issues.append(vid+': article missing');continue
        source=p.read_text();nodes=parse(source).nodes
        frames=[n for n in nodes if n['tag']=='iframe' and n['attrs'].get('src','').split('?')[0]=='https://www.youtube-nocookie.com/embed/'+vid]
        if len(frames)!=1:issues.append(vid+': expected exactly one embed')
        else:
            frame=frames[0];figure=frame['parent']['parent'];before=source[:figure['start']].rstrip()
            paragraph=re.search(r'<p\b[^>]*>((?:(?!<p\b).)*)</p>$',before,re.S)
            clean=' '.join(unescape(re.sub('<[^>]+>','',paragraph.group())).replace('#','').split()) if paragraph else ''
            if clean!=m['afterParagraph']:issues.append(vid+': paragraph changed; editorial review required')
        status,reason=availability(vid) if online else ('not_checked','Run with --online to check public YouTube availability.')
        results.append({'videoId':vid,'article':m['article'],'status':status,'reason':reason})
    placements={}
    for p in (root/'articles').glob('*/index.html'):
        for node in parse(p.read_text()).nodes:
            src=node['attrs'].get('src','')
            if node['tag']=='iframe' and 'youtube' in src:
                vid=src.rsplit('/',1)[-1].split('?')[0]
                placements.setdefault(vid,[]).append(p.relative_to(root).as_posix())
                if vid not in seen:issues.append(str(p.relative_to(root))+': unmapped YouTube embed')
    for vid,paths in placements.items():
        if len(paths)>1:issues.append(vid+': duplicate embeds across articles: '+', '.join(paths))
    return {'checkedAt':datetime.now(timezone.utc).isoformat(),'online':online,'issues':issues,'videos':results}

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--online',action='store_true');parser.add_argument('--report',type=Path);args=parser.parse_args()
    result=check(online=args.online)
    if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
    if result['issues'] or any(v['status']=='unavailable' for v in result['videos']):return 1
    if args.online and any(v['status']=='unknown' for v in result['videos']):return 2
    return 0
if __name__=='__main__':raise SystemExit(main())
