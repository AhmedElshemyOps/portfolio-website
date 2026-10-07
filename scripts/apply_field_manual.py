#!/usr/bin/env python3
"""Idempotent, opt-in Field Manual presentation migration. Content is never rewritten."""
from pathlib import Path
from html.parser import HTMLParser
import re
ROOT=Path(__file__).resolve().parents[1]
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class Elements(HTMLParser):
 def __init__(self,s):
  super().__init__(convert_charrefs=False);self.s=s;self.starts=[0];self.stack=[];self.nodes=[]
  for m in re.finditer('\n',s):self.starts.append(m.end())
 def current_offset(self):l,c=self.getpos();return self.starts[l-1]+c
 def handle_starttag(self,t,a):
  start=self.current_offset();end=start+len(self.get_starttag_text());n={'tag':t,'attrs':dict(a),'start':start,'end':end,'inner':end,'parent':self.stack[-1] if self.stack else None};self.nodes.append(n)
  if t not in VOID:self.stack.append(n)
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  for j in range(len(self.stack)-1,-1,-1):
   if self.stack[j]['tag']==t:
    n=self.stack[j];n['end']=self.s.find('>',self.current_offset())+1;del self.stack[j:];break
 def classes(self,n):return set(n['attrs'].get('class','').split())
def parse(s):e=Elements(s);e.feed(s);return e
def remove_classes(s,classes):
 e=parse(s);ranges=[(n['start'],n['end']) for n in e.nodes if e.classes(n)&classes]
 # Keep only outermost deletion, avoiding overlapping ranges.
 ranges=[r for r in ranges if not any(a<=r[0] and b>=r[1] and (a,b)!=r for a,b in ranges)]
 for a,b in sorted(ranges,reverse=True):s=s[:a]+s[b:]
 return s
def migrate(s):
 if 'class="article-page-header"' not in s or 'class="article-reading-column"' not in s:return s,False
 if 'class="article-body"' not in s:
  e=parse(s);n=next(n for n in e.nodes if 'article-reading-column' in e.classes(n));end=s.rfind('</div>',n['inner'],n['end']);s=s[:end]+'</article>'+s[end:];s=s[:n['inner']]+'<article class="article-body">'+s[n['inner']:]
 if ' field-manual' in s:
  e=parse(s);n=next(n for n in e.nodes if 'article-body' in e.classes(n));chunk=s[n['inner']:n['end']];chunk=re.sub(r'<(/?)h1\b',r'<\1h2',chunk);s=s[:n['inner']]+chunk+s[n['end']:]
  return s,True
 s=re.sub(r'(<body\b[^>]*class=")([^"]*)',r'\1\2 field-manual',s,count=1)
 s=re.sub(r'<link[^>]+href="/assets/css/(?:article-pages|reader-experience)\.css"[^>]*>','',s)
 s=re.sub(r'<script[^>]+src="/assets/js/reader-experience.js"[^>]*></script>','',s)
 s=s.replace('</head>','<link rel="stylesheet" href="/assets/css/article-field-manual.css"/></head>')
 series=re.search(r'<small>(Article \d+ of \d+)</small>',s);position=series[1] if series else ''
 s=remove_classes(s,{'article-hero-visual','article-brief','article-series-bar','related-section','reader-next-block','article-footer'})
 e=parse(s);moving=[n for n in e.nodes if e.classes(n)&{'article-topline','article-glossary'}]
 snippets=[s[n['start']:n['end']] for n in moving]
 for n in sorted(moving,key=lambda n:n['start'],reverse=True):s=s[:n['start']]+s[n['end']:]
 e=parse(s);body=next(n for n in e.nodes if 'article-body' in e.classes(n));i=body['end'];s=s[:i]+''.join(snippets)+s[i:]
 e=parse(s);aside=next((n for n in e.nodes if 'article-toc' in e.classes(n)),None)
 if aside:
  toc=s[aside['start']:aside['end']];toc=toc.replace('<summary>In this article','<summary>On this page',1)
  if position:toc=toc.replace('>',f'><p class="series-position">{position}</p>',1)
  ids=set(re.findall(r'\bid="([^"]+)"',s));toc=re.sub(r'<li>\s*<a\b[^>]*href="#([^"]+)"[^>]*>.*?</a>\s*</li>',lambda m:m[0] if m[1] in ids else '',toc,flags=re.S)
  n=len(re.findall('data-toc-link',toc));toc=re.sub(r'\d+ sections',f'{n} sections',toc,count=1)
  toc=toc.replace('Sections 19–23','Sections 19–22') if n==22 else toc
  s=s[:aside['start']]+toc+s[aside['end']:]
 e=parse(s);n=next(n for n in e.nodes if 'article-body' in e.classes(n));chunk=s[n['inner']:n['end']];chunk=re.sub(r'<(/?)h1\b',r'<\1h2',chunk);s=s[:n['inner']]+chunk+s[n['end']:]
 return s,True
def main():
 changed=articles=pages=0
 for p in ROOT.rglob('*.html'):
  if any(x in {'.git','node_modules','docs','templates'} for x in p.relative_to(ROOT).parts):continue
  old=p.read_text();s,is_article=migrate(old);articles+=is_article
  if '<head' not in s:continue
  if '/assets/css/site-field-manual.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="/assets/css/site-field-manual.css"/></head>')
  pages+=1
  if s!=old:p.write_text(s);changed+=1
 print(f'Field Manual: {articles} editorial articles; shared design on {pages} pages; {changed} files changed.')
if __name__=='__main__':main()
