import sys,unittest,json,tempfile,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from publish_article import body_html,page,publish,read_draft
class ArticlePublishing(unittest.TestCase):
 def setUp(self):
  self.meta=dict(title='Finished text test',slug='finished-text-test',description='A publication workflow test.',topic='Operational Excellence & SOPs',published='2026-10-08',updated='2026-10-08')
  self.text='## Evidence\n\nOriginal **finished** text.\n\n```\nKeep <this> exactly\n```\n\n## Evidence\n\n- One\n- Two'
 def test_safe_formatting_and_unique_headings(self):
  html,heads=body_html(self.text)
  self.assertEqual([h[0] for h in heads],['evidence','evidence-2'])
  self.assertIn('Keep &lt;this&gt; exactly',html)
  self.assertIn('<strong>finished</strong>',html)
  with self.assertRaises(ValueError):body_html('## Title\n\n[bad](javascript:alert)')
  with self.assertRaises(ValueError):body_html('## Title\n\n```\nunclosed')
 def test_existing_articles_and_all_consumers(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp)/'site';shutil.copytree(ROOT,root,ignore=shutil.ignore_patterns('.git','node_modules','__pycache__'))
   prior={p:p.read_bytes() for p in (root/'articles').glob('*/index.html')}
   target=publish(root,self.meta,self.text)
   self.assertIn('finished-text-test',target.read_text())
   for p,data in prior.items():self.assertEqual(p.read_bytes(),data)
   for name in ('article-registry.json','discovery-index.json','articles.json','article-stats.json'):
    self.assertIn('finished-text-test',(root/'content'/name).read_text())
   for name in ('knowledge/index.html','index.html','sitemap.xml','feed.xml'):
    self.assertIn('/articles/finished-text-test/index.html',(root/name).read_text())
   with self.assertRaises(ValueError):publish(root,self.meta,self.text)
   publish(root,self.meta,self.text,replace=True)
   registry=json.loads((root/'content/article-registry.json').read_text())
   self.assertEqual(sum(x['id']=='finished-text-test' for x in registry),1)
 def test_bad_slug(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'bad.md';m=dict(self.meta,slug='../escape');p.write_text('---\n'+json.dumps(m)+'\n---\n'+self.text)
   with self.assertRaises(ValueError):read_draft(p)
if __name__=='__main__':unittest.main()
