"""Create/check a redesign baseline without modifying website pages."""
import argparse,hashlib,json,posixpath,re,subprocess,sys
from pathlib import Path
from urllib.parse import urljoin,urlsplit,unquote
from audit_seo import DOM
ROOT=Path(__file__).resolve().parents[1]
BASE='https://ahmedqualityops.com'
MANIFEST=ROOT/'docs/calm-redesign/baseline/manifest.json'
def digest(data):return hashlib.sha256(data if isinstance(data,bytes) else data.encode()).hexdigest()
def words(html):
 # Generated controls are presentation; original preformatted prompts remain protected.
 html=re.sub(r'<!-- premium-ai-ui:start -->.*?<!-- premium-ai-ui:end -->','',html,flags=re.S)
 text=DOM(html).root.text()
 return re.findall(r"\w+(?:['’]\w+)*|[^\w\s]",text)
def page_record(path,raw):
 s=raw.decode();d=DOM(s).root
 from apply_field_manual import parse
 nodes=parse(s).nodes
 body=next((n for n in nodes if 'article-body' in n['attrs'].get('class','').split()),None)
 footer=next((n for n in nodes if 'platform-footer' in n['attrs'].get('class','').split()),None)
 url=BASE+('/' if path=='index.html' else '/'+path)
 links=sorted({urljoin(url,n.attrs['href']) for n in d.all('a') if n.attrs.get('href') and urlsplit(urljoin(url,n.attrs['href'])).netloc in ('ahmedqualityops.com','www.ahmedqualityops.com')})
 tokens=words(s[body['start']:body['end']]) if body else None
 intro=[]
 if body:
  for n in nodes:
   if set(n['attrs'].get('class','').split())&{'article-page-header','article-evidence-note','article-glossary','article-purpose'} and not body['start']<=n['start']<body['end']:
    intro.extend(words(s[n['start']:n['end']]))
 article_dom=next((n for n in d.all() if 'article-body' in n.attrs.get('class','').split()),None)
 return {'file':path,'url':url,'aliases':['/index.html'] if path=='index.html' else ['/'+path[:-10]] if path.endswith('/index.html') else [],'sha256':digest(raw),
 'canonical':[n.attrs.get('href') for n in d.all('link') if n.attrs.get('rel')=='canonical'],
 'title':next((n.text().strip() for n in d.all('title')),''),
 'anchors':sorted({n.attrs[k] for n in d.all() for k in ('id','name') if n.attrs.get(k) and (k=='id' or n.tag=='a')}),
 'headings':[{'level':n.tag,'id':n.attrs.get('id'),'text':n.text().strip()} for n in d.all() if n.tag in ('h1','h2','h3','h4','h5','h6')],
 'internalLinks':links,'articleLinks':[n.attrs['href'] for n in article_dom.all('a') if n.attrs.get('href')] if article_dom else None,'articleTokensSha256':digest(json.dumps(tokens,ensure_ascii=False)) if tokens is not None else None,
 'articleIntroSha256':digest(json.dumps(intro,ensure_ascii=False)) if body else None,
 'footerSha256':digest(s[footer['start']:footer['end']]) if footer else None,
 'kind':'article' if body else 'project/demo' if path.startswith(('projects/','live-demos/')) else 'tool' if path.startswith('lab/') else 'page'}
def create(commit):
 paths=subprocess.check_output(['git','ls-tree','-r','--name-only',commit],cwd=ROOT,text=True).splitlines()
 def read(p):return subprocess.check_output(['git','show',commit+':'+p],cwd=ROOT)
 pages=[page_record(p,read(p)) for p in paths if p.endswith('.html') and not set(Path(p).parts)&{'templates','docs','tests','node_modules'}]
 linked=set()
 for page in pages:
  for url in page['internalLinks']:
   path=posixpath.normpath(unquote(urlsplit(url).path)).lstrip('/')
   if path in paths and not path.endswith(('.html','/')):linked.add(path)
 files=[{'file':p,'sha256':digest(read(p)),'bytes':len(read(p))} for p in sorted(linked)]
 footer=[{'file':p,'sha256':digest(read(p))} for p in ['templates/footer.html','assets/css/footer.css']]
 result={'version':1,'baselineCommit':commit,'capturedOn':'2026-10-28','origin':BASE,'pages':pages,'downloads':files,'footerFiles':footer,'identityFiles':[{'file':'CNAME','sha256':digest(read('CNAME'))}],
 'policy':'Existing routes, anchors, article token order/punctuation, footer markup/style and linked download bytes are protected. New routes are allowed. Intentional CV updates require recorded review; do not regenerate this baseline to conceal changes.'}
 MANIFEST.parent.mkdir(parents=True,exist_ok=True);MANIFEST.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 return result
def check(data,root=ROOT):
 errors=[]
 for old in data['pages']:
  p=root/old['file']
  if not p.is_file():errors.append({'file':old['file'],'issue':'missing route'});continue
  now=page_record(old['file'],p.read_bytes())
  missing=sorted(set(old['anchors'])-set(now['anchors']))
  if missing:errors.append({'file':old['file'],'issue':'missing anchors','anchors':missing})
  if old['canonical']!=now['canonical']:errors.append({'file':old['file'],'issue':'canonical changed'})
  if old['articleTokensSha256'] and old['articleTokensSha256']!=now['articleTokensSha256']:errors.append({'file':old['file'],'issue':'article wording/order/punctuation changed'})
  if old.get('articleIntroSha256')!=now['articleIntroSha256']:errors.append({'file':old['file'],'issue':'article title/intro/glossary/evidence wording changed'})
  if old.get('articleLinks')!=now['articleLinks']:errors.append({'file':old['file'],'issue':'article link destinations/order changed'})
  if old['footerSha256']!=now['footerSha256']:errors.append({'file':old['file'],'issue':'footer markup changed'})
 for old in data['downloads']+data['footerFiles']+data.get('identityFiles',[]):
  p=root/old['file']
  if not p.is_file() or digest(p.read_bytes())!=old['sha256']:errors.append({'file':old['file'],'issue':'protected download/footer file changed or missing'})
 return {'passed':not errors,'baselineCommit':data['baselineCommit'],'pagesChecked':len(data['pages']),'articlesChecked':sum(bool(p['articleTokensSha256']) for p in data['pages']),'anchorsProtected':sum(len(p['anchors']) for p in data['pages']),'downloadsChecked':len(data['downloads']),'errors':errors}
def main():
 a=argparse.ArgumentParser();a.add_argument('--create',metavar='COMMIT');a.add_argument('--report',type=Path);args=a.parse_args()
 if args.create:
  if MANIFEST.exists():a.error('Baseline already exists; it must not be silently replaced.')
  data=create(args.create)
 else:data=json.loads(MANIFEST.read_text())
 result=check(data)
 if args.report:args.report.parent.mkdir(parents=True,exist_ok=True);args.report.write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps({k:v for k,v in result.items() if k!='errors'}|{'errors':result['errors'][:10]},indent=2))
 return 0 if result['passed'] else 1
if __name__=='__main__':sys.exit(main())
