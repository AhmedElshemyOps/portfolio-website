"""Scope historical tests without replacing their original Git references."""
from functools import lru_cache
import json
from pathlib import Path
import subprocess

from historical_inventory import LATER_ARTICLES

ROOT = Path(__file__).resolve().parents[1]
PRODUCTION = '753c3a0cc6e2235201e939b840973911725dc00c'
VIDEO_AUDIT = 'e68a59f31de2245a6a08c206e9102e6484ee2ab4'
AUDIT_ADDITIONS = {
    'articles/article-abu-dhabi-mice-movement-control-room/index.html': 'bfQ-9PctjKA',
    'articles/hotel-lean-six-sigma-ai-toolkit/index.html': 'AA676Jb4ORs',
    'articles/tourism-operational-excellence-management-system/index.html': 'De_ZCkC9cGk',
}


@lru_cache(maxsize=64)
def snapshot(revision, route):
    return subprocess.check_output(['git', 'show', f'{revision}:{route}'], cwd=ROOT).decode()


def region(source, class_name):
    from apply_field_manual import parse
    return [source[n['start']:n['end']] for n in parse(source).nodes
            if class_name in parse_class(n)]


def parse_class(node):
    return node['attrs'].get('class', '').split()


def assert_custom_guide(test, path, source, *classes):
    route = path.relative_to(ROOT).as_posix()
    if route not in LATER_ARTICLES:
        return False
    original = snapshot(PRODUCTION, route)
    for css_class in ('article-body', *classes):
        test.assertEqual(region(source, css_class), region(original, css_class), route)
    return True


def before_supplement(source, route):
    """Undo only the exact insertion attested by both sides of the audit commit."""
    if route not in AUDIT_ADDITIONS:
        return source
    from apply_field_manual import parse
    published = snapshot(VIDEO_AUDIT, route)
    older = snapshot(VIDEO_AUDIT + '^', route)
    vid = AUDIT_ADDITIONS[route]
    figure, = [n for n in parse(published).nodes if n['tag'] == 'figure'
               and n['attrs'].get('data-youtube-id') == vid]
    candidates = [
        published[figure['start'] - left:figure['end'] + right]
        for left, right in ((1, 1), (1, 0), (0, 1), (0, 0))
    ]
    current_body, = region(source, 'article-body')
    published_body, = region(published, 'article-body')
    older_body, = region(older, 'article-body')
    if current_body != published_body:
        raise AssertionError(f'{route}: protected video placement or article body changed')
    for addition in candidates:
        if published_body.replace(addition, '', 1) == older_body:
            return source.replace(current_body, older_body, 1)
    raise AssertionError(f'{route}: video audit changed more than the exact inserted figure')


@lru_cache(maxsize=1)
def prior_video_matches():
    return json.loads(snapshot(VIDEO_AUDIT+'^', 'content/article-video-matches.json'))
