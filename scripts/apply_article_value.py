#!/usr/bin/env python3
"""Apply curated practical-value openings without rewriting article bodies."""
import csv
from html import escape
from pathlib import Path
from apply_field_manual import ROOT, parse

def load_rows(root=ROOT):
    path=root/'content/editorial/article-practical-value.tsv'
    with path.open() as stream:
        rows=list(csv.DictReader(stream,delimiter='\t'))
    values={row['slug']:row for row in rows}
    if len(values)!=len(rows):
        raise ValueError('Duplicate practical-value slug')
    for row in rows:
        if not all(row.get(key,'').strip() for key in ('slug','problem','audience','outcome')):
            raise ValueError('Incomplete practical-value opening: '+row.get('slug',''))
    return values

def apply(s, row):
    e=parse(s)
    header=next((n for n in e.nodes if 'article-page-header' in e.classes(n)),None)
    body=next((n for n in e.nodes if 'article-body' in e.classes(n)),None)
    if not header or not body:
        raise ValueError('Article template missing: '+row['slug'])
    intro=next((n for n in e.nodes if n['tag']=='p' and n['parent'] is header),None)
    problem='<p>'+escape(row['problem'])+'</p>'
    purpose=('<section class="article-purpose" aria-label="Article practical value"><dl>'
        '<div><dt>Who this helps</dt><dd>'+escape(row['audience'])+'</dd></div>'
        '<div><dt>What you can do</dt><dd>'+escape(row['outcome'])+'</dd></div>'
        '</dl></section>')
    existing=[n for n in e.nodes if 'article-purpose' in e.classes(n)]
    if len(existing)>1:
        raise ValueError('Duplicate practical-value block: '+row['slug'])
    edits=[]
    if intro:
        edits.append((intro['start'],intro['end'],problem))
    else:
        heading=next(n for n in e.nodes if n['tag']=='h1' and header['inner']<=n['start']<header['end'])
        edits.append((heading['end'],heading['end'],problem))
    if existing:
        n=existing[0];edits.append((n['start'],n['end'],purpose))
    else:
        edits.append((body['inner'],body['inner'],purpose+'\n'))
    for start,end,new in sorted(edits,reverse=True):
        s=s[:start]+new+s[end:]
    return s

def apply_all(root=ROOT):
    rows=load_rows(root)
    pages=[p for p in (root/'articles').glob('*/index.html') if 'class="article-body"' in p.read_text()]
    missing={p.parent.name for p in pages}-rows.keys()
    if missing:
        raise ValueError('Missing practical-value openings: '+', '.join(sorted(missing)))
    changed=0
    for p in pages:
        old=p.read_text();new=apply(old,rows[p.parent.name])
        if new!=old:p.write_text(new);changed+=1
    return len(pages),changed

if __name__=='__main__':
    count,changed=apply_all()
    print(f'Practical value: {count} curated openings; {changed} pages changed.')
