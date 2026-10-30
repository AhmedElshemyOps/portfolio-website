"""Build career routes from confirmed profile facts and reviewed project records."""
from html import escape
import json
import re
from audit_seo import DOM
from apply_field_manual import parse

E = escape
BASE = 'https://ahmedqualityops.com'
STYLE = '<link rel="stylesheet" href="/assets/css/career-routes.css">'


def entries(root):
    rows = json.loads((root/'content/career-routes.json').read_text())
    profile = json.loads((root/'content/professional-profile.json').read_text())
    projects = {p['slug']:p for p in json.loads((root/'content/projects.json').read_text())}
    companies = {p['company']:p for p in profile['career']}
    slugs = set()
    for row in rows:
        slug = row['slug']
        if not re.fullmatch(r'[a-z]+(?:-[a-z]+)*',slug) or slug in slugs:
            raise ValueError('Invalid or duplicate career route')
        slugs.add(slug)
        for fact in row['experience']:
            company = companies[fact['company']]
            for index in fact['contributions']:
                if type(index) is not int or not 0 <= index < len(company['contributions']):
                    raise ValueError('Career contribution must reference a confirmed fact')
        for slug in row['projects']:
            if slug not in projects:raise ValueError('Unknown project')
        for link in row['reading']:
            if not re.fullmatch(r'/(?:articles|series)/[a-z0-9-]+/index\.html',link) or not (root/link.lstrip('/')).is_file():
                raise ValueError('Career reading destination does not exist')
        if not any(q['name']==row['qualification'] for q in profile['iata']):
            raise ValueError('Unknown qualification')
    return rows, profile, projects, companies


def homepage_section(root):
    rows,_,_,_ = entries(root)
    cards = ''.join('<article class="career-route-card"><h3>'+E(r['title'])+'</h3><p>'+E(r['summary'])+'</p><a href="/careers/'+r['slug']+'/index.html">Explore '+E(r['title'])+' <span aria-hidden="true">→</span></a></article>' for r in rows)
    return '<section class="career-routes" id="career-routes" aria-labelledby="career-routes-title"><header><p class="eyebrow">For hiring teams</p><h2 id="career-routes-title">Experience for the work you need.</h2><p>Choose a professional focus to explore my relevant experience, selected projects and practical knowledge.</p></header><div class="career-route-grid">'+cards+'</div></section>'


def strip_homepage_addition(source, root):
    """Subtract only the exact additive section; never replace preservation baselines."""
    block = homepage_section(root)
    if source.count(block) != 1:raise ValueError('Career section missing, duplicated or changed')
    source=source.replace(block,'',1)
    source,count=re.subn(r'<link rel="stylesheet" href="/assets/css/career-routes\.css(?:\?v=[0-9a-f]{12})?">','',source)
    if count!=1:raise ValueError('Career stylesheet missing or duplicated')
    return source


def reading_link(link, root):
    dom = DOM((root/link.lstrip('/')).read_text()).root
    title = next(n.text().strip() for n in dom.all('h1'))
    return '<li><a href="'+link+'">'+E(title)+'</a></li>'


def page(row, root, profile, projects, companies):
    url = BASE+'/careers/'+row['slug']+'/index.html'
    experience=[]
    for fact in row['experience']:
        c=companies[fact['company']]
        experience.append('<article class="career-route-experience"><p class="meta">'+E(c['dates'])+' · '+E(c['location'])+'</p><h3>'+E(c['company'])+'</h3><p class="career-route-department">'+E(c['department'])+'</p><ul>'+''.join('<li>'+E(c['contributions'][i])+'</li>' for i in fact['contributions'])+'</ul></article>')
    projects_html=''.join('<article class="career-route-project"><p class="eyebrow">Portfolio demonstration</p><h3>'+E(projects[slug]['name'])+'</h3><p>'+E(projects[slug]['summaryContribution'])+'</p><p class="meta">'+E(projects[slug]['summaryBoundary'])+'</p><a href="'+projects[slug]['caseStudy']+'">Explore '+E(projects[slug]['name'])+' <span aria-hidden="true">→</span></a></article>' for slug in row['projects'])
    q=next(q for q in profile['iata'] if q['name']==row['qualification'])
    body='<div class="career-route-intro"><p class="eyebrow">Professional focus · Ahmed Mahmoud</p><h1>'+E(row['title'])+'</h1><p class="intro">'+E(row['summary'])+'</p><p class="career-route-availability">'+E(profile['location'])+' · '+E(profile['work_authorisation'])+'</p><div class="actions"><a class="button primary" href="/documents/Ahmed-Mahmoud-CV.pdf" download>Download CV</a><a class="button secondary" href="/profile/index.html#career">View complete experience</a></div></div>'
    body+='<section aria-labelledby="relevant-experience-title"><h2 id="relevant-experience-title">Relevant professional experience</h2><p class="meta">Selected responsibilities from my professional record, presented by department and contribution.</p>'+''.join(experience)+'</section>'
    body+='<section aria-labelledby="selected-projects-title"><h2 id="selected-projects-title">Explore how I approach the work</h2><p>These projects make my methods inspectable. They are portfolio demonstrations, with their scope stated separately from workplace experience.</p><div class="career-route-projects">'+projects_html+'</div></section>'
    body+='<section class="career-route-resources" aria-labelledby="further-evidence-title"><h2 id="further-evidence-title">Qualifications and practical reading</h2><p><a href="'+q['evidence_url']+'">IATA '+E(q['name'])+'</a> · '+E(q['date'])+'</p><ul>'+''.join(reading_link(link,root) for link in row['reading'])+'</ul><a href="/profile/index.html#qualifications">View all professional qualifications</a></section>'
    body+='<nav class="career-route-other" aria-label="Other professional focuses">'+''.join('<a href="/careers/'+r['slug']+'/index.html">'+E(r['title'])+'</a>' for r in entries(root)[0] if r['slug']!=row['slug'])+'</nav>'
    schema={'@context':'https://schema.org','@type':'WebPage','@id':url,'url':url,'name':row['title']+' | Ahmed Mahmoud','description':row['summary'],'about':{'@type':'Person','name':profile['name'],'url':BASE+'/profile/index.html'}}
    template=(root/'templates/career-route.html.in').read_text()
    for key,value in {'title':E(schema['name']),'description':E(row['summary'],quote=True),'canonical':url,'schema':json.dumps(schema,ensure_ascii=False).replace('<','\\u003c'),'header':(root/'templates/header.html').read_text().strip(),'footer':(root/'templates/footer.html').read_text().strip(),'body':body}.items():template=template.replace('{{'+key+'}}',value)
    return template


def render(source,path,root):
    if not (root/'content/career-routes.json').is_file():return source
    relative=path.relative_to(root).as_posix()
    rows,profile,projects,companies=entries(root)
    row=next((r for r in rows if relative=='careers/'+r['slug']+'/index.html'),None)
    if row:return page(row,root,profile,projects,companies)
    if relative!='index.html':return source
    nodes=parse(source).nodes
    old=next((n for n in nodes if n['attrs'].get('id')=='career-routes'),None)
    if old:source=source[:old['start']]+homepage_section(root)+source[old['end']:]
    else:
        snapshot=next((n for n in nodes if 'snapshot' in n['attrs'].get('class','').split()),None)
        if snapshot is None:return source
        source=source[:snapshot['end']]+homepage_section(root)+source[snapshot['end']:]
    source=re.sub(r'<link\b[^>]*href="/assets/css/career-routes\.css[^\"]*"[^>]*>','',source)
    return source.replace('</head>',STYLE+'</head>',1)
