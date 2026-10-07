"""Curated method/prompt links at the point of use, with verified fragments."""
from pathlib import Path
from html import escape
import json,re
from collections import defaultdict
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]
REGISTRY=ROOT/'content/editorial/article-connections.json'
TERMS={
'hotel-apartment-operating-system':['hotel apartment operating system'],
'guest-ready-apartment-standard':['guest-ready standard','guest-ready apartment standard'],
'hotel-apartment-preventive-maintenance-strategy':['preventive maintenance strategy'],
'hotel-apartment-cost-of-poor-quality':['cost of poor quality','COPQ'],
'hotel-maintenance-work-order-management':['work order management','work-order management'],
'hotel-complaint-root-cause-analysis':['complaint root-cause analysis','complaint root cause analysis'],
'hotel-apartment-asset-lifecycle-management':['asset lifecycle management','asset life-cycle management'],
'hotel-apartment-total-cost-of-ownership':['total cost of ownership'],
'hotel-apartment-sop-architecture':['SOP architecture'],
'hotel-economics-of-service-failure':['economics of service failure'],
'hotel-housekeeping-standardization':['housekeeping standardization'],
'hotel-housekeeping-quality-control':['housekeeping quality control'],
'hotel-workforce-productivity-efficiency':['workforce efficiency','workforce productivity'],
'hotel-first-time-right-operations':['first-time-right','first time right'],
'hotel-guest-experience-quality-management':['guest experience quality management'],
'hotel-apartment-end-to-end-guest-journey':['end-to-end guest journey','hotel guest journey'],
'hotel-procurement-supplier-quality-control':['supplier quality control'],
'hotel-inventory-par-level-management':['PAR levels','PAR level'],
'hotel-critical-spare-parts-management':['critical spare parts','critical spares'],
'hotel-downtime-out-of-service-management':['out-of-service management','downtime management'],
'hotel-operations-planning-daily-control':['daily operations control','daily operating control'],
'hotel-apartment-kpi-architecture':['KPI architecture'],
'hotel-property-reliability-score':['property reliability score'],
'hotel-preventive-maintenance-kpis':['preventive maintenance KPIs','PM KPIs'],
'hotel-apartment-operations-control-tower':['hotel apartment operations control tower','hotel control tower'],
'hotel-operational-excellence-maturity-model':['operational excellence maturity model']}
def load_rows():return json.loads(REGISTRY.read_text())
def href(slug,fragment=''):return '/articles/'+slug+'/index.html'+('#'+fragment if fragment else '')
def apply(s,slug,rows):
 e=parse(s);edits=[];row=next((r for r in rows if r['article']==slug),None)
 if row:
  bridge=next(n for n in e.nodes if n['attrs'].get('id')=='ai-bridge')
  grid=next((n for n in e.nodes if bridge['start']<n['start']<bridge['end'] and ('related-grid' in e.classes(n) or 'method-prompt-list' in e.classes(n))),None)
  if not grid:raise ValueError('Missing method bridge: '+slug)
  links='<ul class="method-prompt-list">'+''.join('<li><a href="'+href(p['article'],p['fragment'])+'">'+escape(p['title'])+'</a><p>'+escape(p['when'])+'</p></li>' for p in row['prompts'])+'</ul>'
  edits.append((grid['start'],grid['end'],links))
  for p in row['prompts']:
   node=next(n for n in e.nodes if n['attrs'].get('id')==p['section'])
   marker=slug+':'+p['article']+':'+p['fragment']
   existing=next((n for n in e.nodes if n['attrs'].get('data-method-prompt')==marker),None)
   snippet='<p class="method-prompt-link" data-method-prompt="'+marker+'"><strong>Apply this method:</strong> <a href="'+href(p['article'],p['fragment'])+'">'+escape(p['title'])+'</a>. '+escape(p['when'])+'</p>'
   if existing:edits.append((existing['start'],existing['end'],snippet))
   else:
    pos=s.rfind('</section',node['inner'],node['end']);edits.append((pos,pos,snippet))
 # Link each selected prompt back to the method and its relevant section.
 reverse=defaultdict(list)
 for r in rows:
  for p in r['prompts']:
   if p['article']==slug:reverse[p['fragment']].append((r,p))
 for fragment,methods in reverse.items():
  node=next(n for n in e.nodes if n['attrs'].get('id')==fragment)
  existing=next((n for n in e.nodes if node['inner']<=n['start']<node['end'] and n['attrs'].get('data-prompt-method')==fragment),None)
  snippet='<div class="prompt-method-link" data-prompt-method="'+fragment+'"><strong>Operating method first</strong><ul>'+''.join('<li><a href="'+href(r['article'],p['section'])+'">'+escape(r['title'])+'</a></li>' for r,p in methods)+'</ul><p>Define the standard, evidence and decision authority before using this prompt.</p></div>'
  if existing:edits.append((existing['start'],existing['end'],snippet))
  else:
   heading=next(n for n in e.nodes if node['inner']<=n['start']<node['end'] and 'prompt-heading' in e.classes(n));edits.append((heading['end'],heading['end'],snippet))
 for a,b,new in sorted(edits,reverse=True):s=s[:a]+new+s[b:]
 # First relevant narrative mention only, at most three concept links per article.
 e=parse(s);body=next((n for n in e.nodes if 'article-body' in e.classes(n)),None)
 if not body:return s
 existing=[n for n in e.nodes if n['attrs'].get('data-concept-link')]
 remaining=3-len(existing);used={n['attrs']['data-concept-link'] for n in existing};edits=[]
 candidates=[]
 for r in rows:
  if r['article']==slug or r['article'] in used:continue
  for term in TERMS[r['article']]:candidates.append((len(term),term,r))
 candidates.sort(key=lambda x:x[0],reverse=True)
 for n in e.nodes:
  if remaining<=0:break
  if n['tag']!='p' or not(body['inner']<=n['start']<body['end']):continue
  parents=[];a=n
  while a:parents.append(a);a=a['parent']
  if any(a['tag'] in ('figure','table') or e.classes(a)&{'article-purpose','prompt-section','practical-example','method-prompt-list','method-prompt-link','prompt-method-link','visual-learning','article-ending'} or a['attrs'].get('id')=='ai-bridge' for a in parents):continue
  raw=s[n['inner']:s.rfind('</p',n['inner'],n['end'])]
  if '<a ' in raw:continue
  pieces=re.split('(<[^>]+>)',raw);found=False
  for _,term,r in candidates:
   if r['article'] in used:continue
   pattern=re.compile(r'(?<![\w-])'+re.escape(term)+r'(?![\w-])',re.I)
   for i in range(0,len(pieces),2):
    if pattern.search(pieces[i]):
     pieces[i]=pattern.sub(lambda m:'<a data-concept-link="'+r['article']+'" href="'+href(r['article'])+'">'+m[0]+'</a>',pieces[i],count=1)
     used.add(r['article']);remaining-=1;found=True;break
   if found:break
  if found:edits.append((n['inner'],s.rfind('</p',n['inner'],n['end']),''.join(pieces)))
 for a,b,new in reversed(edits):s=s[:a]+new+s[b:]
 return s

def main():
 rows=load_rows();changed=0
 for p in (ROOT/'articles').rglob('*.html'):
  old=p.read_text();new=apply(old,p.parent.name,rows)
  if new!=old:p.write_text(new);changed+=1
 print(f'Article connections: {changed} pages updated; 26 methods linked to 78 prompt uses.')
if __name__=='__main__':main()
