"""Render the approved video library from public inventory and editorial matches."""
from html import escape
import json
import re
from datetime import date
from apply_field_manual import parse
CHANNEL = 'https://www.youtube.com/@ahmedqualityops-official'

def render(source, path, root):
    if path.relative_to(root).as_posix() != 'learn/videos/index.html':return source
    inventory=json.loads((root/'content/youtube-videos.json').read_text())
    videos=[v for v in inventory['videos'] if v.get('privacyStatus')=='public']
    if len({v['videoId'] for v in videos})!=len(videos):raise ValueError('Duplicate public video in library inventory')
    by_id={m['videoId']:m for m in json.loads((root/'content/article-video-matches.json').read_text())}
    # A dedicated library gives unmatched lessons a truthful home, without placing
    # the same player twice or inventing article prose to justify an embed.
    cards = {'article': [], 'library': [], 'direct-link': []}
    for v in videos:
        vid, title = v['videoId'], escape(v['title'])
        if not re.fullmatch(r'[A-Za-z0-9_-]{11}',vid):raise ValueError('Invalid public YouTube video ID')
        direct = 'https://www.youtube.com/watch?v=' + vid
        m = by_id.get(vid)
        status = v['embedStatus']
        if m:
            figure_id = 'video-' + vid
            destination = '/' + m['article'] + '#' + figure_id
            content = '<p class="meta">Read and watch in context</p><p>'+escape(m['rationale'])+'</p><a itemprop="url" class="button" href="'+destination+'">Open the article and video →</a>'
            placement = 'article'
        elif status == 'available':
            destination = '/learn/videos/index.html#video-' + vid
            short = v['videoType'] == 'short'
            content = '<p class="meta">'+('Short lesson' if short else 'Full lesson')+' · Companion video</p><details class="video-player"><summary aria-label="Play video: '+title+'">Play this lesson</summary><div class="article-video'+(' article-video--short' if short else '')+'"><div class="article-video__frame"><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/'+vid+'" title="'+title+'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div></div></details>'
            placement = 'library'
        else:
            destination = direct
            placement = 'direct-link'
            content = '<p class="meta">Watch on YouTube</p><p>'+escape('YouTube currently does not permit an embedded player for this lesson.' if status == 'unavailable' else 'Embedding availability could not be confirmed; use the direct video link.')+'</p>'
        cards[placement].append('<article class="card video-card" id="video-'+vid+'" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem"><h3 itemprop="name">'+title+'</h3>'+content+'<a '+('itemprop="url" ' if not m else '')+'class="video-direct" href="'+direct+'" aria-label="Watch on YouTube: '+title+'">Watch on YouTube ↗</a></article>')
    source = (root / 'index.html').read_text()
    footer = next(n for n in parse(source).nodes if 'platform-footer' in n['attrs'].get('class','').split())
    footer_html = source[footer['start']:footer['end']]
    groups = [('article', 'Watch alongside a guide'), ('library', 'Explore companion lessons'), ('direct-link', 'Watch directly on YouTube')]
    sections = ''.join('<section id="'+key+'" aria-labelledby="'+key+'-title"'+(' itemprop="mainEntity" itemscope itemtype="https://schema.org/ItemList"' if cards[key] else '')+'><h2 id="'+key+'-title"'+(' itemprop="name"' if cards[key] else '')+'>'+label+'</h2><div class="video-grid">'+''.join(cards[key])+'</div></section>' for key,label in groups)
    jump = '<nav class="video-jump" aria-label="Browse video lessons">'+''.join('<a href="#'+key+'">'+label+'</a>' for key,label in groups)+'</nav>'
    page = (root / 'templates/video-library.html.in').read_text()
    checked=date.fromisoformat(inventory['inventoryCheckedOn'])
    values={'footer':footer_html, 'video_navigation':jump, 'video_sections':sections, 'channel_url':CHANNEL,
            'video_count':str(len(videos)), 'inventory_date':str(checked.day)+' '+checked.strftime('%B %Y')}
    for key, value in values.items():page=page.replace('{{'+key+'}}',value)
    return page
