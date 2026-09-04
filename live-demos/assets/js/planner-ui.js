(function(){
  const $ = (id) => document.getElementById(id);
  let allLocations = [];
  let rows = [];
  let drops = [];
  let lastPlan = null;

  const zoneOrder = { Z1: 1, Z2: 2, Z3: 3, Z4: 4, Z5: 5, Z6: 6, CUSTOM: 9 };
  const routeSafe = (s) => encodeURIComponent((s || '').trim());
  const today = new Date().toISOString().split('T')[0];

  function init(){
    if ($('tourDate')) $('tourDate').value = today;
    loadProfile();
    InfraDispatchData.loadLocations().then((data) => {
      allLocations = data.locations || [];
      if ($('dbLastUpdated')) $('dbLastUpdated').textContent = data.lastUpdated || 'not set';
      if ($('locationDbCount')) $('locationDbCount').innerHTML = `Location database: <strong>${allLocations.length}</strong> indexed points (hotels, attractions, malls, theaters, city/regional places).`;
      addPickup({ name: '', adults: 0, children: 0, childSeats: 0 });
    }).catch((err) => {
      console.error(err);
      if ($('dbLastUpdated')) $('dbLastUpdated').textContent = 'database could not load';
      addPickup({ name: '', adults: 0, children: 0, childSeats: 0 });
    });
    bind();
  }

  function bind(){
    safeClick('saveProfile', saveProfile);
    safeClick('clearProfile', clearProfile);
    safeClick('startBlank', startBlank);
    safeClick('loadDemo', loadDemo);
    safeClick('addPickup', () => addPickup({}));
    safeClick('duplicateLastPickup', duplicateLast);
    safeClick('clearPickups', () => { rows = []; renderRows(); clearResult(); });
    if ($('useSameDrop')) $('useSameDrop').onchange = () => $('dropSection').classList.toggle('hidden', $('useSameDrop').checked);
    safeClick('addDrop', () => addDrop({}));
    if ($('includeExpenses')) $('includeExpenses').onchange = () => $('expenseFields').classList.toggle('hidden', !$('includeExpenses').checked);
    if ($('includePettyCash')) $('includePettyCash').onchange = () => $('pettyCashFields').classList.toggle('hidden', !$('includePettyCash').checked);

    safeClick('saveCustomPlace', saveCustomPlace);
    safeClick('addCustomPlaceToPickup', () => {
      const p = saveCustomPlace(true);
      if (p) addPickup({ name: p.name, selected: p, note: p.note || '', maps: p.maps || '' });
    });

    safeClick('calculate', generatePlan);
    safeClick('printManifest', () => { if (!lastPlan) generatePlan(); if (lastPlan) openPrintManifest(lastPlan); });
    safeClick('downloadHtml', downloadManifestHtml);
    safeClick('copyFullPlan', () => copyText(fullPlanText(lastPlan), 'Full operation plan copied'));
    safeClick('savePlanJson', savePlanJson);
    safeClick('loadPlanJson', () => $('planFileInput')?.click());
    $('planFileInput')?.addEventListener('change', loadPlanJson);
  }

  function safeClick(id, fn){
    const el = $(id);
    if (el) el.onclick = fn;
  }

  function loadProfile(){
    ['operatorName', 'teamName', 'operatorRole'].forEach((id) => {
      const el = $(id);
      const v = localStorage.getItem('infra_' + id);
      if (el && v) el.value = v;
    });
  }

  function saveProfile(){
    ['operatorName', 'teamName', 'operatorRole'].forEach((id) => {
      const el = $(id);
      if (el) localStorage.setItem('infra_' + id, el.value);
    });
    alert('Optional local profile saved in this browser.');
  }

  function clearProfile(){
    ['operatorName', 'teamName', 'operatorRole'].forEach((id) => {
      const el = $(id);
      localStorage.removeItem('infra_' + id);
      if (el) el.value = '';
    });
  }

  function saveCustomPlace(silent){
    const name = $('customPlaceName').value.trim();
    if (!name) {
      if (!silent) alert('Add custom place name first.');
      return null;
    }

    const place = {
      name,
      type: $('customPlaceType').value,
      zone: zoneText($('customPlaceZone').value),
      zoneCode: $('customPlaceZone').value,
      area: zoneText($('customPlaceZone').value),
      maps: $('customPlaceMaps').value.trim(),
      note: $('customPlaceNote').value.trim(),
      custom: true
    };

    const item = InfraDispatchData.saveCustomPlace(place);

    if (item.duplicate) {
      if ($('customPlaceStatus')) $('customPlaceStatus').textContent = 'Already exists. Existing place reused.';
      return item;
    }

    allLocations.push(item);
    if ($('customPlaceStatus')) $('customPlaceStatus').textContent = 'Saved to this browser.';
    if (!silent) setTimeout(() => { if ($('customPlaceStatus')) $('customPlaceStatus').textContent = ''; }, 2500);
    return item;
  }

  function zoneText(z){
    return {
      Z1: 'Yas / Airport / Al Raha',
      Z2: 'Saadiyat / Mina / Cultural District',
      Z3: 'Grand Mosque / ADNEC / Canal',
      Z4: 'Abu Dhabi City / Corniche / Downtown',
      Z5: 'Outer Abu Dhabi / Suburbs',
      Z6: 'Dubai / Other Emirate'
    }[z] || 'Custom area';
  }

  function startBlank(){
    rows = [];
    drops = [];
    renderRows();
    renderDrops();
    ['tourName', 'arrivalPoint', 'arrivalTime', 'guideName', 'driverName', 'supervisorName', 'vehicleBrand', 'vehicleColor', 'vehiclePlate'].forEach((id) => {
      const el = $(id);
      if (el) el.value = '';
    });
    addPickup({});
    clearResult();
  }

  function loadDemo(){
    startBlank();
    $('tourName').value = 'Abu Dhabi City Tour';
    $('arrivalPoint').value = 'Sheikh Zayed Grand Mosque';
    $('arrivalTime').value = '09:30';
    $('maxWindow').value = 60;
    $('guideName').value = 'Ahmed';
    $('driverName').value = 'Mohamed';
    $('vehicleBrand').value = 'Toyota Hiace';
    $('vehicleColor').value = 'White';
    $('vehiclePlate').value = 'Abu Dhabi 12345';
    rows = [];
    addPickup({ name: 'Hilton Abu Dhabi Yas Island', adults: 2, children: 1, childSeats: 1, note: 'Lobby pickup' });
    addPickup({ name: 'Yas Mall', adults: 2, children: 0, childSeats: 0, note: 'Main entrance' });
    addPickup({ name: 'Founder’s Memorial', adults: 2, children: 0, childSeats: 0, note: 'Visitor center / main entrance' });
    renderRows();
    clearResult();
  }

  function addPickup(data = {}){
    rows.push({ id: Date.now() + Math.random(), name: data.name || '', selected: data.selected || findLoc(data.name) || null, adults: +(data.adults ?? 0), children: +(data.children ?? 0), childSeats: +(data.childSeats ?? 0), note: data.note || '', maps: data.maps || '' });
    renderRows();
  }

  function addDrop(data = {}){
    drops.push({ id: Date.now() + Math.random(), name: data.name || '', selected: data.selected || findLoc(data.name) || null, note: data.note || '', maps: data.maps || '' });
    renderDrops();
  }

  function duplicateLast(){ if (rows.length) addPickup({ ...rows[rows.length - 1], id: undefined }); }

  function findLoc(name){
    if (!name) return null;
    const q = name.toLowerCase();
    return allLocations.find((x) => x.name.toLowerCase() === q || (x.aliases || []).some((a) => a.toLowerCase() === q)) || null;
  }

  function renderRows(){
    const wrap = $('pickupRows');
    if (!wrap) return;
    wrap.innerHTML = '';
    rows.forEach((r, i) => wrap.appendChild(rowEl(r, i, 'pickup')));
    if (!rows.length) wrap.innerHTML = '<div class="warning">No pickup points added yet. Use + Add point.</div>';
  }

  function renderDrops(){
    const wrap = $('dropRows');
    if (!wrap) return;
    wrap.innerHTML = '';
    drops.forEach((r, i) => wrap.appendChild(rowEl(r, i, 'drop')));
  }

  function rowEl(r, i, type){
    const div = document.createElement('div');
    div.className = 'point-card';
    div.dataset.id = r.id;
    div.innerHTML = `<div class="point-head"><strong>${type === 'pickup' ? 'Pickup' : 'Drop-off'} point ${i + 1}</strong><button class="btn danger small remove" type="button">Remove</button></div><div class="point-grid"><div class="field search-wrap"><label>Location name</label><input class="loc" value="${escapeHtml(r.name)}" placeholder="Search hotel, attraction, mall, airport or custom point"><div class="suggestions hidden"></div><small class="selectedMeta">${meta(r.selected)}</small></div>${type === 'pickup' ? `<div class="field"><label>Adult(s)</label><input class="adults" type="number" min="0" value="${r.adults || 0}"></div><div class="field"><label>Child(ren)</label><input class="children" type="number" min="0" value="${r.children || 0}"></div><div class="field"><label>Child seats</label><input class="childSeats" type="number" min="0" value="${r.childSeats || 0}"></div>` : ''}<div class="field full"><label>Meeting note / pickup instruction</label><input class="note" value="${escapeHtml(r.note || '')}" placeholder="Lobby / gate / bus bay / security note"></div><div class="field full"><label>Google Maps link override (optional)</label><input class="maps" value="${escapeHtml(r.maps || '')}" placeholder="Optional Google Maps link"></div></div>`;

    const loc = div.querySelector('.loc');
    const sug = div.querySelector('.suggestions');
    const metaEl = div.querySelector('.selectedMeta');

    loc.addEventListener('input', () => {
      r.name = loc.value;
      r.selected = null;
      showSuggestions(loc.value, sug, (place) => {
        r.name = place.name;
        r.selected = place;
        r.maps = place.maps || r.maps || '';
        loc.value = place.name;
        metaEl.innerHTML = meta(place);
        sug.classList.add('hidden');
      });
    });
    loc.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const first = sug.querySelector('button[data-pick-name]');
      if (!first) return;
      e.preventDefault();
      const name = first.getAttribute('data-pick-name');
      const place = allLocations.find((x) => x.name === name);
      if (place) {
        r.name = place.name;
        r.selected = place;
        r.maps = place.maps || r.maps || '';
        loc.value = place.name;
        metaEl.innerHTML = meta(place);
        sug.classList.add('hidden');
      }
    });

    div.querySelector('.note').oninput = (e) => r.note = e.target.value;
    div.querySelector('.maps').oninput = (e) => r.maps = e.target.value;

    if (type === 'pickup') ['adults', 'children', 'childSeats'].forEach((cls) => div.querySelector('.' + cls).oninput = (e) => r[cls] = +e.target.value || 0);

    div.querySelector('.remove').onclick = () => {
      if (type === 'pickup') {
        rows = rows.filter((x) => x.id !== r.id);
        renderRows();
      } else {
        drops = drops.filter((x) => x.id !== r.id);
        renderDrops();
      }
      clearResult();
    };

    return div;
  }

  function showSuggestions(q, el, onPick){
    q = (q || '').toLowerCase().trim();
    el.innerHTML = '';
    if (q.length < 2) { el.classList.add('hidden'); return; }

    const found = allLocations
      .filter((x) => [x.name, x.type, x.zone, x.area, ...(x.aliases || [])].join(' ').toLowerCase().includes(q))
      .sort((a,b) => a.name.localeCompare(b.name))
      .slice(0, 10);

    found.forEach((place) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('data-pick-name', place.name);
      b.innerHTML = `<span class="type-badge">${escapeHtml(place.type)}</span>${escapeHtml(place.name)}<small>${escapeHtml(place.area || place.zone || '')} ${place.custom ? '· Custom saved place' : ''}</small>`;
      b.onclick = () => onPick(place);
      el.appendChild(b);
    });

    if (!found.length) {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<span class="type-badge">Custom</span>Not found? Add “${escapeHtml(q)}” as custom place<small>Use custom-place panel below.</small>`;
      b.onclick = () => {
        $('customPlaceName').value = q;
        document.getElementById('pointsAcc').open = true;
        el.classList.add('hidden');
      };
      el.appendChild(b);
    }

    el.classList.remove('hidden');
  }

  function meta(place){
    return place ? `<span class="type-badge">${escapeHtml(place.type)}</span>${escapeHtml(place.area || place.zone || '')}${place.custom ? ' · Custom place' : ''}` : 'Search database or type a custom point.';
  }

  function collect(){
    const points = rows.map((r) => ({ ...r, selected: r.selected || findLoc(r.name), name: (r.name || (r.selected && r.selected.name) || '').trim() })).filter((r) => r.name);
    points.sort((a, b) => (zoneOrder[(a.selected && a.selected.zoneCode) || 'CUSTOM'] || 9) - (zoneOrder[(b.selected && b.selected.zoneCode) || 'CUSTOM'] || 9));

    const totalAdults = points.reduce((s, p) => s + (+p.adults || 0), 0);
    const totalChildren = points.reduce((s, p) => s + (+p.children || 0), 0);
    const childSeats = points.reduce((s, p) => s + (+p.childSeats || 0), 0);
    const totalPax = totalAdults + totalChildren;
    const customCount = points.filter((p) => (p.selected && p.selected.custom) || !p.selected).length;

    const state = {
      planId: 'ID-' + Date.now(),
      generatedAt: new Date().toISOString(),
      messageStyle: value('messageStyle') || 'operational-short',
      operatorName: value('operatorName'),
      teamName: value('teamName'),
      operatorRole: value('operatorRole'),
      tourDate: value('tourDate'),
      tourName: value('tourName') || 'Tour operation',
      tripMode: value('tripMode'),
      arrivalPoint: value('arrivalPoint'),
      arrivalTime: value('arrivalTime'),
      maxWindow: +value('maxWindow') || 60,
      guideName: value('guideName') || 'Guide',
      driverName: value('driverName') || 'Driver',
      vehicleSelect: value('vehicleSelect'),
      vehicleBrand: value('vehicleBrand'),
      vehicleColor: value('vehicleColor'),
      vehiclePlate: value('vehiclePlate'),
      manualDecision: value('manualDecision'),
      supervisorName: value('supervisorName'),
      validation: { traffic: checked('trafficChecked'), hotelAccess: checked('hotelAccessChecked'), openingHours: checked('openingHoursChecked'), supervisor: checked('supervisorApproved') },
      includeExpenses: checked('includeExpenses'), includeDarb: checked('includeDarb'), darbGateCount: +value('darbGateCount') || 0, tollFee: +value('tollFee') || 0, fuelEstimate: +value('fuelEstimate') || 0, parkingEstimate: +value('parkingEstimate') || 0, otherEstimate: +value('otherEstimate') || 0, otherExpenseNote: value('otherExpenseNote'),
      includePettyCash: checked('includePettyCash'), pettyCashReceiver: value('pettyCashReceiver'), pettyCashAmount: +value('pettyCashAmount') || 0, pettyCashPurpose: value('pettyCashPurpose'), pettyCashNote: value('pettyCashNote'),
      points,
      totalAdults,
      totalChildren,
      totalPax,
      childSeats,
      customCount
    };

    state.vehicle = InfraDispatchCalc.vehicleFor(totalPax, state.vehicleSelect);
    state.vehicleLine = vehicleLine(state);
    if (state.includeExpenses && state.includeDarb) {
      const estimated = InfraDispatchCalc.estimateDarbCrossings(state.points);
      if (!state.darbGateCount || state.darbGateCount < estimated) {
        state.darbGateCount = estimated;
        if ($('darbGateCount')) $('darbGateCount').value = String(estimated);
      }
    }
    state.score = InfraDispatchCalc.scorePlan(state);
    state.split = InfraDispatchCalc.recommendSplit(state);
    state.expenses = InfraDispatchCalc.expenseSummary(state);
    state.routeLinks = routeLinks(state);
    state.timeline = estimateTimeline(state);
    state.trafficComplexity = estimateTrafficComplexity(state);
    return state;
  }

  function value(id){ const el = $(id); return el ? el.value : ''; }
  function checked(id){ const el = $(id); return !!(el && el.checked); }

  function routeLinks(s){
    const names = s.points.map((p) => p.name);
    const first = names[0] || '';
    const dest = s.arrivalPoint || names[names.length - 1] || '';
    const waypoints = names.slice(1).join('|');
    const google = `https://www.google.com/maps/dir/?api=1&origin=${routeSafe(first)}&destination=${routeSafe(dest)}&travelmode=driving${waypoints ? '&waypoints=' + routeSafe(waypoints) : ''}`;
    const quick = `https://www.google.com/maps/dir/?api=1&origin=${routeSafe(first)}&destination=${routeSafe(dest)}&travelmode=driving`;
    return { google, quick };
  }

  function vehicleLine(s){
    const bits = [];
    if (s.vehicleBrand) bits.push(s.vehicleBrand);
    if (s.vehicleColor) bits.push(s.vehicleColor);
    if (s.vehiclePlate) bits.push('Plate: ' + s.vehiclePlate);
    return bits.join(' · ');
  }

  function generatePlan(){
    const s = collect();
    if (!s.points.length) { alert('Add at least one pickup point.'); return; }

    lastPlan = s;
    $('emptyResult').classList.add('hidden');
    const res = $('results');
    res.classList.remove('hidden');
    res.innerHTML = resultHtml(s);

    $('manifestPreview').innerHTML = `<div class="success"><strong>Manifest ready.</strong> Plan ID: ${escapeHtml(s.planId)} · Generated ${escapeHtml(new Date(s.generatedAt).toLocaleString())}</div>`;
    bindResultButtons();
    document.getElementById('resultsAcc').open = true;
    location.hash = '#resultsAcc';
  }

  function scoreLabel(score){ if (score >= 85) return 'Good plan'; if (score >= 70) return 'Review recommended'; return 'Split / supervisor review recommended'; }

  function resultHtml(s){
    const customWarn = s.customCount ? `<div class="warning"><strong>Custom location used.</strong> Verify meeting point and map link before dispatch.</div>` : '';
    const exp = s.expenses ? `<div class="metric"><span>Estimated expenses</span><strong>AED ${s.expenses.total.toFixed(0)}</strong></div>` : '';
    const zoneSpreadPct = Math.min(100, new Set(s.points.map((p)=>(p.selected&&p.selected.zoneCode)||'CUSTOM')).size * 20);
    const loadPct = Math.min(100, Math.round((s.totalPax / 40) * 100));
    const stopsPct = Math.min(100, s.points.length * 12);
    const trafficPct = s.trafficComplexity.score;
    const trafficBand = s.trafficComplexity.band;
    const timelineRows = s.timeline.stops.map((st, idx) => `<tr><td>${idx+1}</td><td>${escapeHtml(st.name)}</td><td>${escapeHtml(st.eta)}</td><td>${st.driveMin} min</td><td>${st.stopMin} min</td></tr>`).join('');
    return `<div class="metrics"><div class="metric"><span>Plan ID</span><strong>${escapeHtml(s.planId)}</strong><small>${escapeHtml(new Date(s.generatedAt).toLocaleString())}</small></div><div class="metric"><span>Decision</span><strong>${escapeHtml(s.split.decision)}</strong></div><div class="metric"><span>Dispatch readiness</span><strong>${s.score}/100</strong><small>${scoreLabel(s.score)}</small></div><div class="metric"><span>Total pax</span><strong>${s.totalPax}</strong><small>${s.totalAdults} adults · ${s.totalChildren} children</small></div><div class="metric"><span>Vehicle</span><strong>${escapeHtml(s.vehicle)}</strong><small>${escapeHtml(s.vehicleLine || 'No vehicle details')}</small></div><div class="metric"><span>Child seats</span><strong>${s.childSeats}</strong></div><div class="metric"><span>Pickup points</span><strong>${s.points.length}</strong></div><div class="metric"><span>Team</span><strong>${escapeHtml(s.guideName)} / ${escapeHtml(s.driverName)}</strong></div>${exp}</div><div class="card"><h3>Operations Dashboard</h3><p style="margin:0;color:#64748b">Visual complexity indicators for transport operations planning.</p><div class="metric"><span>Route spread</span><strong>${zoneSpreadPct}%</strong><div class="mini-meter"><span style="width:${zoneSpreadPct}%"></span></div></div><div class="metric"><span>Passenger load</span><strong>${loadPct}%</strong><div class="mini-meter"><span style="width:${loadPct}%"></span></div></div><div class="metric"><span>Stop complexity</span><strong>${stopsPct}%</strong><div class="mini-meter"><span style="width:${stopsPct}%"></span></div></div><div class="metric"><span>Traffic-light complexity</span><strong>${trafficPct}% (${escapeHtml(trafficBand)})</strong><div class="mini-meter"><span style="width:${trafficPct}%"></span></div><small>Estimated signals on route: ${s.trafficComplexity.signals}</small></div></div><div class="card"><h3>ETA Timeline (Beta Estimate)</h3><p style="margin:0;color:#64748b">Estimated stop-by-stop timing for dispatch coordination.</p><table class="manifest-table" style="margin-top:12px"><thead><tr><th>#</th><th>Stop</th><th>ETA</th><th>Drive</th><th>Stop</th></tr></thead><tbody>${timelineRows}</tbody></table><p class="db-note">Total estimated duration: <strong>${s.timeline.totalMin} min</strong> · Estimated arrival at destination: <strong>${escapeHtml(s.timeline.arrivalEta)}</strong></p></div>${customWarn}<div class="decision-card"><h3>Route decision logic</h3><p><strong>${escapeHtml(s.split.why)}</strong></p><p>Score is advisory for operations planning, not a live traffic guarantee.</p></div><div class="route-card"><h3>Google Maps route</h3><p>Google Maps is the only supported route link in this beta.</p><a class="btn" target="_blank" rel="noopener" href="${s.routeLinks.google}">Open Full Route</a><button class="btn secondary small copy" data-copy="route">Copy Full Route</button><a class="btn secondary small" target="_blank" rel="noopener" href="${s.routeLinks.quick}">Open Quick Share Link</a><button class="btn outline small copy" data-copy="quickroute">Copy Quick Link</button></div><div class="messages-stack"><div class="message-card featured-message"><div class="message-head"><h3>Driver Message</h3><button class="btn small copy" data-copy="driver">Copy</button></div><pre>${escapeHtml(driverMessage(s))}</pre></div><div class="message-card featured-message"><div class="message-head"><h3>Guide Message</h3><button class="btn small copy" data-copy="guide">Copy</button></div><pre>${escapeHtml(guideMessage(s))}</pre></div><div class="message-card featured-message"><div class="message-head"><h3>Guest Message</h3><button class="btn small copy" data-copy="guest">Copy</button></div><pre>${escapeHtml(guestMessage(s))}</pre></div></div>`;
  }

  function zoneDriveBase(zoneCode){
    return { Z1: 12, Z2: 11, Z3: 10, Z4: 9, Z5: 18, Z6: 24, CUSTOM: 14 }[zoneCode || 'CUSTOM'] || 14;
  }

  function pad2(n){ return String(n).padStart(2,'0'); }

  function addMinutes(hhmm, mins){
    const base = (hhmm && /^\d{2}:\d{2}$/.test(hhmm)) ? hhmm : '08:00';
    const [h,m] = base.split(':').map(Number);
    let total = h*60 + m + mins;
    total = ((total % 1440) + 1440) % 1440;
    const nh = Math.floor(total/60), nm = total % 60;
    return `${pad2(nh)}:${pad2(nm)}`;
  }

  function estimateTimeline(state){
    const start = state.arrivalTime && /^\d{2}:\d{2}$/.test(state.arrivalTime) ? addMinutes(state.arrivalTime, -state.maxWindow) : '08:00';
    const stops = [];
    let current = start;
    let totalMin = 0;
    for(let i=0;i<state.points.length;i++){
      const p = state.points[i];
      const zone = (p.selected && p.selected.zoneCode) || 'CUSTOM';
      const prev = i>0 ? ((state.points[i-1].selected && state.points[i-1].selected.zoneCode) || 'CUSTOM') : zone;
      const driveBase = zoneDriveBase(zone);
      const transition = zone===prev ? 0 : 8;
      const loadAdj = Math.min(6, Math.floor(state.totalPax/12));
      const driveMin = Math.max(6, driveBase + transition + loadAdj);
      const stopMin = Math.max(4, 4 + Math.min(8, (p.adults||0)+(p.children||0)));
      totalMin += driveMin + stopMin;
      current = addMinutes(current, driveMin);
      const eta = current;
      current = addMinutes(current, stopMin);
      stops.push({ name: p.name, eta, driveMin, stopMin });
    }
    return { stops, totalMin, arrivalEta: stops.length ? stops[stops.length-1].eta : start };
  }

  function estimateTrafficComplexity(state){
    const zones = new Set(state.points.map((p)=>(p.selected&&p.selected.zoneCode)||'CUSTOM')).size;
    let signals = 0;
    for(let i=0;i<state.points.length;i++){
      const z = (state.points[i].selected && state.points[i].selected.zoneCode) || 'CUSTOM';
      signals += { Z4: 8, Z3: 6, Z2: 5, Z1: 4, Z5: 3, Z6: 2, CUSTOM: 5 }[z] || 5;
      if(i>0){
        const prev = (state.points[i-1].selected && state.points[i-1].selected.zoneCode) || 'CUSTOM';
        if(prev !== z) signals += 5;
      }
    }
    signals += Math.max(0, zones-1) * 3;
    const score = Math.min(100, Math.max(10, Math.round((signals / 70) * 100)));
    const band = score >= 75 ? 'High' : score >= 45 ? 'Medium' : 'Low';
    return { signals, score, band };
  }

  function pointLines(s, internal = false){
    return s.points.map((p, i) => `${i + 1}. ${p.name} — ${p.adults || 0}A/${p.children || 0}C, seats:${p.childSeats || 0}${p.note ? ' — ' + p.note : ''}${p.maps ? ' — Map: ' + p.maps : ''}${internal && (!p.selected || p.selected.custom) ? ' [CUSTOM VERIFY]' : ''}`).join('\n');
  }

  function expenseNote(s){
    if (!s.includeExpenses) return '';
    const parts = [];
    if (s.includeDarb) parts.push(`Darb: ${s.darbGateCount} x AED ${s.tollFee} = AED ${(s.darbGateCount * s.tollFee).toFixed(0)}`);
    if (s.fuelEstimate) parts.push(`Fuel: AED ${s.fuelEstimate}`);
    if (s.parkingEstimate) parts.push(`Parking: AED ${s.parkingEstimate}`);
    if (s.otherEstimate) parts.push(`Other: AED ${s.otherEstimate}${s.otherExpenseNote ? ' — ' + s.otherExpenseNote : ''}`);
    if (s.expenses) parts.push(`Total estimate: AED ${s.expenses.total.toFixed(0)}`);
    return parts.length ? '\nEstimated expenses:\n' + parts.join('\n') : '';
  }

  function pettyNote(s){
    return s.includePettyCash ? `\nPetty cash: AED ${s.pettyCashAmount} to ${s.pettyCashReceiver}. Purpose: ${s.pettyCashPurpose || 'operation cash requirement'}.` : '';
  }

  function baseMessage(s){
    return `${s.tourName} | ${s.tourDate} | ${s.tripMode}\nGuide: ${s.guideName} | Driver: ${s.driverName}${s.vehicleLine ? '\nVehicle: ' + s.vehicleLine : ''}\nPlan ID: ${s.planId}`;
  }

  function driverMessage(s){
    if (s.messageStyle === 'formal') {
      return `Dear Driver,\n${baseMessage(s)}\nArrival target: ${s.arrivalPoint || 'TBC'} ${s.arrivalTime || ''}\n\nPickup sequence:\n${pointLines(s, true)}\n\nRoute: ${s.routeLinks.google}${pettyNote(s)}${expenseNote(s)}\n\nPlease confirm departure and final drop-off completion.`;
    }
    if (s.messageStyle === 'guest-friendly') {
      return `Hi ${s.driverName},\n${s.tourName} on ${s.tourDate}.\nStops:\n${pointLines(s, true)}\nRoute: ${s.routeLinks.google}\nThanks.`;
    }
    return `Driver Ops Brief\n${baseMessage(s)}\nArrival: ${s.arrivalPoint || 'TBC'} ${s.arrivalTime || ''}\nStops:\n${pointLines(s, true)}\nRoute: ${s.routeLinks.google}${pettyNote(s)}${expenseNote(s)}`;
  }

  function guideMessage(s){
    if (s.messageStyle === 'formal') {
      return `Dear Guide,\n${baseMessage(s)}\nGuests: ${s.totalPax} (${s.totalAdults} adults / ${s.totalChildren} children)\nChild seats: ${s.childSeats}\nDecision: ${s.split.decision} | Score: ${s.score}/100\n\nPoints:\n${pointLines(s, true)}\nRoute: ${s.routeLinks.google}`;
    }
    if (s.messageStyle === 'guest-friendly') {
      return `Hi ${s.guideName},\n${s.tourName} (${s.tourDate})\nGuests: ${s.totalPax}\nPickup points:\n${pointLines(s, true)}\nRoute: ${s.routeLinks.google}`;
    }
    return `Guide Ops Brief\n${baseMessage(s)}\nGuests: ${s.totalPax} | Seats: ${s.childSeats}\nDecision: ${s.split.decision} | Score: ${s.score}/100\nPoints:\n${pointLines(s, true)}\nRoute: ${s.routeLinks.google}`;
  }

  function guestMessage(s){
    if (s.messageStyle === 'formal') {
      return `Dear Guest,\nYour ${s.tourName} is scheduled for ${s.tourDate}.${s.vehicleLine ? '\nVehicle: ' + s.vehicleLine : ''}\nMeeting points:\n${s.points.map((p, i) => `${i + 1}. ${p.name}${p.note ? ' — ' + p.note : ''}`).join('\n')}\n\nPlease be ready on time.`;
    }
    if (s.messageStyle === 'operational-short') {
      return `${s.tourName} | ${s.tourDate}\nMeeting points:\n${s.points.map((p, i) => `${i + 1}. ${p.name}${p.note ? ' — ' + p.note : ''}`).join('\n')}`;
    }
    return `Welcome.\nYour ${s.tourName} is on ${s.tourDate}.\nPickups:\n${s.points.map((p, i) => `${i + 1}. ${p.name}${p.note ? ' — ' + p.note : ''}`).join('\n')}\nSee you soon.`;
  }

  function fullPlanText(s){
    if (!s) return 'No plan generated yet.';
    return `INFRA DISPATCH OPERATION PLAN\nPlan ID: ${s.planId}\nGenerated: ${new Date(s.generatedAt).toLocaleString()}\n${s.tourName} · ${s.tourDate}\nTeam: Guide ${s.guideName} / Driver ${s.driverName}\nDecision: ${s.split.decision}\nScore: ${s.score}/100\nVehicle: ${s.vehicle}${s.vehicleLine ? ' · ' + s.vehicleLine : ''}\n\nPickup manifest:\n${pointLines(s, true)}\n\nGoogle Maps route:\n${s.routeLinks.google}${expenseNote(s)}${pettyNote(s)}\n\nDRIVER MESSAGE\n${driverMessage(s)}\n\nGUIDE MESSAGE\n${guideMessage(s)}\n\nGUEST MESSAGE\n${guestMessage(s)}`;
  }

  function manifestBody(s){
    if (!s) return '<p>No manifest generated.</p>';
    const rowsHtml = s.points.map((p, i) => `<tr class="avoid-break"><td>${i + 1}</td><td><strong>${escapeHtml(p.name)}</strong><br><small>${escapeHtml((p.selected && p.selected.type) || 'Custom')}</small></td><td>${p.adults || 0}</td><td>${p.children || 0}</td><td>${p.childSeats || 0}</td><td>${escapeHtml(p.note || '')}</td><td>${p.maps ? `<small>${escapeHtml(p.maps)}</small>` : ''}${(!p.selected || p.selected.custom) ? '<br>Verify custom point' : ''}</td></tr>`).join('');
    const expenses = s.includeExpenses ? `<section class="avoid-break"><h3>Optional Expenses</h3><pre>${escapeHtml(expenseNote(s).trim() || 'No expense items entered.')}</pre></section>` : '';
    const petty = s.includePettyCash ? `<section class="avoid-break"><h3>Petty Cash</h3><pre>${escapeHtml(pettyNote(s).trim())}</pre></section>` : '';
    return `<main class="manifest-document"><section class="manifest-header avoid-break"><h1>InfraDispatch Operation Manifest</h1><p><strong>Plan ID:</strong> ${escapeHtml(s.planId)} · <strong>Generated:</strong> ${escapeHtml(new Date(s.generatedAt).toLocaleString())}</p><p><strong>${escapeHtml(s.tourName)}</strong> · ${escapeHtml(s.tourDate)} · Mode: ${escapeHtml(s.tripMode)}</p><p>Guide: ${escapeHtml(s.guideName)} · Driver: ${escapeHtml(s.driverName)} · Supervisor: ${escapeHtml(s.supervisorName || 'TBC')}</p><p>Vehicle: ${escapeHtml(s.vehicle)}${s.vehicleLine ? ' · ' + escapeHtml(s.vehicleLine) : ''}</p><p>Decision: ${escapeHtml(s.split.decision)} · Dispatch score: ${s.score}/100 · ${escapeHtml(scoreLabel(s.score))}</p><p>Google Maps route: <a href="${s.routeLinks.google}">${s.routeLinks.google}</a></p></section><section><h3>Pickup / Drop-off Manifest</h3><table class="manifest-table"><thead><tr><th>#</th><th>Point</th><th>Adult</th><th>Child</th><th>Seats</th><th>Note</th><th>Map / Ops check</th></tr></thead><tbody>${rowsHtml}</tbody></table></section>${expenses}${petty}<section class="page-break"><h3>Driver Briefing</h3><div class="manifest-message"><pre>${escapeHtml(driverMessage(s))}</pre></div><h3>Guide Briefing</h3><div class="manifest-message"><pre>${escapeHtml(guideMessage(s))}</pre></div><h3>Guest Message</h3><div class="manifest-message"><pre>${escapeHtml(guestMessage(s))}</pre></div></section></main>`;
  }

  function manifestDocument(s){
    const css = `@page{size:A4;margin:12mm}body{font-family:Arial,sans-serif;color:#111;margin:0;line-height:1.38;background:#fff}.manifest-document{max-width:190mm;margin:0 auto;padding:16px}h1{font-size:22px;margin:0 0 6px;color:#08111f}h3{font-size:15px;margin:18px 0 8px;color:#08111f}p{font-size:12px;margin:4px 0}.manifest-header{border:2px solid #08111f;border-radius:10px;padding:12px;margin-bottom:12px;background:#f8fafc}.manifest-table{width:100%;border-collapse:collapse;font-size:10.5px;table-layout:fixed}.manifest-table th,.manifest-table td{border:1px solid #c7cbd1;padding:5px;vertical-align:top;word-wrap:break-word}.manifest-table th{background:#08111f;color:#fff}.manifest-table th:nth-child(1){width:5%}.manifest-table th:nth-child(2){width:25%}.manifest-table th:nth-child(3),.manifest-table th:nth-child(4),.manifest-table th:nth-child(5){width:8%}.manifest-table th:nth-child(6){width:25%}.manifest-table th:nth-child(7){width:21%}pre{white-space:pre-wrap;font-family:Arial,sans-serif;font-size:11px;line-height:1.42;margin:0}.manifest-message{border:1px solid #d0d5dd;border-radius:10px;padding:10px;margin:8px 0;background:#f8fafc}.page-break{break-before:page;page-break-before:always}.avoid-break{break-inside:avoid;page-break-inside:avoid}.manifest-table thead{display:table-header-group}a{color:#0f3f76}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.manifest-document{padding:0;max-width:none}}`;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>InfraDispatch Operation Manifest</title><style>${css}</style></head><body>${manifestBody(s)}</body></html>`;
  }

  function openPrintManifest(s){
    const doc = manifestDocument(s);
    const w = window.open('', '_blank');
    if (!w) { downloadManifestHtml(); alert('Pop-up blocked. I downloaded manifest HTML instead.'); return; }
    w.document.open();
    w.document.write(doc);
    w.document.close();
    w.onload = () => setTimeout(() => { w.focus(); w.print(); }, 200);
  }

  function bindResultButtons(){
    document.querySelectorAll('[data-copy]').forEach((btn) => btn.onclick = () => {
      const k = btn.dataset.copy;
      const map = { driver: driverMessage, guide: guideMessage, guest: guestMessage, route: (x) => x.routeLinks.google, quickroute: (x) => x.routeLinks.quick };
      copyText(map[k](lastPlan), 'Copied');
    });
  }

  function savePlanJson(){
    const s = collect();
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: s
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `InfraDispatch_${(s.tourName || 'Plan').replace(/[^a-z0-9]/gi, '_')}_${s.tourDate || 'undated'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function loadPlanJson(event){
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        const s = parsed.data || parsed;
        if (!s || !Array.isArray(s.points)) throw new Error('Invalid file format');
        hydrateFromPlan(s);
        alert('Plan loaded successfully.');
      } catch (e) {
        alert('Could not load this plan JSON file.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function hydrateFromPlan(s){
    const setVal = (id, v) => { const el = $(id); if (el && v !== undefined && v !== null) el.value = v; };
    const setCheck = (id, v) => { const el = $(id); if (el) el.checked = !!v; };

    setVal('tourDate', s.tourDate);
    setVal('tourName', s.tourName);
    setVal('tripMode', s.tripMode);
    setVal('arrivalPoint', s.arrivalPoint);
    setVal('arrivalTime', s.arrivalTime);
    setVal('maxWindow', s.maxWindow);
    setVal('guideName', s.guideName);
    setVal('driverName', s.driverName);
    setVal('vehicleSelect', s.vehicleSelect);
    setVal('vehicleBrand', s.vehicleBrand);
    setVal('vehicleColor', s.vehicleColor);
    setVal('vehiclePlate', s.vehiclePlate);
    setVal('manualDecision', s.manualDecision);
    setVal('supervisorName', s.supervisorName);
    setVal('messageStyle', s.messageStyle || 'operational-short');

    setCheck('trafficChecked', s.validation?.traffic);
    setCheck('hotelAccessChecked', s.validation?.hotelAccess);
    setCheck('openingHoursChecked', s.validation?.openingHours);
    setCheck('supervisorApproved', s.validation?.supervisor);

    setCheck('includeExpenses', s.includeExpenses);
    $('expenseFields')?.classList.toggle('hidden', !s.includeExpenses);
    setCheck('includeDarb', s.includeDarb);
    setVal('darbGateCount', s.darbGateCount);
    setVal('tollFee', s.tollFee);
    setVal('fuelEstimate', s.fuelEstimate);
    setVal('parkingEstimate', s.parkingEstimate);
    setVal('otherEstimate', s.otherEstimate);
    setVal('otherExpenseNote', s.otherExpenseNote);

    setCheck('includePettyCash', s.includePettyCash);
    $('pettyCashFields')?.classList.toggle('hidden', !s.includePettyCash);
    setVal('pettyCashReceiver', s.pettyCashReceiver);
    setVal('pettyCashAmount', s.pettyCashAmount);
    setVal('pettyCashPurpose', s.pettyCashPurpose);
    setVal('pettyCashNote', s.pettyCashNote);

    rows = (s.points || []).map((p) => ({ id: Date.now() + Math.random(), name: p.name || '', selected: findLoc(p.name) || p.selected || null, adults: +(p.adults || 0), children: +(p.children || 0), childSeats: +(p.childSeats || 0), note: p.note || '', maps: p.maps || '' }));
    renderRows();
    clearResult();
  }

  function downloadManifestHtml(){
    if (!lastPlan) generatePlan();
    if (!lastPlan) return;
    const html = manifestDocument(lastPlan);
    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'InfraDispatch_Operation_Manifest.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function clearResult(){
    lastPlan = null;
    if ($('results')) $('results').classList.add('hidden');
    if ($('emptyResult')) $('emptyResult').classList.remove('hidden');
    if ($('manifestPreview')) $('manifestPreview').innerHTML = '';
  }

  function copyText(text, msg){
    navigator.clipboard?.writeText(text).then(() => alert(msg || 'Copied')).catch(() => {
      const t = document.createElement('textarea');
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
      alert(msg || 'Copied');
    });
  }

  function escapeHtml(s){
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
