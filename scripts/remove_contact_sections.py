"""Remove retired standalone contact pitches; preserve the shared footer contacts."""
import re
from apply_field_manual import parse

def render(source):
 nodes=parse(source).nodes
 removed=[n for n in nodes if n['tag']=='section' and n['attrs'].get('id') in {'contact','profile-contact'}]
 for node in reversed(removed):source=source[:node['start']]+source[node['end']:]
 source=re.sub(r'<script\b[^>]*src="/assets/js/contact-actions\.js[^\"]*"[^>]*>\s*</script>','',source)
 source=source.replace('href="/#contact"','href="/#site-footer"').replace('href="#contact"','href="#site-footer"')
 source=source.replace('href="/profile/index.html#profile-contact"','href="mailto:ahmed.mahmoud.nl.work@gmail.com"')
 return source
