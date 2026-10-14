"""Expected, evidenced metadata changes approved for AdSense readiness."""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = json.loads((ROOT / 'maintenance/seo/adsense-readiness-manifest.json').read_text())

def approved_schema(nodes, slug):
    nodes = copy.deepcopy(nodes)
    path = f'articles/{slug}/index.html'
    for node in nodes:
        if node.get('@type') != 'Article':
            continue
        if path in MANIFEST['publication_dates']:
            node['datePublished'] = MANIFEST['publication_dates'][path]
        if slug in MANIFEST['updated_articles']:
            node['dateModified'] = MANIFEST['updated_date']
    return nodes
