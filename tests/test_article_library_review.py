import json,re,sys,unittest,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from link_article_library import audit,render

class ArticleLibraryReviewTests(unittest.TestCase):
 def test_no_isolated_articles_or_series_indexes(self):
  report=audit(ROOT)
  self.assertEqual(report['records'],133)
  self.assertEqual(report['articles'],128)
  self.assertEqual(report['no_incoming'],[])
  self.assertEqual(report['no_outgoing'],[])
 def test_reading_paths_are_bounded_and_repeatable(self):
  rows=json.loads((ROOT/'content/article-registry.json').read_text())
  known={r['url'] for r in rows}
  for row in rows:
   source=(ROOT/row['url'].lstrip('/')).read_text()
   self.assertEqual(render(source,row,rows),source,row['url'])
   blocks=re.findall(r'<section class="library-connections".*?</section>',source,re.S)
   self.assertEqual(len(blocks),1,row['url'])
   links=re.findall(r'href="([^"]+)"',blocks[0])
   self.assertTrue(1<=len(links)<=3,row['url'])
   self.assertEqual(len(links),len(set(links)))
   self.assertTrue(set(links)<=known)
   self.assertNotIn(row['url'],links)
 def test_existing_routes_anchors_and_source_urls_remain(self):
  baseline=json.loads(subprocess.check_output(['git','show','1ae9b07069cb11483b2190fc7097a24806433743:content/article-registry.json'],cwd=ROOT))
  rows=json.loads((ROOT/'content/article-registry.json').read_text())
  self.assertEqual([r['url'] for r in baseline],[r['url'] for r in rows])
  for row in rows:
   relative=row['url'].lstrip('/')
   old=subprocess.check_output(['git','show','1ae9b07069cb11483b2190fc7097a24806433743:'+relative],cwd=ROOT,text=True)
   new=(ROOT/relative).read_text()
   self.assertTrue(set(re.findall(r'id="([^"]+)"',old))<=set(re.findall(r'id="([^"]+)"',new)),relative)
   pattern=r"https?://[^\s<>\"']+"
   self.assertTrue(set(re.findall(pattern,old))<=set(re.findall(pattern,new)),relative)
