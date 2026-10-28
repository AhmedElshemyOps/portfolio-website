"""The retired contact pitches must not return through shared/profile rendering."""
from pathlib import Path
import sys
import unittest
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from remove_contact_sections import render
from render_shared import pages
from apply_field_manual import parse
class RemovedContactSections(unittest.TestCase):
 def test_all_rendered_pages_use_footer_contact_only(self):
  for p in pages():
   source=p.read_text();nodes=parse(source).nodes
   self.assertNotIn('Let’s start a conversation',source,str(p))
   self.assertFalse(any(n['tag']=='section' and n['attrs'].get('id') in {'contact','profile-contact'} for n in nodes),str(p))
   self.assertNotIn('href="/#contact"',source,str(p))
   self.assertNotIn('/assets/js/contact-actions.js',source,str(p))
   footer=next(n for n in nodes if n['tag']=='footer');chunk=source[footer['start']:footer['end']]
   for value in ['mailto:ahmed.mahmoud.nl.work@gmail.com','https://wa.me/31628895967','https://www.youtube.com/@ahmedqualityops-official']:self.assertIn(value,chunk,str(p))
   self.assertNotIn('tel:+31628895967',chunk,str(p))
 def test_removal_preserves_adjacent_content_and_links(self):
  source='<main><section id="career"><p>Keep experience</p></section><section class="contact" id="contact"><h2>Let’s start a conversation</h2></section><section id="profile-contact"><p>Retire duplicate CTA</p></section><section id="articles">Keep articles</section></main><footer id="site-footer"><a href="mailto:ahmed@example.com">Email</a></footer>'
  result=render(source)
  self.assertIn('Keep experience',result);self.assertIn('Keep articles',result);self.assertIn('mailto:ahmed@example.com',result)
  self.assertNotIn('Retire duplicate CTA',result);self.assertEqual(render(result),result)
 def test_profile_generator_does_not_recreate_section(self):
  self.assertNotIn('contact_section', (ROOT/'scripts/render_profile.py').read_text())
  self.assertNotIn('profile-contact', (ROOT/'scripts/render_profile.py').read_text())
if __name__=='__main__':unittest.main()
