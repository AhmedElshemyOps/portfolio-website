"""Keep every copyable article prompt in a visible, five-part reading order."""
from pathlib import Path
import re
from html import escape, unescape
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]
def plain(s): return unescape(re.sub(r'<[^>]*>', '', s)).strip()
def source_parts(raw):
 text=plain(raw)
 blocks=re.split(r'\n\s*\n',text)
 def pick(pattern):
  for b in blocks:
   lines=b.splitlines()
   if re.search(pattern,lines[0],re.I):return '\n'.join(lines[1:]).strip()
  return ''
 task=pick(r'^(?:O —|DECISION|TASK|OBJECTIVE|OPERATIONAL OBJECTIVE)')
 inputs=pick(r'^(?:T —|INPUT|TRUSTED INPUT)')
 outputs=pick(r'^(?:E —|OUTPUT|EXPECTED OUTPUT)')
 verification=pick(r'^(?:L —|HUMAN VERIFICATION|VERIFICATION|LIMITS)')
 return task,inputs,outputs,verification

def paragraph(value):return '<p>'+escape(value)+'</p>'
def migrate(s):
 e=parse(s); edits=[]
 for n in e.nodes:
  if 'prompt-section' not in e.classes(n):continue
  body=s[n['start']:n['end']]
  if 'data-prompt-guide="true"' in body:continue
  pre=re.search(r'<pre\b[^>]*>(.*?)</pre>',body,re.S)
  if not pre:continue
  task,inputs,outputs,verification=source_parts(pre[1])
  grid=re.search(r'<div class="prompt-use-grid">',body)
  if not grid:continue
  be=parse(body);gn=next(x for x in be.nodes if 'prompt-use-grid' in be.classes(x))
  cols=[x for x in be.nodes if x['parent'] is gn and x['tag']=='div']
  if len(cols)!=3:raise ValueError('Expected three guide slots')
  chunks=[body[x['start']:x['end']] for x in cols]
  if re.search(r'<p>\s*</p>',chunks[0]):
   chunks[0]=re.sub(r'<p>\s*</p>',paragraph(task or 'Use this template when preparing '+plain(re.search(r'<h3[^>]*>(.*?)</h3>',body,re.S)[1]).lstrip('#')+'. Supply the current approved records before running it.'),chunks[0],count=1)
  if 'approved operating context</li>' in chunks[1] and inputs:
   chunks[1]=re.sub(r'<ul class="compact-list">.*?</ul>', '<ul class="compact-list"><li>'+escape(inputs)+'</li></ul>',chunks[1],flags=re.S)
  if 'structured operational output</li>' in chunks[2] and outputs:
   chunks[2]=re.sub(r'<ul class="compact-list">.*?</ul>', '<ul class="compact-list"><li>'+escape(outputs)+'</li></ul>',chunks[2],flags=re.S)
  chunks[2]=chunks[2].replace('Expected outputs','Expected output')
  body=body[:gn['start']]+'<div class="prompt-use-grid">'+''.join(chunks[:2])+'</div>'+body[gn['end']:]
  card=parse(body);cn=next(x for x in card.nodes if 'prompt-card' in card.classes(x))
  body=body[:cn['end']]+chunks[2].replace('<div>','<div class="prompt-output">',1)+body[cn['end']:]
  body=re.sub(r'(<div class="prompt-card-top">.*?<h4[^>]*>)(.*?)(</h4>)',lambda m:m[1]+(re.search(r'<a class="heading-anchor".*?</a>',m[2],re.S)[0] if '<a class="heading-anchor"' in m[2] else '')+'Complete prompt'+m[3],body,count=1,flags=re.S)
  body=body.replace('<div class="trainer-note">','<div class="trainer-note"><h4>Human verification</h4>',1)
  body=body.replace('class="prompt-section"','class="prompt-section" data-prompt-guide="true"',1)
  edits.append((n['start'],n['end'],body))
 for a,b,v in reversed(edits):s=s[:a]+v+s[b:]
 # Additional research and Amsterdam prompts have their own copy-card wrapper.
 e=parse(s); edits=[];seen=set()
 for button in e.nodes:
  if 'data-copy-target' not in button['attrs']:continue
  ancestor=button['parent']
  while ancestor and 'prompt-section' not in e.classes(ancestor):ancestor=ancestor['parent']
  if ancestor and ancestor['attrs'].get('data-prompt-guide')=='true':continue
  target=next((x for x in e.nodes if x['attrs'].get('id')==button['attrs']['data-copy-target']),None)
  if not target:continue
  n=button['parent']
  while n and not(n['start']<=target['start'] and n['end']>=target['end']):n=n['parent']
  if not n or 'data-prompt-guide="true"' in s[n['start']:n['end']] or n['start'] in seen:continue
  seen.add(n['start']);body=s[n['start']:n['end']]
  pre=re.search(r'<pre\b[^>]*>(.*?)</pre>',body,re.S)
  if not pre:continue
  task,inputs,outputs,verification=source_parts(pre[1]);pos=body.index('<pre')
  before='<div class="prompt-guide-input"><h4>When to use it</h4>'+paragraph(task or 'Use this prompt for the research task described below, when the required records and source access are available.')+'<h4>Required inputs</h4>'+paragraph(inputs or 'Replace every bracketed placeholder and supply the records, scope and sources requested in the complete prompt.')+'<h4>Complete prompt</h4></div>'
  after='<div class="prompt-output"><h4>Expected output</h4>'+paragraph(outputs or 'Expect the structured findings, evidence and limitations specified in the complete prompt.')+'</div><div class="trainer-note"><h4>Human verification</h4>'+paragraph(verification or 'Check every finding against the supplied records and original sources. Verify calculations, assumptions and missing evidence. The accountable human owner approves any operational decision or publication.')+'</div>'
  end=body.index('</pre>')+len('</pre>');body=body[:end]+after+body[end:];body=body[:pos]+before+body[pos:]
  body=body.replace('>',' data-prompt-guide="true">',1);edits.append((n['start'],n['end'],body))
 for a,b,v in sorted(edits,reverse=True):s=s[:a]+v+s[b:]
 return s

def main():
 changed=0
 for p in (ROOT/'articles').rglob('*.html'):
  s=p.read_text();new=migrate(s)
  if new!=s:p.write_text(new);changed+=1
 print(f'Prompt guidance updated on {changed} articles.')
if __name__=='__main__':main()
