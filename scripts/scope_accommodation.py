"""Scope accommodation guides to hotel apartments/staycations without changing URLs or IDs."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import json,re
ROOT=Path(__file__).resolve().parents[1]
SERIES={'Hotel AI Operations Playbook','Hotel Apartment Operational Excellence'}

def wording(text):
    text=re.sub(r'Hotel & (?:Serviced Apartment|Serviced Apartments) AI Operations Playbook','Hotel Apartment and Staycation AI Operations Playbook',text)
    if re.search(r'https?://|\b(?:EHL|AHLA|IATA)\b|\S+\.md\b',text):return text
    text=re.sub(r'\bhotel rooms\b','apartments',text,flags=re.I)
    text=re.sub(r'\bhotel room\b','apartment',text,flags=re.I)
    def singular(m):
        word=m[0]
        if word=='HOTEL':return word # Existing named prompting acronym, not an experience claim.
        return ('Hotel Apartment' if word[0].isupper() else 'hotel apartment')
    text=re.sub(r'\bHotels\b','Hotel Apartments',text)
    text=re.sub(r'\bhotels\b','hotel apartments',text)
    text=re.sub(r'(?<![\w/\-])hotel\b(?![/-]|\s+apartments?\b)',singular,text,flags=re.I)
    return text.replace('hotel apartment, hotel apartment or serviced-apartment operation','hotel apartment or serviced-apartment operation')

class Scope(HTMLParser):
    def __init__(self,source):
        super().__init__(convert_charrefs=False);self.source=source;self.stack=[];self.edits=[];self.lines=[0]
        self.protected=[]
        headings=list(re.finditer(r'<h2\b[^>]*>.*?</h2>',source,re.S))
        for i,h in enumerate(headings):
            if re.search(r'sources|references|bibliography',re.sub(r'<[^>]+>',' ',h[0]),re.I):
                self.protected.append((h.start(),headings[i+1].start() if i+1<len(headings) else len(source)))
        # An inline citation supports the whole paragraph, including text before
        # its anchor. Preserve source populations, terminology and quoted claims.
        for paragraph in re.finditer(r'<p\b[^>]*>.*?</p>',source,re.S):
            if re.search(r'<a\b[^>]*\bhref=[\"\']https?://',paragraph[0],re.I):
                self.protected.append((paragraph.start(),paragraph.end()))
        self.lines += [m.end() for m in re.finditer('\n',source)]
    def position(self):line,col=self.getpos();return self.lines[line-1]+col
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag not in {'meta','link','img','input','br','hr','source','use','area','wbr'}:self.stack.append((tag,attrs))
        if tag=='meta' and attrs.get('name',attrs.get('property','')) in {'description','twitter:title','twitter:description','og:title','og:description'}:
            raw=self.get_starttag_text();updated=re.sub(r'content="([^"]*)"',lambda m:'content="'+wording(m[1])+'"',raw)
            if raw!=updated:self.edits.append((self.position(),self.position()+len(raw),updated))
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,-1,-1):
            if self.stack[i][0]==tag:self.stack=self.stack[:i];break
    def handle_data(self,data):
        if any(start<=self.position()<end for start,end in self.protected):return
        if any(tag in {'style','script'} for tag,_ in self.stack):return
        if any(tag=='a' and re.match(r'https?://',attrs.get('href','')) for tag,attrs in self.stack):return # Preserve source titles and named organisations.
        updated=wording(data)
        if data!=updated:self.edits.append((self.position(),self.position()+len(data),updated))

def apply(source):
    parser=Scope(source);parser.feed(source)
    for start,end,new in sorted(parser.edits,reverse=True):source=source[:start]+new+source[end:]
    def schema(match):
        data=json.loads(match[2])
        def transform(value):
            if isinstance(value,dict):return {k:wording(v) if k in {'headline','description','name'} and isinstance(v,str) and not re.match(r'https?://',v) else transform(v) for k,v in value.items()}
            if isinstance(value,list):return [transform(v) for v in value]
            return value
        return match[1]+json.dumps(transform(data),ensure_ascii=False)+match[3]
    source=re.sub(r'(<script\b[^>]*type="application/ld\+json"[^>]*>)(.*?)(</script>)',schema,source,flags=re.S)
    return source

def main():
    from article_catalogue import refresh
    rows=json.loads((ROOT/'content/article-registry.json').read_text());affected=set()
    for row in rows:
        if row['series'] not in SERIES:continue
        affected.add(row['id']);path=ROOT/row['url'].lstrip('/');source=apply(path.read_text())
        if row['type']=='Article' and 'id="accommodation-scope"' not in source:
            note='<aside class="accommodation-scope" id="accommodation-scope"><strong>Scope of this guide</strong><p>Research and applied frameworks for hotel apartments, extended stays and staycations. Illustrative models and proposed workflows should be validated against approved property procedures; projected benefits are not measured results.</p></aside>'
            from apply_field_manual import parse
            purpose=next(n for n in parse(source).nodes if 'article-purpose' in n['attrs'].get('class','').split())
            source=source[:purpose['end']]+note+source[purpose['end']:]
        path.write_text(source)
        for key in ['title','description','headings']:
            if isinstance(row.get(key),list):row[key]=[wording(v) for v in row[key]]
            elif key in row:row[key]=wording(row[key])
    refresh(ROOT,rows)
    # Preserve stable IDs, topic keys, series filter keys and every existing route.
    home=ROOT/'index.html';s=home.read_text();record={r['url']:r for r in rows}
    def home_data(m):
        data=json.loads(m[2])
        for item in data:
            if item['url'] in record:
                for key in ['title','description']:item[key]=record[item['url']][key]
        return m[1]+json.dumps(data,ensure_ascii=False).replace('<','\\u003c')+m[3]
    home.write_text(re.sub(r'(<script type="application/json" id="homepage-article-data">)(.*?)(</script>)',home_data,s,flags=re.S))
    # Keep historical heading labels aligned so a maintenance run does not restore generic titles.
    p=ROOT/'content/editorial/heading-labels.tsv';lines=p.read_text().splitlines();p.write_text('\n'.join(line if line.split('\t')[0] not in affected else '\t'.join(line.split('\t')[:2]+[wording('\t'.join(line.split('\t')[2:]))]) for line in lines)+'\n')
    print('Accommodation guides reviewed:',len(affected),'records; URLs and IDs retained.')
if __name__=='__main__':main()
