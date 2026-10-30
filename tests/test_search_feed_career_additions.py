"""Keep old sitemap history stable while adding canonical career routes."""
import json,sys,tempfile,unittest,xml.etree.ElementTree as ET
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
import build_search_feeds as feeds
BASE='https://ahmedqualityops.com'
class CareerFeedAdditions(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)
        for d in ['content','maintenance/seo','articles/example','z','careers/example','docs']:(self.root/d).mkdir(parents=True)
        def page(path,canonical,date=None):
            schema={'@type':'Article' if date else 'WebPage','url':canonical}
            if date:schema['dateModified']=date
            (self.root/path).write_text('<html><head><link rel="canonical" href="'+canonical+'"><script type="application/ld+json">'+json.dumps(schema)+'</script></head><body><h1>Example</h1></body></html>')
        self.article=BASE+'/articles/example/index.html';self.z=BASE+'/z/index.html';self.new=BASE+'/careers/example/index.html'
        page('articles/example/index.html',self.article,'2026-10-14');page('z/index.html',self.z);page('careers/example/index.html',self.new)
        page('alias.html',self.article,'2000-01-01');page('docs/preview.html',self.article,'2001-01-01')
        (self.root/'content/article-registry.json').write_text(json.dumps([{'type':'Article','id':'example','url':'/articles/example/index.html','title':'Example','description':'Example guide','category':'Tourism'}]))
        (self.root/'sitemap.xml').write_text('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+self.z+'</loc></url><url><loc>'+self.article+'</loc><lastmod>2026-10-14</lastmod></url></urlset>')
    def run_build(self):
        with patch.object(feeds,'ROOT',self.root):feeds.build()
    def test_aliases_and_internal_previews_do_not_select_dates(self):
        self.run_build();root=ET.parse(self.root/'sitemap.xml').getroot()
        node=next(n for n in root if n.findtext('{*}loc')==self.article)
        self.assertEqual(node.findtext('{*}lastmod'),'2026-10-14')
        self.assertEqual(len(root),3)
    def test_order_retained_new_date_not_invented_and_second_build_stable(self):
        self.run_build();root=ET.parse(self.root/'sitemap.xml').getroot()
        self.assertEqual([n.findtext('{*}loc') for n in root],[self.z,self.article,self.new]);self.assertIsNone(root[-1].find('{*}lastmod'))
        before={name:(self.root/name).read_bytes() for name in ['sitemap.xml','feed.xml','maintenance/seo/sitemap-date-provenance.json']}
        self.run_build();self.assertEqual(before,{name:(self.root/name).read_bytes() for name in before})
if __name__=='__main__':unittest.main()
