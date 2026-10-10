"""Relevant, bounded reading paths and a complete directed internal-link inventory."""
from pathlib import Path
from html import escape,unescape
from urllib.parse import urlsplit
import json,re,argparse
from collections import Counter
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
STOP=set('hotel apartment apartments travel tourism hospitality ai operations operation management manager toolkit framework the a an and for of in to with from using how practical guide model playbook quality service building'.split())
def terms(row):
    return set(re.findall(r'[a-z]{3,}',(row.get('legacyTitle',row['title'])+' '+' '.join(row.get('legacyTags',row.get('tags',[])))).lower()))-STOP

def audit(root=ROOT):
    rows=json.loads((root/'content/article-registry.json').read_text());known={r['url']:r for r in rows};incoming=Counter();results=[]
    for row in rows:
        source=(root/row['url'].lstrip('/')).read_text()
        links={urlsplit(unescape(x)).path for x in re.findall(r'href="([^"]+)"',source)}&set(known)
        links.discard(row['url']);incoming.update(links)
        results.append(dict(id=row['id'],title=row['title'],url=row['url'],outgoing=sorted(links)))
    for item in results:item['incoming']=sorted(r['url'] for r in results if item['url'] in r['outgoing'])
    return dict(records=len(rows),articles=sum(r['type']=='Article' for r in rows),unique_edges=sum(len(r['outgoing']) for r in results),no_incoming=[r['url'] for r in results if not r['incoming']],no_outgoing=[r['url'] for r in results if not r['outgoing']],records_detail=results)

def link_explicit_references(source,rows):
    """Make written article paths clickable; leave prompts, citations and existing anchors alone."""
    known={r['url']:r for r in rows}
    class References(HTMLParser):
        def __init__(self):
            super().__init__(convert_charrefs=False);self.stack=[];self.edits=[]
            self.lines=[0]+[m.end() for m in re.finditer('\n',source)]
        def handle_starttag(self,tag,attrs):
            if tag not in {'meta','link','img','input','br','hr','source','use','area','wbr'}:self.stack.append(tag)
        def handle_endtag(self,tag):
            if tag in self.stack:self.stack=self.stack[:len(self.stack)-1-self.stack[::-1].index(tag)]
        def handle_data(self,data):
            if set(self.stack)&{'a','pre','script','style'}:return
            def replacement(m):
                path=m[1]
                if path not in known:return m[0]
                label=known[path]['title']
                return '<a href="'+escape(path,quote=True)+'">'+escape(label)+'</a>'
            updated=re.sub(r'`?(/articles/[a-z0-9-]+/index\.html)`?',replacement,data)
            if updated!=data:
                line,col=self.getpos();offset=self.lines[line-1]+col
                self.edits.append((offset,offset+len(data),updated))
    parser=References();parser.feed(source)
    for start,end,new in sorted(parser.edits,reverse=True):source=source[:start]+new+source[end:]
    return source

def render(source,row,rows):
    source=link_explicit_references(source,rows)
    indexes=[r for r in rows if r['type']=='Series index' and r['series']==row['series'] and r['id']!=row['id']]
    selected=indexes[:1]
    candidates=[r for r in rows if r['id']!=row['id'] and r['type']=='Article' and r['pillar']==row['pillar']]
    candidates.sort(key=lambda r:(-len(terms(row)&terms(r)),-int(r['series']==row['series']),r['id']))
    selected+=candidates[:3-len(selected)]
    if not selected:return source
    cards=[]
    for target in selected:
        reason='Explore the complete series and its reading order.' if target['type']=='Series index' else target['description']
        cards.append('<li><a href="'+escape(target['url'],quote=True)+'"><span>'+escape('Series guide' if target['type']=='Series index' else 'Related guide')+'</span><strong>'+escape(target.get('legacyTitle',target['title']))+'</strong><p>'+escape(reason)+'</p></a></li>')
    block='<section class="library-connections" id="library-connections" aria-labelledby="library-connections-title"><h2 id="library-connections-title">Connect this guide to your next step</h2><p>Continue with related methods and the wider series.</p><ul>'+''.join(cards)+'</ul></section>'
    existing=re.search(r'<section class="library-connections".*?</section>',source,re.S)
    if existing:return source[:existing.start()]+block+source[existing.end():]
    # Place before the existing action/checklist; preserve every legacy fragment and route.
    marker=re.search(r'<section class="article-ending"',source)
    if marker:return source[:marker.start()]+block+source[marker.start():]
    from apply_field_manual import parse
    nodes=parse(source).nodes;body=next((n for n in nodes if 'article-body' in n['attrs'].get('class','').split()),None)
    if body:
        end=source.rfind('</'+body['tag'],body['inner'],body['end']);return source[:end]+block+source[end:]
    # Series indexes use a normal main rather than the article reader.
    pos=source.rfind('</main>');return source[:pos]+block+source[pos:] if pos>=0 else source

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--report',type=Path);args=parser.parse_args()
    before=audit();rows=json.loads((ROOT/'content/article-registry.json').read_text());changed=0
    for row in rows:
        p=ROOT/row['url'].lstrip('/');s=p.read_text();new=render(s,row,rows)
        if new!=s:p.write_text(new);changed+=1
    after=audit()
    if args.report:args.report.write_text(json.dumps(dict(before=before,after=after),ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(dict(pages_updated=changed,before_edges=before['unique_edges'],after_edges=after['unique_edges'],no_incoming=after['no_incoming'],no_outgoing=after['no_outgoing'])))
if __name__=='__main__':main()
