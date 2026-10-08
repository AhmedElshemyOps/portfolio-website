"""Apply only the explicitly approved accommodation wording to historical fixtures."""
import json
from pathlib import Path
from scope_accommodation import apply
ROOT=Path(__file__).resolve().parents[1]
SCOPED={r['id'] for r in json.loads((ROOT/'content/article-registry.json').read_text()) if r['series'] in {'Hotel AI Operations Playbook','Hotel Apartment Operational Excellence'}}
def approved_baseline(source,slug):
 return apply(source) if slug in SCOPED else source
