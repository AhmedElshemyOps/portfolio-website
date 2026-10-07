import sys, unittest, subprocess,re
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from improve_article_visuals import migrate
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]
class ArticleVisualTests(unittest.TestCase):
 def test_caption_and_scroll_coverage(self):
  tables=figures=0
  for p in (ROOT/'articles').rglob('*.html'):
   s=p.read_text();e=parse(s)
   self.assertEqual(migrate(s),s,p)
   for n in e.nodes:
    if n['tag']=='table':
     tables+=1;self.assertEqual(n['attrs'].get('data-reading-visual'),'true')
     self.assertTrue(any(x['tag']=='caption' and x['parent'] is n for x in e.nodes),p)
     parent=n['parent'];self.assertIn('table-scroll',e.classes(parent));self.assertEqual(parent['attrs'].get('tabindex'),'0')
    if n['tag']=='figure':
     figures+=1;self.assertEqual(n['attrs'].get('data-reading-visual'),'true')
     self.assertIn('What to learn',s[n['start']:n['end']])
     self.assertIn('diagram-scroll',s[n['start']:n['end']])
  self.assertEqual((tables,figures),(170,338))
 def test_data_and_image_preservation(self):
  for p in (ROOT/'articles').rglob('*.html'):
   old=subprocess.check_output(['git','show','907c0d2:'+str(p.relative_to(ROOT))],cwd=ROOT,text=True);new=p.read_text()
   for pattern in [r'<td\b[^>]*>.*?</td>',r'<pre\b[^>]*>.*?</pre>',r'<img\b[^>]*>']:
    self.assertEqual(re.findall(pattern,old,re.S),re.findall(pattern,new,re.S),p)
