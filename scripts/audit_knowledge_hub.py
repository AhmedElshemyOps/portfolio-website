"""Reproducible local inventory and candidate-based editorial audit. Never publishes.
Candidate extraction is screening, not blanket factual verification.
"""
from pathlib import Path
import collections,csv,hashlib,itertools,json,math,re
from urllib.parse import urljoin,urlsplit
from audit_seo import DOM,schema_nodes
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'reports/knowledge-hub-restructure'

def blocks(source):
    dom=DOM(source).root
    article=next((n for n in dom.all('article') if 'article-body' in n.attrs.get('class','').split()),None)
    article=article or next(iter(dom.all('main')),dom)
    out=[]
    tags={'p','li','pre','tr','h2','h3'}
    for n in article.all():
        if n.tag not in tags:continue
        parent=n.parent;excluded=False
        while parent and parent is not article:
            if parent.tag in tags|{'nav','aside','header','footer','script','style'} or any(k in parent.attrs.get('class','') for k in ('library-connections','article-ending','knowledge-context','article-next','article-value','reading-connections','series-reading','article-feedback','newsletter')):
                excluded=True;break
            parent=parent.parent
        if excluded:continue
        text=' '.join(n.text().split())
        if text:out.append(text)
    return out,article,dom

def write_csv(name,rows):
    if not rows:return
    with (OUT/name).open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)

def substantial(text):
    return len(text.split())>=35 and not text.startswith(('Editorial note:','Operational teaching scenario','What to learn:','Read the articles','Related reading:','This is a working guide'))

def audit():
    OUT.mkdir(exist_ok=True,parents=True)
    registry=json.loads((ROOT/'content/article-registry.json').read_text()); by_url={x['url']:x for x in registry}; bodies={};inventory=[]; paragraphs=collections.defaultdict(set);claims=[];fin=[]
    incoming=collections.defaultdict(set);outgoing={}; metadata=[]
    for x in registry:
        source=(ROOT/x['url'].lstrip('/')).read_text();bs,a,d=blocks(source);bodies[x['url']]=bs
        sources=sorted({n.attrs['href'] for n in a.all('a') if n.attrs.get('href','').startswith('http') and 'ahmedqualityops.com' not in n.attrs['href']})
        links={urlsplit(urljoin('https://ahmedqualityops.com'+x['url'],n.attrs.get('href',''))).path for n in d.all('a') if urlsplit(urljoin('https://ahmedqualityops.com'+x['url'],n.attrs.get('href',''))).netloc=='ahmedqualityops.com'}
        outgoing[x['url']]=links&by_url.keys()
        for target in outgoing[x['url']]:
            if target!=x['url']:incoming[target].add(x['url'])
        canonical=[n.attrs.get('href') for n in d.all('link') if n.attrs.get('rel')=='canonical'];h1=[' '.join(n.text().split()) for n in d.all('h1')];description=next((n.attrs.get('content','') for n in d.all('meta') if n.attrs.get('name')=='description'),'')
        nodes,errors=schema_nodes(source)
        inventory.append(dict(id=x['id'],url=x['url'],kind=x['type'],fileExists=True,title=x['title'],h1=' | '.join(h1),canonical=' | '.join(canonical),primaryCategory=x['primaryCategory'],subcategory=x['subcategory'],seriesId=x['seriesId'],seriesPosition=x.get('seriesPosition'),bodyWords=len(re.findall(r"\b[\w'-]+\b",' '.join(bs))),sourceLinks=len(sources),outgoingArticles=len(outgoing[x['url']]),incomingArticles=0,metadataIssue='; '.join((["H1 differs from registry"] if h1!=[x['title']] else [])+(['Description missing'] if not description else [])+(['Canonical conflict'] if canonical!=['https://ahmedqualityops.com'+x['url']] else [])+errors)))
        for pos,b in enumerate(bs):
            if substantial(b):paragraphs[b].add(x['url'])
            kind=[]
            if re.search(r'\b(law|legal|regulat\w*|GDPR|VAT|permit|exemption|safety|mandatory)\b',b,re.I):kind.append('Legal / regulatory / safety')
            if re.search(r'\d',b) and re.search(r'\b(sav\w*|reduc\w*|increas\w*|percent|million)\b|%',b,re.I):kind.append('Numerical / outcome')
            if kind:
                claims.append(dict(url=x['url'],block=pos,screeningType='; '.join(kind),excerpt=b,articleSources=' | '.join(sources),status='REVIEW: candidate sentence, not independently verified; may be a caution, prompt or illustrative input',nextAction='Check scope, source, date and scenario label before treating as a factual claim.'))
            if re.search(r'\d',b) and re.search(r'AED|EUR|€|\bROI\b|\bTCO\b|break.even|margin|markup|savings|compliance|productivity',b,re.I):
                fin.append(dict(url=x['url'],block=pos,excerpt=b,status='Pending contextual reconciliation unless explicitly covered in fact-check-report.md; extraction also includes inputs and prompt scenarios'))
    for row in inventory:row['incomingArticles']=len(incoming[row['url']])
    write_csv('article-inventory.csv',inventory)
    write_csv('taxonomy-mapping.csv',[{k:(' | '.join(x[k]) if isinstance(x[k],list) else x.get(k,'')) for k in ['id','url','primaryCategory','subcategory','tags','seriesId','seriesPosition','seriesTitle','summary','classificationRationale','relatedArticles']} for x in registry])
    write_csv('claim-review-queue.csv',claims);write_csv('financial-review-queue.csv',fin)
    # Repeated exact prose is factual evidence. Pairs are screening signals, not merge verdicts.
    repeated={b:urls for b,urls in paragraphs.items() if len(urls)>1}
    pair_blocks=collections.defaultdict(list)
    for b,urls in repeated.items():
        for pair in itertools.combinations(sorted(urls),2):pair_blocks[pair].append(b)
    pair_rows=[]
    for (a,b),shared in pair_blocks.items():
        words=sum(len(t.split()) for t in shared)
        if words>=80:pair_rows.append(dict(urlA=a,urlB=b,exactRepeatedWords=words,exactPassages=len(shared),example=shared[0],decision='Differentiate repeated prose; similarity alone does not justify merging.'))
    pair_rows.sort(key=lambda x:x['exactRepeatedWords'],reverse=True);write_csv('duplicate-pairs.csv',pair_rows)
    # Near-duplicate candidate screen: token shingles within paragraph length bands, across different articles.
    # Skip widely reused prose here because it is already documented as shared scaffolding.
    unique=[(b,urls) for b,urls in paragraphs.items() if len(urls)==1 and len(b.split())<250]
    shingle_index=collections.defaultdict(set);shingles=[]
    for i,(b,urls) in enumerate(unique):
        words=re.findall(r'\w+',b.lower());sh=set(tuple(words[j:j+5]) for j in range(len(words)-4));shingles.append(sh)
        for t in sh:shingle_index[t].add(i)
    near=[];seen=set()
    for i,(b,urls) in enumerate(unique):
        candidates=collections.Counter(j for t in shingles[i] for j in shingle_index[t] if j>i)
        for j,intersection in candidates.items():
            other,urls2=unique[j]
            if urls==urls2:continue
            score=intersection/len(shingles[i]|shingles[j])
            if score>=.65:
                key=tuple(sorted([next(iter(urls)),next(iter(urls2))]))
                if key in seen:continue
                seen.add(key);near.append(dict(urlA=key[0],urlB=key[1],jaccard=round(score,3),passageA=b,passageB=other,status='Near-duplicate candidate; review wording in context before editing.'))
    write_csv('near-duplicate-candidates.csv',near)
    recs=[]
    for x in registry:
        bs=bodies[x['url']];shared=[b for b in bs if b in repeated];words=sum(len(b.split()) for b in bs)
        decision='DIFFERENTIATE' if sum(len(b.split()) for b in shared)>=150 else 'KEEP'
        action='Keep the distinct learning objective and tools. Replace repeated framing with subject-specific evidence during an approved editorial pass.' if decision=='DIFFERENTIATE' else 'Retain the existing article and its distinct method; maintain sources and companion links.'
        if x['type']=='Article' and words<700:decision='EXPAND';action='Add a worked example and explicit implementation checks; preserve the current URL.'
        if x['id']=='amsterdam-product-discovery-08-commercial-model-unit-economics':decision='REVIEW';action='Arithmetic reconciled with ex-VAT commission model. Verify the assumed card mix and supplier/channel contract terms before commercial use.'
        evidence=shared[0] if shared else x.get('classificationRationale',x['description'])
        recs.append(dict(id=x['id'],url=x['url'],kind=x['type'],decision=decision,evidence=evidence,repeatedSubstantivePassages=len(shared),action=action,verificationScope='Body extraction + overlap screening + objective/selected-example review; not a sentence-by-sentence fact certification.'))
    write_csv('editorial-audit.csv',recs)
    report=['# Body-level duplication audit','', 'All 133 registry pages were parsed. Global chrome, navigation, related modules, headings-only comparisons and shared disclaimer prefixes are excluded from duplicate evidence. Nested text blocks are counted once. Exact prose, repeated scaffolding and thematic overlap are distinguished. Near matches use five-word token shingles at Jaccard ≥0.65; candidates require editorial judgment.','',f'{len(repeated)} distinct exact passages of at least 35 words recur; {len(pair_rows)} pairs share at least 80 words; {len(near)} near-match pairs are candidates. These are not counts of duplicate whole articles. No whole-article merges have been performed.','', '## Confirmed repeated substantive prose','']
    for b,urls in sorted(repeated.items(),key=lambda kv:len(kv[1])*len(kv[0]),reverse=True)[:25]:
        report+=['> '+b,'','Appears in: '+', '.join('['+by_url[u]['title']+'](https://ahmedqualityops.com'+u+')' for u in sorted(urls)), '', 'Remedy: keep a short principle in the foundational guide; use a specific control, decision or worked example in each application. Preserve all URLs.','']
    report+=['## Priority families: distinction and proposed boundaries','',
'- Quotation guides: the city-tour guide covers intake, feasibility and cost-to-offer workflow; the client-quotation guide covers the external document and exclusions. Keep both; cross-link the internal worksheet and separate audience expectations.',
'- STP guides: “Where Does STP Fit?” selects when to test and defines readiness scope; “How to Create STPs” specifies executable test steps, expected results and defect evidence. Differentiate shared approval/measurement paragraphs; do not merge based on the shared acronym.',
'- Operating system / operations manual: system architecture connects roles, policies, execution and learning; the manual is a controlled navigation/publication layer. Retain both and reduce repeated generic management prose.',
'- HOTEL / TRAVEL frameworks: department systems and authority differ from multi-supplier travel handoffs. Recurring prompt guardrails are intentional reusable controls, not evidence that the prompts solve the same task.',
'- Guest experience / complaint recovery: journey-wide prevention differs from handling an individual complaint, escalation and closure. Preserve both; label the handoff between prevention and recovery.',
'- COPQ / service failure: monthly aggregate rework cost differs from per-incident labor, parts and compensation. The worked scenarios are different, while repeated introductory paragraphs should be differentiated.',
'- Maintenance / reliability / KPIs: strategy, work-order execution, compliance measurement and composite reliability scoring are distinct decisions. Several opening paragraphs recur and deserve topic-specific replacements.',
'', '## Approval boundary','No MERGE CANDIDATE is recommended solely from similarity scores. A future consolidation would need an approved content map, distinct useful material retained at both current URLs, and no automatic redirects. No article was deleted or rewritten in this restructuring.','']
    (OUT/'duplicate-content-report.md').write_text('\n'.join(report))
    summary=dict(registry=len(registry),articles=sum(x['type']=='Article' for x in registry),seriesIndexes=sum(x['type']=='Series index' for x in registry),articleFiles=len(list((ROOT/'articles').glob('*/index.html'))),unregistered=sorted('/'+str(p.relative_to(ROOT)) for p in (ROOT/'articles').glob('*/index.html') if '/'+str(p.relative_to(ROOT)) not in by_url),missing=[x['url'] for x in registry if not (ROOT/x['url'].lstrip('/')).exists()],orphans=[x['url'] for x in registry if not incoming[x['url']]],editorial=dict(collections.Counter(x['decision'] for x in recs)),metadataIssues=[x for x in inventory if x['metadataIssue']],exactRepeatedPassages=len(repeated),nearCandidates=len(near),claimCandidates=len(claims),financialCandidates=len(fin))
    (OUT/'audit-summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
if __name__=='__main__':audit()
