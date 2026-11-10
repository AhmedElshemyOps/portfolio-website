"""Byte parity with the protected managed article renderer."""
import importlib.util
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from publish_article import page


class ManagedArticleShellParity(unittest.TestCase):
    def test_shell_and_registry_match_protected_renderer(self):
        baseline = '753c3a0cc6e2235201e939b840973911725dc00c'
        original = subprocess.check_output(
            ['git', 'show', baseline + ':scripts/publish_article.py'], cwd=ROOT
        )
        previous = importlib.util.module_from_spec(
            importlib.util.spec_from_loader('protected_publisher', loader=None)
        )
        previous.__file__ = str(ROOT / 'scripts/publish_article.py')
        exec(compile(original, previous.__file__, 'exec'), previous.__dict__)
        metadata = dict(
            title='Tourism & <quality> "notes"', slug='shell-parity',
            description='A field guide to Évora and $5 examples', topic='Tourism operations',
            published='2026-01-01', updated='2026-01-02',
        )
        for text in (
            '## Arrivals\n\nRead [the guide](/knowledge/index.html).\n\n- One\n- Two',
            '## Inputs\n\n<script>\n\n## Inputs\n\n```\n<x> & y\n```',
        ):
            with self.subTest(text=text):
                expected, expected_record = previous.page(metadata, text)
                actual, actual_record = page(metadata, text)
                self.assertEqual(actual.encode(), expected.encode())
                self.assertEqual(actual_record, expected_record)
        for renderer in (previous.page, page):
            with self.assertRaisesRegex(ValueError, 'Unsupported link'):
                renderer(metadata, '## Inputs\n\n[bad](javascript:alert)')
