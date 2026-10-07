"""Put accessible reading preferences before the article on every editorial page."""
from pathlib import Path
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]
def migrate(s):
 e=parse(s);body=next((n for n in e.nodes if 'article-body' in e.classes(n)),None)
 if not body:return s
 utilities=[n for n in e.nodes if 'reader-utilities' in e.classes(n)]
 if utilities:
  n=utilities[0];raw=s[n['start']:n['end']]
 else:
  raw='<div class="reader-utilities"><div class="reader-font-controls"><button type="button" data-reader-font="decrease">A−</button><button type="button" data-reader-font="reset">A</button><button type="button" data-reader-font="increase">A+</button></div><button type="button" data-reader-contrast>High contrast</button><button type="button" data-reader-theme>Dark reading</button></div>'
 import re
 raw=re.sub(r'<div class="reader-utilities"[^>]*>','<div class="reader-utilities" role="group" aria-label="Reading preferences">',raw,count=1)
 labels={'decrease':'Decrease reading text size','reset':'Reset reading text size','increase':'Increase reading text size'}
 for action,label in labels.items():
  raw=re.sub(r'<button\b([^>]*data-reader-font="'+action+r'"[^>]*)>',lambda m:'<button'+re.sub(r'\saria-label="[^"]*"','',m[1])+' aria-label="'+label+'">',raw)
 for n in reversed(utilities):s=s[:n['start']]+s[n['end']:]
 e=parse(s);body=next(n for n in e.nodes if 'article-body' in e.classes(n))
 s=s[:body['start']]+raw+s[body['start']:]
 e=parse(s);edits=[];seen=set()
 for button in e.nodes:
  if 'data-copy-target' not in button['attrs']:continue
  card=button['parent']
  while card and not e.classes(card)&{'prompt-card','article-prompt'}:card=card['parent']
  if not card or card['start'] in seen:continue
  seen.add(card['start'])
  if any(card['inner']<=n['start']<card['end'] and (e.classes(n)&{'copy-status','article-copy-status'} or 'data-copy-status' in n['attrs']) for n in e.nodes):continue
  pos=s.rfind('</',card['inner'],card['end']);edits.append((pos,'<p class="copy-status" role="status" aria-live="polite"></p>'))
 for pos,snippet in reversed(edits):s=s[:pos]+snippet+s[pos:]
 e=parse(s);edits=[]
 for n in e.nodes:
  if not(e.classes(n)&{'copy-status','article-copy-status'} or 'data-copy-status' in n['attrs']):continue
  opening=s[n['start']:n['inner']]
  if 'aria-live' not in n['attrs']:opening=opening[:-1]+' aria-live="polite">'
  if 'role' not in n['attrs']:opening=opening[:-1]+' role="status">'
  edits.append((n['start'],n['inner'],opening))
 for a,b,value in reversed(edits):s=s[:a]+value+s[b:]
 return s
def main():
 changed=0
 for p in (ROOT/'articles').rglob('*.html'):
  old=p.read_text();new=migrate(old)
  if new!=old:p.write_text(new);changed+=1
 print(f'Reading preferences: {changed} articles updated.')
if __name__=='__main__':main()
