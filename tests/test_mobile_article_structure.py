import sys,unittest,subprocess,re
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from improve_mobile_reader import ROOT,migrate
from apply_field_manual import parse
class MobileArticleStructureTests(unittest.TestCase):
 def test_preferences_before_reading_and_mobile_metadata(self):
  total=0
  for p in (ROOT/'articles').rglob('*.html'):
   s=p.read_text();e=parse(s);body=next(n for n in e.nodes if 'article-body' in e.classes(n));total+=1
   controls=[n for n in e.nodes if 'reader-utilities' in e.classes(n)];self.assertEqual(len(controls),1,p)
   self.assertLess(controls[0]['start'],body['start']);self.assertEqual(controls[0]['attrs']['aria-label'],'Reading preferences')
   for action in ['increase','decrease','reset']:
    n=next(n for n in e.nodes if n['attrs'].get('data-reader-font')==action);self.assertTrue(n['attrs'].get('aria-label'))
   self.assertIn('width=device-width',s);self.assertNotIn('user-scalable=no',s)
   self.assertEqual(migrate(s),s,p)
  self.assertEqual(total,130)
 def test_prompt_text_retained(self):
  for p in (ROOT/'articles').rglob('*.html'):
   old=subprocess.check_output(['git','show','88cd667:'+str(p.relative_to(ROOT))],cwd=ROOT,text=True);new=p.read_text()
   self.assertEqual(re.findall(r'<pre\b[^>]*>.*?</pre>',old,re.S),re.findall(r'<pre\b[^>]*>.*?</pre>',new,re.S),p)

 def test_every_copy_button_has_accessible_feedback(self):
  total=0
  for p in (ROOT/'articles').rglob('*.html'):
   s=p.read_text();e=parse(s)
   for button in e.nodes:
    if 'data-copy-target' not in button['attrs']:continue
    total+=1;self.assertIn('/assets/js/article-prompts.js',s)
    card=button['parent']
    while card and not e.classes(card)&{'prompt-card','article-prompt'}:card=card['parent']
    self.assertIsNotNone(card,p)
    status=next(n for n in e.nodes if card['inner']<=n['start']<card['end'] and (e.classes(n)&{'copy-status','article-copy-status'} or 'data-copy-status' in n['attrs']))
    self.assertEqual(status['attrs'].get('aria-live'),'polite');self.assertEqual(status['attrs'].get('role'),'status')
  self.assertEqual(total,377)
