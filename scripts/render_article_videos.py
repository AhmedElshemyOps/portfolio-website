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
 def text(value):return ' '.join(unescape(re.sub('<[^>]+>','',value)).replace('#','').split())
 for m in matches:
  vid=m['videoId']
  if not re.fullmatch('[A-Za-z0-9_-]{11}',vid):raise ValueError('Invalid YouTube video ID')
  if 'data-youtube-id="'+vid+'"' in source:continue
  nodes=parse(source).nodes
  paras=[n for n in nodes if n['tag']=='p' and text(source[n['start']:n['end']])==m['afterParagraph']]
  if len(paras)!=1:raise ValueError('Video paragraph requires editorial review: '+relative+' '+vid)
  title=escape(m['title'],quote=True);short=m['videoFormat']=='short'
  block='\n<figure class="article-video'+(' article-video--short' if short else '')+'" data-youtube-id="'+vid+'">\n<div class="article-video__frame"><iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/'+vid+'" title="'+title+'" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>\n<figcaption><strong>Watch: '+title+'</strong><p>'+escape(m['rationale'])+'</p><a href="https://www.youtube.com/watch?v='+vid+'">Watch on YouTube: '+title+'</a></figcaption>\n</figure>\n'
  pos=paras[0]['end'];source=source[:pos]+block+source[pos:]
 if '/assets/css/article-video.css' not in source:source=source.replace('</head>','<link rel="stylesheet" href="/assets/css/article-video.css">\n</head>',1)
 return source
