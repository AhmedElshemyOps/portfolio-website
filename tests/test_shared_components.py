"""Regression checks for preserving page content during shared-component updates."""
from pathlib import Path
import json
import shutil
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from render_shared import render
from update_site_contact import apply as update_contact


class SharedComponents(unittest.TestCase):
    def test_article_content_and_canonical_are_preserved(self):
        body = '<main id="content"><h1>Article</h1><a href="#evidence">Evidence</a><p id="evidence">Original text.</p></main>'
        canonical = '<link rel="canonical" href="https://ahmedqualityops.com/articles/example/index.html">'
        source = '<html><head>' + canonical + '</head><body><header class="masthead"></header>' + body + '<footer class="platform-footer"></footer></body></html>'
        result = render(source, ROOT / 'articles/example/index.html')
        self.assertIn(body, result)
        self.assertIn(canonical, result)
        self.assertIn('<a href="/knowledge/index.html" aria-current="page">', result)
        self.assertEqual(result, render(result, ROOT / 'articles/example/index.html'))

    def test_homepage_has_only_one_active_navigation_link(self):
        source = '<html><head></head><body><header class="wrap editorial-masthead"></header><main>Unchanged</main><footer class="wrap footer"></footer></body></html>'
        result = render(source, ROOT / 'index.html')
        self.assertEqual(result.count('aria-current="page"'), 1)
        self.assertIn('id="primary-navigation"', result)
        self.assertNotIn('site-navigation.js', result)
        self.assertEqual(result, render(result, ROOT / 'index.html'))

    def test_demo_app_navigation_is_not_replaced(self):
        header = '<header class="site-header"><button>Dispatch controls</button></header>'
        source = '<html><head></head><body>' + header + '<main>App</main><footer class="platform-footer"></footer></body></html>'
        result = render(source, ROOT / 'live-demos/infrasky.html')
        self.assertIn(header, result)
        self.assertNotIn('data-navigation-toggle', result)

    def test_contact_updates_do_not_restore_dated_availability(self):
        previous = json.loads((ROOT / 'content/site-contact.json').read_text())
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            shutil.copytree(ROOT / 'templates', root / 'templates')
            (root / 'content').mkdir()
            data = dict(previous, email='new@example.org', phone_display='+31 6 1234 5678', phone_e164='+31612345678', availability_text='DO NOT DISPLAY THIS DATE')
            (root / 'content/site-contact.json').write_text(json.dumps(data))
            page = root / 'index.html'
            page.write_text('<html><head></head><body><header class="wrap editorial-masthead"></header><main><a href="mailto:' + previous['email'] + '">Contact Ahmed</a><a href="tel:' + previous['phone_e164'] + '">' + previous['phone_display'] + '</a><p>13 years</p></main><footer class="wrap footer"></footer></body></html>')
            update_contact(root)
            result = page.read_text()
            self.assertIn('href="mailto:new@example.org"', result)
            self.assertIn('href="tel:+31612345678"', result)
            self.assertIn('+31 6 1234 5678', result)
            self.assertIn('<p>13 years</p>', result)
            self.assertNotIn('DO NOT DISPLAY THIS DATE', result)
            update_contact(root)
            self.assertEqual(result, page.read_text())


if __name__ == '__main__':
    unittest.main()
