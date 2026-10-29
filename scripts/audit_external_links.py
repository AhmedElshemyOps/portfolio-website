"""Read-only external link audit. HTTP failures require editorial review, never auto-delete."""
import argparse, concurrent.futures, datetime, json
from pathlib import Path
from urllib.parse import urlsplit, urldefrag
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self): super().__init__(); self.urls=set()
    def handle_starttag(self,tag,attrs):
        url=dict(attrs).get('href','')
        if tag=='a' and urlsplit(url).scheme in ('http','https') and urlsplit(url).hostname not in ('ahmedqualityops.com','www.ahmedqualityops.com'):
            self.urls.add(urldefrag(url)[0])
def inventory():
    found={}
    for page in sorted(ROOT.rglob('*.html')):
        if any(x in {'.git','node_modules','docs','templates','tests'} for x in page.relative_to(ROOT).parts): continue
        parser=Links(); parser.feed(page.read_text())
        for url in parser.urls: found.setdefault(url,[]).append(str(page.relative_to(ROOT)))
    return found

def check(entry):
    url,pages=entry; result=dict(url=url,pages=pages)
    try:
        with urlopen(Request(url,headers={'User-Agent':'Mozilla/5.0 (compatible; WebsiteReferenceReview/1.0)'}),timeout=15) as response:
            result.update(status=response.status,finalUrl=response.url,result='reachable')
    except HTTPError as error:
        result.update(status=error.code,result='not_found_review' if error.code in (404,410) else 'restricted_or_unverified')
    except Exception as error: result.update(result='unverified',error=type(error).__name__)
    return result
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--output',required=True);args=parser.parse_args()
    found=inventory()
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(check,found.items()))
    report=dict(checkedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),uniqueUrls=len(results),results=results)
    Path(args.output).write_text(json.dumps(report,indent=2)+'\n')
    from collections import Counter
    print(json.dumps(dict(Counter(x['result'] for x in results))))
