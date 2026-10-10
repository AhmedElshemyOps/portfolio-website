import sys,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
from check_article_financial_examples import checks
class ArticleFinancialExamples(unittest.TestCase):
 def test_independent_arithmetic(self):
  rows=checks();self.assertGreater(len(rows),40)
  self.assertEqual([x for x in rows if not x['passCheck']],[])
  for row in rows:self.assertTrue((ROOT/row['url'].lstrip('/')).is_file())
if __name__=='__main__':unittest.main()
