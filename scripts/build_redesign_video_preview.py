"""Build an isolated video review site; never write through to production sources."""
import argparse
import csv
from html import escape
import json
from pathlib import Path
import re
import subprocess
import sys

from apply_field_manual import parse
from check_redesign_preservation import check, MANIFEST
from render_article_videos import render

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'docs/calm-redesign/step-4'
CHANNEL = 'https://www.youtube.com/@ahmedqualityops-official'


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('--output', required=True, type=Path)
    args = cli.parse_args()
    out = args.output.resolve()
    if out == ROOT or ROOT in out.parents or out in ROOT.parents:
        cli.error('Preview output must be outside the source repository.')
    marker = out / '.calm-video-preview'
    if out.exists() and any(out.iterdir()) and not marker.exists():
        cli.error('Refusing to use a nonempty directory without our preview marker.')
    out.mkdir(parents=True, exist_ok=True)
    marker.write_text('Generated preview. Public website sources remain unchanged.\n')
    paths = subprocess.check_output(['git', 'ls-files'], cwd=ROOT, text=True).splitlines()
    # Copy HTML and symlink read-only dependencies. Generated files are never symlinks.
    for name in paths:
        src, dst = ROOT / name, out / name
        if not src.is_file():
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        if dst.is_symlink():
            dst.unlink()
        if name.endswith('.html') or name == 'content/article-video-matches.json':
            dst.write_bytes(src.read_bytes())
        elif not dst.exists():
            dst.symlink_to(src)
    existing = json.loads((ROOT / 'content/article-video-matches.json').read_text())
    supplements = json.loads((DATA / 'supplemental-video-matches.json').read_text())
    all_matches = existing + supplements
    (out / 'content/article-video-matches.json').write_text(json.dumps(all_matches, indent=2)+'\n')
    inventory = json.loads((DATA / 'channel-videos.json').read_text())
    by_id = {m['videoId']: m for m in all_matches}
    with (ROOT / 'docs/footer-redesign/video-audit.csv').open() as file:
        previous_reviews = {r['video'].split('v=')[-1]:r['reason'] for r in csv.DictReader(file)}
    for m in supplements:
        path = out / m['article']
        path.write_text(render(path.read_text(), path, out))
    # A dedicated library gives unmatched lessons a truthful home, without placing
    # the same player twice or inventing article prose to justify an embed.
    rows, cards = [], {'article': [], 'library': [], 'direct-link': []}
    for v in inventory['videos']:
        vid, title = v['videoId'], escape(v['title'])
        direct = 'https://www.youtube.com/watch?v=' + vid
        m = by_id.get(vid)
        status = v['embedStatus']
        if m:
            article = out / m['article']
            source = article.read_text()
            figure_id = 'video-' + vid
            source = source.replace('data-youtube-id="'+vid+'"', 'id="'+figure_id+'" data-youtube-id="'+vid+'"', 1)
            article.write_text(source)
            destination = '/' + m['article'] + '#' + figure_id
            content = '<p class="meta">Read and watch in context</p><p>'+escape(m['rationale'])+'</p><a class="button" href="'+destination+'">Open the article and video →</a>'
            placement = 'article'
            reason = m['rationale']
        elif status == 'available':
            destination = '/learn/videos/index.html#video-' + vid
            short = v['videoType'] == 'short'
            content = '<p class="meta">'+('Short lesson' if short else 'Full lesson')+' · Companion video</p><details class="video-player"><summary>Play this lesson</summary><div class="article-video'+(' article-video--short' if short else '')+'"><div class="article-video__frame"><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/'+vid+'" title="'+title+'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div></div></details>'
            placement = 'library'
            reason = previous_reviews.get(vid, 'No dedicated existing section on Hoshin Kanri strategy deployment; use a companion lesson instead of implying an exact article match.')
        else:
            destination = direct
            placement = 'direct-link'
            reason = v['embedReason']
            content = '<p class="meta">Watch on YouTube</p><p>'+escape('YouTube currently does not permit an embedded player for this lesson.' if status == 'unavailable' else 'Embedding availability could not be confirmed; use the direct video link.')+'</p>'
        cards[placement].append('<article class="card video-card" id="video-'+vid+'"><h3>'+title+'</h3>'+content+'<a class="video-direct" href="'+direct+'">Watch on YouTube ↗</a></article>')
        rows.append({'videoId':vid,'title':v['title'],'placement':placement,'destination':destination,'embedStatus':status,'reason':reason})
    source = (ROOT / 'index.html').read_text()
    footer = next(n for n in parse(source).nodes if 'platform-footer' in n['attrs'].get('class','').split())
    footer_html = source[footer['start']:footer['end']]
    groups = [('article', 'Watch alongside a guide'), ('library', 'Explore companion lessons'), ('direct-link', 'Watch directly on YouTube')]
    sections = ''.join('<section id="'+key+'" aria-labelledby="'+key+'-title"><h2 id="'+key+'-title">'+label+'</h2><div class="video-grid">'+''.join(cards[key])+'</div></section>' for key,label in groups)
    jump = '<nav class="video-jump" aria-label="Browse video lessons">'+''.join('<a href="#'+key+'">'+label+'</a>' for key,label in groups)+'</nav>'
    page = (DATA / 'video-library.html.in').read_text()
    for key, value in {'footer':footer_html, 'video_navigation':jump, 'video_sections':sections, 'channel_url':CHANNEL}.items():
        page = page.replace('{{'+key+'}}', value)
    stylesheet = out / 'video-library-preview.css'
    if stylesheet.is_symlink():stylesheet.unlink()
    stylesheet.write_bytes((DATA / 'video-library.css').read_bytes())
    target = out / 'learn/videos/index.html'
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(page)
    # Compare the preview with only the explicitly added video blocks removed.
    # Original prose, original videos, links, anchors and footer remain protected.
    augmented = {}
    for m in all_matches:
        path = out / m['article']
        augmented[path] = path.read_text()
    supplemental_ids = {m['videoId'] for m in supplements}
    try:
        for path, text in augmented.items():
            nodes = parse(text).nodes
            additions = [n for n in nodes if n['tag']=='figure' and n['attrs'].get('data-youtube-id') in supplemental_ids]
            for node in sorted(additions,key=lambda n:n['start'],reverse=True):
                text = text[:node['start']] + text[node['end']:]
            path.write_text(text)
        result = check(json.loads(MANIFEST.read_text()), root=out)
    finally:
        for path, text in augmented.items():
            path.write_text(text)
    result['comparisonNote'] = 'Actual preview compared with immutable baseline after removing only the two recorded supplemental video figures; original prose, links, anchors, original players, footer and downloads remain protected.'
    result['coverage'] = {'total':len(rows),'article':sum(r['placement']=='article' for r in rows),'library':sum(r['placement']=='library' for r in rows),'directLink':sum(r['placement']=='direct-link' for r in rows)}
    (out / 'video-preview-report.json').write_text(json.dumps(result,indent=2)+'\n')
    (out / 'video-coverage.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
    with (out / 'video-coverage.csv').open('w') as file:
        writer=csv.DictWriter(file,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    print(json.dumps({'output':str(out), **result},indent=2))
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
