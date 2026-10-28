"""Apply Step 4 designs to the isolated video preview, preserving public sources."""
import argparse
from html import escape
import json
from pathlib import Path
import re
from apply_field_manual import parse
from check_redesign_preservation import check, MANIFEST

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'docs/calm-redesign/step-4'
PAGES=['index.html','profile/index.html','projects/infraquote/index.html','articles/hotel-operations-manager-ai-toolkit/index.html']


def replace_node(source, predicate, replacement):
    hits=[n for n in parse(source).nodes if predicate(n)]
    if len(hits)!=1:
        raise ValueError('Expected exactly one editable element, found '+str(len(hits)))
    n=hits[0]
    return source[:n['start']]+replacement+source[n['end']:]


def main():
    cli=argparse.ArgumentParser(description=__doc__);cli.add_argument('--output',required=True,type=Path);args=cli.parse_args();out=args.output.resolve()
    if out==ROOT or ROOT in out.parents or out in ROOT.parents or not (out/'.calm-video-preview').is_file():
        cli.error('Build the isolated video preview first; source directories are never valid outputs.')
    profile=json.loads((ROOT/'docs/calm-redesign/step-2/proposed-profile.json').read_text())
    style=out/'calm-page-preview.css'
    if style.is_symlink():style.unlink()
    style.write_bytes((DATA/'page-preview.css').read_bytes())
    for name in PAGES:
        s=(ROOT/name).read_text()
        s=re.sub(r'<body([^>]*)>',lambda m:'<body'+(re.sub(r'class="([^"]*)"',lambda c:'class="'+c[1]+' calm-preview"',m[1]) if 'class=' in m[1] else m[1]+' class="calm-preview"')+'>',s,count=1)
        s=s.replace('</head>','<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/assets/css/fonts.css"><link rel="stylesheet" href="/calm-page-preview.css"></head>',1)
        if name=='index.html':
            s=replace_node(s,lambda n:n['attrs'].get('id')=='intro-title','<h1 id="intro-title">Travel &amp; Tourism Operations</h1>')
            s=replace_node(s,lambda n:n['attrs'].get('class')=='discipline','<p class="discipline">Destination Services · Tourism Product Support · MICE &amp; Event Coordination</p>')
            s=replace_node(s,lambda n:n['attrs'].get('class')=='intro','<p class="intro">I’m Ahmed Mahmoud, a travel and tourism professional based in Den Haag. My experience across Egypt and the UAE includes destination services, multilingual guest communication, B2B reservations, guest movements and supplier coordination. I’m looking to bring that practical delivery experience to a tourism operations, product support or MICE/event coordination team in the Netherlands.</p>')
            s=replace_node(s,lambda n:n['attrs'].get('class')=='home-work-location','<p class="home-work-location">Based in Den Haag · Authorised to work in the Netherlands without employer sponsorship.</p>')
            s=s.replace('href="#site-footer">Contact Ahmed','href="/profile/index.html#career">Explore my experience',1)
            discovery='<section class="preview-video-discovery" aria-labelledby="video-library-heading"><div><h2 id="video-library-heading">Learn through practical scenarios.</h2><p>Explore 33 video lessons alongside the articles, from tourism operations and team coordination to service improvement.</p></div><a class="button secondary" href="/learn/videos/index.html">Explore video lessons →</a></section>'
            s=s.replace('<section class="section" id="articles"',discovery+'<section class="section" id="articles"',1)
        if name=='profile/index.html':
            intro='<p class="profile-lead">I work at the point where a travel plan becomes a guest experience: arrivals, transfers, tours, reservations, suppliers and the handovers between teams.</p><p class="profile-lead">My background spans travel consulting and package arrangements, transport coordination, B2B accommodation operations and destination delivery across Egypt and the UAE. Most recently, I worked within the operations team at Masarra DMC / Miral Experiences, supporting destination delivery and coordination across departments. That role ended in October 2026.</p>'
            s=replace_node(s,lambda n:n['attrs'].get('class')=='profile-lead',intro)
            s=replace_node(s,lambda n:n['attrs'].get('class')=='work-authorisation','<p class="work-authorisation">Based in Den Haag · Authorised to work in the Netherlands without employer sponsorship.</p>')
            nodes=parse(s).nodes
            entries=[n for n in nodes if n['attrs'].get('class')=='career-entry']
            if len(entries)!=len(profile['career']):raise ValueError('Career entries differ from reviewed data')
            for n,c in reversed(list(zip(entries,profile['career']))):
                # Preserve existing class hooks and section anchors, replace only
                # experience presentation with the explicitly reviewed career data.
                card='<article class="career-entry"><div><h3>'+escape(c['company'])+'</h3><p>'+escape(c.get('presentation_label',c['department']+' · '+c['scope']))+'</p><p>'+escape(c['dates'])+' · '+escape(c['location'])+'</p></div><ul>'+''.join('<li>'+escape(v)+'</li>' for v in c['contributions'])+'</ul></article>'
                s=s[:n['start']]+card+s[n['end']:]
            nodes=parse(s).nodes;career=next(n for n in nodes if n['attrs'].get('id')=='career');block=s[career['start']:career['end']];s=s[:career['start']]+s[career['end']:]
            first=next(n for n in parse(s).nodes if n['attrs'].get('id')=='qualifications');s=s[:first['start']]+block+s[first['start']:]
        (out/name).write_text(s)
    # Temporarily remove only the recorded supplemental players for comparison.
    # Four redesigned pages are compared as actually generated, not source copies.
    supplemental=json.loads((DATA/'supplemental-video-matches.json').read_text());saved={}
    try:
        for m in supplemental:
            p=out/m['article'];saved[p]=p.read_text();s=saved[p]
            n=next(n for n in parse(s).nodes if n['tag']=='figure' and n['attrs'].get('data-youtube-id')==m['videoId'])
            p.write_text(s[:n['start']]+s[n['end']:])
        result=check(json.loads(MANIFEST.read_text()),root=out)
    finally:
        for p,s in saved.items():p.write_text(s)
    result['previewPages']=PAGES
    result['approvedAdditions']='Two supplemental article video figures excluded from original-word comparison; all other original article content is compared unchanged.'
    (out/'page-preview-report.json').write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result,indent=2))
    return 0 if result['passed'] else 1


if __name__=='__main__':raise SystemExit(main())
