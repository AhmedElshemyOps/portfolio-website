"""Contracts for the shared reference-based footer, destinations and accessibility."""
from pathlib import Path
import re
import json
import sys
import unittest
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from apply_field_manual import parse
from render_shared import pages

class FooterDesign(unittest.TestCase):
 def setUp(self):
  self.source=(ROOT/'templates/footer.html').read_text();self.nodes=parse(self.source).nodes
 def test_reference_sections_and_safe_links(self):
  labels={n['attrs'].get('aria-label') for n in self.nodes if n['tag']=='nav'}
  self.assertEqual(labels,{'Footer: Learn','Footer: Resources','Footer: Projects','Footer: About','Footer: Connect','Footer: Legal and page navigation'})
  for node in self.nodes:
   if node['tag']!='a':continue
   href=node['attrs']['href'];self.assertNotEqual(href,'#')
   url=urlsplit(href)
   if href.startswith('/'):
    path=ROOT/unquote(url.path.lstrip('/'))
    if path.is_dir():path=path/'index.html'
    self.assertTrue(path.is_file(),href)
    if url.fragment:self.assertIn('id="'+unquote(url.fragment)+'"',path.read_text(),href)
   if node['attrs'].get('target')=='_blank':self.assertTrue({'noopener','noreferrer'}<=set(node['attrs'].get('rel','').split()))
  self.assertNotIn('/terms',self.source);self.assertNotIn('<form',self.source)
 def test_decorative_logo_and_icons_have_accessible_links(self):
  image=next(n for n in self.nodes if n['tag']=='img')
  self.assertEqual(image['attrs'].get('alt'),'');self.assertEqual(image['attrs'].get('width'),'58');self.assertEqual(image['attrs'].get('height'),'58')
  for node in self.nodes:
   if node['tag']=='svg':self.assertEqual(node['attrs'].get('aria-hidden'),'true')
  youtube=next(n for n in self.nodes if 'footer-youtube' in n['attrs'].get('class','').split())
  self.assertEqual(youtube['attrs']['href'],'https://www.youtube.com/@ahmedqualityops-official')
  self.assertIn('YouTube',youtube['attrs']['aria-label'])
 def test_one_component_and_working_top_target_everywhere(self):
  total=0
  for path in pages():
   s=path.read_text();nodes=parse(s).nodes
   footers=[n for n in nodes if n['tag']=='footer']
   self.assertEqual(len(footers),1,str(path));self.assertIn(self.source.strip(),s,str(path))
   self.assertEqual(sum(n['attrs'].get('id')=='page-top' for n in nodes),1,str(path));total+=1
  self.assertEqual(total,197+len(json.loads((ROOT/'content/career-routes.json').read_text())))  # Existing pages plus three additive career routes
 def test_text_palette_has_aa_contrast(self):
  def lum(color):
   rgb=[int(color[i:i+2],16)/255 for i in (1,3,5)]
   rgb=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in rgb]
   return sum(a*b for a,b in zip(rgb,[.2126,.7152,.0722]))
  for bg in ['#0c1b25','#10242e']:
   for fg in ['#eeeae2','#c0c9cf','#e8c341','#fcfaf5']:
    self.assertGreaterEqual((lum(fg)+.05)/(lum(bg)+.05),4.5,(fg,bg))
 def test_footer_has_no_legacy_style_ownership_or_scripts(self):
  self.assertNotIn('.platform-footer',(ROOT/'assets/css/site-chrome.css').read_text())
  self.assertNotIn('<script',self.source)
  css=(ROOT/'assets/css/footer.css').read_text()
  self.assertIn('prefers-reduced-motion',css);self.assertIn(':focus-visible',css)
if __name__=='__main__':unittest.main()
