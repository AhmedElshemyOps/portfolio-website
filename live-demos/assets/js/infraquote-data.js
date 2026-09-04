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
