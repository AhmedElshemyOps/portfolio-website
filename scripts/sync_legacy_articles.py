"""Keep explicitly approved historical URLs identical to their canonical articles.
Run after article rendering. Never infers destinations or changes existing routes.
"""
import argparse,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def sync(root=ROOT,check=False):
 entries=json.loads((root/'maintenance/seo/active-legacy-articles.json').read_text());drift=[]
 for entry in entries:
  legacy=entry['legacy_path'];canonical=entry['canonical_path']
  if not legacy.startswith('/') or '/' in legacy[1:] or not legacy.endswith('.html') or not canonical.startswith('/articles/') or '..' in canonical.split('/'):
   raise ValueError('Unsafe compatibility mapping')
  source=root/canonical.lstrip('/');target=root/legacy.lstrip('/');data=source.read_bytes()
  if not target.exists() or target.read_bytes()!=data:
   drift.append(legacy)
   if not check:target.write_bytes(data)
 if check and drift:raise RuntimeError('Run sync_legacy_articles.py after rendering: '+', '.join(drift))
 print(f'{len(entries)} approved historical article copies checked' if check else f'{len(drift)} historical article copies refreshed')
if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args();sync(check=args.check)
