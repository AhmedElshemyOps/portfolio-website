"""Build production-only measurement reports and an honest indexing register from exports.
Never edits website pages or submits URLs; search status remains unknown without evidence.
"""
import argparse,csv,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(path): return json.loads(Path(path).read_text())
def reconcile(streams,daily,events,policy):
    host=policy['productionHostname']; rows=streams['data']
    production=[r for r in rows if r.get('hostname')==host and r.get('measurement_id')==policy['measurementId'] and str(r.get('account_id'))==policy['propertyId'] and str(r.get('stream_id'))==policy['streamId']]
    if len(production)!=1:raise ValueError('Expected one exact production property/stream/hostname aggregate; do not combine ambiguous properties.')
    diagnostic=[r for r in rows if r.get('hostname')!=host]
    nonproduction_days=[r['date'] for r in daily['data'] if r.get('hostname')!=host]
    return {'periodStart':streams['periodStart'],'periodEnd':streams['periodEnd'],'production':production[0],'nonProduction':diagnostic,'lastReportedNonProductionDate':max(nonproduction_days) if nonproduction_days else None,'productionEvents':[r for r in events['data'] if r.get('hostname')==host],'limits':policy['limits'],'source':'Connected GA4 exports; hostname reconciliation only, not an account setting change'}
def register(pages):
    rows=[]
    for p in pages:
        if p.get('status')!=200:raise ValueError('A public-page check failed; do not mark the URL technically ready.')
        intended=p.get('indexable_html',False)
        canonical=p.get('canonical',[])
        rows.append({'url':p['url'],'intended_for_search':'yes' if intended else 'no','declared_canonical':canonical[0] if len(canonical)==1 else '', 'http_status':p['status'],'in_sitemap':'yes' if p.get('in_sitemap') else 'no','robots_meta':p.get('robots_meta',''),'google_index_status':'not_verified','google_selected_canonical':'','google_last_crawl':'','google_evidence':'','bing_index_status':'not_verified','bing_evidence':'','next_action':'Inspect account coverage and resolve reason if excluded' if intended else 'Retain deliberate noindex utility exclusion'})
    return rows
if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--streams',required=True);a.add_argument('--daily',required=True);a.add_argument('--events',required=True);a.add_argument('--pages',required=True);a.add_argument('--output',required=True);args=a.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    result=reconcile(read(args.streams),read(args.daily),read(args.events),read(ROOT/'maintenance/measurement/reporting-policy.json'))
    (out/'Production-baseline.json').write_text(json.dumps(result,indent=2)+'\n')
    rows=register(read(args.pages))
    for filename,subset in [('URL-indexing-register.csv',rows),('Search-targets-173.csv',[r for r in rows if r['intended_for_search']=='yes'])]:
        with (out/filename).open('w') as f:
            w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(subset)
    print(json.dumps({'productionSessions':result['production']['sessions'],'productionViews':result['production']['screen_page_views'],'registeredUrls':len(rows),'intendedSearchUrls':sum(r['intended_for_search']=='yes' for r in rows),'actualIndexing':'Not verified until search-engine evidence is available'}))
