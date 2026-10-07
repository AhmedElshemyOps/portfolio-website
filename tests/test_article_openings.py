import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from clean_article_openings import clean
class OpeningTests(unittest.TestCase):
 def test_exact_duplicate_preserves_fragments_and_unique_prose(self):
  source='<header class="article-page-header"><h1>Guide</h1><p>Short answer.</p></header><article class="article-body"><section class="answer-block" id="quick"><h2 id="principle">Principle</h2><p>Short answer.</p></section><h2>Useful method</h2><p>Unique explanation.</p><pre>Exact prompt</pre></article><aside class="article-toc"><span>2 sections</span><li><a href="#quick" data-toc-link>Answer</a></li><li><a href="#method" data-toc-link>Method</a></li></aside>'
  result,removed=clean(source)
  self.assertEqual(removed,['Short answer.'])
  self.assertEqual(result.count('Short answer.'),1)
  self.assertIn('id="quick"',result);self.assertIn('id="principle"',result)
  self.assertIn('Unique explanation.',result);self.assertIn('<pre>Exact prompt</pre>',result)
  self.assertNotIn('>Answer</a>',result)
  self.assertEqual(clean(result),(result,[]))
 def test_similar_but_useful_heading_is_kept(self):
  source='<header class="article-page-header"><h1>Guide</h1><p>Summary.</p></header><article class="article-body"><h2>Guide converts signals into decisions</h2><p>Summary with extra context.</p></article>'
  self.assertEqual(clean(source),(source,[]))
 def test_numbered_duplicate_title(self):
  source='<header class="article-page-header"><h1>Guide</h1></header><article class="article-body"><h2>Article 03 — Guide</h2><p>Unique.</p></article>'
  result,removed=clean(source);self.assertEqual(removed,['Article 03 — Guide']);self.assertIn('Unique.',result)
