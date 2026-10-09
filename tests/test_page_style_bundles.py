import sys,unittest,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from bundle_page_styles import pack,unpack,GENERATED
from apply_field_manual import parse
class PageStyleBundles(unittest.TestCase):
 def test_sources_recover_and_imports_are_included_once(self):
  for route in ['profile/index.html','projects/index.html','knowledge/index.html','articles/hotel-housekeeping-management-ai-toolkit/index.html']:
   p=ROOT/route;s=p.read_text();restored=unpack(s)
   self.assertNotIn('data-style-sources=',restored)
   self.assertEqual(pack(restored,p,ROOT),s)
   nodes=[n for n in parse(s).nodes if n['tag']=='link' and n['attrs'].get('rel')=='stylesheet']
   self.assertEqual(len(nodes),1,route)
   css=(ROOT/nodes[0]['attrs']['href'].lstrip('/')).read_text()
   self.assertNotIn('@import',css)
   self.assertEqual(css.count('/* assets/css/fonts.css */'),1)
   self.assertEqual(css.count('/* assets/css/design-tokens.css */'),1)
 def test_library_keeps_one_search_beside_results(self):
  s=(ROOT/'knowledge/index.html').read_text()
  self.assertEqual(s.count('data-knowledge-query'),1)
  self.assertLess(s.index('class="knowledge-browser"'),s.index('data-knowledge-query'))
  self.assertLess(s.index('data-knowledge-query'),s.index('class="knowledge-grid"'))
  self.assertLess(s.index('class="knowledge-grid"'),s.index('class="featured-strip"'))
 def test_project_actions_before_artwork(self):
  s=(ROOT/'projects/index.html').read_text()
  for card in re.findall(r'<article>.*?</article>',s,re.S):
   self.assertLess(card.index('Try the demo'),card.index('project-index-visual'))
 def test_quote_tools_preserve_identifiers(self):
  s=(ROOT/'live-demos/infraquote.html').read_text()
  for name in ['workflowTools','quoteCity','saveDraft','duplicateQuote','resetQuote','quoteForm','clientCompany']:
   self.assertEqual(s.count('id="'+name+'"'),1,name)
  self.assertIn('<details class="quote-workspace-tools">',s)
  self.assertIn('<details class="quote-draft-tools">',s)
