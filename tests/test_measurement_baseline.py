import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from build_measurement_baseline import reconcile, register
from render_shared import is_google_verification
class MeasurementTests(unittest.TestCase):
 def test_never_combines_production_and_preview(self):
  p=dict(productionHostname='example.com',measurementId='G-TEST',propertyId='1',streamId='2',limits=[])
  source=dict(periodStart='2026-10-01',periodEnd='2026-10-28',data=[dict(hostname='example.com',measurement_id='G-TEST',account_id='1',stream_id='2',sessions=10,screen_page_views=20),dict(hostname='127.0.0.1',sessions=100,screen_page_views=200)])
  result=reconcile(source,{'data':[{'hostname':'127.0.0.1','date':'2026-10-10'}]},{'data':[]},p)
  self.assertEqual(result['production']['sessions'],10);self.assertEqual(len(result['nonProduction']),1)
  self.assertEqual(result['lastReportedNonProductionDate'],'2026-10-10')
  with self.assertRaises(ValueError):reconcile(dict(source,data=source['data']+[source['data'][0]]),{'data':[]},{'data':[]},p)
 def test_public_delivery_does_not_mean_indexed(self):
  rows=register([dict(url='https://example.com/article/',status=200,indexable_html=True,canonical=['https://example.com/article/'],in_sitemap=True),dict(url='https://example.com/saved/',status=200,indexable_html=False,robots_meta='noindex')])
  self.assertEqual(rows[0]['google_index_status'],'not_verified');self.assertEqual(rows[0]['bing_index_status'],'not_verified');self.assertEqual(rows[1]['intended_for_search'],'no')
 def test_only_exact_google_proof_is_excluded_from_page_rendering(self):
  import tempfile
  with tempfile.TemporaryDirectory() as d:
   root=Path(d);p=root/'googleabcdef1234.html';p.write_text('google-site-verification: '+p.name)
   self.assertTrue(is_google_verification(p,root));p.write_text('<h1>Do not hide an ordinary page</h1>');self.assertFalse(is_google_verification(p,root))
