import copy,json,re,sys,unittest,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from knowledge_taxonomy import validate,render_hub
from audit_seo import DOM,schema_nodes
from bundle_page_styles import unpack
class KnowledgeTaxonomyTests(unittest.TestCase):
 def setUp(self):self.rows=json.loads((ROOT/'content/article-registry.json').read_text())
 def test_controlled_metadata_and_series(self):
  t=validate(ROOT,self.rows);self.assertEqual(len(t['categories']),5)
  self.assertEqual(sum(x['type']=='Article' for x in self.rows),128)
  for sid,total in [('amsterdam-product-discovery',12),('ai-hotel-apartments',26)]:
   self.assertEqual(sorted(x['seriesPosition'] for x in self.rows if x['seriesId']==sid and x.get('seriesPosition')),list(range(1,total+1)))
  for mutate in [lambda r:r[0].update(primaryCategory='bad'),lambda r:r[0].update(tags=['invented']),lambda r:r[0].update(relatedArticles=['/missing']),lambda r:r[0].update(url=r[1]['url'])]:
   rows=copy.deepcopy(self.rows);mutate(rows)
   with self.assertRaises(ValueError):validate(ROOT,rows)
 def test_routes_canonicals_and_original_content_preserved(self):
  baseline=json.loads((ROOT/'reports/knowledge-hub-restructure/baseline.json').read_text())
  self.assertEqual(baseline['registryUrls'],[x['url'] for x in self.rows])
  self.assertEqual(baseline['articleFiles'],sorted('/'+str(p.relative_to(ROOT)) for p in (ROOT/'articles').glob('*/index.html')))
  from apply_field_manual import parse
  for row in self.rows:
   path=row['url'].lstrip('/');new=(ROOT/path).read_text();old=subprocess.check_output(['git','show',baseline['commit']+':'+path],cwd=ROOT,text=True)
   def body(s):
    n=next((n for n in parse(s).nodes if 'article-body' in n['attrs'].get('class','').split()),None)
    return s[n['start']:n['end']] if n else None
   self.assertEqual(body(old),body(new),path)
   dom=DOM(new).root;self.assertEqual([n.attrs['href'] for n in dom.all('link') if n.attrs.get('rel')=='canonical'],baseline['canonical'][row['url']])
   self.assertEqual(len([n for n in dom.all('aside') if 'knowledge-context' in n.attrs.get('class','')]),1)
   self.assertEqual(schema_nodes(new)[1],[])
 def test_hub_generated_counts_cards_and_filters(self):
  raw=(ROOT/'knowledge/index.html').read_text();s=unpack(raw);d=DOM(s).root
  cards=[n for n in d.all('article') if 'data-knowledge-card' in n.attrs];self.assertEqual(len(cards),133)
  for x in self.rows:
   card=next(n for n in cards if any(a.attrs.get('href')==x['url'] for a in n.all('a')))
   self.assertEqual(card.attrs['data-category'],x['primaryCategory']);self.assertEqual(card.attrs['data-subcategory'],x['subcategory'])
  self.assertTrue({'category','subcategory','tag','collection','pillar','series','type'}<={n.attrs.get('data-knowledge-filter') for n in d.all('select')})
  self.assertEqual(len([n for n in d.all('section') if 'taxonomy-category' in n.attrs.get('class','')]),5)
  self.assertEqual(render_hub(ROOT,self.rows,s),s)
 def test_no_orphans_and_no_private_drafts(self):
  from link_article_library import audit
  result=audit(ROOT);self.assertEqual(result['no_incoming'],[]);self.assertEqual(result['no_outgoing'],[])
  for row in self.rows:self.assertNotRegex(row['url'],r'/.*(?:rag-travel|prompt-injection)')
if __name__=='__main__':unittest.main()
