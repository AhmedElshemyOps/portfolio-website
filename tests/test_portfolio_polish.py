import unittest,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PortfolioPolishTests(unittest.TestCase):
 def test_carousel_contains_each_original_article_once(self):
  page=(ROOT/'index.html').read_text();data=json.loads(re.search(r'id="homepage-article-data">(.*?)</script>',page,re.S)[1]);registry=json.loads((ROOT/'content/article-registry.json').read_text());urls=[x['url'] for x in data]
  self.assertEqual(len(urls),len(set(urls)));self.assertEqual(set(urls),{x['url'] for x in registry if x['type']=='Article'});self.assertEqual(len(urls)%4,0);self.assertEqual(len({x['pillar'] for x in data[:4]}),4)
 def test_legacy_topic_filter_and_evidence_dates(self):
  page=(ROOT/'knowledge/index.html').read_text();self.assertIn('value="Hotel &amp; Serviced Apartment AI">AI for Hotel Apartments</option>',page)
  profile=json.loads((ROOT/'content/professional-profile.json').read_text());self.assertEqual(profile['certifications'][0]['date'],'26 April 2024 - 26 April 2027')
  for c in profile['certifications']+profile['iata']:
   if c.get('evidence_url'):self.assertTrue((ROOT/c['evidence_url'].lstrip('/')).is_file())
if __name__=='__main__':unittest.main()
