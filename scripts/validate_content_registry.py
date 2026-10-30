"""Read-only publication preflight; never repairs or rewrites public content."""
import argparse
from datetime import date
from html.parser import HTMLParser
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://ahmedqualityops.com'


class Canonicals(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.urls = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and 'canonical' in attrs.get('rel', '').lower().split():
            self.urls.append(attrs.get('href'))


def validate(root, registry, check_files=True):
    """Validate shapes and bounded paths before existing taxonomy/series validation.

    Series overview routes remain independent of IDs; existing /series/ URLs must
    never be inferred from slugs. Missing optional overview statistics are valid.
    """
    if not isinstance(registry, list) or not registry:
        raise ValueError('Registry must be a nonempty list')
    for i, row in enumerate(registry):
        label = f'record {i + 1}'
        if not isinstance(row, dict):
            raise ValueError(f'{label}: expected an object')
        label = row.get('id', label)
        for key in ('id', 'title', 'url', 'description', 'category', 'pillar', 'contentType'):
            if not isinstance(row.get(key), str) or not row[key].strip():
                raise ValueError(f'{label}: {key} must be nonempty text')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', row['id']):
            raise ValueError(f'{label}: invalid ID')
        if row.get('type') not in ('Article', 'Series index'):
            raise ValueError(f'{label}: unsupported content type')
        url = row['url']
        if not re.fullmatch(r'/(?:articles|series)/[a-z0-9]+(?:-[a-z0-9]+)*/index\.html', url):
            raise ValueError(f'{label}: expected a permanent /articles/ or /series/ index.html route')
        for key in ('tags', 'relatedArticles'):
            values = row.get(key)
            if not isinstance(values, list) or any(not isinstance(v, str) or not v.strip() for v in values):
                raise ValueError(f'{label}: {key} must be a list of nonempty text')
            if len(values) != len(set(values)):
                raise ValueError(f'{label}: duplicate {key}')
        for key in ('readingTime', 'wordCount'):
            value = row.get(key)
            if value is None and key == 'wordCount' and row['type'] == 'Series index':
                continue
            if isinstance(value, bool) or not isinstance(value, int) or value < (1 if key == 'readingTime' else 0):
                raise ValueError(f'{label}: invalid {key}')
        updated = row.get('updated')
        if updated is not None or row['type'] == 'Article':
            if not isinstance(updated, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', updated):
                raise ValueError(f'{label}: updated must be an ISO calendar date')
            try:
                date.fromisoformat(updated)
            except ValueError as error:
                raise ValueError(f'{label}: invalid updated calendar date') from error
        if check_files:
            path = root / url.lstrip('/')
            if not path.resolve().is_relative_to(root.resolve()) or not path.is_file():
                raise ValueError(f'{label}: missing or out-of-root article file')
            if Canonicals(path.read_text(encoding='utf-8')).urls != [BASE + url]:
                raise ValueError(f'{label}: canonical must match the existing registry URL exactly once')
    # Reuse the single controlled-vocabulary/related-reading/series authority.
    from knowledge_taxonomy import validate as validate_taxonomy
    validate_taxonomy(root, registry, check_files=check_files)
    return len(registry)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    try:
        registry = json.loads((ROOT / 'content/article-registry.json').read_text())
        count = validate(ROOT, registry)
        from render_discovery_metadata import load
        descriptions = load(ROOT)
        print(f'Content preflight passed: {count} registered destinations, {len(descriptions)} reviewed search descriptions; no files changed.')
    except (ValueError, OSError, KeyError, TypeError) as error:
        parser.exit(1, f'Content preflight failed: {error}\n')


if __name__ == '__main__':
    main()
