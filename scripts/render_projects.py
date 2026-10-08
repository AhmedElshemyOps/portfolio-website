"""Generate both project listings from content/projects.json; preserve existing routes."""
from pathlib import Path
from html import escape
import json
import re
ROOT = Path(__file__).resolve().parents[1]

def render(source, path, root=ROOT):
    relative = path.relative_to(root).as_posix()
    if relative not in {'index.html', 'projects/index.html'}:
        return source
    projects = json.loads((root / 'content/projects.json').read_text())
    cards = []
    for i, project in enumerate(projects, 1):
        p = {k: escape(v, quote=True) for k, v in project.items()}
        if relative == 'index.html':
            cards.append(f'<article class="project"><span class="number" aria-hidden="true">{i:02}</span><div><a class="project-title" href="{p["caseStudy"]}">{p["name"]}</a><span class="status">{p["category"]} · Interactive demo</span></div><p>{p["description"]}</p><a class="project-demo-link" href="{p["demo"]}" aria-label="Try {p["name"]} demo">Try demo<svg aria-hidden="true"><use href="/assets/brand/homepage-icons.svg?v=20261008-final#arrow-right"></use></svg></a></article>')
        else:
            cards.append(f'<article><span>{i:02}</span><div class="project-index-visual"><img class="project-logo" src="{p["logo"]}" alt="{p["name"]} logo" loading="lazy" width="360" height="96"/><img src="{p["image"]}" alt="{p["name"]} interface" loading="lazy" width="1265" height="712"/></div><div><h2>{p["name"]}</h2><strong>{p["category"]}</strong><p>{p["description"]}</p><p class="project-preview-description"><strong>Output:</strong> {p["output"]}<br/><strong>Status:</strong> {p["status"]}</p><div class="action-row"><a class="button" href="{p["caseStudy"]}">Read case study</a><a class="button secondary" href="{p["demo"]}">Open demo</a></div></div></article>')
    pattern = r'<article class="project">.*?</article>' if relative == 'index.html' else r'<article>.*?</article>'
    blocks = list(re.finditer(pattern, source, re.S))
    if len(blocks) != len(projects):
        raise ValueError(f'Unexpected project structure in {relative}')
    return source[:blocks[0].start()] + ''.join(cards) + source[blocks[-1].end():]
