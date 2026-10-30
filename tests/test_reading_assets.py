"""Check that reader controls ship with their runtime styling and real webfonts."""
import struct,subprocess,sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from render_shared import pages
from bundle_page_styles import unpack
class ReadingAssetTests(unittest.TestCase):
 def test_regular_heading_font_is_genuine_compressed_woff2(self):
  data=(ROOT/'assets/fonts/lora-latin-400-normal.woff2').read_bytes()
  original=subprocess.check_output(['git','show','a1617177dfaa4d014d83b6818f514352ae8f089e:assets/fonts/lora-latin-400-normal.woff2'],cwd=ROOT)
  self.assertEqual(data[:4],b'wOF2')
  self.assertEqual(struct.unpack('>I',data[8:12])[0],len(data))
  self.assertEqual(struct.unpack('>H',data[12:14])[0],struct.unpack('>H',original[4:6])[0])
  self.assertLess(len(data),len(original)//2)
 def test_all_table_controls_have_one_shared_stylesheet(self):
  checked=0
  for path in pages(ROOT):
   source=path.read_text()
   if 'article-tables.js' not in source or '<table' not in source:continue
   styles=unpack(source)
   self.assertEqual(styles.count('href="/assets/css/article-tables.css'),1,str(path))
   checked+=1
  self.assertGreater(checked,50)
if __name__=='__main__':unittest.main()
