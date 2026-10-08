"""Replay the narrowly approved 8 October article presentation revisions.

Historical SEO/evidence tests keep their original frozen sources and recorded
claim corrections. These later user-approved changes are then applied explicitly:
2e8b7f7: accommodation scope, its visible note, and connected reading paths;
4c8b49f: four semantic reservation tables and two stray separator repairs.
The resulting teaching body is still compared exactly, including copy prompts.
"""
import json
from pathlib import Path

from accommodation_baseline import approved_baseline, SCOPED
from apply_field_manual import parse
from improve_article_visuals import migrate
from link_article_library import render

ROOT = Path(__file__).resolve().parents[1]
ROWS = json.loads((ROOT / 'content/article-registry.json').read_text())
BY_ID = {row['id']: row for row in ROWS}
SCOPE_NOTE = '<aside class="accommodation-scope" id="accommodation-scope"><strong>Scope of this guide</strong><p>Research and applied frameworks for hotel apartments, extended stays and staycations. Illustrative models and proposed workflows should be validated against approved property procedures; projected benefits are not measured results.</p></aside>'


def approved_revisions(source, slug):
    source = approved_baseline(source, slug)
    row = BY_ID[slug]
    if slug in SCOPED and row['type'] == 'Article' and 'id="accommodation-scope"' not in source:
        purpose = next(node for node in parse(source).nodes
                       if 'article-purpose' in node['attrs'].get('class', '').split())
        source = source[:purpose['end']] + SCOPE_NOTE + source[purpose['end']:]
    if slug == 'hotel-reservations-ai-toolkit':
        source = migrate(source).replace('<p>---</p>', '<hr/>')
    return render(source, row, ROWS)
