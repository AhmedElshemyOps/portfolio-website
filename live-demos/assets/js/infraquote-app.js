'use strict';

(function initInfraQuote() {
  const DATA = window.INFRAQUOTE_DATA;
  const CALC = window.INFRAQUOTE_CALC;
  const NL = window.INFRAQUOTE_NL;
  const isNL = () => quote?.city === 'amsterdam';
  if (!DATA || !CALC) return;
  const $ = (id) => document.getElementById(id);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const STORAGE = 'infraquote_draft_v1';
  let step = 0;
  let quote = null;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const feedback = message => { $('quoteFeedback').textContent = message; };
  const stages = [[0,1],[2,3,4,5],[6,7]];
  const stageFor = index => stages.findIndex(group => group.includes(index));
  function focusStep() { const heading = document.querySelector(`.quote-step[data-step="${step}"] h2`); heading.tabIndex = -1; heading.focus({preventScroll:true}); heading.scrollIntoView({block:'start',behavior:'instant'}); }
  function clearFormErrors() { $('quoteFormErrors').hidden = true; $('quoteFormErrors').innerHTML = ''; $$('[aria-invalid="true"]', $('quoteForm')).forEach(el => { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); }); }
  function showFormErrors(issues) {
    const panel = $('quoteFormErrors'); panel.hidden = false;
    panel.innerHTML = `<strong>Complete the required information to continue.</strong><ul>${issues.map((issue,i) => `<li id="quote-error-${i}">${escape(issue.message)}</li>`).join('')}</ul>`;
    issues.forEach((issue,i) => { const field = $(issue.field); if (field) { field.setAttribute('aria-invalid','true'); field.setAttribute('aria-describedby',`quote-error-${i}`); } });
    $(issues[0].field)?.focus(); panel.scrollIntoView({block:'center',behavior:'instant'});
  }
  function goStep(next) {
    readForm();
    if (next > step) {
      for (let index = 0; index < next; index++) {
        const issues = CALC.stepIssues(quote,index);
        if (issues.length) { step = stages[stageFor(index)][0]; save(); render(); showFormErrors(issues); return; }
      }
    }
    clearFormErrors(); step = next; save(); render(); focusStep();
  }
  function syncConditionalFields() {
    $('customHoursField').hidden = quote.tourDuration !== 'Custom'; $('customHours').required = quote.tourDuration === 'Custom';
    $('airportDetails').hidden = !hasAirportService();
  }


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
      tourDuration: '', customHours: '', sellingStyle: 'FIT', comfortLevel: 'Comfort', tourPace: 'Balanced', tourDifficulty: 'Easy', specialOccasion: '', mealPreference: 'No meal required', guestInterests: ['Culture', 'Photography'], accessibility: '', wheelchair: false, childSeat: false, luggage: false, airportPickup: false, airportDropoff: false, transportMode: 'Tour only',
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
    return { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), attractionId: item.id, referenceReviewed:item.reference?.checked || '', ageBands:item.ageBands ? JSON.parse(JSON.stringify(item.ageBands)) : null, timedEntry:item.timedEntry, centreWalk:item.centreWalk, referenceChecked:item.reference?.checked || '', entryTime:'', availabilityConfirmed:false, conditionsReviewed:false, name: item.name, duration: item.defaultDuration, drive: 20, status: 'Included', ticketRequired: item.ticketRequired, ticketVerification: ['Verified', 'Pending verification', 'Not required', 'Client pays directly'].includes(item.verification) ? item.verification : 'Pending verification', adultTicket: item.adult, childTicket: item.child, infantTicket: item.infant, operationalNote: item.note, clientNote: item.ticketRequired ? 'Entrance subject to official availability and ticket policy.' : 'Visit subject to access and current venue arrangements.' };
  }

  function costLine(name, category, type, quantity, unitCost, include = true, verification = 'Pending verification', internalNote = '', clientNote = '', conditionStatus = 'Included') {
    return { id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()), name, category, type, quantity, unitCost, include, verification, internalNote, clientNote, conditionStatus, supplier: 'Sample / to verify' };
  }

  function totalGuests() { return Number(quote.adults || 0) + Number(quote.children || 0) + Number(quote.infants || 0); }
  function guestBreakdown() { return `${quote.adults} adult${quote.adults === 1 ? '' : 's'}, ${quote.children} child${quote.children === 1 ? '' : 'ren'}, ${quote.infants} infant${quote.infants === 1 ? '' : 's'}`; }
  function payingGuests() { return Number(quote.adults || 0) + Number(quote.children || 0); }
  function city() { return DATA.cities[quote.city] || DATA.cities.abuDhabi; }
  function vehicle() { return DATA.vehicles.find(v => v.id === quote.vehicleId) || DATA.vehicles[0]; }
  function guideRate() {
    const requested = String(quote.guideLanguage || '').trim().toLowerCase();
    return DATA.guideRates.find(g => g.language.toLowerCase() === requested) || DATA.guideRates.find(g => g.language === 'English') || DATA.guideRates[0];
  }
  function hours() { return quote.tourDuration === 'Half day' ? 5 : quote.tourDuration === 'Full day' ? 8 : Number(quote.customHours || 0); }
  function currencyInfo() { if(isNL())return {rate:1,note:'Native EUR costing · public references and entered supplier costs; no currency conversion'}; return DATA.currencyRates?.[quote.currency] || DATA.currencyRates?.AED || { rate: 1, note: 'Base costing currency' }; }
  function convert(value) { return Math.round(Number(value || 0) * currencyInfo().rate * 100) / 100; }
  function money(value) { return `${quote.currency} ${convert(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
  function hasAirportService() { return quote.airportPickup || quote.airportDropoff; }
  function plannedMinutes() {
    const stopMinutes = quote.itinerary.filter(stop => stop.status !== 'Excluded').reduce((sum, stop) => sum + Number(stop.duration || 0) + Number(stop.drive || 0), 0);
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

  function dutchLines() {
    const lines=[];
    if(quote.transportPlan!=='walking'){
      lines.push(costLine(`${vehicle().name} with driver`, 'Transport','Fixed',Number(quote.vehicleQty||1),Number(quote.nlVehicleRate||0),true,'Pending verification','Operator-entered EUR rate; confirm capacity, permitted stops and included hours.'));
      const overtime=Math.max(0,hours()-Number(quote.nlVehicleHours||0));
      if(overtime)lines.push(costLine('Vehicle overtime','Transport','Conditional',overtime*Number(quote.vehicleQty||1),Number(quote.nlOvertimeRate||0),true,'Pending verification','Operator-entered EUR hourly rate; verify supplier agreement.','','Estimated risk'));
    }
    if(quote.guideIncluded!==false)lines.push(costLine(`${quote.guideLanguage || 'Guide'} guide service`,'Guide','Fixed',1,Number(quote.nlGuideRate||0),true,'Pending verification','EUR cost for agreed duration/language; not a licence or supplier booking.'));
    if(Number(quote.handlingFee))lines.push(costLine('Coordination / handling fee','Operations','Fixed',1,Number(quote.handlingFee),true,'Internal estimate','Operator-entered EUR handling allowance.'));
    quote.itinerary.forEach(stop=>{
      if(!['Included','To be confirmed'].includes(stop.status)||!stop.ticketRequired||stop.ticketVerification==='Client pays directly')return;
      const result=NL.tickets(stop,quote);
      if(result.error)return;
      result.groups.forEach(b=>lines.push(costLine(`${stop.name} age ${b.min}–${b.max} ticket`,'Tickets','Variable',b.quantity,Number(b.price),true,stop.ticketVerification,'Dated public reference or entered supplier rate; confirm chosen date/product and conditions.','Admission subject to confirmed booking.')));
    });return lines;
  }

  function generatedLines() {
    if(isNL())return dutchLines();
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
      if (!['Included','To be confirmed'].includes(stop.status) || !stop.ticketRequired || stop.ticketVerification === 'Client pays directly') return;
      if (Number(stop.adultTicket) && Number(quote.adults)>0) lines.push(costLine(`${stop.name} adult ticket`, 'Tickets', 'Variable', Number(quote.adults || 0), Number(stop.adultTicket), true, stop.ticketVerification, 'Sample ticket data only; verify official supplier/attraction rate.', 'Entrance included as stated.'));
      if (Number(stop.childTicket) && Number(quote.children)>0) lines.push(costLine(`${stop.name} child ticket`, 'Tickets', 'Variable', Number(quote.children || 0), Number(stop.childTicket), true, stop.ticketVerification, 'Sample ticket data only; verify child age policy.', 'Child entrance included as stated.'));
      if (Number(stop.infantTicket) && Number(quote.infants)>0) lines.push(costLine(`${stop.name} infant ticket`, 'Tickets', 'Variable', Number(quote.infants || 0), Number(stop.infantTicket), true, stop.ticketVerification, 'Sample ticket data only; verify infant age policy.', 'Infant entrance included as stated.'));
    });
    return lines;
  }

  function allLines() { return [...generatedLines().filter(line=>!quote.costs.some(c=>c.replaces===line.name)), ...quote.costs.map(line => ({...line}))]; }

  function results() {
    const lines = allLines();
    lines.forEach(line => {if(line.validFrom && (quote.serviceDate < line.validFrom || quote.serviceDate > line.validTo)) line.verification='Pending verification';});
    lines.forEach(line => {const signature=JSON.stringify([line.name,line.quantity,line.unitCost,quote.serviceDate]);if(quote.costConfirmations?.[line.name]==='unconfirmed')line.verification='Pending verification';if(quote.costConfirmations?.[line.name]===signature && (!line.validFrom || (line.validFrom<=quote.serviceDate && quote.serviceDate<=line.validTo))){line.verification='Verified';if(line.type==='Conditional'&&line.conditionStatus==='Estimated risk')line.conditionStatus='Included';}});
    const totals = CALC.classifyCosts(lines, quote.riskBuffer);
    const price = CALC.pricing({ netCost: totals.netCost, method: quote.pricingMethod, markupPct: quote.markupPct, targetMarginPct: quote.targetMargin, vatMode: quote.vatMode, vatRate: isNL() ? 0.21 : DATA.vatRate, totalGuests: totalGuests(), adults: quote.adults, children: quote.children, rounding: quote.rounding });
    const be = quote.serviceType === 'Shared tour' ? CALC.breakEven({ fixedCost: totals.fixed + totals.conditional + totals.riskBuffer, variableCost: totals.variable, payingGuests: payingGuests(), sellingPerGuest: payingGuests() > 0 ? price.beforeVat / payingGuests() : 0, minimumTarget: quote.minimumGuests }) : null;
    const rec = isNL()&&quote.transportPlan==='walking' ? {vehicle:{name:'No private transport',comfortGuests:0,maxGuests:0},quantity:0,warnings:[]} : CALC.recommendVehicle(totalGuests(), quote.luggage, quote.serviceType, DATA.vehicles, ['Comfort','Premium','VIP'].includes(quote.comfortLevel));
    const riskLevel = (be?.risk === 'Red' || totals.pending > 2 || rec.warnings.length > 1) ? 'High' : (be?.risk === 'Amber' || totals.pending || rec.warnings.length) ? 'Medium' : 'Controlled';
    const marginStatus = CALC.marginStatus(price.actualMargin, quote.reviewMargin, riskLevel, price.profit);
    const ready = CALC.readiness({...quote,itinerary:quote.itinerary.map(stop=>{const tickets=lines.filter(line=>line.category==='Tickets'&&line.name.startsWith(stop.name+' '));return tickets.length&&tickets.every(line=>line.verification==='Verified')?{...stop,ticketVerification:'Verified'}:stop;})}, totals, price, be);
    quote.itinerary.filter(stop => ['Included','To be confirmed'].includes(stop.status)).forEach(stop => { const item = city().attractions.find(a => a.id === stop.attractionId); if (item?.reference?.unavailable) ready.warnings.push(`${stop.name}: official source reports a closure; confirm reopening before inclusion.`); if (item?.reference?.checked && stop.referenceReviewed !== item.reference.checked) ready.warnings.push(`${stop.name}: stored draft predates the current attraction review. Check rates and access.`); if (!isNL() && stop.ticketRequired && quote.adults > 0 && !(stop.adultTicket > 0) && stop.ticketVerification !== 'Client pays directly' && stop.ticketVerification !== 'Verified') ready.blocking.push(`${stop.name}: paid admission has no adult rate. Enter a rate or confirm the ticket arrangement.`); });
    if(isNL()){const checks=NL.checks(quote);ready.blocking.push(...checks.blocking);ready.warnings.push(...checks.warnings);if(quote.transportPlan!=='walking'&&hours()>Number(quote.nlVehicleHours||0)&&!(Number(quote.nlOvertimeRate)>0))ready.blocking.push('Enter a positive EUR overtime rate for hours beyond the supplier allowance.');}
    const capacity = isNL() && quote.transportPlan==='walking' ? {blocking:[],warnings:[]} : CALC.selectedVehicleChecks(totalGuests(), vehicle(), quote.vehicleQty, quote.luggage || ['Comfort','Premium','VIP'].includes(quote.comfortLevel));
    ready.blocking.push(...capacity.blocking); ready.warnings.push(...capacity.warnings);
    ready.score = Math.max(0, ready.score - 25 * capacity.blocking.length - 10 * capacity.warnings.length);
    if (lines.some(line => Number(line.quantity) < 0 || Number(line.unitCost) < 0)) { ready.blocking.push('Cost quantities and unit costs must not be negative.'); ready.score = Math.max(0, ready.score - 25); }
    ready.score = Math.max(0,100 - ready.blocking.length * 25 - ready.warnings.length * 10 - ready.suggestions.length * 3);
    return { lines, totals, price, be, rec, riskLevel, marginStatus, ready };
  }

  function setField(id, value) {
    const el = $(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = Boolean(value);
    else el.value = value ?? '';
  }

  function fillForm() {
    ['clientCompany','contactPerson','clientEmail','clientPhone','enquiryRef','quoteNo','quoteDate','serviceDate','validityDate','preparedBy','marketSource','nationality','currency','serviceType','quoteStatus','adults','children','infants','guestProfile','guideLanguage','pickupLocation','dropoffLocation','pickupPoints','pickupTime','tourDuration','customHours','sellingStyle','comfortLevel','tourPace','tourDifficulty','specialOccasion','mealPreference','accessibility','flightNumber','terminalNote','flightTime','waitingPolicy','vehicleQty','vehicleOverride','guideType','handlingFee','riskBuffer','vatMode','gratuities','pricingMethod','markupPct','targetMargin','reviewMargin','minimumGuests','rounding','quoteTheme','tourTitle','tourDescription','inclusions','exclusions','cancellation'].forEach(id => setField(id, quote[id]));
    setField('vehicleSelect', quote.vehicleId);
    ['wheelchair','childSeat','luggage'].forEach(id => setField(id, quote[id]));
    ['airportPickup','airportDropoff'].forEach(id => setField(id, String(Boolean(quote[id]))));
    if($('quoteCity'))$('quoteCity').value=quote.city;
    $('currency').disabled=isNL();
    $('nlRequirements').hidden=!isNL();
    ['guestAges','transportPlan','nlVehicleRate','nlGuideRate','nlVehicleHours','nlOvertimeRate'].forEach(id=>setField(id,quote[id]));
    ['taxReviewed','walkExemption','coachAccess'].forEach(id=>setField(id,quote[id]));
    setField('guideIncluded',String(quote.guideIncluded!==false));
    $('nlTaxOption').hidden=!isNL();$('nlPendingTaxOption').hidden=!isNL();
    $('sampleNotice').textContent=city().sampleNotice;
    $('summaryBasis').textContent=isNL()?'Amsterdam · native EUR costs · supplier confirmation required':'Abu Dhabi · AED sample base costs';
    syncConditionalFields();
    $$('[data-interest]').forEach(el => { el.checked = (quote.guestInterests || []).includes(el.dataset.interest); });
    $('totalGuests').value = totalGuests();
    if ($('currencyHint')) $('currencyHint').textContent = currencyInfo().note;
  }

  function readForm() {
    ['clientCompany','contactPerson','clientEmail','clientPhone','enquiryRef','quoteNo','quoteDate','serviceDate','validityDate','preparedBy','marketSource','nationality','currency','serviceType','quoteStatus','guestProfile','guideLanguage','pickupLocation','dropoffLocation','pickupTime','tourDuration','sellingStyle','comfortLevel','tourPace','tourDifficulty','specialOccasion','mealPreference','accessibility','flightNumber','terminalNote','flightTime','waitingPolicy','vehicleOverride','guideType','vatMode','gratuities','pricingMethod','quoteTheme','tourTitle','tourDescription','inclusions','exclusions','cancellation'].forEach(id => { quote[id] = $(id).value; });
    if(isNL()){['guestAges','transportPlan','nlVehicleRate','nlGuideRate','nlVehicleHours','nlOvertimeRate'].forEach(id=>quote[id]=$(id).value);['taxReviewed','walkExemption','coachAccess'].forEach(id=>quote[id]=$(id).checked);quote.guideIncluded=$('guideIncluded').value==='true';}
    quote.vehicleId = $('vehicleSelect').value;
    ['adults','children','infants','pickupPoints','customHours','vehicleQty','handlingFee','riskBuffer','markupPct','targetMargin','reviewMargin','minimumGuests','rounding'].forEach(id => { quote[id] = Number($(id).value || 0); });
    ['wheelchair','childSeat','luggage'].forEach(id => { quote[id] = $(id).checked; });
    ['airportPickup','airportDropoff'].forEach(id => { quote[id] = $(id).value === 'true'; });
    quote.transportMode = quote.airportPickup && quote.airportDropoff ? 'Airport pickup and drop-off' : quote.airportPickup ? 'Airport pickup' : quote.airportDropoff ? 'Airport drop-off' : 'Tour only';
    if(isNL())quote.itinerary.forEach(s=>{if(s.availabilityDate!==quote.serviceDate)s.availabilityConfirmed=false;if(s.conditionsReviewedDate!==quote.serviceDate)s.conditionsReviewed=false;});
    syncConditionalFields();
    quote.guestInterests = $$('[data-interest]:checked').map(el => el.dataset.interest);
    quote.terms.cancellation = quote.cancellation;
    $('totalGuests').value = totalGuests();
  }

  function renderProgress() {
    const labels = ['Request','Build & price','Review & share']; const current = stageFor(step);
    $('quoteProgress').innerHTML = labels.map((label, i) => `<button type="button" class="${i === current ? 'active' : i < current ? 'done' : ''}" aria-current="${i === current ? 'step' : 'false'}" aria-controls="quoteForm" data-go-step="${stages[i][0]}"><span>${i + 1}</span>${label}</button>`).join('');
    $('quoteStepSelect').innerHTML = labels.map((label,i) => `<option value="${stages[i][0]}" ${i === current ? 'selected' : ''}>${i+1}. ${label}</option>`).join('');
    $$('[data-go-step]').forEach(btn => btn.addEventListener('click', () => goStep(Number(btn.dataset.goStep))));
  }

  function attractionReference(stop) {
    const ref = city().attractions.find(item => item.id === stop.attractionId)?.reference;
    if (!ref) return '';
    const stale = ref.checked && stop.referenceReviewed !== ref.checked;
    const dateStale = ref.checked && Date.now() - new Date(ref.checked+'T00:00:00Z').getTime() > 30 * 86400000;
    const link = (url,label) => url && /^https:\/\//.test(url) ? `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>` : '';
    return `<details class="attraction-reference" ${ref.unavailable ? 'open' : ''}><summary>Admission, timing &amp; booking reference${stale ? ' · draft needs review' : ''}</summary><p class="reference-status">${escape(ref.basis)} · ${ref.checked ? 'Source reviewed '+escape(ref.checked) : 'Supplier confirmation pending'}</p>${stale ? '<p class="reference-warning">This saved stop predates the latest reference. Your entered prices are preserved; use Apply latest reference rates if appropriate.</p>' : ''}${dateStale ? '<p class="reference-warning">Reference is over 30 days old. Recheck the official source before quoting.</p>' : ''}<dl><div><dt>Admission / recommended costing basis</dt><dd>${escape(ref.price)}</dd></div><div><dt>Operating information</dt><dd>${escape(ref.hours)}</dd></div><div><dt>Booking conditions</dt><dd>${escape(ref.terms)}</dd></div></dl><p class="reference-links">${link(ref.source,'Official admission / venue source')} ${link(ref.hoursSource,'Official visit information')} ${link(ref.termsSource,'Official ticket terms')}</p><p class="field-help">Use the public admission rate as a planning allowance only. Replace it with your contracted supplier rate when confirmed; review tax treatment and age/height categories.</p></details>`;
  }

  function dutchStopFields(stop){return `<div class="mini-grid"><label><input type="checkbox" data-nl-stop="${escape(stop.id)}" data-key="sourceRechecked" ${stop.sourceRechecked?'checked':''}/> Public ticket product, ages and rates rechecked against official source${stop.operatorChecked?' · '+escape(stop.operatorChecked):''}</label>${(stop.ageBands||[]).map((b,i)=>`<label>Age ${b.min}–${b.max} · EUR per guest<input type="number" min="0" step="0.01" data-nl-stop="${escape(stop.id)}" data-band="${i}" value="${escape(b.price)}"/></label>`).join('')}${stop.ticketRequired?`${stop.timedEntry?`<label>Reserved entry time<input type="time" data-nl-stop="${escape(stop.id)}" data-key="entryTime" value="${escape(stop.entryTime)}"/></label>`:''}<label><input type="checkbox" data-nl-stop="${escape(stop.id)}" data-key="availabilityConfirmed" ${stop.availabilityConfirmed&&stop.availabilityDate===quote.serviceDate?'checked':''}/> Supplier / entry availability confirmed for service date</label>`:''}<label><input type="checkbox" data-nl-stop="${escape(stop.id)}" data-key="conditionsReviewed" ${stop.conditionsReviewed&&stop.conditionsReviewedDate===quote.serviceDate?'checked':''}/> Booking, group and cancellation conditions reviewed for service date</label></div>`;}
  function renderAttractionPreview() { $('attractionPreview').innerHTML = attractionReference({attractionId:$('attractionSelect').value,referenceReviewed:city().attractions.find(a => a.id === $('attractionSelect').value)?.reference?.checked}); }
  function renderItinerary() {
    renderAttractionPreview();
    $('itineraryList').innerHTML = quote.itinerary.map((stop, index) => `<article class="quote-item"><div class="item-head"><strong>${index + 1}. ${escape(stop.name)}</strong><button type="button" data-remove-stop="${escape(stop.id)}">Remove</button></div>${attractionReference(stop)}${isNL() ? dutchStopFields(stop) : ''}<div class="mini-grid"><label>Duration min<input data-stop="${escape(stop.id)}" data-key="duration" type="number" value="${escape(stop.duration)}"/></label><label>Travel / walk min<input data-stop="${escape(stop.id)}" data-key="drive" type="number" value="${escape(stop.drive)}"/></label><label>Status<select data-stop="${escape(stop.id)}" data-key="status"><option ${stop.status==='Included'?'selected':''}>Included</option><option ${stop.status==='Optional'?'selected':''}>Optional</option><option ${stop.status==='Excluded'?'selected':''}>Excluded</option><option ${stop.status==='To be confirmed'?'selected':''}>To be confirmed</option></select></label><label>Ticket status<select data-stop="${escape(stop.id)}" data-key="ticketVerification"><option ${stop.ticketVerification==='Verified'?'selected':''}>Verified</option><option ${stop.ticketVerification==='Pending verification'?'selected':''}>Pending verification</option><option ${stop.ticketVerification==='Not required'?'selected':''}>Not required</option><option ${stop.ticketVerification==='Client pays directly'?'selected':''}>Client pays directly</option></select></label><label>${isNL()&&stop.ageBands?.length?'Fallback adult · age bands above apply':'Adult ticket'}<input data-stop="${escape(stop.id)}" data-key="adultTicket" type="number" step="0.01" value="${escape(stop.adultTicket)}"/></label><label>${isNL()&&stop.ageBands?.length?'Fallback child · age bands above apply':'Child ticket'}<input data-stop="${escape(stop.id)}" data-key="childTicket" type="number" step="0.01" value="${escape(stop.childTicket)}"/></label></div>${isNL() && !stop.ageBands?.length ? `<label>Infant ticket<input data-stop="${escape(stop.id)}" data-key="infantTicket" type="number" step="0.01" value="${escape(stop.infantTicket)}"/></label>` : ''}<label>Operational note<textarea data-stop="${escape(stop.id)}" data-key="operationalNote">${escape(stop.operationalNote || '')}</textarea></label><label>Client-facing note<textarea data-stop="${escape(stop.id)}" data-key="clientNote">${escape(stop.clientNote || '')}</textarea></label></article>`).join('');
    $$('[data-stop]').forEach(el => el.addEventListener('input', () => { const stop = quote.itinerary.find(s => s.id === el.dataset.stop); if (stop) stop[el.dataset.key] = el.type === 'number' ? (isNL()&&el.value==='' ? null : Number(el.value || 0)) : el.value; save(); renderSummaryOnly(); }));
    $$('[data-nl-stop]').forEach(el=>el.addEventListener('input',()=>{const stop=quote.itinerary.find(s=>s.id===el.dataset.nlStop);if(!stop)return;if(el.dataset.band!==undefined)stop.ageBands[Number(el.dataset.band)].price=el.value===''?null:Number(el.value);else{stop[el.dataset.key]=el.type==='checkbox'?el.checked:el.value;if(el.dataset.key==='conditionsReviewed')stop.conditionsReviewedDate=quote.serviceDate;if(el.dataset.key==='availabilityConfirmed')stop.availabilityDate=quote.serviceDate;if(el.dataset.key==='sourceRechecked')stop.operatorChecked=el.checked?today():'';}save();renderSummaryOnly();}));
    $$('[data-remove-stop]').forEach(btn => btn.addEventListener('click', () => { quote.itinerary = quote.itinerary.filter(s => s.id !== btn.dataset.removeStop); save(); render(); }));
  }

  function renderCosts() {
    $('costList').innerHTML = quote.costs.map(line => `<article class="quote-item"><div class="item-head"><strong>${escape(line.name)}</strong><button type="button" data-remove-cost="${escape(line.id)}">Remove</button></div><div class="mini-grid"><label>Name<input data-cost="${escape(line.id)}" data-key="name" value="${escape(line.name)}"/></label><label>Category<input data-cost="${escape(line.id)}" data-key="category" value="${escape(line.category)}"/></label><label>Type<select data-cost="${escape(line.id)}" data-key="type"><option ${line.type==='Fixed'?'selected':''}>Fixed</option><option ${line.type==='Variable'?'selected':''}>Variable</option><option ${line.type==='Conditional'?'selected':''}>Conditional</option></select></label><label>Condition<select data-cost="${escape(line.id)}" data-key="conditionStatus"><option ${line.conditionStatus==='Not applicable'?'selected':''}>Not applicable</option><option ${line.conditionStatus==='Included'?'selected':''}>Included</option><option ${line.conditionStatus==='Excluded'?'selected':''}>Excluded</option><option ${line.conditionStatus==='Pending confirmation'?'selected':''}>Pending confirmation</option><option ${line.conditionStatus==='Estimated risk'?'selected':''}>Estimated risk</option></select></label><label>Qty<input data-cost="${escape(line.id)}" data-key="quantity" type="number" value="${escape(line.quantity)}"/></label><label>Unit cost<input data-cost="${escape(line.id)}" data-key="unitCost" type="number" value="${escape(line.unitCost)}"/></label><label>Verification<select data-cost="${escape(line.id)}" data-key="verification"><option ${line.verification==='Verified'?'selected':''}>Verified</option><option ${line.verification==='Pending verification'?'selected':''}>Pending verification</option><option ${line.verification==='Internal estimate'?'selected':''}>Internal estimate</option></select></label><label>Included<select data-cost="${escape(line.id)}" data-key="include"><option value="true" ${line.include?'selected':''}>Yes</option><option value="false" ${!line.include?'selected':''}>No</option></select></label></div><label>Internal note<textarea data-cost="${escape(line.id)}" data-key="internalNote">${escape(line.internalNote || '')}</textarea></label><label>Client note<textarea data-cost="${escape(line.id)}" data-key="clientNote">${escape(line.clientNote || '')}</textarea></label></article>`).join('');
    $$('[data-cost]').forEach(el => el.addEventListener('input', () => { const line = quote.costs.find(c => c.id === el.dataset.cost); if (!line) return; line[el.dataset.key] = el.dataset.key === 'include' ? el.value === 'true' : el.type === 'number' ? Number(el.value || 0) : el.value; save(); renderSummaryOnly(); }));
    $$('[data-remove-cost]').forEach(btn => btn.addEventListener('click', () => { quote.costs = quote.costs.filter(c => c.id !== btn.dataset.removeCost); save(); render(); }));
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
      ['Checks to resolve', `${r.ready.blocking.length + r.totals.pending}`]
    ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');
    $('riskPanel').innerHTML = `<strong>${r.ready.blocking.length ? 'Incomplete draft' : r.marginStatus}</strong><p>${r.ready.blocking.length} blocking issue(s). Risk level: ${r.riskLevel}. Pending verification items: ${r.totals.pending}. ${r.rec.warnings.join(' ')} ${currencyInfo().note}.</p>`;
    window.dispatchEvent(new CustomEvent('infraquote:calculated', {detail:{quote:JSON.parse(JSON.stringify(quote)),total:r.price.finalPrice,minutes:plannedMinutes(),blocking:r.ready.blocking.length,pending:r.totals.pending}}));
    renderWorksheet(r); renderClientQuote(r); renderValidation(r); renderBreakEven(r); renderVehicle(r); renderItineraryAdvisor(); renderPricingAdvisor(r);
  }

  function renderVehicle(r) {
    const airport = hasAirportService() ? `<li>Airport service: ${escape(quote.transportMode)}. Flight ${escape(quote.flightNumber || 'TBC')}, ${escape(quote.flightTime || 'time TBC')}, ${escape(quote.terminalNote || 'terminal/meeting point TBC')}.</li>` : '';
    if(isNL()&&quote.transportPlan==='walking'){$('vehiclePanel').innerHTML='<strong>Walking / independently arranged transport</strong><p>No private vehicle cost is added. Confirm walking accessibility and any public transport or cruise costs separately.</p>';return;}
    $('vehiclePanel').innerHTML = `<strong>Recommended vehicle: ${r.rec.vehicle.name} x ${r.rec.quantity}</strong><p>Comfort capacity ${r.rec.vehicle.comfortGuests}, max ${r.rec.vehicle.maxGuests}. ${r.rec.warnings.join(' ') || 'Vehicle recommendation is within configured comfort logic.'}</p><ul class="advisor-list"><li>Comfort level: ${escape(quote.comfortLevel)}. Luggage: ${quote.luggage ? 'Yes, review capacity' : 'No luggage flag'}.</li>${airport}<li>Guide language: ${escape(quote.guideLanguage || 'TBC')} using editable guide-language input.</li></ul>`;
  }

  function renderItineraryAdvisor() {
    if (!$('itineraryAdvisor')) return;
    const minutes = plannedMinutes();
    const capacity = hours() * 60;
    const status = minutes > capacity ? 'Overloaded' : minutes > capacity * 0.9 ? 'Tight' : 'Balanced';
    $('itineraryAdvisor').innerHTML = `<div class="advisor-head"><strong>Experience advisor: ${status}</strong><span>${minutes} / ${capacity} min</span></div><ul class="advisor-list">${experienceInsights().map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
  }

  function renderPricingAdvisor(r) {
    if (!$('pricingAdvisor')) return;
    const suggestions = [];
    if (r.price.actualMargin < Number(quote.reviewMargin || 0)) suggestions.push('Margin is below review threshold; increase selling price, reduce net cost, or require approval.');
    if (!isNL() && quote.currency !== 'AED') suggestions.push(`${escape(quote.currency)} is display-only demo conversion; confirm live exchange rate before sending.`);
    if (quote.comfortLevel === 'Premium' || quote.comfortLevel === 'VIP') suggestions.push('Premium/VIP comfort selected; make sure the selling price reflects extra service effort.');
    if (quote.mealPreference !== 'No meal required') suggestions.push('Meal preference can create hidden timing and supplier costs; verify whether it is included or only coordinated.');
    if (hasAirportService()) suggestions.push('Airport service selected; review parking, waiting, flight delay, and luggage risk.');
    $('pricingAdvisor').innerHTML = `<div class="advisor-head"><strong>Pricing advisor</strong><span>${r.marginStatus}</span></div><ul class="advisor-list">${(suggestions.length ? suggestions : ['Pricing looks controlled for the current demo assumptions.']).map(item => `<li>${escape(item)}</li>`).join('')}</ul>`;
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
    const group = (title, items, cls, closed = false) => `<details class="review-check ${cls}" ${closed && items.length ? '' : 'open'}><summary><span>${title}</span><span class="review-count">${items.length}</span></summary>${items.length ? `<ul>${items.map(i => `<li>${escape(i)}</li>`).join('')}</ul>` : '<p class="review-clear">No issues found in these configured checks.</p>'}</details>`;
    $('validationPanel').innerHTML = `<div class="worksheet-readiness"><strong>${r.ready.blocking.length ? 'Incomplete draft' : escape(r.marginStatus)}</strong><span>${r.ready.blocking.length} blocking issues</span><span>${r.totals.pending} items awaiting verification</span><span>Experience ${plannedMinutes()} min</span></div><div class="review-checks">${group('Blocking issues', r.ready.blocking, 'block')}${group('Warnings', [...r.ready.warnings, ...extraWarnings], 'warn')}${group('Guest-experience checks', [...r.ready.suggestions, ...guestCare], 'suggest', true)}</div>`;
  }

  function countedCost(line) {
    return line.include !== false && (line.type !== 'Conditional' || ['Included','Estimated risk'].includes(line.conditionStatus || 'Included'));
  }
  function costDetails(line, expanded = false) {
    return `<details class="cost-detail" ${expanded ? 'open' : ''}><summary>${expanded ? 'Supplier and cost notes' : 'Details'}</summary><dl><div><dt>Cost treatment</dt><dd>${countedCost(line) ? 'Included in net cost' : 'Not included in net cost'}</dd></div><div><dt>Supplier</dt><dd>${escape(line.supplier || 'To confirm')}</dd></div><div><dt>Internal note</dt><dd>${escape(line.internalNote || 'No additional note')}</dd></div>${line.clientNote ? `<div><dt>Client note</dt><dd>${escape(line.clientNote)}</dd></div>` : ''}</dl></details>`;
  }
  function verificationBadge(line) {
    const verified = line.verification === 'Verified';
    const label = verified ? 'Verified' : line.verification === 'Internal estimate' ? 'Internal estimate' : 'Needs verification';
    return `<span class="cost-status ${verified ? 'is-verified' : 'is-pending'}">${label}</span>`;
  }
  function costRows(lines, groupIndex) {
    return lines.map((l, index) => `<tr class="${countedCost(l) ? '' : 'cost-not-included'}"><th scope="row"><strong>${escape(l.name)}</strong><small>${escape(l.type)}${l.type === 'Conditional' ? ' · '+escape(l.conditionStatus || 'Included') : ''}</small></th><td class="cost-number">${escape(l.quantity)}</td><td class="cost-number">${money(l.unitCost)}</td><td class="cost-number"><strong>${money(countedCost(l) ? CALC.costLineTotal(l) : 0)}</strong>${countedCost(l) ? '' : '<small>Not priced</small>'}</td><td>${verificationBadge(l)}</td><td><button type="button" class="cost-note-toggle" aria-expanded="false" aria-controls="cost-notes-${groupIndex}-${index}">Details</button></td></tr><tr id="cost-notes-${groupIndex}-${index}" class="cost-notes-row" hidden><td colspan="6">${costDetails(l, true)}</td></tr>`).join('');
  }
  function mobileCostCards(lines) {
    return lines.map(l => `<article class="cost-mobile-card"><header><h5>${escape(l.name)}</h5>${verificationBadge(l)}</header><p class="cost-type">${escape(l.type)}${l.type === 'Conditional' ? ' · '+escape(l.conditionStatus || 'Included') : ''}</p><dl class="cost-mobile-values"><div><dt>Quantity</dt><dd>${escape(l.quantity)}</dd></div><div><dt>Unit cost</dt><dd>${money(l.unitCost)}</dd></div><div><dt>Total</dt><dd>${money(countedCost(l) ? CALC.costLineTotal(l) : 0)}</dd></div></dl>${countedCost(l) ? '' : '<p>Not included in net cost.</p>'}${costDetails(l)}</article>`).join('');
  }
  function renderWorksheet(r) {
    const identity = [['Quote reference',quote.quoteNo],['Client',quote.clientCompany || 'Missing'],['Nationality / market',quote.nationality || 'To confirm'],['Guests',`${totalGuests()} (${guestBreakdown()})`],['Vehicle',`${vehicle().name} × ${quote.vehicleQty}`],['Service date',quote.serviceDate || 'Missing']];
    const totals = [['Net cost',r.totals.netCost],['Selling before VAT',r.price.beforeVat],['VAT',r.price.vatAmount],['Final price',r.price.finalPrice]];
    const groups = new Map();
    for (const line of r.lines) { const category = line.category || 'Other'; if (!groups.has(category)) groups.set(category,[]); groups.get(category).push(line); }
    const sections = Array.from(groups,([category,lines],index) => {
      const subtotal = lines.reduce((sum,line) => sum + (countedCost(line) ? CALC.costLineTotal(line) : 0),0);
      return `<section class="cost-category" aria-labelledby="cost-category-${index}"><header class="cost-category-header"><h4 id="cost-category-${index}">${escape(category)}</h4><p>${lines.length} item${lines.length === 1 ? '' : 's'} <strong>${money(subtotal)}</strong></p></header><div class="cost-table-wrap" tabindex="0" role="region" aria-label="${escape(category)} costs"><table class="cost-review-table"><caption>${escape(category)} cost breakdown</caption><thead><tr><th scope="col">Cost item</th><th scope="col">Qty</th><th scope="col">Unit cost</th><th scope="col">Total</th><th scope="col">Verification</th><th scope="col">Notes</th></tr></thead><tbody>${costRows(lines,index)}</tbody></table></div><div class="cost-mobile-list">${mobileCostCards(lines)}</div></section>`;
    }).join('');
    $('internalWorksheet').innerHTML = `<header class="worksheet-heading"><div><span class="eyebrow">Internal review · Not client output</span><h3>Quotation overview</h3></div><button class="btn secondary" id="exportWorksheetStep7" type="button">Download costs CSV</button></header><dl class="worksheet-identity">${identity.map(([label,value]) => `<div><dt>${label}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl><div class="worksheet-totals">${totals.map(([label,value],i) => `<div class="${i === 3 ? 'is-final' : ''}"><span>${label}</span><strong>${money(value)}</strong></div>`).join('')}</div><div class="worksheet-profit"><span>Profit before VAT <strong>${money(r.price.profit)}</strong></span><span>Margin <strong>${r.price.actualMargin}%</strong></span></div><header class="cost-breakdown-heading"><h3>Cost breakdown</h3><p>Grouped by category. Open Details for supplier and cost-treatment notes.</p></header>${sections}<div class="worksheet-reconciliation"><span>Cost items <strong>${money(r.totals.netCost - r.totals.riskBuffer)}</strong></span><span>Risk buffer <strong>${money(r.totals.riskBuffer)}</strong></span><span>Net cost <strong>${money(r.totals.netCost)}</strong></span></div><details class="worksheet-basis"><summary>Pricing basis and sample-data limits</summary><p>${escape(currencyInfo().note)}. ${isNL() ? 'Amsterdam costs are entered in EUR; unknown costs are incomplete.' : 'Base sample costs are maintained in AED.'} Category totals include priced items only; the risk buffer is added separately. Supplier verification and configured vehicle capacities need operational confirmation.</p></details>`;
    $('exportWorksheetStep7').addEventListener('click',exportWorksheet);
    $('internalWorksheet').querySelectorAll('.cost-note-toggle').forEach(button => button.addEventListener('click', () => { const row = $(button.getAttribute('aria-controls')); row.hidden = !row.hidden; button.setAttribute('aria-expanded', String(!row.hidden)); button.textContent = row.hidden ? 'Details' : 'Close'; }));
  }

  function clientDocument(r) {
    const date = value => value ? new Date(value+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : 'To confirm';
    const guestNotes = [];
    if (quote.mealPreference !== 'No meal required') guestNotes.push(`Meal arrangement: ${quote.mealPreference}. Venue and availability to be confirmed.`);
    if (quote.specialOccasion) guestNotes.push(`Special occasion: ${quote.specialOccasion}. Personal touches can be arranged on request.`);
    if (quote.accessibility) guestNotes.push(`Accessibility requests: ${quote.accessibility}`);
    if (hasAirportService()) guestNotes.push(`Transfer arrangement: ${quote.transportMode}. Flight and meeting details to be confirmed separately.`);
    return { reference:quote.quoteNo, title:quote.tourTitle, company:quote.companyName || '', description:quote.tourDescription, theme:quote.quoteTheme,
      client:quote.clientCompany || 'Client to confirm', preparedBy:quote.preparedBy || 'Ahmed Mahmoud', quoteDate:date(quote.quoteDate), validity:date(quote.validityDate),
      details:[['Service date',date(quote.serviceDate)],['Guests',`${totalGuests()} (${guestBreakdown()})`],['Duration',quote.tourDuration === 'Custom' ? `${quote.customHours} hours` : quote.tourDuration || 'To confirm'],['Guide',isNL()&&quote.guideIncluded===false?'Self-guided':quote.guideLanguage || 'To confirm'],['Pickup',`${quote.pickupLocation || 'To confirm'}${quote.pickupTime ? ' at '+quote.pickupTime : ''}`],['Drop-off',quote.dropoffLocation || 'To confirm']],
      total:money(r.price.finalPrice), beforeVat:money(r.price.beforeVat), vat:money(r.price.vatAmount), hideVat: isNL() && ['margin','pending'].includes(quote.vatMode), vatLabel:quote.vatMode==='margin'?'bijzondere regeling reisbureaus':quote.vatMode==='pending'?'Dutch tax treatment pending review':quote.vatMode === 'none' ? 'VAT not applied as selected' : 'VAT included in total',
      itinerary:quote.itinerary.filter(stop => stop.status !== 'Excluded').map(stop => ({name:stop.name,status:stop.status,note:(isNL()&&stop.entryTime?'Planned entry '+stop.entryTime+' · '+(stop.availabilityConfirmed&&stop.availabilityDate===quote.serviceDate?'operator-confirmed':'subject to availability')+'. ':'')+(stop.clientNote || '')})), guestNotes,
      inclusions:quote.inclusions, exclusions:quote.exclusions, cancellation:quote.cancellation,
      notes:[...(isNL()?quote.itinerary.filter(s=>s.status!=='Excluded'&&s.ticketRequired).map(s=>s.name+': '+(city().attractions.find(a=>a.id===s.attractionId)?.reference?.terms||s.operationalNote||'Conditions pending review')):[]),DATA.defaultTerms.validity, DATA.defaultTerms.revision, DATA.defaultTerms.access, DATA.defaultTerms.cultural, DATA.defaultTerms.overtime,quote.gratuities],
      draft:'Draft for review. Prices and services are subject to supplier confirmation.',
      contact:quote.companyContact || 'InfraQuote by Ahmed Mahmoud | ahmedqualityops.com',
      unresolved:r.ready.blocking.length > 0 ? 'Incomplete draft - operational checks remain unresolved.' : '' };
  }
  function clientText(r) {
    const d = clientDocument(r);
    return ['INFRAQUOTE - CLIENT QUOTATION',d.draft,d.unresolved,d.reference,d.title,d.description,`Client: ${d.client}`,`Valid until: ${d.validity}`,`Total: ${d.total} (${d.vatLabel})`,...d.details.map(([label,value]) => `${label}: ${value}`),'ITINERARY',...d.itinerary.map((stop,i) => `${i+1}. ${stop.name} (${stop.status}) - ${stop.note}`),'GUEST ARRANGEMENTS',...d.guestNotes,'INCLUSIONS',d.inclusions,'EXCLUSIONS',d.exclusions,'CANCELLATION AND AMENDMENTS',d.cancellation,'BOOKING NOTES',...d.notes,d.contact].filter(Boolean).join('\n');
  }
  function renderClientQuote(r) {
    const d = clientDocument(r);
    const section = (title,content) => `<section class="client-section"><h3>${title}</h3>${content}</section>`;
    $('clientQuote').innerHTML = `<article class="quote-paper client-document"><header class="client-doc-header"><strong>${escape(d.company || 'InfraQuote')}</strong><span>Tour quotation · ${escape(d.reference)}</span></header><p class="client-doc-kicker">${escape(d.theme)} experience</p><h2>${escape(d.title)}</h2><p class="client-doc-description">${escape(d.description)}</p><div class="client-doc-meta"><span>Prepared for <strong>${escape(d.client)}</strong></span><span>Issued ${escape(d.quoteDate)}</span><span>Valid until ${escape(d.validity)}</span></div><div class="client-price-panel"><div><span>Total quotation</span><strong>${escape(d.total)}</strong></div><p>${d.hideVat ? '' : `Before VAT: ${escape(d.beforeVat)}<br>VAT: ${escape(d.vat)}<br>`}${escape(d.vatLabel)}</p></div><p class="client-draft-note">${escape(d.draft)}${d.unresolved ? ' '+escape(d.unresolved) : ''}</p><dl class="client-service-grid">${d.details.map(([label,value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>${section('Your itinerary',`<ol class="client-itinerary">${d.itinerary.map(stop => `<li><strong>${escape(stop.name)}</strong><span>${escape(stop.status)}</span><p>${escape(stop.note)}</p></li>`).join('')}</ol>`)}${d.guestNotes.length ? section('Guest arrangements',`<ul>${d.guestNotes.map(note => `<li>${escape(note)}</li>`).join('')}</ul>`) : ''}<div class="client-scope-grid">${section('Included',`<p>${escape(d.inclusions)}</p>`)}${section('Not included',`<p>${escape(d.exclusions)}</p>`)}</div>${section('Cancellation and amendments',`<p>${escape(d.cancellation)}</p>`)}${section('Booking notes',`<ul>${d.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ul>`)}<footer class="client-doc-footer"><span>Prepared by ${escape(d.preparedBy)}</span><span>${escape(d.contact)}</span></footer></article>`;
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
    initOptions(); fillForm(); renderProgress();
    $$('.quote-step').forEach((s, i) => { s.hidden = !stages[stageFor(step)].includes(i); });
    document.querySelector('.quote-summary').hidden = step === 6;
    $('prevStep').disabled = step === 0; $('nextStep').textContent = stageFor(step) === 2 ? 'Back to request' : 'Continue';
    renderItinerary(); renderCosts(); smartPrompts(); renderSummaryOnly();
  }

  function save() { try { localStorage.setItem(STORAGE, JSON.stringify(quote));localStorage.setItem('infraquote_country_'+quote.city,JSON.stringify(quote)); return true; } catch (_) { feedback('Browser storage is unavailable. Export JSON to keep this draft.'); return false; } }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || 'null');
      if (saved) quote = { ...defaultQuote(), ...saved, terms: { ...DATA.defaultTerms, ...(saved.terms || {}) } };
      else quote = defaultQuote();
      quote.airportPickup = Boolean(quote.airportPickup || ['Airport pickup','Airport pickup and drop-off'].includes(quote.transportMode));
      quote.airportDropoff = Boolean(quote.airportDropoff || ['Airport drop-off','Airport pickup and drop-off'].includes(quote.transportMode));
    } catch (e) { quote = defaultQuote(); }
  }
  function download(name, content, type = 'text/plain') { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

  function exportWorksheet() { const r = results(); const csv = [`Cost Item,Category,Type,Qty,Unit (${quote.currency}),Total (${quote.currency}),Included,Verification,Supplier,Internal Notes`, ...r.lines.map(l => [l.name,l.category,l.type,l.quantity,convert(l.unitCost),convert(CALC.costLineTotal(l)),l.include?'Yes':'No',l.verification,l.supplier||'',l.internalNote||''].map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n'); download(`${quote.quoteNo}-worksheet.csv`, csv, 'text/csv'); }

  function applyCity(target,template=0,fresh=false){
    readForm();save();$('attractionSearch').value='';$('attractionCategory').value='';
    try{localStorage.setItem('infraquote_country_'+quote.city,JSON.stringify(quote));}catch(_){}
    let stored=null;if(!fresh){try{stored=JSON.parse(localStorage.getItem('infraquote_country_'+target)||'null');}catch(_){}}
    if(stored){quote={...defaultQuote(),...stored};}
    else if(target==='amsterdam'){
      $('attractionSearch').value='';$('attractionCategory').value='';
      const setup=NL.setup(template);const ids=setup.itineraryIds;delete setup.itineraryIds;
      quote={...defaultQuote(),...setup,quoteNo:CALC.quoteReference('AMS'),clientCompany:quote.clientCompany,contactPerson:quote.contactPerson,clientEmail:quote.clientEmail,serviceDate:quote.serviceDate,validityDate:quote.validityDate};
      quote.itinerary=ids.map(id=>stopFromAttraction(city().attractions.find(a=>a.id===id)));
    }else{try{quote=JSON.parse(localStorage.getItem('infraquote_country_abuDhabi')||'null')||defaultQuote();}catch(_){quote=defaultQuote();}}
    step=0;save();render();window.dispatchEvent(new CustomEvent('infraquote:country-changed'));feedback('City workspace loaded. Each city’s draft is kept separately on this device. Confirm all supplier costs and booking conditions.');
  }
  function bind() {
    $('quoteCity').addEventListener('change',()=>applyCity($('quoteCity').value));
    $('applyAmsterdamTemplate').addEventListener('click',()=>applyCity('amsterdam',Number($('amsterdamTemplate').value),true));
    $('quoteForm').addEventListener('input', (event) => { if(isNL()&&['serviceDate','pickupLocation','dropoffLocation','vehicleSelect','transportPlan'].includes(event.target.id)){$('coachAccess').checked=false;$('walkExemption').checked=false;} if(isNL()&&event.target.id==='vatMode')$('taxReviewed').checked=false;readForm(); if (!CALC.stepIssues(quote,step).length) clearFormErrors(); save(); smartPrompts(); renderSummaryOnly(); });
    $('quoteForm').addEventListener('change', () => { readForm(); if (!CALC.stepIssues(quote,step).length) clearFormErrors(); save(); smartPrompts(); renderSummaryOnly(); });
    $('quoteStepSelect').addEventListener('change', () => goStep(Number($('quoteStepSelect').value)));
    $('nextStep').addEventListener('click', () => goStep(stageFor(step) === 2 ? 0 : stages[stageFor(step)+1][0]));
    $('prevStep').addEventListener('click', () => goStep(stages[Math.max(0,stageFor(step)-1)][0]));
    $('saveDraft').addEventListener('click', () => { readForm(); if (save()) feedback('Draft saved in this browser.'); });
    $('duplicateQuote').addEventListener('click', () => { readForm(); quote.quoteNo = CALC.quoteReference(city().code); quote.quoteStatus = 'Draft'; save(); render(); });
    $('resetQuote').addEventListener('click', () => { if (confirm('Reset InfraQuote draft?')) { try { localStorage.removeItem(STORAGE); } catch (_) {} const target=quote.city;quote = defaultQuote();if(target==='amsterdam'){const setup=NL.setup();const ids=setup.itineraryIds;delete setup.itineraryIds;quote={...quote,...setup,quoteNo:CALC.quoteReference('AMS')};quote.itinerary=ids.map(id=>stopFromAttraction(city().attractions.find(a=>a.id===id)));}step = 0; save(); render(); } });
    ['attractionSearch','attractionCategory'].forEach(id=>$(id)?.addEventListener('input',()=>{const previous=$('attractionSelect').value;initOptions();if(Array.from($('attractionSelect').options).some(o=>o.value===previous))$('attractionSelect').value=previous;renderAttractionPreview();}));
    $('attractionSelect').addEventListener('change', renderAttractionPreview);
    $('addStop').addEventListener('click', () => { const item = city().attractions.find(a => a.id === $('attractionSelect').value); if (item) quote.itinerary.push(stopFromAttraction(item)); save(); render(); });
    $('addCost').addEventListener('click', () => { quote.costs.push(costLine('Custom internal cost', 'Custom', 'Fixed', 1, 0, true, 'Pending verification')); save(); render(); });
    $('addCondition').addEventListener('click', () => { quote.costs.push(costLine('Conditional cost', 'Operations', 'Conditional', 1, 0, true, 'Pending verification', 'Review before sending.', '', 'Pending confirmation')); save(); render(); });
    $('downloadQuotePdf').addEventListener('click', async () => { readForm(); renderSummaryOnly(); const button = $('downloadQuotePdf'); button.disabled = true; button.textContent = 'Preparing PDF…'; try { await window.INFRAQUOTE_PDF.download(clientDocument(results())); feedback('Client PDF downloaded. Review supplier availability before sending.'); } catch (error) { feedback('PDF download could not complete. Use Print client quote as a fallback.'); } finally { button.disabled = false; button.textContent = 'Download client PDF'; } });
    $('refreshAttractionRates').addEventListener('click', () => { quote.itinerary = quote.itinerary.map(stop => { const item = city().attractions.find(a => a.id === stop.attractionId); if (!item || item.id === 'custom') return stop; return {...stop,ageBands:item.ageBands?JSON.parse(JSON.stringify(item.ageBands)):null,referenceChecked:item.reference?.checked||'',availabilityConfirmed:false,conditionsReviewed:false,sourceRechecked:false,operatorChecked:'', adultTicket:item.adult, childTicket:item.child, infantTicket:item.infant, ticketRequired:item.ticketRequired, ticketVerification:item.ticketRequired ? 'Pending verification' : 'Not required', referenceReviewed:item.reference?.checked || ''}; }); save(); render(); feedback('Latest reference rates applied. Confirm the visit date and supplier conditions before marking tickets verified.'); });
    $('printQuote').addEventListener('click', () => { readForm(); renderSummaryOnly(); window.print(); });
    $('copyClientQuote').addEventListener('click', async () => { readForm(); try { if (!navigator.clipboard) throw new Error('unavailable'); await navigator.clipboard.writeText(clientText(results())); feedback('Client quote text copied.'); } catch (_) { feedback('Copy unavailable. Select the client preview text or use Print client quote / PDF.'); } });
    $('exportWorksheet').addEventListener('click',exportWorksheet);
    $('exportJson').addEventListener('click', () => { readForm(); download(`${quote.quoteNo}.json`, JSON.stringify({ quote, results: results() }, null, 2), 'application/json'); });
    $('prepareDispatch').addEventListener('click', () => { const panel=document.querySelector('#workflowTools details:has(#approveVersion)'); if(panel){panel.open=true;panel.scrollIntoView({block:'start'});} feedback('Save an approved snapshot in Versions, approval and operations handover. Dispatch will receive that exact version.'); });
  }

  function initOptions() {
    if ($('guideLanguageOptions')) $('guideLanguageOptions').innerHTML = DATA.guideRates.map(g => `<option value="${g.language}"></option>`).join('');
    const selectedVehicle=$('vehicleSelect').value;
    $('vehicleSelect').innerHTML = DATA.vehicles.map(v => `<option value="${v.id}">${v.name} · comfort ${v.comfortGuests} / max ${v.maxGuests}</option>`).join('');
    if(selectedVehicle)$('vehicleSelect').value=selectedVehicle;
    const previous=$('attractionSelect').value;const term=String($('attractionSearch')?.value||'').toLowerCase();const category=$('attractionCategory')?.value||'';
    if($('attractionCategory')){const categories=[...new Set(city().attractions.map(a=>a.type))];$('attractionCategory').innerHTML='<option value="">All topics</option>'+categories.map(c=>`<option ${c===category?'selected':''}>${escape(c)}</option>`).join('');}
    $('attractionSelect').innerHTML = city().attractions.filter(a=>(!term||a.name.toLowerCase().includes(term))&&(!category||a.type===category)).map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    if(Array.from($('attractionSelect').options).some(o=>o.value===previous))$('attractionSelect').value=previous;
  }

  window.INFRAQUOTE_WORKFLOW = {
    country: () => quote.city,
    baseCurrency: () => isNL()?'EUR':'AED',
    get: () => {readForm(); return JSON.parse(JSON.stringify(quote));},
    update: patch => {readForm(); quote = {...quote,...patch}; quote.quoteStatus='Draft'; save(); render();},
    restore: snapshot => {quote={...defaultQuote(),...JSON.parse(JSON.stringify(snapshot))}; step=0;save();render();},
    reviewSnapshot: snapshot => {const previous=quote;try{quote=snapshot;const r=results();return {lines:JSON.parse(JSON.stringify(r.lines)),blocking:r.ready.blocking.length,pending:r.totals.pending};}finally{quote=previous;}},
    preview: patch => {const previous=quote;try{quote={...quote,...patch};const r=results();return {total:r.price.finalPrice,minutes:plannedMinutes()};}finally{quote=previous;}},
    calculate: () => {const r=results(); return {total:r.price.finalPrice,minutes:plannedMinutes(),blocking:r.ready.blocking,pending:r.totals.pending};},
    review: () => {const r=results();return {lines:JSON.parse(JSON.stringify(r.lines)),blocking:r.ready.blocking,pending:r.totals.pending};},
    document: () => clientDocument(results()),
    templateStops: (ids,target) => ids.map(id => (DATA.cities[target]||city()).attractions.find(a=>a.id===id)).filter(Boolean).map(stopFromAttraction)
  };
  document.addEventListener('DOMContentLoaded', () => { load(); initOptions(); bind(); render(); });
})();
