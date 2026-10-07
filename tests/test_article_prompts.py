import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from standardize_article_prompts import migrate
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]
class PromptGuideTests(unittest.TestCase):
 def test_all_guides_visible_and_ordered(self):
  total=0
  for p in (ROOT/'articles').rglob('*.html'):
   s=p.read_text();e=parse(s)
   for n in e.nodes:
    if n['attrs'].get('data-prompt-guide')!='true':continue
    total+=1;b=s[n['start']:n['end']]
    positions=[b.index(x) for x in ['When to use it','Required inputs','Complete prompt','Expected output','Human verification']]
    self.assertEqual(positions,sorted(positions),str(p))
    self.assertIn('data-copy-target',b)
    self.assertNotIn('<details',b[b.index('Complete prompt'):b.index('</pre>')])
  self.assertEqual(total,377)
 def test_idempotent(self):
  for p in (ROOT/'articles').rglob('*.html'):
   s=p.read_text();self.assertEqual(migrate(s),s,str(p))
