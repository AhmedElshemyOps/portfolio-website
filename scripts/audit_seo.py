"""Reproducible read-only source and HTTP audit; no account/ranking claims."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,urlunsplit,unquote
import urllib.request,urllib.error,urllib.robotparser
import json,re,hashlib,collections,concurrent.futures,time,argparse,xml.etree.ElementTree as ET,subprocess
ROOT=Path(__file__).resolve().parents[1];BASE='https://ahmedqualityops.com'
class Node:
 def __init__(self,tag='root',attrs=None,parent=None):self.tag=tag;self.attrs=dict(attrs or []);self.parent=parent;self.children=[]
 def text(self):return '' if self.tag in ['script','style','template'] else ' '.join(x.text() if isinstance(x,Node) else x for x in self.children)
 def all(self,tag=None):
  out=[]
  for x in self.children:
   if isinstance(x,Node):
    if tag is None or x.tag==tag:out.append(x)
    out+=x.all(tag)
  return out
class DOM(HTMLParser):
 def __init__(self,s):super().__init__(convert_charrefs=True);self.root=Node();self.current=self.root;self.feed(s)
 def handle_starttag(self,t,a):
  n=Node(t,a,self.current);self.current.children.append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.current=n
 def handle_startendtag(self,t,a):self.handle_starttag(t,a);self.handle_endtag(t)
 def handle_endtag(self,t):
  n=self.current
  while n.parent:
   if n.tag==t:self.current=n.parent;return
   n=n.parent
 def handle_data(self,s):self.current.children.append(s)
def norm(url,base=BASE+'/'):
 u=urlsplit(urljoin(base,url));return urlunsplit((u.scheme,u.netloc,u.path or '/',u.query,''))
def source_path(url):
 path=unquote(urlsplit(url).path);p=ROOT/path.lstrip('/')
 if path.endswith('/'):p=p/'index.html'
 return p
def flatten(d):
 if isinstance(d,list):return [n for x in d for n in flatten(x)]
 if isinstance(d,dict):return flatten(d['@graph']) if '@graph' in d else [d]
 return []
def schema_nodes(s):
 result=[];errs=[]
 for value in re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',s,re.S|re.I):
  try:result+=flatten(json.loads(value))
  except Exception as e:errs.append(str(e))
 return result,errs

def inspect(url,body,headers,status,final,elapsed,discovered):
 s=body.decode('utf-8','replace');dom=DOM(s).root
 meta={x.attrs.get('name',x.attrs.get('property','')).lower():x.attrs.get('content','') for x in dom.all('meta')}
 links=dom.all('a');internal=sorted({norm(x.attrs['href'],url) for x in links if x.attrs.get('href') and urlsplit(norm(x.attrs['href'],url)).netloc=='ahmedqualityops.com'})
 external=sorted({norm(x.attrs['href'],url) for x in links if x.attrs.get('href') and urlsplit(norm(x.attrs['href'],url)).scheme in ['http','https'] and urlsplit(norm(x.attrs['href'],url)).netloc not in ['ahmedqualityops.com','www.ahmedqualityops.com']})
 main=next(iter(dom.all('main')),dom);article=next((n for n in dom.all('article') if 'article-body' in n.attrs.get('class','').split()),None)
 content=article or main;words=re.findall(r"\b[\w'-]+\b",content.text());hs=[{'level':int(x.tag[1]),'text':re.sub(r'\s+',' ',x.text()).strip()} for x in main.all() if re.fullmatch('h[1-6]',x.tag)]
 jumps=[];last=1
 for h in hs:
  if h['level']>last+1:jumps.append(h)
  last=h['level']
 schemas,errs=schema_nodes(s);types=[x.get('@type') for x in schemas];canon=[x.attrs.get('href') for x in dom.all('link') if 'canonical' in x.attrs.get('rel','').split()]
 images=[]
 for n in dom.all('img'):
  src=n.attrs.get('src','');f=source_path(norm(src,url));images.append({'src':src,'alt':n.attrs.get('alt'),'width':n.attrs.get('width'),'height':n.attrs.get('height'),'loading':n.attrs.get('loading'),'fetchpriority':n.attrs.get('fetchpriority'),'file_bytes':f.stat().st_size if f.is_file() else None,'exists_in_source':f.is_file() if urlsplit(norm(src,url)).netloc=='ahmedqualityops.com' else None})
 path=source_path(url);raw=path.read_bytes() if path.is_file() else None
 robots=(meta.get('robots','')+' '+headers.get('X-Robots-Tag','')).lower();primary=next((h['text'] for h in hs if h['level']==1),'')
 articlelinks=[x for x in content.all('a') if x.attrs.get('href','').startswith(('http://','https://')) and 'ahmedqualityops.com' not in x.attrs.get('href','')]
 visible_dates=[{'datetime':n.attrs.get('datetime'),'text':n.text().strip()} for n in dom.all('time')]
 return {'url':url,'discovered_by':sorted(discovered),'page_type':'article' if article else 'utility' if any(x in url for x in ['/offline/','/saved/','/404.html','/marketing/','/maintenance/']) else 'demo' if '/live-demos/' in url else 'profile' if '/profile/' in url else 'collection' if any(x in url for x in ['/knowledge/','/series/','/learning/','/collections/']) else 'page','status':status,'redirect_destination':final if final!=url else None,'indexable_html':status==200 and 'noindex' not in robots,'robots_meta':meta.get('robots',''),'x_robots_tag':headers.get('X-Robots-Tag',''),'canonical':canon,'title':next((n.text().strip() for n in dom.all('title')),''),'meta_description':meta.get('description',''),'h1':[re.sub(r'\s+',' ',n.text()).strip() for n in dom.all('h1')],'headings':hs,'heading_jumps':jumps,'language':next((n.attrs.get('lang') for n in dom.all('html')),None),'viewport':meta.get('viewport',''),'social':{k:v for k,v in meta.items() if k.startswith(('og:','twitter:'))},'schema_types':types,'schema_json_errors':errs,'schema_nodes':schemas,'schema_validation':'JSON syntax and local semantic audit only; no external validator certification','word_count_main':len(words),'main_excerpt':' '.join(words[:110]),'source_link_count_main':len(articlelinks),'internal_outgoing':internal,'external_outgoing':external,'images':images,'missing_image_alt':sum(x['alt'] is None for x in images),'unsized_images':sum(not x['width'] or not x['height'] for x in images),'lazy_images':sum(x['loading']=='lazy' for x in images),'html_bytes':len(body),'fetch_seconds':round(elapsed,3),'server_headers':{k:v for k,v in headers.items() if k.lower() in ['last-modified','cache-control','content-type','content-encoding','etag','server','location']},'visible_dates':visible_dates,'content_owner':meta.get('author') or next((x.get('author',{}).get('name') for x in schemas if isinstance(x.get('author'),dict)),None),'source_file':str(path.relative_to(ROOT)) if raw else None,'production_matches_source':hashlib.sha256(raw).digest()==hashlib.sha256(body).digest() if raw else None,'primary_search_concept':primary,'search_intent':'educational/application' if article else 'professional evaluation' if any(t in url for t in ['/profile/','/careers/','/projects/']) else 'browse/navigate' if any(t in url for t in ['/knowledge/','/learning/','/series/','/collections/']) else 'tool/application' if '/lab/' in url or '/live-demos/' in url else 'navigate/inform','editorial_classification':'KEEP' if article and len(words)>=800 else 'OPTIMIZE','editorial_review_status':'Automated page-level signals; individual factual claims not independently verified','performance_field_metrics':None,'ranking':None,'impressions':None,'clicks':None,'ai_citations':None}

def run(out,local=False):
 out=Path(out);out.mkdir(parents=True,exist_ok=True);discover=collections.defaultdict(set)
 def add(url,why):
  u=norm(url)
  if urlsplit(u).netloc=='ahmedqualityops.com' and (urlsplit(u).path.endswith(('.html','/'))):discover[u].add(why)
 pages=[p for p in ROOT.rglob('*.html') if not any(x in p.relative_to(ROOT).parts for x in ['tests','.git','node_modules'])]
 for p in pages:
  url=BASE+('/' if p==ROOT/'index.html' else '/'+str(p.relative_to(ROOT)));add(url,'repository route')
  for n in DOM(p.read_text()).root.all():
   if n.tag=='a' and n.attrs.get('href'):add(norm(n.attrs['href'],url),'internal href')
   if n.tag=='link' and n.attrs.get('rel')=='canonical':add(n.attrs.get('href',''),'canonical')
 sitemap=ET.parse(ROOT/'sitemap.xml').getroot();sitemap_map={n.find('{*}loc').text:n.findtext('{*}lastmod') for n in sitemap}
 for u in sitemap_map:add(u,'sitemap')
 for p in [ROOT/'content/article-registry.json',ROOT/'content/articles.json',ROOT/'content/content-index.json',ROOT/'content/discovery-index.json']:
  def walk(x):
   if isinstance(x,dict):
    for k,v in x.items():
     if k in ['url','canonical','profile'] and isinstance(v,str):add(v,'publishing data: '+p.name)
     else:walk(v)
   elif isinstance(x,list):
    for v in x:walk(v)
  walk(json.loads(p.read_text()))
 feed_error=None
 try:
  for n in ET.parse(ROOT/'feed.xml').getroot().iter():
   if n.tag.endswith('link') and n.get('href'):add(n.get('href'),'Atom feed')
 except ET.ParseError as e:
  feed_error=str(e)
  for u in re.findall(r'<link[^>]*href="([^"]+)"',(ROOT/'feed.xml').read_text()):add(u,'Atom feed (XML invalid)')
 recovery=ROOT/'maintenance/seo/legacy-url-recovery-map.json'
 if recovery.exists():
  for item in json.loads(recovery.read_text()):add(item['existing_legacy_path'],'legacy recovery inventory')
 add('/index.html','homepage alias');add('/article-net-cost-selling-price-markup.html','observed search result')
 rp=urllib.robotparser.RobotFileParser();rp.parse((ROOT/'robots.txt').read_text().splitlines())
 def fetch(item):
  url,why=item;start=time.monotonic()
  if local:
   path=source_path(url)
   if not path.is_file():return {'url':url,'status':None,'discovered_by':sorted(why),'error':'No repository HTML file'}
   return inspect(url,path.read_bytes(),{},200,url,0,why)
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'AhmedWebsiteAudit/1.0 (owner-authorised quality review)'})
   with urllib.request.urlopen(req,timeout=30) as res:body=res.read(3000000);status=res.status;headers=dict(res.headers);final=res.url
   return inspect(url,body,headers,status,final,time.monotonic()-start,why)
  except urllib.error.HTTPError as e:return {'url':url,'status':e.code,'discovered_by':sorted(why),'redirect_destination':e.url if e.url!=url else None,'error':str(e)}
  except Exception as e:return {'url':url,'status':None,'discovered_by':sorted(why),'error':str(e)}
 with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:records=list(ex.map(fetch,sorted(discover.items())))
 byurl={r['url']:r for r in records};incoming=collections.defaultdict(set)
 for r in records:
  for u in r.get('internal_outgoing',[]):incoming[norm(u)].add(r['url'])
 for r in records:
  r['internal_incoming']=sorted(incoming[r['url']]);r['incoming_count']=len(incoming[r['url']]);r['orphan_candidate']=r.get('status')==200 and r['url']!=BASE+'/' and not incoming[r['url']];r['sitemap_lastmod']=sitemap_map.get(r['url']);r['in_sitemap']=r['url'] in sitemap_map;r['crawler_access']={bot:rp.can_fetch(bot,r['url']) for bot in ['Googlebot','Bingbot','OAI-SearchBot','GPTBot','PerplexityBot']}
 titles=collections.defaultdict(list);desc=collections.defaultdict(list)
 for r in records:
  if r.get('status')==200:
   titles[r.get('title','')].append(r['url']);desc[r.get('meta_description','')].append(r['url'])
 summary={'timestamp_utc':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'repository_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'mode':'repository-only' if local else 'live HTTP GET plus source comparison','discovered_urls':len(records),'status_counts':dict(collections.Counter(str(r['status']) for r in records)),'repository_html_pages':len(pages),'sitemap_urls':len(sitemap_map),'feed_xml_error':feed_error,'production_mismatches':[r['url'] for r in records if r.get('production_matches_source') is False],'duplicate_titles':{k:v for k,v in titles.items() if len(v)>1},'duplicate_descriptions':{k:v for k,v in desc.items() if len(v)>1},'missing_descriptions':[r['url'] for r in records if r.get('status')==200 and not r.get('meta_description')],'missing_canonical':[r['url'] for r in records if r.get('status')==200 and len(r.get('canonical',[]))!=1],'h1_issues':[r['url'] for r in records if r.get('status')==200 and len(r.get('h1',[]))!=1],'heading_jump_pages':[r['url'] for r in records if r.get('heading_jumps')],'missing_alt_pages':[r['url'] for r in records if r.get('missing_image_alt')],'unsized_image_pages':[r['url'] for r in records if r.get('unsized_images')],'orphan_candidates':[r['url'] for r in records if r['orphan_candidate']],'unsitemapped_source_pages':[r['url'] for r in records if r.get('source_file') and not r['in_sitemap'] and '?' not in r['url']],'invalid_schema_json':[r['url'] for r in records if r.get('schema_json_errors')],'coverage_limits':['No Search Console, Bing Webmaster or GA4 report access/export supplied. A public verification token is not account access.','HTTP fetch timing is audit transport timing, not Lighthouse, LCP, INP, CLS or field Core Web Vitals.','Automated content classification and keyword intent are editorial hypotheses; not independent validation of all factual claims.','Robots policy checked; actual requests from verified crawler IPs not simulated.','Legacy URLs from public publishing data are candidates, not proof of prior indexing; one legacy pricing URL was observed in search results.']}
 (out/'inventory.json').write_text(json.dumps(records,indent=2,ensure_ascii=False)+'\n');(out/'summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n')
 print(json.dumps({k:summary[k] for k in ['discovered_urls','status_counts','repository_html_pages','sitemap_urls','production_mismatches']}))
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--output',required=True);ap.add_argument('--local',action='store_true');a=ap.parse_args();run(a.output,a.local)
