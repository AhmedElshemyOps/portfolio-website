import re,sys,unittest
from pathlib import Path
from urllib.parse import urlsplit
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM
class ReadinessTests(unittest.TestCase):
 def test_ai_navigation_has_real_named_links(self):
  s=(ROOT/'llms.txt').read_text();self.assertTrue(s.startswith('# Ahmed Mahmoud'));self.assertIn('\n> ',s)
  links=re.findall(r'^- \[([^\]]+)\]\(([^)]+)\)',s,re.M);self.assertGreaterEqual(len(links),8)
  for name,url in links:
   self.assertTrue(name);u=urlsplit(url);self.assertEqual(u.netloc,'ahmedqualityops.com');self.assertTrue((ROOT/(u.path.lstrip('/') or 'index.html')).is_file(),url)
 def test_imported_styles_discovered_early(self):
  for route in ['index.html','profile/index.html','knowledge/index.html','projects/index.html']:
   d=DOM((ROOT/route).read_text()).root
   hints=[n.attrs for n in d.all('link') if n.attrs.get('rel')=='preload' and n.attrs.get('as')=='style']
   self.assertEqual(sum(x['href'].startswith('/assets/css/fonts.css?') for x in hints),1)
 def test_consent_privacy_link_remains_visually_distinct(self):
  self.assertIn('.analytics-consent a{color:#dfc27d;text-decoration:underline;', (ROOT/'assets/js/analytics.js').read_text())
if __name__=='__main__':unittest.main()
