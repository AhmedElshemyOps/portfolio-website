import json
from pathlib import Path
import sys
import unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from apply_field_manual import parse
from render_shared import render
from render_reader_enhancements import render as enhance
from check_article_videos import check,availability

class ReaderEnhancements(unittest.TestCase):
 def test_every_shared_footer_has_channel_and_local_top_target(self):
  from render_shared import pages
  count=0
  for p in pages():
   source=p.read_text();nodes=parse(source).nodes
   footer=next((n for n in nodes if n['tag']=='footer' and 'platform-footer' in n['attrs'].get('class','').split()),None)
   if not footer:continue
   count+=1;chunk=source[footer['start']:footer['end']]
   self.assertEqual(chunk.count('https://www.youtube.com/@ahmedqualityops-official'),3,str(p))
   youtube=next(n for n in parse(chunk).nodes if 'footer-youtube' in n['attrs'].get('class','').split())
   self.assertEqual(youtube['attrs']['aria-label'],'YouTube channel (opens in a new tab)')
   import re
   self.assertEqual(re.sub('<[^>]+>','',chunk[youtube['inner']:youtube['end']]).strip(),'YouTube channel')
   top=next(n for n in parse(chunk).nodes if 'footer-back-top' in n['attrs'].get('class','').split())
   self.assertTrue(any(n['attrs'].get('id')==top['attrs']['href'][1:] for n in nodes),str(p))
  self.assertGreater(count,170)
 def test_hub_badges_and_formats_match_manifest(self):
  urls={'/'+m['article'] for m in json.loads((ROOT/'content/article-video-matches.json').read_text())}
  source=(ROOT/'knowledge/index.html').read_text();nodes=parse(source).nodes
  self.assertTrue(any(n['attrs'].get('data-knowledge-filter')=='format' for n in nodes))
  for card in [n for n in nodes if 'data-knowledge-card' in n['attrs']]:
   chunk=source[card['start']:card['end']];link=next(n for n in parse(chunk).nodes if n['tag']=='a')
   self.assertEqual('knowledge-video-badge' in chunk,link['attrs']['href'] in urls)
   self.assertEqual('video' in card['attrs']['data-format'].split('|'),link['attrs']['href'] in urls)
 def test_compact_followups_keep_links_and_idempotence(self):
  path=ROOT/'articles/lean-thinking-tourism-operations/index.html'
  original='<html><head></head><body><main><header class="article-page-header"><h1>Title</h1></header><article class="article-body"><p>Original teaching text.</p><section id="article-practical-ending"><a href="/primary">Act</a></section></article><section class="library-connections" id="links"><a href="/related">Read</a></section><section class="article-growth"><a href="/learn">Learn</a></section></main><footer class="platform-footer"></footer></body></html>'
  new=enhance(original,path,ROOT)
  self.assertIn('<p>Original teaching text.</p>',new)
  for link in ['/primary','/related','/learn']:self.assertEqual(new.count('href="'+link+'"'),1)
  self.assertEqual(new.count('class="article-followups"'),1)
  self.assertEqual(enhance(new,path,ROOT),new)
  self.assertIn('Video placement reviewed:',new)
  self.assertIn('Article updated:',new)
 def test_representative_full_render_is_stable(self):
  for rel in ['index.html','knowledge/index.html','articles/lean-thinking-tourism-operations/index.html','articles/hotel-front-office-ai-toolkit/index.html']:
   p=ROOT/rel;s=p.read_text();self.assertEqual(render(s,p),s,rel)
 def test_monitor_distinguishes_unknown_and_disabled(self):
  def response(status):return lambda _: 'var ytInitialPlayerResponse = '+json.dumps({'playabilityStatus':status})+';</script>'
  self.assertEqual(availability('id',response({'playableInEmbed':True}))[0],'available')
  self.assertEqual(availability('id',response({'playableInEmbed':False}))[0],'unavailable')
  self.assertEqual(availability('id',response({'status':'LOGIN_REQUIRED','reason':'Sign in to confirm you are not a bot'}))[0],'unknown')
  self.assertEqual(availability('id',lambda _: 'blocked')[0],'unknown')
  self.assertEqual(check(ROOT)['issues'],[])
if __name__=='__main__':unittest.main()
