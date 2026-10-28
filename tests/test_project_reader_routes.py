"""Protect scan-friendly project evidence and the existing reader journeys."""
import json,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from apply_field_manual import parse
from clean_article_openings import text
from render_shared import render

class ProjectReaderRoutes(unittest.TestCase):
 def test_project_facts_precede_artwork_and_keep_the_evidence_boundary(self):
  for row in json.loads((ROOT/'content/projects.json').read_text()):
   p=ROOT/row['caseStudy'].lstrip('/');s=p.read_text();d=parse(s)
   summaries=[n for n in d.nodes if 'project-summary' in d.classes(n)]
   self.assertEqual(len(summaries),1,p);summary=summaries[0]
   labels=[text(s,n) for n in d.nodes if n['tag']=='dt' and summary['inner']<=n['start']<summary['end']]
   self.assertEqual(labels,['Problem','My contribution','Outputs','Evidence and scope'])
   preview=next(n for n in d.nodes if n['attrs'].get('id')=='project-output-preview')
   self.assertLess(summary['end'],preview['start'])
   self.assertNotIn('My contribution:',s[preview['start']:preview['end']])
   self.assertIn('Production results have not been established.',text(s,summary))
   self.assertTrue(any(n['tag']=='a' and n['attrs'].get('href')==row['demo'] and summary['inner']<=n['start']<summary['end'] for n in d.nodes))
   self.assertTrue(any(n['tag']=='details' and n['attrs'].get('id')=='product-research' for n in d.nodes))
 def test_exactly_three_goals_use_existing_destinations_and_correct_article_counts(self):
  starts=json.loads((ROOT/'content/reader-starts.json').read_text())
  self.assertEqual([r['title'] for r in starts],['Tourism Operations','MICE & Events','Tourism Product Support'])
  self.assertEqual(len({r['url'] for r in starts}),3)
  for rel in ['knowledge/index.html','learning/index.html']:
   s=(ROOT/rel).read_text();d=parse(s);cards=[n for n in d.nodes if 'reader-start-card' in d.classes(n)]
   self.assertEqual(len(cards),3)
   self.assertEqual([n['attrs']['href'] for n in cards],[r['url'] for r in starts])
   for card in cards:self.assertTrue((ROOT/card['attrs']['href'].lstrip('/')).is_file())
  s=(ROOT/'index.html').read_text();d=parse(s)
  nav=next(n for n in d.nodes if n['attrs'].get('aria-label')=='Choose a learning route')
  self.assertEqual([n['attrs']['href'] for n in d.nodes if n['tag']=='a' and nav['inner']<=n['start']<nav['end']],[r['url'] for r in starts])
 def test_specialist_paths_and_progress_pages_remain_reachable(self):
  paths=json.loads((ROOT/'content/learning-paths.json').read_text());s=(ROOT/'learning/index.html').read_text();d=parse(s)
  links={n['attrs'].get('href') for n in d.nodes if n['tag']=='a'}
  for row in paths:
   url='/learning/'+row['slug']+'/index.html';self.assertIn(url,links)
   page=(ROOT/url.lstrip('/')).read_text();self.assertIn('data-learning-path="'+row['slug']+'"',page)
  schema=next(json.loads(s[n['inner']:n['end']-9]) for n in d.nodes if n['tag']=='script' and n['attrs'].get('type')=='application/ld+json')
  self.assertEqual(schema['numberOfItems'],6)
 def test_full_library_search_and_filters_stay_outside_collapsed_browse_options(self):
  s=(ROOT/'knowledge/index.html').read_text();d=parse(s)
  browse=next(n for n in d.nodes if n['attrs'].get('id')=='reader-browse-all')
  self.assertEqual(browse['tag'],'details');self.assertNotIn('open',browse['attrs'])
  categories=[n for n in d.nodes if 'taxonomy-category' in d.classes(n)]
  self.assertEqual(len(categories),5)
  self.assertTrue(all(browse['inner']<=n['start']<browse['end'] for n in categories))
  series=next(n for n in d.nodes if 'knowledge-series' in d.classes(n))
  self.assertTrue(browse['inner']<=series['start']<series['end'])
  from bundle_page_styles import unpack
  from knowledge_taxonomy import render_hub
  raw=unpack(s);self.assertEqual(render_hub(ROOT,json.loads((ROOT/'content/article-registry.json').read_text()),raw),raw)
  query=next(n for n in d.nodes if 'data-knowledge-query' in n['attrs']);self.assertGreater(query['start'],browse['end'])
  cards=[n for n in d.nodes if 'data-knowledge-card' in n['attrs']]
  self.assertEqual(len(cards),len(json.loads((ROOT/'content/article-registry.json').read_text())))
 def test_shared_renderer_is_stable_for_all_seven_updated_pages(self):
  routes=['index.html','knowledge/index.html','learning/index.html']+[r['caseStudy'].lstrip('/') for r in json.loads((ROOT/'content/projects.json').read_text())]
  for route in routes:
   p=ROOT/route;s=p.read_text();self.assertEqual(render(s,p),s,route)
