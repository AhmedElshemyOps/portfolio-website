"""Reviewed head metadata only; never rewrites teaching text, links or dates."""
from html import escape
import json
import re
from urllib.parse import urlsplit
from audit_seo import DOM

BASE = 'https://ahmedqualityops.com'


def load(root):
    path = root / 'content/discovery-metadata.json'
    if not path.exists():
        return {}
    data = json.loads(path.read_text())
    descriptions = data['pages']
    if not isinstance(descriptions, dict):
        raise ValueError('Discovery metadata pages must be an object')
    for route, description in descriptions.items():
        if not re.fullmatch(r'(?:articles|learning|collections|projects|resources)/[a-z0-9]+(?:-[a-z0-9]+)*/index\.html', route):
            raise ValueError('Invalid discovery metadata route: ' + route)
        path = root / route
        if not path.is_file() or not path.resolve().is_relative_to(root.resolve()):
            raise ValueError('Missing discovery metadata destination: ' + route)
        if not isinstance(description, str) or not 80 <= len(description) <= 180:
            raise ValueError('Review discovery description length: ' + route)
    return descriptions


def render(source, path, root):
    route = path.relative_to(root).as_posix()
    description = load(root).get(route)
    # Repair only demonstrated fragment-only collection links which point to the
    # homepage despite matching an existing section and visible jump on this page.
    doc = DOM(source).root
    canonical = [n.attrs.get('href') for n in doc.all('link') if n.attrs.get('rel') == 'canonical']
    if len(canonical) != 1 or canonical[0] != BASE + '/' + route:
        if description:
            raise ValueError('Discovery canonical mismatch: ' + route)
        return source
    ids = {n.attrs.get('id') for n in doc.all() if n.attrs.get('id')}
    jumps = {n.attrs.get('href') for n in doc.all('a')}
    if description:
        count = 0
        def meta(match):
            nonlocal count
            node = DOM(match[0]).root.all('meta')[0]
            key = node.attrs.get('name', node.attrs.get('property'))
            if key not in ('description', 'og:description', 'twitter:description'):
                return match[0]
            if key == 'description':
                count += 1
            return re.sub(r'\bcontent\s*=\s*(["\']).*?\1',
                          lambda _: 'content="' + escape(description, quote=True) + '"',
                          match[0], flags=re.S)
        source = re.sub(r'<meta\b[^>]*>', meta, source, flags=re.I)
        if count != 1:
            raise ValueError('Expected one description meta tag: ' + route)

    def schema(match):
        data = json.loads(match[2])
        changed = False
        def update(value):
            nonlocal changed
            if isinstance(value, list):
                for node in value:
                    update(node)
            elif isinstance(value, dict):
                if '@graph' in value:
                    update(value['@graph'])
                if description and value.get('@type') in ('Article', 'WebPage', 'CollectionPage') and (value.get('url') == canonical[0] or value.get('mainEntityOfPage') == canonical[0]):
                    if value.get('description') != description:
                        value['description'] = description
                        changed = True
                if value.get('@type') == 'CollectionPage':
                    entity = value.get('mainEntity', {})
                    if not isinstance(entity, dict) or entity.get('@type') != 'ItemList':
                        return
                    for item in entity.get('itemListElement', []):
                        url = item.get('url', '')
                        parsed = urlsplit(url)
                        if parsed.scheme == 'https' and parsed.netloc == 'ahmedqualityops.com' and parsed.path in ('', '/') and parsed.fragment in ids and '#' + parsed.fragment in jumps and route != 'index.html':
                            item['url'] = canonical[0] + '#' + parsed.fragment
                            changed = True
        update(data)
        if not changed:
            return match[0]
        payload = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
        return match[1] + payload + match[3]
    return re.sub(r'(<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>)(.*?)(</script>)', schema, source, flags=re.S)
