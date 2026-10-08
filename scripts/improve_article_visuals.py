"""Accessible captions and contained scrolling for article tables and diagrams."""
from pathlib import Path
from html import escape,unescape
import re
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]
LABELS={'What the owner should learn':'Learning goal','Typical Tourism Example':'Tourism example','Information required':'Required information','weighted_score_100':'Score / 100','poi_id':'POI ID','poi_name':'POI name','fit_band':'Fit band','Blueprint component':'Component','Candidate measure':'Measure','Main Purpose':'Purpose','Client Stage':'Client stage','Full Name':'Full name'}
# These four authored reservations tables were stored as one plain <pre> per row.
# Match only their exact headers and a valid Markdown separator; attributed <pre>
# blocks (including every Copy Prompt target) are never eligible for conversion.
LEGACY_TABLE_CAPTIONS={
 ('Question','Primary approved source','AI role'):'Reservation source-of-truth matrix',
 ('Stage','Control question','Prompt'):'The reservations AI control loop',
 ('Item','Current evidence','Classification','Next action'):'Fictional reservation case: verification queue',
 ('KPI','What it reveals'):'Measures for a controlled reservations workflow',
}
def convert_legacy_tables(s):
 def convert(match):
  rows=[tuple(unescape(cell.strip()) for cell in row.strip()[1:-1].split('|')) for row in re.findall(r'<pre>(\|[^<>\n]*\|)</pre>',match[0])]
  if len(rows)<3 or rows[0] not in LEGACY_TABLE_CAPTIONS:return match[0]
  width=len(rows[0])
  if any(len(row)!=width for row in rows) or not all(re.fullmatch(r':?-{3,}:?',cell) for cell in rows[1]):return match[0]
  heading='<thead><tr>'+''.join('<th scope="col">'+escape(cell)+'</th>' for cell in rows[0])+'</tr></thead>'
  body='<tbody>'+''.join('<tr>'+''.join('<td>'+escape(cell)+'</td>' for cell in row)+'</tr>' for row in rows[2:])+'</tbody>'
  return '<table><caption>'+LEGACY_TABLE_CAPTIONS[rows[0]]+'</caption>'+heading+body+'</table>'
 return re.sub(r'<pre>\|[^<>\n]*\|</pre>(?:\s*<pre>\|[^<>\n]*\|</pre>)+',convert,s)
def text(s,n):return unescape(re.sub('<[^>]+>','',s[n['inner']:s.rfind('</',n['inner'],n['end'])])).strip()
def migrate(s):
 s=convert_legacy_tables(s)
 e=parse(s);edits=[]
 for n in e.nodes:
  if n['tag'] not in ('table','figure'):continue
  body=s[n['start']:n['end']]
  if 'data-reading-visual="true"' in body:continue
  if n['tag']=='table':
   headers=[x for x in e.nodes if n['inner']<=x['start']<n['end'] and x['tag']=='th']
   labels=[LABELS.get(text(s,x),text(s,x)) for x in headers]
   for h,label in reversed(list(zip(headers,labels))):
    raw=s[h['start']:h['end']];opening=s[h['start']:h['inner']]
    if 'scope=' not in opening:opening=opening[:-1]+' scope="col">'
    replacement=opening+escape(label)+'</th>'
    a=h['start']-n['start'];b=h['end']-n['start'];body=body[:a]+replacement+body[b:]
   caption=next((x for x in e.nodes if x['tag']=='caption' and x['parent'] is n),None)
   headings=[x for x in e.nodes if x['tag'] in ('h2','h3','h4') and x['start']<n['start']]
   topic=text(s,headings[-1]).lstrip('#').strip() if headings else 'Article comparison'
   topic=re.sub(r'^\d+[.)]\s*','',topic)
   title=text(s,caption) if caption else topic+(' — '+', '.join(labels[:3]) if labels else '')
   if not caption:body=body.replace('>','><caption>'+escape(title)+'</caption>',1)
   body=body.replace('>',' data-reading-visual="true">',1)
   relation=' with '.join([labels[0],', '.join(labels[1:])]) if len(labels)>1 else (labels[0] if labels else 'the listed information')
   explanation='Read each row across to connect '+relation+'. Compare the rows to identify the relevant '+(labels[0].lower() if labels else 'entry')+' for your situation; use the accompanying section to interpret the result.'
   learn='<p class="visual-learning"><strong>What to learn:</strong> '+escape(explanation)+'</p>'
   hint='<p class="visual-scroll-hint">Scroll horizontally to read every column. Keyboard: focus the table, then use the arrow keys.</p>'
   wrapped=n['parent'] and 'table-scroll' in e.classes(n['parent'])
   if wrapped:
    parent=n['parent'];a=parent['start'];b=parent['end'];raw=s[a:b];opening=s[a:parent['inner']]
    opening=opening[:-1]+' tabindex="0" role="region" aria-label="'+escape(title,quote=True)+'">'
    new=opening+body+raw[n['end']-a:]+hint+learn
   else:
    a=n['start'];b=n['end'];new='<div class="table-scroll" tabindex="0" role="region" aria-label="'+escape(title,quote=True)+'">'+body+'</div>'+hint+learn
   edits.append((a,b,new))
  else:
   # Existing captions contain authored explanations; retain them verbatim.
   body=re.sub(r'(<img\b[^>]*>)',lambda m:'<div class="diagram-scroll" tabindex="0" role="region" aria-label="Diagram: scroll horizontally on small screens">'+m[1]+'</div>',body,count=1)
   body=body.replace('>',' data-reading-visual="true">',1)
   body=body.replace('<figcaption>','<figcaption><span class="visual-reading-label">What to learn</span>',1)
   body=body.replace('</figcaption>','<p class="visual-scroll-hint">On small screens, scroll the diagram horizontally to read its labels.</p></figcaption>',1)
   edits.append((n['start'],n['end'],body))
 for a,b,new in sorted(edits,reverse=True):s=s[:a]+new+s[b:]
 return s

def main():
 changed=0
 for p in (ROOT/'articles').rglob('*.html'):
  old=p.read_text();new=migrate(old)
  if new!=old:p.write_text(new);changed+=1
 print(f'Table and diagram reading improvements: {changed} articles updated.')
if __name__=='__main__':main()
