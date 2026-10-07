"""Apply the authorized public contact fields without changing article routes."""
from pathlib import Path
import json
import re
from html import escape

ROOT = Path(__file__).resolve().parents[1]

def apply(root=ROOT):
    data = json.loads((root / 'content/site-contact.json').read_text())
    email, phone = data['email'], data['phone_display']
    email_action, phone_action = 'mailto:' + email, 'tel:' + data['phone_e164']
    availability = data['availability_text']
    old_footer = (root / 'templates/footer.html').read_text().strip()
    footer = old_footer.replace('a.mahmoud.0412@gmail.com', email)
    footer = re.sub(r'<a href="mailto:[^"]+">(?:Contact|Email Ahmed)</a>(?:<a class="professional-phone"[^>]+>.*?</a>)?', '<a href="'+email_action+'">Email Ahmed</a><a class="professional-phone" href="'+phone_action+'">'+phone+'</a>', footer)
    if 'data-professional-availability' not in footer:
        footer = footer.replace('</p></div><nav', '</p><p class="professional-availability" data-professional-availability>'+escape(availability)+'</p></div><nav', 1)
    (root / 'templates/footer.html').write_text(footer+'\n')
    changed = 0
    for path in root.rglob('*.html'):
        if any(p in {'.git','docs','templates','node_modules'} for p in path.relative_to(root).parts): continue
        original = s = path.read_text()
        s = s.replace('a.mahmoud.0412@gmail.com', email).replace('contact@ahmedqualityops.com', email)
        if path != root / 'index.html':
            if re.search(r'<footer\b[^>]*class="platform-footer"', s):
                s = re.sub(r'<footer\b[^>]*class="platform-footer"[^>]*>.*?</footer>',lambda m:footer,s,count=1,flags=re.S)
            elif '</body>' in s:
                s = s.replace('</body>',footer+'</body>')
        if path == root / 'profile/index.html':
            s = s.replace('I am available for suitable opportunities across GCC countries and hold a residence permit in the Netherlands.', availability+' Currently based in Abu Dhabi and relocating to the Netherlands.')
        if path == root / 'resources/recruiter-summary/index.html' and 'data-contact-summary' not in s:
            s = s.replace('<div class="action-row">','<p class="professional-availability" data-contact-summary>'+escape(availability)+'</p><div class="action-row">',1)
        if path == root / 'index.html':
            if 'data-contact-summary' not in s:
                s=s.replace('<nav aria-label="Immediate portfolio links">','<p class="professional-availability" data-contact-summary>'+escape(availability)+'</p><nav aria-label="Immediate portfolio links">',1)
                s=s.replace('</nav></section></main>',' · <a href="'+email_action+'">Email Ahmed</a> · <a href="'+phone_action+'">'+phone+'</a></nav></section></main>',1)
            def person(m):
                try: d=json.loads(m.group(1))
                except json.JSONDecodeError:return m.group(0)
                if d.get('@type')=='Person':
                    d['email']=email;d['telephone']=data['phone_e164']
                    return '<script type="application/ld+json">'+json.dumps(d,ensure_ascii=False,separators=(',',':'))+'</script>'
                return m.group(0)
            s=re.sub(r'<script type="application/ld\+json">\s*(.*?)\s*</script>',person,s,flags=re.S)
        if s!=original:path.write_text(s);changed+=1
    # Existing deployment has a compiled homepage; update only exact public literals.
    for path in (root / 'assets').glob('index-*.js'):
        s=original=path.read_text()
        old_encoded=json.dumps(old_footer,ensure_ascii=True)
        new_encoded=json.dumps(footer,ensure_ascii=True)
        s=s.replace(old_encoded,new_encoded).replace('a.mahmoud.0412@gmail.com',email)
        # React renders the footer element itself, so its literal contains inner HTML.
        footer_inner=re.sub(r'^<footer[^>]*>|</footer>$','',footer)
        s=re.sub(r'(className:"platform-footer",dangerouslySetInnerHTML:\{__html:)("(?:[^"\\]|\\.)*")',lambda m:m.group(1)+json.dumps(footer_inner,ensure_ascii=True),s)
        if 'className:"professional-availability hero-availability"' not in s:
            availability_node='c.jsx("p",{className:"professional-availability hero-availability",children:'+json.dumps(availability)+'})'
            s=re.sub(r'(c\.jsx\("p",\{className:"hero-summary",children:"[^"]*"\}\))',lambda m:m.group(1)+','+availability_node,s,count=1)
        if 'className:"hero-contact-actions"' not in s:
            contact_node='c.jsxs("div",{className:"hero-contact-actions",children:[c.jsx("a",{href:'+json.dumps(email_action)+',children:"Email Ahmed"}),c.jsx("a",{href:'+json.dumps(phone_action)+',children:'+json.dumps(phone)+'})]}),'
            s=s.replace('c.jsxs("ul",{className:"hero-tags"',contact_node+'c.jsxs("ul",{className:"hero-tags"',1)
        s=s.replace('Available to work across GCC countries and in the Netherlands','Available in the Netherlands from 1 November 2026')
        s=s.replace('GCC: open to suitable employment and relocation opportunities · Netherlands: residence permit holder. Final work eligibility remains subject to employer and jurisdiction requirements.','Netherlands residence and work authorization secured; no employer sponsorship required. Currently based in Abu Dhabi and relocating to the Netherlands.')
        # If the previous footer is already updated, no replacement is needed.
        if s!=original:path.write_text(s)
    cached = root / "content/article-content.json"
    if cached.exists():
        original = cached.read_text()
        updated = original.replace("a.mahmoud.0412@gmail.com", email).replace("contact@ahmedqualityops.com", email)
        if updated != original: cached.write_text(updated)
    return changed

if __name__=='__main__': print('Contact information updated on',apply(),'HTML pages.')
