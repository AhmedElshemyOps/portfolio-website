import json,re,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from remove_subscription_ui import render
from prune_retired_styles import prune
from prune_generated_styles import prune as prune_bundles
from check_site_cleanup import audit

class SiteCleanupTests(unittest.TestCase):
 def test_every_public_page_and_asset_reference(self):
  report=audit(ROOT)
  self.assertEqual(report['pagesChecked'],179)
  self.assertEqual(report['articlePagesChecked'],130)
  self.assertEqual(report['missingReferences'],[])
  self.assertEqual(report['unusedGeneratedBundles'],[])
  self.assertTrue(report['passed'],[r for r in report['pages'] if r['issues']])
 def test_subscription_removal_preserves_adjacent_content_and_is_repeatable(self):
  original='<main><p>Teaching text.</p><section class="newsletter-signup"><form data-newsletter-form><input type="email"></form></section><p>Next section.</p><ul><li><a href="/newsletter/index.html">Newsletter</a></li><li><a href="/knowledge/index.html">Read</a></li></ul></main><script src="/assets/js/newsletter.js?v=old"></script>'
  new=render(original)
  self.assertIn('<p>Teaching text.</p>',new);self.assertIn('<p>Next section.</p>',new);self.assertIn('href="/knowledge/index.html"',new)
  self.assertNotIn('newsletter',new);self.assertEqual(render(new),new)
 def test_retired_routes_are_noindex_redirects_and_no_service_is_configured(self):
  for rel in ['newsletter/index.html','newsletter/confirmed/index.html']:
   source=(ROOT/rel).read_text();self.assertIn('noindex,follow',source);self.assertIn('0;url=/knowledge/index.html',source);self.assertNotIn('<form',source)
  config=(ROOT/'assets/js/site-config.js').read_text()
  for value in ['newsletterFormUrl','newsletterEndpoint','sibforms.com']:self.assertNotIn(value,config)
  self.assertFalse((ROOT/'assets/js/newsletter.js').exists())
 def test_css_cleanup_preserves_live_branches_media_and_strings(self):
  css='/* old .newsletter-signup */.live,.newsletter-signup{color:red}@media(max-width:600px){.newsletter-signup{display:block}.live,:is(.article-growth,.live-card){color:blue}}.label::after{content:"}"}'
  new=prune(css)
  self.assertIn('.live{color:red}',new);self.assertIn(':is(.live-card)',new);self.assertIn('@media(max-width:600px)',new);self.assertIn('content:"}"',new)
  self.assertNotIn('.newsletter-signup{',new);self.assertEqual(prune(new),new)
 def test_only_unreferenced_hashed_bundles_are_pruned(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);folder=root/'assets/css/generated';folder.mkdir(parents=True)
   live=folder/'page-111111111111.css';dead=folder/'page-222222222222.css';other=folder/'hand-authored.css'
   for p in (live,dead,other):p.write_text('body{color:black}')
   (root/'index.html').write_text('<link href="/assets/css/generated/page-111111111111.css">')
   removed=prune_bundles(root)
   self.assertEqual([r['path'] for r in removed],['assets/css/generated/page-222222222222.css']);self.assertTrue(live.exists());self.assertTrue(other.exists())
if __name__=='__main__':unittest.main()
