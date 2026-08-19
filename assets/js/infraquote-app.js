'use strict';

(function initInfraQuote() {
  const DATA = window.INFRAQUOTE_DATA;
  const CALC = window.INFRAQUOTE_CALC;
  if (!DATA || !CALC) return;
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const STORAGE = 'infraquote_draft_v1';
  let step = 0;
  let quote = null;

  function today(offset = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
  }

  function defaultQuote() {
    const city = DATA.cities.abuDhabi;
    return {
      city: 'abuDhabi', quoteNo: CALC.quoteReference(city.code), quoteDate: today(), serviceDate: today(14), validityDate: today(7),
      clientCompany: '', contactPerson: '', clientEmail: '', clientPhone: '', enquiryRef: '', preparedBy: 'Ahmed Mahmoud', nationality: '',
      marketSource: 'Direct enquiry', currency: 'AED', serviceType: 'Private tour', quoteStatus: 'Draft',
      adults: 2, children: 0, infants: 0, guestProfile: 'Leisure', guideLanguage: 'English', pickupLocation: 'Abu Dhabi hotel', dropoffLocation: 'Abu Dhabi hotel', pickupPoints: 1, pickupTime: '09:00',
      tourDuration: 'Full day', customHours: 8, sellingStyle: 'FIT', comfortLevel: 'Comfort', tourPace: 'Balanced', tourDifficulty: 'Easy', specialOccasion: '', mealPreference: 'No meal required', guestInterests: ['Culture', 'Photography'], accessibility: '', wheelchair: false, childSeat: false, luggage: false, airportPickup: false, airportDropoff: false, transportMode: 'Tour only',
      itinerary: [
        stopFromAttraction(city.attractions[0]),
        stopFromAttraction(city.attractions[1]),
        stopFromAttraction(city.attractions[2]),
        stopFromAttraction(city.attractions[3])
      ],
      vehicleId: 'seven', vehicleQty: 1, vehicleOverride: '', guideType: 'Licensed guide', handlingFee: 250, riskBuffer: 150, flightNumber: '', terminalNote: '', flightTime: '', waitingPolicy: 'Standard waiting policy',
      costs: [
        costLine('Water and refreshments', 'Extras', 'Variable', 2, 15, true, 'Pending verification', 'Sample internal estimate', 'Included as onboard refreshment.'),
        costLine('Parking and toll allowance', 'Transport', 'Conditional', 1, 80, true, 'Pending verification', 'Estimated risk', 'Parking/tolls included as estimated allowance.', 'Estimated risk')
      ],
      vatMode: 'exclusive', gratuities: 'Gratuities are not included and remain at the guest’s discretion.',
      pricingMethod: 'margin', markupPct: 25, targetMargin: 22, reviewMargin: 18, minimumGuests: 8, rounding: 5,
      tourTitle: 'Abu Dhabi Cultural City Tour', tourDescription: 'A privately arranged Abu Dhabi city tour covering selected cultural highlights, photo stops and guided city orientation.',
      inclusions: 'Private vehicle with driver\nLicensed guide as stated\nSelected itinerary stops\nBottled water\nVAT as stated in the quotation',
      exclusions: 'Meals unless stated\nPersonal expenses\nOptional attractions not listed as included\nGratuities unless stated',
      cancellation: 'Cancellation and amendment terms are subject to final supplier conditions at the time of confirmation.', quoteTheme: 'Standard',
      terms: { ...DATA.defaultTerms, cancellation: 'Cancellation and amendment terms are subject to final supplier conditions at the time of confirmation.' }
    };
  }

  function stopFromAttraction(item) {
    return { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), attractionId: item.id, name: item.name, duration: item.defaultDuration, drive: 20, status: 'Included', ticketRequired: item.ticketRequired, ticketVerification: item.verification, adultTicket: item.adult, childTicket: item.child, infantTicket: item.infant, operationalNote: item.note, clientNote: item.ticketRequired ? 'Entrance subject to official availability and ticket policy.' : item.note };
  }

  function costLine(name, category, type, quantity, unitCost, include = true, verification = 'Pending verification', internalNote = '', clientNote = '', conditionStatus = 'Included') {
    return { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), name, category, type, quantity, unitCost, include, verification, internalNote, clientNote, conditionStatus, supplier: 'Sample / to verify' };
  }

  function totalGuests() { return Number(quote.adults || 0) + Number(quote.children || 0) + Number(quote.infants || 0); }
  function payingGuests() { return Number(quote.adults || 0) + Number(quote.children || 0); }
  function city() { return DATA.cities[quote.city] || DATA.cities.abuDhabi; }
  function vehicle() { return DATA.vehicles.find(v => v.id === quote.vehicleId) || DATA.vehicles[0]; }
  function guideRate() {
    const requested = String(quote.guideLanguage || '').trim().toLowerCase();
    return DATA.guideRates.find(g => g.language.toLowerCase() === requested) || DATA.guideRates.find(g => g.language === 'English') || DATA.guideRates[0];
  }
  function hours() { return quote.tourDuration === 'Half day' ? 5 : quote.tourDuration === 'Full day' ? 8 : Number(quote.customHours || 0); }
  function currencyInfo() { return DATA.currencyRates?.[quote.currency] || DATA.currencyRates?.AED || { rate: 1, note: 'Base costing currency' }; }
  function convert(value) { return Math.round(Number(value || 0) * currencyInfo().rate * 100) / 100; }
  function money(value) { return `${quote.currency} ${convert(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`; }
  function hasAirportService() { return quote.airportPickup || quote.airportDropoff || quote.transportMode !== 'Tour only'; }
  function plannedMinutes() {
    const stopMinutes = quote.itinerary.reduce((sum, stop) => sum + Number(stop.duration || 0) + Number(stop.drive || 0), 0);
    const pickupBuffer = Math.max(0, Number(quote.pickupPoints || 1) - 1) * 15;
    const airportBuffer = hasAirportService() ? (quote.waitingPolicy === 'VIP meet-and-greet buffer' ? 75 : quote.waitingPolicy === 'Extended waiting buffer' ? 60 : 45) : 0;
    const paceBuffer = quote.tourPace === 'Relaxed' ? 45 : quote.tourPace === 'Fast' ? -20 : 15;
    return Math.max(0, stopMinutes + pickupBuffer + airportBuffer + paceBuffer);
  }
  function experienceInsights() {
    const insights = [];
    const minutes = plannedMinutes();
    const capacity = hours() * 60;
    if (minutes > capacity) insights.push(`Planned experience is about ${minutes} minutes against ${capacity} available minutes. Remove a stop, reduce visit time, or extend duration.`);
    else insights.push(`Planned experience is about ${minutes} minutes against ${capacity} available minutes.`);
    if (quote.comfortLevel === 'Premium' || quote.comfortLevel === 'VIP') insights.push('Premium/VIP comfort selected: review vehicle quality, fewer crowded stops, and guide seniority.');
    if (quote.tourPace === 'Relaxed') insights.push('Relaxed pace selected: keep more breathing room for photos, restrooms, and cultural explanations.');
    if (quote.tourDifficulty === 'Senior-friendly' || quote.wheelchair) insights.push('Accessibility-sensitive itinerary: confirm step-free access, walking distance, and legal stopping points.');
    if (quote.mealPreference !== 'No meal required') insights.push(`Meal preference selected: ${quote.mealPreference}. Add time buffer and supplier confirmation.`);
    if (quote.specialOccasion) insights.push(`Special occasion noted: ${quote.specialOccasion}. Consider a small guest-facing personalization note.`);
    if (quote.guestInterests?.length) insights.push(`Interest tags: ${quote.guestInterests.join(', ')}.`);
    if (hasAirportService() && (!quote.flightNumber || !quote.flightTime)) insights.push('Airport service selected: flight number and flight time should be confirmed before dispatch.');
    return insights;
  }

  function generatedLines() {
    const v = vehicle();
    const g = guideRate();
    const h = hours();
    const guideCost = quote.tourDuration === 'Half day' ? g.halfDay : g.fullDay || g.halfDay;
    const overtimeHours = Math.max(0, h - (v.includedHours || h));
    const lines = [
      costLine(`${v.name} with driver`, 'Transport', 'Fixed', Number(quote.vehicleQty || 1), v.baseCost, true, 'Pending verification', v.notes),
      costLine(`${quote.guideLanguage || 'Guide language'} ${quote.guideType}`, 'Guide', 'Fixed', 1, guideCost + (g.premium || 0), true, 'Pending verification', `Guide rate is sample data. Pricing uses ${g.language} as the closest base rate; verify guide availability and any language supplement.`),
      costLine('Coordination / handling fee', 'Operations', 'Fixed', 1, Number(quote.handlingFee || 0), true, 'Internal estimate', 'Internal operations handling allowance.')
    ];
    if (overtimeHours > 0) lines.push(costLine('Vehicle overtime', 'Transport', 'Conditional', overtimeHours * Number(quote.vehicleQty || 1), v.overtimeRate, true, 'Pending verification', 'Estimated overtime based on selected duration.', 'Service extension may be charged.', 'Estimated risk'));
    if (Number(quote.pickupPoints || 1) > 1) lines.push(costLine('Extra pickup point allowance', 'Transport', 'Conditional', Number(quote.pickupPoints) - 1, 75, true, 'Pending verification', 'Multiple pickup points may affect timing and cost.', 'Multiple pickup points included as stated.', 'Estimated risk'));
    if (quote.luggage) lines.push(costLine('Luggage handling / vehicle comfort allowance', 'Transport', 'Conditional', 1, 120, true, 'Pending verification', 'Luggage can reduce vehicle comfort capacity or require vehicle upgrade.', 'Luggage requirement included as stated.', 'Estimated risk'));
    if (quote.airportPickup || ['Airport pickup', 'Airport pickup and drop-off'].includes(quote.transportMode)) lines.push(costLine('Airport pickup coordination allowance', 'Transport', 'Conditional', 1, 180, true, 'Pending verification', 'Flight tracking, meet point, parking and waiting time to verify.', 'Airport pickup included as stated.', 'Estimated risk'));
    if (quote.airportDropoff || ['Airport drop-off', 'Airport pickup and drop-off'].includes(quote.transportMode)) lines.push(costLine('Airport drop-off coordination allowance', 'Transport', 'Conditional', 1, 140, true, 'Pending verification', 'Terminal, luggage timing and departure buffer to verify.', 'Airport drop-off included as stated.', 'Estimated risk'));
    if (quote.childSeat) lines.push(costLine('Child seat rental', 'Extras', 'Variable', Math.max(1, Number(quote.children || 0)), 35, true, 'Pending verification', 'Verify supplier availability.', 'Child seat support included where available.'));
    if (quote.comfortLevel === 'Premium') lines.push(costLine('Premium comfort setup', 'Extras', 'Fixed', 1, 180, true, 'Internal estimate', 'Premium water/snack/tissue setup and comfort handling allowance.', 'Premium comfort setup included.'));
    if (quote.comfortLevel === 'VIP') lines.push(costLine('VIP comfort and meet-and-greet setup', 'Extras', 'Fixed', 1, 350, true, 'Pending verification', 'VIP setup may include senior guide handling, premium refreshments, and tighter coordination.', 'VIP comfort setup included.'));
    if (quote.mealPreference === 'Quick cafe stop') lines.push(costLine('Cafe stop planning allowance', 'Extras', 'Conditional', 1, 80, true, 'Pending verification', 'Cafe stop timing and venue must be verified.', 'Cafe stop can be included as stated.', 'Estimated risk'));
    if (quote.mealPreference === 'Lunch stop required') lines.push(costLine('Lunch stop coordination allowance', 'Extras', 'Conditional', 1, 150, true, 'Pending verification', 'Meal venue, menu and timing require supplier/client confirmation.', 'Lunch stop coordination included as stated.', 'Estimated risk'));
    if (quote.mealPreference === 'Premium restaurant') lines.push(costLine('Premium restaurant reservation handling', 'Extras', 'Conditional', 1, 250, true, 'Pending verification', 'Restaurant availability, menu, minimum spend and cancellation rules must be verified.', 'Premium restaurant coordination included as stated.', 'Pending confirmation'));
    quote.itinerary.forEach(stop => {
      if (!stop.ticketRequired || stop.ticketVerification === 'Client pays directly') return;
      if (Number(stop.adultTicket)) lines.push(costLine(`${stop.name} adult ticket`, 'Tickets', 'Variable', Number(quote.adults || 0), Number(stop.adultTicket), true, stop.ticketVerification, 'Sample ticket data only; verify official supplier/attraction rate.', 'Entrance included as stated.'));
      if (Number(stop.childTicket)) lines.push(costLine(`${stop.name} child ticket`, 'Tickets', 'Variable', Number(quote.children || 0), Number(stop.childTicket), true, stop.ticketVerification, 'Sample ticket data only; verify child age policy.', 'Child entrance included as stated.'));
      if (Number(stop.infantTicket)) lines.push(costLine(`${stop.name} infant ticket`, 'Tickets', 'Variable', Number(quote.infants || 0), Number(stop.infantTicket), true, stop.ticketVerification, 'Sample ticket data only; verify infant age policy.', 'Infant entrance included as stated.'));
    });
    return lines;
  }

  function allLines() { return [...generatedLines(), ...quote.costs]; }

  function results() {
    const lines = allLines();
    const totals = CALC.classifyCosts(lines, quote.riskBuffer);
    const price = CALC.pricing({ netCost: totals.netCost, method: quote.pricingMethod, markupPct: quote.markupPct, targetMarginPct: quote.targetMargin, vatMode: quote.vatMode, vatRate: DATA.vatRate, totalGuests: totalGuests(), adults: quote.adults, children: quote.children, rounding: quote.rounding });
    const be = quote.serviceType === 'Shared tour' ? CALC.breakEven({ fixedCost: totals.fixed + totals.conditional + totals.riskBuffer, variableCost: totals.variable, payingGuests: payingGuests(), sellingPerGuest: price.pricePerGuest, minimumTarget: quote.minimumGuests }) : null;
    const rec = CALC.recommendVehicle(totalGuests(), quote.luggage, quote.serviceType, DATA.vehicles);
    const riskLevel = (be?.risk === 'Red' || totals.pending > 2 || rec.warnings.length > 1) ? 'High' : (be?.risk === 'Amber' || totals.pending || rec.warnings.length) ? 'Medium' : 'Controlled';
    const marginStatus = CALC.marginStatus(price.actualMargin, quote.reviewMargin, riskLevel, price.profit);
    const ready = CALC.readiness(quote, totals, price, be);
    return { lines, totals, price, be, rec, riskLevel, marginStatus, ready };
  }

  function setField(id, value) {
    const el = $(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = Boolean(value);
    else el.value = value ?? '';
  }

  function fillForm() {
    ['clientCompany','contactPerson','clientEmail','clientPhone','enquiryRef','quoteNo','quoteDate','serviceDate','validityDate','preparedBy','marketSource','nationality','currency','serviceType','quoteStatus','adults','children','infants','guestProfile','guideLanguage','pickupLocation','dropoffLocation','pickupPoints','pickupTime','tourDuration','customHours','sellingStyle','comfortLevel','tourPace','tourDifficulty','specialOccasion','mealPreference','accessibility','transportMode','flightNumber','terminalNote','flightTime','waitingPolicy','vehicleQty','vehicleOverride','guideType','handlingFee','riskBuffer','vatMode','gratuities','pricingMethod','markupPct','targetMargin','reviewMargin','minimumGuests','rounding','quoteTheme','tourTitle','tourDescription','inclusions','exclusions','cancellation'].forEach(id => setField(id, quote[id]));
    setField('vehicleSelect', quote.vehicleId);
    ['wheelchair','childSeat','luggage','airportPickup','airportDropoff'].forEach(id => setField(id, quote[id]));
    $$('[data-interest]').forEach(el => { el.checked = (quote.guestInterests || []).includes(el.dataset.interest); });
    $('totalGuests').value = totalGuests();
    if ($('currencyHint')) $('currencyHint').textContent = currencyInfo().note;
  }

  function readForm() {
    ['clientCompany','contactPerson','clientEmail','clientPhone','enquiryRef','quoteNo','quoteDate','serviceDate','validityDate','preparedBy','marketSource','nationality','currency','serviceType','quoteStatus','guestProfile','guideLanguage','pickupLocation','dropoffLocation','pickupTime','tourDuration','sellingStyle','comfortLevel','tourPace','tourDifficulty','specialOccasion','mealPreference','accessibility','transportMode','flightNumber','terminalNote','flightTime','waitingPolicy','vehicleOverride','guideType','vatMode','gratuities','pricingMethod','quoteTheme','tourTitle','tourDescription','inclusions','exclusions','cancellation'].forEach(id => { quote[id] = $(id).value; });
    quote.vehicleId = $('vehicleSelect').value;
    ['adults','children','infants','pickupPoints','customHours','vehicleQty','handlingFee','riskBuffer','markupPct','targetMargin','reviewMargin','minimumGuests','rounding'].forEach(id => { quote[id] = Number($(id).value || 0); });
    ['wheelchair','childSeat','luggage','airportPickup','airportDropoff'].forEach(id => { quote[id] = $(id).checked; });
    quote.guestInterests = $$('[data-interest]:checked').map(el => el.dataset.interest);
    quote.terms.cancellation = quote.cancellation;
    $('totalGuests').value = totalGuests();
  }

  function renderProgress() {
    const labels = ['Client','Guests','Itinerary','Costs','Extras','Pricing','Worksheet','Client quote'];
    $('quoteProgress').innerHTML = labels.map((label, i) => `<button type="button" class="${i === step ? 'active' : i < step ? 'done' : ''}" data-go-step="${i}"><span>${i + 1}</span>${label}</button>`).join('');
    $$('[data-go-step]').forEach(btn => btn.addEventListener('click', () => { readForm(); step = Number(btn.dataset.goStep); render(); }));
  }

  function renderItinerary() {
    $('itineraryList').innerHTML = quote.itinerary.map((stop, index) => `<article class="quote-item"><div class="item-head"><strong>${index + 1}. ${stop.name}</strong><button type="button" data-remove-stop="${stop.id}">Remove</button></div><div class="mini-grid"><label>Duration min<input data-stop="${stop.id}" data-key="duration" type="number" value="${stop.duration}"/></label><label>Drive min<input data-stop="${stop.id}" data-key="drive" type="number" value="${stop.drive}"/></label><label>Status<select data-stop="${stop.id}" data-key="status"><option ${stop.status==='Included'?'selected':''}>Included</option><option ${stop.status==='Optional'?'selected':''}>Optional</option><option ${stop.status==='Excluded'?'selected':''}>Excluded</option><option ${stop.status==='To be confirmed'?'selected':''}>To be confirmed</option></select></label><label>Ticket status<select data-stop="${stop.id}" data-key="ticketVerification"><option ${stop.ticketVerification==='Verified'?'selected':''}>Verified</option><option ${stop.ticketVerification==='Pending verification'?'selected':''}>Pending verification</option><option ${stop.ticketVerification==='Not required'?'selected':''}>Not required</option><option ${stop.ticketVerification==='Client pays directly'?'selected':''}>Client pays directly</option></select></label><label>Adult ticket<input data-stop="${stop.id}" data-key="adultTicket" type="number" value="${stop.adultTicket}"/></label><label>Child ticket<input data-stop="${stop.id}" data-key="childTicket" type="number" value="${stop.childTicket}"/></label></div><label>Operational note<textarea data-stop="${stop.id}" data-key="operationalNote">${stop.operationalNote || ''}</textarea></label><label>Client-facing note<textarea data-stop="${stop.id}" data-key="clientNote">${stop.clientNote || ''}</textarea></label></article>`).join('');
    $$('[data-stop]').forEach(el => el.addEventListener('input', () => { const stop = quote.itinerary.find(s => s.id === el.dataset.stop); if (stop) stop[el.dataset.key] = el.type === 'number' ? Number(el.value || 0) : el.value; save(); renderSummaryOnly(); }));
    $$('[data-remove-stop]').forEach(btn => btn.addEventListener('click', () => { quote.itinerary = quote.itinerary.filter(s => s.id !== btn.dataset.removeStop); render(); }));
  }

  function renderCosts() {
    $('costList').innerHTML = quote.costs.map(line => `<article class="quote-item"><div class="item-head"><strong>${line.name}</strong><button type="button" data-remove-cost="${line.id}">Remove</button></div><div class="mini-grid"><label>Name<input data-cost="${line.id}" data-key="name" value="${line.name}"/></label><label>Category<input data-cost="${line.id}" data-key="category" value="${line.category}"/></label><label>Type<select data-cost="${line.id}" data-key="type"><option ${line.type==='Fixed'?'selected':''}>Fixed</option><option ${line.type==='Variable'?'selected':''}>Variable</option><option ${line.type==='Conditional'?'selected':''}>Conditional</option></select></label><label>Condition<select data-cost="${line.id}" data-key="conditionStatus"><option ${line.conditionStatus==='Not applicable'?'selected':''}>Not applicable</option><option ${line.conditionStatus==='Included'?'selected':''}>Included</option><option ${line.conditionStatus==='Excluded'?'selected':''}>Excluded</option><option ${line.conditionStatus==='Pending confirmation'?'selected':''}>Pending confirmation</option><option ${line.conditionStatus==='Estimated risk'?'selected':''}>Estimated risk</option></select></label><label>Qty<input data-cost="${line.id}" data-key="quantity" type="number" value="${line.quantity}"/></label><label>Unit cost<input data-cost="${line.id}" data-key="unitCost" type="number" value="${line.unitCost}"/></label><label>Verification<select data-cost="${line.id}" data-key="verification"><option ${line.verification==='Verified'?'selected':''}>Verified</option><option ${line.verification==='Pending verification'?'selected':''}>Pending verification</option><option ${line.verification==='Internal estimate'?'selected':''}>Internal estimate</option></select></label><label>Included<select data-cost="${line.id}" data-key="include"><option value="true" ${line.include?'selected':''}>Yes</option><option value="false" ${!line.include?'selected':''}>No</option></select></label></div><label>Internal note<textarea data-cost="${line.id}" data-key="internalNote">${line.internalNote || ''}</textarea></label><label>Client note<textarea data-cost="${line.id}" data-key="clientNote">${line.clientNote || ''}</textarea></label></article>`).join('');
    $$('[data-cost]').forEach(el => el.addEventListener('input', () => { const line = quote.costs.find(c => c.id === el.dataset.cost); if (!line) return; line[el.dataset.key] = el.dataset.key === 'include' ? el.value === 'true' : el.type === 'number' ? Number(el.value || 0) : el.value; save(); renderSummaryOnly(); }));
    $$('[data-remove-cost]').forEach(btn => btn.addEventListener('click', () => { quote.costs = quote.costs.filter(c => c.id !== btn.dataset.removeCost); render(); }));
  }

  function renderSummaryOnly() {
    const r = results();
    $('summaryCards').innerHTML = [
      ['Net cost', money(r.totals.netCost)],
      ['Final price', money(r.price.finalPrice)],
      ['Profit', money(r.price.profit)],
      ['Margin', `${r.price.actualMargin}%`],
      ['Experience time', `${plannedMinutes()} min`],
      ['Break-even', r.be ? (Number.isFinite(r.be.breakEvenGuests) ? `${r.be.breakEvenGuests} guests` : 'N/A') : 'N/A'],
      ['Readiness', `${r.ready.score}/100`]
    ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    $('riskPanel').innerHTML = `<strong>${r.marginStatus}</strong><p>Risk level: ${r.riskLevel}. Pending verification items: ${r.totals.pending}. ${r.rec.warnings.join(' ')} ${currencyInfo().note}.</p>`;
    renderWorksheet(r); renderClientQuote(r); renderValidation(r); renderBreakEven(r); renderVehicle(r); renderItineraryAdvisor(); renderPricingAdvisor(r);
  }

  function renderVehicle(r) {
    const airport = hasAirportService() ? `<li>Airport service: ${quote.transportMode}. Flight ${quote.flightNumber || 'TBC'}, ${quote.flightTime || 'time TBC'}, ${quote.terminalNote || 'terminal/meeting point TBC'}.</li>` : '';
    $('vehiclePanel').innerHTML = `<strong>Recommended vehicle: ${r.rec.vehicle.name} x ${r.rec.quantity}</strong><p>Comfort capacity ${r.rec.vehicle.comfortGuests}, max ${r.rec.vehicle.maxGuests}. ${r.rec.warnings.join(' ') || 'Vehicle recommendation is within configured comfort logic.'}</p><ul class="advisor-list"><li>Comfort level: ${quote.comfortLevel}. Luggage: ${quote.luggage ? 'Yes, review capacity' : 'No luggage flag'}.</li>${airport}<li>Guide language: ${quote.guideLanguage || 'TBC'} using editable guide-language input.</li></ul>`;
  }

  function renderItineraryAdvisor() {
    if (!$('itineraryAdvisor')) return;
    const minutes = plannedMinutes();
    const capacity = hours() * 60;
    const status = minutes > capacity ? 'Overloaded' : minutes > capacity * 0.9 ? 'Tight' : 'Balanced';
    $('itineraryAdvisor').innerHTML = `<div class="advisor-head"><strong>Experience advisor: ${status}</strong><span>${minutes} / ${capacity} min</span></div><ul class="advisor-list">${experienceInsights().map(item => `<li>${item}</li>`).join('')}</ul>`;
  }

  function renderPricingAdvisor(r) {
    if (!$('pricingAdvisor')) return;
    const suggestions = [];
    if (r.price.actualMargin < Number(quote.reviewMargin || 0)) suggestions.push('Margin is below review threshold; increase selling price, reduce net cost, or require approval.');
    if (quote.currency !== 'AED') suggestions.push(`${quote.currency} is display-only demo conversion; confirm live exchange rate before sending.`);
    if (quote.comfortLevel === 'Premium' || quote.comfortLevel === 'VIP') suggestions.push('Premium/VIP comfort selected; make sure the selling price reflects extra service effort.');
    if (quote.mealPreference !== 'No meal required') suggestions.push('Meal preference can create hidden timing and supplier costs; verify whether it is included or only coordinated.');
    if (hasAirportService()) suggestions.push('Airport service selected; review parking, waiting, flight delay, and luggage risk.');
    $('pricingAdvisor').innerHTML = `<div class="advisor-head"><strong>Pricing advisor</strong><span>${r.marginStatus}</span></div><ul class="advisor-list">${(suggestions.length ? suggestions : ['Pricing looks controlled for the current demo assumptions.']).map(item => `<li>${item}</li>`).join('')}</ul>`;
  }

  function renderBreakEven(r) {
    $('breakEvenPanel').innerHTML = r.be ? `<h3>Shared-tour break-even</h3><div class="mini-results"><div><span>Contribution / guest</span><strong>${money(r.be.contributionPerGuest)}</strong></div><div><span>Break-even guests</span><strong>${Number.isFinite(r.be.breakEvenGuests) ? r.be.breakEvenGuests : 'N/A'}</strong></div><div><span>Risk</span><strong>${r.be.risk}</strong></div><div><span>Profit/loss</span><strong>${money(r.be.profit)}</strong></div></div><p>${r.be.risk === 'Red' ? 'Review selling price, set minimum participants, merge departures, use a smaller vehicle, offer private upgrade, or request supervisor approval.' : 'Break-even reviewed for current guest count.'}</p>` : '<h3>Break-even</h3><p>Not applicable for private/package tours unless shared-tour logic is selected.</p>';
  }

  function renderValidation(r) {
    const extraWarnings = [];
    if (plannedMinutes() > hours() * 60) extraWarnings.push('Itinerary timing is overloaded against selected duration.');
    if (hasAirportService() && (!quote.flightNumber || !quote.flightTime)) extraWarnings.push('Airport service requires flight number and flight time before dispatch.');
    if (!quote.guestInterests?.length) extraWarnings.push('No guest interest tags selected; quote may feel generic.');
    const guestCare = experienceInsights().filter(item => !item.startsWith('Planned experience'));
    const group = (title, items, cls) => `<div class="${cls}"><h3>${title}</h3>${items.length ? `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>` : '<p>None.</p>'}</div>`;
    $('validationPanel').innerHTML = `<div class="validation-grid">${group('Blocking issues', r.ready.blocking, 'block')}${group('Warnings', [...r.ready.warnings, ...extraWarnings], 'warn')}${group('Guest-experience checks', [...r.ready.suggestions, ...guestCare], 'suggest')}</div>`;
  }

  function costRows(lines) {
    return lines.map(l => `<tr><td>${l.name}</td><td>${l.category}</td><td>${l.type}</td><td>${l.quantity}</td><td>${money(l.unitCost)}</td><td>${money(CALC.costLineTotal(l))}</td><td>${l.include ? 'Yes' : 'No'}</td><td>${l.verification}</td><td>${l.supplier || ''}</td><td>${l.internalNote || ''}</td></tr>`).join('');
  }

  function renderWorksheet(r) {
    $('internalWorksheet').innerHTML = `<h3>Internal worksheet</h3><div class="worksheet-grid"><div><span>Quote</span><strong>${quote.quoteNo}</strong></div><div><span>Client</span><strong>${quote.clientCompany || 'Missing'}</strong></div><div><span>Nationality</span><strong>${quote.nationality || 'Missing'}</strong></div><div><span>Guests</span><strong>${totalGuests()}</strong></div><div><span>Vehicle</span><strong>${vehicle().name} x ${quote.vehicleQty}</strong></div><div><span>Net cost</span><strong>${money(r.totals.netCost)}</strong></div><div><span>Selling before VAT</span><strong>${money(r.price.beforeVat)}</strong></div><div><span>VAT</span><strong>${money(r.price.vatAmount)}</strong></div><div><span>Final price</span><strong>${money(r.price.finalPrice)}</strong></div></div><p class="quote-note">${currencyInfo().note}. Base sample costs are maintained in AED for calculation consistency.</p><div class="table-wrap"><table><thead><tr><th>Cost Item</th><th>Category</th><th>Type</th><th>Qty</th><th>Unit</th><th>Total</th><th>Client?</th><th>Verification</th><th>Supplier</th><th>Internal Notes</th></tr></thead><tbody>${costRows(r.lines)}</tbody></table></div>`;
  }

  function clientText(r) {
    const itinerary = quote.itinerary.map((s, i) => `${i + 1}. ${s.name} - ${s.status}. ${s.clientNote || ''}`).join('\n');
    const guestNotes = [`Comfort level: ${quote.comfortLevel}`, `Tour pace: ${quote.tourPace}`, `Tour difficulty: ${quote.tourDifficulty}`];
    if (quote.specialOccasion) guestNotes.push(`Special occasion: ${quote.specialOccasion}`);
    if (quote.mealPreference !== 'No meal required') guestNotes.push(`Meal preference: ${quote.mealPreference}`);
    if (quote.guestInterests?.length) guestNotes.push(`Guest interests: ${quote.guestInterests.join(', ')}`);
    return `INFRAQUOTE\n${quote.quoteNo}\n\nClient: ${quote.clientCompany}\nDate: ${quote.quoteDate}\nValid until: ${quote.validityDate}\n\n${quote.tourTitle}\n${quote.tourDescription}\n\nService date: ${quote.serviceDate}\nNationality/source market: ${quote.nationality || 'To be confirmed'}\nGuests: ${totalGuests()} (${quote.adults} adults, ${quote.children} children, ${quote.infants} infants)\nPickup: ${quote.pickupLocation} at ${quote.pickupTime}\nDrop-off: ${quote.dropoffLocation}\nDuration: ${quote.tourDuration === 'Custom' ? `${quote.customHours} hours` : quote.tourDuration}\nGuide language: ${quote.guideLanguage}\n${guestNotes.join('\n')}\n\nItinerary:\n${itinerary}\n\nInclusions:\n${quote.inclusions}\n\nExclusions:\n${quote.exclusions}\n\nPrice: ${money(r.price.finalPrice)}\nPrice per guest: ${money(r.price.pricePerGuest)}\n${quote.vatMode === 'exclusive' ? `VAT: ${money(r.price.vatAmount)} added as applicable.` : quote.vatMode === 'inclusive' ? 'VAT is included where applicable.' : 'VAT/tax outside scope or not applied as selected.'}\n${quote.gratuities}\n\n${DATA.defaultTerms.validity}\n${DATA.defaultTerms.revision}\n${DATA.defaultTerms.access}\n${DATA.defaultTerms.cultural}\n${DATA.defaultTerms.overtime}\n${quote.cancellation}`;
  }

  function renderClientQuote(r) {
    const tags = [quote.comfortLevel, quote.tourPace, quote.tourDifficulty, ...(quote.guestInterests || [])].filter(Boolean);
    $('clientQuote').innerHTML = `<div class="quote-paper theme-${String(quote.quoteTheme || 'Standard').toLowerCase()}"><p class="eyebrow dark">${quote.quoteTheme} client-facing quotation</p><h2>${quote.tourTitle}</h2><p>${quote.tourDescription}</p><div class="paper-meta"><span>${quote.quoteNo}</span><span>${quote.clientCompany || 'Client name missing'}</span><span>${quote.nationality || 'Nationality TBC'}</span><span>Valid until ${quote.validityDate || 'missing'}</span></div><div class="paper-tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div><h3>Guest experience notes</h3><ul>${experienceInsights().slice(1).map(note => `<li>${note}</li>`).join('')}</ul><h3>Itinerary</h3><ol>${quote.itinerary.map(s => `<li><strong>${s.name}</strong><br/><span>${s.clientNote || ''}</span></li>`).join('')}</ol><h3>Price</h3><p class="paper-price">${money(r.price.finalPrice)}</p><p>${quote.vatMode === 'exclusive' ? `VAT amount: ${money(r.price.vatAmount)}.` : quote.vatMode === 'inclusive' ? 'VAT included where applicable.' : 'VAT not applied as selected.'}</p><h3>Important notes</h3><p>${DATA.defaultTerms.validity}</p><p>${DATA.defaultTerms.revision}</p><p>${DATA.defaultTerms.access}</p><p>${DATA.defaultTerms.cultural}</p><p>${DATA.defaultTerms.overtime}</p></div>`;
  }

  function smartPrompts() {
    const prompts = [];
    if (quote.pickupPoints > 1) prompts.push('Multiple pickup points may affect timing and vehicle cost.');
    if (quote.luggage) prompts.push('Luggage requirement moved to transport: review vehicle capacity and airport timing.');
    if (quote.airportPickup || quote.airportDropoff || quote.transportMode !== 'Tour only') prompts.push('Airport service selected: verify terminal, flight timing, waiting rules, and parking cost.');
    if (totalGuests() > 12) prompts.push('Large group: review larger vehicle, additional guide, and timing buffer.');
    if (['Family','Senior guests','VIP'].includes(quote.guestProfile)) prompts.push('Comfort-sensitive group: add buffer time and review vehicle comfort.');
    if (quote.children || quote.infants) prompts.push('Child/infant age policy may affect tickets and seats.');
    if (quote.tourPace === 'Relaxed') prompts.push('Relaxed pace selected: leave space for photos, restrooms, and guide storytelling.');
    if (quote.comfortLevel === 'Premium' || quote.comfortLevel === 'VIP') prompts.push('Premium/VIP comfort selected: align vehicle, guide seniority, and service presentation.');
    if (quote.mealPreference !== 'No meal required') prompts.push('Meal preference selected: confirm whether meal cost is included or only coordinated.');
    if (plannedMinutes() > hours() * 60) prompts.push('Itinerary may be overloaded for the selected duration.');
    $('smartPrompts').innerHTML = prompts.map(p => `<p>${p}</p>`).join('');
  }

  function render() {
    fillForm(); renderProgress();
    $$('.quote-step').forEach((s, i) => { s.hidden = i !== step; });
    $('prevStep').disabled = step === 0; $('nextStep').textContent = step === 7 ? 'Review again' : 'Next';
    renderItinerary(); renderCosts(); smartPrompts(); renderSummaryOnly();
  }

  function save() { localStorage.setItem(STORAGE, JSON.stringify(quote)); }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
      if (saved) quote = { ...defaultQuote(), ...saved, terms: { ...DATA.defaultTerms, ...(saved.terms || {}) } };
      else quote = defaultQuote();
    } catch (e) { quote = defaultQuote(); }
  }
  function download(name, content, type = 'text/plain') { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

  function bind() {
    $('quoteForm').addEventListener('input', () => { readForm(); save(); smartPrompts(); renderSummaryOnly(); });
    $('quoteForm').addEventListener('change', () => { readForm(); save(); smartPrompts(); renderSummaryOnly(); });
    $('nextStep').addEventListener('click', () => { readForm(); step = step === 7 ? 0 : step + 1; save(); render(); });
    $('prevStep').addEventListener('click', () => { readForm(); step = Math.max(0, step - 1); save(); render(); });
    $('saveDraft').addEventListener('click', () => { readForm(); save(); alert('Draft saved in this browser.'); });
    $('duplicateQuote').addEventListener('click', () => { readForm(); quote.quoteNo = CALC.quoteReference(city().code); quote.quoteStatus = 'Draft'; save(); render(); });
    $('resetQuote').addEventListener('click', () => { if (confirm('Reset InfraQuote draft?')) { localStorage.removeItem(STORAGE); quote = defaultQuote(); step = 0; render(); } });
    $('addStop').addEventListener('click', () => { const item = city().attractions.find(a => a.id === $('attractionSelect').value); if (item) quote.itinerary.push(stopFromAttraction(item)); save(); render(); });
    $('addCost').addEventListener('click', () => { quote.costs.push(costLine('Custom internal cost', 'Custom', 'Fixed', 1, 0, true, 'Pending verification')); save(); render(); });
    $('addCondition').addEventListener('click', () => { quote.costs.push(costLine('Conditional cost', 'Operations', 'Conditional', 1, 0, true, 'Pending verification', 'Review before sending.', '', 'Pending confirmation')); save(); render(); });
    $('printQuote').addEventListener('click', () => window.print());
    $('copyClientQuote').addEventListener('click', async () => { readForm(); await navigator.clipboard?.writeText(clientText(results())); });
    $('exportWorksheet').addEventListener('click', () => { const r = results(); const csv = [`Cost Item,Category,Type,Qty,Unit (${quote.currency}),Total (${quote.currency}),Included,Verification,Supplier,Internal Notes`, ...r.lines.map(l => [l.name,l.category,l.type,l.quantity,convert(l.unitCost),convert(CALC.costLineTotal(l)),l.include?'Yes':'No',l.verification,l.supplier||'',l.internalNote||''].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n'); download(`${quote.quoteNo}-worksheet.csv`, csv, 'text/csv'); });
    $('exportJson').addEventListener('click', () => { readForm(); download(`${quote.quoteNo}.json`, JSON.stringify({ quote, results: results() }, null, 2), 'application/json'); });
    $('prepareDispatch').addEventListener('click', () => { readForm(); const payload = { serviceDate: quote.serviceDate, tourName: quote.tourTitle, guestCount: totalGuests(), nationality: quote.nationality, guestProfile: quote.guestProfile, comfortLevel: quote.comfortLevel, tourPace: quote.tourPace, tourDifficulty: quote.tourDifficulty, guestInterests: quote.guestInterests, specialOccasion: quote.specialOccasion, mealPreference: quote.mealPreference, pickupLocation: quote.pickupLocation, dropoffLocation: quote.dropoffLocation, pickupTime: quote.pickupTime, itineraryStops: quote.itinerary.map(s => s.name), plannedMinutes: plannedMinutes(), vehicleRecommendation: vehicle().name, guideLanguage: quote.guideLanguage, luggageRequired: quote.luggage, airportPickup: quote.airportPickup || ['Airport pickup', 'Airport pickup and drop-off'].includes(quote.transportMode), airportDropoff: quote.airportDropoff || ['Airport drop-off', 'Airport pickup and drop-off'].includes(quote.transportMode), flightNumber: quote.flightNumber, flightTime: quote.flightTime, terminalNote: quote.terminalNote, waitingPolicy: quote.waitingPolicy, specialRequirements: quote.accessibility, operationalNotes: [...experienceInsights(), ...quote.itinerary.map(s => s.operationalNote).filter(Boolean)], clientConfirmationStatus: quote.quoteStatus }; download(`${quote.quoteNo}-infradispatch-payload.json`, JSON.stringify(payload, null, 2), 'application/json'); });
  }

  function initOptions() {
    if ($('guideLanguageOptions')) $('guideLanguageOptions').innerHTML = DATA.guideRates.map(g => `<option value="${g.language}"></option>`).join('');
    $('vehicleSelect').innerHTML = DATA.vehicles.map(v => `<option value="${v.id}">${v.name} · comfort ${v.comfortGuests} / max ${v.maxGuests}</option>`).join('');
    $('attractionSelect').innerHTML = city().attractions.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  }

  document.addEventListener('DOMContentLoaded', () => { load(); initOptions(); bind(); render(); });
})();
