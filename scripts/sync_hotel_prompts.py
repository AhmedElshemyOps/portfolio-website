"""Render the Operations Manager templates from pinned original Markdown files.

python3 scripts/sync_hotel_prompts.py          # regenerate the ten sections
python3 scripts/sync_hotel_prompts.py --check  # reject stale or empty output
"""
import argparse
import hashlib
from html import escape, unescape
import json
import math
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content-sources/hotel-operations-manager'
ARTICLE = ROOT / 'articles/hotel-operations-manager-ai-toolkit/index.html'


def section(markdown, name):
    match = re.search(r'^## ' + re.escape(name) + r'\s*\n(.*?)(?=^## |\Z)', markdown, re.M | re.S)
    if not match or not match[1].strip():
        raise ValueError(f'Missing source section: {name}')
    return match[1].strip()


def load_prompts():
    manifest = json.loads((SOURCE / 'source.json').read_text())
    prompts = []
    for entry in manifest['prompts']:
        path = SOURCE / entry['file']
        raw = path.read_bytes()
        if hashlib.sha256(raw).hexdigest() != entry['sha256']:
            raise ValueError(f'Source checksum mismatch: {path.name}')
        markdown = raw.decode('utf-8')
        heading = re.search(r'^# Prompt (\d+) — (.+)$', markdown, re.M)
        if not heading:
            raise ValueError(f'Missing prompt heading: {path.name}')
        fences = re.findall(r'^```text\s*\n(.*?)^```\s*$', section(markdown, 'Copy-ready prompt'), re.M | re.S)
        if len(fences) != 1 or not fences[0].strip():
            raise ValueError(f'Expected one nonempty copy-ready text block: {path.name}')
        # Preserve source text and line breaks; only remove the enclosing fence newline.
        text = fences[0].removesuffix('\n')
        prompts.append(dict(number=int(heading[1]), title=heading[2], text=text,
                            use=section(markdown, 'When to use'),
                            inputs=section(markdown, 'Required inputs'),
                            outputs=section(markdown, 'Expected outputs'),
                            verification=section(markdown, 'Human verification')))
    if [p['number'] for p in prompts] != list(range(11, 21)):
        raise ValueError('Chapter 02 requires the ordered original prompts 011–020')
    return prompts


def render(prompts, original):
    result = original
    # The imported chapter also lost the reading-body wrapper, leaving prompt
    # colors and scrolling styles unapplied. Restore it around canonical content.
    if '<div class="article-body">' not in result:
        result = result.replace('<div class="article-reading-column">', '<div class="article-reading-column"><div class="article-body">', 1)
        result = result.replace('<section class="article-feedback"', '</div><section class="article-feedback"', 1)
    for index, prompt in enumerate(prompts, 1):
        # Use the existing public IDs so saved links keep working.
        pattern = r'(<section class="prompt-section"[^>]* id="prompt-' + str(index) + r'-[^"]+"[^>]*>)(.*?)(</section>)'
        match = re.search(pattern, result, re.S)
        if not match:
            raise ValueError(f'Missing article prompt section {index}')
        body = match[2]
        for key, source in [('when-to-use-it', prompt['use']), ('required-inputs', prompt['inputs']), ('expected-outputs', prompt['outputs'])]:
            if key == 'when-to-use-it':
                replacement = '<p>' + escape(source) + '</p>'
                expression = r'(<h[34] id="when-to-use-it-' + str(index) + r'"[^>]*>.*?</h[34]>)<p>.*?</p>'
            else:
                lines = [line[2:] for line in source.splitlines() if line.startswith('- ')]
                if not lines:
                    raise ValueError(f'Missing source list: {key} for {index}')
                replacement = '<ul class="compact-list">' + ''.join('<li>' + escape(line) + '</li>' for line in lines) + '</ul>'
                expression = r'(<h[34] id="' + key + '-' + str(index) + r'"[^>]*>.*?</h[34]>)<ul class="compact-list">.*?</ul>'
            body, count = re.subn(expression, lambda m: m[1] + replacement, body, count=1, flags=re.S)
            if count != 1:
                raise ValueError(f'Missing render slot: {key} for {index}')
        body, count = re.subn(r'(<pre\b[^>]*>).*?(</pre>)', lambda m: m[1] + escape(prompt['text'], quote=False) + m[2], body, count=1, flags=re.S)
        if count != 1:
            raise ValueError(f'Missing template slot {index}')
        body, count = re.subn(r'(<div class="trainer-note"><h4>Human verification</h4><strong>Professional hotel trainer’s note</strong><p>).*?(</p>)', lambda m: m[1] + escape(prompt['verification']) + m[2], body, count=1, flags=re.S)
        if count != 1:
            raise ValueError(f'Missing verification slot {index}')
        result = result[:match.start()] + match[1] + body + match[3] + result[match.end():]
    from apply_field_manual import parse
    elements = parse(result)
    narrative = next((n for n in elements.nodes if 'article-body' in elements.classes(n)), None)
    if not narrative:
        raise ValueError('Missing bounded article reading body')
    content = result[narrative['inner']:result.rfind('</', narrative['inner'], narrative['end'])]
    words = len(unescape(re.sub(r'<[^>]+>', ' ', content)).split())
    minutes = math.ceil(words / 220)
    result, count = re.subn(r'(<dt>Reading time</dt><dd>)\d+ minutes', lambda m: m[1] + str(minutes) + ' minutes', result, count=1)
    if count != 1:
        raise ValueError('Missing reading-time metadata slot')
    return result


def check(root=ROOT):
    expected = render(load_prompts(), ARTICLE.read_text())
    if expected != ARTICLE.read_text():
        raise ValueError('Operations Manager prompts differ from source; run scripts/sync_hotel_prompts.py')
    from validate_prompt_content import validate
    validate(root)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.check:
        check()
        print('Original prompts 011–020 match rendered content; copy targets are valid.')
    else:
        ARTICLE.write_text(render(load_prompts(), ARTICLE.read_text()))
        check()
        print('Restored ten original Operations Manager prompt templates.')


if __name__ == '__main__':
    main()
