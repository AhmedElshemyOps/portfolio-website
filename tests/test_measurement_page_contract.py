import sys,json,hashlib,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM
class PageContractTests(unittest.TestCase):
 def test_all_existing_words_links_anchors_and_canonicals_unchanged(self):
  policy=json.loads((ROOT/'maintenance/measurement/preservation-contract.json').read_text())
  for relative,old in policy['pages'].items():
   with self.subTest(page=relative):
    p=ROOT/relative;self.assertTrue(p.is_file());source=p.read_text()
    if relative=='index.html':
     from render_career_routes import strip_homepage_addition
     source=strip_homepage_addition(source,ROOT)
    d=DOM(source).root
    self.assertEqual(hashlib.sha256(d.text().encode()).hexdigest(),old['visibleTextSha256'])
    self.assertEqual([n.attrs.get('href','') for n in d.all('a')],old['allLinkHrefs'])
    self.assertEqual([n.attrs['id'] for n in d.all() if 'id' in n.attrs],old['allIds'])
    self.assertEqual([n.attrs.get('href') for n in d.all('link') if n.attrs.get('rel')=='canonical'],old['canonicals'])
