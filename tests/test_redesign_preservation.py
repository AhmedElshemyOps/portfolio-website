import json,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from check_redesign_preservation import check,words,MANIFEST
class RedesignPreservationTests(unittest.TestCase):
 def setUp(self):
  self.data=json.loads(MANIFEST.read_text());self.row=next(p for p in self.data['pages'] if p['file']=='articles/hotel-operations-manager-ai-toolkit/index.html')
  self.small={**self.data,'pages':[self.row],'downloads':[],'footerFiles':[],'identityFiles':[]}
 def inspect(self,source):
  with tempfile.TemporaryDirectory() as t:
   root=Path(t);p=root/self.row['file'];p.parent.mkdir(parents=True);p.write_text(source)
   for name in ['docs/calm-redesign/approved-footer-change.json','docs/calm-redesign/step-5/footer-baseline.html.in']:
    target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((ROOT/name).read_bytes())
   return check(self.small,root)
 def test_baseline_covers_the_whole_published_site(self):
  result=check(self.data);self.assertTrue(result['passed'],result['errors']);self.assertEqual(result['pagesChecked'],178);self.assertEqual(result['articlesChecked'],130)
 def test_presentation_changes_do_not_change_protected_words(self):
  self.assertEqual(words('<p>A <strong>calm</strong> journey.</p>'),words('<p>A calm journey.</p>'))
  s=(ROOT/self.row['file']).read_text().replace('class="article-body"','class="article-body redesigned"')
  self.assertTrue(self.inspect(s)['passed'])
 def test_article_word_change_is_rejected(self):
  s=(ROOT/self.row['file']).read_text();self.assertIn('<p>The strongest use of AI',s)
  result=self.inspect(s.replace('<p>The strongest use of AI','<p>The weakest use of AI',1))
  self.assertTrue(any('wording' in e['issue'] for e in result['errors']))
 def test_removed_anchor_is_rejected(self):
  s=(ROOT/self.row['file']).read_text().replace('id="sources-and-further-reading"','id="changed-sources"')
  self.assertTrue(any(e['issue']=='missing anchors' for e in self.inspect(s)['errors']))
 def test_footer_change_is_rejected(self):
  s=(ROOT/self.row['file']).read_text().replace('All rights reserved.','Changed footer rights.')
  self.assertTrue(any(e['issue']=='footer markup changed' for e in self.inspect(s)['errors']))
 def test_missing_route_is_rejected(self):
  with tempfile.TemporaryDirectory() as t:self.assertFalse(check(self.small,Path(t))['passed'])

 def test_changed_article_link_is_rejected_even_if_its_label_is_identical(self):
  s=(ROOT/self.row['file']).read_text();old='href="https://insights.ehl.edu/hotel-operations"';self.assertIn(old,s)
  r=self.inspect(s.replace(old,'href="https://example.org/changed-source"',1))
  self.assertTrue(any(e['issue']=='article link destinations/order changed' for e in r['errors']))
 def test_changed_article_title_is_rejected(self):
  s=(ROOT/self.row['file']).read_text();s=s.replace('Hotel Apartment Operations Manager AI Toolkit','Changed Tourism Title')
  self.assertTrue(any('title/intro' in e['issue'] for e in self.inspect(s)['errors']))
 def test_download_replacement_requires_review(self):
  row=self.data['downloads'][0]
  with tempfile.TemporaryDirectory() as t:
   root=Path(t);p=root/row['file'];p.parent.mkdir(parents=True);p.write_bytes((ROOT/row['file']).read_bytes()+b' changed')
   r=check({**self.data,'pages':[],'downloads':[row],'footerFiles':[],'identityFiles':[]},root)
   self.assertFalse(r['passed'])
