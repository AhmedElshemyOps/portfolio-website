'use strict';

window.INFRAQUOTE_CALC = (() => {
  const money = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const ceil = (value) => Math.ceil(Number(value) || 0);

  function quoteReference(cityCode = 'AD') {
    const year = new Date().getFullYear();
    const key = `infraquote_ref_${cityCode}_${year}`;
    let next = 1;
    try { next = Number(localStorage.getItem(key) || '0') + 1; localStorage.setItem(key, String(next)); }
    catch (_) { next = Date.now(); }
    return `IQ-${cityCode}-${year}-${String(next).padStart(4, '0')}`;
  }

  function recommendVehicle(totalGuests, luggageRequired, serviceType, vehicles, preferComfort = false) {
    const comfort = serviceType === 'VIP tour' || luggageRequired || preferComfort;
    const sorted = vehicles.filter((v) => v.id !== 'custom').sort((a, b) => a.maxGuests - b.maxGuests);
    const vehicle = sorted.find((v) => totalGuests <= (comfort ? v.comfortGuests : v.maxGuests)) || sorted[sorted.length - 1];
    const quantity = vehicle ? Math.max(1, ceil(totalGuests / (comfort ? vehicle.comfortGuests : vehicle.maxGuests))) : 1;
    const warnings = [];
    if (vehicle && totalGuests > vehicle.comfortGuests) warnings.push('Guest count exceeds recommended comfort capacity. Review comfort, luggage and service level.');
    if (luggageRequired) warnings.push('Luggage requirement may reduce passenger comfort capacity or require a vehicle upgrade.');
    if (serviceType === 'VIP tour' && vehicle && !['suv', 'premium', 'van'].includes(vehicle.id)) warnings.push('VIP service may require an upgraded or premium vehicle.');
    return { vehicle, quantity, warnings };
  }

  function costLineTotal(line) {
    return money((Number(line.quantity) || 0) * (Number(line.unitCost) || 0));
  }

  function classifyCosts(lines, riskBuffer = 0) {
    const included = lines.filter((line) => line.include !== false);
    const fixed = included.filter((line) => line.type === 'Fixed').reduce((sum, line) => sum + costLineTotal(line), 0);
    const variable = included.filter((line) => line.type === 'Variable').reduce((sum, line) => sum + costLineTotal(line), 0);
    const conditional = included.filter((line) => line.type === 'Conditional' && ['Included', 'Estimated risk'].includes(line.conditionStatus || 'Included')).reduce((sum, line) => sum + costLineTotal(line), 0);
    const pending = included.filter(line => line.verification === 'Pending verification' || (line.type === 'Conditional' && ['Pending confirmation', 'Estimated risk'].includes(line.conditionStatus || ''))).length;
    return { fixed: money(fixed), variable: money(variable), conditional: money(conditional), riskBuffer: money(riskBuffer), pending, netCost: money(fixed + variable + conditional + Number(riskBuffer || 0)) };
  }

  function priceFromMarkup(netCost, markupPct) {
    return money(netCost * (1 + Number(markupPct || 0) / 100));
  }

  function priceFromMargin(netCost, marginPct) {
    const margin = Number(marginPct || 0) / 100;
    if (margin >= 1) return 0;
    return money(netCost / (1 - margin));
  }

  function pricing({ netCost, method, markupPct, targetMarginPct, vatMode, vatRate, totalGuests, adults, children, childRatio = 0.65, rounding = 5 }) {
    if(vatMode==='margin'){
      const rate=Number(vatRate)||0, margin=Number(targetMarginPct||0)/100;
      const raw=method==='margin' ? (1-margin*(1+rate)>0 ? netCost/(1-margin*(1+rate)) : 0) : priceFromMarkup(netCost,markupPct);
      const increment=Number(rounding)>0?Number(rounding):1;
      const finalPrice=money(Math.ceil(raw/increment)*increment);
      const vatAmount=money(Math.max(0,finalPrice-netCost)*rate/(1+rate));
      const profit=money(finalPrice-netCost-vatAmount);
      const units=Math.max(1,Number(adults||0)+Number(children||0)*childRatio);
      return {beforeVat:money(finalPrice-vatAmount),vatAmount,finalPrice,profit,actualMarkup:netCost>0?money(profit/netCost*100):0,actualMargin:finalPrice>0?money(profit/finalPrice*100):0,pricePerGuest:totalGuests>0?money(finalPrice/totalGuests):0,pricePerAdult:money(finalPrice/units),pricePerChild:money(finalPrice/units*childRatio)};
    }
    const beforeVatRaw = method === 'margin' ? priceFromMargin(netCost, targetMarginPct) : priceFromMarkup(netCost, markupPct);
    const increment = Number(rounding) > 0 ? Number(rounding) : 1;
    const roundedPrice = money(Math.ceil((vatMode === 'inclusive' ? beforeVatRaw * (1 + vatRate) : beforeVatRaw) / increment) * increment);
    const roundedBeforeVat = vatMode === 'inclusive' ? money(roundedPrice / (1 + vatRate)) : roundedPrice;
    const vatAmount = vatMode === 'exclusive' ? money(roundedBeforeVat * vatRate) : vatMode === 'inclusive' ? money(roundedPrice - roundedBeforeVat) : 0;
    const finalPrice = vatMode === 'exclusive' ? money(roundedBeforeVat + vatAmount) : roundedPrice;
    const profit = money(roundedBeforeVat - netCost);
    const actualMarkup = netCost > 0 ? money((profit / netCost) * 100) : 0;
    const actualMargin = roundedBeforeVat > 0 ? money((profit / roundedBeforeVat) * 100) : 0;
    const payingUnits = Math.max(1, Number(adults || 0) + Number(children || 0) * childRatio);
    return {
      beforeVat: roundedBeforeVat,
      vatAmount,
      finalPrice,
      profit,
      actualMarkup,
      actualMargin,
      pricePerGuest: totalGuests > 0 ? money(finalPrice / totalGuests) : 0,
      pricePerAdult: money(finalPrice / payingUnits),
      pricePerChild: money((finalPrice / payingUnits) * childRatio)
    };
  }

  function marginStatus(actualMargin, threshold, riskLevel, profit) {
    if (profit < 0) return 'Below cost';
    if (riskLevel === 'High') return 'High operational risk';
    if (actualMargin < Number(threshold || 0)) return 'Low margin';
    if (actualMargin < Number(threshold || 0) + 5) return 'Review required';
    return 'Healthy';
  }

  function breakEven({ fixedCost, variableCost, payingGuests, sellingPerGuest, minimumTarget }) {
    const variablePerGuest = payingGuests > 0 ? variableCost / payingGuests : 0;
    const contribution = sellingPerGuest - variablePerGuest;
    const breakEvenGuests = contribution > 0 ? ceil(fixedCost / contribution) : Infinity;
    const revenue = money(sellingPerGuest * payingGuests);
    const variableAtCurrent = money(variablePerGuest * payingGuests);
    const contributionAtCurrent = money(revenue - variableAtCurrent);
    const profit = money(revenue - variableAtCurrent - fixedCost);
    let risk = 'Grey';
    if (Number.isFinite(breakEvenGuests)) {
      if (payingGuests >= Math.max(minimumTarget || 0, breakEvenGuests + 2)) risk = 'Green';
      else if (payingGuests >= breakEvenGuests) risk = 'Amber';
      else risk = 'Red';
    }
    return { variablePerGuest: money(variablePerGuest), contributionPerGuest: money(contribution), breakEvenGuests, revenue, variableAtCurrent, contributionAtCurrent, profit, risk };
  }

  function selectedVehicleChecks(guests, vehicle, quantity, comfortRequired = false) {
    const capacity = Number(vehicle.maxGuests) * Number(quantity);
    const comfortCapacity = Number(vehicle.comfortGuests) * Number(quantity);
    return { blocking: guests > capacity ? [`Selected transport has ${capacity} configured passenger places for ${guests} guests. Increase vehicle quantity or select a larger vehicle.`] : [], warnings: guests <= capacity && comfortRequired && guests > comfortCapacity ? [`Selected transport exceeds the configured comfort capacity of ${comfortCapacity}. Review luggage and comfort requirements.`] : [] };
  }

  function stepIssues(quote, stepIndex) {
    const issues = [];
    const add = (field, message) => issues.push({field, message});
    if (stepIndex === 0) {
      if (!String(quote.clientCompany || '').trim()) add('clientCompany', 'Enter a client or company name.');
      if (!quote.serviceDate) add('serviceDate', 'Choose a service date.');
      if (!quote.validityDate) add('validityDate', 'Choose a quotation validity date.');
      if (quote.quoteDate && quote.serviceDate && quote.serviceDate < quote.quoteDate) add('serviceDate', 'Service date cannot precede the quotation date.');
      if (quote.quoteDate && quote.validityDate && quote.validityDate < quote.quoteDate) add('validityDate', 'Validity date cannot precede the quotation date.');
    }
    if (stepIndex === 1) {
      const counts = [quote.adults, quote.children, quote.infants].map(Number);
      if (counts.some(n => !Number.isInteger(n) || n < 0) || counts.reduce((a,b) => a+b,0) < 1) add('adults', 'Enter at least one guest using non-negative whole numbers.');
      if (!['Half day','Full day','Custom'].includes(quote.tourDuration)) add('tourDuration', 'Choose Half day, Full day or Custom.');
      if (quote.tourDuration === 'Custom' && !(Number(quote.customHours) >= 1)) add('customHours', 'Enter at least one hour for a custom tour.');
      if (!String(quote.pickupLocation || '').trim()) add('pickupLocation', 'Enter a pickup location.');
      if (!String(quote.dropoffLocation || '').trim()) add('dropoffLocation', 'Enter a drop-off location.');
    }
    if (stepIndex === 2 && !quote.itinerary.some(s => ['Included','To be confirmed'].includes(s.status))) add('addStop', 'Add at least one included itinerary stop.');
    if (stepIndex === 3 && (!(quote.vehicleQty >= 1) || !Number.isInteger(Number(quote.vehicleQty)))) add('vehicleQty', 'Use a positive whole number of vehicles.');
    if (stepIndex === 5) {
      if (!(quote.rounding > 0)) add('rounding', 'Rounding increment must be greater than zero.');
      if (quote.pricingMethod === 'margin' && !(quote.targetMargin >= 0 && quote.targetMargin < 100)) add('targetMargin', 'Target margin must be below 100% and not negative.');
    }
    return issues;
  }

  function readiness(quote, totals, pricingResult, breakEvenResult) {
    const blocking = [];
    const warnings = [];
    const suggestions = [];
    const guests = Number(quote.adults || 0) + Number(quote.children || 0) + Number(quote.infants || 0);
    if (!['Half day','Full day','Custom'].includes(quote.tourDuration)) blocking.push('Tour duration must be selected.');
    if (quote.tourDuration === 'Custom' && !(Number(quote.customHours) >= 1)) blocking.push('Custom tour hours must be at least one.');
    if (guests <= 0) blocking.push('At least one guest is required.');
    if ([quote.adults, quote.children, quote.infants].some(n => Number(n) < 0 || !Number.isInteger(Number(n)))) blocking.push('Guest counts must be non-negative whole numbers.');
    if (!(quote.vehicleQty >= 1) || !Number.isInteger(Number(quote.vehicleQty))) blocking.push('Vehicle quantity must be a positive whole number.');
    if (Number(quote.handlingFee) < 0 || Number(quote.riskBuffer) < 0) blocking.push('Handling fee and risk buffer must not be negative.');
    if (!(quote.rounding > 0)) blocking.push('Rounding increment must be greater than zero.');
    if (quote.pricingMethod === 'margin' && !(quote.targetMargin >= 0 && quote.targetMargin < 100)) blocking.push('Target margin must be between 0 and less than 100%.');
    if (quote.quoteDate && quote.validityDate && quote.validityDate < quote.quoteDate) blocking.push('Validity date cannot precede the quotation date.');
    if (quote.quoteDate && quote.serviceDate && quote.serviceDate < quote.quoteDate) blocking.push('Service date cannot precede the quotation date.');
    if (!String(quote.clientCompany || '').trim()) blocking.push('Client company name is required.');
    if (!quote.serviceDate) blocking.push('Service date is required.');
    if (!quote.pickupLocation || !quote.dropoffLocation) blocking.push('Pickup and drop-off details must be clear.');
    if (!quote.itinerary.some(item => item.status === 'Included' || item.status === 'To be confirmed')) blocking.push('At least one itinerary item is required.');
    if (!quote.vehicleId) blocking.push('Vehicle selection is required.');
    if (!quote.validityDate) blocking.push('Quotation validity date is required.');
    if (!quote.terms?.cancellation) blocking.push('Cancellation or amendment wording is required.');
    if (quote.itinerary.some((item) => item.ticketRequired && item.ticketVerification === 'Pending verification')) warnings.push('Some ticket rates or policies are pending verification.');
    if (totals.pending) warnings.push('Included costs still need supplier verification or conditional-cost review.');
    if (pricingResult.actualMargin < Number(quote.reviewMargin || 0)) warnings.push('Actual margin is below the chosen review threshold.');
    if (quote.serviceType === 'Shared tour' && breakEvenResult?.risk === 'Red') warnings.push('Shared tour is below break-even. Supervisor approval is recommended before confirmation.');
    if (quote.pickupPoints > 1) suggestions.push('Multiple pickup points may affect timing, waiting time and vehicle cost.');
    if (quote.guestProfile === 'VIP' || quote.guestProfile === 'Senior guests') suggestions.push('Add comfort time, accessibility checks and vehicle comfort review.');
    return { blocking, warnings, suggestions, score: Math.max(0, 100 - blocking.length * 25 - warnings.length * 10 - suggestions.length * 3) };
  }

  return { money, quoteReference, recommendVehicle, selectedVehicleChecks, costLineTotal, classifyCosts, priceFromMarkup, priceFromMargin, pricing, marginStatus, breakEven, stepIssues, readiness };
})();
