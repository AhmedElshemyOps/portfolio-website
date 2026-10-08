"""Refresh catalogue consumers without running historical article migrations."""
from pathlib import Path
from html import escape
import json,re
from urllib.parse import quote
def display_topic(s): return s.replace('Hotel & Serviced Apartment AI','AI for Hotel Apartments')
def refresh(ROOT, registry):
 old=json.loads((ROOT/'content/discovery-index.json').read_text())
 def write_json(name,value): (ROOT/'content'/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
 assert len({x['url'] for x in registry})==len(registry)
 write_json('article-registry.json',registry)
 write_json('discovery-index.json',[x for x in old if x.get('type') not in ['Article','Series index']]+registry)
 articles=[x for x in registry if x['type']=='Article']
 write_json('articles.json',[dict(title=x['title'],slug=x['id'],url=x['url'],category=x['category'],pillar=x['pillar'],summary=x['description'],status='Published',readingTime=x['readingTime'],source='Published article registry') for x in articles])
 write_json('article-stats.json',[dict(slug=x['id'],wordCount=x['wordCount']) for x in articles])
 content=json.loads((ROOT/'content/content-index.json').read_text())
 content['articles']=[dict(title=x['title'],slug=x['id'],category=x['category'],summary=x['description'],canonical='https://ahmedqualityops.com'+x['url'],readingMinutes=x['readingTime']) for x in articles]
 write_json('content-index.json',content)
 # Generate Knowledge Hub cards and filters from the same records used by search.
 p=ROOT/'knowledge/index.html';s=p.read_text()
 topics=sorted({x['pillar'] for x in registry})
 topic_cards=''.join('<a class="topic-card" href="/knowledge/index.html?pillar='+quote(topic)+'#all-knowledge-title"><strong>'+escape(display_topic(topic))+'</strong><span>Explore this topic →</span></a>' for topic in topics)
 s=re.sub(r'(<nav class="topic-grid" aria-label="Article topics">).*?(</nav>)',lambda m:m[1]+topic_cards+m[2],s,flags=re.S)
 # Release batches are now represented in the unified catalogue, not duplicated grids.
 s=re.sub(r'<section class="knowledge-browser"><header><span class="eyebrow">Track B · New release</span>.*?</section>', '', s, flags=re.S)
 for field in ['pillar','series','type']:
  key='contentType' if field=='type' else field
  values=sorted({x[key] if x['type']!='Series index' or field!='type' else 'Series index' for x in registry})
  options='<option value="">All '+{'pillar':'topics','series':'series','type':'types'}[field]+'</option>'+''.join('<option value="'+escape(v,quote=True)+'">'+escape(display_topic(v))+'</option>' for v in values)
  s=re.sub(r'(<select data-knowledge-filter="'+field+r'">).*?(</select>)',lambda m:m[1]+options+m[2],s,flags=re.S)
 cards=[]
 for x in registry:
  typ='Series index' if x['type']=='Series index' else x['contentType']
  attrs=' '.join('data-'+k+'="'+escape(str(v),quote=True)+'"' for k,v in dict(pillar=x['pillar'],series=x['series'],type=typ,search=' '.join([x['title'],x['description'],*x['tags']]).lower()).items())
  label=x['series']+' · '+('Series index' if typ=='Series index' else str(x['readingTime'])+' min read')
  cards.append('<article class="knowledge-card" data-knowledge-card '+attrs+'><a href="'+escape(x['url'])+'"><span>'+escape(display_topic(x['pillar']))+'</span><h2>'+escape(x['title'])+'</h2><p>'+escape(x['description'])+'</p><small>'+escape(label)+'</small></a></article>')
 s=re.sub(r'<div class="knowledge-grid">.*?</div>(?=<div class="knowledge-empty")','<div class="knowledge-grid">'+''.join(cards)+'</div>',s,flags=re.S)
 s=re.sub(r'"numberOfItems":\s*\d+','"numberOfItems":'+str(len(registry)),s)
 p.write_text(s)
