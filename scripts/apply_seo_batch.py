"""Safe first SEO batch: existing paths, canonicals and article bodies remain intact."""
from pathlib import Path
from html import escape
import json,re,xml.etree.ElementTree as ET
from audit_seo import DOM,schema_nodes
ROOT=Path(__file__).resolve().parents[1];BASE='https://ahmedqualityops.com';VERSION='20261008-seo'

def meta(source,key,value,prop=False):
 attr='property' if prop else 'name';tag='<meta '+attr+'="'+key+'" content="'+escape(value,quote=True)+'">'
 pattern=r'<meta\b[^>]*'+attr+r'=["\']'+re.escape(key)+r'["\'][^>]*>'
 return re.sub(pattern,lambda _:tag,source,count=1) if re.search(pattern,source) else source.replace('</head>',tag+'</head>',1)
def apply():
 registry=json.loads((ROOT/'content/article-registry.json').read_text());byurl={x['url']:x for x in registry};changed=[]
 for p in ROOT.rglob('*.html'):
  if any(x in p.relative_to(ROOT).parts for x in ['tests','.git']):continue
  original=s=p.read_text();s=s.replace('/assets/brand/homepage-monogram.png','/assets/brand/homepage-monogram-116.png')
  if 'templates' not in p.relative_to(ROOT).parts:
   route='/'+str(p.relative_to(ROOT));item=byurl.get(route);dom=DOM(s).root;md={n.attrs.get('property',n.attrs.get('name','')):n.attrs.get('content','') for n in dom.all('meta')};canonical=next((n.attrs.get('href') for n in dom.all('link') if n.attrs.get('rel')=='canonical'),None)
   if item:
    if not md.get('description'):s=meta(s,'description',item['description'])
    if not md.get('og:description'):s=meta(s,'og:description',item['description'],True)
    if not md.get('twitter:card'):s=meta(s,'twitter:card','summary_large_image' if md.get('og:image') else 'summary')
    # Only fill textual Article properties already supported by visible content. No invented images or dates.
    def schema_patch(m):
     d=json.loads(m[1]);nodes=d if isinstance(d,list) else d.get('@graph',[d]);dirty=False
     for n in nodes:
      if n.get('@type')=='Article':
       if not n.get('description'):n['description']=item['description'];dirty=True
       author=n.get('author',{})
       if isinstance(author,dict) and author.get('name')=='Ahmed Mahmoud' and not author.get('url'):author.update({'@id':BASE+'/#person','url':BASE+'/profile/index.html'});dirty=True
     return '<script type="application/ld+json">'+json.dumps(d,ensure_ascii=False,separators=(',',':'))+'</script>' if dirty else m[0]
    s=re.sub(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',schema_patch,s,flags=re.S)
   if route.startswith('/series/hotel-'):
    if not md.get('og:url') and canonical:s=meta(s,'og:url',canonical,True)
    if not md.get('twitter:card'):s=meta(s,'twitter:card','summary_large_image' if md.get('og:image') else 'summary')
    schemas,_=schema_nodes(s)
    if not schemas:
     data={'@context':'https://schema.org','@type':'CollectionPage','name':next(n.text().strip() for n in dom.all('h1')),'url':canonical,'description':md.get('description',''),'inLanguage':'en','isPartOf':{'@id':BASE+'/#website'}}
     s=s.replace('</head>','<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False,separators=(',',':'))+'</script></head>',1)
   if route=='/profile/index.html':
    desc='Ahmed Mahmoud: 13 years in Travel and Tourism and hospitality, company experience, five IATA diplomas and professional qualifications. Based in the Netherlands.'
    s=meta(s,'description',desc);s=meta(s,'og:description',desc,True)
   # Keep loaded scripts versioned when their source changes.
   s=re.sub(r'(/assets/js/(?:discovery|analytics)\.js)(?:\?v=[^"\']*)?',r'\1?v='+VERSION,s)
  if s!=original:p.write_text(s);changed.append(str(p.relative_to(ROOT)))
 # Public machine-readable author and catalogue must match the verified human-facing profile.
 p=ROOT/'content/content-index.json';d=json.loads(p.read_text());d['name']='Ahmed Mahmoud — Travel and Tourism Operations';d['updated']='2026-10-08';d['author']['location']='Netherlands';d['author']['roles']=['Travel and Tourism Operations','DMC and MICE Operations','Reservations and B2B Operations','Operational Improvement'];p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
 p=ROOT/'content/articles.json';d=json.loads(p.read_text());byid={x['id']:x for x in registry}
 for x in d:x['url']=byid[x['slug']]['url']
 p.write_text(json.dumps(d,indent=2,ensure_ascii=False)+'\n')
 p=ROOT/'scripts/sync_catalogue.py';s=p.read_text().replace("url=x['id']+'.html'","url=x['url']");p.write_text(s)
 p=ROOT/'assets/js/discovery.js';s=p.read_text().replace('var value = initialFilters.get(filter.dataset.knowledgeFilter);','var value = initialFilters.get(filter.dataset.knowledgeFilter) || (filter.dataset.knowledgeFilter === "pillar" ? initialFilters.get("topic") : "");');p.write_text(s)
 p=ROOT/'sw.js';s=p.read_text().replace('v13-editorial-polish','v14-seo-baseline');p.write_text(s)
 print('Updated existing HTML files:',len(changed))
if __name__=='__main__':apply()
