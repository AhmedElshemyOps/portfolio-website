import copy
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from validate_content_registry import validate, BASE
from article_catalogue import refresh


class ContentPreflight(unittest.TestCase):
    def setUp(self):
        self.rows = json.loads((ROOT / 'content/article-registry.json').read_text())

    def test_current_registry_and_unchanged_series_routes(self):
        self.assertEqual(validate(ROOT, self.rows), len(self.rows))
        self.assertTrue(any(r['url'].startswith('/series/') for r in self.rows))

    def test_bad_shapes_and_dates_fail_before_taxonomy(self):
        for changes in ({'title': ''}, {'tags': 'SOP'}, {'tags': [{}]},
                        {'relatedArticles': ['x', 'x']}, {'readingTime': True},
                        {'wordCount': -1}, {'updated': '2026-02-30'},
                        {'updated': '20261001'}, {'type': 'Draft'}):
            with self.subTest(changes=changes):
                rows = copy.deepcopy(self.rows)
                rows[1].update(changes)
                with self.assertRaises(ValueError):
                    validate(ROOT, rows, check_files=False)
        for rows in ({}, [], [None]):
            with self.assertRaises(ValueError):
                validate(ROOT, rows)

    def test_unsafe_or_non_page_routes_fail(self):
        for url in ('/articles/../index.html', '//example.com/index.html',
                    '/articles/good/index.html?q=x', '/assets/file.svg',
                    '/articles/good%2fother/index.html'):
            with self.subTest(url=url):
                rows = copy.deepcopy(self.rows)
                rows[0]['url'] = url
                with self.assertRaisesRegex(ValueError, 'permanent'):
                    validate(ROOT, rows, check_files=False)

    def test_existing_taxonomy_and_series_checks_are_reused(self):
        for changes in ({'primaryCategory': 'Unknown'}, {'seriesPosition': 999},
                        {'relatedArticles': ['/articles/missing/index.html']},
                        {'id': self.rows[0]['id']}):
            rows = copy.deepcopy(self.rows)
            rows[1].update(changes)
            with self.assertRaises(ValueError):
                validate(ROOT, rows, check_files=False)

    def test_missing_page_and_canonical_mismatch(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for row in self.rows:
                path = root / row['url'].lstrip('/')
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(f'<link rel="canonical" href="{BASE + row["url"]}">')
            shutil.copytree(ROOT / 'content', root / 'content')
            self.assertEqual(validate(root, self.rows), len(self.rows))
            path = root / self.rows[0]['url'].lstrip('/')
            for source in ('', '<link rel="canonical" href="https://example.com/">',
                           path.read_text() * 2):
                path.write_text(source)
                with self.assertRaisesRegex(ValueError, 'canonical'):
                    validate(root, self.rows)
            path.unlink()
            with self.assertRaisesRegex(ValueError, 'missing'):
                validate(root, self.rows)

    def test_failed_refresh_does_not_write_consumers(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            shutil.copytree(ROOT / 'content', root / 'content')
            before = {p: p.read_bytes() for p in (root / 'content').glob('*.json')}
            self.rows[0]['url'] = '/articles/../index.html'
            with self.assertRaises(ValueError):
                refresh(root, self.rows)
            self.assertEqual(before, {p: p.read_bytes() for p in before})


if __name__ == '__main__':
    unittest.main()
