"""Render the professional profile and homepage career summary from one record."""
from pathlib import Path
from html import escape
import json
from apply_field_manual import parse
ROOT=Path(__file__).resolve().parents[1]
E=lambda x:escape(str(x),quote=True)
CV='/documents/Ahmed-Mahmoud-Managerial-CV.pdf'
PORTFOLIO='/documents/Ahmed-Mahmoud-Credentials-Portfolio.pdf'

def cards(items):
 out=[]
 for x in items:
  evidence='<a class="text-link" href="'+E(x['evidence_url'])+'">View certificate <span aria-hidden="true">↗</span></a>' if x.get('evidence_url') else '<a class="text-link" href="'+CV+'">See CV details <span aria-hidden="true">↗</span></a>'
  out.append('<article class="qualification-card"><p class="eyebrow">'+E(x['issuer'])+'</p><h3>'+E(x['name'])+'</h3><p class="qualification-date">'+E(x['date'])+'</p><p>'+E(x['description'])+'</p>'+evidence+'</article>')
 return ''.join(out)

def section(title,id,content,subtitle=''):
 return '<section class="profile-section" id="'+id+'" aria-labelledby="'+id+'-title"><div class="wrap"><div class="portfolio-section-heading"><h2 id="'+id+'-title">'+title+'</h2><span aria-hidden="true"></span></div>'+('<p class="section-lead">'+subtitle+'</p>' if subtitle else '')+content+'</div></section>'

def main():
 d=json.loads((ROOT/'content/professional-profile.json').read_text());contact=json.loads((ROOT/'content/site-contact.json').read_text())
 hero='<section class="profile-intro"><div class="wrap profile-intro-grid"><div><span class="eyebrow">Professional profile</span><h1>'+E(d['headline'])+'</h1><p class="profile-lead">'+E(d['summary'])+'</p><p class="work-authorisation"><span aria-hidden="true">✓</span> Based in the Netherlands · '+E(d['work_authorisation'])+'</p><div class="action-row"><a class="button" href="'+CV+'">View my CV</a><a class="button secondary" href="#qualifications">Explore qualifications</a></div></div><figure><img src="/assets/profile/ahmed-mahmoud-photo-executive.webp" alt="Ahmed Mahmoud" width="911" height="911" fetchpriority="high"></figure></div></section>'
 timeline=[]
 for x in d['career']:
  timeline.append('<article class="career-entry"><div><p class="career-dates">'+E(x['dates'])+'</p><p class="career-location">'+E(x['location'])+'</p></div><div><h3>'+E(x['company'])+'</h3><p class="department">'+E(x['department'])+'</p><p class="career-scope">'+E(x['scope'])+'</p><ul>'+''.join('<li>'+E(b)+'</li>' for b in x['contributions'])+'</ul></div></article>')
 career=section('Career across the travel journey','career','<div class="career-timeline">'+''.join(timeline)+'</div>','Company experience presented through departments, operating responsibilities and practical contributions.')
 quals=section('Professional qualifications','qualifications','<div class="qualification-grid">'+cards(d['certifications'])+'</div>')
 iata='<div class="iata-list">'+''.join('<a href="'+x['evidence_url']+'"><span><small>IATA diploma</small><strong>'+E(x['name'])+'</strong></span><span class="qualification-date">'+E(x['date'])+'</span><span aria-hidden="true">↗</span></a>' for x in d['iata'])+'</div>'
 iata=section('Five IATA professional diplomas','iata-diplomas',iata,'Travel operations, MICE, commercial knowledge and specialist handling.')
 training='<div class="training-grid">'+''.join('<a class="training-card" href="'+x['url']+'"><h3>'+E(x['name'])+'</h3><p>'+E(x['detail'])+'</p><span class="text-link">View evidence ↗</span></a>' for x in d['additional_training'])+'</div><details class="professional-details"><summary>Further travel, safety and field readiness</summary><p>Amadeus Selling Platform and EgyptAir fares and ticketing training; SAFA Umrah Solutions; Essential Food Safety; car-insurance and vehicle-survey training through the Insurance Institute of Egypt.</p><p>'+E(d['field_readiness'])+'</p><a class="text-link" href="'+CV+'">View the CV overview</a></details>'
 training=section('Leadership and operational readiness','professional-training',training)
 education=d['education'];language='<ul class="language-list">'+''.join('<li>'+E(x)+'</li>' for x in d['languages'])+'</ul>'
 tools='<div class="profile-tools"><article><h3>Systems and digital tools</h3><div class="tool-tags">'+''.join('<span>'+E(x)+'</span>' for x in d['systems'])+'</div></article><article><h3>Methods and improvement</h3><ul>'+''.join('<li>'+E(x)+'</li>' for x in d['methods'])+'</ul></article></div>'
 foundation=section('Education, languages and systems','professional-foundations','<div class="foundation-grid"><article><span class="eyebrow">Education</span><h3>'+E(education['institution'])+'</h3><p>'+E(education['faculty'])+' · '+E(education['degree'])+'</p><p>'+E(education['dates'])+'</p></article><article><span class="eyebrow">Languages</span>'+language+'</article></div>'+tools)
 work=section('Projects and recent contributions','recent-work','<div class="contribution-grid"><article><span class="eyebrow">Workplace improvement</span><h3>Travel Desk DMAIC project</h3><p>Applied Lean Six Sigma to agent allocation, training, sales materials and controls. Baseline median monthly agent sales: AED 8,059; target: AED 12,500.</p><p class="project-note">Projected annual opportunity: AED 746,088 across 14 agents, conditional on achieving the target. This is a modelled opportunity, not realised revenue.</p></article><article><span class="eyebrow">Product research</span><h3>Amsterdam product discovery</h3><p>A 12-part evidence-led study spanning customer needs, requirements, supplier feasibility, economics and pilot controls.</p><p class="project-note">Research and pre-pilot work; an iterate decision is recorded. Actual departures and post-pilot results are not established.</p><a class="text-link" href="/series/amsterdam-tourism-product-discovery/index.html">Explore the research ↗</a></article><article><span class="eyebrow">Operational workflow design</span><h3>Four Infra demonstrations</h3><p>InfraQuote, InfraDispatch, InfraSky and InfraCluster make quotation, dispatch, experience-readiness and pickup-clustering decisions inspectable.</p><p class="project-note">Static MVPs using supplied or browser-local data.</p><a class="text-link" href="/projects/index.html">Explore the projects ↗</a></article></div>')
 contact_section=section('Let’s connect','profile-contact','<div class="profile-contact"><div><p>'+E(d['work_authorisation'])+'</p><p>Open to conversations about Travel and Tourism operations, destination management, reservations and operational improvement.</p></div><div><a href="mailto:'+contact['email']+'">'+contact['email']+'</a><a href="tel:'+contact['phone_e164']+'">'+contact['phone_display']+'</a><a class="button" href="'+CV+'">View my CV</a></div></div>')
 p=ROOT/'profile/index.html';s=p.read_text();node=next(n for n in parse(s).nodes if n['tag']=='main');s=s[:node['start']]+'<main id="content">'+hero+quals+iata+career+work+training+foundation+contact_section+'</main>'+s[node['end']:];p.write_text(s)
 # Homepage retains its concise two-column summary and links into the detailed profile.
 p=ROOT/'index.html';s=p.read_text();node=next(n for n in parse(s).nodes if n['tag']=='div' and 'employers' in n['attrs'].get('class','').split());html='<div class="employers">'+''.join('<div><strong>'+E(x['company'])+'</strong><span>'+E(x['department'])+' · '+E(x['scope'])+'</span></div>' for x in d['career'])+'</div>';s=s[:node['start']]+html+s[node['end']:];p.write_text(s)
 print('Professional record rendered: Profile and homepage career summary.')
if __name__=='__main__':main()
