import json,re,sys,unittest,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from render_series_banners import render,plain
class SeriesBannerTests(unittest.TestCase):
 def test_complete_coverage_exact_titles_and_reading_order(self):
  data=json.loads((ROOT/'content/series-banners.json').read_text());rows=data['articles'];orders=collections.defaultdict(list)
  actual={'/'+p.relative_to(ROOT).as_posix() for folder in ('articles','series') for p in (ROOT/folder).glob('*/index.html')}
  self.assertEqual({r['url'] for r in rows},actual)
  self.assertEqual(len(rows),len(actual))
  for row in rows:
   p=ROOT/row['url'].lstrip('/');s=p.read_text();heads=re.findall(r'<h1\b[^>]*>.*?</h1>',s,re.S)
   self.assertEqual(len(heads),1,row['url']);self.assertEqual(plain(heads[0]),row['title'])
   self.assertEqual(s.count('<!-- series-banner:start -->'),1);self.assertEqual(render(s,p),s)
   design=data['designs'][row['design']]
   for key in ('background','master'):
    asset=ROOT/design[key].lstrip('/');self.assertTrue(asset.is_file());self.assertEqual(asset.read_bytes()[8:12],b'WEBP')
   self.assertIn('data-series-banner="'+row['design']+'"',s)
   label=f'Article {row["number"]:02d}' if row.get('number') else row['kind']
   self.assertIn('class="series-banner-number">'+label+'<',s)
   if row.get('number'):orders[row['design']].append(row['number'])
  for design,numbers in orders.items():self.assertEqual(sorted(numbers),list(range(1,len(numbers)+1)),design)
  self.assertNotIn('rag-travel-operations',data['designs'])
 def test_artwork_layer_and_print_contrast(self):
  css=(ROOT/'assets/css/series-banners.css').read_text()
  self.assertNotIn('z-index:-1',css)
  self.assertIn('@media print{.has-series-banner .series-banner :is(h1,p){color:#000!important}}',css)
