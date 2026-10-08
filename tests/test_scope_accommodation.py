"""Accommodation positioning must not rewrite facts attributed to sources."""
import json
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from scope_accommodation import apply, SERIES


class AccommodationScopeTests(unittest.TestCase):
    def test_citation_protects_the_whole_paragraph(self):
        paragraph = '<p>DET reported <strong>237 recognised hotels</strong>, assessed against 19 requirements. See the <a href="https://example.org/report">official report</a>.</p>'
        self.assertEqual(apply(paragraph), paragraph)
        source = paragraph + '<p>Use a hotel reservations checklist.</p>'
        result = apply(source)
        self.assertIn(paragraph, result)
        self.assertIn('<p>Use a hotel apartment reservations checklist.</p>', result)
        self.assertEqual(apply(result), result)

    def test_published_inline_citations_retain_their_original_claims(self):
        rows = json.loads((ROOT / 'content/article-registry.json').read_text())
        count = 0
        for row in rows:
            if row['series'] not in SERIES:
                continue
            relative = row['url'].lstrip('/')
            before = subprocess.check_output([
                'git', 'show', '1ae9b07069cb11483b2190fc7097a24806433743:' + relative
            ], cwd=ROOT, text=True)
            after = (ROOT / relative).read_text()
            for paragraph in re.findall(r'<p\b[^>]*>.*?</p>', before, re.S):
                if re.search(r'<a\b[^>]*\bhref=[\"\']https?://', paragraph, re.I):
                    count += 1
                    self.assertIn(paragraph, after, relative)
        self.assertEqual(count, 1) # Other source references in this frozen release are plain URLs.

    def test_det_population_remains_hotels(self):
        source = (ROOT / 'articles/hotel-esg-sustainability-ai-toolkit/index.html').read_text()
        self.assertIn('DET reported 237 recognised hotels in the July 2026 third cycle', source)
        self.assertNotIn('237 recognised hotel apartments', source)
        self.assertIn('237 recognised hotels', apply(source))


if __name__ == '__main__':
    unittest.main()
