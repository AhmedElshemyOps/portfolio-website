import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from simplify_article_toc import simplify, ROOT
from apply_field_manual import parse
class ContentsTests(unittest.TestCase):
 def test_prompt_and_subsection_groups_are_closed_and_linked(self):
  s='<aside class="article-toc"><details data-reader-toc open><nav><ol></ol></nav></details></aside><article class="article-body"><h2 id="method">Method</h2><h3 id="step">Step</h3><section class="prompt-intro"><h2 id="prompts">Ten prompt templates</h2></section><section class="prompt-section"><h2 id="one">Prompt one</h2><h3 id="inputs">Inputs</h3><pre>Do not change me</pre></section><h2 id="review">Review</h2></article>'
  result,_=simplify(s);e=parse(result);groups=[n for n in e.nodes if 'toc-children' in e.classes(n)]
  self.assertEqual(len(groups),2)
  self.assertTrue(all('open' not in n['attrs'] for n in groups))
  self.assertIn('href="#step"',result);self.assertIn('href="#one"',result)
  self.assertNotIn('href="#inputs"',result)
  self.assertIn('<pre>Do not change me</pre>',result)
  self.assertEqual(simplify(result)[0],result)
 def test_every_outline_has_valid_unique_targets(self):
  for p in (ROOT/'articles').glob('*/index.html'):
   s=p.read_text();e=parse(s);panels=[n for n in e.nodes if 'article-toc' in e.classes(n)]
   self.assertEqual(len(panels),1,p)
   toc=panels[0];ids={n['attrs']['id'] for n in e.nodes if n['attrs'].get('id')}
   links=[n['attrs']['href'].removeprefix('#') for n in e.nodes if toc['inner']<=n['start']<toc['end'] and 'data-toc-link' in n['attrs']]
   self.assertTrue(links,p);self.assertEqual(len(links),len(set(links)),p)
   self.assertTrue(set(links)<=ids,p)
   self.assertEqual(simplify(s)[0],s,p)
