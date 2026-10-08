"""Sync current public contact fields, then render the shared static components.

Availability metadata is intentionally not rendered. The homepage is authored
as HTML; archived compiled bundles are retained and never patched by this task.
"""
from pathlib import Path
from html import escape
import json
import re

from render_shared import apply as render_shared, pages

ROOT = Path(__file__).resolve().parents[1]


def apply(root=ROOT):
    data = json.loads((root / 'content/site-contact.json').read_text())
    email = escape(data['email'], quote=True)
    phone = escape(data['phone_display'])
    phone_action = 'tel:' + escape(data['phone_e164'], quote=True)
    replacements = {'a.mahmoud.0412@gmail.com': email, 'contact@ahmedqualityops.com': email}
    for name in ('footer', 'home-footer'):
        path = root / 'templates' / f'{name}.html'
        source = path.read_text()
        for previous_email in re.findall(r'href="mailto:([^"]+)"', source):
            replacements[previous_email] = email
        for previous_phone in re.findall(r'href="(tel:[^"]+)"', source):
            replacements[previous_phone] = phone_action
        for previous_display in re.findall(r'class="professional-phone"[^>]*>([^<]+)', source):
            replacements[previous_display] = phone
        source = re.sub(r'href="mailto:[^"]+"', 'href="mailto:' + email + '"', source)
        source = re.sub(r'(<a\b[^>]*class="professional-phone"[^>]*href=")[^"]+("[^>]*>)[^<]+',
                        lambda m: m[1] + phone_action + m[2] + phone, source)
        path.write_text(source)
    changed = 0
    for path in pages(root):
        original = source = path.read_text()
        for previous, current in replacements.items():
            source = source.replace(previous, current)
        if path == root / 'index.html':
            source = re.sub(r'(<a href="mailto:)[^"]+("[^>]*>\s*<svg\b.*?</svg>\s*<span>)[^<]+',
                            lambda m: m[1] + email + m[2] + email, source, flags=re.S)
            source = re.sub(r'(<a href="tel:)[^"]+("[^>]*>\s*<svg\b.*?</svg>\s*<span>)[^<]+',
                            lambda m: m[1] + data['phone_e164'] + m[2] + phone, source, flags=re.S)
            def person(match):
                item = json.loads(match[1])
                if item.get('@type') != 'Person':
                    return match[0]
                item.update(email=data['email'], telephone=data['phone_e164'])
                return '<script type="application/ld+json">' + json.dumps(item, ensure_ascii=False, separators=(',', ':')) + '</script>'
            source = re.sub(r'<script type="application/ld\+json">\s*(.*?)\s*</script>', person, source, flags=re.S)
        if source != original:
            path.write_text(source)
            changed += 1
    render_shared(root)
    return changed


if __name__ == '__main__':
    print('Contact information updated on', apply(), 'HTML pages.')
