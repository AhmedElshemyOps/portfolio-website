import sys
from pathlib import Path
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from sync_hotel_prompts import ARTICLE, load_prompts, render
from validate_prompt_content import PromptParser


class PromptContentTests(unittest.TestCase):
    def test_exact_canonical_templates_survive_html_encoding(self):
        parser = PromptParser()
        parser.feed(ARTICLE.read_text())
        parser.validate()
        self.assertEqual(len(parser.targets), 10)
        for target, source in zip(parser.targets, load_prompts()):
            self.assertEqual(parser.ids[target], source['text'])

    def test_render_is_idempotent(self):
        article = ARTICLE.read_text()
        self.assertEqual(render(load_prompts(), article), article)

    def test_missing_empty_and_duplicate_templates_block_publication(self):
        fixtures = [
            '<button data-copy-target="missing"></button>',
            '<button data-copy-target="p"></button><pre id="p"> \n </pre>',
            '<button data-copy-target="p"></button><pre id="p">A</pre><pre id="p">B</pre>',
        ]
        for fixture in fixtures:
            with self.subTest(fixture=fixture):
                parser = PromptParser()
                parser.feed(fixture)
                with self.assertRaises(ValueError):
                    parser.validate()

    def test_nested_code_entities_and_line_breaks_are_preserved(self):
        parser = PromptParser()
        parser.feed('<button data-copy-target="p"></button><pre id="p"><code>H &amp; O\n[owner] &lt;limit&gt;</code></pre>')
        parser.validate()
        self.assertEqual(parser.ids['p'], 'H & O\n[owner] <limit>')


if __name__ == '__main__':
    unittest.main()
