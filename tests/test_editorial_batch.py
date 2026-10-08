import json,re,subprocess,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM,schema_nodes
MANIFEST=json.loads((ROOT/'maintenance/seo/editorial-batch-manifest.json').read_text())
class EditorialBatchTests(unittest.TestCase):
 def baseline(self,p):return subprocess.check_output(['git','show',MANIFEST['baseline_commit']+':'+str(p.relative_to(ROOT))],cwd=ROOT,text=True)
 def test_existing_routes_canonicals_and_indexing_policy_unchanged(self):
  original=set(subprocess.check_output(['git','ls-tree','-r','--name-only',MANIFEST['baseline_commit']],cwd=ROOT,text=True).splitlines());before={p for p in original if p.endswith('.html')};after={str(p.relative_to(ROOT)) for p in ROOT.rglob('*.html') if not {'.git','tests'}&set(p.parts)};self.assertEqual(before,after)
  for name in sorted(before):
   old=DOM(self.baseline(ROOT/name)).root;new=DOM((ROOT/name).read_text()).root
   def directives(d):return [(n.tag,n.attrs) for n in d.all() if n.tag=='link' and n.attrs.get('rel')=='canonical' or n.tag=='meta' and n.attrs.get('name','').lower() in ['robots','googlebot','bingbot']]
   self.assertEqual(directives(old),directives(new),name)
 def test_prompts_and_publication_dates_preserved(self):
  for p in (ROOT/'articles').glob('*/index.html'):
   old=self.baseline(p);new=p.read_text();self.assertEqual(re.findall(r'<pre\b.*?</pre>',old,re.S),re.findall(r'<pre\b.*?</pre>',new,re.S),str(p))
   self.assertEqual([n.get('datePublished') for n in schema_nodes(old)[0] if n.get('datePublished')],[n.get('datePublished') for n in schema_nodes(new)[0] if n.get('datePublished')],str(p))
 def test_collection_items_match_visible_chapter_links(self):
  for entry in MANIFEST['schema_collections']:
   p=ROOT/entry['page'];source=p.read_text();collection=next(n for n in schema_nodes(source)[0] if n.get('@type')=='CollectionPage');self.assertNotIn('headline',collection);items=collection['mainEntity']['itemListElement'];self.assertEqual(len(items),entry['visible_linked_items']);self.assertEqual([x['position'] for x in items],list(range(1,len(items)+1)))
   visible={n.attrs.get('href') for n in DOM(source).root.all('a')}
   for item in items:self.assertIn(item['url'].removeprefix('https://ahmedqualityops.com'),visible)
 def test_reviewed_scenarios_keep_assumptions_and_property_controls(self):
  controls=json.loads((ROOT/'maintenance/seo/hotel-example-controls.json').read_text())
  for slug in controls:
   source=(ROOT/'articles'/slug/'index.html').read_text();self.assertNotIn('current passenger count',source);self.assertNotIn('Assign the movement owner',source);self.assertIn('Operational teaching scenario, not a documented incident.',source)
if __name__=='__main__':unittest.main()
