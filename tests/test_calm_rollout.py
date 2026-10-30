"""Protect real page coverage, unique video players and narrow editorial exceptions."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from apply_field_manual import parse
from render_shared import pages
from check_redesign_preservation import check, MANIFEST


class CalmRolloutTests(unittest.TestCase):
    def test_monthly_inventory_updates_counts_without_publishing_private_uploads(self):
        from render_video_library import render
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            for name in ['index.html','templates/video-library.html.in','content/youtube-videos.json','content/article-video-matches.json']:
                p=root/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes((ROOT/name).read_bytes())
            p=root/'content/youtube-videos.json';data=json.loads(p.read_text());sample=data['videos'][0]
            data['videos'] += [dict(sample,videoId='abcdefghijk',title='Public fixture lesson'),dict(sample,videoId='12345678901',title='Private fixture lesson',privacyStatus='private')]
            p.write_text(json.dumps(data))
            html=render('',root/'learn/videos/index.html',root)
            self.assertIn('34 public lessons',html)
            self.assertIn('Public fixture lesson',html)
            self.assertNotIn('Private fixture lesson',html)

    def test_every_page_inherits_the_shared_design(self):
        paths=pages(ROOT)
        self.assertEqual(len(paths),197+len(json.loads((ROOT/'content/career-routes.json').read_text())))  # Three additive career routes; historical addresses retained
        for path in paths:
            source=path.read_text()
            body=next(n for n in parse(source).nodes if n['tag']=='body')
            self.assertIn('calm-site',body['attrs'].get('class','').split(),str(path))
            self.assertTrue('calm-design.css' in source or 'data-style-sources=' in source,str(path))

    def test_every_public_video_has_one_destination_and_no_repeated_player(self):
        inventory=json.loads((ROOT/'content/youtube-videos.json').read_text())['videos']
        players=[]
        for path in list((ROOT/'articles').glob('*/index.html'))+[ROOT/'learn/videos/index.html']:
            for n in parse(path.read_text()).nodes:
                if n['tag']=='iframe' and 'youtube' in n['attrs'].get('src',''):
                    attrs=n['attrs'];players.append(attrs['src'].split('/')[-1])
                    self.assertEqual(attrs.get('loading'),'lazy')
                    self.assertTrue(attrs.get('title'))
                    self.assertNotIn('autoplay',attrs.get('allow',''))
        self.assertEqual(Counter(players),Counter(v['videoId'] for v in inventory if v['embedStatus']=='available'))
        library=(ROOT/'learn/videos/index.html').read_text()
        for v in inventory:self.assertIn('https://www.youtube.com/watch?v='+v['videoId'],library)

    def inspect_addition(self, change):
        data=json.loads(MANIFEST.read_text());policy=json.loads((ROOT/'docs/calm-redesign/approved-additions.json').read_text());entry=policy[0]
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);p=root/entry['file'];p.parent.mkdir(parents=True);p.write_text(change((ROOT/entry['file']).read_text()))
            rule=root/'docs/calm-redesign/approved-additions.json';rule.parent.mkdir(parents=True);rule.write_text(json.dumps([entry]))
            for name in ['docs/calm-redesign/approved-footer-change.json','docs/calm-redesign/step-5/footer-baseline.html.in']:
                target=root/name;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes((ROOT/name).read_bytes())
            result=check({**data,'pages':[next(r for r in data['pages'] if r['file']==entry['file'])],'downloads':[],'footerFiles':[],'identityFiles':[]},root)
        return result

    def test_exact_approved_addition_preserves_original_article(self):
        self.assertTrue(self.inspect_addition(lambda s:s)['passed'])

    def test_changing_added_video_caption_is_rejected(self):
        result=self.inspect_addition(lambda s:s.replace('A booking can satisfy recorded requirements','A booking always satisfies recorded requirements'))
        self.assertFalse(result['passed'])

    def test_changing_original_paragraph_outside_approved_addition_is_rejected(self):
        result=self.inspect_addition(lambda s:s.replace('A professional STP is a decision instrument.','An STP is optional.'))
        self.assertFalse(result['passed'])

    def test_sitemap_exception_cannot_hide_an_old_url_change(self):
        data=json.loads(MANIFEST.read_text());row=next(d for d in data['downloads'] if d['file']=='sitemap.xml')
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);base=root/'docs/calm-redesign/step-5/sitemap-baseline.xml';base.parent.mkdir(parents=True);base.write_bytes((ROOT/'docs/calm-redesign/step-5/sitemap-baseline.xml').read_bytes())
            p=root/'sitemap.xml';p.write_bytes((ROOT/'sitemap.xml').read_bytes())
            small={**data,'pages':[],'downloads':[row],'footerFiles':[],'identityFiles':[]}
            self.assertTrue(check(small,root)['passed'])
            p.write_text(p.read_text().replace('/articles/abu-dhabi-mice-operations-series/index.html','/articles/changed-original-url/index.html'))
            self.assertFalse(check(small,root)['passed'])
