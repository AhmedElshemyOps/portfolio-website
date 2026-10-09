"""Local-only browser performance instrumentation; never changes published HTML.
Usage: python3 scripts/preview_measurements.py /absolute/site/root 4194
Open a page at phone width. Read body.dataset.labMetrics after it appears.
No network/CPU throttling; measurements are diagnostics, not Lighthouse/field scores.
"""
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from pathlib import Path
import sys,mimetypes,json
root=Path(sys.argv[1]).resolve();port=int(sys.argv[2])
instrument='''<script>(()=>{let lcp=0,cls=0;try{new PerformanceObserver(list=>{for(const e of list.getEntries())lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)cls+=e.value}).observe({type:'layout-shift',buffered:true})}catch(e){}window.addEventListener('load',()=>setTimeout(()=>{const nav=performance.getEntriesByType('navigation')[0],resources=performance.getEntriesByType('resource');document.body.dataset.labMetrics=JSON.stringify({viewport:innerWidth,ttfb:nav.responseStart,domReady:nav.domContentLoadedEventEnd,load:nav.loadEventEnd,lcp,layoutShiftSum:cls,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,bytes:resources.reduce((n,r)=>n+r.transferSize,nav.transferSize),requests:resources.length+1})},1500))})();</script>'''
class H(BaseHTTPRequestHandler):
 def do_GET(self):
  p=(root/self.path.split('?')[0].lstrip('/')).resolve()
  if p!=root and root not in p.parents:self.send_error(403);return
  p=p/'index.html' if p.is_dir() else p
  if not p.is_file():self.send_error(404);return
  data=p.read_bytes()
  if p.suffix=='.html':data=data.replace(b'<head>',b'<head>'+instrument.encode(),1)
  self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(p)[0] or 'application/octet-stream');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(data)
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',port),H).serve_forever()
