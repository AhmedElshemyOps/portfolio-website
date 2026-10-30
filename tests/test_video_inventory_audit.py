"""Check complete video coverage and distinguish expected limitations from regressions."""
import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from check_article_videos import check, exit_code

class VideoInventoryAudit(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.root=Path(self.temp.name)
        for p in ['content','articles/example','learn/videos']:(self.root/p).mkdir(parents=True)
        self.ids=['aaaaaaaaaaa','bbbbbbbbbbb','ccccccccccc']
        self.inventory=[{'videoId':v,'privacyStatus':'public','embedStatus':'unavailable' if i==2 else 'available'} for i,v in enumerate(self.ids)]
        self.matches=[{'videoId':self.ids[0],'article':'articles/example/index.html','afterParagraph':'Original explanation.'}]
        self.write()
        (self.root/'articles/example/index.html').write_text('<p>Original explanation.</p><figure><div><iframe src="https://www.youtube-nocookie.com/embed/aaaaaaaaaaa"></iframe></div></figure>')
        self.library='<iframe src="https://www.youtube-nocookie.com/embed/bbbbbbbbbbb"></iframe>'+''.join('<a href="https://www.youtube.com/watch?v='+v+'">Watch</a>' for v in self.ids)
        (self.root/'learn/videos/index.html').write_text(self.library)

    def write(self):
        (self.root/'content/youtube-videos.json').write_text(json.dumps({'videos':self.inventory}))
        (self.root/'content/article-video-matches.json').write_text(json.dumps(self.matches))

    def test_all_public_videos_checked_once_and_no_writes(self):
        before={str(p):p.read_bytes() for p in self.root.rglob('*') if p.is_file()};calls=[]
        def lookup(v):calls.append(v);return ('unavailable' if v==self.ids[2] else 'available','fixture')
        result=check(self.root,True,lookup)
        self.assertCountEqual(calls,self.ids);self.assertEqual(exit_code(result),0)
        self.assertEqual([v['destination'] for v in result['videos']],['article','library','direct-link'])
        self.assertEqual(before,{str(p):p.read_bytes() for p in self.root.rglob('*') if p.is_file()})

    def test_library_regression_fails(self):
        r=check(self.root,True,lambda v:('unavailable','fixture'))
        self.assertEqual(exit_code(r),1)
        self.assertTrue(next(v for v in r['videos'] if v['videoId']==self.ids[1])['embeddingRegression'])

    def test_unknown_is_inconclusive_not_deleted(self):
        r=check(self.root,True,lambda v:('unknown','Bot challenge'))
        self.assertEqual(exit_code(r),2);self.assertFalse(any(v['embeddingRegression'] for v in r['videos']))

    def test_recovery_reported_without_changing_inventory(self):
        r=check(self.root,True,lambda v:('available','fixture'))
        self.assertEqual(exit_code(r),0);self.assertTrue(r['videos'][2]['embeddingRecovery'])
        self.assertEqual(json.loads((self.root/'content/youtube-videos.json').read_text())['videos'][2]['embedStatus'],'unavailable')

    def test_offline_does_not_use_network(self):
        def forbidden(v):raise AssertionError('Network called')
        self.assertEqual(exit_code(check(self.root,False,forbidden)),0)

    def test_missing_or_duplicate_library_player_fails(self):
        for content in [self.library.replace('<iframe','<div').replace('</iframe>','</div>'),self.library+'<iframe src="https://www.youtube-nocookie.com/embed/bbbbbbbbbbb"></iframe>']:
            (self.root/'learn/videos/index.html').write_text(content)
            self.assertTrue(any('library player coverage' in s for s in check(self.root)['issues']))

    def test_unrecorded_private_or_disabled_article_video_fails(self):
        for value in ['private','unavailable']:
            self.inventory[0]['privacyStatus']='private' if value=='private' else 'public'
            self.inventory[0]['embedStatus']='available' if value=='private' else value
            self.write();self.assertTrue(check(self.root)['issues'])

    def test_unsafe_article_path_and_duplicate_inventory_rejected(self):
        self.matches[0]['article']='../outside.html';self.inventory.append(self.inventory[1]);self.write()
        issues=check(self.root)['issues'];self.assertTrue(any('unsafe article path' in s for s in issues));self.assertTrue(any('duplicate public inventory' in s for s in issues))

if __name__=='__main__':unittest.main()
