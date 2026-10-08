"""Stage or apply explicitly approved legacy article compatibility pages.
Never redirects, changes a canonical, or overwrites a conflicting existing page.
"""
from pathlib import Path
import json,argparse
ROOT=Path(__file__).resolve().parents[1]
def restore(output,only_observed=False):
 output=Path(output);mapping=json.loads((ROOT/'maintenance/seo/legacy-url-recovery-map.json').read_text());count=0
 for entry in mapping:
  if only_observed and not entry['search_result_observed']:continue
  dest=output/entry['existing_legacy_path'].lstrip('/');source=ROOT/entry['matching_current_path'].lstrip('/');text=source.read_text()
  if dest.exists() and dest.read_text()!=text:raise RuntimeError('Refusing to overwrite conflicting page: '+str(dest))
  dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(text);count+=1
 print('Compatibility pages prepared:',count,'in',output)
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output',required=True,help='Staging folder; repository root only after explicit route approval');parser.add_argument('--only-observed',action='store_true');args=parser.parse_args();restore(args.output,args.only_observed)
