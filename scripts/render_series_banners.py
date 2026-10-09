"""Render approved series artwork with accessible, exact article headings.
The manifest records reviewed reading order; article URLs and body content are untouched.
"""
from pathlib import Path
from html import escape,unescape
import json,re
ROOT=Path(__file__).resolve().parents[1]
CSS='/assets/css/series-banners.css?v=20261009-banners'
BASE='https://ahmedqualityops.com'
def plain(s):return ' '.join(unescape(re.sub('<[^>]+>',' ',s)).split())
def render(source,path,root=ROOT,manifest_data=None):
 manifest=root/'content/series-banners.json'
 if not manifest.exists():return source
 from bundle_page_styles import unpack,pack
 was_bundled='data-style-sources=' in source
 if was_bundled:source=unpack(source)
 data=manifest_data if manifest_data is not None else json.loads(manifest.read_text());url='/'+path.relative_to(root).as_posix()
 row=next((r for r in data['articles'] if r['url']==url),None)
 if not row:return source
 design=data['designs'][row['design']]
 # Keep the authored H1, including its anchor, as the banner's actual page heading.
 h=re.search(r'<h1\b[^>]*>.*?</h1>',source,re.S)
 if not h:return source
 title=plain(h[0]);label=f'Article {row["number"]:02d}' if row.get('number') else row['kind']
 background=design['background']
 srcset=', '.join(background.replace('.webp',f'-{w}.webp')+f' {w}w' for w in (240,640,960))+', '+background+' 1774w'
 size='long' if len(title)>115 else 'medium' if len(title)>75 else 'short'
 banner=(f'<div class="series-banner series-banner--{design["option"].lower()}" data-series-banner="{row["design"]}" data-title-size="{size}">'
 f'<img class="series-banner-art" src="{design["background"]}" srcset="{srcset}" sizes="(max-width:700px) 96px, (max-width:1100px) 90vw, 1100px" width="1774" height="887" alt="" decoding="async" fetchpriority="high">'
 f'<div class="series-banner-copy"><p class="series-banner-label">{escape(row["series"])}</p><p class="series-banner-number">{escape(label)}</p>'
 +h[0]+ '<p class="series-banner-author">Ahmed Mahmoud</p></div></div>')
 block='<!-- series-banner:start -->'+banner+'<!-- series-banner:end -->'
 if '<!-- series-banner:start -->' in source:source=re.sub(r'<!-- series-banner:start -->.*?<!-- series-banner:end -->',lambda m:block,source,count=1,flags=re.S)
 else:source=source[:h.start()]+block+source[h.end():]
 # Retire only the header eyebrow, now represented by the banner's series label.
 source=re.sub(r'(<header class="(?:article-page-header|discovery-hero)"[^>]*>)\s*<span class="eyebrow">.*?</span>',r'\1',source,count=1,flags=re.S)
 source=re.sub(r'<link\b[^>]*href="/assets/css/series-banners.css[^\"]*"[^>]*>','',source)
 source=source.replace('</head>',f'<link rel="stylesheet" href="{CSS}"></head>',1)
 if 'has-series-banner' not in source:source=re.sub(r'(<body\b[^>]*class=")',r'\1has-series-banner ',source,count=1) if re.search(r'<body\b[^>]*class=',source) else source.replace('<body>','<body class="has-series-banner">',1)
 position=f'Article {row["number"]} of {row["total"]}' if row.get('number') else row['kind']
 if row.get('number'):
  source=re.sub(r'(<dt>Series</dt>\s*<dd>)\d+ of \d+(</dd>)',lambda m:m[1]+str(row['number'])+' of '+str(row['total'])+m[2],source)
 source=re.sub(r'(<p class="series-position">).*?(</p>)',lambda m:m[1]+escape(position)+m[2],source,flags=re.S)
 # Managed publication navigation is generated from the same validated series order.
 source=re.sub(r'<nav class="series-reading-path".*?</nav>','',source,flags=re.S)
 if row.get('number'):
  siblings=sorted((r for r in data['articles'] if r['design']==row['design'] and r.get('number')),key=lambda r:r['number'])
  at=next(i for i,r in enumerate(siblings) if r['url']==url);links=[]
  for idx,label in ((at-1,'Previous article'),(at+1,'Next article')):
   if 0<=idx<len(siblings):
    other=siblings[idx];links.append('<a href="'+escape(other['url'],quote=True)+'">'+label+': '+escape(other['title'])+'</a>')
  if links:source=source.replace('</main>','<nav class="series-reading-path" aria-label="Series reading order">'+''.join(links)+'</nav></main>',1)
 # Sharing uses the approved series master, accurately labelled as a series cover.
 values={'og:image':BASE+design['master'],'og:image:width':'1774','og:image:height':'887','og:image:alt':row['series']+' — series cover','twitter:card':'summary_large_image','twitter:image':BASE+design['master'],'twitter:image:alt':row['series']+' — series cover'}
 for key,value in values.items():
  pattern=r'<meta\b[^>]*(?:name|property)="'+re.escape(key)+r'"[^>]*>'
  tag='<meta '+('property' if key.startswith('og:') else 'name')+'="'+key+'" content="'+escape(value,quote=True)+'">'
  if re.search(pattern,source):source=re.sub(pattern,lambda m:tag,source)
  else:source=source.replace('</head>',tag+'</head>',1)
 def schema(m):
  obj=json.loads(m[2]);items=obj if isinstance(obj,list) else [obj]
  for item in items:
   if item.get('@type') in ('Article','CollectionPage'):item['image']=BASE+design['master']
  return m[1]+json.dumps(obj,ensure_ascii=False,separators=(',',':'))+m[3]
 source=re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',schema,source,flags=re.S)
 return pack(source,path,root) if was_bundled else source

def apply(root=ROOT,check=False):
 data=json.loads((root/'content/series-banners.json').read_text());changed=[]
 for row in data['articles']:
  p=root/row['url'].lstrip('/');old=p.read_text();new=render(old,p,root)
  if old!=new:
   changed.append(row['url'])
   if not check:p.write_text(new)
 return changed
if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args();changed=apply(check=args.check)
 if args.check and changed:raise SystemExit('Banner drift: '+str(changed))
 print('Series banners:',len(changed),'pages updated')
