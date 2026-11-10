"""Refresh catalogue consumers without running historical article migrations."""
from pathlib import Path
from html import escape
import json,re
from urllib.parse import quote
def display_topic(s): return s.replace('Hotel & Serviced Apartment AI','AI for Hotel Apartments').replace('Hotel AI Operations Playbook','Hotel Apartment and Staycation AI Playbook')
# These public guides predate their entry in the controlled taxonomy. Keep
# them discoverable by title without assigning unapproved classifications.
UNCATEGORIZED_GUIDES = (
    '/articles/heijunka-tourism-operations/index.html',
    '/articles/yamazumi-chart-tourism-operations/index.html',
)

def discovery_records(root, registry, existing):
 from apply_field_manual import parse
 rows=[x for x in existing if x.get('type') not in ['Article','Series index']]
 rows += [dict(x,category=display_topic(x.get('category','')),title=display_topic(x.get('title',''))) for x in registry]
 urls={x['url'] for x in rows}
 for url in UNCATEGORIZED_GUIDES:
  if url in urls:
   continue
  nodes=parse((root/url.lstrip('/')).read_text()).nodes
  canonical=[n['attrs']['href'] for n in nodes if n['tag']=='link' and n['attrs'].get('rel')=='canonical']
  if canonical != ['https://ahmedqualityops.com'+url]:
   raise ValueError('Search supplement has an unexpected canonical: '+url)
  social={n['attrs'].get('property'):n['attrs'].get('content') for n in nodes if n['tag']=='meta'}
  if not social.get('og:title') or not social.get('og:description'):
   raise ValueError('Search supplement is missing published metadata: '+url)
  rows.append(dict(id=Path(url).parent.name,title=social['og:title'],type='Article',
                   description=social['og:description'],url=url,tags=[]))
 return rows

def refresh(ROOT, registry):
 old=json.loads((ROOT/'content/discovery-index.json').read_text())
 def write_json(name,value): (ROOT/'content'/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
 from validate_content_registry import validate
 validate(ROOT,registry)
 write_json('article-registry.json',registry)
 write_json('discovery-index.json',discovery_records(ROOT,registry,old))
 articles=[x for x in registry if x['type']=='Article']
 write_json('articles.json',[dict(title=x['title'],slug=x['id'],url=x['url'],category=x['category'],pillar=x['pillar'],summary=x['description'],status='Published',readingTime=x['readingTime'],source='Published article registry',**{k:x[k] for k in ('primaryCategory','subcategory','tags','seriesId','seriesPosition','seriesTitle','relatedArticles')}) for x in articles])
 write_json('article-stats.json',[dict(slug=x['id'],wordCount=x['wordCount']) for x in articles])
 content=json.loads((ROOT/'content/content-index.json').read_text())
 content['articles']=[dict(title=x['title'],slug=x['id'],category=x['category'],summary=x['description'],canonical='https://ahmedqualityops.com'+x['url'],readingMinutes=x['readingTime'],**{k:x[k] for k in ('primaryCategory','subcategory','tags','seriesId','seriesPosition','relatedArticles')}) for x in articles]
 write_json('content-index.json',content)
 # Render the Knowledge Hub from the authoritative metadata and controlled vocabulary.
 from knowledge_taxonomy import render_hub
 from bundle_page_styles import unpack,pack
 p=ROOT/'knowledge/index.html';s=unpack(p.read_text())
 p.write_text(pack(render_hub(ROOT,registry,s),p,ROOT))
