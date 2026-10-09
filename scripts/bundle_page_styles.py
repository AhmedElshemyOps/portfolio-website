"""Flatten and deduplicate local CSS imports in their original cascade order.
Source link markup travels with the generated link, making shared rendering reversible.
Never edit generated page-*.css; edit the source sheets and run render_shared.py.
"""
import base64,hashlib,re
from html import escape
from pathlib import Path
from apply_field_manual import parse
GENERATED={}

def unpack(source):
 def restore(m):return base64.b64decode(m[1]).decode()
 return re.sub(r'<link\b[^>]*data-style-sources="([A-Za-z0-9+/=]+)"[^>]*>',restore,source)

def pack(source,path,root):
 if path.relative_to(root).parts[0] not in {'profile','projects','knowledge','articles'}:return source
 nodes=[n for n in parse(source).nodes if n['tag']=='link' and n['attrs'].get('rel')=='stylesheet' and n['attrs'].get('href','').startswith('/assets/css/') and not n['attrs'].get('media')]
 if len(nodes)<3:return source
 seen=set();chunks=[]
 def expand(url):
  relative=url.split('?')[0].lstrip('/');p=root/relative
  if relative in seen:return ''
  seen.add(relative)
  if not p.is_file():raise FileNotFoundError(p)
  css=p.read_text()
  def imported(m):
   url=m[1]
   if not url.startswith('/'):url='/'+(Path(relative).parent/url).as_posix()
   return expand(url)
  css=re.sub(r'@import\s+url\(["\']([^"\']+)["\']\)\s*;',imported,css)
  return '\n/* '+relative+' */\n'+css
 try:
  for node in nodes:chunks.append(expand(node['attrs']['href']))
 except FileNotFoundError:return source
 css='/* Generated; edit original source stylesheets. */\n'+''.join(chunks)
 name='page-'+hashlib.sha256(css.encode()).hexdigest()[:12]+'.css'
 GENERATED[root/'assets/css/generated'/name]=css
 originals=''.join(source[n['start']:n['end']] for n in nodes)
 tag='<link rel="stylesheet" href="/assets/css/generated/'+name+'" data-style-sources="'+base64.b64encode(originals.encode()).decode()+'">'
 first=nodes[0]['start']
 for n in reversed(nodes):source=source[:n['start']]+(tag if n['start']==first else '')+source[n['end']:]
 # Imported fonts/tokens now live inside the bundle; don't fetch them separately.
 source=re.sub(r'<link\b(?=[^>]*rel="preload")(?=[^>]*href="/assets/css/(?:fonts|design-tokens)\.css[^\"]*")[^>]*>','',source)
 return source

def write_generated(check=False,root=None):
 for p,css in GENERATED.items():
  if root is not None and root not in p.parents:continue
  if check:
   if not p.exists() or p.read_text()!=css:raise ValueError('Generated stylesheet drift: '+str(p))
  else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(css)
