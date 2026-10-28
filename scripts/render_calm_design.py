"""Attach the approved presentation once, after existing page-family styles."""
import re
import hashlib
import json


def render(source, path, root):
    if '<body' not in source:
        return source
    def body(match):
        attrs = match[1]
        classes = re.search(r'class="([^"]*)"', attrs)
        values = classes[1].split() if classes else []
        for value in ['calm-site'] + (['calm-app'] if path.relative_to(root).parts[0] == 'live-demos' else []):
            if value not in values:values.append(value)
        if classes:attrs=attrs[:classes.start()]+ 'class="'+' '.join(values)+'"'+attrs[classes.end():]
        else:attrs+=' class="'+' '.join(values)+'"'
        return '<body'+attrs+'>'
    source=re.sub(r'<body([^>]*)>',body,source,count=1)
    inventory=root/'content/youtube-videos.json'
    if path==root/'index.html' and inventory.is_file():
        count=sum(v.get('privacyStatus')=='public' for v in json.loads(inventory.read_text())['videos'])
        source=re.sub(r'Explore \d+ video lessons',f'Explore {count} video lessons',source)
    if path.relative_to(root).as_posix()=='knowledge/index.html' and 'id="video-library-link"' not in source:
        needle='<a class="search-results-link" href="#library-search">Search articles →</a>'
        source=source.replace(needle,needle+' <a class="search-results-link" id="video-library-link" href="/learn/videos/index.html">Video lessons →</a>',1)
    source=re.sub(r'<link\b[^>]*href="/assets/css/calm-design\.css[^\"]*"[^>]*>','',source)
    asset=root/'assets/css/calm-design.css'
    revision='?v='+hashlib.sha256(asset.read_bytes()).hexdigest()[:12] if asset.is_file() else ''
    source=source.replace('</head>','<link rel="stylesheet" href="/assets/css/calm-design.css'+revision+'"></head>',1)
    return source
