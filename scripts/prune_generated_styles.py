"""Delete content-hashed stylesheets no longer referenced by any current page."""
import re
from pathlib import Path
from render_shared import ROOT,pages

def prune(root=ROOT):
    referenced=set()
    for p in pages(root):referenced.update(re.findall(r'/assets/css/generated/page-[0-9a-f]+\.css',p.read_text()))
    removed=[]
    for p in sorted((root/'assets/css/generated').glob('page-*.css')):
        if re.fullmatch(r'page-[0-9a-f]{12}\.css',p.name) and '/'+p.relative_to(root).as_posix() not in referenced:
            removed.append(dict(path=p.relative_to(root).as_posix(),bytes=p.stat().st_size));p.unlink()
    return removed
if __name__=='__main__':
    import json
    print(json.dumps(prune(),indent=2))
