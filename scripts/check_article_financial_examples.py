"""Independent arithmetic checks for selected published worked examples.
Rates and case inputs are assumptions; matching arithmetic does not validate outcomes.
"""
from pathlib import Path
from decimal import Decimal as D, ROUND_HALF_UP
import csv,json,math
ROOT=Path(__file__).resolve().parents[1]
def checks():
 rows=[]
 def add(slug,label,formula,actual,expected):
  rows.append(dict(url='/articles/'+slug+'/index.html',example=label,formula=formula,actual=round(float(actual),4),expected=expected,passCheck=abs(float(actual)-expected)<.011,scope='Arithmetic only; illustrative inputs, not verified business outcomes'))
 a='article-net-cost-selling-price-markup'
 for label,formula,actual,expected in [('Initial net cost','650+500+520+560+70',650+500+520+560+70,2300),('20% markup price','2000*(1+.20)',2000*1.2,2400),('20% markup margin','400/2400*100',400/2400*100,16.67),('Second net cost','650+500+650+700+100',650+500+650+700+100,2600),('20% target margin price','2600/(1-.20)',2600/.8,3250),('Second profit','3250-2600',3250-2600,650),('Low-margin quote','600/5600*100',600/5600*100,10.71)]:add(a,label,formula,actual,expected)
 for label,formula,actual,expected in [('Vehicle+guide+handling','650+500+100',1250,1250),('Two guests','1250/2',625,625),('Ten guests','1250/10',125,125)]:add('article-fixed-variable-costs-city-tour-pricing',label,formula,actual,expected)
 for label,formula,actual,expected in [('First break-even ceiling','ceil(1200/(180-40))',math.ceil(1200/(180-40)),9),('Second break-even','1400/(220-80)',1400/140,10),('Seven-guest revenue','7*220',1540,1540),('Seven-guest variable cost','7*80',560,560),('Seven-guest loss','1540-560-1400',-420,-420)]:add('article-participant-estimation-break-even-risk',label,formula,actual,expected)
 cases=[('hotel-apartment-cost-of-poor-quality','Visible monthly COPQ','22*20/60*45 + 8*45/60*45 + 1600',22*20/60*45+8*45/60*45+1600,2200),('hotel-apartment-total-cost-of-ownership','Option A five-year TCO','1850+1100+1600',4550,4550),('hotel-apartment-total-cost-of-ownership','Option B five-year TCO','2250+550+1350',4150,4150),('hotel-economics-of-service-failure','Single HVAC incident','1.25*50+.5*40+120+250',1.25*50+.5*40+120+250,452.50),('hotel-economics-of-service-failure','Eight incidents','452.5*8',452.5*8,3620),('hotel-preventive-maintenance-kpis','PM compliance','190/200*100',190/200*100,95),('hotel-apartment-preventive-maintenance-strategy','PM compliance','173/184*100',173/184*100,94.02),('hotel-apartment-preventive-maintenance-strategy','Visible HVAC labor','18*(1.5+.5)',36,36),('hotel-apartment-preventive-maintenance-strategy','Parts','18*85',1530,1530),('hotel-apartment-preventive-maintenance-strategy','Conditional avoided parts','4*85',340,340),('hotel-finance-cost-control-ai-toolkit','Cost per occupied night','96000/1200',80,80),('hotel-lean-six-sigma-ai-toolkit','Monthly COPQ','18*45+7*85+3*120',18*45+7*85+3*120,1765),('hotel-procurement-ai-toolkit','Supplier A landed cost','500*(80+5)',42500,42500),('hotel-procurement-ai-toolkit','Supplier B landed cost','500*84',42000,42000),('hotel-quality-audit-ai-toolkit','Avoidable recleans','14*55',770,770),('hotel-quality-audit-ai-toolkit','Scenario savings','(14-5)*55',495,495),('hotel-revenue-management-ai-toolkit','OTA net revenue','640*(1-.18)',640*(1-.18),524.80),('hotel-revenue-management-ai-toolkit','Scenario A revenue','54*500',27000,27000),('hotel-revenue-management-ai-toolkit','Scenario B revenue','48*600',28800,28800),('hotel-sales-corporate-accounts-ai-toolkit','Weighted pipeline','100000*.5',50000,50000),('hotel-sop-process-design-ai-toolkit','Labor value','18*6/60*45',81,81),('hotel-sop-process-design-ai-toolkit','Avoided labor','(18-6)*6/60*45',54,54)]
 cases += [('hotel-housekeeping-quality-control','First-pass quality','38/48*100',38/48*100,79.1667),('hotel-inventory-par-level-management','Reorder coverage','36*(4+2)',216,216),('hotel-first-time-right-operations','First-time-right','41/50*100',82,82),('hotel-first-time-right-operations','Rework hours','165/60',2.75,2.75),('hotel-critical-spare-parts-management','Monthly failure average','4/12',4/12,.3333),('hotel-workforce-productivity-efficiency','Direct task hours','(24*55+18*25)/60',29.5,29.5)]
 for slug,label,formula,actual,expected in cases:add(slug,label,formula,actual,expected)
 # Compute from unrounded source assumptions and compare with published downloadable outputs.
 for row in csv.DictReader((ROOT/'resources/amsterdam-product-discovery/article08-unit-economics-model.csv').read_text().splitlines()):
  guests=D(row['guests']);price=D(row['retail_price_vat_inclusive']);exvat=price/D('1.21');channel=row['channel']
  fee=price*D('.025')+D('.25')/2 if channel=='Direct' else exvat*(D('.25') if channel=='OTA' else D('.20'))
  net=exvat-fee;contribution=(net-D('1.5'))*guests-D('215')-D('18.75')
  add('amsterdam-product-discovery-08-commercial-model-unit-economics',channel+' / '+str(guests)+' guests','(price/1.21 - channel fee -1.50)*guests -215 -18.75',contribution,float(row['departure_contribution']))
 return rows
if __name__=='__main__':
 rows=checks();out=ROOT/'reports/knowledge-hub-restructure/financial-checks.csv'
 with out.open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
 print(json.dumps({'checks':len(rows),'passed':sum(x['passCheck'] for x in rows),'failures':[x for x in rows if not x['passCheck']]}))
