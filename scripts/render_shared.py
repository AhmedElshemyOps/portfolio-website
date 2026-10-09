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
SHARED_CSS = '<link rel="stylesheet" href="/assets/css/site-chrome.css?v=20261008-usability"/>'
NAV_SCRIPT = '<script src="/assets/js/site-navigation.js?v=20261008-navigation"></script>'


def pages(root=ROOT):
    return sorted(p for p in root.rglob('*.html') if not set(p.relative_to(root).parts) & EXCLUDED)


def render(source, path, root=ROOT):
    if '<head' not in source:
        return source
    from bundle_page_styles import unpack, pack
    source = unpack(source)
    homepage = path == root / 'index.html'
    nodes = parse(source).nodes
    replacements = []
    reader_assets = set()
    shared_header = False
    shared_footer = False
    for node in nodes:
        # Reader assets are single-entry enhancements: repeated script tags run
        # the collection/filter setup again even when the response is cached.
        asset = node['attrs'].get('src' if node['tag'] == 'script' else 'href', '')
        is_reader_load = node['tag'] == 'script' or (node['tag'] == 'link' and node['attrs'].get('rel') == 'stylesheet')
        if is_reader_load and asset.split('?')[0] in {
            '/assets/css/reader-experience.css', '/assets/js/reader-experience.js'
        }:
            key = (node['tag'], asset)
            if key in reader_assets:
                replacements.append((node['start'], node['end'], ''))
                continue
            reader_assets.add(key)
        classes = set(node['attrs'].get('class', '').split())
        name = None
        if node['tag'] == 'header':
            if homepage and 'editorial-masthead' in classes:
                name = 'home-header'
                shared_header = True
            elif 'site-header' in classes and path.relative_to(root).as_posix() in {'live-demos/infradispatch/index.html','live-demos/infrasky.html','live-demos/infraquote.html','live-demos/infracluster.html'} and 'id="siteNav"' in source:
                name = 'header'
                shared_header = True
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
                section = '/projects/index.html' if group == 'live-demos' else '/knowledge/index.html' if group in {'articles', 'series'} else '/' + group + '/index.html'
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
        masthead = next(n for n in parse(source).nodes if n['tag'] == 'header' and set(n['attrs'].get('class', '').split()) & {'masthead','editorial-masthead'})
        source = source[:masthead['end']] + NAV_SCRIPT + source[masthead['end']:]
    if assets:
        source = source.replace('</head>', assets + '</head>', 1)
    # Start imported shared styles in parallel rather than waiting for nested CSS discovery.
    for name in ['fonts', 'design-tokens']:
        source = re.sub(r'<link\b[^>]*rel="preload"[^>]*href="/assets/css/'+name+r'\.css[^\"]*"[^>]*>', '', source)
    hints = '<link rel="preload" href="/assets/css/fonts.css?v=20261008-polish" as="style"/>' if '/assets/css/launch-pages.css' in source or '/assets/css/homepage-editorial.css' in source else ''
    if '/assets/css/launch-pages.css' in source:
        hints += '<link rel="preload" href="/assets/css/design-tokens.css?v=20261008-polish" as="style"/>'
    source = source.replace('</head>', hints + '</head>', 1)
    # Native contents starts compact; desktop enhancement opens the rail without moving article text.
    source = re.sub(r'(<details\b[^>]*data-reader-toc[^>]*)\sopen(?=[\s>])', r'\1', source)
    # Version changed interaction assets so an offline cache cannot serve old controls.
    source = re.sub(r'(/assets/js/(?:discovery|article-reader)\.js)(?:\?[^"\s]*)?(?=")', r'\1?v=20261009-phase2', source)
    source = re.sub(r'(/assets/css/infraquote-bundle\.css)(?:\?[^"\s]*)?(?=")', r'\1?v=20261009-phase2', source)
    import hashlib
    def revision(match):
        asset=root/match[1].lstrip('/')
        return match[1]+'?v='+hashlib.sha256(asset.read_bytes()).hexdigest()[:12] if asset.is_file() else match[0]
    source=re.sub(r'(/assets/(?:css|js)/[^"?\s]+\.(?:css|js))(?:\?[^"\s]*)?(?=")',revision,source)
    from apply_library_navigation import render as render_library_navigation
    from render_projects import render as render_projects
    source = render_projects(source, path, root) if path.relative_to(root).as_posix() in {"index.html", "projects/index.html"} and 'class="project' in source else source
    from render_series_banners import render as render_series_banners
    return pack(render_series_banners(render_library_navigation(source, path, root), path, root),path,root)


def apply(root=ROOT, check=False):
    changed = []
    for path in pages(root):
        original = path.read_text()
        updated = render(original, path, root)
        if updated != original:
            changed.append(str(path.relative_to(root)))
            if not check:
                path.write_text(updated)
    from bundle_page_styles import write_generated
    write_generated(check=check,root=root)
    return changed


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    from build_infraquote_styles import build
    build(check=args.check)
    changed = apply(check=args.check)
    if args.check and changed:
        raise SystemExit('Shared component drift:\n' + '\n'.join(changed))
    print(f'Shared components: {len(changed)} pages {"need updates" if args.check else "updated"}.')
