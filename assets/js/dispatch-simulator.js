(function(){
  const scenario = {
    date: '2026-06-15',
    destination: 'Louvre Abu Dhabi',
    guideLanguage: 'English / French / Arabic',
    passengers: 26,
    vehicles: ['SUV-12', 'Van-7', 'Bus-28'],
    window: '08:00-09:00',
    stops: [
      {name:'Conrad Abu Dhabi Etihad Towers',lat:24.4667,lng:54.3219,pax:8,eta:'08:10'},
      {name:'The St. Regis Saadiyat Island Resort',lat:24.5381,lng:54.4333,pax:9,eta:'08:28'},
      {name:'W Abu Dhabi - Yas Island',lat:24.4672,lng:54.6043,pax:9,eta:'08:48'},
      {name:'Louvre Abu Dhabi',lat:24.5339,lng:54.3980,pax:26,eta:'09:20'}
    ]
  };

  let map;
  let poly;

  function qs(id){ return document.getElementById(id); }

  function init(){
    if(!qs('simMap')) return;
    renderScenario();
    renderStatuses({unassigned:2,assigned:7,enroute:3,delayed:1,completed:18,replacement:1});
    initMap();

    qs('simLoad')?.addEventListener('click', renderScenario);
    qs('simOptimize')?.addEventListener('click', runOptimization);
    qs('simCopyBrief')?.addEventListener('click', copyBrief);
    qs('simExportSheet')?.addEventListener('click', exportSheet);
    qs('simSendDriver')?.addEventListener('click', ()=>alert('Demo mode: dispatch packet sent to driver queue.'));
  }

  function renderScenario(){
    qs('simMeta').innerHTML = `
      <div><strong>Date:</strong> ${scenario.date}</div>
      <div><strong>Destination:</strong> ${scenario.destination}</div>
      <div><strong>Vehicles:</strong> ${scenario.vehicles.join(', ')}</div>
      <div><strong>Guide:</strong> ${scenario.guideLanguage}</div>
      <div><strong>Passengers:</strong> ${scenario.passengers}</div>
      <div><strong>Pickup Window:</strong> ${scenario.window}</div>`;
    qs('simStops').innerHTML = scenario.stops.slice(0,3).map((s,i)=>`<li>${i+1}. ${s.name} (${s.pax} pax)</li>`).join('');
  }

  function initMap(){
    map = L.map('simMap',{zoomControl:true}).setView([24.49,54.43],11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const latlngs = scenario.stops.map(s=>[s.lat,s.lng]);
    poly = L.polyline(latlngs,{color:'#d4af37',weight:4,opacity:0.95}).addTo(map);
    scenario.stops.forEach((s,i)=>{
      L.marker([s.lat,s.lng]).addTo(map).bindPopup(`<strong>${i+1}. ${s.name}</strong><br/>ETA ${s.eta}`);
    });
    map.fitBounds(poly.getBounds(),{padding:[20,20]});
    updateMapLinks();
  }

  function updateMapLinks(){
    const origin = encodeURIComponent(scenario.stops[0].name);
    const dest = encodeURIComponent(scenario.stops[scenario.stops.length-1].name);
    const waypoints = encodeURIComponent(scenario.stops.slice(1,-1).map(s=>s.name).join('|'));
    const google = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&waypoints=${waypoints}&travelmode=driving`;
    qs('simOpenGoogle').href = google;
  }

  function runOptimization(){
    const resultHtml = `
      <div><strong>Optimized Pickup Sequence</strong><br/>1) Conrad Etihad Towers -> 2) St. Regis Saadiyat -> 3) W Yas Island -> 4) Louvre Abu Dhabi</div>
      <div class="eta-cards">
        <div class="eta-card"><strong>08:10</strong><span>Conrad</span></div>
        <div class="eta-card"><strong>08:28</strong><span>St. Regis</span></div>
        <div class="eta-card"><strong>08:48</strong><span>W Yas</span></div>
        <div class="eta-card"><strong>09:20</strong><span>Louvre</span></div>
      </div>
      <div class="assign-grid">
        <div class="assign-box"><strong>Driver Assignment</strong><br/>Hamdan (Bus-28)</div>
        <div class="assign-box"><strong>Guide Assignment</strong><br/>Ahmed (English/French/Arabic)</div>
      </div>
      <p><span class="risk-badge medium">Delay Risk: Medium</span> Corniche peak + island crossing.</p>
      <p><strong>Route Summary:</strong> 49 km, 1h 10m estimated</p>`;
    qs('simResult').innerHTML = resultHtml;
    renderStatuses({unassigned:1,assigned:8,enroute:5,delayed:1,completed:20,replacement:0});
  }

  function renderStatuses(s){
    qs('simStatus').innerHTML = `
      <div class="sim-status"><span>Unassigned</span><strong>${s.unassigned}</strong></div>
      <div class="sim-status"><span>Assigned</span><strong>${s.assigned}</strong></div>
      <div class="sim-status"><span>En Route</span><strong>${s.enroute}</strong></div>
      <div class="sim-status"><span>Delayed</span><strong>${s.delayed}</strong></div>
      <div class="sim-status"><span>Completed</span><strong>${s.completed}</strong></div>
      <div class="sim-status"><span>Hero Replacement Needed</span><strong>${s.replacement}</strong></div>`;
  }

  function copyBrief(){
    const text = `Driver Brief (Demo)\nDate: ${scenario.date}\nTour: Abu Dhabi DMC Morning Run\nOrder: Conrad > St. Regis Saadiyat > W Yas > Louvre\nPickup Window: ${scenario.window}\nPassengers: ${scenario.passengers}\nVehicle: Bus-28\nGuide: EN/FR/AR\nDestination ETA: 09:20`;
    navigator.clipboard.writeText(text).then(()=>alert('Driver brief copied.'));
  }

  function exportSheet(){
    const rows = ['Stop,ETA,Passengers','Conrad Abu Dhabi Etihad Towers,08:10,8','The St. Regis Saadiyat Island Resort,08:28,9','W Abu Dhabi - Yas Island,08:48,9','Louvre Abu Dhabi,09:20,26'];
    const blob = new Blob([rows.join('\n')],{type:'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'InfraDispatch_Demo_Pickup_Sheet.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
