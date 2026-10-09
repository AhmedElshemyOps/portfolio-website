#!/usr/bin/env python3
"""Build a semantic article outline with collapsed prompts and subsections."""
from html import escape
from pathlib import Path
import re
from apply_field_manual import ROOT, parse
from clean_article_openings import text

def ancestors(n):
    p=n['parent']
    while p:
        yield p
        p=p['parent']

def simplify(s):
    e=parse(s)
    toc=next((n for n in e.nodes if 'article-toc' in e.classes(n)),None)
    body=next((n for n in e.nodes if 'article-body' in e.classes(n)),None)
    if not toc or not body:return s,False
    # Older pages retained a second contents panel inside their imported body.
    duplicates=[n for n in e.nodes if n is not toc and 'article-toc' in e.classes(n)]
    if duplicates:
        for n in sorted(duplicates,key=lambda n:n['start'],reverse=True):
            s=s[:n['start']]+s[n['end']:]
        return simplify(s)
    by_id={n['attrs']['id']:n for n in e.nodes if n['attrs'].get('id')}
    old_links=[n for n in e.nodes if toc['inner']<=n['start']<toc['end'] and n['tag']=='a' and 'data-toc-link' in n['attrs']]
    records=[];seen=set();current=None
    for n in e.nodes:
        if not body['inner']<=n['start']<body['end'] or n['tag'] not in ('h2','h3','h4'):continue
        parents=list(ancestors(n))
        if any(e.classes(p)&{'library-connections','article-purpose','article-toc','article-feedback','article-read-time-card','article-next-actions','article-github-cta','related-insights-header','ai-playbook-context-link','v14-article-cta'} for p in parents):continue
        if n['attrs'].get('id','').startswith('article-feedback'):continue
        prompt_section=next((p for p in parents if 'prompt-section' in e.classes(p)),None)
        prompt=prompt_section is not None
        if prompt:
            first=next(x for x in e.nodes if prompt_section['inner']<=x['start']<prompt_section['end'] and x['tag'] in ('h2','h3','h4'))
            if n is not first:continue
        if any('data-prompt-card' in p['attrs'] or 'prompt-card' in e.classes(p) for p in parents):continue
        ident=n['attrs'].get('id')
        if not ident:
            ident=next((p['attrs']['id'] for p in parents if p is not body and p['attrs'].get('id')),None)
        if not ident or ident in seen:continue
        label=text(s,n).strip().lstrip('#').strip()
        if not label or label == 'Estimated article reading time':continue
        seen.add(ident);record=dict(id=ident,label=label,children=[],kind='prompt' if prompt else 'section')
        if prompt:
            if current is None or not re.search(r'prompt|template',current['label'],re.I):
                current=dict(id=None,label='Prompt templates',children=[],kind='group');records.append(current)
            current['children'].append(record)
        elif (n['tag'] in ('h3','h4') or re.search(r'\bPrompt\s+\d+\b',label,re.I)) and current:
            current['children'].append(record)
        else:
            records.append(record);current=record
    # Keep linked resource sections outside the body, while dropping empty aliases.
    for link in old_links:
        ident=link['attrs'].get('href','').removeprefix('#');target=by_id.get(ident)
        if ident in seen or not target or target['tag']=='span':continue
        if body['start']<=target['start']<body['end']:continue
        label=re.sub(r'^\d+\s*','',text(s,link)).strip()
        records.append(dict(id=ident,label=label,children=[],kind='section'));seen.add(ident)
    # A worked email sequence is detail within the sales scenario, not 20 main sections.
    emails=[i for i,r in enumerate(records) if re.match(r'Email\s+\d+\s*:',r['label'],re.I)]
    if len(emails)>1:
        first,last=emails[0],emails[-1]
        children=records[first:last+1]
        records[first:last+1]=[dict(id=None,label='Worked sales email sequence',children=children,kind='group')]
    def anchor(r):
        return '<a href="#'+escape(r['id'],quote=True)+'" data-toc-link>'+escape(r['label'])+'</a>'
    def item(r, main=True):
        children=r['children']
        content=anchor(r) if r['id'] else ''
        if children:
            prompts=all(x['kind']=='prompt' for x in children)
            label=(f'{len(children)} prompts' if prompts else f'{len(children)} subsections') if r['id'] else r['label']+f' ({len(children)})'
            content+='<details class="toc-children"><summary>'+escape(label)+'</summary><ol>'+''.join(item(x, False) for x in children)+'</ol></details>'
        return ('<li class="toc-main-item">' if main else '<li>')+content+'</li>'
    position=next((n for n in e.nodes if toc['inner']<=n['start']<toc['end'] and 'series-position' in e.classes(n)),None)
    prefix=s[position['start']:position['end']] if position else ''
    nav=('<aside class="article-toc" aria-label="Article navigation">'+prefix+'<details data-reader-toc><summary>On this page <span>'+str(len(records))+' main sections</span></summary><nav aria-label="Table of contents"><ol class="toc-main-sections">'+''.join(item(r) for r in records)+'</ol></nav></details></aside>')
    return s[:toc['start']]+nav+s[toc['end']:],True

def main():
    total=changed=0
    for p in (ROOT/'articles').glob('*/index.html'):
        old=p.read_text();new,matched=simplify(old);total+=matched
        if new!=old:p.write_text(new);changed+=1
    print(f'Simplified contents: {total} article outlines; {changed} pages changed.')
if __name__=='__main__':main()
