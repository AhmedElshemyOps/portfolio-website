"""Controlled Knowledge Hub metadata, validation and static navigation.
article-registry.json owns article classification; knowledge-taxonomy.json owns vocabulary.
Legacy category/pillar/series fields remain readable by existing consumers.
"""
import json,re
from html import escape
from urllib.parse import quote

def validate(root,registry,check_files=True):
    taxonomy=json.loads((root/'content/knowledge-taxonomy.json').read_text())
    categories={x['name']:x['subcategories'] for x in taxonomy['categories']}
    urls={x['url'] for x in registry}; ids={x['id'] for x in registry}; positions=set()
    if len(urls)!=len(registry) or len(ids)!=len(registry):raise ValueError('Duplicate article URL or ID')
    incoming={url:0 for url in urls}
    for row in registry:
        for key in ['primaryCategory','subcategory','summary','status','relatedArticles']:
            if not row.get(key):raise ValueError('Missing '+key+': '+row['id'])
        if row['primaryCategory'] not in categories or row['subcategory'] not in categories[row['primaryCategory']]:raise ValueError('Invalid category/subcategory: '+row['id'])
        if row['status']!='Published':raise ValueError('Only approved published content belongs in the public registry')
        tags=row.get('tags',[])
        if len(tags)>5 or len(set(tags))!=len(tags) or any(t not in taxonomy['tags'] for t in tags):raise ValueError('Invalid controlled tags: '+row['id'])
        if check_files and not (root/row['url'].lstrip('/')).is_file():raise ValueError('Missing article file: '+row['url'])
        for url in row['relatedArticles']:
            if url not in urls or url==row['url']:raise ValueError('Invalid related reference: '+url)
            incoming[url]+=1
        n=row.get('seriesPosition')
        if n is not None:
            if isinstance(n,bool) or not isinstance(n,int) or n<1 or (row['seriesId'],n) in positions:raise ValueError('Invalid/duplicate series position')
            positions.add((row['seriesId'],n))
    for series in {s for s,n in positions}:
        nums=sorted(n for s,n in positions if s==series)
        if nums!=list(range(1,max(nums)+1)):raise ValueError('Series gap: '+series)
    manifest=json.loads((root/'content/series-banners.json').read_text())
    by_url={x['url']:x for x in manifest['articles']}
    for row in registry:
        b=by_url.get(row['url'])
        if not b or (b['design'] if b['kind']!='Field guide' or b.get('number') else None)!=row['seriesId'] or b.get('number')!=row.get('seriesPosition'):raise ValueError('Series manifest mismatch: '+row['id'])
    return taxonomy

def link(category,subcategory=None):
    return '/knowledge/index.html?category='+quote(category)+(('&subcategory='+quote(subcategory)) if subcategory else '')+'#all-knowledge-title'

def render_article(source,row,registry):
    """Taxonomy navigation outside the untouched teaching body, no new canonical paths."""
    source=re.sub(r'<!-- knowledge-context:start -->.*?<!-- knowledge-context:end -->','',source,flags=re.S)
    primary=escape(row['primaryCategory']);sub=escape(row['subcategory'])
    html='<aside class="reading-connections knowledge-context" aria-label="Explore this subject"><h2>Explore this subject</h2><p><a href="'+escape(link(row['primaryCategory']),quote=True)+'">'+primary+'</a> / <a href="'+escape(link(row['primaryCategory'],row['subcategory']),quote=True)+'">'+sub+'</a></p><p>'+escape(row['summary'])+'</p>'
    # Existing links remain in their original modules. Avoid repetitive companion links.
    from audit_seo import DOM
    existing={n.attrs.get('href','').replace('https://ahmedqualityops.com','').split('#')[0] for n in DOM(source).root.all('a')}
    targets={x['url']:x for x in registry}; related=[url for url in row['relatedArticles'] if url not in existing]
    if related:html+='<ul>'+''.join('<li><a href="'+escape(url)+'">'+escape(targets[url]['title'])+'</a></li>' for url in related)+'</ul>'
    html+='</aside>'
    source=source.replace('</main>','<!-- knowledge-context:start -->'+html+'<!-- knowledge-context:end --></main>',1)
    # Enrich existing Article nodes without altering dates, headline or canonical.
    def schema(m):
        data=json.loads(m[2])
        def update(n):
            if isinstance(n,list):
                for v in n:update(v)
            elif isinstance(n,dict):
                if n.get('@type') in ('Article','BlogPosting'):
                    n['articleSection']=row['primaryCategory'];n['keywords']=row['tags']
                    n['about']={'@type':'Thing','name':row['subcategory']}
                    if row.get('seriesId'): n['isPartOf']={'@type':'CreativeWorkSeries','name':row['seriesTitle'],'url':'https://ahmedqualityops.com/knowledge/index.html?collection='+quote(row['seriesId'])}
                if '@graph' in n:update(n['@graph'])
        update(data)
        return m[1]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+m[3]
    return re.sub(r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',schema,source,flags=re.S)

def render_hub(root,registry,source):
    t=validate(root,registry);e=escape
    source=source.replace('<div class="library-search" id="library-search">','<div class="library-search">').replace('<input type="search" data-knowledge-query','<input id="library-search" type="search" data-knowledge-query')
    description='Explore Travel and Tourism knowledge across product strategy, process engineering, AI toolkits, service operations and governance. Browse by subject or editorial series.'
    source=source.replace('Discover all original articles, five structured learning paths and practical tourism operations tools by Ahmed Mahmoud.',description)
    def collection_schema(m):
        data=json.loads(m[2])
        if isinstance(data,dict) and data.get('@type')=='CollectionPage':
            data.pop('numberOfItems',None)
            data['description']=description
            data['mainEntity']={'@type':'ItemList','numberOfItems':len(registry),'itemListElement':[{'@type':'ListItem','position':i+1,'url':'https://ahmedqualityops.com'+x['url'],'name':x['title']} for i,x in enumerate(registry)]}
        return m[1]+json.dumps(data,ensure_ascii=False,separators=(',',':'))+m[3]
    source=re.sub(r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)',collection_schema,source,flags=re.S)
    nav='<nav class="topic-grid taxonomy-grid" aria-label="Article topics">'
    for cat in t['categories']:
        rows=[x for x in registry if x['primaryCategory']==cat['name'] and x['type']=='Article']
        nav+='<section class="taxonomy-category"><a class="topic-card" href="'+e(link(cat['name']),quote=True)+'"><strong>'+e(cat['name'])+'</strong><span>'+str(len(rows))+' articles</span><p>'+e(cat['description'])+'</p></a><ul>'
        for sub in cat['subcategories']:
            count=sum(x['subcategory']==sub for x in rows)
            if count:nav+='<li><a href="'+e(link(cat['name'],sub),quote=True)+'">'+e(sub)+' <span>('+str(count)+')</span></a></li>'
        nav+='</ul></section>'
    nav+='</nav>'
    source=re.sub(r'<details class="library-topic-disclosure">.*?</details>',nav,source,flags=re.S)
    source=re.sub(r'<nav class="topic-grid taxonomy-grid".*?</nav>',lambda m:nav,source,flags=re.S)
    source=source.replace('Browse by topic','Browse by category')
    controls=[]
    for key,label,values in [('category','Category',[(x['name'],x['name']) for x in t['categories']]),('subcategory','Subcategory',[(s,s) for c in t['categories'] for s in c['subcategories']]),('tag','Topic tag',[(s,s) for s in t['tags'] if any(s in x['tags'] for x in registry)]),('collection','Editorial series',sorted({(x['seriesId'],x['seriesTitle']) for x in registry if x.get('seriesId')})),('pillar','Legacy topic',[(s,s) for s in sorted({x['pillar'] for x in registry})]),('series','Legacy series',[(s,s) for s in sorted({x['series'] for x in registry})]),('type','Content type',[(s,s) for s in sorted({x['type'] if x['type']=='Series index' else x['contentType'] for x in registry})])]:
        attrs=' data-legacy-filter hidden' if key in ('pillar','series') else ''
        controls.append('<label'+attrs+'>'+label+'<select data-knowledge-filter="'+key+'"><option value="">All '+label.lower()+' options</option>'+''.join('<option value="'+e(v,quote=True)+'">'+e('AI for Hotel Apartments' if name=='Hotel & Serviced Apartment AI' else name)+'</option>' for v,name in values)+'</select></label>')
    source=re.sub(r'<div class="knowledge-filters">.*?</div>','<div class="knowledge-filters">'+''.join(controls)+'<button type="button" data-knowledge-reset>Reset filters</button></div>',source,flags=re.S)
    cards=[]
    for x in registry:
        typ='Series index' if x['type']=='Series index' else x['contentType']
        data=dict(pillar=x['pillar'],series=x['series'],type=typ,updated=x.get('updated',''),category=x['primaryCategory'],subcategory=x['subcategory'],tag='|'.join(x['tags']),collection=x['seriesId'] or '',position=x.get('seriesPosition') or 0,search=' '.join([x['title'],x['summary'],x['primaryCategory'],x['subcategory'],*x['tags'],*x.get('legacyTags',[])]).lower())
        attrs=' '.join('data-'+k+'="'+e(str(v),quote=True)+'"' for k,v in data.items())
        label=(x['seriesTitle']+(' · Article '+str(x['seriesPosition']) if x.get('seriesPosition') else ' · Overview')) if x.get('seriesId') else 'Independent field guide'
        cards.append('<article class="knowledge-card" data-knowledge-card '+attrs+'><a href="'+e(x['url'])+'"><span>'+e(x['primaryCategory'])+'</span><h2>'+e(x['title'])+'</h2><p>'+e(x['summary'])+'</p><p class="knowledge-card-subcategory">'+e(x['subcategory'])+'</p><ul class="knowledge-tags" aria-label="Topics">'+''.join('<li>'+e(tag)+'</li>' for tag in x['tags'][:3])+'</ul><small>'+e(label)+' · '+str(x['readingTime'])+' min estimated read</small></a></article>')
    source=re.sub(r'<div class="knowledge-grid">.*?</div>(?=<div class="(?:library-pagination|knowledge-empty)")','<div class="knowledge-grid">'+''.join(cards)+'</div>',source,flags=re.S)
    source=re.sub(r'<!-- featured-series:start -->.*?<!-- featured-series:end -->','',source,flags=re.S)
    series='<section class="featured-strip knowledge-series" aria-labelledby="series-heading"><header><span class="eyebrow">Follow a learning sequence</span><h2 id="series-heading">Editorial series</h2><p>Series connect articles across categories. Follow the sequence or choose a specific method.</p></header><div>'
    for sid,title in sorted({(x['seriesId'],x['seriesTitle']) for x in registry if x.get('seriesId')}):
        members=[x for x in registry if x['seriesId']==sid and x.get('seriesPosition')]
        series+='<a href="/knowledge/index.html?collection='+e(sid)+'#all-knowledge-title"><strong>'+e(title)+'</strong><span>'+str(len(members))+' numbered articles →</span></a>'
    series+='</div></section>'
    source=source.replace('<section class="knowledge-browser"','<!-- featured-series:start -->'+series+'<!-- featured-series:end --><section class="knowledge-browser"',1)
    featured=[next(x for x in registry if x['id']==slug) for slug in ['amsterdam-product-discovery-01-research-plan','hotel-ai-prompting-framework','how-to-write-professional-sop-procedure','article-professional-client-tour-quotation']]
    strip='<section class="featured-strip" aria-labelledby="featured-title"><header><span class="eyebrow">Put a method into practice</span><h2 id="featured-title">Practical guides</h2></header><div>'+''.join('<a href="'+x['url']+'"><small>'+e(x['primaryCategory'])+'</small><strong>'+e(x['title'])+'</strong><span>'+str(x['readingTime'])+' min estimated read →</span></a>' for x in featured)+'</div></section>'
    source=re.sub(r'<section class="featured-strip" aria-labelledby="featured-title">.*?</section>',strip,source,flags=re.S)
    source=re.sub(r'"numberOfItems":\s*\d+','"numberOfItems":'+str(len(registry)),source)
    if '/assets/css/knowledge-taxonomy.css' not in source:source=source.replace('</head>','<link rel="stylesheet" href="/assets/css/knowledge-taxonomy.css"></head>')
    return source
