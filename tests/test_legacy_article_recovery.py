import json,sys,unittest,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM
from sync_legacy_articles import sync
class LegacyRecoveryTests(unittest.TestCase):
 def test_confirmed_old_articles_keep_exact_content_and_canonical(self):
  entries=json.loads((ROOT/'maintenance/seo/active-legacy-articles.json').read_text());self.assertEqual(len(entries),18)
  approved={r['existing_legacy_path']:r['matching_current_path'] for r in json.loads((ROOT/'maintenance/seo/legacy-url-recovery-map.json').read_text())}
  sitemap={n.findtext('{*}loc') for n in ET.parse(ROOT/'sitemap.xml').getroot()}
  self.assertEqual(len({e['legacy_path'] for e in entries}),len(entries))
  for e in entries:
   with self.subTest(path=e['legacy_path']):
    self.assertEqual(approved[e['legacy_path']],e['canonical_path'])
    copy=(ROOT/e['legacy_path'].lstrip('/')).read_bytes();self.assertEqual(copy,(ROOT/e['canonical_path'].lstrip('/')).read_bytes())
    dom=DOM(copy.decode()).root;self.assertEqual([n.attrs['href'] for n in dom.all('link') if n.attrs.get('rel')=='canonical'],['https://ahmedqualityops.com'+e['canonical_path']])
    self.assertIn('https://ahmedqualityops.com'+e['canonical_path'],sitemap);self.assertNotIn('https://ahmedqualityops.com'+e['legacy_path'],sitemap)
    self.assertNotIn('http-equiv="refresh"',copy.decode().lower())
  sync(check=True)
if __name__=='__main__':unittest.main()
