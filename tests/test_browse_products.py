from pathlib import Path
import unittest,re,json,tempfile,shutil,sys
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from article_catalogue import refresh
class BrowseProducts(unittest.TestCase):
 def test_topics_and_search_survive_catalogue_refresh(self):
  with tempfile.TemporaryDirectory() as directory:
   root=Path(directory);shutil.copytree(ROOT/'content',root/'content');shutil.copytree(ROOT/'knowledge',root/'knowledge')
   registry=json.loads((root/'content/article-registry.json').read_text());refresh(root,registry)
   first=(root/'knowledge/index.html').read_text();refresh(root,registry)
   self.assertEqual(first,(root/'knowledge/index.html').read_text())
   self.assertEqual(first.count('data-knowledge-query'),2)
   self.assertEqual(first.count('class="topic-card"'),len({x['pillar'] for x in registry}))
   self.assertLess(first.index('class="library-topics"'),first.index('class="featured-strip"'))
   self.assertNotIn('data-knowledge-query',re.search(r'<details class="library-filter-disclosure">.*?</details>',first,re.S)[0])
 def test_products_keep_demo_routes_and_native_research(self):
  for name in ['infraquote','infracluster','infradispatch','infrasky']:
   source=(ROOT/'projects'/name/'index.html').read_text()
   hero=re.search(r'<section class="growth-hero">.*?</section>',source,re.S)[0]
   self.assertIn('Who it is for:',hero);self.assertIn('The problem:',hero);self.assertIn('Try the demo',hero)
   self.assertIn('id="product-research"',source)
   self.assertIn('browse-products.js',source)
