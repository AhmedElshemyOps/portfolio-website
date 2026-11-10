"""Verify editorial anchors, unique placements and accessible embed contracts."""
from published_fixtures import assert_custom_guide
import json
from pathlib import Path
import sys
import unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from apply_field_manual import parse
class ArticleVideos(unittest.TestCase):
 def test_existing_iframe_is_not_reinserted_or_rewritten(self):
  from tempfile import TemporaryDirectory
  from render_article_videos import render
  with TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'content').mkdir()
   relative='articles/example/index.html';vid='AA676Jb4ORs'
   (root/'content/article-video-matches.json').write_text(json.dumps([{
    'article':relative,'videoId':vid,'afterParagraph':'Keep this.',
   }]))
   source=(
    '<html><head><link rel="stylesheet" href="/assets/css/article-video.css"/></head>'
    '<body><p>Keep this.</p><figure><iframe title="Original title" loading="lazy" '
    'src="https://www.youtube-nocookie.com/embed/AA676Jb4ORs?rel=0" '
    'allow="fullscreen"></iframe></figure></body></html>'
   )
   self.assertEqual(render(source,root/relative,root),source)
   with self.assertRaisesRegex(ValueError,'confirmed embedding permission'):
    render(source.replace('www.youtube-nocookie.com','lookalike.example'),root/relative,root)
 def test_matches_are_unique_accessible_and_anchored(self):
  matches=json.loads((ROOT/'content/article-video-matches.json').read_text())
  self.assertEqual(len({(m['article'],m['videoId']) for m in matches}),len(matches))
  for m in matches:
   with self.subTest(video=m['videoId']):
    source=(ROOT/m['article']).read_text();nodes=parse(source).nodes
    frames=[n for n in nodes if n['tag']=='iframe' and m['videoId'] in n['attrs'].get('src','')]
    self.assertEqual(len(frames),1)
    if assert_custom_guide(self,ROOT/m['article'],source):continue
    attrs=frames[0]['attrs'];self.assertEqual(attrs['src'],'https://www.youtube-nocookie.com/embed/'+m['videoId'])
    self.assertEqual(attrs['title'],m['title']);self.assertEqual(attrs['loading'],'lazy')
    self.assertIn('allowfullscreen',attrs);self.assertNotIn('autoplay',attrs['allow'])
    figure=frames[0]['parent']['parent'];self.assertEqual(figure['tag'],'figure')
    self.assertNotIn(figure['parent']['tag'],['p','h2','h3','ul','ol'])
    from html import unescape
    import re
    start=figure['start']
    for sibling in reversed(nodes):
     if (sibling['parent'] is figure['parent'] and sibling['end']<=start
         and 'article-video' in sibling['attrs'].get('class','').split()
         and not source[sibling['end']:start].strip()):
      start=sibling['start']
    before=source[:start].rstrip()
    paragraph=re.search(r'<p\b[^>]*>((?:(?!<p\b).)*)</p>$',before,re.S)
    self.assertIsNotNone(paragraph)
    clean=' '.join(unescape(re.sub('<[^>]+>','',paragraph.group())).replace('#','').split())
    self.assertEqual(clean,m['afterParagraph'])
    self.assertIn('https://www.youtube.com/watch?v='+m['videoId'],source[figure['start']:figure['end']])
 def test_no_unmapped_or_duplicate_embeds(self):
  matches=json.loads((ROOT/'content/article-video-matches.json').read_text());found=[]
  for p in (ROOT/'articles').glob('*/index.html'):
   for node in parse(p.read_text()).nodes:
    if node['tag']=='iframe' and 'youtube' in node['attrs'].get('src',''):
     found.append((p.relative_to(ROOT).as_posix(),node['attrs']['src'].split('/')[-1]))
  self.assertCountEqual(found,[(m['article'],m['videoId']) for m in matches])
