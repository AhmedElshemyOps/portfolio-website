#!/usr/bin/env python3
"""Render shared components into static pages, without rewriting page content.

Run after template edits. --check reports drift without modifying any files.
The homepage has its own two templates; demo app navigation is preserved.
"""
import argparse
from pathlib import Path
import re

from apply_field_manual import parse

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {'.git', 'node_modules', 'docs', 'templates'}
SHARED_CSS = '<link rel="stylesheet" href="/assets/css/site-chrome.css?v=20261008-polish"/>'
NAV_SCRIPT = '<script src="/assets/js/site-navigation.js?v=20261008-evidence"></script>'


def pages(root=ROOT):
    return sorted(p for p in root.rglob('*.html') if not set(p.relative_to(root).parts) & EXCLUDED)


def render(source, path, root=ROOT):
    if '<head' not in source:
        return source
    homepage = path == root / 'index.html'
    nodes = parse(source).nodes
    replacements = []
    shared_header = False
    shared_footer = False
    for node in nodes:
        classes = set(node['attrs'].get('class', '').split())
        name = None
        if node['tag'] == 'header':
            if homepage and 'editorial-masthead' in classes:
                name = 'home-header'
            elif 'masthead' in classes:
                name = 'header'
                shared_header = True
        elif node['tag'] == 'footer':
            if homepage and 'footer' in classes:
                name = 'home-footer'
            elif 'platform-footer' in classes:
                name = 'footer'
                shared_footer = True
        if name:
            html = (root / 'templates' / f'{name}.html').read_text().strip()
            if node['tag'] == 'header':
                # Active section derives from the existing page path; no routes change.
                group = path.relative_to(root).parts[0]
                section = '/knowledge/index.html' if group in {'articles', 'series'} else '/' + group + '/index.html'
                active = '/#top' if homepage else section
                html = html.replace(f'<a href="{active}"', f'<a href="{active}" aria-current="page"')
            replacements.append((node['start'], node['end'], html))
    for start, end, html in sorted(replacements, reverse=True):
        source = source[:start] + html + source[end:]
    # All shared assets are explicit, single references. Remove legacy entry points.
    source = re.sub(r'<link\b[^>]*href="/assets/css/(?:site-navigation|site-chrome)\.css[^\"]*"[^>]*>', '', source)
    source = re.sub(r'<script\b[^>]*src="/assets/js/site-navigation\.js[^\"]*"[^>]*>\s*</script>', '', source)
    assets = SHARED_CSS if shared_footer or shared_header else ''
    if shared_header:
        # Initialise the compact menu before the following main content is parsed.
        # Without JavaScript the navigation links remain visible.
        masthead = next(n for n in parse(source).nodes if n['tag'] == 'header' and 'masthead' in n['attrs'].get('class', '').split())
        source = source[:masthead['end']] + NAV_SCRIPT + source[masthead['end']:]
    if assets:
        source = source.replace('</head>', assets + '</head>', 1)
    from apply_library_navigation import render as render_library_navigation
    return render_library_navigation(source, path, root)


def apply(root=ROOT, check=False):
    changed = []
    for path in pages(root):
        original = path.read_text()
        updated = render(original, path, root)
        if updated != original:
            changed.append(str(path.relative_to(root)))
            if not check:
                path.write_text(updated)
    return changed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    changed = apply(check=args.check)
    if args.check and changed:
        raise SystemExit('Shared component drift:\n' + '\n'.join(changed))
    print(f'Shared components: {len(changed)} pages {"need updates" if args.check else "updated"}.')
