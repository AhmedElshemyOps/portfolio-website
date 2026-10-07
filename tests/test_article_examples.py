import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from standardize_article_examples import standardize, load_registry, validate, FIELDS, ROOT
from apply_field_manual import parse
from clean_article_openings import text
class PracticalExampleTests(unittest.TestCase):
 def test_documented_label_needs_verified_source(self):
  row=dict(kind='documented',source='',source_verified=False,stages={k:'Review evidence.' for k in FIELDS[1:]})
  with self.assertRaises(ValueError):validate(row)
  row.update(source='Anonymised incident record INC-01, reviewed by the process owner',source_verified=True)
  validate(row)
 def test_source_facts_and_response_are_placed_in_order(self):
  source='<article class="article-body"><h2 id="case">Example: Coach departure</h2><p>A coach expects 46 delegates.</p><p>Only 42 are onboard.</p><h3 id="decision">Decision deadline</h3><p>The approved latest departure is 08:22.</p><h3 id="response">Primary response</h3><ol><li>Contact the desk lead.</li><li>Obtain approval.</li></ol><h3 id="check">Verification</h3><p>Reconcile the count with the receiving team.</p><h2 id="next">Next section</h2><pre>Exact prompt text</pre></article>'
  registry={};result,count=standardize(source,'example',registry)
  self.assertEqual(count,1);e=parse(result)
  terms=[text(result,n) for n in e.nodes if n['tag']=='dt']
  self.assertEqual(terms,list(FIELDS))
  evidence=next(n for n in e.nodes if n['tag']=='dt' and text(result,n)=='Evidence')
  decision=next(n for n in e.nodes if n['tag']=='dt' and text(result,n)=='Decision')
  self.assertIn('Only 42 are onboard.',result[evidence['end']:decision['start']])
  self.assertIn('08:22',result[decision['start']:])
  self.assertIn('<pre>Exact prompt text</pre>',result)
  self.assertIn('Illustrative scenario',result)
  self.assertEqual(standardize(result,'example',registry)[0],result)
 def test_all_rendered_examples_have_five_stages_and_valid_provenance(self):
  registry=load_registry();seen=set()
  for p in (ROOT/'articles').glob('*/index.html'):
   s=p.read_text();e=parse(s)
   for panel in [n for n in e.nodes if 'data-example-key' in n['attrs']]:
    key=panel['attrs']['data-example-key'];self.assertNotIn(key,seen,p);seen.add(key)
    validate(registry[key])
    terms=[text(s,n) for n in e.nodes if panel['inner']<=n['start']<panel['end'] and n['tag']=='dt' and n['parent']['parent']['attrs'].get('class')=='example-flow']
    self.assertEqual(terms,list(FIELDS),p)
   self.assertEqual(standardize(s,p.parent.name,registry)[0],s,p)
  self.assertEqual(len(seen),358)
