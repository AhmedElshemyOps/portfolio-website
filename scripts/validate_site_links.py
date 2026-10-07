from pathlib import Path
from urllib.parse import urlsplit,unquote
import sys,collections,json
sys.path.insert(0,'scripts')
from apply_field_manual import parse
root=Path.cwd();pages=[p for p in root.rglob('*.html') if not any(x in {'.git','node_modules','docs','templates'} for x in p.relative_to(root).parts)];cache={p:parse(p.read_text()) for p in pages};missing=[];frags=[];dups=[]
for p,e in cache.items():
 counts=collections.Counter(n['attrs']['id'] for n in e.nodes if n['attrs'].get('id'))
 if any(v>1 for v in counts.values()):dups.append([str(p.relative_to(root)),{k:v for k,v in counts.items() if v>1}])
 for n in e.nodes:
  for attr in ['href','src']:
   value=n['attrs'].get(attr,'');u=urlsplit(value)
   if not value or u.scheme or u.netloc:continue
   target=(root/u.path.lstrip('/') if u.path.startswith('/') else p.parent/u.path).resolve() if u.path else p
   if target.is_dir():target=target/'index.html'
   if not target.exists():missing.append([str(p.relative_to(root)),attr,value]);continue
   if attr=='href' and u.fragment and target.suffix=='.html':
    te=cache.get(target)
    if te and unquote(u.fragment) not in {x['attrs'].get('id') for x in te.nodes}:frags.append([str(p.relative_to(root)),value])
report={'pages':len(pages),'missing':missing,'fragments':frags,'duplicate_ids':dups};print(json.dumps(report));sys.exit(bool(missing or frags or dups))
