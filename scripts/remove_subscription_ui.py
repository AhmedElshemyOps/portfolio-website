"""Keep retired subscription UI out of shared renders and future publications."""
import re
from apply_field_manual import parse

def render(source):
    nodes=parse(source).nodes
    removed=[]
    for n in nodes:
        classes=n['attrs'].get('class','').split()
        if any(c.startswith('newsletter-') or c=='article-newsletter' for c in classes):removed.append(n)
        elif 'data-newsletter-form' in n['attrs']:removed.append(n)
        elif n['tag']=='a' and n['attrs'].get('href','').startswith('/newsletter/'):
            removed.append(n['parent'] if n.get('parent') and n['parent']['tag']=='li' else n)
        elif n['tag']=='script' and n['attrs'].get('src','').split('?')[0]=='/assets/js/newsletter.js':removed.append(n)
        elif n['tag']=='section' and re.search(r'<h[2-6]\b[^>]*>\s*Newsletter subscriptions\s*</h',source[n['inner']:n['end']],re.I):removed.append(n)
    outer=[n for n in removed if not any(a['start']<n['start'] and a['end']>=n['end'] for a in removed)]
    for n in sorted(outer,key=lambda n:n['start'],reverse=True):source=source[:n['start']]+source[n['end']:]
    return source
