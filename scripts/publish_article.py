"""Publish finished Markdown through the shared article design. No external dependencies.
Preview: python3 scripts/publish_article.py draft.md --preview /tmp/article-preview.html
Publish: python3 scripts/publish_article.py draft.md --publish
Updating an existing managed article additionally requires --replace.
"""
import argparse
from datetime import date
from html import escape
import json, math, re
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://ahmedqualityops.com'
MARKER = '<!-- managed-finished-article:v1 -->'

def inline(text):
    # Escape all authored HTML. Only explicit, safe Markdown links become links.
    text = escape(text)
    def link(m):
        url = m[2]
        if urlsplit(url).scheme not in ('', 'https', 'http', 'mailto', 'tel') or url.startswith('//'):
            raise ValueError('Unsupported link: '+url)
        return '<a href="'+url+'">'+m[1]+'</a>'
    text = re.sub(r'\[([^\]\n]+)\]\(([^\s)]+)\)', link, text)
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)

def body_html(text):
    out, headings, ids, paragraph = [], [], set(), []
    lines = text.splitlines(); i = 0
    def flush():
        if paragraph:
            out.append('<p>'+inline(' '.join(paragraph))+'</p>'); paragraph.clear()
    while i < len(lines):
        line = lines[i]; i += 1
        if line.startswith('```'):
            flush(); code = []
            while i < len(lines) and not lines[i].startswith('```'):
                code.append(lines[i]); i += 1
            if i == len(lines): raise ValueError('Unclosed code block')
            i += 1; out.append('<pre><code>'+escape('\n'.join(code))+'</code></pre>')
        elif re.match(r'^#{2,4} ', line):
            flush(); level = len(line.split(' ')[0]); title = line[level+1:]
            base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-') or 'section'
            ident = base; n = 2
            while ident in ids: ident = base+'-'+str(n); n += 1
            ids.add(ident); out.append(f'<h{level} id="{ident}">'+inline(title)+f'</h{level}>')
            if level == 2: headings.append((ident,title))
        elif re.match(r'^(?:- |\d+\. )',line):
            flush(); ordered = not line.startswith('- '); tag = 'ol' if ordered else 'ul'; items = []
            while True:
                items.append('<li>'+inline(re.sub(r'^(?:- |\d+\. )','',line))+'</li>')
                if i >= len(lines) or not re.match(r'^\d+\. ' if ordered else r'^- ',lines[i]): break
                line = lines[i]; i += 1
            out.append('<'+tag+'>'+''.join(items)+'</'+tag+'>')
        elif not line.strip(): flush()
        elif line.startswith('# ') or line.startswith('|') or line.startswith('!['):
            raise ValueError('Use title metadata, paragraphs, ## headings, lists and links; tables/images require an editorial review.')
        else: paragraph.append(line)
    flush()
    if not headings: raise ValueError('Add at least one ## section heading')
    return '\n'.join(out), headings

def read_draft(path):
    source = path.read_text(encoding='utf-8')
    parts = source.split('---',2)
    if len(parts)!=3 or parts[0].strip(): raise ValueError('Start with --- JSON metadata ---')
    meta = json.loads(parts[1]); text = parts[2].strip()
    for key in ('title','slug','description','topic','published','updated'):
        if not isinstance(meta.get(key),str) or not meta[key].strip(): raise ValueError('Missing '+key)
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',meta['slug']): raise ValueError('Use a lowercase slug with hyphens')
    published, updated = date.fromisoformat(meta['published']),date.fromisoformat(meta['updated'])
    if updated < published: raise ValueError('Updated date precedes publication')
    if not text: raise ValueError('Article text is empty')
    if not isinstance(meta.get('tags',[]),list) or any(not isinstance(x,str) for x in meta.get('tags',[])): raise ValueError('Tags must be a list of text labels')
    return meta,text

def page(meta,text):
    body,headings = body_html(text); e = escape; url = '/articles/'+meta['slug']+'/index.html'
    minutes = max(1,math.ceil(len(text.split())/220))
    schema = {'@context':'https://schema.org','@type':'Article','headline':meta['title'],'description':meta['description'],'url':BASE+url,'datePublished':meta['published'],'dateModified':meta['updated'],'author':{'@type':'Person','name':'Ahmed Mahmoud','url':BASE+'/profile/index.html'}}
    schema_json = json.dumps(schema,ensure_ascii=False).replace('<', chr(92)+'u003c')
    styles = ''.join('<link rel="stylesheet" href="/assets/css/'+name+'.css"/>' for name in ('launch-pages','discovery','article-field-manual'))
    scripts = ''.join('<script defer src="/assets/js/'+name+'.js"></script>' for name in ('site-config','analytics','discovery','saved-reading','article-reader'))
    toc = ''.join('<li><a href="#'+ident+'">'+e(title)+'</a></li>' for ident,title in headings)
    html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>{e(meta['title'])} | Ahmed Mahmoud</title><meta name="description" content="{e(meta['description'],quote=True)}"/><link rel="canonical" href="{BASE+url}"/><meta property="og:title" content="{e(meta['title'],quote=True)}"/><meta property="og:description" content="{e(meta['description'],quote=True)}"/><meta property="og:url" content="{BASE+url}"/><meta property="og:type" content="article"/>{styles}{scripts}<script type="application/ld+json">{schema_json}</script></head><body class="article-reader-page field-manual">{MARKER}<a class="skip" href="#article">Skip to article</a><header class="masthead"></header><main class="article-page" id="article" tabindex="-1"><header class="article-page-header"><span class="eyebrow">{e(meta['topic'])} · Field guide</span><h1>{e(meta['title'])}</h1><p>{e(meta['description'])}</p><p>{minutes} min read · Published {e(meta['published'])} · Updated {e(meta['updated'])}</p></header><div class="article-reader-layout"><aside class="article-toc"><details data-reader-toc open><summary>On this page</summary><ol>{toc}</ol></details></aside><div class="article-reading-column"><div class="article-topline"><div class="reader-utilities"><button type="button" data-reader-font="decrease" aria-label="Decrease text size">A−</button><button type="button" data-reader-font="increase" aria-label="Increase text size">A+</button><button type="button" data-reader-theme aria-pressed="false">Dark reading</button><button type="button" data-reader-contrast aria-pressed="false">High contrast</button></div></div><article class="article-body">{body}</article><p><a href="/knowledge/index.html">Explore the Knowledge Library</a></p></div></div></main><footer class="platform-footer"></footer></body></html>'''
    return html, dict(id=meta['slug'],title=meta['title'],url=url,description=meta['description'],category=meta['topic'],pillar=meta['topic'],series=meta.get('series',meta['topic']),type='Article',contentType='Field guide',readingTime=minutes,wordCount=len(text.split()),headings=[x[1] for x in headings],tags=meta.get('tags',[]),learningPaths=[],updated=meta['updated'])

def publish(root,meta,text,replace=False):
    from article_catalogue import refresh
    from render_shared import render
    import build_search_feeds
    target = root/'articles'/meta['slug']/'index.html'
    if target.exists() and (not replace or MARKER not in target.read_text()):
        raise ValueError('Existing article protected. Only managed articles can be updated with --replace.')
    if target.exists():
        from audit_seo import schema_nodes
        nodes,_ = schema_nodes(target.read_text())
        original_date = next((n.get('datePublished') for n in nodes if n.get('@type')=='Article'),None)
        if meta['published'] != original_date: raise ValueError('Keep the original publication date when updating')
    source,record = page(meta,text)
    registry = json.loads((root/'content/article-registry.json').read_text())
    registry = [x for x in registry if x['url']!=record['url']]+[record]
    # Back up every generated consumer; restore the complete transaction on error.
    paths = list((root/'content').glob('*.json'))+[root/'knowledge/index.html',root/'index.html',root/'sitemap.xml',root/'feed.xml',root/'maintenance/seo/sitemap-date-provenance.json',target]
    backups = {p:p.read_bytes() if p.exists() else None for p in paths}
    try:
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(source,encoding='utf-8'); refresh(root,registry)
        target.write_text(render(source,target,root),encoding='utf-8')
        home = root/'index.html'; html = home.read_text()
        match = re.search(r'(<script type="application/json" id="homepage-article-data">)(.*?)(</script>)',html,re.S)
        if not match: raise ValueError('Homepage article listing not found')
        entries = json.loads(match[2]); entries = [x for x in entries if x['url']!=record['url']]
        entries.append({k:record[k] for k in ('url','title','description','pillar')})
        home.write_text(html[:match.start(2)]+json.dumps(entries,ensure_ascii=False).replace('<','\\u003c')+html[match.end(2):])
        original_root = build_search_feeds.ROOT
        try: build_search_feeds.ROOT=root; build_search_feeds.build()
        finally: build_search_feeds.ROOT=original_root
    except Exception:
        for p,data in backups.items():
            if data is None: p.unlink(missing_ok=True)
            else: p.write_bytes(data)
        raise
    return target

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('draft',type=Path)
    group=parser.add_mutually_exclusive_group(required=True);group.add_argument('--preview',type=Path);group.add_argument('--publish',action='store_true')
    parser.add_argument('--replace',action='store_true');args=parser.parse_args()
    try:
        meta,text=read_draft(args.draft)
        if args.preview:
            from render_shared import render
            source,_=page(meta,text);args.preview.write_text(render(source,ROOT/'articles'/meta['slug']/'index.html',ROOT));print('Preview saved:',args.preview)
        else:
            if date.fromisoformat(meta['published'])>date.today(): raise ValueError('Future articles must remain previews')
            print('Published locally:',publish(ROOT,meta,text,args.replace));print('Review and deploy the GitHub Pages release to make this live.')
    except (ValueError,json.JSONDecodeError) as error: parser.exit(1,str(error)+'\n')
