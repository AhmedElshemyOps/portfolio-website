"""One practical checklist and one editorially selected action per article."""
from pathlib import Path
from html import escape
import json,re
from apply_field_manual import parse
from clean_article_openings import text
ROOT=Path(__file__).resolve().parents[1]
REGISTRY=ROOT/'content/editorial/article-endings.json'
NAV=re.compile(r'^(?:Next in Track B|Track B complete|Next in the series|Series navigation|Continue (?:the |learning|reading))',re.I)
def load_rows():return {r['slug']:r for r in json.loads(REGISTRY.read_text())}
def apply(s,row):
 e=parse(s);body=next(n for n in e.nodes if 'article-body' in e.classes(n));ranges=[];anchors=set()
 utilities=[n for n in e.nodes if n['parent'] is body and e.classes(n)&{'article-feedback','newsletter-signup'}]
 utility_ranges=[(n['start'],n['end']) for n in utilities]
 utility_html=''.join(s[a:b] for a,b in utility_ranges)
 ranges.extend(utility_ranges)
 existing=next((n for n in e.nodes if 'article-ending' in e.classes(n)),None)
 if existing:
  anchors.update(n['attrs']['id'] for n in e.nodes if existing['inner']<=n['start']<existing['end'] and n['attrs'].get('data-ending-anchor'))
  ranges.append((existing['start'],existing['end']))
 # Replace branching footer recommendations, preserving contextual links in the text.
 for n in e.nodes:
  if 'reader-next' in e.classes(n):ranges.append((n['start'],n['end']))
 for h in e.nodes:
  if h['tag']!='h2' or not(body['inner']<=h['start']<body['end']) or not NAV.search(text(s,h)):continue
  p=h['parent'];raw=s[p['start']:p['end']]
  if p['tag']=='section' and p is not body and not re.search(r'<(?:pre|table|figure|form|button)\b',raw):
   ranges.append((p['start'],p['end']))
  else:
   siblings=[n for n in e.nodes if n['parent'] is p and n['start']>=h['start']]
   end=h['end']
   for n in siblings[1:]:
    if n['tag'] not in ('p','hr'):break
    end=n['end']
   ranges.append((h['start'],end))
 ranges=list(set(ranges));ranges=[r for r in ranges if not any(a<=r[0] and b>=r[1] and (a,b)!=r for a,b in ranges)]
 for a,b in ranges:
  anchors.update(n['attrs']['id'] for n in e.nodes if a<=n['start']<b and n['attrs'].get('id') and not (existing and existing['start']<=n['start']<existing['end']) and not any(ua<=n['start']<ub for ua,ub in utility_ranges))
 for a,b in sorted(ranges,reverse=True):s=s[:a]+s[b:]
 ids=set(re.findall(r'\bid="([^"]+)"',s));anchors-=ids
 action=row['next']
 old=''.join('<span id="'+escape(v,quote=True)+'" data-ending-anchor="true"></span>' for v in sorted(anchors))
 ending='<section class="article-ending" id="article-practical-ending" aria-labelledby="article-practical-checklist">'+old+'<h2 id="article-practical-checklist">Put this article into practice</h2><ul class="article-completion-checklist">'+''.join('<li>'+escape(item)+'</li>' for item in row['checklist'])+'</ul><div class="article-ending-action"><h3 id="article-practical-next-step">Your next step</h3><p>'+escape(action['why'])+'</p><a class="article-ending-link" data-article-next-step="'+escape(action['kind'])+'" href="'+escape(action['url'],quote=True)+'">'+escape(action['label'])+' <span aria-hidden="true">→</span></a></div></section>'
 e=parse(s);body=next(n for n in e.nodes if 'article-body' in e.classes(n))
 feedback=next((n for n in e.nodes if body['inner']<=n['start']<body['end'] and 'article-feedback' in e.classes(n)),None)
 pos=feedback['start'] if feedback else s.rfind('</'+body['tag'],body['inner'],body['end'])
 s=s[:pos]+ending+s[pos:]
 if utility_html:
  updated=parse(s);body=next(n for n in updated.nodes if 'article-body' in updated.classes(n))
  s=s[:body['end']]+utility_html+s[body['end']:]
 return s

def main():
 rows=load_rows();changed=0
 for slug,row in rows.items():
  p=ROOT/'articles'/slug/'index.html';old=p.read_text();new=apply(old,row)
  if new!=old:p.write_text(new);changed+=1
 print(f'Practical endings: {len(rows)} articles; {changed} pages updated.')
if __name__=='__main__':main()
