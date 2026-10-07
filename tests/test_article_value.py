import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from apply_article_value import apply, load_rows, ROOT
from apply_field_manual import parse
from clean_article_openings import text
class PracticalValueTests(unittest.TestCase):
 def test_intro_and_single_block_preserve_body(self):
  s='<header class="article-page-header"><h1>Title</h1><p>Old summary.</p></header><article class="article-body"><h2 id="method">Method</h2><p>Unique explanation.</p><pre>Prompt &amp; exact spacing\n\nEND</pre></article>'
  row=dict(slug='example',problem='Missing facts & unclear ownership.',audience='Supervisors.',outcome='Plan & verify the handover.')
  result=apply(s,row)
  self.assertIn('Missing facts &amp; unclear ownership.',result)
  self.assertIn('Who this helps',result);self.assertIn('What you can do',result)
  self.assertIn('<h2 id="method">Method</h2><p>Unique explanation.</p><pre>Prompt &amp; exact spacing\n\nEND</pre>',result)
  self.assertEqual(apply(result,row),result)
  self.assertEqual(result.count('class="article-purpose"'),1)
 def test_all_editorial_pages_have_curated_openings(self):
  rows=load_rows()
  pages=[p for p in (ROOT/'articles').glob('*/index.html') if 'class="article-body"' in p.read_text()]
  self.assertEqual(set(rows),{p.parent.name for p in pages})
  for p in pages:
   s=p.read_text();e=parse(s);row=rows[p.parent.name]
   header=next(n for n in e.nodes if 'article-page-header' in e.classes(n))
   body=next(n for n in e.nodes if 'article-body' in e.classes(n))
   intro=next(n for n in e.nodes if n['tag']=='p' and n['parent'] is header)
   purpose=[n for n in e.nodes if 'article-purpose' in e.classes(n)]
   self.assertEqual(text(s,intro),row['problem'],p)
   self.assertEqual(len(purpose),1,p)
   self.assertIs(purpose[0]['parent'],body,p)
   self.assertFalse(s[body['inner']:purpose[0]['start']].strip(),p)
   self.assertIn(row['audience'],text(s,purpose[0]),p)
   self.assertIn(row['outcome'],text(s,purpose[0]),p)
