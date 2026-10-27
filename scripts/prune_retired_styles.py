"""Remove only selectors for explicitly retired UI; preserve shared rule branches."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
RETIRED=re.compile(r'\.(?:newsletter-[\w-]+|article-newsletter|article-followups|article-growth|article-sequence|sequence-empty|series-nav|article-github-cta[\w-]*|repository-actions|github-button[\w-]*|article-footer[\w-]*|article-related[\w-]*)(?![\w-])')

def split_selectors(text):
    start=0;depth=0;quote=None;out=[]
    for i,c in enumerate(text):
        if quote:
            if c==quote and (i==0 or text[i-1]!='\\'):quote=None
        elif c in '\"\'':quote=c
        elif c in '([':depth+=1
        elif c in ')]':depth-=1
        elif c==',' and depth==0:out.append(text[start:i]);start=i+1
    out.append(text[start:]);return out

def clean_selectors(text):
    # Mixed :is() lists need branch-level pruning, never deletion of live peers.
    def mixed(m):
        keep=[x for x in split_selectors(m[2]) if not RETIRED.search(re.sub(r'/\*.*?\*/','',x,flags=re.S))]
        return ':'+m[1]+'('+','.join(keep)+')' if keep else ':is(.__retired_never__)'
    text=re.sub(r':(is|where)\(([^()]*)\)',mixed,text)
    return ','.join(x for x in split_selectors(text) if not RETIRED.search(re.sub(r'/\*.*?\*/','',x,flags=re.S)) and '.__retired_never__' not in x)

def prune(css):
    out=[];start=0;i=0;quote=None
    while i<len(css):
        if css.startswith('/*',i):
            end=css.find('*/',i+2)
            if end<0:return css # Do not rewrite invalid source.
            i=end+2;continue
        c=css[i]
        if quote:
            if c==quote and (i==0 or css[i-1]!='\\'):quote=None
        elif c in '\"\'':quote=c
        elif c==';':out.append(css[start:i+1]);start=i+1
        elif c=='{':
            prelude=css[start:i];j=i+1;depth=1;q=None
            while j<len(css) and depth:
                if not q and css.startswith('/*',j):
                    end=css.find('*/',j+2)
                    if end<0:return css
                    j=end+2;continue
                ch=css[j]
                if q:
                    if ch==q and css[j-1]!='\\':q=None
                elif ch in '\"\'':q=ch
                elif ch=='{':depth+=1
                elif ch=='}':depth-=1
                j+=1
            if depth:return css
            body=css[i+1:j-1];kind=re.sub(r'/\*.*?\*/','',prelude,flags=re.S).strip()
            if kind.startswith(('@media','@supports','@layer','@container','@document')):
                body=prune(body)
                if re.sub(r'/\*.*?\*/','',body,flags=re.S).strip():out.append(prelude+'{'+body+'}')
            elif kind.startswith('@'):out.append(prelude+'{'+body+'}')
            else:
                selectors=clean_selectors(prelude)
                if re.sub(r'/\*.*?\*/','',selectors,flags=re.S).strip():out.append(selectors+'{'+body+'}')
            start=j;i=j;continue
        i+=1
    out.append(css[start:]);return ''.join(out)

def apply():
    changes=[]
    for p in sorted((ROOT/'assets/css').glob('*.css')):
        if p.name=='infraquote-bundle.css':continue # Rebuilt from its source manifest.
        old=p.read_text();new=prune(old)
        if old!=new:p.write_text(new);changes.append(str(p.relative_to(ROOT)))
    return changes
if __name__=='__main__':print('\n'.join(apply()))
