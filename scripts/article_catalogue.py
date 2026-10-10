"""Refresh catalogue consumers without running historical article migrations."""
from pathlib import Path
from html import escape
import json,re
from urllib.parse import quote
def display_topic(s): return s.replace('Hotel & Serviced Apartment AI','AI for Hotel Apartments').replace('Hotel AI Operations Playbook','Hotel Apartment and Staycation AI Playbook')
def refresh(ROOT, registry):
 old=json.loads((ROOT/'content/discovery-index.json').read_text())
 def write_json(name,value): (ROOT/'content'/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
 from knowledge_taxonomy import validate
 validate(ROOT,registry)
 write_json('article-registry.json',registry)
 write_json('discovery-index.json',[x for x in old if x.get('type') not in ['Article','Series index']]+[dict(x,category=display_topic(x.get('category','')),title=display_topic(x.get('title',''))) for x in registry])
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
