# Preservation baseline: verified 8 October release, before evidence corrections.
# Earlier migration commits are unavailable; this checks release content, not historical migration provenance.
import sys,unittest,re,subprocess,collections,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from improve_article_endings import ROOT,load_rows,apply
from apply_field_manual import parse
from accommodation_baseline import approved_baseline
class ArticleEndingTests(unittest.TestCase):
 def test_one_checklist_and_one_verified_action_at_the_end(self):
  rows=load_rows();self.assertEqual(len(rows),130)
  for slug,row in rows.items():
   path=ROOT/'articles'/slug/'index.html';s=path.read_text();e=parse(s)
   endings=[n for n in e.nodes if 'article-ending' in e.classes(n)];self.assertEqual(len(endings),1,slug)
   ending=endings[0];body=next(n for n in e.nodes if 'article-body' in e.classes(n))
   self.assertTrue(body['inner']<=ending['start']<ending['end']<=body['end'],slug)
   later=[n for n in e.nodes if n['parent'] is body and n['start']>ending['start']]
   self.assertTrue(all('article-feedback' in e.classes(n) for n in later),slug)
   anchors=[n for n in e.nodes if ending['inner']<=n['start']<ending['end'] and n['tag']=='a'];self.assertEqual(len(anchors),1,slug)
   self.assertEqual(anchors[0]['attrs']['href'],row['next']['url'])
   ul=next(n for n in e.nodes if ending['inner']<=n['start']<ending['end'] and 'article-completion-checklist' in e.classes(n))
   self.assertEqual(len([n for n in e.nodes if n['parent'] is ul and n['tag']=='li']),4)
   self.assertTrue(all(len(t)>20 for t in row['checklist']))
   url=row['next']['url'];target,_,fragment=url.partition('#');dest=ROOT/target.lstrip('/') if target else path
   self.assertTrue(dest.is_file(),url)
   if fragment:self.assertIn('id="'+fragment+'"',dest.read_text(),url)
   self.assertNotIn('class="reader-next"',s)
 def test_reapply_and_source_preservation(self):
  for slug,row in load_rows().items():
   path=ROOT/'articles'/slug/'index.html';s=path.read_text();self.assertEqual(apply(s,row),s,slug)
   old=subprocess.check_output(['git','show','6f8f6f6f9324c83b3c63e915ac31a633bdf31d53:'+str(path.relative_to(ROOT))],cwd=ROOT,text=True)
   first=apply(old,row);self.assertEqual(apply(first,row),first,slug)
   old=approved_baseline(old,slug)
   for pattern in [r'<pre\b[^>]*>.*?</pre>',r'<td\b[^>]*>.*?</td>',r'<img\b(?![^>]*class="series-banner-art")[^>]*>']:
    self.assertEqual(re.findall(pattern,old,re.S),re.findall(pattern,s,re.S),slug)
   before=set(re.findall(r'\bid="([^"]+)"',old));after=re.findall(r'\bid="([^"]+)"',s)
   self.assertTrue(before<=set(after),str((slug,before-set(after))))
   old_counts=collections.Counter(re.findall(r'\bid="([^"]+)"',old));new_counts=collections.Counter(after)
   self.assertTrue(all(count<=max(1,old_counts[key]) for key,count in new_counts.items()),slug)
 def test_track_b_continues_in_order(self):
  rows=load_rows();numbers={}
  manifest=json.loads((ROOT/'content/series-banners.json').read_text())
  for row in manifest['articles']:
   if row['design']=='hotel-apartment-excellence' and row.get('number'):
    numbers[row['number']]=row['url'].split('/')[2]
  self.assertEqual(len(numbers),26)
  for n in range(1,26):self.assertEqual(rows[numbers[n]]['next']['url'],'/articles/'+numbers[n+1]+'/index.html')
  self.assertEqual(rows[numbers[26]]['next']['kind'],'apply')
