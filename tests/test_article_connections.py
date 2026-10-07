import sys,unittest,re,subprocess
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from connect_article_methods import ROOT,load_rows,apply,href
from apply_field_manual import parse
class ArticleConnectionTests(unittest.TestCase):
 def test_curated_links_and_return_paths(self):
  rows=load_rows();self.assertEqual(len(rows),26);self.assertEqual(sum(len(r['prompts']) for r in rows),78)
  reverse=set()
  for row in rows:
   s=(ROOT/'articles'/row['article']/'index.html').read_text();e=parse(s)
   for prompt in row['prompts']:
    target=href(prompt['article'],prompt['fragment']);marker=row['article']+':'+prompt['article']+':'+prompt['fragment']
    spot=next(n for n in e.nodes if n['attrs'].get('data-method-prompt')==marker)
    section=next(n for n in e.nodes if n['attrs'].get('id')==prompt['section'])
    self.assertTrue(section['inner']<=spot['start']<section['end'])
    self.assertIn(target,s[spot['start']:spot['end']]);self.assertIn(prompt['when'],s[spot['start']:spot['end']])
    cs=(ROOT/'articles'/prompt['article']/'index.html').read_text();ce=parse(cs)
    ps=next(n for n in ce.nodes if n['attrs'].get('id')==prompt['fragment'])
    block=cs[ps['start']:ps['end']];self.assertIn(href(row['article'],prompt['section']),block)
    self.assertIn('<pre',block);reverse.add((prompt['article'],prompt['fragment']))
  self.assertEqual(len(reverse),60)
 def test_added_links_resolve_and_apply_is_idempotent(self):
  rows=load_rows();concepts=0
  for path in (ROOT/'articles').rglob('*.html'):
   s=path.read_text();self.assertEqual(apply(s,path.parent.name,rows),s,path);e=parse(s)
   for n in e.nodes:
    if n['tag']!='a':continue
    p=n['parent'];managed=n['attrs'].get('data-concept-link')
    while p and not managed:
     managed=bool(p['attrs'].get('data-method-prompt') or p['attrs'].get('data-prompt-method') or 'method-prompt-list' in e.classes(p));p=p['parent']
    if not managed:continue
    url=n['attrs']['href'];local,_,fragment=url.partition('#');target=ROOT/local.lstrip('/')
    self.assertTrue(target.is_file(),url)
    if fragment:self.assertIn('id="'+fragment+'"',target.read_text(),url)
    concepts+=bool(n['attrs'].get('data-concept-link'))
  self.assertEqual(concepts,11) # Obsolete closing navigation was replaced by the single ending action.
 def test_full_prompt_text_unchanged(self):
  for p in (ROOT/'articles').rglob('*.html'):
   old=subprocess.check_output(['git','show','b26b3cc:'+str(p.relative_to(ROOT))],cwd=ROOT,text=True);new=p.read_text()
   self.assertEqual(re.findall(r'<pre\b[^>]*>.*?</pre>',old,re.S),re.findall(r'<pre\b[^>]*>.*?</pre>',new,re.S),p)
