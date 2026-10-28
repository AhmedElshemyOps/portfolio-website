"""One native, link-preserving reference panel for authored source sections."""
import re
from html import escape,unescape
from apply_field_manual import parse
TITLE=re.compile(r'^(?:sources(?:\s+and\s+(?:further reading|working artifacts|evidence boundaries))?|official sources|further reading|references|bibliography)$',re.I)
DOCUMENTS={
 '01-the-hotel-prompting-framework-how-to-write-professional-ai-prompts-for-hotel-operations.md':'/articles/hotel-ai-prompting-framework/index.html',
 '../AUTHORITY-MATRIX.md':'https://github.com/AhmedElshemyOps/hotel-ai-operations-playbook/blob/main/AUTHORITY-MATRIX.md',
 '../SOURCE-OF-TRUTH-MATRIX.md':'https://github.com/AhmedElshemyOps/hotel-ai-operations-playbook/blob/main/SOURCE-OF-TRUTH-MATRIX.md',
 '../PRIVACY-AND-RESPONSIBLE-USE.md':'https://github.com/AhmedElshemyOps/hotel-ai-operations-playbook/blob/main/PRIVACY-AND-RESPONSIBLE-USE.md'}
def classes(n):return set(n['attrs'].get('class','').split())
def title(s,n):return unescape(re.sub('<[^>]*>','',s[n['inner']:s.rfind('</',n['inner'],n['end'])])).strip().lstrip('#').strip()
def sections(s):
 e=parse(s);out=[]
 for h in e.nodes:
  if h['tag'] not in ('h2','h3') or not TITLE.fullmatch(title(s,h)):continue
  parent=h['parent'];inside=False;panel=None
  while parent:
   if 'article-body' in classes(parent):inside=True
   if classes(parent)&{'article-references','article-sources'}:panel=parent
   parent=parent['parent']
  if not inside:continue
  if panel:out.append((panel['start'],panel['end'],h,True));continue
  siblings=[n for n in e.nodes if n['parent'] is h['parent'] and n['start']>h['start']]
  end=h['parent']['end']-len('</'+h['parent']['tag']+'>')
  for n in siblings:
   if n['tag'] not in ('p','ul','ol','dl','blockquote','hr','time','aside'):
    end=n['start'];break
  out.append((h['start'],end,h,False))
 return out

def link_text(html):
 blocked=[];parts=re.split(r'(<[^>]+>)',html)
 pattern=re.compile(r'\[([^\]\n]+)\]\\?\(([^)\s]+)\)|https?://[^\s<>]+')
 def replace(m):
  if m[1]:
   dest=unescape(m[2]);url=DOCUMENTS.get(dest,dest if dest.startswith(('https://','http://','/')) and not dest.endswith('.md') else None)
   return '<a href="'+escape(url,quote=True)+'">'+m[1]+'</a>' if url else m[0]
  url=m[0];suffix=''
  while url and (url[-1] in '.,;:' or (url[-1]==')' and url.count(')')>url.count('('))):suffix=url[-1]+suffix;url=url[:-1]
  return '<a href="'+escape(unescape(url),quote=True)+'">'+url.removeprefix('https://').removeprefix('http://')+'</a>'+suffix
 for i,part in enumerate(parts):
  if part.startswith('<'):
   tag=re.match(r'</?([\w-]+)',part)
   if tag and tag[1].lower() in ('a','pre','code','script','style'):
    if part.startswith('</'):
     if blocked:blocked.pop()
    else:blocked.append(tag[1].lower())
  elif not blocked:parts[i]=pattern.sub(replace,part)
 return ''.join(parts)

def render(s,path,root):
 if not path.relative_to(root).as_posix().startswith('articles/'):return s
 found=sections(s)
 if not found:return s
 for start,end,h,existing in reversed(found):
  chunk=s[start:end]
  identifier=h['attrs'].get('id')
  if not identifier:
   identifier='article-source-references';suffix=2
   while re.search(r'\bid="'+re.escape(identifier)+'"',s):
    identifier='article-source-references-'+str(suffix);suffix+=1
   offset=h['inner']-start-1
   chunk=chunk[:offset]+' id="'+identifier+'"'+chunk[offset:]
  if existing:
   first=chunk.index('>')+1;opening=chunk[:first]
   if 'article-references' not in opening:opening=re.sub(r'class="([^"]*)"',lambda m:'class="'+m[1]+' article-references"',opening,count=1)
   chunk=opening+chunk[first:]
  else:chunk='<section class="article-references" aria-labelledby="'+escape(identifier,quote=True)+'">'+chunk+'</section>'
  chunk=link_text(chunk)
  chunk=re.sub(r'<ul(?![^>]*\brole=)([^>]*)>',r'<ul role="list"\1>',chunk)
  s=s[:start]+chunk+s[end:]
 s=re.sub(r'<link\b[^>]*href="/assets/css/article-sources\.css[^\"]*"[^>]*>','',s)
 return s.replace('</head>','<link rel="stylesheet" href="/assets/css/article-sources.css"></head>',1)
