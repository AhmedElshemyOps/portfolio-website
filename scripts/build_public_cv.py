from pathlib import Path
import json
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
r=Path(__file__).resolve().parents[1];data=json.loads((r/'content/professional-profile.json').read_text());d=Document();s=d.sections[0];s.page_height=Inches(11.69);s.page_width=Inches(8.27);s.top_margin=s.bottom_margin=Inches(.5);s.left_margin=s.right_margin=Inches(.65)
n=d.styles['Normal'];n.font.name='Calibri';n.font.size=Pt(9);n.paragraph_format.space_after=Pt(4);n.paragraph_format.line_spacing=1.02
for name,size in [('Heading 1',11),('Heading 2',10)]:
 st=d.styles[name];st.font.name='Calibri';st.font.size=Pt(size);st.font.color.rgb=RGBColor.from_string('10283F');st.paragraph_format.space_before=Pt(8);st.paragraph_format.space_after=Pt(3)
d.styles['Title'].font.name='Calibri';d.styles['Title'].font.size=Pt(25);d.styles['Title'].font.color.rgb=RGBColor(0,0,0);d.styles['Title'].paragraph_format.space_after=Pt(3)
def p(t,style=None):return d.add_paragraph(t,style)
def h(t):return d.add_heading(t,1)
def career(x):
 p(x['company']+' | '+x['location'],'Heading 2');pp=p(x['department']+' | '+x['dates']);pp.runs[0].bold=True
 p(' '.join(x['contributions']))
p(data['name'],'Title');p(data['headline'],'Heading 2');p('DMC & MICE | B2B Reservations | Service Quality & Process Improvement')
p('Netherlands | +31 6 2889 5967 | ahmed.mahmoud.nl.work@gmail.com');p(data['work_authorisation']);p('ahmedqualityops.com | github.com/AhmedElshemyOps | linkedin.com/in/ahmed-mahmoud-tourism/')
h('Professional Profile');p(data['summary']);p('Target roles: DMC and destination operations, B2B reservations, guest services and operational improvement in Travel & Tourism and Hospitality.');h('Selected Operational Scale');p('Approx. 350 guests per month and groups up to 45 at Masarra DMC; approx. 120 B2B booking and case transactions per day at WebBeds; approx. 15 vehicles and drivers coordinated at Alnatalie. These figures describe operating scope, not revenue or efficiency gains.')
h('Professional Qualifications')
for c in data['certifications']:
 label=c['name'] if c['short_name']!='Lean Six Sigma Black Belt' else 'Lean Six Sigma Black Belt training certificate'
 p(label+' | '+c['issuer']+' | '+c['date']+(' | Master CV record' if not c.get('evidence_url') else ''))
h('IATA Diplomas');p(' • '.join(x['name']+' ('+x['date']+')' for x in data['iata']))
h('Career Experience')
for x in data['career'][:3]:career(x)
d.add_page_break()
p('Ahmed Mahmoud | Career Experience continued','Heading 1')
for x in data['career'][3:]:career(x)
h('Selected Cases and Recent Contributions')
p('Travel Desk DMAIC improvement','Heading 2');p('Lean Six Sigma workplace project on agent allocation, training, multilingual materials and control planning. Baseline median monthly agent sales: AED 8,059; target: AED 12,500. The AED 746,088 annual opportunity across 14 agents is projected and conditional on target achievement; it is not realised revenue.')
p('Amsterdam tourism product discovery and Netherlands relevance','Heading 2');p('12-part Amsterdam research case connecting customer evidence, requirements, supplier feasibility, unit economics and pilot controls. Demonstrates how international destination experience can inform Dutch product discovery. Pre-pilot research with an iterate decision; departures and post-pilot outcomes are not established.')
p('Four operational workflow demonstrations','Heading 2');p('InfraQuote supports quotation and margin checks. InfraDispatch explores assignments, route constraints and field handovers for the Netherlands and UAE. InfraSky supports viewing-readiness decisions for Dutch and UAE locations. InfraCluster groups pickups and reviews capacity. Four static browser MVPs with sample or operator-entered data; live integrations and measured production outcomes are not established. Case studies and demos: ahmedqualityops.com/projects/.')
h('Education');p('Cairo University | Faculty of Law | Licence / Bachelor of Law | 2006–2010')
h('Languages');p('; '.join(data['languages'])+'.')
h('Systems and Methods');p(', '.join(data['systems'])+'.');p('; '.join(data['methods'])+'.')
h('Leadership, Safety and Further Training');p('First Time Leading Others (February 2025); Highfield Level 2 COSHH, Merit (October 2025); AHA Heartsaver First Aid CPR AED (August 2025; renew by August 2027); IATA Pharma Products and Vaccines by Air (May 2024); risk assessment, work at height and safe handling; ETAA operations and sales courses (2019).')
p('Five UAE destination authorisations; UAE manual driving licence; intermediate desert-driving training and RYA Powerboat Level 2. Further training includes food safety, maritime readiness, vehicle assessment and insurance fundamentals.')
f=s.footer.paragraphs[0];f.alignment=2;f.add_run('Ahmed Mahmoud | Updated 8 October 2026 | ');field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');f._p.append(field)
for run in f.runs:run.font.size=Pt(8)
for el in [d._element,d.styles.element]:
 for b in el.xpath('.//w:pBdr'):b.getparent().remove(b)
d.core_properties.author=data['name'];d.core_properties.title='Ahmed Mahmoud CV';d.save(r/'documents/Ahmed-Mahmoud-CV.docx')
