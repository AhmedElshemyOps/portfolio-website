'use strict';

window.INFRAQUOTE_DATA = {
  version: '1.0.0-static-mvp',
  vatRate: 0.05,
  baseCurrency: 'AED',
  currencyRates: {
    AED: { rate: 1, note: 'Base costing currency' },
    USD: { rate: 0.27, note: 'Demo conversion from AED; verify live FX before sending' },
    EUR: { rate: 0.25, note: 'Demo conversion from AED; verify live FX before sending' },
    GBP: { rate: 0.21, note: 'Demo conversion from AED; verify live FX before sending' },
    SAR: { rate: 1.02, note: 'Demo conversion from AED; verify live FX before sending' }
  },
  cities: {
    abuDhabi: {
      code: 'AD',
      name: 'Abu Dhabi',
      sampleNotice: 'Demo rates are editable sample data for MVP testing only. Verify official attraction, supplier, vehicle, guide and VAT rules before sending a real quotation.',
      attractions: [
        { id: 'grand-mosque', name: 'Sheikh Zayed Grand Mosque', type: 'Cultural site', defaultDuration: 75, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Dress code and visitor guidelines apply.' },
        { id: 'qasr-al-watan', name: 'Qasr Al Watan', type: 'Attraction', defaultDuration: 90, ticketRequired: true, verification: 'Pending verification', adult: 65, child: 30, infant: 0, note: 'Sample ticket data only; verify official rate and opening hours.' },
        { id: 'louvre', name: 'Louvre Abu Dhabi', type: 'Museum', defaultDuration: 120, ticketRequired: true, verification: 'Official online rate checked 2026-07-01', adult: 70, child: 0, infant: 0, note: 'Official source showed adult 18+ AED 70 and under-18 free; verify before sending.' },
        { id: 'emirates-palace', name: 'Emirates Palace exterior photo stop', type: 'Photo stop', defaultDuration: 20, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Exterior stop subject to access and traffic.' },
        { id: 'corniche', name: 'Corniche photo stop', type: 'Photo stop', defaultDuration: 20, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Weather and parking conditions apply.' },
        { id: 'heritage-village', name: 'Heritage Village', type: 'Cultural stop', defaultDuration: 45, ticketRequired: false, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Verify opening schedule before confirmation.' },
        { id: 'dates-market', name: 'Abu Dhabi Dates Market', type: 'Market stop', defaultDuration: 35, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Client-facing shopping stop.' },
        { id: 'yas-photo', name: 'Yas Island photo stop', type: 'Photo stop', defaultDuration: 25, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Route and traffic dependent.' },
        { id: 'ferrari-world', name: 'Ferrari World Abu Dhabi', type: 'Theme park', defaultDuration: 240, ticketRequired: true, verification: 'Official online from-rate checked 2026-07-01', adult: 345, child: 345, infant: 0, note: 'Official source showed single-day ticket from AED 345; verify date/offers before sending.' },
        { id: 'warner-bros', name: 'Warner Bros. World Abu Dhabi', type: 'Theme park', defaultDuration: 240, ticketRequired: true, verification: 'Official online from-rate checked 2026-07-01', adult: 345, child: 345, infant: 0, note: 'Official source showed single-day ticket from AED 345; verify date/offers before sending.' },
        { id: 'yas-waterworld', name: 'Yas Waterworld', type: 'Water park', defaultDuration: 240, ticketRequired: true, verification: 'Official online rate checked 2026-07-01', adult: 295, child: 295, infant: 0, note: 'Official source showed single-day ticket AED 295; verify date/offers before sending.' },
        { id: 'saadiyat', name: 'Saadiyat Island', type: 'Scenic area', defaultDuration: 30, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Route and access dependent.' },
        { id: 'abrahamic', name: 'Abrahamic Family House', type: 'Cultural site', defaultDuration: 60, ticketRequired: false, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Pre-booking and visitor rules may apply.' },
        { id: 'teamlab-phenomena', name: 'teamLab Phenomena Abu Dhabi', type: 'Museum / immersive attraction', defaultDuration: 120, ticketRequired: true, verification: 'Official online from-rate checked 2026-07-01', adult: 145, child: 50, infant: 0, note: 'Official source showed regular from AED 145 and child from AED 50; verify date/offers before sending.' },
        { id: 'natural-history-museum', name: 'Natural History Museum Abu Dhabi', type: 'Museum', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'InfraDispatch-inspired addition; verify public opening, ticket policy, and timing before quoting.' },
        { id: 'zayed-national-museum', name: 'Zayed National Museum', type: 'Museum', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'InfraDispatch-inspired addition; verify public opening, ticket policy, and timing before quoting.' },
        { id: 'manarat-saadiyat', name: 'Manarat Al Saadiyat', type: 'Cultural venue', defaultDuration: 60, ticketRequired: false, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Verify exhibition schedule, event access, and coach parking.' },
        { id: 'qasr-al-hosn', name: 'Qasr Al Hosn', type: 'Heritage attraction', defaultDuration: 90, ticketRequired: true, verification: 'Official from-rate checked 2026-07-01', adult: 30, child: 15, infant: 0, note: 'Official tourism source shows general admission starts at AED 30; verify workshops/events separately.' },
        { id: 'founders-memorial', name: 'The Founder’s Memorial', type: 'Cultural photo stop', defaultDuration: 35, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Evening lighting can improve guest experience; confirm coach stopping point.' },
        { id: 'al-hudayriyat', name: 'Al Hudayriyat Island', type: 'Leisure / scenic stop', defaultDuration: 45, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Good flexible leisure stop; verify event-day access and traffic.' },
        { id: 'jubail-mangrove', name: 'Jubail Mangrove Park', type: 'Nature attraction', defaultDuration: 75, ticketRequired: true, verification: 'Pending verification', adult: 15, child: 10, infant: 0, note: 'Sample ticket data only; verify tide/weather suitability and official rate.' },
        { id: 'al-ain-oasis', name: 'Al Ain Oasis', type: 'Heritage / nature attraction', defaultDuration: 90, ticketRequired: false, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Regional stop; add highway buffer and confirm access/timing before quotation.' },
        { id: 'qasr-al-muwaiji', name: 'Qasr Al Muwaiji', type: 'Heritage attraction', defaultDuration: 60, ticketRequired: false, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Al Ain heritage stop; verify opening schedule and group access.' },
        { id: 'jebel-hafeet', name: 'Jebel Hafeet viewpoint', type: 'Scenic stop', defaultDuration: 60, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Regional mountain route; review vehicle suitability, timing, and weather.' },
        { id: 'sir-bani-yas', name: 'Sir Bani Yas Island transfer experience', type: 'Remote / nature experience', defaultDuration: 240, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Remote Al Dhafra operation; ferry, resort, and supplier logistics must be verified.' },

        { id: 'seaworld-ad', name: 'SeaWorld Abu Dhabi', type: 'Theme park / marine life', defaultDuration: 240, ticketRequired: true, verification: 'Official online rate checked 2026-07-01', adult: 316, child: 316, infant: 0, note: 'Official source showed online offer AED 316 from AED 395; verify offer/date before sending.' },
        { id: 'clymb-ad', name: 'CLYMB Abu Dhabi', type: 'Adventure attraction', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Use supplier quote or official package price; experience prices vary by activity.' },
        { id: 'national-aquarium', name: 'The National Aquarium Abu Dhabi', type: 'Aquarium', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Verify official admission/package price before quoting.' },
        { id: 'snow-abu-dhabi', name: 'Snow Abu Dhabi', type: 'Indoor attraction', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Verify official ticket type, age/height policy and clothing package before quoting.' },
        { id: 'zayed-airport', name: 'Zayed International Airport', type: 'Airport service', defaultDuration: 45, ticketRequired: false, verification: 'Not required', adult: 0, child: 0, infant: 0, note: 'Use transport/meet-and-greet supplier cost, not attraction ticket.' },
        { id: 'burj-khalifa', name: 'Burj Khalifa At The Top', type: 'Observation deck', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Dubai add-on; pricing changes by time slot and level. Verify official rate before sending.' },
        { id: 'museum-future', name: 'Museum of the Future Dubai', type: 'Museum', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Dubai add-on; verify timed-entry availability before quoting.' },
        { id: 'dubai-frame', name: 'Dubai Frame', type: 'Attraction', defaultDuration: 75, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Dubai add-on; verify official ticket and group access before quoting.' },
        { id: 'aquaventure', name: 'Aquaventure Waterpark Dubai', type: 'Water park', defaultDuration: 240, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Dubai add-on; verify official date-based rate and transfer timing.' },
        { id: 'global-village', name: 'Global Village Dubai', type: 'Seasonal attraction', defaultDuration: 180, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Seasonal operation; verify opening season and official rate before quoting.' },
        { id: 'mleiha-centre', name: 'Mleiha Archaeological Centre', type: 'Heritage / desert attraction', defaultDuration: 120, ticketRequired: true, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Sharjah add-on; verify package, guide and stargazing programme cost.' },
        { id: 'jebel-jais', name: 'Jebel Jais viewpoint / activity zone', type: 'Mountain attraction', defaultDuration: 180, ticketRequired: false, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'RAK add-on; activity tickets vary, transport time and weather are key cost drivers.' },
        { id: 'custom', name: 'Custom attraction or stop', type: 'Custom', defaultDuration: 30, ticketRequired: false, verification: 'Pending verification', adult: 0, child: 0, infant: 0, note: 'Define timing, ticket rule and client note.' }
      ]
    }
  },
  vehicles: [
    { id: 'sedan', name: 'Sedan', maxGuests: 3, comfortGuests: 2, luggage: '1-2 medium bags', baseCost: 420, includedHours: 5, overtimeRate: 80, driverIncluded: true, notes: 'Best for small private city transfers.' },
    { id: 'suv', name: 'SUV', maxGuests: 4, comfortGuests: 3, luggage: '2-3 medium bags', baseCost: 620, includedHours: 5, overtimeRate: 100, driverIncluded: true, notes: 'Comfort option for VIP/family small groups.' },
    { id: 'seven', name: '7-seater', maxGuests: 6, comfortGuests: 5, luggage: 'Limited with full capacity', baseCost: 760, includedHours: 6, overtimeRate: 120, driverIncluded: true, notes: 'Good family/private tour option.' },
    { id: 'van', name: 'Van', maxGuests: 10, comfortGuests: 8, luggage: 'Moderate', baseCost: 950, includedHours: 8, overtimeRate: 150, driverIncluded: true, notes: 'Flexible small group touring.' },
    { id: 'minibus', name: 'Minibus', maxGuests: 18, comfortGuests: 15, luggage: 'Limited if full', baseCost: 1300, includedHours: 8, overtimeRate: 190, driverIncluded: true, notes: 'Small groups and corporate visits.' },
    { id: 'coaster', name: 'Coaster', maxGuests: 28, comfortGuests: 24, luggage: 'Limited with full group', baseCost: 1750, includedHours: 8, overtimeRate: 240, driverIncluded: true, notes: 'Mid-size groups.' },
    { id: 'coach', name: 'Coach', maxGuests: 45, comfortGuests: 40, luggage: 'Coach bay subject to supplier', baseCost: 2400, includedHours: 8, overtimeRate: 320, driverIncluded: true, notes: 'Large groups, school or corporate operations.' },
    { id: 'premium', name: 'Premium vehicle', maxGuests: 3, comfortGuests: 2, luggage: 'Limited premium setup', baseCost: 1250, includedHours: 5, overtimeRate: 220, driverIncluded: true, notes: 'VIP service, supplier confirmation required.' },
    { id: 'custom', name: 'Custom vehicle', maxGuests: 1, comfortGuests: 1, luggage: 'Define manually', baseCost: 0, includedHours: 0, overtimeRate: 0, driverIncluded: false, notes: 'Use manual override and supplier verification.' }
  ],
  guideRates: [
    { language: 'English', halfDay: 500, fullDay: 850, premium: 0 },
    { language: 'French', halfDay: 650, fullDay: 1050, premium: 120 },
    { language: 'Arabic', halfDay: 500, fullDay: 850, premium: 0 },
    { language: 'German', halfDay: 750, fullDay: 1200, premium: 180 },
    { language: 'Russian', halfDay: 750, fullDay: 1200, premium: 180 },
    { language: 'Chinese', halfDay: 850, fullDay: 1350, premium: 250 },
    { language: 'Custom language', halfDay: 0, fullDay: 0, premium: 0 }
  ],
  defaultTerms: {
    validity: 'This quotation is valid until the stated validity date and is subject to vehicle, guide, attraction ticket, and supplier availability at the time of confirmation.',
    revision: 'Any change in guest count, pickup location, itinerary, service duration, or ticket requirement may require a revised quotation.',
    access: 'Attraction access, opening hours, ticket policies, and site rules are subject to official availability and applicable regulations at the time of confirmation.',
    cultural: 'Guests visiting cultural and religious sites are kindly requested to follow the applicable dress code and visitor guidelines.',
    overtime: 'Additional waiting time, route changes, extra stops, or service extension beyond the agreed itinerary may be subject to additional charges.'
  }
};

/* Public admission references reviewed 8 October 2026. These are not supplier net rates.
   A source review never marks an individual booking as supplier-verified. */
(function reviewAttractionReferences(data) {
  const reviewed = '2026-10-08';
  const refs = {
    'grand-mosque': {adult:8, child:8, ticketRequired:true, source:'https://www.szgmc.gov.ae/en/worshippers/en-v-faqs', hoursSource:'https://www.szgmc.gov.ae/en/worshippers/en-od-visiting-hours', price:'Tour-operator category AED 8; tourists AED 10; Emirates ID holders AED 5. Confirm category and age exemptions.', hours:'Sat–Thu 09:00–20:30; Fri 09:00–11:30 and 14:30–20:30. Ramadan differs.', terms:'Visitor registration and dress code apply. Older official pages still describe free admission; confirm the amount in the booking portal.', basis:'Official category rate · confirmation needed'},
    'qasr-al-watan': {source:'https://www.qasralwatan.ae/en/tickets', hoursSource:'https://www.qasralwatan.ae/en/plan-your-visit', price:'Current ticket price not exposed on the official public page. Existing AED 65/30 inputs are sample allowances, not a verified rate.', hours:'Date-dependent; check official opening-hours updates. Palace and light-show timings are separate.', terms:'Confirm selected ticket, visit date, access and cancellation terms. State visits may affect access.', basis:'Sample allowance · supplier quote required'},
    'louvre': {adult:70, child:0, source:'https://www.louvreabudhabi.ae/visit-us', price:'Adults 18+ AED 70 including VAT; under 18 free.', hours:'Main visit page: galleries Mon–Thu 10:00–18:30; Fri–Sun 10:00–20:30; last entry 30 min before closure. Older official FAQ says closed Monday: reconfirm date.', terms:'Book admission for the date. Galleries may close for artwork installation. Check group arrangements and eligibility for complimentary admission.', basis:'Official public admission'},
    'ferrari-world': {adult:345, child:345, source:'https://www.ferrariworldabudhabi.com/en/tickets/Single-Day-Ticket', price:'Public online single-day ticket from AED 345. Check junior categories and any advance-purchase offer.', hours:'Use the official date calendar; ride availability and daily opening hours can change.', terms:'One-day general admission; rides have height/access restrictions. Check ticket-specific cancellation and date-change terms.', basis:'Official online from-price'},
    'warner-bros': {source:'https://www.wbworldabudhabi.com/en/tickets/single-day-ticket', price:'Public page describes advance online savings but does not expose a current amount. AED 345 inputs remain sample allowances.', hours:'Confirm the selected date in the official park calendar.', terms:'Check age/height restrictions and dated-ticket terms. Do not assume every child receives the same rate.', basis:'Sample allowance · live amount required'},
    'yas-waterworld': {adult:295, child:295, source:'https://www.yaswaterworld.com/en/faq', termsSource:'https://www.yaswaterworld.com/en/legal/ticket-terms', price:'Official FAQ lists AED 295 online. Confirm junior eligibility and the selected product.', hours:'Date calendar and events may change access; confirm official park overview and visit date.', terms:'Ticket terms say non-refundable and non-exchangeable; dated-ticket changes have a deadline and fee, subject to product exceptions. Check current terms before sale.', basis:'Official FAQ public rate'},
    'seaworld-ad': {adult:375, child:375, source:'https://www.seaworldabudhabi.com/en/tickets', price:'Adult AED 375; junior AED 320 only for height below 1.1m. Child input conservatively uses adult price until height is confirmed.', hours:'Check official visit-date calendar and presentation schedules.', terms:'General admission includes rides/experiences subject to restrictions; junior pricing is height-based, not simply age-based.', basis:'Official public admission · height-based junior rate'},
    'teamlab-phenomena': {adult:155, child:55, source:'https://www.teamlababudhabi.com/en/tickets', hoursSource:'https://www.teamlababudhabi.com/en/plan-your-visit/opening-hours', price:'Regular online ticket from AED 155 (listed regular AED 165); child 4–12 from AED 55; under 4 free. Verify offer and date.', hours:'Timed entry; allow 1.5–3 hours. Last entry two hours before closing; use current date schedule.', terms:'No re-entry; children need an adult. Strollers are not allowed inside. Check sensory/accessibility suitability.', basis:'Official online from-price'},
    'natural-history-museum': {source:'https://www.nhmad.ae/en/visit-us', price:'Admission amount requires the official booking portal; no current rate confirmed. Enter a supplier/reference rate before pricing.', hours:'Mon–Thu 10:00–18:30; Fri–Sun 10:00–20:30; last entry 45 minutes before closing.', terms:'Museum ticket covers galleries, special exhibitions and select workshops; immersive theatre requires a separate ticket. Confirm date-specific closures.', basis:'Hours reviewed · admission rate pending'},
    'zayed-national-museum': {source:'https://zayednationalmuseum.ae/en/', price:'Ticket amount must be confirmed in the booking portal. Do not treat an unpriced ticket as free.', hours:'Daily 10:00–20:00; last entry one hour before closing.', terms:'Confirm admission category, museum-pass eligibility, group access and cancellation conditions.', basis:'Hours reviewed · admission rate pending'},
    'qasr-al-hosn': {adult:30, source:'https://visitabudhabi.ae/en/things-to-do/culture/heritage/qasr-al-hosn', price:'Official destination site: general admission from AED 30. Child AED 15 remains an unverified sample.', hours:'Confirm current opening schedule with the venue before setting the route.', terms:'Check what general admission includes; workshops and events may need separate booking.', basis:'Official destination from-price · child rate pending'},
    'jubail-mangrove': {source:'https://www.jubailmangrovepark.ae/en/activities', price:'Boardwalk and ranger/kayak products differ. AED 15/10 inputs remain samples; obtain the chosen product price.', hours:'Confirm current activity slot, tide, weather and last entry.', terms:'Choose boardwalk, ranger walk or water activity explicitly. Check activity-specific age rules and cancellation conditions.', basis:'Product reviewed · current rate pending'},
    'abrahamic': {source:'https://www.abrahamicfamilyhouse.ae/?lang=en', unavailable:true, price:'Official destination FAQ describes complimentary pre-booked visits, but venue homepage displays a temporary closure notice.', hours:'Do not promise a visit until reopening and the desired booking slot are confirmed.', terms:'Pre-booking, worship schedules and visitor dress rules apply. Confirm venue reopening directly.', basis:'Closure notice · confirmation required'},
    'museum-future': {adult:169, child:169, source:'https://prod-origin.museumofthefuture.ae/en/plan-your-visit', price:'Official plan-your-visit page lists AED 169 for age 4+. Confirm under-4 admission and visit slot.', hours:'Timed entry; obtain the selected-date slot before confirming the tour.', terms:'Children aged 4+ use the listed entry rate; check current timed-ticket availability and terms.', basis:'Official public admission'},
    'dubai-frame': {adult:50, child:20, source:'https://www.dubaiframe.ae/en/faq', price:'Adults AED 50; children 3–12 AED 20; under 3 free. Confirm category eligibility.', hours:'Daily 08:00–21:00. Arrive 10–15 minutes before booked admission.', terms:'Single entry for the booked date; check official ticket terms and prohibited items.', basis:'Official public admission'},
    'global-village': {source:'https://www.globalvillage.ae/en/node/20131', price:'Season 31 ticket amount not confirmed. Do not reuse Season 30 AED 25/30 as a verified current price.', hours:'Official season page: 14 October 2026–May 2027. Confirm exact daily hours and closing date.', terms:'Check current season validity, family-day restrictions and paid attractions excluded from park admission.', basis:'New season · current rate pending'},
    'clymb-ad': {source:'https://tickets.clymbabudhabi.com/flying4mins', price:'Official four-minute flying experience AED 480 per person. Other flying/climbing products differ; obtain selected product rate.', hours:'Book a timed activity slot and allow briefing, gear fitting and transfer time.', terms:'Four-flight package includes instruction and gear; under-6 helmet sizing needs team confirmation. Check all activity eligibility rules.', basis:'Package-specific price · choose activity'},
    'snow-abu-dhabi': {source:'https://www.skidxb.com/en-ae/snow-abu-dhabi/snow-park-pass', price:'Product/weekday offers vary. Enter the selected pass price from official booking.', hours:'Confirm the pass date and operational schedule before routing.', terms:'Check age/height restrictions, adult supervision, included clothing and activity eligibility.', basis:'Current product amount pending'}
  };
  for (const item of data.cities.abuDhabi.attractions) {
    const ref = refs[item.id];
    if (ref) {
      for (const key of ['adult','child','ticketRequired']) if (ref[key] !== undefined) item[key] = ref[key];
      item.reference = {...ref, checked:reviewed};
      item.verification = item.ticketRequired ? 'Pending verification' : 'Not required';
      item.note = `${ref.hours} ${ref.terms}`;
    } else {
      item.reference = {basis:item.ticketRequired ? 'Supplier quote required' : 'Route/access check required', price:item.ticketRequired ? 'No current official rate confirmed. Enter the selected product cost; zero does not mean free.' : 'No attraction admission is priced for this stop. Paid activities, parking and access charges require a separate cost.', hours:'Confirm access, visit schedule, traffic and group stopping arrangements for the service date.', terms:item.note, checked:''};
      item.verification = item.ticketRequired ? 'Pending verification' : item.verification;
    }
  }
  data.referenceReviewDate = reviewed;
})(window.INFRAQUOTE_DATA);
