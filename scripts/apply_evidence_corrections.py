"""Reapply exact reviewed fragments after regenerating article source content."""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parents[1]
def apply():
 manifest=json.loads((ROOT/'maintenance/seo/evidence-batch-manifest.json').read_text())
 for name,edits in manifest['replacements'].items():
  p=ROOT/name;s=p.read_text()
  for edit in edits:
   if edit['new'] in s:continue
   if s.count(edit['old'])!=1:raise ValueError('Review source drift before applying correction: '+name)
   s=s.replace(edit['old'],edit['new'])
  s=re.sub(r'("dateModified"\s*:\s*")[^"]+',r'\g<1>'+manifest['date'],s)
  s=re.sub(r'(<meta\s+property="article:modified_time"\s+content=")[^"]+',r'\g<1>'+manifest['date'],s)
  p.write_text(s)
if __name__=='__main__':apply()
