import sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import audit_pages,duplicate_metadata

class SeoAuditScope(unittest.TestCase):
 def test_previews_tests_and_exact_ownership_proof_are_not_public_pages(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)
   for name,body in [('index.html','<html>Home</html>'),('docs/preview.html','<html>Preview</html>'),('tests/fixture.html','<html>Fixture</html>'),('googleabc123.html','google-site-verification: googleabc123.html'),('googleabc124.html','<html>A real page</html>')]:
    p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(body)
   self.assertEqual({p.name for p in audit_pages(root)},{'index.html','googleabc124.html'})
 def test_aliases_are_separate_but_real_collisions_remain(self):
  base=dict(status=200,title='Shared',meta_description='Shared description')
  rows=[dict(base,url='https://ahmedqualityops.com/articles/a/index.html',canonical=['https://ahmedqualityops.com/articles/a/index.html']),dict(base,url='https://ahmedqualityops.com/old-a.html',canonical=['https://ahmedqualityops.com/articles/a/index.html'])]
  titles,descs,aliases=duplicate_metadata(rows)
  self.assertEqual((titles,descs),({},{}));self.assertEqual(len(aliases),1)
  rows.append(dict(base,url='https://ahmedqualityops.com/articles/b/index.html',canonical=['https://ahmedqualityops.com/articles/b/index.html']))
  titles,descs,aliases=duplicate_metadata(rows)
  self.assertEqual(len(titles['Shared']),2);self.assertEqual(len(descs['Shared description']),2)

if __name__=='__main__':unittest.main()
