"""Validate public series metadata before changing publication files."""
import json

def register(root,meta):
 data=json.loads((root/'content/series-banners.json').read_text())
 key=meta.get('series_id');number=meta.get('series_number')
 if key not in data['designs']:raise ValueError('series_id must name an approved public banner design')
 if isinstance(number,bool) or not isinstance(number,int) or number<1:raise ValueError('series_number must be a positive integer')
 url='/articles/'+meta['slug']+'/index.html'
 original=next((r for r in data['articles'] if r['url']==url),None)
 if original and (original['design']!=key or original['number']!=number):raise ValueError('Keep the existing series and article number when replacing an article')
 siblings=[r for r in data['articles'] if r['design']==key and r.get('number') and r['url']!=url]
 if any(r['number']==number for r in siblings):raise ValueError('That article number already belongs to another article')
 if not original and number!=max((r['number'] for r in siblings),default=0)+1:raise ValueError('Use the next consecutive article number in this series')
 design=data['designs'][key]
 for name in ('background','master'):
  if not (root/design[name].lstrip('/')).is_file():raise ValueError('Approved series artwork is missing')
 row=dict(url=url,title=meta['title'],design=key,option=design['option'],series=design['label'],number=number,kind='Article',total=len(siblings)+1)
 data['articles']=[r for r in data['articles'] if r['url']!=url]+[row]
 for r in data['articles']:
  if r['design']==key and r.get('number'):r['total']=len(siblings)+1
 return data,row
