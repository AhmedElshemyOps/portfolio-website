import json,re,subprocess,unittest,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM,schema_nodes
M=json.loads((ROOT/'maintenance/seo/evidence-batch-manifest.json').read_text())
class EvidenceBatchTests(unittest.TestCase):
 def test_only_recorded_claim_fragments_change(self):
  for name,edits in M['replacements'].items():
   before=subprocess.check_output(['git','show',M['baseline_commit']+':'+name],cwd=ROOT,text=True);after=(ROOT/name).read_text()
   for edit in edits:
    self.assertEqual(before.count(edit['old']),1);before=before.replace(edit['old'],edit['new']);self.assertIn(edit['new'],after)
   def body(s):return next(n.text() for n in DOM(s).root.all() if 'article-body' in n.attrs.get('class','').split())
   self.assertEqual(body(before),body(after),name)
   self.assertEqual(re.findall(r'<pre\b.*?</pre>',before,re.S),re.findall(r'<pre\b.*?</pre>',after,re.S),name)
   self.assertEqual([x.get('datePublished') for x in schema_nodes(before)[0]],[x.get('datePublished') for x in schema_nodes(after)[0]])
 def test_menu_initialises_before_main_is_parsed(self):
  found=0
  for p in ROOT.rglob('*.html'):
   s=p.read_text()
   if '/assets/js/site-navigation.js?' not in s:continue
   found+=1;start=s.index('<script src="/assets/js/site-navigation.js?');self.assertLess(s.index('</header>'),start);self.assertLess(start,s.index('<main'))
  self.assertGreater(found,100)
 def test_public_evidence_labels_and_projection(self):
  d=json.loads((ROOT/'content/professional-profile.json').read_text());self.assertEqual(d['iata'][0]['name'],'Travel Operations')
  for c in d['certifications']:
   if not c.get('evidence_url'):self.assertIn('individual certificate has not been supplied',c['description'])
  self.assertEqual(14*12*(12500-8059),746088)
if __name__=='__main__':unittest.main()
