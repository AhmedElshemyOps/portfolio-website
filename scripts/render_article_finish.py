"""One permanent article finish, driven by existing editorial metadata.

Teaching content stays intact. Retired recommendation modules are replaced, not
hidden. The migration manifest preserves their unique destinations and hooks.
"""
import json,re
from html import escape
from apply_field_manual import parse

RETIRED={'article-followups','library-connections','reading-connections','article-growth','article-sequence','series-reading-path','mice-series-navigation','article-finish','series-nav','ai-playbook-context-link','v14-related','v14-article-cta','related-insights','article-github-cta'}

def render(source,path,root):
    registry=root/'content/article-registry.json'
    if not registry.exists():return source
    rows=json.loads(registry.read_text());relative='/'+path.relative_to(root).as_posix()
    row=next((r for r in rows if r['url']==relative),None)
    if not row:return source
    nodes=parse(source).nodes
    # Keep interactive markup and its established storage/analytics hooks.
    feedback=next((n for n in nodes if 'article-feedback' in n['attrs'].get('class','').split()),None)
    feedback_html=source[feedback['start']:feedback['end']] if feedback else ''
    legacy_links=[]
    for n in nodes:
        if n['tag']!='a' or 'heading-anchor' in n['attrs'].get('class','').split():continue
        p=n.get('parent');ancestors=[]
        while p:ancestors.append(p);p=p.get('parent')
        if not ('finish-card' in n['attrs'].get('class','').split() or any(set(a['attrs'].get('class','').split()) & ((RETIRED-{'article-finish','article-followups'})|{'finish-more'}) for a in ancestors)):continue
        if any('knowledge-context' in a['attrs'].get('class','').split() for a in ancestors):continue
        def plain(node):
            from html import unescape
            return ' '.join(unescape(re.sub('<[^>]+>',' ',source[node['inner']:node['end']])).split())
        children=[c for c in nodes if n['inner']<=c['start']<n['end']]
        legacy_links.append(dict(url=n['attrs'].get('href',''),title=next((plain(c) for c in children if c['tag']=='strong'),plain(n)),label=next((plain(c) for c in children if 'finish-card-label' in c['attrs'].get('class','').split()),'Related reading'),description='',event=n['attrs'].get('data-analytics-event','')))
    targets=[n for n in nodes if set(n['attrs'].get('class','').split())&RETIRED]
    targets += [n for n in (feedback,) if n]
    # Retire the separate back link; the finish has one stable library link.
    targets += [n for n in nodes if n['tag']=='a' and 'Back to Knowledge Hub' in source[n['inner']:n['end']] and n['attrs'].get('href')=='/knowledge/index.html']
    outer=[n for n in targets if not any(a['start']<n['start'] and a['end']>=n['end'] for a in targets)]
    ids={n['attrs']['id'] for n in nodes if n['attrs'].get('id') and any(a['start']<=n['start']<a['end'] for a in outer)}
    # Repeated rendering replaces this block, including its preserved anchors.
    for n in sorted(outer,key=lambda n:n['start'],reverse=True):
        protected=[c for c in nodes if c['tag'] in {'figure','table','pre'} and n['inner']<=c['start']<c['end']<=n['end']]
        protected=[c for c in protected if not any(a['start']<c['start'] and a['end']>=c['end'] for a in protected)]
        preserved=''.join(source[c['start']:c['end']] for c in protected)
        source=source[:n['start']]+preserved+source[n['end']:]
    source=re.sub(r'<!-- knowledge-context:(?:start|end) -->','',source)
    endings_path=root/'content/editorial/article-endings.json'
    endings=json.loads(endings_path.read_text()) if endings_path.exists() else []
    ending=next((x for x in endings if x['slug']==row['id']),None)
    primary=ending['next']['url'] if ending else None
    manifest_path=root/'content/editorial/article-followups.json'
    extra=json.loads(manifest_path.read_text()).get(row['id'],{}) if manifest_path.exists() else {}
    links=list(extra.get('links',[]))
    # New publications receive the same layout automatically, from the registry.
    by_url={r['url']:r for r in rows}
    for url in row.get('relatedArticles',[]):
        target=by_url.get(url)
        if target:links.append(dict(url=url,title=target['title'],label='Related guide',description=''))
    banners=root/'content/series-banners.json'
    if banners.exists():
        articles=json.loads(banners.read_text())['articles']
        current=next((x for x in articles if x['url']==relative),None)
        if current and current.get('number'):
            siblings=sorted((x for x in articles if x['design']==current['design'] and x.get('number')),key=lambda x:x['number'])
            at=next(i for i,x in enumerate(siblings) if x['url']==relative)
            for idx,label in ((at-1,'Previous in series'),(at+1,'Next in series')):
                if 0<=idx<len(siblings):
                    other=siblings[idx];links.append(dict(url=other['url'],title=other['title'],label=label,description=''))
    links+=legacy_links
    seen={relative,primary,'/knowledge/index.html'};unique=[]
    for item in links:
        url=item['url'].replace('https://ahmedqualityops.com','')
        if not url or url.startswith('#'):continue
        if url in seen:continue
        seen.add(url);unique.append(dict(item,url=url))
    # Put concrete tools and resources ahead of further reading; keep every
    # approved unique destination available without a wall of expanded cards.
    def priority(x):
        url=x['url'];return 0 if url.startswith('/lab/') else 1 if url.startswith('/assets/') else 2 if url.startswith(('/live-demos/','https://github.com/')) else 3
    unique.sort(key=priority)
    def card(item):
        event=' data-analytics-event="'+escape(item['event'],quote=True)+'"' if item.get('event') else ''
        label='Interactive tool' if item['url'].startswith('/lab/') else 'Download / resource' if item['url'].startswith('/assets/') else 'Browser demo' if item['url'].startswith('/live-demos/') else item.get('label','Related guide')
        label=re.sub(r'[←→]','',label).strip()
        return '<a class="finish-card" href="'+escape(item['url'],quote=True)+'"'+event+'><span class="finish-card-label">'+escape(label)+'</span><strong>'+escape(item['title'])+'</strong><span class="finish-card-action">Explore <span aria-hidden="true">↗</span></span></a>'
    cards='<div class="finish-grid">'+''.join(card(x) for x in unique[:3])+'</div>' if unique else ''
    more=''
    if len(unique)>3:
        more='<details class="finish-more"><summary>More related reading <span>'+str(len(unique)-3)+'</span></summary><ul>'+''.join('<li><a href="'+escape(x['url'],quote=True)+'">'+escape(x['title'])+'</a>'+('<p>'+escape(x['description'])+'</p>' if x.get('description') else '')+'</li>' for x in unique[3:])+'</ul></details>'
    completion=extra.get('completion');progress=''
    if completion:
        progress='<button class="finish-complete" type="button" data-article-mark-complete data-learning-path="'+escape(completion['path'],quote=True)+'" aria-pressed="false">'+escape(completion['label'])+'</button>'
    from knowledge_taxonomy import link
    topic='<aside class="knowledge-context finish-topic" aria-label="Explore this subject"><span>Explore this subject</span><a href="'+escape(link(row['primaryCategory'],row['subcategory']),quote=True)+'">'+escape(row['subcategory'])+'</a></aside>'
    content='<section class="article-finish" aria-labelledby="article-finish-title" data-article-slug="'+escape(row['id'])+'"><header class="finish-heading"><p>Keep the momentum</p><h2 id="article-finish-title">Continue with purpose.</h2></header>'+cards+more+'<div class="finish-library"><a href="/knowledge/index.html">← All articles</a>'+progress+'</div>'+topic
    if extra.get('reminders'):content+='<aside class="finish-reminder" aria-label="Professional verification reminder">'+''.join(extra['reminders'])+'</aside>'
    content+=feedback_html+'</section>'
    # Preserve external fragment URLs without retaining obsolete UI modules.
    existing=set(re.findall(r'\bid="([^"]+)"',source+content))
    anchors=''.join('<span class="finish-anchor" id="'+escape(i,quote=True)+'" aria-hidden="true"></span>' for i in sorted(ids-existing))
    content=content.replace('><header', '>'+anchors+'<header',1)
    body=next((n for n in parse(source).nodes if 'article-body' in n['attrs'].get('class','').split()),None)
    if body:source=source[:body['end']]+content+source[body['end']:]
    else:source=source.replace('</main>',content+'</main>',1)
    source=re.sub(r'<link\b[^>]*href="/assets/css/article-finish\.css[^\"]*"[^>]*>','',source)
    source=source.replace('</head>','<link rel="stylesheet" href="/assets/css/article-finish.css"></head>',1)
    return source
