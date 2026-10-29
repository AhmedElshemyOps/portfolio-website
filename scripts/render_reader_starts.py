"""Offer three reader goals using existing paths and the existing product series."""
import json,re
from html import escape
from apply_field_manual import parse
MANAGED={'index.html','knowledge/index.html','learning/index.html'}
STYLE='<link rel="stylesheet" href="/assets/css/portfolio-discovery.css"/>'

def entries(root):
    starts=json.loads((root/'content/reader-starts.json').read_text())
    paths={p['slug']:p for p in json.loads((root/'content/learning-paths.json').read_text())}
    registry=json.loads((root/'content/article-registry.json').read_text())
    for row in starts:
        row['count']=len(paths[row['path']]['steps']) if row.get('path') else sum(x.get('seriesId')==row['series'] and x['type']=='Article' for x in registry)
    return starts,paths

def cards(rows):
    e=escape;items=[]
    for row in rows:
        items.append('<a class="reader-start-card" href="'+e(row['url'],quote=True)+'"><span class="reader-start-count">'+str(row['count'])+' articles</span><h3>'+e(row['title'])+'</h3><p>'+e(row['description'])+'</p><strong>'+e(row['action'])+' <span aria-hidden="true">→</span></strong></a>')
    return '<section class="reader-starts" id="reader-starts" aria-labelledby="reader-starts-title"><header><span class="eyebrow">Choose your starting point</span><h2 id="reader-starts-title">What would you like to work on?</h2><p>Start with a focused sequence, then explore the wider library.</p></header><div class="reader-start-grid">'+''.join(items)+'</div></section>'

def render(source,path,root):
    rel=path.relative_to(root).as_posix()
    if rel not in MANAGED or not (root/'content/reader-starts.json').is_file():return source
    rows,paths=entries(root);e=escape
    if rel=='index.html':
        doc=parse(source);overview=next((n for n in doc.nodes if 'library-overview' in doc.classes(n)),None)
        if not overview:return source
        compact='<div class="library-overview"><p class="library-intro">Practical knowledge on destination delivery, service quality, commercial decisions and operational systems.</p><nav class="reader-start-links" aria-label="Choose a learning route">'+''.join('<a href="'+e(r['url'],quote=True)+'"><strong>'+e(r['title'])+'</strong><span>'+str(r['count'])+' articles <span aria-hidden="true">→</span></span></a>' for r in rows)+'</nav><a class="reader-all-topics" href="/knowledge/index.html">Browse all topics and articles →</a></div>'
        source=source[:overview['start']]+compact+source[overview['end']:]
    elif rel=='knowledge/index.html':
        doc=parse(source)
        if not any(n['attrs'].get('id')=='reader-browse-all' for n in doc.nodes) and not (any('library-topics' in doc.classes(n) for n in doc.nodes) and any('knowledge-series' in doc.classes(n) for n in doc.nodes)):return source
        old=next((n for n in doc.nodes if n['attrs'].get('id')=='reader-starts'),None)
        if old:source=source[:old['start']]+source[old['end']:]
        doc=parse(source);browse=next((n for n in doc.nodes if n['attrs'].get('id')=='reader-browse-all'),None)
        if not browse:
            topics=next(n for n in doc.nodes if 'library-topics' in doc.classes(n));series=next(n for n in doc.nodes if 'knowledge-series' in doc.classes(n))
            end=series['end']
            marker='<!-- featured-series:end -->'
            if source.startswith(marker,end):end+=len(marker)
            inner=source[topics['start']:end]
            wrapper='<details class="reader-browse-details" id="reader-browse-all"><summary>Browse all topics and editorial series</summary><div>'+inner+'</div></details>'
            source=source[:topics['start']]+wrapper+source[end:]
        doc=parse(source);browse=next(n for n in doc.nodes if n['attrs'].get('id')=='reader-browse-all')
        source=source[:browse['start']]+cards(rows)+source[browse['start']:]
    else:
        doc=parse(source);main=next((n for n in doc.nodes if n['tag']=='main'),None);hero=next((n for n in doc.nodes if 'discovery-hero' in doc.classes(n)),None)
        if not main or not hero:return source
        specialist=[]
        for p in paths.values():
            if p['slug'] in {r.get('path') for r in rows}:continue
            specialist.append('<article class="path-card"><span>'+str(len(p['steps']))+' articles</span><h3>'+e(p['title'])+'</h3><p>'+e(p['description'])+'</p><small>Best for: '+e(p['audience'])+'</small><a href="/learning/'+p['slug']+'/index.html">Start this path →</a></article>')
        hero_html=source[hero['start']:hero['end']]
        hero_html=re.sub(r'<p>.*?</p>','<p>Choose one of three starting points, or explore a specialist sequence below. On learning paths, completion is saved only in this browser.</p>',hero_html,flags=re.S)
        inner=hero_html+cards(rows)+'<section class="specialist-paths" aria-labelledby="specialist-paths-title"><header><h2 id="specialist-paths-title">Explore a specialist path</h2><p>Go deeper into commercial work, AI or quality management.</p></header><div class="path-grid">'+''.join(specialist)+'</div></section>'
        source=source[:main['inner']]+inner+'</main>'+source[main['end']:]
        source=re.sub(r'("numberOfItems"\s*:\s*)\d+',r'\g<1>'+str(len(rows)+len(specialist)),source)
    return source

def styles(source):
    source=re.sub(r'<link\b[^>]*href="/assets/css/portfolio-discovery\.css[^\"]*"[^>]*>','',source)
    return source.replace('</head>',STYLE+'</head>',1)
