"""Place article definitions below the heading, before the teaching text."""
import json,re
from html import escape
from apply_field_manual import parse

def render(source,path,root):
    if not path.relative_to(root).as_posix().startswith('articles/'):return source
    nodes=parse(source).nodes
    glossary=next((n for n in nodes if 'article-glossary' in n['attrs'].get('class','').split()),None)
    if glossary:
        html=source[glossary['start']:glossary['end']]
        source=source[:glossary['start']]+source[glossary['end']:]
    else:
        additions=root/'content/editorial/article-glossary-additions.json'
        terms=json.loads(additions.read_text()).get(path.parent.name,[]) if additions.exists() else []
        if not terms:return source
        html='<details class="article-glossary"><summary>Terms used in this article <span>'+str(len(terms))+'</span></summary><dl>'+''.join('<div><dt>'+escape(x['term'])+'</dt><dd>'+escape(x['definition'])+'</dd></div>' for x in terms)+'</dl></details>'
    if 'article-glossary--intro' not in html:html=html.replace('class="article-glossary"','class="article-glossary article-glossary--intro"',1)
    source=re.sub(r'<div class="finish-glossary">\s*</div>','',source)
    nodes=parse(source).nodes;header=next((n for n in nodes if 'article-page-header' in n['attrs'].get('class','').split()),None)
    if not header:return source
    evidence=next((n for n in nodes if 'article-evidence-note' in n['attrs'].get('class','').split() and n['start']>=header['end']),None)
    position=evidence['end'] if evidence else header['end']
    marker='<!-- reader-evidence:end -->'
    if evidence and source.startswith(marker,position):position+=len(marker)
    source=source[:position]+html+source[position:]
    source=re.sub(r'<link\b[^>]*href="/assets/css/article-glossary\.css[^\"]*"[^>]*>','',source)
    return source.replace('</head>','<link rel="stylesheet" href="/assets/css/article-glossary.css"></head>',1)
