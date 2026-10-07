#!/usr/bin/env python3
"""Remove exact opening repetitions; retain all unique prose and fragment IDs."""
from pathlib import Path
import html
import re
from apply_field_manual import parse, ROOT

def text(s, n):
    value = re.sub(r'<a\b[^>]*class="heading-anchor"[^>]*>.*?</a>', '', s[n['start']:n['end']], flags=re.S)
    return ' '.join(html.unescape(re.sub(r'<[^>]*>', ' ', value)).split())

def title(value):
    return re.sub(r'^(?:article|chapter)\s+\d+\s*[—–:-]\s*', '', value, flags=re.I).casefold()

def clean(s):
    e = parse(s)
    header = next((n for n in e.nodes if 'article-page-header' in e.classes(n)), None)
    body = next((n for n in e.nodes if 'article-body' in e.classes(n)), None)
    if not header or not body:
        return s, []
    head = [n for n in e.nodes if header['inner'] <= n['start'] < header['end']]
    names = {title(text(s,n)) for n in head if n['tag'] == 'h1'}
    intros = {text(s,n) for n in head if n['tag'] == 'p' and text(s,n)}
    opening = [n for n in e.nodes if body['inner'] <= n['start'] < body['end'] and n['tag'] in ('h1','h2','p')][:4]
    removed = []
    ranges = []
    for n in opening:
        value = text(s,n)
        if not ((n['tag'] in ('h1','h2') and title(value) in names) or (n['tag']=='p' and value in intros)):
            continue
        target = n
        parent = n['parent']
        if parent and 'answer-block' in e.classes(parent):
            # Only remove the wrapper if its sole prose paragraph repeats the standfirst.
            prose = [x for x in e.nodes if parent['inner'] <= x['start'] < parent['end'] and x['tag'] in ('p','pre','ul','ol','table')]
            if len(prose)==1 and prose[0] is n:
                target = parent
        ids = [x['attrs']['id'] for x in e.nodes if target['start'] <= x['start'] < target['end'] and x['attrs'].get('id')]
        replacement = ''.join('<span id="'+html.escape(i,quote=True)+'" aria-hidden="true"></span>' for i in ids)
        ranges.append((target['start'],target['end'],replacement,ids))
        removed.append(value)
    removed_ids = {i for _,_,_,ids in ranges for i in ids}
    for a,b,replacement,_ in sorted(ranges,reverse=True):
        s=s[:a]+replacement+s[b:]
    if removed_ids:
        e=parse(s)
        toc=next((n for n in e.nodes if 'article-toc' in e.classes(n)),None)
        if toc:
            chunk=s[toc['start']:toc['end']]
            chunk=re.sub(r'<li\b[^>]*>\s*<a\b[^>]*href="#([^"]+)"[^>]*>.*?</a>\s*</li>',lambda m:'' if html.unescape(m[1]) in removed_ids else m[0],chunk,flags=re.S)
            count=len(re.findall('data-toc-link',chunk))
            chunk=re.sub(r'\d+ sections',f'{count} sections',chunk,count=1)
            s=s[:toc['start']]+chunk+s[toc['end']:]
    return s,removed

def main():
    changed=duplicates=0
    for p in sorted((ROOT/'articles').rglob('*.html')):
        old=p.read_text();new,removed=clean(old)
        if new!=old:
            p.write_text(new);changed+=1;duplicates+=len(removed)
    print(f'Opening cleanup: {duplicates} repetitions removed across {changed} articles.')
if __name__=='__main__':main()
