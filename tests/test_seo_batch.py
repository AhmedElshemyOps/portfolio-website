import unittest,json,re,sys,subprocess,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM,schema_nodes
class SeoBatchTests(unittest.TestCase):
 def test_original_articles_routes_and_bodies_preserved(self):
  for p in (ROOT/'articles').rglob('index.html'):
   old=subprocess.check_output(['git','show','seo-baseline-2026-10-08:'+str(p.relative_to(ROOT))],cwd=ROOT,text=True);new=p.read_text()
   manifest=json.loads((ROOT/'maintenance/seo/editorial-batch-manifest.json').read_text())
   expected=old
   for edit in manifest['body_replacements'].get(str(p.relative_to(ROOT)),[]):expected=expected.replace(edit['old'],edit['new'])
   for edit in json.loads((ROOT/'maintenance/seo/library-batch-manifest.json').read_text())['navigation_component_replacements'].get(str(p.relative_to(ROOT)),[]):expected=expected.replace(edit['old'],edit['new'])
   for pattern in [r'<article class="article-body".*?</article>',r'<link[^>]*rel="canonical"[^>]*>']:
    a=re.search(pattern,expected,re.S);b=re.search(pattern,new,re.S);self.assertEqual(a[0] if a else None,b[0] if b else None,str(p))
   for href in re.findall(r'href="([^"]+)"',old):
    if '/articles/' in href:self.assertIn(href,new,str(p))
 def test_sitemap_and_atom_are_valid_unique_canonical_outputs(self):
  sitemap=ET.parse(ROOT/'sitemap.xml').getroot();urls=[n.findtext('{*}loc') for n in sitemap];self.assertEqual(len(urls),len(set(urls)));self.assertEqual(len(urls),172)
  for url in urls:
   path=url.split('https://ahmedqualityops.com/',1)[1] or 'index.html';s=(ROOT/path).read_text();d=DOM(s).root;robots=next((n.attrs.get('content','') for n in d.all('meta') if n.attrs.get('name')=='robots'),'');self.assertNotIn('noindex',robots)
  feed=ET.parse(ROOT/'feed.xml').getroot();entries=feed.findall('{*}entry');self.assertEqual(len(entries),128);latest=feed.findtext('{*}updated');self.assertTrue(all(n.findtext('{*}updated')<=latest for n in entries))
 def test_article_metadata_and_navigation(self):
  for p in (ROOT/'articles').rglob('index.html'):
   d=DOM(p.read_text()).root;self.assertEqual(len(d.all('h1')),1,str(p));self.assertTrue(any(n.attrs.get('name')=='description' and n.attrs.get('content') for n in d.all('meta')),str(p));self.assertTrue(any(n.attrs.get('aria-label')=='Primary navigation' for n in d.all('nav')),str(p));self.assertFalse(schema_nodes(p.read_text())[1])
 def test_author_and_article_catalogue_are_consistent(self):
  d=json.loads((ROOT/'content/content-index.json').read_text());self.assertEqual(d['author']['location'],'Netherlands')
  for x in json.loads((ROOT/'content/articles.json').read_text()):self.assertTrue((ROOT/x['url'].lstrip('/')).is_file(),x['url'])
 def test_header_image_is_small_and_old_asset_remains_available(self):
  self.assertLess((ROOT/'assets/brand/homepage-monogram-116.png').stat().st_size,25000);self.assertTrue((ROOT/'assets/brand/homepage-monogram.png').is_file())
if __name__=='__main__':unittest.main()
