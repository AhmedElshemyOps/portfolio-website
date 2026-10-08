import json,re,subprocess,sys,unittest,struct
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from audit_seo import DOM,schema_nodes
from apply_field_manual import parse
from apply_library_navigation import render
BASE='https://ahmedqualityops.com';BASELINE='70c38c0ea60f9f565db0d974750173999351c3c5'
class LibraryNavigationTests(unittest.TestCase):
 def test_visible_breadcrumbs_match_schema_and_canonical(self):
  registry=json.loads((ROOT/'content/article-registry.json').read_text());self.assertEqual(len(registry),133)
  for row in registry:
   p=ROOT/row['url'].lstrip('/');s=p.read_text();d=DOM(s).root;navs=[n for n in d.all('nav') if n.attrs.get('aria-label')=='Breadcrumb'];self.assertEqual(len(navs),1,str(p));current=[n for n in navs[0].all('span') if n.attrs.get('aria-current')=='page'];self.assertEqual(len(current),1)
   crumbs=[n for n in schema_nodes(s)[0] if n.get('@type')=='BreadcrumbList'];self.assertEqual(len(crumbs),1);items=crumbs[0]['itemListElement'];self.assertEqual([x['position'] for x in items],[1,2,3]);self.assertEqual([x['item'] for x in items],[BASE+'/',BASE+'/knowledge/index.html',BASE+row['url']]);self.assertEqual(items[-1]['name'],current[0].text())
   self.assertEqual(render(s,p),s,str(p))
 def test_original_teaching_bodies_prompts_and_dates_untouched(self):
  for p in (ROOT/'articles').glob('*/index.html'):
   old=subprocess.check_output(['git','show',BASELINE+':'+str(p.relative_to(ROOT))],cwd=ROOT,text=True);new=p.read_text()
   for edit in json.loads((ROOT/'maintenance/seo/library-batch-manifest.json').read_text())['navigation_component_replacements'].get(str(p.relative_to(ROOT)),[]):old=old.replace(edit['old'],edit['new'])
   def body(s):
    n=next(n for n in parse(s).nodes if 'article-body' in n['attrs'].get('class','').split());return s[n['start']:n['end']]
   self.assertEqual(body(old),body(new),str(p))
   self.assertEqual(re.findall(r'<pre\b.*?</pre>',old,re.S),re.findall(r'<pre\b.*?</pre>',new,re.S))
   olddates=[(x.get('datePublished'),x.get('dateModified')) for x in schema_nodes(old)[0] if x.get('datePublished') or x.get('dateModified')];newdates=[(x.get('datePublished'),x.get('dateModified')) for x in schema_nodes(new)[0] if x.get('datePublished') or x.get('dateModified')];self.assertEqual(olddates,newdates,str(p))
 def test_sharing_assets_are_real_small_pngs_and_described(self):
  for row in json.loads((ROOT/'maintenance/seo/library-sharing-covers.json').read_text()):
   p=ROOT/row['image'].lstrip('/');data=p.read_bytes();self.assertEqual(data[:8],b'\x89PNG\r\n\x1a\n');self.assertEqual(struct.unpack('>II',data[16:24]),(1200,630));self.assertLess(len(data),60000)
   s=(ROOT/'articles'/row['article']/'index.html').read_text();d=DOM(s).root;meta={n.attrs.get('property',n.attrs.get('name')):n.attrs.get('content') for n in d.all('meta')};self.assertEqual(meta['og:image'],BASE+row['image']);self.assertEqual(meta['twitter:image'],meta['og:image']);self.assertTrue(meta['og:image:alt']);self.assertEqual(meta['twitter:card'],'summary_large_image')
 def test_reading_links_are_relevant_new_connections_not_duplicates(self):
  rows=json.loads((ROOT/'maintenance/seo/library-reading-connections.json').read_text());rendered=0
  for source in set(x['source'] for x in rows):
   d=DOM((ROOT/source.lstrip('/')).read_text()).root
   panels=[n for n in d.all('aside') if n.attrs.get('aria-label')=='Related reading']
   for panel in panels:
    rendered+=1
    for a in panel.all('a'):
     href=a.attrs['href'];self.assertTrue((ROOT/href.lstrip('/')).is_file());self.assertTrue(any(x['source']==source and x['target']==href for x in rows));self.assertEqual(sum(n.attrs.get('href','').split('#')[0]==href for n in d.all('a')),1)
  self.assertGreaterEqual(rendered,5)
if __name__=='__main__':unittest.main()
