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
                def regions(source, selector):
                    return [source[n['start']:n['end']] for n in parse(source).nodes if selector(n)]
                def body(n):
                    return 'article-body' in n['attrs'].get('class', '').split()
                def frame(n):
                    return n['tag'] == 'iframe'
                def anchors(source):
                    return Counter(n['attrs']['id'] for n in parse(source).nodes if n['attrs'].get('id'))
                self.assertEqual(regions(before, body), regions(after, body))
                self.assertEqual(regions(before, frame), regions(after, frame))
                self.assertEqual(metadata(before), metadata(after))
                self.assertFalse(anchors(before) - anchors(after))
                stripped = re.sub(
                    r'<!-- field-atlas:connections -->.*?<!-- field-atlas:/connections -->\n',
                    '', after, flags=re.S,
                )
                def links(source):
                    return [n['attrs']['href'] for n in parse(source).nodes
                            if n['tag'] == 'a' and 'href' in n['attrs']]
                self.assertEqual(links(before), links(stripped))

    def test_protected_operational_files_are_unchanged(self):
        targets = [
            'live-demos', 'backend', 'documents', 'locations', 'sitemap.xml', 'feed.xml',
            'CNAME', 'robots.txt', 'ads.txt', '.github', 'assets/js', 'assets/series-banners',
            'content/article-registry.json', 'content/knowledge-taxonomy.json',
            'content/article-video-matches.json', 'content/youtube-videos.json',
        ]
        self.assertEqual(git('diff', '--name-only', PRODUCTION, '--', *targets), b'')
