"""Build valid sitemap and Atom feed from existing canonical content and stated dates.
Dates are carried from page schema/evidence, not refreshed wholesale at build time.
"""
from pathlib import Path
from datetime import datetime
import json,re,xml.etree.ElementTree as ET
from audit_seo import DOM,schema_nodes
ROOT=Path(__file__).resolve().parents[1];BASE='https://ahmedqualityops.com';SM='http://www.sitemaps.org/schemas/sitemap/0.9';ATOM='http://www.w3.org/2005/Atom'
def build():
 registry=json.loads((ROOT/'content/article-registry.json').read_text());facts={};seen=set();root=ET.Element('urlset',xmlns=SM)
 for p in sorted(ROOT.rglob('*.html')):
  if any(x in p.relative_to(ROOT).parts for x in ['templates','tests','.git']):continue
  source=p.read_text();dom=DOM(source).root;md={n.attrs.get('name',n.attrs.get('property','')):n.attrs.get('content','') for n in dom.all('meta')};canonical=next((n.attrs.get('href') for n in dom.all('link') if n.attrs.get('rel')=='canonical'),None)
  if 'noindex' in md.get('robots','').lower() or not canonical or canonical in seen:continue
  seen.add(canonical)
  nodes,_=schema_nodes(source)
  page_node=next((n for n in nodes if canonical in (n.get('mainEntityOfPage'),n.get('@id'),n.get('url'))),None)
  if page_node is None:
   page_node=next((n for n in nodes if n.get('@type') in ('Article','CollectionPage')),None)
  modified=page_node.get('dateModified') if page_node else None
  published=page_node.get('datePublished') if page_node else None
  modified=modified[:10] if modified else md.get('article:modified_time','')[:10] or None
  published=published[:10] if published else md.get('article:published_time','')[:10] or None
  element=ET.SubElement(root,'url');ET.SubElement(element,'loc').text=canonical
  if modified:ET.SubElement(element,'lastmod').text=modified
  facts[canonical]={'date':modified,'published':published,'basis':'page main-entity dateModified' if modified and page_node and page_node.get('dateModified') else 'article:modified_time' if modified else 'no modification date; omitted'}
 ET.indent(root);ET.ElementTree(root).write(ROOT/'sitemap.xml',encoding='utf-8',xml_declaration=True)
 ET.register_namespace('',ATOM)
 def el(parent,name,text=None,**attrs):
  n=ET.SubElement(parent,'{'+ATOM+'}'+name,attrs);n.text=text;return n
 feed=ET.Element('{'+ATOM+'}feed');el(feed,'title','Ahmed Mahmoud — Travel and Tourism Operations Knowledge');el(feed,'id',BASE+'/');el(feed,'link',href=BASE+'/feed.xml',rel='self');el(feed,'link',href=BASE+'/');author=el(feed,'author');el(author,'name','Ahmed Mahmoud');el(author,'uri',BASE+'/profile/index.html')
 articles=[]
 for x in registry:
  if x['type']!='Article':continue
  date=facts.get(BASE+x['url'],{}).get('date') or x.get('updated') or facts.get(BASE+x['url'],{}).get('published')
  if not date:continue
  articles.append((date,x))
 latest=max(x[0] for x in articles);el(feed,'updated',latest+'T00:00:00+04:00')
 for date,x in sorted(articles,key=lambda x:(x[0],x[1]['id']),reverse=True):
  e=el(feed,'entry');el(e,'title',x['title']);el(e,'id',BASE+x['url']);el(e,'link',href=BASE+x['url']);el(e,'updated',date+'T00:00:00+04:00');el(e,'summary',x['description']);el(e,'category',term=x['category'])
 ET.indent(feed);ET.ElementTree(feed).write(ROOT/'feed.xml',encoding='utf-8',xml_declaration=True)
 (ROOT/'maintenance/seo/sitemap-date-provenance.json').write_text(json.dumps(facts,indent=2)+'\n')
 print('Sitemap canonical pages:',len(root),'Atom articles:',len(articles))
if __name__=='__main__':build()
