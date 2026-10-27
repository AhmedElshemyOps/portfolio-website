"""The shared finish must remain usable as articles and series evolve."""
import json,re,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from apply_field_manual import parse
from render_article_finish import render

class ArticleFinishTests(unittest.TestCase):
 def test_every_article_has_one_finish_without_repeated_destinations(self):
  for row in json.loads((ROOT/'content/article-registry.json').read_text()):
   if not row['url'].startswith('/articles/'):continue
   p=ROOT/row['url'].lstrip('/');s=p.read_text();e=parse(s)
   finish=[n for n in e.nodes if 'article-finish' in e.classes(n)]
   self.assertEqual(len(finish),1,row['id']);f=finish[0]
   self.assertFalse(any(e.classes(n)&{'article-followups','article-growth','article-sequence','series-reading-path','mice-series-navigation'} for n in e.nodes),row['id'])
   endings=[n for n in e.nodes if 'article-ending' in e.classes(n)]
   links=[n['attrs']['href'] for n in e.nodes if n['tag']=='a' and (f['start']<=n['start']<f['end'] or any(x['start']<=n['start']<x['end'] for x in endings))]
   self.assertEqual(len(links),len(set(links)),row['id'])
   self.assertLessEqual(sum('finish-card' in e.classes(n) for n in e.nodes),3,row['id'])
   from bundle_page_styles import unpack
   first=render(unpack(s),p,ROOT);self.assertEqual(render(first,p,ROOT),first,row['id'])
 def test_retired_fragment_targets_and_feedback_hooks_survive(self):
  p=ROOT/'articles/article-abu-dhabi-mice-movement-control-room/index.html';s=p.read_text();e=parse(s)
  for ident in ['continue-mice-series','library-connections','library-connections-title','article-growth-title','article-feedback','article-share-title']:
   self.assertEqual(sum(n['attrs'].get('id')==ident for n in e.nodes),1,ident)
  for hook in ['data-feedback-value','data-feedback-reason','data-feedback-status','data-share-status','data-article-mark-complete']:
   self.assertIn(hook,s)
  for link in json.loads((ROOT/'content/editorial/article-followups.json').read_text())[p.parent.name]['links']:
   self.assertIn('href="'+link['url']+'"',s)
 def test_new_publication_gets_layout_without_migration_manifest(self):
  import tempfile
  row=dict(id='new-guide',url='/articles/new-guide/index.html',title='New guide',relatedArticles=['/articles/next/index.html'],primaryCategory='Operations',subcategory='Methods')
  other=dict(id='next',url='/articles/next/index.html',title='Next guide')
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'content').mkdir();(root/'content/article-registry.json').write_text(json.dumps([row,other]));p=root/'articles/new-guide/index.html'
   original='<html><head></head><body><main><article class="article-body"><h2 id="evidence">Evidence</h2><pre>Keep every character.</pre></article></main></body></html>'
   new=render(original,p,root)
   self.assertIn('<pre>Keep every character.</pre>',new);self.assertIn('class="article-finish"',new);self.assertIn('href="/articles/next/index.html"',new)
   self.assertEqual(render(new,p,root),new)
if __name__=='__main__':unittest.main()
