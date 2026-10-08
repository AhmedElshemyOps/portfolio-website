#!/usr/bin/env python3
"""Render consistent five-stage examples from existing scenarios and curated rules."""
import hashlib
import html
import json
import re
from pathlib import Path
from apply_field_manual import ROOT, parse
from clean_article_openings import text

FIELDS=('Situation','Evidence','Decision','Action','Verification')
PATTERN=re.compile(r'^(?:running example:|case study:|full journey case study:|example(?::|$)|practical scenario|the operating scenario|a quantified|fictional|illustrative .*?(?:example|scenario|request)|(?:abu dhabi|tourism) example|real case example|from partnership introduction|a realistic morning scenario|the hierarchy in one)',re.I)
REGISTRY=ROOT/'content/editorial/practical-examples.json'
REVIEWED_HOTEL_CONTROLS=json.loads((ROOT/'maintenance/seo/hotel-example-controls.json').read_text())
# These are instructions for applying a teaching example, never reported outcomes.
RULES=[
 (r'medical|unwell|health|injur|missing delegate|cannot be contacted',
  'Check the current incident record, verified guest-contact status, location and approved safety or escalation procedure.',
  'Decide which authorised responder or escalation owner must take over; do not substitute an unverified assumption for an assessment.',
  'Follow the approved escalation route, assign the response owner and record confirmed observations and communications.',
  'Confirm the responsible team has accepted the handover and record the verified status before closing the operational incident.'),
 (r'mobility|accessib|dietary|meal|speaker|badge|registration|venue|ballroom|breakout',
  'Check the approved delegate requirements, venue confirmation, access or capacity limits and the latest movement or registration record.',
  'Decide whether the planned venue handover remains feasible or needs an approved alternative before making a guest promise.',
  'Coordinate the venue, registration and movement owners; communicate the approved arrangement and record unresolved dependencies.',
  'Confirm the delegate reaches the intended service point and that the responsible venue or registration team has accepted the handover.'),
 (r'coach|driver|transport|arrival|airport|departure|pickup|fleet|movement|transfer|backup ladder',
  'Check the approved service brief, current passenger count, confirmed vehicle and driver, access conditions, deadlines and activation authority.',
  'Decide whether to release, wait, reroute or activate the approved backup using verified readiness and the stated decision deadline.',
  'Assign the movement owner, obtain the required approval, communicate the plan to the next team and log the change against the service reference.',
  'Reconcile the physical count with the movement record, confirm the receiving team’s handover and keep unresolved passengers or tasks open.'),
 (r'quotation|pricing|markup|margin|break.even|participant|sales|rfq|rfp|rfi|nda|commercial|revenue|finance|cost|economic',
  'Check the stated quantities and calculation inputs against approved supplier rates, costs, commercial terms and the applicable source records.',
  'Decide whether the proposal or calculation is supportable, which assumptions need testing and whether commercial approval is required.',
  'Prepare the cost or proposal review with explicit assumptions, separate confirmed inputs from estimates and send it to the authorised reviewer.',
  'Recalculate from the approved inputs, reconcile totals and terms and record approval before issuing a price or claiming a saving.'),
 (r'asset|maintenance|engineering|spare|reliability|downtime|work.order|repair|preventive',
  'Check asset identity, work-order history, inspection evidence, current status, parts availability and the applicable maintenance standard.',
  'Decide the work priority and whether the asset can remain available; reserve release decisions for the authorised technical owner.',
  'Assign the work order, plan the approved intervention and record dependencies, parts, evidence and the next review checkpoint.',
  'Check completion against the acceptance standard, confirm authorised release and review repeat failures before closing the work.'),
 (r'housekeeping|room.readiness|guest.ready|first.time|inspection|clean',
  'Check the apartment status, inspection results, open defects, required amenities and the approved release criteria.',
  'Decide whether the apartment meets the release standard or must remain on hold with an accountable defect owner.',
  'Allocate the correction, coordinate housekeeping and engineering dependencies and update the readiness record.',
  'Reinspect failed items and confirm the authorised release; a completed task alone does not prove the apartment is ready.'),
 (r'inventory|par.level|stock|reorder|linen|procurement|supplier',
  'Check item specifications, usable stock, count accuracy, demand, lead time and current supplier or delivery evidence.',
  'Decide the replenishment, acceptance or supplier action using service risk and approved procurement authority.',
  'Record the approved order or corrective action, assign the owner and track the delivery or resolution checkpoint.',
  'Reconcile receipt and acceptance with the specification and stock record; review whether the service-risk gap has actually closed.'),
 (r'energy|utility|sustainab|esg|emission',
  'Check source readings, baseline boundaries, occupancy or activity drivers, reporting periods and approved conversion assumptions.',
  'Decide whether the comparison is valid and whether a proposed change has enough evidence to proceed.',
  'Document the baseline, proposed measure, owner and measurement plan without presenting an estimate as an achieved result.',
  'Compare like-for-like readings after implementation and retain the evidence and limitations behind any performance claim.'),
 (r'kpi|dashboard|control.tower|score|maturity|analytics',
  'Check metric definitions, source records, reporting periods, thresholds, weights and the owner responsible for each signal.',
  'Decide which verified exception needs intervention and which apparent trend requires a data-quality check first.',
  'Assign the review or improvement action with its owner and checkpoint, and make the source evidence available for drill-down.',
  'Reconcile the measure with its source and confirm whether the action changed the operating condition, not merely the displayed score.'),
 (r'complaint|recovery|capa|root.cause|six.sigma|quality|pareto|dmaic',
  'Check the incident or complaint record, operational definitions, timing, observed failure and the evidence supporting each proposed cause.',
  'Separate immediate containment from cause correction and decide which cause hypothesis is sufficiently supported to act on.',
  'Assign containment and corrective actions with owners, deadlines and a defined effectiveness test.',
  'Review follow-up operating evidence for recurrence and confirm effectiveness before declaring the corrective action complete.'),
 (r'workforce|roster|productivity|staff|training|competenc',
  'Check demand, workload, skills, availability, operating standards and the evidence of employee competence or service performance.',
  'Decide whether the team has the capacity and authorised capability to deliver the work without lowering the service standard.',
  'Allocate work or training, confirm role coverage and record the remaining capacity or competence gaps.',
  'Observe performance in the work, review service and quality results and adjust the plan when the evidence shows a gap.'),
 (r'itinerary|storytelling|guide|grand mosque|louvre|qasr|destination|journey|guest.experience',
  'Check the approved itinerary or service promise, guest needs, current destination information, access conditions and feedback evidence.',
  'Decide which timing, communication or experience adjustment is supported by the facts and can be delivered within the approved scope.',
  'Prepare the verified plan or briefing, coordinate the affected handovers and state preferences or pending confirmations clearly.',
  'Confirm the delivered experience against the promise and review guest feedback and handover records for unresolved gaps.'),
 (r'ai|prompt|privacy|governance',
  'Check approved source records, data boundaries, the task requirements and the named owner who can verify the output.',
  'Decide whether the inputs are sufficient and the use is authorised; stop when a required fact or approval is missing.',
  'Prepare a draft that separates confirmed facts, assumptions, unresolved items and recommendations for human review.',
  'Check every operational claim against its source and confirm the named owner’s approval before using the draft in live work.'),
 (r'.*',
  'Check the current approved process, roles, observed work, record requirements and the control or acceptance criteria.',
  'Decide which instruction or control addresses the verified gap and where authority or escalation is required.',
  'Document the revised instruction with its owner, trigger, required evidence and exception route, then test it with the people doing the work.',
  'Observe execution, inspect the resulting records and confirm that the control works before approving or closing the change.')
]

PRIMARY_SITUATIONS={
 'how-to-write-professional-sop-procedure':'An airport-transfer instruction leaves reporting time, readiness checks and exceptions unclear.',
 'itil-4-tourism-operations':'An airport-transfer service depends on connected people, suppliers, information and operating decisions.',
 'sipoc-tourism-operations':'An airport-transfer team needs agreed inputs and boundaries from confirmed booking through hotel drop-off.',
 'tourism-operational-excellence-management-system':'A growing DMC is trying to replace manager-dependent firefighting with a controlled operating system.',
 'operational-checklist-employees-use':'A multi-hotel MICE movement needs a pre-departure checklist that makes failed checks visible.',
 'tourism-sop-training-competency-adoption':'A revised arrival SOP must be adopted before a high-volume group movement.',
 'sop-roles-authority-raci':'A delayed coach movement requires clear ownership across the hotel, transport supplier, operations and guest communication.',
 'tourism-operations-manual':'Departmental operating files need to become a controlled, navigable DMC manual.',
 'standard-communication-templates':'A vehicle delay requires guest and client messages that explain the approved revised pickup.',
 'how-to-write-work-instructions':'A staff member needs a reliable instruction for checking flight status and responding to a material change.',
 'root-cause-analysis-tourism-managers':'Repeated late hotel departures are being attributed to drivers before the underlying causes have been verified.',
 'where-stp-fits-tourism-operations':'An airport-transfer control chain needs readiness testing before a high-volume arrival programme.',
 'standard-test-procedures-tourism-operations':'The after-hours recovery process must be tested for a case where the primary transport supplier cannot respond.',
 'sop-evidence-documentation-legal-defensibility':'An airport no-show is disputed and the operation needs a traceable record of observations, contacts and decisions.',
 'six-sigma-tourism-complaints-data':'A tourism team is investigating recurring complaints about late airport pickups.',
 'capa-tourism-operations':'Repeated late-driver failures may be connected to dispatch workload and manual allocation.',
 'pmp-thinking-sop-implementation':'A new group-arrivals SOP must be launched across several operating departments and suppliers.',
 'tourism-supplier-partner-governance-sops':'A transport partner supports airport arrivals, tours and MICE movements with connected readiness and handover obligations.',
 'integrated-sop-creation-model':'A multi-day group requires a controlled airport-arrivals operating system with tested handovers.',
 'how-to-audit-an-sop':'An airport-transfer SOP needs an end-to-end audit of execution, evidence and service closure.',
 'lean-thinking-tourism-operations':'A group booking must pass through several teams before its movement file is ready to operate.'
}

def parents(n):
    p=n['parent']
    while p:yield p;p=p['parent']

def rule(context):
    for pattern,*values in RULES:
        if re.search(pattern,context,re.I):return dict(zip(FIELDS[1:],values))

def load_registry():
    return json.loads(REGISTRY.read_text()) if REGISTRY.exists() else {}

def validate(record):
    if record['kind'] not in ('illustrative','documented'):raise ValueError('Unknown case classification')
    if record['kind']=='documented' and not (record.get('source') and record.get('source_verified')):
        raise ValueError('Documented cases need a verified traceable case source')
    if not all(record.get('stages',{}).get(k) for k in FIELDS[1:]):raise ValueError('Incomplete example flow')

def flow(record,situation_html, source_stages=None):
    validate(record)
    kind='Documented case' if record['kind']=='documented' else 'Illustrative scenario'
    note=('Case source: '+record['source']) if record['kind']=='documented' else 'Operational teaching scenario, not a documented incident. Uncited figures and outcomes are illustrative assumptions.'
    items='<div><dt>Situation</dt><dd>'+situation_html+'</dd></div>'
    source_stages=source_stages or {}
    for label in FIELDS[1:]:
        original=source_stages.get(label,'')
        content=original if original else '<p>'+html.escape(record['stages'][label])+'</p>'
        if original and label in ('Evidence','Verification'):content+='<p class="example-check">'+html.escape(record['stages'][label])+'</p>'
        items+='<div><dt>'+label+'</dt><dd>'+content+'</dd></div>'
    key=html.escape(record['key'],quote=True)
    content='<p class="example-provenance">'+html.escape(note)+'</p><dl class="example-flow">'+items+'</dl>'
    if record['format']=='prompt':
        return '<details class="practical-example" data-example-key="'+key+'"><summary><span class="example-kind">'+kind+'</span><span>Worked example: '+html.escape(record['label'])+'</span></summary>'+content+'</details>'
    return '<section class="practical-example" data-example-key="'+key+'" aria-label="'+kind+'"><p class="example-kind">'+kind+'</p>'+content+'</section>'

def restore(s,registry=None):
    registry=registry if registry is not None else load_registry()
    e=parse(s);panels=[n for n in e.nodes if 'data-example-key' in n['attrs']]
    for panel in sorted(panels,key=lambda n:n['start'],reverse=True):
        record=registry[panel['attrs']['data-example-key']]
        original=record.get('original_html','')
        if record['format']=='prompt':
            prompt=next(p for p in parents(panel) if 'prompt-section' in e.classes(p))
            grid=next(n for n in e.nodes if prompt['inner']<=n['start']<prompt['end'] and 'prompt-use-grid' in e.classes(n))
            slot=next(n for n in e.nodes if n['tag']=='div' and n['parent'] is grid)
            insert=s.rfind('</div>',slot['inner'],slot['end'])
            s=s[:insert]+original+s[insert:panel['start']]+s[panel['end']:]
        else:s=s[:panel['start']]+original+s[panel['end']:]
    return s

def source_role(label):
    if re.search(r'evidence|input|facts|baseline|weak draft|observation|assumption',label,re.I):return 'Evidence'
    if re.search(r'verif|validat|lesson|outcome|clos|effectiveness|review',label,re.I):return 'Verification'
    if re.search(r'decision|approval|authority|conditional|escalat',label,re.I):return 'Decision'
    return 'Action'


def standardize(s,slug,registry):
    s=restore(s,registry);e=parse(s);body=next((n for n in e.nodes if 'article-body' in e.classes(n)),None)
    if not body:return s,0
    edits=[];count=0;main=''
    headings=[n for n in e.nodes if body['inner']<=n['start']<body['end'] and n['tag'] in ('h2','h3','h4')]
    for i,n in enumerate(headings):
        label=text(s,n)
        if n['tag']=='h2':main=label
        if not PATTERN.search(label) or any('prompt-section' in e.classes(p) or 'article-toc' in e.classes(p) for p in parents(n)):continue
        key=slug+'::'+(n['attrs'].get('id') or hashlib.sha256(label.encode()).hexdigest()[:12])
        # Work only with complete sibling nodes, so source section wrappers remain valid.
        siblings=[x for x in e.nodes if x['parent'] is n['parent'] and x['start']>=n['end']]
        selected=[]
        for sibling in siblings:
            if sibling['tag'] in ('h2','h3','h4'):
                sibling_label=text(s,sibling)
                if int(sibling['tag'][1])<int(n['tag'][1]) or PATTERN.search(sibling_label):break
                if int(sibling['tag'][1])==int(n['tag'][1]) and not re.search(r'primary response|what the team should do|operational lesson|backup plan|suggested.*message|decision|verification|response|control',sibling_label,re.I):break
            if e.classes(sibling)&{'prompt-section','prompt-intro','article-feedback','article-purpose','article-github-cta'}:break
            # Do not consume a following section or its unrelated heading.
            if any(x['tag']=='h2' and sibling['inner']<=x['start']<sibling['end'] for x in e.nodes):break
            selected.append(sibling)
        original=s[selected[0]['start']:selected[-1]['end']] if selected else ''
        paragraph=next((x for x in selected if x['tag']=='p'),None)
        if key not in registry:
            registry[key]=dict(key=key,kind='illustrative',source='',source_verified=False,format='narrative',label=label,stages=REVIEWED_HOTEL_CONTROLS.get(slug) or rule(slug+' '+main+' '+label+' '+(text(s,paragraph) if paragraph else '')))
        record=registry[key];record['label']=label;record['original_html']=original
        source_stages={k:'' for k in FIELDS[1:]};current_role='Evidence'
        situation='<p>'+html.escape(PRIMARY_SITUATIONS.get(slug,'Apply the '+label.removeprefix('Example: ').lower()+' using the assumptions described in this example.'))+'</p>'
        quantified=label.lower().startswith('a quantified')
        if quantified:situation='<p>A hotel-apartment team is applying the method to a quantified teaching scenario.</p>'
        for source in selected:
            if source['tag'] in ('h2','h3','h4'):current_role=source_role(text(s,source))
            raw=s[source['start']:source['end']]
            if not quantified and source is paragraph and not any(x['tag'] in ('h2','h3','h4') and x['start']<source['start'] for x in selected):
                situation=raw
            else:source_stages[current_role]+=raw
        replacement=flow(record,situation,source_stages)
        if selected:edits.append((selected[0]['start'],selected[-1]['end'],replacement))
        else:edits.append((n['end'],n['end'],replacement))
        count+=1
    for n in e.nodes:
        if not body['inner']<=n['start']<body['end'] or 'scenario' not in e.classes(n) or not re.match(r'Example:',text(s,n),re.I):continue
        prompt=next((p for p in parents(n) if 'prompt-section' in e.classes(p)),None)
        if not prompt:continue
        grid=next((x for x in e.nodes if prompt['inner']<=x['start']<prompt['end'] and 'prompt-use-grid' in e.classes(x)),None)
        heading=next(x for x in e.nodes if prompt['inner']<=x['start']<prompt['end'] and x['tag'] in ('h2','h3'))
        label=text(s,heading);key=slug+'::'+prompt['attrs']['id']
        if key not in registry:
            stages=rule(slug+' '+label+' '+text(s,n))
            inputs=next((x for x in e.nodes if grid and grid['inner']<=x['start']<grid['end'] and x['tag'] in ('h3','h4') and text(s,x)=='Required inputs'),None)
            if inputs:
                following=next((x for x in e.nodes if inputs['end']<=x['start']<grid['end'] and x['tag']=='ul'),None)
                if following:
                    values=[text(s,x) for x in e.nodes if following['inner']<=x['start']<following['end'] and x['tag']=='li']
                    stages['Evidence']='Check the supplied '+', '.join(values[:5])+'. Treat scenario inputs as assumptions until confirmed against approved records.'
            stages['Action']='Prepare the '+label.lower()+' draft from the checked inputs; keep unresolved facts and required approvals visible.'
            stages['Decision']='Decide whether the inputs are complete and the task is authorised. If not, request the missing information before using the prompt.'
            stages['Verification']='Compare the draft with the source records and expected outputs. The named accountable owner must verify and approve it before live use.'
            registry[key]=dict(key=key,kind='illustrative',source='',source_verified=False,format='prompt',label=label,stages=stages)
        record=registry[key];record['label']=label
        situation=s[n['start']:n['end']]
        record['original_html']=situation
        edits.append((n['start'],n['end'],''))
        edits.append((grid['end'],grid['end'],flow(record,situation)))
        count+=1
    for start,end,new in sorted(edits,reverse=True):s=s[:start]+new+s[end:]
    from improve_article_visuals import migrate as improve_visuals
    return improve_visuals(s),count

def main():
    registry=load_registry();examples=pages=changed=0
    for p in sorted((ROOT/'articles').glob('*/index.html')):
        old=p.read_text();new,count=standardize(old,p.parent.name,registry)
        examples+=count;pages+=bool(count)
        if new!=old:p.write_text(new);changed+=1
    REGISTRY.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n')
    print(f'Practical examples: {examples} five-stage examples across {pages} pages; {changed} pages changed.')
if __name__=='__main__':main()
