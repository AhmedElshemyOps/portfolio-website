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
    from render_article_finish import render as render_finish
    return render_finish(source,path,root)
