"""Regression checks for search failures that must stop a release."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from validate_search_release import validate, BASE


class SearchReleaseTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'maintenance/seo').mkdir(parents=True)
        (self.root / 'maintenance/seo/search-utilities.json').write_text('["saved/index.html"]')
        (self.root / 'maintenance/seo/active-legacy-articles.json').write_text(json.dumps([
            {'legacy_path': '/old.html', 'canonical_path': '/'}]))
        self.page = ('<html><head><title>Example</title><meta name="description" content="Useful description">'
                     f'<link rel="canonical" href="{BASE}/"></head><body><h1>Example</h1></body></html>')
        (self.root / 'index.html').write_text(self.page)
        (self.root / 'old.html').write_text(self.page)
        (self.root / 'saved').mkdir()
        (self.root / 'saved/index.html').write_text('<meta name="robots" content="noindex, follow">')
        (self.root / 'robots.txt').write_text('User-agent: *\nAllow: /\n')
        self.sitemap([BASE + '/'])

    def sitemap(self, urls):
        (self.root / 'sitemap.xml').write_text('<urlset>' + ''.join(f'<url><loc>{u}</loc></url>' for u in urls) + '</urlset>')

    def errors(self):
        return '\n'.join(validate(self.root)[0])

    def test_valid_inventory_is_read_only(self):
        before = {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}
        self.assertEqual('', self.errors())
        self.assertEqual(before, {str(p): p.read_bytes() for p in self.root.rglob('*') if p.is_file()})

    def test_missing_and_duplicate_sitemap_entries(self):
        for urls in ([], [BASE + '/', BASE + '/']):
            self.sitemap(urls)
            self.assertIn('exactly one sitemap entry', self.errors())

    def test_foreign_and_utility_entries_rejected(self):
        self.sitemap([BASE + '/', BASE + '/saved/index.html', 'https://example.org/'])
        self.assertEqual(self.errors().count('not a canonical search page'), 2)

    def test_accidental_noindex_and_crawler_block_rejected(self):
        (self.root / 'index.html').write_text(self.page.replace('</head>', '<meta name="googlebot" content="noindex"></head>'))
        (self.root / 'robots.txt').write_text('User-agent: *\nDisallow: /\n')
        self.assertIn('search page is noindex', self.errors())
        self.assertIn('robots.txt blocks Googlebot', self.errors())

    def test_unknown_canonical_cannot_hide_page(self):
        (self.root / 'index.html').write_text(self.page.replace(BASE + '/', 'https://example.org/'))
        self.assertIn('incorrect or duplicate canonical', self.errors())

    def test_new_page_requires_sitemap_entry(self):
        (self.root / 'new.html').write_text(self.page.replace(BASE + '/', BASE + '/new.html'))
        self.assertIn(BASE + '/new.html: expected exactly one sitemap entry', self.errors())

    def test_metadata_and_schema_failures(self):
        (self.root / 'index.html').write_text(self.page.replace('<h1>Example</h1>', '').replace('</head>', '<script type="application/ld+json">invalid</script></head>'))
        self.assertIn('requires one nonempty h1', self.errors())
        self.assertIn('invalid structured-data JSON', self.errors())

    def test_utility_requires_noindex(self):
        (self.root / 'saved/index.html').write_text('<p>Saved</p>')
        self.assertIn('utility must remain noindex', self.errors())


if __name__ == '__main__':
    unittest.main()
