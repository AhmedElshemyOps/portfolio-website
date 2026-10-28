import re,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from render_article_sources import render,sections,link_text
from apply_field_manual import parse
class ArticleSourceTests(unittest.TestCase):
 def test_plain_sources_are_linked_without_crossing_teaching_boundaries(self):
  p=ROOT/'articles/example/index.html'
  source='<html><head></head><body><article class="article-body"><h2 id="method">Sources of truth in practice</h2><p>Teaching.</p><h2 id="sources">Sources and further reading</h2><ul><li>Publisher, <strong>Original title</strong> (2025): https://example.org/research?a=1&amp;b=2.</li><li>[AI Authority Matrix](../AUTHORITY-MATRIX.md)</li></ul><p><strong>Evidence note:</strong> Fictional example, not measured data.</p><section class="prompt-intro"><h2 id="library">Prompt library</h2></section><section class="article-ending"><h2 id="next">Next</h2><p>Keep this.</p></section></article></body></html>'
  new=render(source,p,ROOT);e=parse(new);panel=next(n for n in e.nodes if 'article-references' in n['attrs'].get('class','').split())
  chunk=new[panel['start']:panel['end']]
  self.assertIn('href="https://example.org/research?a=1&amp;b=2"',chunk)
  self.assertIn('Original title',chunk);self.assertIn('Evidence note:',chunk)
  self.assertIn('/blob/main/AUTHORITY-MATRIX.md',chunk)
  self.assertNotIn('Prompt library',chunk);self.assertNotIn('Keep this.',chunk);self.assertNotIn('Teaching.',chunk)
  self.assertEqual(render(new,p,ROOT),new)
 def test_future_heading_without_id_gets_a_stable_accessible_target(self):
  p=ROOT/'articles/future/index.html';s='<html><head></head><body><article class="article-body"><span id="article-source-references"></span><h2>Sources and further reading</h2><ul><li>https://example.org</li></ul></article></body></html>'
  n=render(s,p,ROOT);self.assertIn('aria-labelledby="article-source-references-2"',n);self.assertIn('<h2 id="article-source-references-2">',n);self.assertEqual(render(n,p,ROOT),n)
 def test_existing_links_code_and_protocols_are_not_rewritten_unsafely(self):
  s='<a href="https://example.org">https://example.org</a><code>https://code.example</code><p>[Unsafe](javascript:alert)</p>'
  self.assertEqual(link_text(s),s)
 def test_every_authored_source_section_has_shared_style(self):
  total=0
  for p in (ROOT/'articles').glob('*/index.html'):
   s=p.read_text();found=sections(s);total+=len(found)
   for start,end,h,existing in found:
    self.assertTrue(existing,str(p));self.assertIn('article-references',s[start:s.index('>',start)],str(p))
    chunk=s[start:end]
    self.assertNotRegex(chunk,r'\]\([^)]*\.md\)')
   if found:
    from bundle_page_styles import unpack
    plain=render(unpack(s),p,ROOT);self.assertEqual(render(plain,p,ROOT),plain,str(p))
  self.assertGreaterEqual(total,50)
