import copy,json,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from render_discovery_metadata import render,load,BASE
from audit_seo import DOM,schema_nodes

class DiscoveryMetadata(unittest.TestCase):
 def fixture(self,root,description):
  route='articles/example/index.html';p=root/route;p.parent.mkdir(parents=True)
  data={'@context':'https://schema.org','@type':'Article','url':BASE+'/'+route,'description':'Old description','datePublished':'2026-01-01','dateModified':'2026-02-01'}
  source='<html><head><title>Original title</title><link rel="canonical" href="'+BASE+'/'+route+'"><meta name="description" content="Old description"><meta property="og:description" content="Old description"><script type="application/ld+json">'+json.dumps(data)+'</script></head><body><h1 id="heading">Original words</h1><a href="#heading">Keep this link</a></body></html>'
  p.write_text(source);(root/'content').mkdir();(root/'content/discovery-metadata.json').write_text(json.dumps({'pages':{route:description}}))
  return p,source
 def test_head_only_changes_escape_safely_and_are_idempotent(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);description='A tourism operations guide with "quoted" context, safe controls and evidence for review. </script>'
   p,source=self.fixture(root,description);result=render(source,p,root)
   self.assertEqual(render(result,p,root),result)
   before,after=DOM(source).root,DOM(result).root
   self.assertEqual(before.text(),after.text())
   self.assertEqual([a.attrs for a in before.all('a')],[a.attrs for a in after.all('a')])
   self.assertEqual([n.attrs for n in before.all('link')],[n.attrs for n in after.all('link')])
   schema,errors=schema_nodes(result);self.assertFalse(errors)
   self.assertEqual(schema[0]['description'],description);self.assertEqual(schema[0]['datePublished'],'2026-01-01');self.assertEqual(schema[0]['dateModified'],'2026-02-01')
   self.assertEqual([n.attrs['content'] for n in after.all('meta')],[description,description])
   self.assertNotIn('review. </script>',result)
 def test_bad_manifest_paths_and_canonical_fail_without_writes(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);p,source=self.fixture(root,'An accurate tourism operations description with practical context for professional readers.')
   with self.assertRaisesRegex(ValueError,'canonical'):
    render(source.replace(BASE+'/articles/example/index.html',BASE+'/other/index.html'),p,root)
   self.assertEqual(p.read_text(),source)
   manifest=root/'content/discovery-metadata.json'
   for route in ('../index.html','articles/example/index.html?x=1','assets/file.svg'):
    manifest.write_text(json.dumps({'pages':{route:'x'*90}}))
    with self.assertRaises(ValueError):load(root)
 def test_only_demonstrated_collection_fragment_links_are_repaired(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);p=root/'articles/series/index.html';p.parent.mkdir(parents=True)
   data={'@type':'CollectionPage','url':BASE+'/articles/series/index.html','mainEntity':{'@type':'ItemList','itemListElement':[{'url':BASE+'#lesson'},{'url':BASE+'#unknown'},{'url':'https://example.com/#lesson'}]}}
   source='<link rel="canonical" href="'+BASE+'/articles/series/index.html"><h2 id="lesson">Lesson</h2><a href="#lesson">Jump</a><script type="application/ld+json">'+json.dumps(data)+'</script>'
   result=render(source,p,root);items=schema_nodes(result)[0][0]['mainEntity']['itemListElement']
   self.assertEqual(items[0]['url'],BASE+'/articles/series/index.html#lesson');self.assertEqual(items[1]['url'],BASE+'#unknown');self.assertEqual(items[2]['url'],'https://example.com/#lesson')
   self.assertEqual(render(result,p,root),result)
 def test_all_reviewed_descriptions_and_series_section_targets(self):
  descriptions=load(ROOT);self.assertEqual(len(descriptions),10)
  for route,description in descriptions.items():
   source=(ROOT/route).read_text();d=DOM(source).root
   self.assertEqual([n.attrs['content'] for n in d.all('meta') if n.attrs.get('name')=='description'],[description])
   self.assertEqual(render(source,ROOT/route,ROOT),source)
  route='articles/abu-dhabi-mice-operations-series/index.html';source=(ROOT/route).read_text();schema=schema_nodes(source)[0][0]
  self.assertEqual(len(schema['mainEntity']['itemListElement']),5)
  for item in schema['mainEntity']['itemListElement']:self.assertTrue(item['url'].startswith(BASE+'/'+route+'#'))
 def test_video_collection_matches_visible_card_order_and_destinations(self):
  source=(ROOT/'learn/videos/index.html').read_text();d=DOM(source).root
  main=next(n for n in d.all('main') if n.attrs.get('itemtype')=='https://schema.org/CollectionPage')
  groups=[n for n in main.all('section') if n.attrs.get('itemtype')=='https://schema.org/ItemList']
  cards=[n for n in d.all('article') if 'video-card' in n.attrs.get('class','').split()]
  listed=[n for group in groups for n in group.all('article') if n.attrs.get('itemprop')=='itemListElement']
  self.assertEqual(len(cards),len(listed));self.assertGreater(len(cards),0)
  self.assertEqual([n.attrs['id'] for n in cards],[n.attrs['id'] for n in listed])
  for card in listed:
   self.assertEqual(card.attrs['itemtype'],'https://schema.org/ListItem')
   self.assertEqual(card.all('h3')[0].attrs.get('itemprop'),'name')
   urls=[a for a in card.all('a') if a.attrs.get('itemprop')=='url']
   self.assertEqual(len(urls),1)
   self.assertTrue(urls[0].attrs['href'].startswith(('/articles/','https://www.youtube.com/watch?v=')))

if __name__=='__main__':unittest.main()
