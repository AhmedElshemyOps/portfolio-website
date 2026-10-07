"""Rebuild catalogue consumers and shared page chrome from published pages.
Run from any directory: python3 scripts/sync_catalogue.py.
No dependencies. Existing discovery records retain curated taxonomy.
"""
from pathlib import Path
from html import escape, unescape
import json, re, math
ROOT=Path(__file__).resolve().parents[1]
# Validate before writing any catalogue outputs; never publish an empty template.
from sync_hotel_prompts import check as check_prompt_content
check_prompt_content(ROOT)
def clean(s): return unescape(re.sub('<[^>]+>', ' ', s)).strip()
def match(pattern,s,default=''):
 m=re.search(pattern,s,re.S|re.I);return clean(m.group(1)) if m else default
def write_json(name,value): (ROOT/'content'/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
old=json.loads((ROOT/'content/discovery-index.json').read_text())
by_url={x['url']:x for x in old}
registry=[]
for p in sorted((ROOT/'articles').glob('*/index.html')):
 s=p.read_text(); title=match(r'<h1[^>]*>(.*?)</h1>',s)
 if not title: continue
 url='/'+p.relative_to(ROOT).as_posix(); item=dict(by_url.get(url,{}))
 eyebrow=match(r'<(?:span|p|div)[^>]*class="[^"]*eyebrow[^"]*"[^>]*>(.*?)</(?:span|p|div)>',s)
 description=match(r'<meta\s+name="description"\s+content="([^"]*)"',s)
 hotel=p.parent.name.startswith('hotel-') or p.parent.name in ['responsible-ai-governance-hotels','workforce-rostering-productivity-ai-toolkit']
 track_b='Hotel Apartment Operational Excellence' in eyebrow
 category=item.get('category') or ('Hotel Apartment Operational Excellence' if track_b else 'Hotel & Serviced Apartment AI Operations' if hotel else eyebrow.split('·')[0].strip())
 pillar=item.get('pillar') or ('Operational Excellence & SOPs' if track_b else 'Hotel & Serviced Apartment AI' if hotel else category)
 series=item.get('series') or ('Hotel Apartment Operational Excellence' if track_b else 'Hotel AI Operations Playbook' if hotel else category)
 body=match(r'<article\b[^>]*>(.*?)</article>',s,s)
 words=len(body.split()); minutes=max(1,math.ceil(words/220))
 # Prefer the visible metadata, where editorially supplied.
 visible=match(r'<dd[^>]*>\s*(\d+)\s*(?:minutes|min)',s)
 if visible: minutes=int(visible)
 headings=[clean(x) for x in re.findall(r'<h2[^>]*>(.*?)</h2>',s,re.S)]
 item.update(id=p.parent.name,title=title,url=url,description=description or item.get('description',''),category=category,pillar=pillar,series=series,type=item.get('type','Article'),contentType=item.get('contentType','Field guide'),readingTime=minutes,wordCount=words,headings=headings)
 if item['contentType']=='Series index': item['type']='Series index'
 item.setdefault('tags',[series]);item.setdefault('learningPaths',[])
 registry.append(item)
# Include genuine series hubs living under /series (not roadmap-only chapters).
for p in sorted((ROOT/'series').glob('*/index.html')):
 url='/'+p.relative_to(ROOT).as_posix();page=p.read_text();title=match(r'<h1[^>]*>(.*?)</h1>',page)
 if not title:continue
 item=dict(by_url.get(url,{}));track_b='operational-excellence' in p.parent.name;hotel='hotel-' in p.parent.name
 item.update(id=item.get('id',p.parent.name),type='Series index',contentType='Series index',url=url,title=title,description=match(r'<meta\s+name="description"\s+content="([^"]*)"',page),pillar='Operational Excellence & SOPs' if track_b else 'Hotel & Serviced Apartment AI' if hotel else 'Market Intelligence & Product Discovery',series='Hotel Apartment Operational Excellence' if track_b else 'Hotel AI Operations Playbook' if hotel else 'Amsterdam Product Discovery')
 item.setdefault('category',item['series']);item.setdefault('tags',[item['series']]);item.setdefault('readingTime',1);item.setdefault('wordCount',0)
 registry.append(item)
assert len({x['url'] for x in registry})==len(registry)
write_json('article-registry.json',registry)
write_json('discovery-index.json',[x for x in old if x.get('type') not in ['Article','Series index']]+registry)
articles=[x for x in registry if x['type']=='Article']
write_json('articles.json',[dict(title=x['title'],slug=x['id'],url=x['id']+'.html',category=x['category'],pillar=x['pillar'],summary=x['description'],status='Published',readingTime=x['readingTime'],source='Published article registry') for x in articles])
write_json('article-stats.json',[dict(slug=x['id'],wordCount=x['wordCount']) for x in articles])
content=json.loads((ROOT/'content/content-index.json').read_text())
content['articles']=[dict(title=x['title'],slug=x['id'],category=x['category'],summary=x['description'],canonical='https://ahmedqualityops.com'+x['url'],readingMinutes=x['readingTime']) for x in articles]
write_json('content-index.json',content)
# Generate Knowledge Hub cards and filters from the same records used by search.
p=ROOT/'knowledge/index.html';s=p.read_text()
# Release batches are now represented in the unified catalogue, not duplicated grids.
s=re.sub(r'<section class="knowledge-browser"><header><span class="eyebrow">Track B · New release</span>.*?</section>', '', s, flags=re.S)
for field in ['pillar','series','type']:
 key='contentType' if field=='type' else field
 values=sorted({x[key] if x['type']!='Series index' or field!='type' else 'Series index' for x in registry})
 options='<option value="">All '+{'pillar':'topics','series':'series','type':'types'}[field]+'</option>'+''.join('<option>'+escape(v)+'</option>' for v in values)
 s=re.sub(r'(<select data-knowledge-filter="'+field+r'">).*?(</select>)',lambda m:m[1]+options+m[2],s,flags=re.S)
cards=[]
for x in registry:
 typ='Series index' if x['type']=='Series index' else x['contentType']
 attrs=' '.join('data-'+k+'="'+escape(str(v),quote=True)+'"' for k,v in dict(pillar=x['pillar'],series=x['series'],type=typ,search=' '.join([x['title'],x['description'],*x['tags']]).lower()).items())
 label=x['series']+' · '+('Series index' if typ=='Series index' else str(x['readingTime'])+' min read')
 cards.append('<article class="knowledge-card" data-knowledge-card '+attrs+'><a href="'+escape(x['url'])+'"><span>'+escape(x['pillar'])+'</span><h2>'+escape(x['title'])+'</h2><p>'+escape(x['description'])+'</p><small>'+escape(label)+'</small></a></article>')
s=re.sub(r'<div class="knowledge-grid">.*?</div>(?=<div class="knowledge-empty")','<div class="knowledge-grid">'+''.join(cards)+'</div>',s,flags=re.S)
s=re.sub(r'"numberOfItems":\s*\d+','"numberOfItems":'+str(len(registry)),s)
p.write_text(s)
# All editorial pages use the same header/footer; demos retain their app controls.
header=(ROOT/'templates/header.html').read_text().strip()
footer=(ROOT/'templates/footer.html').read_text().strip()
count=0
for p in ROOT.rglob('*.html'):
 if any(part in ['.git','templates','live-demos','scripts'] for part in p.relative_to(ROOT).parts):continue
 s=p.read_text()
 if not re.search(r'<header\b[^>]*class="masthead"',s):continue
 s=re.sub(r'<header\b[^>]*class="masthead"[^>]*>.*?</header>',lambda m:header,s,count=1,flags=re.S)
 if re.search(r'<footer\b[^>]*class="(?:platform-footer|footer)"',s):
  s=re.sub(r'<footer\b[^>]*class="(?:platform-footer|footer)"[^>]*>.*?</footer>',lambda m:footer,s,count=1,flags=re.S)
 elif '</body>' in s:s=s.replace('</body>',footer+'</body>')
 for asset in ['<link rel="stylesheet" href="/assets/css/discovery.css"/>','<link rel="stylesheet" href="/assets/css/site-navigation.css"/>','<script defer src="/assets/js/discovery.js"></script>','<script defer src="/assets/js/saved-reading.js"></script>']:
  path=re.search(r'(?:href|src)="([^"]+)"',asset)[1]
  if path not in s:s=s.replace('</head>',asset+'</head>')
 # Topic chips lead to a filtered hub rather than the homepage.
 if '/articles/' in '/'+p.relative_to(ROOT).as_posix():
  item=next((x for x in registry if x['url']=='/'+p.relative_to(ROOT).as_posix()),None)
  if item:
   from urllib.parse import quote
   s=s.replace('href="/#articles"','href="/knowledge/index.html?pillar='+quote(item['pillar'])+'"')
 if s!=p.read_text():p.write_text(s);count+=1
print(f'{len(articles)} articles, {len(registry)-len(articles)} series indexes, {len({x["pillar"] for x in registry})} topics; synchronized {count} pages')
