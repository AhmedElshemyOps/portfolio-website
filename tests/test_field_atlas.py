"""Validate the Atlas and compare protected content to the actual published Git tree."""
from collections import Counter
import json
from pathlib import Path
import re
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from apply_field_manual import parse
from build_field_atlas import build, destination, validate_atlas

PRODUCTION = '753c3a0cc6e2235201e939b840973911725dc00c'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def metadata(source):
    return [
        (n['tag'], n['attrs'], source[n['inner']:n['end']])
        for n in parse(source).nodes
        if n['tag'] == 'meta'
        or n['tag'] == 'link' and n['attrs'].get('rel') == 'canonical'
        or n['tag'] == 'script' and n['attrs'].get('type') == 'application/ld+json'
    ]


def change_attribute(source, node, name, value):
    opening = source[node['start']:node['inner']]
    changed = opening.replace(f'{name}="{node["attrs"][name]}"', f'{name}="{value}"', 1)
    if changed == opening:
        raise ValueError(f'Could not change fixture attribute {name}')
    return source[:node['start']] + changed + source[node['inner']:]


def assert_article_preserved(test, before, after):
    def regions(source, selector):
        return [source[n['start']:n['end']] for n in parse(source).nodes if selector(n)]
    def body(n):
        return 'article-body' in n['attrs'].get('class', '').split()
    def frame(n):
        return n['tag'] == 'iframe'
    def anchors(source):
        return Counter((key, n['attrs'][key]) for n in parse(source).nodes
                       for key in ('id', 'name')
                       if n['attrs'].get(key) and (key == 'id' or n['tag'] == 'a'))
    def links(source):
        return [n['attrs'] for n in parse(source).nodes
                if n['tag'] == 'a' and 'href' in n['attrs']]

    test.assertEqual(regions(before, body), regions(after, body))
    test.assertEqual(regions(before, frame), regions(after, frame))
    test.assertEqual(metadata(before), metadata(after))
    test.assertFalse(anchors(before) - anchors(after))
    stripped = re.sub(
        r'<!-- field-atlas:connections -->.*?<!-- field-atlas:/connections -->\n',
        '', after, flags=re.S,
    )
    test.assertEqual(links(before), links(stripped))


class FieldAtlas(unittest.TestCase):
    def test_generator_has_no_drift_and_destinations_resolve(self):
        build(ROOT, check=True)
        data = json.loads((ROOT / 'content/field-atlas.json').read_text())
        self.assertEqual([len(row['steps']) for row in data['journeys']], [12, 9, 9, 8])
        garden = (ROOT / 'knowledge/index.html').read_text()
        hrefs = {n['attrs'].get('href') for n in parse(garden).nodes if n['tag'] == 'a'}
        approved = {item['path'] for row in data['journeys']
                    for key in ('steps', 'related', 'next') for item in row[key]}
        approved.update(row['path'] for row in data['employerProof'])
        self.assertTrue(approved <= hrefs)
        self.assertEqual(len(data['plannedCategories']), 10)
        with self.assertRaisesRegex(ValueError, 'Missing Atlas anchor'):
            destination(ROOT, '/knowledge/index.html#unknown-atlas-anchor')
        with self.assertRaisesRegex(ValueError, 'Unsafe Atlas destination'):
            destination(ROOT, '//example.com/not-in-the-atlas')
        data['edges'][0]['target'] = '/articles/hotel-ai-prompting-framework/index.html'
        with self.assertRaisesRegex(ValueError, 'Unverified Atlas link'):
            validate_atlas(ROOT, data)

    def test_protected_article_bodies_anchors_and_metadata(self):
        paths = git('ls-tree', '-r', '--name-only', PRODUCTION, '--', 'articles', 'series').decode().splitlines()
        article_paths = {p for p in paths if p.endswith('.html')}
        current = {p.relative_to(ROOT).as_posix() for folder in ('articles', 'series')
                   for p in (ROOT / folder).rglob('*.html')}
        self.assertEqual(current, article_paths)
        for route in sorted(article_paths):
            with self.subTest(route=route):
                before = git('show', PRODUCTION + ':' + route).decode()
                after = (ROOT / route).read_bytes().decode()
                assert_article_preserved(self, before, after)

    def test_protection_rejects_content_heading_anchor_canonical_and_social_mutations(self):
        route = 'articles/integrated-sop-creation-model/index.html'
        source = git('show', PRODUCTION + ':' + route).decode()
        nodes = parse(source).nodes
        body = next(n for n in nodes if 'article-body' in n['attrs'].get('class', '').split())
        heading = next(n for n in nodes if n['tag']=='h2' and body['start'] < n['start'] < body['end'])
        link = next(n for n in nodes if n['tag']=='a' and 'href' in n['attrs']
                    and body['start'] < n['start'] < body['end'])
        meta = next(n for n in nodes if n['attrs'].get('property')=='og:image')
        canonical = next(n for n in nodes if n['attrs'].get('rel')=='canonical')
        mutations = {
            'text': source[:body['inner']] + 'unapproved copy' + source[body['inner']:],
            'heading': source[:heading['inner']] + 'unapproved heading' + source[heading['inner']:],
            'anchor': change_attribute(source, heading, 'id', 'unapproved-id'),
            'link': change_attribute(source, link, 'href', 'https://example.org/changed'),
            'canonical': change_attribute(source, canonical, 'href', 'https://example.org/changed'),
            'social': change_attribute(source, meta, 'content', 'https://example.org/changed.png'),
        }
        assert_article_preserved(self, source, source)
        for name, changed in mutations.items():
            with self.subTest(mutation=name), self.assertRaises(AssertionError):
                assert_article_preserved(self, source, changed)

    def test_legacy_aliases_preserve_every_byte_except_reader_asset_revision(self):
        import hashlib
        aliases = json.loads((ROOT / 'maintenance/seo/active-legacy-articles.json').read_text())
        reader = (ROOT / 'assets/js/article-reader.js').read_bytes()
        prior = git('show', PRODUCTION + ':assets/js/article-reader.js')
        suffix = lambda data: hashlib.sha256(data).hexdigest()[:12].encode()
        for alias in aliases:
            route = alias['legacy_path'].lstrip('/')
            original = git('show', PRODUCTION + ':' + route)
            self.assertEqual((ROOT / route).read_bytes(), original.replace(
                b'/assets/js/article-reader.js?v=' + suffix(prior),
                b'/assets/js/article-reader.js?v=' + suffix(reader),
            ), route)

    def test_protected_operational_files_are_unchanged(self):
        targets = [
            'live-demos', 'backend', 'documents', 'locations', 'sitemap.xml', 'feed.xml',
            'CNAME', 'robots.txt', 'ads.txt', '.github', 'assets/js', 'assets/series-banners',
            'content/article-registry.json', 'content/knowledge-taxonomy.json',
            'content/article-video-matches.json', 'content/youtube-videos.json',
        ]
        demo_css = 'live-demos/assets/css/knowledge-atlas-demo.css'
        reader = 'assets/js/article-reader.js'
        expected = {
            demo_css: git('show', PRODUCTION + ':' + demo_css) + b'''
/* Keep the small labels legible on the light workspace surfaces. */
.knowledge-atlas-demo .planning-country > .eyebrow,
.knowledge-atlas-demo .cluster-step .step-head > span {
  color: #4e421e;
}
''',
            reader: git('show', PRODUCTION + ':' + reader).replace(
                b"    button.addEventListener('click', () => {\n      const action = button.dataset.readerFont;",
                b"""    const visibleLabel = button.textContent.trim();
    const accessibleLabel = button.getAttribute('aria-label');
    if (['increase', 'decrease'].includes(button.dataset.readerFont) && visibleLabel && accessibleLabel) {
      button.setAttribute('aria-label', visibleLabel + ' ' + accessibleLabel);
    }
    button.addEventListener('click', () => {
      const action = button.dataset.readerFont;""",
            ),
        }
        changed = git('diff', '--name-only', PRODUCTION, '--', *targets).decode().splitlines()
        self.assertEqual(set(changed), set(expected))
        for path, approved in expected.items():
            self.assertEqual((ROOT / path).read_bytes(), approved, path)
