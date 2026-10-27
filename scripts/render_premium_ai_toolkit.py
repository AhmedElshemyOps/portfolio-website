"""Enhance approved prompt sources in place without duplicating template text."""
import hashlib,json,re
from html import escape,unescape
from apply_field_manual import parse
UI=re.compile(r'<!-- premium-ai-ui:start -->.*?<!-- premium-ai-ui:end -->',re.S)
def plain(source,node):return unescape(re.sub('<[^>]+>','',source[node['inner']:source.rfind('</',node['inner'],node['end'])])).strip()
def ui(html):return '<!-- premium-ai-ui:start -->'+html+'<!-- premium-ai-ui:end -->'
def render(source,path,root):
    manifest=root/'content/editorial/ai-prompt-toolkits.json'
    if not manifest.exists():return source
    rows=[r for r in json.loads(manifest.read_text()) if r['articleId']==path.parent.name and path.relative_to(root).as_posix().startswith('articles/')]
    if not rows:return source
    source=UI.sub('',source)
    # Unwrap only our presentation regions; original pre/code bytes survive.
    for node in reversed(parse(source).nodes):
        if 'ai-toolkit-source' in node['attrs'].get('class','').split():
            inner=source[node['inner']:source.rfind('</',node['inner'],node['end'])]
            source=source[:node['start']]+inner+source[node['end']:]
    for row in rows:
        e=parse(source);pre=next((n for n in e.nodes if n['tag']=='pre' and hashlib.sha256(plain(source,n).encode()).hexdigest()==row['sourceDigest']),None)
        if not pre:raise ValueError('Approved prompt source changed or missing: '+row['id'])
        card=pre['parent']
        while card and not e.classes(card)&{'prompt-card','article-prompt'}:card=card['parent']
        if not card:
            original=source[pre['start']:pre['end']]
            block='<div class="prompt-card" data-prompt-card data-prompt-guide="true"><h3>'+escape(row['title'])+'</h3><div class="prompt-guide-input"><h4>When to use it</h4><p>'+escape(row['description'])+'</p><h4>Required inputs</h4><p>Supply the source records and scope requested by the prompt. Keep private information out of shared examples.</p></div><div class="prompt-card-top"><h4>Complete prompt</h4></div><div id="'+escape(row['targetId'])+'">'+original+'</div><div class="prompt-output"><h4>Expected output</h4><p>Use the structured analysis and evidence checks specified in the template.</p></div><div class="trainer-note"><h4>Human verification</h4><p>Verify findings against supplied evidence; the accountable human owner approves the decision.</p></div></div>'
            source=source[:pre['start']]+block+source[pre['end']:];e=parse(source);pre=next(n for n in e.nodes if n['tag']=='pre' and hashlib.sha256(plain(source,n).encode()).hexdigest()==row['sourceDigest']);card=pre['parent']
            while card and 'prompt-card' not in e.classes(card):card=card['parent']
        chunk=source[card['start']:card['end']];ce=parse(chunk);cn=ce.nodes[0]
        # Replace the old copy action with one unified toolbar. Existing status
        # regions and their IDs stay available to assistive technology.
        deletes=[n for n in ce.nodes if n['tag']=='button' and n['attrs'].get('data-copy-target')==row['targetId']]
        for n in reversed(deletes):chunk=chunk[:n['start']]+chunk[n['end']:]
        ce=parse(chunk);cn=ce.nodes[0];attrs=cn['attrs'];share_id=attrs.get('id') or 'ai-toolkit-'+row['targetId']
        opening=chunk[:cn['inner']]
        if 'premium-ai-toolkit' not in attrs.get('class','').split():opening=re.sub(r'class="([^"]*)"',lambda m:'class="'+m[1]+' premium-ai-toolkit"',opening,count=1)
        for key,value in {'id':share_id,'data-ai-toolkit':'true','data-ai-prompt-id':row['id'],'data-ai-target':row['targetId'],'data-ai-article':row['articleId'],'data-ai-category':row['category'],'data-ai-version':row['version'],'role':'group','aria-label':'AI toolkit: '+row['title']}.items():
            opening=re.sub(r'\s'+re.escape(key)+r'="[^"]*"','',opening)
            opening=opening[:-1]+' '+key+'="'+escape(value,quote=True)+'">'
        chunk=opening+chunk[cn['inner']:]
        intro='<div class="ai-toolkit-intro"><span class="ai-toolkit-label">AI Toolkit</span><strong>'+escape(row['title'])+'</strong><p>'+escape(row['description'])+'</p></div>'
        custom=''
        if row.get('variables'):
            fields=''
            for v in row['variables']:
                ident=share_id+'-'+v['key']
                attrs=' id="'+escape(ident)+'" data-ai-variable="'+escape(v['key'])+'" data-ai-placeholder="'+escape(v['placeholder'],quote=True)+'" data-ai-required="true" aria-required="true" disabled'
                fields+='<label for="'+escape(ident)+'">'+escape(v['label'])+'</label>'
                if v['type']=='select':fields+='<select'+attrs+'><option value="">Choose an input</option>'+''.join('<option value="'+escape(o['value'],quote=True)+'">'+escape(o['label'])+'</option>' for o in v.get('options',[]))+'</select>'
                elif v['type']=='text':fields+='<input type="text"'+attrs+' maxlength="12000">'
                else:fields+='<textarea'+attrs+' rows="3" maxlength="12000"></textarea>'
            custom='<details class="ai-toolkit-custom"><summary>Customize inputs <span>Optional</span></summary><p>Use generic operating references. Inputs stay in this page and are not saved or included in shared links.</p><label class="ai-toolkit-toggle"><input type="checkbox" data-ai-customize> Use my inputs</label><div data-ai-fields hidden>'+fields+'</div><button type="button" data-ai-action="reset" disabled>Reset to original</button></details>'
        chunk=chunk[:len(opening)]+ui(intro+custom)+chunk[len(opening):]
        ce=parse(chunk);pre=next(n for n in ce.nodes if n['tag']=='pre' and hashlib.sha256(plain(chunk,n).encode()).hexdigest()==row['sourceDigest'])
        original=chunk[pre['start']:pre['end']]
        wrapped='<div class="ai-toolkit-source" data-ai-source role="region" aria-label="Complete original prompt: '+escape(row['title'],quote=True)+'" tabindex="0">'+original+'</div>'+ui('<div class="ai-toolkit-preview" data-ai-preview role="region" aria-label="Customized prompt preview" aria-live="off" tabindex="0" hidden></div>')
        chunk=chunk[:pre['start']]+wrapped+chunk[pre['end']:]
        ce=parse(chunk);status=next((n for n in ce.nodes if 'data-copy-status' in n['attrs'] or set(n['attrs'].get('class','').split())&{'copy-status','article-copy-status'}),None)
        status_id=status['attrs'].get('id') if status else None
        if not status_id:
            status_id=share_id+'-status'
            if status:
                raw=chunk[status['start']:status['inner']];chunk=chunk[:status['start']]+raw[:-1]+' id="'+escape(status_id)+'">'+chunk[status['inner']:]
            else:chunk=chunk[:chunk.rfind('</')]+ui('<p class="copy-status" id="'+escape(status_id)+'" data-copy-status role="status" aria-live="polite"></p>')+chunk[chunk.rfind('</'):]
        toolbar='<div class="ai-toolkit-actions"><button type="button" data-ai-action="copy" data-copy-target="'+escape(row['targetId'])+'" aria-describedby="'+escape(status_id)+'" disabled>Copy prompt</button><button type="button" data-ai-action="share" aria-describedby="'+escape(status_id)+'" disabled>Share prompt</button><button type="button" data-ai-action="chatgpt" aria-describedby="'+escape(status_id)+'" disabled>Open in ChatGPT ↗</button></div><p class="ai-toolkit-hint">ChatGPT: copy here, then paste in a new chat. Nothing is sent automatically. Share uses the original prompt link, without your inputs.</p>'
        chunk=chunk[:chunk.rfind('</')]+ui(toolbar)+chunk[chunk.rfind('</'):]
        source=source[:card['start']]+chunk+source[card['end']:]
    source=re.sub(r'<link\b[^>]*href="/assets/css/premium-ai-toolkit\.css[^\"]*"[^>]*>','',source)
    source=re.sub(r'<script\b[^>]*src="/assets/js/article-prompts\.js[^\"]*"[^>]*>\s*</script>','',source)
    source=source.replace('</head>','<link rel="stylesheet" href="/assets/css/premium-ai-toolkit.css"><script defer src="/assets/js/article-prompts.js"></script></head>',1)
    return source
