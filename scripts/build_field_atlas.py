"""Maintain the Field Atlas shell slots without changing protected article bodies."""
import argparse
from html import escape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

from apply_field_manual import parse

ROOT = Path(__file__).resolve().parents[1]
STYLE = '<link rel="stylesheet" href="/assets/atlas/field-atlas.css"/>'
SLOT = '<!-- field-atlas:{} -->'
PROTECTED_REVISION = '753c3a0cc6e2235201e939b840973911725dc00c'


def slot(source, name, body, at):
    opening, closing = SLOT.format(name), SLOT.format('/' + name)
    block = opening + '\n' + body + '\n' + closing
    if opening in source:
        begin = source.index(opening)
        end = source.index(closing, begin) + len(closing)
        return source[:begin] + block + source[end:]
    return source[:at] + block + '\n' + source[at:]


def without_slot(source, name):
    opening, closing = SLOT.format(name), SLOT.format('/' + name)
    return re.sub(re.escape(opening) + '.*?' + re.escape(closing) + r'\n?', '', source, flags=re.S)


def restore_reader_slot(source):
    opening, closing = SLOT.format('connections'), SLOT.format('/connections')
    if opening not in source:
        return source
    start = source.index(opening) + len(opening)
    body = source[start:source.index(closing, start)].strip('\n')
    source = without_slot(source, 'connections')
    article = next(n for n in parse(source).nodes if 'article-body' in n['attrs'].get('class', '').split())
    return slot(source, 'connections', body, article['end'])


def stylesheet(source):
    return source.replace(STYLE + '\n', '').replace(STYLE, '').replace('</head>', STYLE + '\n</head>', 1)


def link(label, path, cls=''):
    style = f' class="{escape(cls, quote=True)}"' if cls else ""
    return f'<a{style} href="{escape(path, quote=True)}">{escape(label)}</a>'


def project_panel(project):
    details = (
        ('Operating problem', project['summaryProblem']),
        ('Contribution', project['summaryContribution']),
        ('Output to inspect', project['output']),
        ('Evidence boundary', project['summaryBoundary']),
    )
    tiles = ''.join(f'<li><h3>{title}</h3><p>{escape(value)}</p></li>' for title, value in details)
    return (
        '<section class="atlas atlas-panel" aria-labelledby="atlas-case-title">'
        '<p class="atlas-kicker">Field Atlas · Working prototype</p>'
        '<h2 id="atlas-case-title">How the tool fits the operation</h2>'
        f'<ul class="atlas-proof">{tiles}</ul><div class="atlas-actions">'
        + link('Open the interactive demo', project['demo'], 'atlas-button')
        + link('Compare all four projects', '/projects/index.html') + '</div></section>'
    )


def destination(root, address):
    url = urlsplit(address)
    if not address.startswith('/') or url.netloc or url.scheme or '..' in Path(url.path).parts:
        raise ValueError(f'Unsafe Atlas destination: {address}')
    target = root / (url.path.lstrip('/') or 'index.html')
    if not target.is_file():
        raise ValueError(f'Missing Atlas destination: {address}')
    if url.fragment:
        nodes = parse(target.read_text(encoding='utf-8')).nodes
        if not any(url.fragment in (n['attrs'].get('id'), n['attrs'].get('name')) for n in nodes):
            raise ValueError(f'Missing Atlas anchor: {address}')
    return target


def list_items(rows):
    return ''.join(
        '<li>' + link(row['title'], row['path']) + '<br><small>' + escape(row['why']) + '</small></li>'
        for row in rows
    )


def garden(data, titles):
    journeys = data['journeys']
    trail_index = ''.join(
        f'<li><small>Trail {i:02}</small>{link(j["title"], "#goal-" + j["id"])}</li>'
        for i, j in enumerate(journeys, 1)
    )
    trails = []
    for j in journeys:
        name = escape(j['title'])
        related = '<h4>Related series and projects</h4><ul>' + list_items(j['related']) + '</ul>' if j['related'] else ''
        proof = ''
        if j['id'] == 'evaluate-for-a-role':
            proof = '<h4>Career evidence and contact</h4><ul>' + list_items(data['employerProof']) + '</ul>'
        trails.append(
            f'<section id="goal-{j["id"]}" class="atlas-panel"><h3>{name}</h3><p>{escape(j["objective"])}</p>'
            f'<ol>{list_items(j["steps"])}</ol>{related}{proof}<h4>Next step</h4><ul>{list_items(j["next"])}</ul>'
            '<p><a href="#field-atlas">Return to the Knowledge Garden</a></p></section>'
        )
    categories = ''.join('<li>' + escape(name) + '</li>' for name in data['plannedCategories'])
    return (
        '<section id="field-atlas" class="atlas atlas-panel" aria-labelledby="field-atlas-title">'
        '<p class="atlas-kicker">Ahmed Quality Ops · Tourism Operations Field Atlas</p>'
        '<h2 id="field-atlas-title">The Knowledge Garden</h2>'
        '<p>Follow an operating question through articles, series, video and working tools.</p>'
        '<nav class="atlas-actions" aria-label="Garden navigation"><a class="atlas-button" href="#library-search">Search the library</a>'
        '<a href="#professional-goals">Explore by professional goal</a><a href="#atlas-map">Open the map</a></nav>'
        f'<h3 id="professional-goals">Explore by Professional Goal</h3><ol class="atlas-trails">{trail_index}</ol>'
        + knowledge_map(data['edges'], titles)
        + '<details><summary>Ten planned Field Atlas topics</summary><p>These are planned topics. Browse and search use the five existing categories while article mappings await approval.</p>'
        f'<ol>{categories}</ol></details>' + ''.join(trails) + '</section>'
    )


def knowledge_map(edges, titles):
    featured = [e for e in edges if e['source'] == '/articles/integrated-sop-creation-model/index.html']
    origin = featured[0]['source']
    stops = [origin] + [e['target'] for e in featured]
    coordinates = [(340, 120), (115, 48), (552, 48), (105, 192), (560, 192)]
    labels = ['Integrated SOP guide', 'MICE series', 'Movement control', 'Guest journey', 'Hotel check-in video']
    connectors = ''.join(f'<path d="M340 120 Q{x} 120 {x} {y}"/>' for x, y in coordinates[1:])
    points = ''.join(
        f'<a href="{escape(path, quote=True)}" aria-label="{escape(label, quote=True)}">'
        f'<circle cx="{x}" cy="{y}" r="9"/><text x="{x}" y="{y+29}" text-anchor="middle">{label}</text></a>'
        for path, (x, y), label in zip(stops, coordinates, labels, strict=True)
    )
    alternative = ''.join(f'<li>{link(titles[path], path)}</li>' for path in stops)
    return (
        '<div class="atlas-map" id="atlas-map"><h3>Map · From procedure to a live operation</h3>'
        '<p>Each line represents a verified published link or embedded video.</p>'
        f'<svg viewBox="0 0 680 245" aria-label="Connected field guides and video">{connectors}{points}</svg>'
        f'<h4>Map destinations</h4><ol class="atlas-index">{alternative}</ol></div>'
    )


def reader_connections(route, edges, titles):
    entries = []
    for edge in edges:
        a, b = edge['source'], edge['target']
        if route == a:
            label = {'link': 'Published link', 'embed': 'Companion video', 'series': 'Series member'}[edge['type']]
            target = b
        elif route == b:
            label, target = ('Series index' if edge['type'] == 'series' else 'Backlink'), a
        else:
            continue
        entries.append(f'<li><small>{label}</small> · {link(titles[target], target)}</li>')
    if not entries:
        return ''
    return (
        '<aside class="atlas atlas-reading" aria-label="Field Atlas connections">'
        '<p class="atlas-kicker">Field Atlas · Related reading</p><h2>Follow the references</h2><ul>'
        + ''.join(entries) + '</ul><p>' + link('Back to the Knowledge Garden', '/knowledge/index.html#field-atlas') + '</p></aside>'
    )


def employer_panel():
    return (
        '<section class="atlas atlas-panel" aria-labelledby="atlas-employer-title">'
        '<p class="atlas-kicker">Professional portfolio · Employer review</p>'
        '<h2 id="atlas-employer-title">Evidence from the work</h2>'
        '<ul class="atlas-proof"><li><h3>Destination delivery</h3><p>Guest movements, transport and supplier handovers across Egypt and the UAE.</p></li>'
        '<li><h3>Service coordination</h3><p>B2B reservations, guest communication, service recovery and cross-team support.</p></li>'
        '<li><h3>Continuous improvement</h3><p>Contributed to Travel Desk improvement using DMAIC, including allocation, training and control planning.</p></li>'
        '<li><h3>Selected qualifications</h3><p>IATA Travel Operations, MICE and Sales, and Tour Production diplomas. CAPM, ITIL 4 Foundation and Lean Six Sigma Black Belt training.</p></li></ul>'
        '<nav class="atlas-actions" aria-label="Employer evidence links">'
        + link('View the published CV', '/documents/Ahmed-Mahmoud-CV.pdf', 'atlas-button')
        + link('Professional experience', '/profile/index.html#career-title')
        + link('Four working prototypes', '/projects/index.html')
        + link('Contact', '/#site-footer') + '</nav></section>'
    )


def validate_atlas(root, data):
    paths = {'/knowledge/index.html'}
    for journey in data['journeys']:
        if not re.fullmatch(r'[a-z0-9-]+', journey['id']):
            raise ValueError('Invalid journey ID')
        for section in ('steps', 'related', 'next'):
            paths.update(row['path'] for row in journey[section])
    paths.update(row['path'] for row in data['employerProof'])
    if len(paths) != 53 or len({j['id'] for j in data['journeys']}) != 4:
        raise ValueError('The four reviewed journeys must retain all 53 approved destinations')
    for path in sorted(paths):
        destination(root, path)
    titles = {}
    seen = set()
    for edge in data['edges']:
        a, b, kind = edge['source'], edge['target'], edge['type']
        if a == b or (a, b, kind) in seen or edge['evidence'] != a or edge['revision'] != PROTECTED_REVISION:
            raise ValueError(f'Invalid Atlas edge: {a} → {b}')
        seen.add((a, b, kind))
        source = without_slot(destination(root, a).read_text(encoding='utf-8'), 'connections')
        nodes = parse(source).nodes
        title = next(n for n in nodes if n['tag'] == 'h1')
        titles[a] = text_title(source[title['inner']:title['end']])
        if kind == 'embed':
            video = re.fullmatch(r'https://www\.youtube\.com/watch\?v=([A-Za-z0-9_-]{11})', b)
            if not video or not any(
                n['tag'] == 'iframe'
                and urlsplit(n['attrs'].get('src', '')).hostname in ('www.youtube-nocookie.com', 'www.youtube.com')
                and urlsplit(n['attrs'].get('src', '')).path == '/embed/' + video[1]
                for n in nodes
            ):
                raise ValueError(f'Unverified Atlas embed: {a} → {b}')
            titles[b] = 'Lean Explained in 60 Seconds · Hotel Check-In Example'
        elif kind in ('link', 'series'):
            if not any(n['tag'] == 'a' and urlsplit(n['attrs'].get('href', '')).path == b
                       and urlsplit(n['attrs'].get('href', '')).netloc in ('', 'ahmedqualityops.com') for n in nodes):
                raise ValueError(f'Unverified Atlas link: {a} → {b}')
            target = destination(root, b).read_text(encoding='utf-8')
            heading = next(n for n in parse(target).nodes if n['tag'] == 'h1')
            titles[b] = text_title(target[heading['inner']:heading['end']])
        else:
            raise ValueError(f'Unknown Atlas relationship: {kind}')
    return titles


def text_title(source):
    from html import unescape
    return ' '.join(unescape(re.sub(r'<[^>]+>', '', source)).split())


def build(root, check=False):
    outputs = {}
    data = json.loads((root / 'content/field-atlas.json').read_text(encoding='utf-8'))
    titles = validate_atlas(root, data)
    knowledge = root / 'knowledge/index.html'
    source = stylesheet(knowledge.read_text(encoding='utf-8'))
    at = source.index('</header>', source.index('<main')) + len('</header>')
    outputs[knowledge] = slot(source, 'garden', garden(data, titles), at)
    employer = root / 'resources/recruiter-summary/index.html'
    source = stylesheet(employer.read_text(encoding='utf-8'))
    at = source.index('</section>', source.index('<main')) + len('</section>')
    outputs[employer] = slot(source, 'employer', employer_panel(), at)
    for path in sorted((root / 'articles').glob('*/index.html')):
        source = path.read_text(encoding='utf-8')
        if 'class="article-body"' in source:
            route = '/' + path.relative_to(root).as_posix()
            panel = reader_connections(route, data['edges'], titles)
            if panel:
                source = stylesheet(source)
                node = next(n for n in parse(source).nodes if 'article-body' in n['attrs'].get('class', '').split())
                source = slot(source, 'connections', panel, node['end'])
            outputs[path] = source
    for project in json.loads((root / 'content/projects.json').read_text()):
        path = root / project['caseStudy'].lstrip('/')
        source = stylesheet(path.read_text(encoding='utf-8'))
        source = without_slot(source, 'project')
        nodes = parse(source).nodes
        main = next(n for n in nodes if n['tag'] == 'main')
        intro = next(n for n in nodes if n['tag'] == 'section' and n['parent'] is main)
        outputs[path] = slot(source, 'project', project_panel(project), intro['end'])
    drift = []
    for path, source in outputs.items():
        if path.read_text(encoding='utf-8') != source:
            drift.append(str(path.relative_to(root)))
            if not check:
                path.write_text(source, encoding='utf-8')
    if check and drift:
        raise SystemExit('Field Atlas output drift:\n' + '\n'.join(drift))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    build(ROOT, parser.parse_args().check)
