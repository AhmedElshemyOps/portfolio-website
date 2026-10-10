"""Rebuild derived library data from the authoritative registry, without body migrations.
Run after editing article metadata: python3 scripts/sync_catalogue.py.
For new finished text, use publish_article.py with explicit taxonomy metadata.
"""
import json
from pathlib import Path
from article_catalogue import refresh
from render_shared import pages,render
from bundle_page_styles import write_generated
ROOT=Path(__file__).resolve().parents[1]
def main():
    registry=json.loads((ROOT/'content/article-registry.json').read_text())
    refresh(ROOT,registry)
    changed=0
    for p in pages(ROOT):
        old=p.read_text();new=render(old,p,ROOT)
        if old!=new:p.write_text(new);changed+=1
    write_generated(root=ROOT)
    print(f'Validated {len(registry)} registry entries; refreshed derived data and {changed} page asset references.')
if __name__=='__main__':main()
