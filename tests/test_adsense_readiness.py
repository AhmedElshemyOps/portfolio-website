import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from audit_seo import DOM, schema_nodes
from render_shared import pages
from approved_seo_metadata import MANIFEST

class ReadinessTests(unittest.TestCase):
    def test_verification_without_ad_requests(self):
        for path in pages():
            source = path.read_text()
            dom = DOM(source).root
            tags = [n for n in dom.all('meta') if n.attrs.get('name') == 'google-adsense-account']
            self.assertEqual(len(tags), 1, str(path))
            self.assertEqual(tags[0].attrs['content'], MANIFEST['publisher_id'])
            self.assertNotIn('pagead/js/adsbygoogle.js', source)
        self.assertEqual((ROOT / 'ads.txt').read_text().strip(), 'google.com, pub-5767638342262338, DIRECT, f08c47fec0942fa0')
        self.assertIn('adsenseEnabled: false', (ROOT / 'assets/js/site-config.js').read_text())

    def test_evidenced_dates_and_answer_revisions(self):
        for path, date in MANIFEST['publication_dates'].items():
            source = (ROOT / path).read_text()
            article = next(n for n in schema_nodes(source)[0] if n.get('@type') == 'Article')
            self.assertEqual(article['datePublished'], date)
            self.assertIn(f'datetime="{date}"', source)
            self.assertTrue(any(r['path'] == path and r['date'] == date for r in MANIFEST['deployment_evidence']))
        for slug in MANIFEST['updated_articles']:
            source = (ROOT / 'articles' / slug / 'index.html').read_text()
            self.assertEqual(source.count('class="article-opening-answer"'), 1)
            article = next(n for n in schema_nodes(source)[0] if n.get('@type') == 'Article')
            self.assertEqual(article['dateModified'], MANIFEST['updated_date'])

    def test_canonical_pages_all_include_analytics(self):
        for path in pages():
            source = path.read_text()
            if '<meta name="robots" content="noindex' in source:
                continue
            self.assertIn('/assets/js/analytics.js', source, str(path))

if __name__ == '__main__':
    unittest.main()
