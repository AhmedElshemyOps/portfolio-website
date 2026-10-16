import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from audit_seo import DOM, schema_nodes

BASE = 'https://ahmedqualityops.com'
ATOM = '{http://www.w3.org/2005/Atom}'


def page_dates(path):
    source = path.read_text()
    dom = DOM(source).root
    canonical = next((n.attrs.get('href') for n in dom.all('link') if n.attrs.get('rel') == 'canonical'), None)
    metadata = {n.attrs.get('property', n.attrs.get('name', '')): n.attrs.get('content', '') for n in dom.all('meta')}
    nodes, _ = schema_nodes(source)
    page = next((n for n in nodes if canonical in (n.get('mainEntityOfPage'), n.get('@id'), n.get('url'))), None)
    if page is None:
        page = next((n for n in nodes if n.get('@type') in ('Article', 'CollectionPage')), None)
    modified = (page or {}).get('dateModified') or metadata.get('article:modified_time')
    published = (page or {}).get('datePublished') or metadata.get('article:published_time')
    return canonical, modified[:10] if modified else None, published[:10] if published else None


class ContentDateTests(unittest.TestCase):
    def test_registry_and_sitemap_use_page_modified_dates(self):
        registry = json.loads((ROOT / 'content/article-registry.json').read_text())
        sitemap = ET.parse(ROOT / 'sitemap.xml').getroot()
        sitemap_dates = {
            item.findtext('{*}loc'): item.findtext('{*}lastmod')
            for item in sitemap.findall('{*}url')
        }
        for record in registry:
            path = ROOT / record['url'].lstrip('/')
            canonical, modified, _ = page_dates(path)
            if modified:
                self.assertEqual(record.get('updated'), modified, record['url'])
                self.assertEqual(sitemap_dates.get(canonical), modified, record['url'])
            else:
                self.assertNotIn('lastmod', [child.tag.rsplit('}', 1)[-1] for child in sitemap.findall('{*}url') if child.findtext('{*}loc') == canonical], record['url'])
        self.assertIsNone(sitemap_dates.get(BASE + '/'))


    def test_atom_dates_follow_article_dates(self):
        registry = json.loads((ROOT / 'content/article-registry.json').read_text())
        articles = {BASE + record['url']: record for record in registry if record['type'] == 'Article'}
        feed = ET.parse(ROOT / 'feed.xml').getroot()
        entries = feed.findall(ATOM + 'entry')
        self.assertEqual(len(entries), len(articles))
        for entry in entries:
            url = entry.findtext(ATOM + 'id')
            record = articles[url]
            path = ROOT / record['url'].lstrip('/')
            _, modified, published = page_dates(path)
            expected = modified or record.get('updated') or published
            self.assertEqual(entry.findtext(ATOM + 'updated')[:10], expected, record['url'])


    def test_sitemap_builder_has_no_fixed_release_dates(self):
        builder = (ROOT / 'scripts/build_search_feeds.py').read_text()
        self.assertNotIn("date='2026-10-08'", builder)
        self.assertIn("n.get('dateModified')", builder)


if __name__ == '__main__':
    unittest.main()
