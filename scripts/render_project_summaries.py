"""Keep the four reviewed project facts before artwork and detailed research."""
from html import escape
import json,re
from apply_field_manual import parse

def render(source,path,root):
    data=root/'content/projects.json'
    if not data.is_file():return source
    project=next((p for p in json.loads(data.read_text()) if '/'+path.relative_to(root).as_posix()==p['caseStudy']),None)
    if not project or 'summaryProblem' not in project:return source
    e=escape;p={k:e(v,quote=True) for k,v in project.items()}
    facts=(f'<section class="project-summary" aria-labelledby="project-summary-title"><h2 id="project-summary-title">Project at a glance</h2><dl>'
      f'<div><dt>Problem</dt><dd>{p["summaryProblem"]}</dd></div>'
      f'<div><dt>My contribution</dt><dd>{p["summaryContribution"]}</dd></div>'
      f'<div><dt>Outputs</dt><dd>{p["output"]}. <a href="#project-output-preview">See the output preview</a></dd></div>'
      f'<div><dt>Evidence and scope</dt><dd><a href="{p["demo"]}">{p["summaryEvidence"]}</a><span>{p["summaryBoundary"]}</span></dd></div></dl></section>')
    doc=parse(source);intro=next(n for n in doc.nodes if 'product-introduction' in doc.classes(n))
    content=(f'<div class="product-introduction"><p class="project-audience"><strong>For:</strong> {p["summaryAudience"]}</p>'+facts+
      f'<div class="action-row"><a class="button" href="{p["demo"]}" data-analytics-event="project_demo_open">Try the demo</a><a class="button secondary" href="#product-research">Read the method and scope</a></div></div>')
    source=source[:intro['start']]+content+source[intro['end']:]
    doc=parse(source);preview=next(n for n in doc.nodes if 'project-output-preview' in doc.classes(n))
    edits=[]
    for n in doc.nodes:
        if n['parent'] is preview and n['tag']=='p' and re.match(r'<p><strong>My contribution:</strong>',source[n['start']:n['end']]):edits.append((n['start'],n['end'],''))
    if not preview['attrs'].get('id'):
        tag=source[preview['start']:preview['inner']];edits.append((preview['start'],preview['inner'],tag[:-1]+' id="project-output-preview">'))
    for a,b,value in sorted(edits,reverse=True):source=source[:a]+value+source[b:]
    source=source.replace('What the prototype proves','What you can inspect')
    return source
