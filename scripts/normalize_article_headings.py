#!/usr/bin/env python3
"""Normalize article heading levels and curated labels, preserving fragment IDs."""
import csv
import html
import json
import re
from apply_field_manual import ROOT, parse
from clean_article_openings import text

NUMBER=re.compile(r'^\s*(?:#\s*)?(?:\d+(?:\.\d+)*[.)]\s+|section\s+\d+\s*[:—–-]\s*)',re.I)
def unnumber(value):
    previous=None
    while previous!=value:
        previous=value;value=NUMBER.sub('',value)
    return value.strip()

def rows():
    with (ROOT/'content/editorial/heading-labels.tsv').open() as stream:
        return {(r['slug'],r['id']):r['label'] for r in csv.DictReader(stream,delimiter='\t')}

def normalize(s,slug,labels):
    e=parse(s);body=next((n for n in e.nodes if 'article-body' in e.classes(n)),None)
    if not body:return s,0
    header=next(n for n in e.nodes if 'article-page-header' in e.classes(n))
    edits=[];previous=1;changed=0;old_title=None;new_title=labels.get((slug,'@title'))
    for n in e.nodes:
        if n['tag'] not in ('h1','h2','h3','h4','h5','h6'):continue
        in_body=body['inner']<=n['start']<body['end']
        if not in_body and not (n['tag']=='h1' and header['inner']<=n['start']<header['end']):continue
        old=text(s,n);label=labels.get((slug,n['attrs'].get('id')),unnumber(old))
        level=int(n['tag'][1])
        if not in_body:
            old_title=old;label=new_title or old;level=1
        else:
            parents=[];p=n['parent']
            while p:parents.append(p);p=p['parent']
            prompt=next((p for p in parents if 'prompt-section' in e.classes(p)),None)
            if prompt:
                first=next(x for x in e.nodes if prompt['inner']<=x['start']<prompt['end'] and x['tag'] in ('h2','h3','h4'))
                level=3 if n is first else max(4,level)
            elif level==2 and re.search(r'\bPrompt\s+\d+\b',label,re.I):level=3
            if level>previous+1:level=previous+1
            previous=level
        raw=s[n['start']:n['end']]
        renamed=label!=old
        opening=s[n['start']:n['inner']]
        opening=re.sub(r'^<h[1-6]\b','<h'+str(level),opening)
        inner=raw[len(s[n['start']:n['inner']]):raw.rfind('</')]
        if renamed:
            anchors=[a for a in e.nodes if n['inner']<=a['start']<n['end'] and a['tag']=='a']
            permalinks=[a for a in anchors if 'heading-anchor' in e.classes(a)]
            other=[a for a in anchors if a not in permalinks]
            prefix=''
            for a in permalinks:
                anchor=s[a['start']:a['end']]
                anchor=re.sub(r'aria-label="[^"]*"','aria-label="'+html.escape('Link to '+label,quote=True)+'"',anchor)
                prefix+=anchor
            if len(other)==1 and text(s,other[0])==old:
                a=other[0];inner=prefix+s[a['start']:a['inner']]+html.escape(label)+'</a>'
            elif other:
                raise ValueError('Heading has complex links requiring editorial review: '+slug+' / '+old)
            else:inner=prefix+html.escape(label)
        new=opening+inner+'</h'+str(level)+'>'
        if new!=raw:edits.append((n['start'],n['end'],new));changed+=1
    # Keep browser and sharing titles consistent with a shortened page title.
    if old_title and new_title:
        for n in e.nodes:
            if n['tag']=='title':
                old=text(s,n);new=old.replace(old_title,new_title)
                if old!=new:edits.append((n['inner'],s.rfind('</title',n['inner'],n['end']),html.escape(new)))
            if n['tag']=='meta' and (n['attrs'].get('property')=='og:title' or n['attrs'].get('name')=='twitter:title'):
                raw=s[n['start']:n['end']];new=re.sub(r'content="[^"]*"','content="'+html.escape(new_title,quote=True)+'"',raw)
                if raw!=new:edits.append((n['start'],n['end'],new))
            if n['tag']=='script' and n['attrs'].get('type')=='application/ld+json':
                end=s.rfind('</script',n['inner'],n['end']);raw=s[n['inner']:end]
                data=json.loads(raw)
                def update(value):
                    if isinstance(value,dict):
                        return {k:(new_title if k in ('headline','name') and v==old_title else update(v)) for k,v in value.items()}
                    if isinstance(value,list):return [update(x) for x in value]
                    return value
                updated=update(data)
                if data!=updated:edits.append((n['inner'],end,json.dumps(updated,ensure_ascii=False)))
    for start,end,new in sorted(edits,reverse=True):s=s[:start]+new+s[end:]
    return s,changed

def main():
    labels=rows();pages=count=0
    for p in (ROOT/'articles').glob('*/index.html'):
        old=p.read_text();new,n=normalize(old,p.parent.name,labels)
        if old!=new:p.write_text(new);pages+=1;count+=n
    print(f'Heading hierarchy: {count} headings improved across {pages} pages.')
if __name__=='__main__':main()
