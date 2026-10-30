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

def check(root=ROOT, online=False, lookup=None):
    matches=json.loads((root/'content/article-video-matches.json').read_text());issues=[];results=[];seen=set()
    inventory=json.loads((root/'content/youtube-videos.json').read_text())['videos']
    public={}
    for video in inventory:
        vid=video['videoId']
        if not re.fullmatch(r'[A-Za-z0-9_-]{11}',vid):
            issues.append('Invalid inventory video ID');continue
        if video.get('privacyStatus')!='public':continue
        if vid in public:issues.append(vid+': duplicate public inventory record')
        public[vid]=video
        if video.get('embedStatus') not in {'available','unavailable','unknown'}:
            issues.append(vid+': invalid recorded embed status')
    for m in matches:
        vid=m['videoId'];relative=m['article'];p=root/relative
        if not re.fullmatch(r'articles/[A-Za-z0-9_-]+/index\.html',relative):
            issues.append(vid+': unsafe article path');continue
        if vid not in public:issues.append(vid+': placement is not in the public inventory')
        elif public[vid].get('embedStatus')!='available':issues.append(vid+': placement lacks recorded embedding permission')
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
    library=root/'learn/videos/index.html'
    library_nodes=parse(library.read_text()).nodes if library.is_file() else []
    library_frames=[n['attrs'].get('src','').split('?')[0].rsplit('/',1)[-1] for n in library_nodes if n['tag']=='iframe' and 'youtube' in n['attrs'].get('src','')]
    article_ids={m['videoId'] for m in matches}
    by_id={m['videoId']:m for m in matches}
    for vid,video in public.items():
        expected=video['embedStatus'];library_count=library_frames.count(vid)
        required=0 if vid in article_ids or expected!='available' else 1
        if library_count!=required:issues.append(vid+': incorrect library player coverage')
        direct='https://www.youtube.com/watch?v='+vid
        if not any(n['tag']=='a' and n['attrs'].get('href')==direct for n in library_nodes):
            issues.append(vid+': library direct video link missing')
        status,reason=(lookup or availability)(vid) if online else ('not_checked','Run with --online to check public YouTube availability.')
        # A known direct-link-only lesson is intentional; report recovery without
        # silently changing the published inventory or rendering a new player.
        regression=online and expected=='available' and status=='unavailable'
        results.append({'videoId':vid,'article':by_id.get(vid,{}).get('article'),
                        'destination':'article' if vid in article_ids else 'library' if required else 'direct-link',
                        'recordedEmbedStatus':expected,'status':status,'reason':reason,
                        'embeddingRegression':regression,
                        'embeddingRecovery':online and expected!='available' and status=='available'})
    for vid in library_frames:
        if vid not in public:issues.append(vid+': unmapped library player')
    return {'checkedAt':datetime.now(timezone.utc).isoformat(),'online':online,'issues':issues,
            'inventoryCount':len(public),'articlePlacementCount':len(matches),'videos':results}

def exit_code(result):
    if result['issues'] or any(v['embeddingRegression'] for v in result['videos']):return 1
    if result['online'] and any(v['status']=='unknown' for v in result['videos']):return 2
    return 0

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--online',action='store_true');parser.add_argument('--report',type=Path);args=parser.parse_args()
    result=check(online=args.online)
    if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
    return exit_code(result)
if __name__=='__main__':raise SystemExit(main())
