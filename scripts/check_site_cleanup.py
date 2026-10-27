"""Audit every public page, asset reference and tracked file after site cleanup."""
import argparse,collections,json,re,subprocess,sys
from pathlib import Path
from urllib.parse import urlsplit,unquote
from render_shared import pages
from bundle_page_styles import unpack
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]

def audit(root=ROOT):
    results=[];missing=[];external=set();referenced=set();css_sources=set()
    for path in pages(root):
        source=path.read_text();nodes=parse(source).nodes;plain=unpack(source);relative=path.relative_to(root).as_posix();issues=[]
        redirects=[n for n in nodes if n['tag']=='meta' and n['attrs'].get('http-equiv','').lower()=='refresh']
        if not redirects:
            for tag in ('h1','main'):
                if sum(n['tag']==tag for n in nodes)!=1:issues.append('Expected one '+tag)
            if sum(n['tag']=='nav' and n['attrs'].get('aria-label')=='Primary navigation' for n in nodes)!=1:issues.append('Expected one primary navigation')
        active_ui=[n for n in nodes if any(c.startswith('newsletter-') or c=='article-newsletter' for c in n['attrs'].get('class','').split()) or 'data-newsletter-form' in n['attrs']]
        if active_ui:issues.append('Subscription UI remains')
        if re.search(r'<script\b[^>]*newsletter\.js|href=["\']/newsletter/|sibforms\.com',source,re.I):issues.append('Subscription link or service remains')
        if not redirects and sum(n['tag']=='footer' and 'platform-footer' in n['attrs'].get('class','').split() for n in nodes)!=1:issues.append('Expected one shared footer')
        if relative.startswith('articles/') and sum('article-finish' in n['attrs'].get('class','').split() for n in nodes)!=1:issues.append('Expected one shared article finish')
        counts=collections.Counter(n['attrs'].get('id') for n in nodes if n['attrs'].get('id'))
        if any(v>1 for v in counts.values()):issues.append('Duplicate IDs')
        for n in parse(plain).nodes:
            refs=[n['attrs'][key] for key in ('href','src','poster') if n['attrs'].get(key)]
            refs += [x.strip().split()[0] for x in n['attrs'].get('srcset','').split(',') if x.strip()]
            for ref in refs:
                u=urlsplit(ref)
                if u.scheme in {'http','https'} and u.hostname not in {'ahmedqualityops.com','www.ahmedqualityops.com'}:
                    if n['tag']=='a':external.add(ref)
                    continue
                if u.scheme and u.scheme not in {'http','https'}:continue
                if not u.path:continue
                target=(root/u.path.lstrip('/') if u.path.startswith('/') or u.scheme else path.parent/u.path).resolve()
                if target.is_dir():target=target/'index.html'
                if not target.is_file():missing.append(dict(page=relative,reference=ref))
                else:
                    referenced.add(target)
                    if target.suffix=='.css':css_sources.add(target)
        results.append(dict(page=relative,redirect=bool(redirects),issues=issues))
    queue=list(css_sources);seen=set()
    while queue:
        path=queue.pop()
        if path in seen:continue
        seen.add(path);css=path.read_text()
        for value in re.findall(r'url\(\s*["\']?([^\)"\']+)',css):
            u=urlsplit(value)
            if u.scheme or u.netloc or not u.path:continue
            target=(root/u.path.lstrip('/') if u.path.startswith('/') else path.parent/u.path).resolve()
            if not target.is_file():missing.append(dict(page=str(path.relative_to(root)),reference=value))
            else:
                referenced.add(target)
                if target.suffix=='.css':queue.append(target)
    tracked=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z'],cwd=root).decode().split('\0')
    files=[root/p for p in tracked if p and (root/p).is_file()]
    inventory=collections.Counter(p.suffix or '[no extension]' for p in files)
    generated=list((root/'assets/css/generated').glob('*.css'))
    # Generated bundles are referenced by rendered HTML, not its unpacked source.
    bundle_refs=set()
    for path in pages(root):bundle_refs.update(re.findall(r'/assets/css/generated/[^"?]+\.css',path.read_text()))
    unused=[str(p.relative_to(root)) for p in generated if '/'+p.relative_to(root).as_posix() not in bundle_refs]
    return dict(pagesChecked=len(results),articlePagesChecked=sum(r['page'].startswith('articles/') for r in results),filesInventoried=len(files),fileTypes=dict(sorted(inventory.items())),sourceStylesheetsChecked=len(seen),missingReferences=missing,unusedGeneratedBundles=unused,externalLinks=sorted(external),pages=results,passed=not missing and not unused and all(not r['issues'] for r in results))

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output',type=Path);args=p.parse_args();report=audit()
    if args.output:args.output.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:v for k,v in report.items() if k not in {'pages','externalLinks','unusedGeneratedBundles'}},indent=2));raise SystemExit(not report['passed'])
