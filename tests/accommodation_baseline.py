"""Apply approved accommodation wording and the four reservation table repairs."""
import json
from pathlib import Path
from scope_accommodation import apply
from improve_article_visuals import convert_legacy_tables
ROOT=Path(__file__).resolve().parents[1]
SCOPED={r['id'] for r in json.loads((ROOT/'content/article-registry.json').read_text()) if r['series'] in {'Hotel AI Operations Playbook','Hotel Apartment Operational Excellence'}}
def approved_baseline(source,slug):
 source=apply(source) if slug in SCOPED else source
 return convert_legacy_tables(source) if slug=='hotel-reservations-ai-toolkit' else source
