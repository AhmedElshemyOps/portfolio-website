"""Read-only canonical, sitemap and crawler preflight for every public HTML page."""
import collections
import json
import re
from pathlib import Path
import urllib.robotparser
import xml.etree.ElementTree as ET

from audit_seo import BASE, DOM, audit_pages, schema_nodes

ROOT = Path(__file__).resolve().parents[1]


def validate(root=ROOT):
    errors = []
    utilities = set(json.loads((root / 'maintenance/seo/search-utilities.json').read_text()))
    aliases = {row['legacy_path'].lstrip('/'): BASE + row['canonical_path']
               for row in json.loads((root / 'maintenance/seo/active-legacy-articles.json').read_text())}
    paths = {str(p.relative_to(root)): p for p in audit_pages(root)}
    for missing in sorted((utilities | set(aliases)) - set(paths)):
        errors.append(f'{missing}: declared exception has no public page')
    sitemap = [node.text for node in ET.parse(root / 'sitemap.xml').getroot().findall('{*}url/{*}loc')]
    counts = collections.Counter(sitemap)
    robots = urllib.robotparser.RobotFileParser()
    robots.parse((root / 'robots.txt').read_text().splitlines())
    expected = set()
    for relative, path in paths.items():
        url = BASE + ('/' if relative == 'index.html' else '/' + relative)
        source = path.read_text()
        dom = DOM(source).root
        canonical = [n.attrs.get('href') for n in dom.all('link')
                     if 'canonical' in n.attrs.get('rel', '').lower().split()]
        directives = ' '.join(n.attrs.get('content', '').lower() for n in dom.all('meta')
                              if n.attrs.get('name', '').lower() in ('robots', 'googlebot', 'bingbot'))
        blocked = bool({'noindex', 'none'} & set(re.split(r'[\s,;:]+', directives)))
        if relative in utilities:
            if not blocked:
                errors.append(f'{relative}: utility must remain noindex')
            continue
        if canonical != [aliases.get(relative, url)]:
            errors.append(f'{relative}: incorrect or duplicate canonical')
        if relative in aliases:
            target = aliases[relative].removeprefix(BASE + '/') or 'index.html'
            if target not in paths:
                errors.append(f'{relative}: alias target is missing')
            continue
        expected.add(url)
        if blocked:
            errors.append(f'{relative}: search page is noindex')
        for tag in ('title', 'h1'):
            nodes = dom.all(tag)
            if len(nodes) != 1 or not nodes[0].text().strip():
                errors.append(f'{relative}: requires one nonempty {tag}')
        descriptions = [n for n in dom.all('meta') if n.attrs.get('name', '').lower() == 'description']
        if len(descriptions) != 1 or not descriptions[0].attrs.get('content', '').strip():
            errors.append(f'{relative}: requires one nonempty description')
        _, schema_errors = schema_nodes(source)
        if schema_errors:
            errors.append(f'{relative}: invalid structured-data JSON')
        for bot in ('Googlebot', 'Bingbot', 'OAI-SearchBot'):
            if not robots.can_fetch(bot, url):
                errors.append(f'{relative}: robots.txt blocks {bot}')
    for url in sorted(expected):
        if counts[url] != 1:
            errors.append(f'{url}: expected exactly one sitemap entry, found {counts[url]}')
    for url in sorted(set(sitemap) - expected, key=str):
        errors.append(f'{url}: sitemap entry is not a canonical search page')
    return errors, {'public_pages': len(paths), 'canonical_search_pages': len(expected),
                    'historical_aliases': len(aliases), 'noindex_utilities': len(utilities)}


if __name__ == '__main__':
    problems, inventory = validate()
    print(json.dumps({'inventory': inventory, 'errors': problems}, indent=2))
    raise SystemExit(bool(problems))
