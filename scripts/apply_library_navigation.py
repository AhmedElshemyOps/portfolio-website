"""Add persistent article breadcrumbs, honest sharing covers and curated reading links.
Existing routes, article bodies, prompts, publication dates and indexing rules stay intact.
"""
from pathlib import Path
from html import escape
import json,re
from audit_seo import DOM
ROOT=Path(__file__).resolve().parents[1];BASE='https://ahmedqualityops.com';CSS='/assets/css/library-navigation.css?v=20261008-library'
def render(source,path,root=ROOT):
 from bundle_page_styles import unpack,pack
 was_bundled='data-style-sources=' in source
 if was_bundled:source=unpack(source)
 registry_path=root/'content/article-registry.json'
 if not registry_path.exists():return source
 relative='/'+str(path.relative_to(root));row=next((x for x in json.loads(registry_path.read_text()) if x['url']==relative),None)
 if not row:return source
 dom=DOM(source).root;h1=dom.all('h1');canonical=next((n.attrs.get('href') for n in dom.all('link') if n.attrs.get('rel')=='canonical'),None)
 if len(h1)!=1 or not canonical or '<main' not in source:return source
 title=' '.join(h1[0].text().split())
 crumb='<nav class="library-breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/knowledge/index.html">Knowledge</a></li><li><span aria-current="page">'+escape(title)+'</span></li></ol></nav>'
 # Retire three older embedded navigation components, preserving the teaching material.
 from apply_field_manual import parse
 legacy=[n for n in parse(source).nodes if n['tag']=='nav' and n['attrs'].get('aria-label')=='Breadcrumb' and 'library-breadcrumbs' not in n['attrs'].get('class','').split()]
 for n in sorted(legacy,key=lambda n:n['start'],reverse=True):source=source[:n['start']]+source[n['end']:]
 source=re.sub(r'<nav class="library-breadcrumbs".*?</nav>','',source,flags=re.S)
 source=re.sub(r'(<main\b[^>]*>)',lambda m:m[0]+crumb,source,count=1)
 breadcrumb={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'Knowledge','item':BASE+'/knowledge/index.html'},{'@type':'ListItem','position':3,'name':title,'item':canonical}]}
 # Remove previous BreadcrumbList nodes only. Keep all other supported schema properties.
 def clean_schema(m):
  data=json.loads(m[2])
  if isinstance(data,list):data=[n for n in data if n.get('@type')!='BreadcrumbList']
  elif data.get('@type')=='BreadcrumbList':return ''
  elif '@graph' in data:data['@graph']=[n for n in data['@graph'] if n.get('@type')!='BreadcrumbList']
  return m[1]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+m[3] if data else ''
 source=re.sub(r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',clean_schema,source,flags=re.S)
 source=re.sub(r'<link\b[^>]*href="/assets/css/library-navigation.css[^\"]*"[^>]*>','',source)
 covers_path=root/'maintenance/seo/library-sharing-covers.json'
 if covers_path.exists():
  cover=next((x for x in json.loads(covers_path.read_text()) if x['article']==row['id']),None)
  if cover:
   values={'og:image':BASE+cover['image'],'og:image:width':'1200','og:image:height':'630','og:image:alt':cover['alt'],'twitter:card':'summary_large_image','twitter:image':BASE+cover['image'],'twitter:image:alt':cover['alt']}
   for key,value in values.items():
    pattern=r'<meta\b[^>]*(?:name|property)="'+re.escape(key)+r'"[^>]*>'
    tag='<meta '+('property' if key.startswith('og:') else 'name')+'="'+key+'" content="'+escape(value,quote=True)+'">'
    if re.search(pattern,source):source=re.sub(pattern,lambda m:tag,source)
    else:source=source.replace('</head>',tag+'</head>',1)
 source=source.replace('</head>','<script type="application/ld+json">'+json.dumps(breadcrumb,ensure_ascii=False,separators=(',',':'))+'</script></head>',1)
 source=source.replace('</head>','<link rel="stylesheet" href="'+CSS+'"></head>',1)
 # Related reading lives outside the article body, leaving original teaching content intact.
 source=re.sub(r'<aside class="reading-connections".*?</aside>','',source,flags=re.S)
 connections_path=root/'maintenance/seo/library-reading-connections.json'
 if connections_path.exists():
  existing={n.attrs.get('href','').split('#')[0] for n in DOM(source).root.all('a')};links=[x for x in json.loads(connections_path.read_text()) if x['source']==relative and x['target'] not in existing and BASE+x['target'] not in existing]
  if links:
   panel='<aside class="reading-connections" aria-label="Related reading"><h2>Continue with the method or project</h2><ul>'+''.join('<li><a href="'+escape(x['target'],quote=True)+'">'+escape(x['title'])+'</a><p>'+escape(x['purpose'])+'</p></li>' for x in links)+'</ul></aside>'
   dom=DOM(source).root;article=next((n for n in dom.all('article') if 'article-body' in n.attrs.get('class','').split()),None)
   if article:
    from apply_field_manual import parse
    node=next(n for n in parse(source).nodes if n['tag']=='article' and 'article-body' in n['attrs'].get('class','').split());source=source[:node['end']]+panel+source[node['end']:]
 if row.get('primaryCategory'):
  from knowledge_taxonomy import render_article
  source=render_article(source,row,json.loads(registry_path.read_text()))
 return pack(source,path,root) if was_bundled else source

def apply(root=ROOT,check=False):
 changed=[]
 registry=json.loads((root/'content/article-registry.json').read_text())
 for row in registry:
  p=root/row['url'].lstrip('/');old=p.read_text();new=render(old,p,root)
  if new!=old:
   changed.append(row['url'])
   if not check:p.write_text(new)
 return changed
if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();changed=apply(check=args.check)
 if args.check and changed:raise SystemExit('Library navigation drift: '+str(changed))
 print('Library navigation:',len(changed),'pages updated.')
