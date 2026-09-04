'use strict';

window.INFRAQUOTE_CALC = (() => {
  const money = (value) => Math.round((Number(value) || 0) * 100) / 100;
  const ceil = (value) => Math.ceil(Number(value) || 0);

  function quoteReference(cityCode = 'AD') {
    const year = new Date().getFullYear();
    const key = `infraquote_ref_${cityCode}_${year}`;
    const next = Number(localStorage.getItem(key) || '0') + 1;
    localStorage.setItem(key, String(next));
    return `IQ-${cityCode}-${year}-${String(next).padStart(4, '0')}`;
  }

  function recommendVehicle(totalGuests, luggageRequired, serviceType, vehicles) {
    const comfort = serviceType === 'VIP tour' || luggageRequired;
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
    const pending = lines.filter((line) => line.type === 'Conditional' && ['Pending confirmation', 'Estimated risk'].includes(line.conditionStatus || '')).length;
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
    const beforeVatRaw = method === 'margin' ? priceFromMargin(netCost, targetMarginPct) : priceFromMarkup(netCost, markupPct);
    const roundedBeforeVat = money(Math.ceil(beforeVatRaw / rounding) * rounding);
    const vatAmount = vatMode === 'exclusive' ? money(roundedBeforeVat * vatRate) : vatMode === 'inclusive' ? money(roundedBeforeVat - (roundedBeforeVat / (1 + vatRate))) : 0;
    const finalPrice = vatMode === 'exclusive' ? money(roundedBeforeVat + vatAmount) : roundedBeforeVat;
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

  function readiness(quote, totals, pricingResult, breakEvenResult) {
    const blocking = [];
    const warnings = [];
    const suggestions = [];
    if (!quote.clientCompany) blocking.push('Client company name is required.');
    if (!quote.serviceDate) blocking.push('Service date is required.');
    if (!quote.pickupLocation || !quote.dropoffLocation) blocking.push('Pickup and drop-off details must be clear.');
    if (!quote.itinerary.length) blocking.push('At least one itinerary item is required.');
    if (!quote.vehicleId) blocking.push('Vehicle selection is required.');
    if (!quote.validityDate) blocking.push('Quotation validity date is required.');
    if (!quote.terms?.cancellation) blocking.push('Cancellation or amendment wording is required.');
    if (quote.itinerary.some((item) => item.ticketRequired && item.ticketVerification === 'Pending verification')) warnings.push('Some ticket rates or policies are pending verification.');
    if (totals.pending) warnings.push('Conditional costs are pending or estimated. Decide whether to include as buffer, condition, or pending item.');
    if (pricingResult.actualMargin < Number(quote.reviewMargin || 0)) warnings.push('Actual margin is below the chosen review threshold.');
    if (quote.serviceType === 'Shared tour' && breakEvenResult?.risk === 'Red') warnings.push('Shared tour is below break-even. Supervisor approval is recommended before confirmation.');
    if (quote.pickupPoints > 1) suggestions.push('Multiple pickup points may affect timing, waiting time and vehicle cost.');
    if (quote.guestProfile === 'VIP' || quote.guestProfile === 'Senior guests') suggestions.push('Add comfort time, accessibility checks and vehicle comfort review.');
    return { blocking, warnings, suggestions, score: Math.max(0, 100 - blocking.length * 25 - warnings.length * 10 - suggestions.length * 3) };
  }

  return { money, quoteReference, recommendVehicle, costLineTotal, classifyCosts, priceFromMarkup, priceFromMargin, pricing, marginStatus, breakEven, readiness };
})();
