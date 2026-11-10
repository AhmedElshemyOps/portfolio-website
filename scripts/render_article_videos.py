"""Render approved public videos at audited paragraph anchors, without editing prose."""
import json
from html import escape,unescape
import re
from apply_field_manual import parse

def render(source,path,root):
 relative=path.relative_to(root).as_posix();manifest=root/'content/article-video-matches.json'
 if not manifest.exists():return source
 matches=[m for m in json.loads(manifest.read_text()) if m['article']==relative]
 if not matches:return source
 inventory=root/'content/youtube-videos.json'
 videos={v['videoId']:v for v in json.loads(inventory.read_text()).get('videos',[])} if inventory.exists() else {}
 def text(value):return ' '.join(unescape(re.sub('<[^>]+>','',value)).replace('#','').split())
 for m in matches:
  vid=m['videoId']
  if not re.fullmatch('[A-Za-z0-9_-]{11}',vid):raise ValueError('Invalid YouTube video ID')
  existing=re.search(r'<iframe\b(?=[^>]*\bsrc=["\']https://(?:www\.)?(?:youtube-nocookie|youtube)\.com/embed/'+re.escape(vid)+r'["\'])[^>]*>',source)
  if existing:
   tag=existing.group(0); marked=tag
   marked=re.sub(r'\s+id=["\']video-'+re.escape(vid)+r'["\']','',marked)
   if not re.search(r'\bdata-youtube-id=["\']'+re.escape(vid)+r'["\']',marked):marked=marked.replace('<iframe','<iframe data-youtube-id="'+vid+'"',1)
   source=source.replace(tag,marked,1)
   nodes=parse(source).nodes
   frame=next((n for n in nodes if n['tag']=='iframe' and '/embed/'+vid in n['attrs'].get('src','')),None)
   wrapper=frame['parent'] if frame else None
   while wrapper and not ({'article-video','video'} & set(wrapper['attrs'].get('class','').split())):wrapper=wrapper['parent']
   if wrapper:
    attrs=''
    if not wrapper['attrs'].get('id'):attrs+=' id="video-'+vid+'"'
    if wrapper['attrs'].get('data-youtube-id')!=vid:attrs+=' data-youtube-id="'+vid+'"'
    if attrs:
     at=wrapper['start']+len('<'+wrapper['tag'])
     source=source[:at]+attrs+source[at:]
   elif frame and not wrapper:
    at=frame['start']+len('<iframe')
    source=source[:at]+' id="video-'+vid+'"'+source[at:]
   continue
  if 'data-youtube-id="'+vid+'"' in source:
   continue
  video=videos.get(vid)
  if not video or video.get('privacyStatus')!='public' or video.get('embedStatus')!='available':
   raise ValueError('New article embeds require a public video with confirmed embedding permission: '+vid)
  nodes=parse(source).nodes
  paras=[n for n in nodes if n['tag']=='p' and text(source[n['start']:n['end']])==m['afterParagraph']]
  if len(paras)!=1:raise ValueError('Video paragraph requires editorial review: '+relative+' '+vid)
  title=escape(m['title'],quote=True);short=m['videoFormat']=='short'
  block='\n<figure class="article-video'+(' article-video--short' if short else '')+'" data-youtube-id="'+vid+'">\n<div class="article-video__frame"><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/'+vid+'" title="'+title+'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>\n<figcaption><strong>Watch: '+title+'</strong><p>'+escape(m['rationale'])+'</p><a href="https://www.youtube.com/watch?v='+vid+'">Watch on YouTube: '+title+'</a></figcaption>\n</figure>\n'
  block=block.replace('data-youtube-id="'+vid+'"','id="video-'+vid+'" data-youtube-id="'+vid+'"',1)
  pos=paras[0]['end'];source=source[:pos]+block+source[pos:]
 if '/assets/css/article-video.css' not in source:source=source.replace('</head>','<link rel="stylesheet" href="/assets/css/article-video.css">\n</head>',1)
 return source
