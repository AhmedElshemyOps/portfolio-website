import hashlib,json,re,subprocess,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from apply_field_manual import parse
from render_premium_ai_toolkit import plain
class ToolkitIntegrationTests(unittest.TestCase):
 def test_all_articles_have_top_glossary_and_original_sources(self):
  pages=list((ROOT/'articles').glob('*/index.html'))
  self.assertEqual(len(pages),130)
  for p in pages:
   s=p.read_text();nodes=parse(s).nodes
   glossary=[n for n in nodes if 'article-glossary' in n['attrs'].get('class','').split()]
   body=next(n for n in nodes if 'article-body' in n['attrs'].get('class','').split())
   self.assertEqual(len(glossary),1,str(p));self.assertLess(glossary[0]['start'],body['start'],str(p))
   old=subprocess.check_output(['git','show','HEAD:'+p.relative_to(ROOT).as_posix()],cwd=ROOT,text=True)
   previous=next((n for n in parse(old).nodes if 'article-glossary' in n['attrs'].get('class','').split()),None)
   if previous:
    self.assertEqual(old[previous['inner']:previous['end']],s[glossary[0]['inner']:glossary[0]['end']],str(p))
   self.assertEqual(re.findall(r'<pre\b.*?</pre>',old,re.S),re.findall(r'<pre\b.*?</pre>',s,re.S),str(p))
 def test_inventory_matches_original_prompt_sources(self):
  rows=json.loads((ROOT/'content/editorial/ai-prompt-toolkits.json').read_text())
  self.assertEqual(len(rows),385);self.assertEqual(len({r['articleId'] for r in rows}),47)
  for slug in {r['articleId'] for r in rows}:
   s=(ROOT/'articles'/slug/'index.html').read_text();nodes=parse(s).nodes
   cards=[n for n in nodes if 'data-ai-toolkit' in n['attrs']]
   self.assertEqual(len(cards),sum(r['articleId']==slug for r in rows))
   ids=[n['attrs']['id'] for n in nodes if 'id' in n['attrs']]
   self.assertEqual(len(ids),len(set(ids)),slug)
   sources={hashlib.sha256(plain(s,n).encode()).hexdigest():plain(s,n) for n in nodes if n['tag']=='pre'}
   for row in [r for r in rows if r['articleId']==slug]:
    self.assertIn(row['targetId'],ids);self.assertIn(row['sourceDigest'],sources)
    self.assertLessEqual(len(row['variables']),3)
    for variable in row['variables']:self.assertEqual(sources[row['sourceDigest']].count(variable['placeholder']),1)
 def test_representative_render_is_idempotent(self):
  from render_shared import render
  for slug in ['hotel-operations-manager-ai-toolkit','amsterdam-product-discovery-03-market-gap','integrated-sop-creation-model','hotel-property-reliability-score']:
   p=ROOT/'articles'/slug/'index.html';s=p.read_text();self.assertEqual(render(s,p),s,slug)
