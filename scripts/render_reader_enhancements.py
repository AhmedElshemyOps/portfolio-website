"""Render truthful evidence dates and a compact, link-preserving article follow-up."""
import json
import re
from html import escape
from apply_field_manual import parse

def render(source, path, root):
    relative=path.relative_to(root).as_posix()
    # The shared footer points to a stable local target even on deep article routes.
    if re.search(r'<footer\b[^>]*class="platform-footer"',source):
        body=re.search(r'<body\b[^>]*>',source)
        if body:
            tag=body.group()
            ids=re.findall(r'\bid="([^"]+)"',tag)
            if len(ids)>1 and 'page-top' in ids:tag=tag.replace(' id="page-top"','')
            source=source[:body.start()]+tag+source[body.end():]
            if 'id="page-top"' not in source:
                source=source.replace(tag,tag+'<span id="page-top" aria-hidden="true"></span>',1)
            source=re.sub(r'(<a class="footer-back-top" href=")[^"]+',lambda m:m[1]+'#page-top',source)
    if relative=='index.html':
        matches_path=root/'content/article-video-matches.json'
        video_urls={'/'+m['article'] for m in json.loads(matches_path.read_text())} if matches_path.exists() else set()
        def homepage_data(match):
            data=json.loads(match[2])
            for item in data:item['includesVideo']=item.get('url') in video_urls
            return match[1]+json.dumps(data,ensure_ascii=False).replace('<','\\u003c')+match[3]
        source=re.sub(r'(<script\b[^>]*id="homepage-article-data"[^>]*>)(.*?)(</script>)',homepage_data,source,flags=re.S)
        for node in reversed(parse(source).nodes):
            if node['tag']=='a' and 'article' in node['attrs'].get('class','').split():
                chunk=source[node['start']:node['end']]
                chunk=re.sub(r'<span class="knowledge-video-badge">.*?</span>','',chunk,flags=re.S)
                if node['attrs'].get('href') in video_urls:chunk=chunk.replace('</h3>','</h3><span class="knowledge-video-badge">Includes video</span>',1)
                source=source[:node['start']]+chunk+source[node['end']:]
    if not relative.startswith('articles/'):
        return source
    registry_path=root/'content/article-registry.json'
    if not registry_path.exists():return source
    row=next((r for r in json.loads(registry_path.read_text()) if r['url'].lstrip('/')==relative),None)
    if not row:return source
    # Unwrap before re-collecting, so regenerated related panels remain in one disclosure.
    for node in reversed(parse(source).nodes):
        if node['tag']=='details' and 'article-followups' in node['attrs'].get('class','').split():
            inner=source[node['inner']:node['end']]
            inner=re.sub(r'^\s*<summary>.*?</summary>','',inner, count=1,flags=re.S)
            inner=re.sub(r'</details>\s*$','',inner)
            source=source[:node['start']]+inner+source[node['end']:]
    nodes=parse(source).nodes
    classes={'library-connections','article-growth','knowledge-context','reading-connections','series-reading-path'}
    extras=[n for n in nodes if set(n['attrs'].get('class','').split()) & classes]
    extras=[n for n in extras if not any(a['start']<n['start'] and a['end']>=n['end'] for a in extras)]
    if extras:
        def priority(node):
            classes=set(node['attrs'].get('class','').split())
            return 3 if 'knowledge-context' in classes else 0 if 'library-connections' in classes else 1 if 'reading-connections' in classes else 2 if 'article-growth' in classes else 4
        snippets=[source[n['start']:n['end']] for n in sorted(extras,key=priority)]
        for n in sorted(extras,key=lambda n:n['start'],reverse=True):source=source[:n['start']]+source[n['end']:]
        nodes=parse(source).nodes
        anchor=next((n for n in nodes if n['attrs'].get('id')=='article-practical-ending'),None)
        if not anchor:anchor=next((n for n in nodes if 'article-body' in n['attrs'].get('class','').split()),None)
        if anchor:
            parent=anchor
            while parent.get('parent') and 'article-body' not in parent['attrs'].get('class','').split():parent=parent['parent']
            if 'article-body' in parent['attrs'].get('class','').split():anchor=parent
            panel='<details class="article-followups"><summary>Related reading and learning options</summary>'+''.join(snippets)+'</details>'
            source=source[:anchor['end']]+panel+source[anchor['end']:]
    # Updated is an editorial date from the registry, never represented as fresh fact verification.
    source=re.sub(r'<!-- reader-evidence:start -->.*?<!-- reader-evidence:end -->','',source,flags=re.S)
    notes=[]
    date=row.get('updated','')
    if re.fullmatch(r'\d{4}-\d{2}-\d{2}',date):
        notes.append('Article updated: <time datetime="'+date+'">'+date+'</time>.')
    matches_path=root/'content/article-video-matches.json'
    matches=json.loads(matches_path.read_text()) if matches_path.exists() else []
    dates=sorted({m['reviewedOn'] for m in matches if m['article']==relative and m.get('reviewedOn')})
    if dates:notes.append('Video placement reviewed: <time datetime="'+dates[-1]+'">'+dates[-1]+'</time>. Matched using public descriptions; full transcripts were unavailable.')
    if re.search(r'illustrative (?:scenario|example|teaching)|fictional.*?case',source,re.I):notes.append('Includes illustrative examples; example figures are not measured business results.')
    if notes:
        header=next((n for n in parse(source).nodes if 'article-page-header' in n['attrs'].get('class','').split()),None)
        if header:
            note='<!-- reader-evidence:start --><aside class="article-evidence-note" aria-label="Article evidence and review dates">'+''.join('<p>'+n+'</p>' for n in notes)+'</aside><!-- reader-evidence:end -->'
            source=source[:header['end']]+note+source[header['end']:]
    return source
