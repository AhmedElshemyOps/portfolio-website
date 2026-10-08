"""Protect the authored reservation data while repairing its table markup."""
import json
import re
import subprocess
import sys
import unittest
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from apply_field_manual import parse
from improve_article_visuals import convert_legacy_tables, migrate, text
from standardize_article_examples import standardize

SLUG = 'hotel-reservations-ai-toolkit'
PAGE = 'articles/' + SLUG + '/index.html'
BASELINE = '028a03b1ea6dec77551d30f2ff19aaee47c29c52'
EXAMPLE = SLUG + '::4-fictional-uae-case-one-booking-five-possible-failures'


class ReservationTableTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.before = subprocess.check_output(['git', 'show', BASELINE + ':' + PAGE], cwd=ROOT, text=True)
        cls.after = (ROOT / PAGE).read_text()
        cls.before_registry = json.loads(subprocess.check_output(
            ['git', 'show', BASELINE + ':content/editorial/practical-examples.json'], cwd=ROOT, text=True))
        cls.registry = json.loads((ROOT / 'content/editorial/practical-examples.json').read_text())

    def test_every_authored_cell_is_preserved_in_order(self):
        groups = re.findall(r'<pre>\|[^<>\n]*\|</pre>(?:\s*<pre>\|[^<>\n]*\|</pre>)+', self.before)
        self.assertEqual(len(groups), 4)
        expected = []
        for group in groups:
            rows = [[unescape(cell.strip()) for cell in row[1:-1].split('|')]
                    for row in re.findall(r'<pre>(.*?)</pre>', group)]
            self.assertTrue(all(re.fullmatch(r':?-{3,}:?', value) for value in rows[1]))
            expected.append([rows[0]] + rows[2:])
        document = parse(self.after)
        tables = [node for node in document.nodes if node['tag'] == 'table']
        self.assertEqual(len(tables), 4)
        actual = []
        for table in tables:
            self.assertTrue(any(node['tag'] == 'caption' and node['parent'] is table for node in document.nodes))
            actual.append([[text(self.after, cell) for cell in document.nodes
                            if cell['tag'] in ('th', 'td') and row['inner'] <= cell['start'] < row['end']]
                           for row in document.nodes if row['tag'] == 'tr' and table['inner'] <= row['start'] < table['end']])
        self.assertEqual(actual, expected)
        self.assertEqual(sum(len(row) for table in actual for row in table), 106)

    def test_all_ten_copy_prompts_and_article_links_remain_exact(self):
        original = re.findall(r'<pre\b[^>]*\bid="[^"]+"[^>]*>.*?</pre>', self.before, re.S)
        remaining = re.findall(r'<pre\b[^>]*>.*?</pre>', self.after, re.S)
        self.assertEqual(len(original), 10)
        self.assertEqual(remaining, original)
        def article_attributes(source):
            document = parse(source)
            body = next(node for node in document.nodes if 'article-body' in document.classes(node))
            return [(key, node['attrs'][key]) for node in document.nodes
                    if body['inner'] <= node['start'] < body['end']
                    for key in ('id', 'href') if key in node['attrs']]
        self.assertEqual(article_attributes(self.after), article_attributes(self.before))
        self.assertNotIn('<p>---</p>', self.after)

    def test_scenario_provenance_and_maintenance_are_preserved(self):
        old_record = dict(self.before_registry[EXAMPLE])
        new_record = dict(self.registry[EXAMPLE])
        old_html = old_record.pop('original_html')
        new_html = new_record.pop('original_html')
        self.assertEqual(new_record, old_record)
        self.assertEqual(convert_legacy_tables(old_html), new_html)
        self.assertEqual(migrate(self.after), self.after)
        self.assertEqual(standardize(self.after, SLUG, self.registry)[0], self.after)

    def test_converter_refuses_prompts_and_unrecognized_tables(self):
        examples = [
            '<pre id="copy-prompt">| KPI | What it reveals |\n|---|---|\n| Rate | Quality |</pre>',
            '<pre>| KPI | What it reveals |</pre><pre>| not a separator | text |</pre><pre>| Rate | Quality |</pre>',
            '<pre>| KPI | What it reveals |</pre><pre>|---|---|</pre><pre>| too | many | cells |</pre>',
            '<pre>| Other | Header |</pre><pre>|---|---|</pre><pre>| Rate | Quality |</pre>',
        ]
        for source in examples:
            self.assertEqual(convert_legacy_tables(source), source)


if __name__ == '__main__':
    unittest.main()
