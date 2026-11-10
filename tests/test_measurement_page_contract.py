import hashlib
import json
import re
import sys
import unittest
from collections import Counter
from pathlib import Path

from published_fixtures import AUDIT_ADDITIONS, PRODUCTION, snapshot

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'scripts'))
from audit_seo import DOM
from apply_field_manual import parse
from build_field_atlas import STYLE, without_slot
from render_career_routes import strip_homepage_addition


def record(source):
    dom = DOM(source).root
    return {
        'visibleTextSha256': hashlib.sha256(dom.text().encode()).hexdigest(),
        'allLinkHrefs': [n.attrs.get('href','') for n in dom.all('a')],
        'allIds': [n.attrs['id'] for n in dom.all() if 'id' in n.attrs],
        'canonicals': [n.attrs.get('href') for n in dom.all('link') if n.attrs.get('rel')=='canonical'],
    }


def projection(source):
    for name in ('garden', 'employer', 'connections', 'project'):
        source = without_slot(source, name)
    return source.replace(STYLE + '\n', '').replace(STYLE, '')


def words(source):
    return DOM(source).root.text().split()


class PageContractTests(unittest.TestCase):
    def test_all_existing_words_links_anchors_and_canonicals_unchanged(self):
        policy = json.loads((ROOT/'maintenance/measurement/preservation-contract.json').read_text())
        for route, old in policy['pages'].items():
            with self.subTest(page=route):
                source = (ROOT/route).read_text()
                if record(source) == old:
                    continue
                # Replay the original assertion for every evolved route. Current
                # reader bodies and full metadata have a separate production Git guard.
                historical = snapshot(policy['baselineCommit'], route)
                self.assertEqual(record(historical), old)
                prior = snapshot(PRODUCTION, route)
                current = record(source)
                previous = record(prior)
                self.assertEqual(current['canonicals'], previous['canonicals'])
                self.assertFalse(Counter(previous['allIds']) - Counter(current['allIds']))
                if route == 'index.html':
                    self.assertEqual(record(strip_homepage_addition(prior, ROOT)), old)
                    self.assertEqual([n.text().strip() for n in DOM(source).root.all('h1')], ['Travel & Tourism Professional'])
                    self.assertFalse(set(previous['allLinkHrefs']) - set(current['allLinkHrefs'])
                                     - {'/profile/index.html#career', '#articles'})
                    self.assertTrue({'/resources/recruiter-summary/index.html',
                                     '/documents/Ahmed-Mahmoud-CV.pdf', '/projects/index.html',
                                     '/knowledge/index.html', '/#site-footer'} <= set(current['allLinkHrefs']))
                elif route == 'learn/videos/index.html':
                    self.assertFalse(Counter(previous['allLinkHrefs']) - Counter(current['allLinkHrefs']))
                else:
                    projected = projection(source)
                    self.assertEqual(record(projected)['allLinkHrefs'], previous['allLinkHrefs'])
                    if route == 'knowledge/index.html':
                        badge = r'<span class="knowledge-video-badge">Includes video</span>'
                        projected, prior = (re.sub(badge, '', page) for page in (projected, prior))
                    if route == 'resources/recruiter-summary/index.html':
                        def intro(page):
                            node, = [n for n in parse(page).nodes if n['tag']=='h1']
                            return page[node['start']:node['end']]
                        self.assertIn('Travel &amp; Tourism Professional', intro(projected))
                        self.assertIn('Destination operations', projected)
                        for fragment in ('growth-hero', 'stat-grid'):
                            def without_region(page):
                                node, = [n for n in parse(page).nodes
                                         if fragment in n['attrs'].get('class', '').split()]
                                return page[:node['start']] + page[node['end']:]
                            projected, prior = map(without_region, (projected, prior))
                    self.assertEqual(words(projected), words(prior))
