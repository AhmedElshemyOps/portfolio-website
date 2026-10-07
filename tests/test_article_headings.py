import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from normalize_article_headings import normalize, rows, ROOT, NUMBER
from apply_field_manual import parse
from clean_article_openings import text
class HeadingTests(unittest.TestCase):
 def test_labels_levels_and_links(self):
  s='<title>Old title | Ahmed</title><meta property="og:title" content="Old title"/><header class="article-page-header"><h1>Old title</h1></header><article class="article-body"><h2 id="01-long"><a class="heading-anchor" href="#01-long" aria-label="Link to 01. Long">#</a>01. Long</h2><section class="prompt-section"><h2 id="prompt">2. Prompt</h2><h3 id="inputs">3. Inputs</h3><pre>Keep this exactly\n\nEnd.</pre></section><h2 id="next">Next</h2></article>'
  labels={('example','@title'):'New title',('example','01-long'):'Clear section'}
  result,_=normalize(s,'example',labels)
  self.assertIn('<h1>New title</h1>',result)
  self.assertIn('<title>New title | Ahmed</title>',result)
  self.assertIn('content="New title"',result)
  self.assertIn('id="01-long"',result);self.assertIn('href="#01-long"',result)
  self.assertIn('<h3 id="prompt">Prompt</h3>',result)
  self.assertIn('<h4 id="inputs">Inputs</h4>',result)
  self.assertIn('<pre>Keep this exactly\n\nEnd.</pre>',result)
  self.assertEqual(normalize(result,'example',labels)[0],result)
 def test_all_articles_follow_the_hierarchy(self):
  labels=rows()
  for p in (ROOT/'articles').glob('*/index.html'):
   s=p.read_text();e=parse(s);body=next(n for n in e.nodes if 'article-body' in e.classes(n))
   self.assertEqual(sum(n['tag']=='h1' for n in e.nodes),1,p)
   previous=1
   for n in e.nodes:
    if body['inner']<=n['start']<body['end'] and n['tag'] in ('h2','h3','h4','h5','h6'):
     level=int(n['tag'][1]);label=text(s,n)
     self.assertLessEqual(level,previous+1,p)
     self.assertFalse(NUMBER.match(label),p)
     self.assertLessEqual(len(label),100,p)
     previous=level
   self.assertEqual(normalize(s,p.parent.name,labels)[0],s,p)
