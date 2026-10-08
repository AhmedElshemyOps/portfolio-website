/* Netherlands planning workspace. Sources reviewed 8 October 2026.
   Illustrative routes and approximate area coordinates are not approved pickup pins.
   No live weather, traffic, availability, darkness measurements or compliance decisions. */
(function(global){
 'use strict';
 const sites=[
  {id:'artis',name:'ARTIS Planetarium · Amsterdam',lat:52.366,lon:4.917,kind:'indoor',darkness:'Indoor astronomy; not a dark-sky site',access:'Check admission, programme and group arrangements. Outdoor observing is only an advertised, confirmed event.',best:'Weather-resilient astronomy education, families and a city-based fallback.',source:'https://www.artis.nl/nl/artis-park/planetarium'},
  {id:'copernicus',name:'Copernicus · Overveen / Haarlem',lat:52.395,lon:4.599,kind:'observatory',darkness:'Managed telescope experience; regional light glow remains',access:'Confirm the actual visit, group capacity, accessible telescope and entrance with the observatory. Its website currently flags a future relocation; recheck the address.',best:'A nearby guided telescope experience, Moon/planet observation and education.',source:'https://sterrenwachtcopernicus.nl/nl/bezoek-ons'},
  {id:'lauwersmeer',name:'Lauwersmeer · Groningen / Friesland',lat:53.384,lon:6.213,kind:'dark-sky',darkness:'Recognised Dark Sky Park; no measured site score supplied',access:'Use an authorised viewing location or book a guided activity. Confirm exact platform, route, night access, facilities and return arrangements.',best:'A planned regional dark-sky excursion, preferably with a northern overnight base.',source:'https://www.staatsbosbeheer.nl/uit-in-de-natuur/locaties/lauwersmeer/over-het-lauwersmeer'},
  {id:'kennemerland',name:'Zuid-Kennemerland · access restriction example',lat:52.408,lon:4.573,kind:'restricted',darkness:'Potential darkness does not grant night access',access:'General park access is sunrise to sunset. This prototype blocks a routine after-dark operation; do not treat observatory access as permission to enter the surrounding park.',best:'Daytime nature programme; seek a separately authorised managed night activity.',source:'https://www.np-zuidkennemerland.nl/gebiedsinformatie/gebiedsregels/'}
 ];
 const routes={
  amsterdam:{name:'Amsterdam · Schiphol / hotels / RAI',stops:['Amsterdam Airport Schiphol','Amsterdam Sloterdijk station','RAI Amsterdam'],insight:'Airport exit timing, luggage and accessible boarding need separate buffers. Verify coach access, emission eligibility and an authorised RAI arrival bay; station names are planning areas, not agreed pickup points.',source:'https://www.amsterdam.nl/verkeer-vervoer/touringcar/'},
  haarlem:{name:'Haarlem / Overveen · astronomy transfer',stops:['Amsterdam Sloterdijk station','Haarlem station','Sterrenwacht Copernicus Overveen'],insight:'Reserve the observatory visit and agree the entrance before dispatch. Plan a late-return service and accessible telescope arrangements; public transport availability must be checked for the actual date.',source:'https://sterrenwachtcopernicus.nl/nl/bezoek-ons'},
  utrecht:{name:'Utrecht · event movement to Jaarbeurs',stops:['Amsterdam Airport Schiphol','Utrecht Centraal station','Jaarbeurs Utrecht'],insight:'Check vehicle-category rules in Utrecht independently of Amsterdam. Confirm the event entrance, coach bay and walking handover; do not assume a station is a permitted stopping place.',source:'https://www.utrecht.nl/wonen-en-leven/gezonde-leefomgeving/luchtkwaliteit/milieuzone-en-zero-emissiezone'}
 };
 const rad=d=>d*Math.PI/180;
 function offsetMinutes(iso){
  const instant=new Date(iso+'T12:00:00Z');
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(instant);
  const hour=Number(parts.find(p=>p.type==='hour').value);
  return (hour-12)*60;
 }
 function solarMinutes(iso,lat,lon,altitude,set=true){
  const d=new Date(iso+'T12:00:00Z');
  const day=Math.floor((Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())-Date.UTC(d.getUTCFullYear(),0,0))/86400000);
  const gamma=2*Math.PI/365*(day-1);
  const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
  const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
  const cos=(Math.sin(rad(altitude))-Math.sin(rad(lat))*Math.sin(decl))/(Math.cos(rad(lat))*Math.cos(decl));
  if(cos < -1 || cos > 1) return null; // Do not invent twilight where it never occurs.
  const angle=Math.acos(cos)*180/Math.PI;
  return 720-4*lon-eq+offsetMinutes(iso)+(set?4*angle:-4*angle);
 }
 function time(min){
  if(min===null) return 'Does not occur on this date';
  const m=((Math.round(min)%1440)+1440)%1440;
  return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+(min>=1440?' (+1 day)':min<0?' (previous day)':'');
 }
 function skyDecision(site,input){
  if(site.kind==='restricted') return {status:'BLOCKED',reason:'General access closes at sunset; this planner cannot authorise a night operation.'};
  if(!input.access) return {status:'HOLD',reason:'Confirm the dated visit, entrance and group access before release.'};
  if(!input.returnPlan) return {status:'HOLD',reason:'Confirm transport, accessible arrangements and the return plan before release.'};
  if(site.kind==='indoor' && input.target==='deep') return {status:'CHANGE PRODUCT',reason:'This is indoor astronomy education, not outdoor full-darkness photography. Choose the education target or confirm an appropriate outdoor site.'};
  if(site.kind==='indoor') return {status:'REVIEW READY',reason:'Indoor astronomy plan only. Confirm programme and ticket availability; this does not promise outdoor stargazing.'};
  if(!input.weather) return {status:'HOLD',reason:'Weather and warning checks are unconfirmed. No live weather is supplied by this planner.'};
  if(input.warning==='unsafe') return {status:'BLOCKED',reason:'Operator reports unsafe conditions; reschedule or use a separately confirmed indoor programme.'};
  if(input.target==='deep' && solarMinutes(input.date,site.lat,site.lon,-18)===null) return {status:'CHANGE PRODUCT',reason:'No astronomical night in this solar estimate. Do not sell full-darkness photography; consider a confirmed Moon/planet or indoor programme.'};
  if(input.warning==='poor') return {status:'CHANGE PRODUCT',reason:'Operator reports poor viewing conditions; change the promise, reschedule or arrange a confirmed indoor alternative.'};
  return {status:'REVIEW READY',reason:'Checks entered by the operator are complete. A human must still confirm target visibility, Moon altitude, supplier readiness and the final operating window.'};
 }
 function dispatchDecision(input){
  if(input.pax>input.capacity) return {status:'BLOCKED',reason:'Guest count exceeds the entered passenger capacity. Split or change the vehicle.'};
  if(!input.access || !input.team) return {status:'HOLD',reason:'Confirm the vehicle-specific access, agreed stopping points, team and movement details before release.'};
  return {status:'REVIEW READY',reason:'Manual planning checks complete. Route links do not certify legal coach access, real-time ETAs or availability.'};
 }
 const api={sites,routes,offsetMinutes,solarMinutes,time,skyDecision,dispatchDecision};
 if(typeof module!=='undefined' && module.exports) module.exports=api;
 if(!global.document) return;
 const $=id=>document.getElementById(id);
 const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function download(text,name,type){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 function today(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Amsterdam',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const part=k=>p.find(x=>x.type===k).value;return part('year')+'-'+part('month')+'-'+part('day');}
 function init(){
  const host=$('netherlandsWorkspace');if(!host)return;
  let output='';
  const mode=host.dataset.product;
  const checks='<label class="nl-check"><input type="checkbox" id="nlAccess"/> Dated access, agreed entrance and supplier arrangements confirmed</label><label class="nl-check"><input type="checkbox" id="nlReturn"/> Transport, accessibility, team and return plan confirmed</label>';
  if(mode==='sky'){
   host.innerHTML='<div class="nl-grid"><form id="nlForm"><label>Location / programme<select id="nlSite">'+sites.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join('')+'</select></label><label>Visit date<input required type="date" id="nlDate" value="'+today()+'"/></label><label>Viewing target<select id="nlTarget"><option value="moon">Moon / planets / guided education</option><option value="deep">Full-darkness photography / deep sky</option></select></label><label>Operator-reported viewing conditions<select id="nlWarning"><option value="unknown">Not checked</option><option value="clear">Reviewed as suitable</option><option value="poor">Poor viewing conditions</option><option value="unsafe">Unsafe weather / warning</option></select></label>'+checks+'<label class="nl-check"><input type="checkbox" id="nlWeather"/> Date-specific weather and KNMI warnings reviewed</label><button class="btn" type="submit">Build Dutch astronomy brief</button></form><div><div id="nlSiteInfo"></div><div id="nlResult" role="status" aria-live="polite">Choose a programme and enter the checks.</div></div></div>';
   const info=()=>{$('nlAccess').checked=false;$('nlReturn').checked=false;$('nlWeather').checked=false;$('nlWarning').value='unknown';const site=sites.find(x=>x.id===$('nlSite').value);$('nlSiteInfo').innerHTML='<h3>'+esc(site.name)+'</h3><p>'+esc(site.darkness)+'</p><p>'+esc(site.best)+'</p><p>'+esc(site.access)+'</p><a href="'+site.source+'" target="_blank" rel="noopener">Check the official location information</a>';output='';$('nlResult').textContent='Inputs changed. Build a new brief.';};
   $('nlSite').addEventListener('change',info);info();
   $('nlForm').addEventListener('submit',e=>{e.preventDefault();const site=sites.find(x=>x.id===$('nlSite').value);const input={date:$('nlDate').value,target:$('nlTarget').value,warning:$('nlWarning').value,access:$('nlAccess').checked,returnPlan:$('nlReturn').checked,weather:$('nlWeather').checked&&$('nlWarning').value!=='unknown'};const result=skyDecision(site,input);const sunset=solarMinutes(input.date,site.lat,site.lon,-.833),dark=solarMinutes(input.date,site.lat,site.lon,-18);
    output=['InfraSky · Netherlands planning brief',site.name,input.date+' · Europe/Amsterdam (UTC+'+offsetMinutes(input.date)/60+')',result.status,result.reason,'Sunset estimate: '+time(sunset),'Astronomical-night start estimate: '+time(dark),'Area coordinates are approximate, not a meeting pin. No live weather, Moon ephemeris or darkness measurement supplied.','Access note: '+site.access,'Official source: '+site.source,'Operational handover: confirm cloud forecast, Moon altitude/illumination, visible targets, cold/wind/dew protection, toilets, accessible surfaces, light discipline, emergency contact and final return.','Indoor fallback requires its own confirmed booking. No partnership or booking is implied.'].join('\n');$('nlResult').innerHTML='<h3>'+esc(result.status)+'</h3><p>'+esc(result.reason)+'</p><dl><dt>Sunset estimate</dt><dd>'+esc(time(sunset))+'</dd><dt>Astronomical-night start estimate</dt><dd>'+esc(time(dark))+'</dd></dl><p>Europe/Amsterdam; seasonal clock changes applied. Solar approximation, not a live astronomy service.</p>';});
  }else{
   host.innerHTML='<div class="nl-grid"><form id="nlForm"><label>Dutch scenario<select id="nlRoute">'+Object.entries(routes).map(([k,x])=>'<option value="'+k+'">'+esc(x.name)+'</option>').join('')+'</select></label><label>Start / agreed pickup area<input required id="nlFrom"/></label><label>Intermediate pickup area<input required id="nlVia"/></label><label>Destination / agreed entrance<input required id="nlTo"/></label><label>Movement date<input required type="date" id="nlDate" value="'+today()+'"/></label><label>Passengers<input required type="number" min="1" max="500" id="nlPax" value="16"/></label><label>Confirmed passenger capacity<input required type="number" min="1" max="100" id="nlCapacity" value="19"/></label><details class="advanced-settings"><summary>Advanced settings · timing and budget</summary><label>Operator-entered total drive time (minutes)<input required type="number" min="1" max="1440" id="nlDrive" value="60"/></label><label>Boarding, luggage and handover buffer (minutes)<input required type="number" min="0" max="500" id="nlBuffer" value="30"/></label><label>Operator-entered total cost (€)<input required type="number" min="0" step="0.01" id="nlCost" value="0"/></label></details>'+checks+'<button class="btn" type="submit">Build Dutch dispatch brief</button></form><div><div id="nlSiteInfo"></div><div id="nlResult" role="status" aria-live="polite">Enter your operating assumptions.</div></div></div>';
   const info=()=>{$('nlAccess').checked=false;$('nlReturn').checked=false;const route=routes[$('nlRoute').value];$('nlFrom').value=route.stops[0];$('nlVia').value=route.stops[1];$('nlTo').value=route.stops[2];$('nlSiteInfo').innerHTML='<h3>'+esc(route.name)+'</h3><ol>'+route.stops.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><p>'+esc(route.insight)+'</p><p>Illustrative sequence; agree exact meeting pins and entrances. No live route optimisation or travel-time estimate.</p><a href="'+route.source+'" target="_blank" rel="noopener">Check official operating information</a>';output='';$('nlResult').textContent='Scenario changed. Build a new brief.';};$('nlRoute').addEventListener('change',info);info();
   $('nlForm').addEventListener('submit',e=>{e.preventDefault();const route=routes[$('nlRoute').value];const input={pax:Number($('nlPax').value),capacity:Number($('nlCapacity').value),access:$('nlAccess').checked,team:$('nlReturn').checked};const stops=[$('nlFrom').value.trim(),$('nlVia').value.trim(),$('nlTo').value.trim()];const result=dispatchDecision(input);const duration=Number($('nlDrive').value)+Number($('nlBuffer').value);const cost=Number($('nlCost').value);const url='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(stops[0])+'&destination='+encodeURIComponent(stops[2])+'&waypoints='+encodeURIComponent(stops[1])+'&travelmode=driving';
    output=['InfraDispatch · Netherlands planning brief',route.name,$('nlDate').value+' · Europe/Amsterdam',result.status,result.reason,'Operator-reviewed sequence: '+stops.join(' → '),'Passengers / entered capacity: '+input.pax+' / '+input.capacity,'Operator-entered drive time plus buffers: '+duration+' minutes; not a traffic estimate.','Operator-entered budget: €'+cost.toFixed(2)+'; tax, tolls and supplier costs not inferred.',route.insight,'Before release: record exact pickup pins, supplier/driver contacts, luggage and wheelchair capacity, manifest, boarding counts, permitted stops, venue handover and contingency.','Route link (not coach-access validation): '+url,'Source: '+route.source].join('\n');$('nlResult').innerHTML='<h3>'+esc(result.status)+'</h3><p>'+esc(result.reason)+'</p><p>'+duration+' minutes from your entered assumptions · €'+cost.toFixed(2)+' entered budget.</p><a href="'+esc(url)+'" target="_blank" rel="noopener">Review illustrative route in Google Maps</a>';});
  }
  const form=$('nlForm');form.addEventListener('input',e=>{if(['nlDate','nlFrom','nlVia','nlTo'].includes(e.target.id)){$('nlAccess').checked=false;$('nlReturn').checked=false;if($('nlWeather'))$('nlWeather').checked=false;}output='';$('nlResult').textContent='Inputs changed. Build a new brief before exporting.';});
  const actions=document.createElement('div');actions.className='action-row';actions.innerHTML='<button type="button" class="btn secondary" id="nlExport">Download planning brief</button>';host.appendChild(actions);$('nlExport').addEventListener('click',()=>{if(!output){$('nlResult').textContent='Build a current brief before downloading.';return;}download(output,mode==='sky'?'infrasky-netherlands-brief.txt':'infradispatch-netherlands-brief.txt','text/plain;charset=utf-8');});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})(typeof window!=='undefined'?window:globalThis);
