/* InfraSky UAE location and product configuration.
   Values are operational planning defaults, not a substitute for site inspection, permits,
   driver assessment, or live safety approval. Keep this file editable for future API/database migration. */
'use strict';

window.INFRASKY_DATA = {
  version: '1.0.1-static-mvp',
  timezone: 'Asia/Dubai',
  locations: [
    {
      id: 'al-quaa', emirate: 'Abu Dhabi', name: 'Al Quaa Desert', latitude: 23.9259, longitude: 54.9142,
      darknessScore: 92, accessType: 'Remote desert tracks', vehicleRequirement: 'SUV / 4x4 required',
      transferMinutes: { 'Abu Dhabi City': 165, 'Dubai City': 190, 'Al Ain': 115, 'Sharjah City': 220, 'Self-drive / no transport': 0 },
      safetyScore: 72, mobileSignal: 'Limited', permitNotes: 'Confirm land access, camp approval and group operating rules before sale.',
      campLightingPotential: 94, bestFor: ['Milky Way photography', 'Meteor shower campaign', 'Private astrophotography experience'],
      operationalNotes: 'Remote location. Use convoy discipline, recovery-ready 4x4 drivers, water, first-aid and a location pin shared before departure.',
      risks: ['Long transfer', 'Variable mobile signal', 'Off-road access', 'High summer heat']
    },
    {
      id: 'liwa', emirate: 'Abu Dhabi', name: 'Liwa Desert', latitude: 23.1372, longitude: 53.7709,
      darknessScore: 95, accessType: 'Remote dune desert', vehicleRequirement: 'SUV / 4x4 required',
      transferMinutes: { 'Abu Dhabi City': 230, 'Dubai City': 290, 'Al Ain': 250, 'Sharjah City': 320, 'Self-drive / no transport': 0 },
      safetyScore: 68, mobileSignal: 'Limited', permitNotes: 'Route, camp access and overnight operating permission must be confirmed locally.',
      campLightingPotential: 96, bestFor: ['Milky Way photography', 'Meteor shower campaign', 'Private astrophotography experience'],
      operationalNotes: 'Best reserved for premium and properly resourced operations. Allow recovery and driver-rest margins.',
      risks: ['Very long transfer', 'Dune access', 'Limited support access', 'Heat and wind exposure']
    },
    {
      id: 'al-wathba', emirate: 'Abu Dhabi', name: 'Al Wathba Desert', latitude: 24.2508, longitude: 54.6336,
      darknessScore: 66, accessType: 'Desert edge / established camp access', vehicleRequirement: 'Coach or SUV depending on final site',
      transferMinutes: { 'Abu Dhabi City': 55, 'Dubai City': 105, 'Al Ain': 110, 'Sharjah City': 135, 'Self-drive / no transport': 0 },
      safetyScore: 86, mobileSignal: 'Good', permitNotes: 'Use only approved camp or event sites; confirm entry and lighting restrictions.',
      campLightingPotential: 76, bestFor: ['Family night-sky experience', 'Moon and planets telescope night', 'Arabic astronomy storytelling'],
      operationalNotes: 'Good operational compromise between access and darkness. Best with controlled camp lighting.',
      risks: ['Light spill from camps', 'Weekend traffic', 'Camp generator discipline']
    },
    {
      id: 'al-wathba-camp-zone', emirate: 'Abu Dhabi', name: 'Al Wathba Camp Zone', latitude: 24.2550, longitude: 54.6350,
      darknessScore: 64, accessType: 'Established camp / desert-edge access', vehicleRequirement: 'Coach or SUV depending on final camp access',
      transferMinutes: { 'Abu Dhabi City': 55, 'Dubai City': 105, 'Al Ain': 110, 'Sharjah City': 135, 'Self-drive / no transport': 0 },
      safetyScore: 88, mobileSignal: 'Good', permitNotes: 'Confirm the exact camp partner, parking flow, generator position and white-light shutdown window.',
      campLightingPotential: 72, bestFor: ['Family night-sky experience', 'Luxury desert dinner and stargazing', 'Arabic astronomy storytelling', 'Moon and planets telescope night'],
      operationalNotes: 'Best for accessible Abu Dhabi groups that need dinner, seating and safer logistics. Avoid promising deep-sky photography unless the camp can control lighting.',
      risks: ['Light spill from nearby camps', 'Event noise', 'Weekend traffic', 'Generator discipline']
    },
    {
      id: 'al-khatim-camp-zone', emirate: 'Abu Dhabi', name: 'Al Khatim Camp Zone', latitude: 24.1900, longitude: 55.0500,
      darknessScore: 71, accessType: 'Desert camp / mixed paved and sand access', vehicleRequirement: 'SUV / 4x4 preferred; coach only to approved paved access',
      transferMinutes: { 'Abu Dhabi City': 75, 'Dubai City': 100, 'Al Ain': 75, 'Sharjah City': 130, 'Self-drive / no transport': 0 },
      safetyScore: 82, mobileSignal: 'Moderate', permitNotes: 'Confirm final camp access, convoy route and light-control agreement with the supplier.',
      campLightingPotential: 78, bestFor: ['Luxury desert dinner and stargazing', 'Arabic astronomy storytelling', 'Family night-sky experience'],
      operationalNotes: 'Practical middle-ground camp zone between Abu Dhabi, Al Ain and Dubai. Strong for dinner-plus-sky products when the supplier supports dark adaptation.',
      risks: ['Supplier variation', 'Sand access', 'Camp lighting', 'Heat exposure']
    },
    {
      id: 'sweihan-desert', emirate: 'Abu Dhabi', name: 'Sweihan Desert', latitude: 24.4550, longitude: 55.3300,
      darknessScore: 74, accessType: 'Remote desert / approved tracks required', vehicleRequirement: 'SUV / 4x4 required',
      transferMinutes: { 'Abu Dhabi City': 95, 'Dubai City': 115, 'Al Ain': 55, 'Sharjah City': 145, 'Self-drive / no transport': 0 },
      safetyScore: 75, mobileSignal: 'Limited to moderate', permitNotes: 'Use only approved access routes and a known staging point. Confirm recovery support for night operation.',
      campLightingPotential: 84, bestFor: ['Milky Way photography', 'Meteor shower campaign', 'Private astrophotography experience'],
      operationalNotes: 'Good dark-sky planning option for experienced off-road operators. Keep guest product small, controlled and safety-led.',
      risks: ['Remote tracks', 'Limited mobile signal', 'Recovery dependency', 'Heat and wind exposure']
    },
    {
      id: 'al-ain-foothills', emirate: 'Abu Dhabi', name: 'Al Ain / Jebel Hafeet Foothills', latitude: 24.1358, longitude: 55.8049,
      darknessScore: 58, accessType: 'Paved access with approved outdoor areas', vehicleRequirement: 'Coach, SUV or private vehicle',
      transferMinutes: { 'Abu Dhabi City': 115, 'Dubai City': 125, 'Al Ain': 25, 'Sharjah City': 160, 'Self-drive / no transport': 0 },
      safetyScore: 90, mobileSignal: 'Good', permitNotes: 'Confirm site-specific access, parking and guest gathering rules.',
      campLightingPotential: 66, bestFor: ['School astronomy workshop', 'Family night-sky experience', 'Moon and planets telescope night'],
      operationalNotes: 'Accessible choice for education, families and low-risk operations. Use a site with a clear horizon.',
      risks: ['Urban light glow', 'Mountain wind', 'Public-area crowding']
    },
    {
      id: 'al-mirfa', emirate: 'Abu Dhabi', name: 'Al Mirfa Coastal Desert', latitude: 24.1040, longitude: 53.4899,
      darknessScore: 76, accessType: 'Coastal desert roads', vehicleRequirement: 'SUV recommended; coach only to approved paved site',
      transferMinutes: { 'Abu Dhabi City': 155, 'Dubai City': 240, 'Al Ain': 230, 'Sharjah City': 270, 'Self-drive / no transport': 0 },
      safetyScore: 79, mobileSignal: 'Moderate', permitNotes: 'Confirm coastal access, tides/ground conditions where relevant, and approved event space.',
      campLightingPotential: 82, bestFor: ['Arabic astronomy storytelling', 'Luxury desert dinner and stargazing', 'Beginner constellation night'],
      operationalNotes: 'Useful for a quieter west-coast product; manage humidity and wind expectations.',
      risks: ['Humidity', 'Coastal haze', 'Long transfer']
    },
    {
      id: 'al-marmoom', emirate: 'Dubai', name: 'Al Marmoom Desert Conservation Area', latitude: 24.8578, longitude: 55.5417,
      darknessScore: 61, accessType: 'Managed desert reserve / approved tracks', vehicleRequirement: 'SUV / 4x4 preferred',
      transferMinutes: { 'Abu Dhabi City': 105, 'Dubai City': 50, 'Al Ain': 135, 'Sharjah City': 85, 'Self-drive / no transport': 0 },
      safetyScore: 84, mobileSignal: 'Moderate', permitNotes: 'Confirm conservation access, approved routes and commercial-event permissions.',
      campLightingPotential: 75, bestFor: ['Family night-sky experience', 'Luxury desert dinner and stargazing', 'Beginner constellation night'],
      operationalNotes: 'Strong Dubai-access option; protect conservation rules and avoid unapproved off-road operations.',
      risks: ['Dubai sky glow', 'Permit restrictions', 'Weekend demand']
    },
    {
      id: 'terra-solis-dubai', emirate: 'Dubai', name: 'Terra Solis Dubai Camp Area', latitude: 24.8180, longitude: 55.4300,
      darknessScore: 50, accessType: 'Destination camp / event venue access', vehicleRequirement: 'Coach, SUV or private vehicle subject to venue routing',
      transferMinutes: { 'Abu Dhabi City': 105, 'Dubai City': 45, 'Al Ain': 145, 'Sharjah City': 80, 'Self-drive / no transport': 0 },
      safetyScore: 90, mobileSignal: 'Good', permitNotes: 'Confirm venue booking, activity permission, music/event schedule and a dark corner away from lighting.',
      campLightingPotential: 54, bestFor: ['Luxury desert dinner and stargazing', 'Family night-sky experience', 'Moon and planets telescope night'],
      operationalNotes: 'Useful when hospitality and access matter more than pristine darkness. Position the astronomy element as guided sky storytelling or telescope demonstration.',
      risks: ['Venue lighting', 'Music/event schedule', 'Dubai sky glow', 'Not deep-sky focused']
    },
    {
      id: 'sonara-dubai', emirate: 'Dubai', name: 'Sonara Camp / Dubai Desert Camp', latitude: 24.8450, longitude: 55.6300,
      darknessScore: 60, accessType: 'Managed desert camp / reserve partner access', vehicleRequirement: 'Approved supplier transport required',
      transferMinutes: { 'Abu Dhabi City': 115, 'Dubai City': 55, 'Al Ain': 125, 'Sharjah City': 90, 'Self-drive / no transport': 0 },
      safetyScore: 88, mobileSignal: 'Moderate', permitNotes: 'Confirm commercial activity approval, guest routing and lighting control directly with the camp/reserve operator.',
      campLightingPotential: 70, bestFor: ['Luxury desert dinner and stargazing', 'Arabic astronomy storytelling', 'Family night-sky experience'],
      operationalNotes: 'Premium hospitality camp scenario. Keep astronomy promises conservative unless a dedicated low-light viewing zone is confirmed.',
      risks: ['Permit dependency', 'Camp lighting', 'Supplier availability', 'Conservation restrictions']
    },
    {
      id: 'lahbab', emirate: 'Dubai', name: 'Lahbab Desert', latitude: 24.9481, longitude: 55.7138,
      darknessScore: 63, accessType: 'Established desert camp access', vehicleRequirement: 'SUV / 4x4 required beyond paved access',
      transferMinutes: { 'Abu Dhabi City': 115, 'Dubai City': 60, 'Al Ain': 115, 'Sharjah City': 90, 'Self-drive / no transport': 0 },
      safetyScore: 85, mobileSignal: 'Good', permitNotes: 'Use approved camp partners and confirm generator/light-control agreements.',
      campLightingPotential: 70, bestFor: ['Arabic astronomy storytelling', 'Family night-sky experience', 'Moon and planets telescope night'],
      operationalNotes: 'Operationally practical with established suppliers; product quality depends strongly on camp light control.',
      risks: ['White-light spill', 'High camp density', 'Desert traffic']
    },
    {
      id: 'hatta', emirate: 'Dubai', name: 'Hatta Mountain Desert', latitude: 24.8243, longitude: 56.1130,
      darknessScore: 69, accessType: 'Mountain-road / approved viewpoints', vehicleRequirement: 'Coach only to approved paved stop; SUV for remote sites',
      transferMinutes: { 'Abu Dhabi City': 175, 'Dubai City': 115, 'Al Ain': 105, 'Sharjah City': 120, 'Self-drive / no transport': 0 },
      safetyScore: 80, mobileSignal: 'Moderate', permitNotes: 'Confirm mountain-site access, parking, group rules and weather advisories.',
      campLightingPotential: 65, bestFor: ['Wellness / spiritual group', 'Beginner constellation night', 'Private astrophotography experience'],
      operationalNotes: 'Cooler shoulder-season option with scenery; avoid unapproved roadside stopping and manage wind.',
      risks: ['Mountain roads', 'Wind', 'Limited group-safe viewpoints']
    },
    {
      id: 'mleiha', emirate: 'Sharjah', name: 'Mleiha Desert', latitude: 25.1285, longitude: 55.8478,
      darknessScore: 65, accessType: 'Heritage desert / managed attraction area', vehicleRequirement: 'Coach or SUV based on programme',
      transferMinutes: { 'Abu Dhabi City': 160, 'Dubai City': 70, 'Al Ain': 95, 'Sharjah City': 55, 'Self-drive / no transport': 0 },
      safetyScore: 88, mobileSignal: 'Good', permitNotes: 'Coordinate with heritage-site operator and confirm event/telescope permissions.',
      campLightingPotential: 74, bestFor: ['Arabic astronomy storytelling', 'School astronomy workshop', 'Family night-sky experience'],
      operationalNotes: 'Best for heritage storytelling and managed group operations; position telescopes away from visitor lighting.',
      risks: ['Site rules', 'Visitor lighting', 'Event availability']
    },
    {
      id: 'mleiha-camp', emirate: 'Sharjah', name: 'Mleiha Camp / Archaeology Centre Area', latitude: 25.1320, longitude: 55.8420,
      darknessScore: 64, accessType: 'Managed heritage camp / attraction access', vehicleRequirement: 'Coach or SUV based on confirmed programme',
      transferMinutes: { 'Abu Dhabi City': 160, 'Dubai City': 70, 'Al Ain': 95, 'Sharjah City': 55, 'Self-drive / no transport': 0 },
      safetyScore: 90, mobileSignal: 'Good', permitNotes: 'Coordinate with the site operator for astronomy activity, telescope area, timings and group rules.',
      campLightingPotential: 76, bestFor: ['School astronomy workshop', 'Arabic astronomy storytelling', 'Family night-sky experience', 'Moon and planets telescope night'],
      operationalNotes: 'Strong education and heritage option. Use it when guided interpretation, facilities and safer group management are more important than maximum darkness.',
      risks: ['Site schedule', 'Visitor lighting', 'Programme permission', 'Not remote dark sky']
    },
    {
      id: 'fossil-rock', emirate: 'Sharjah', name: 'Fossil Rock', latitude: 25.0699, longitude: 55.7804,
      darknessScore: 73, accessType: 'Desert dunes / rocky terrain', vehicleRequirement: 'SUV / 4x4 required',
      transferMinutes: { 'Abu Dhabi City': 150, 'Dubai City': 65, 'Al Ain': 110, 'Sharjah City': 65, 'Self-drive / no transport': 0 },
      safetyScore: 77, mobileSignal: 'Moderate', permitNotes: 'Confirm access, group safety boundary and off-road operating permission.',
      campLightingPotential: 83, bestFor: ['Milky Way photography', 'Private astrophotography experience', 'Meteor shower campaign'],
      operationalNotes: 'Potential dark-sky option close to Dubai/Sharjah; require experienced off-road operation.',
      risks: ['Dune access', 'Heat', 'Limited facilities']
    },
    {
      id: 'al-badayer', emirate: 'Sharjah', name: 'Al Badayer Desert', latitude: 24.9318, longitude: 55.7886,
      darknessScore: 59, accessType: 'Popular desert / roadside camps', vehicleRequirement: 'SUV / 4x4 recommended',
      transferMinutes: { 'Abu Dhabi City': 135, 'Dubai City': 55, 'Al Ain': 115, 'Sharjah City': 65, 'Self-drive / no transport': 0 },
      safetyScore: 82, mobileSignal: 'Good', permitNotes: 'Confirm final site, private setup zone and lighting control before committing to a dark-sky product.',
      campLightingPotential: 60, bestFor: ['Family night-sky experience', 'Arabic astronomy storytelling', 'Moon and planets telescope night'],
      operationalNotes: 'Convenient access but low light control can reduce deep-sky suitability.',
      risks: ['Popular dune traffic', 'Light pollution', 'Noise']
    },
    {
      id: 'al-dhaid', emirate: 'Sharjah', name: 'Al Dhaid Desert Edge', latitude: 25.2862, longitude: 55.8844,
      darknessScore: 54, accessType: 'Paved desert-edge access', vehicleRequirement: 'Coach, SUV or private vehicle',
      transferMinutes: { 'Abu Dhabi City': 155, 'Dubai City': 70, 'Al Ain': 115, 'Sharjah City': 50, 'Self-drive / no transport': 0 },
      safetyScore: 89, mobileSignal: 'Good', permitNotes: 'Use a pre-approved outdoor site with suitable parking and lighting control.',
      campLightingPotential: 60, bestFor: ['School astronomy workshop', 'Beginner constellation night', 'Family night-sky experience'],
      operationalNotes: 'Low-risk access choice for learning groups; frame as constellation and telescope experience, not dark-sky photography.',
      risks: ['Light glow', 'Agricultural lighting', 'Heat']
    },
    {
      id: 'khor-fakkan', emirate: 'Sharjah', name: 'Khor Fakkan Foothills', latitude: 25.3324, longitude: 56.3564,
      darknessScore: 55, accessType: 'Mountain/coastal roads', vehicleRequirement: 'Coach to approved paved site; SUV for remote viewpoint',
      transferMinutes: { 'Abu Dhabi City': 230, 'Dubai City': 125, 'Al Ain': 170, 'Sharjah City': 110, 'Self-drive / no transport': 0 },
      safetyScore: 80, mobileSignal: 'Moderate', permitNotes: 'Confirm public-area rules, road conditions and group-safe viewing point.',
      campLightingPotential: 56, bestFor: ['Wellness / spiritual group', 'Beginner constellation night', 'Moon and planets telescope night'],
      operationalNotes: 'Use where landscape and wellbeing are part of the product; cloud/humidity checks are especially important.',
      risks: ['Humidity', 'Mountain weather', 'Long return journey']
    },
    {
      id: 'kalba', emirate: 'Sharjah', name: 'Kalba Foothills', latitude: 24.9910, longitude: 56.3561,
      darknessScore: 52, accessType: 'Mountain / coastal edge roads', vehicleRequirement: 'Coach to approved stop; SUV for remote sites',
      transferMinutes: { 'Abu Dhabi City': 225, 'Dubai City': 120, 'Al Ain': 165, 'Sharjah City': 110, 'Self-drive / no transport': 0 },
      safetyScore: 81, mobileSignal: 'Moderate', permitNotes: 'Confirm conservation and site-specific operating access.',
      campLightingPotential: 54, bestFor: ['Family night-sky experience', 'Wellness / spiritual group', 'Moon and planets telescope night'],
      operationalNotes: 'Scenic alternative where astronomy is one part of a broader nature experience.',
      risks: ['Humidity', 'Cloud build-up', 'Public lighting']
    },
    {
      id: 'ddcr-edge', emirate: 'Dubai', name: 'Dubai Desert Conservation Reserve Edge', latitude: 24.8731, longitude: 55.6549,
      darknessScore: 70, accessType: 'Controlled desert reserve', vehicleRequirement: 'Approved 4x4 operator only',
      transferMinutes: { 'Abu Dhabi City': 110, 'Dubai City': 60, 'Al Ain': 120, 'Sharjah City': 95, 'Self-drive / no transport': 0 },
      safetyScore: 88, mobileSignal: 'Moderate', permitNotes: 'Commercial activities require reserve/operator approval; do not sell access without a confirmed partner.',
      campLightingPotential: 80, bestFor: ['Luxury desert dinner and stargazing', 'Private astrophotography experience', 'Arabic astronomy storytelling'],
      operationalNotes: 'Premium access option only with approved reserve partner and strict environmental operating standards.',
      risks: ['Permit dependency', 'Partner availability', 'Conservation restrictions']
    },
    {
      id: 'al-qudra', emirate: 'Dubai', name: 'Al Qudra Lakes Desert Edge', latitude: 24.8216, longitude: 55.4464,
      darknessScore: 48, accessType: 'Paved / popular outdoor access', vehicleRequirement: 'Coach, SUV or private vehicle',
      transferMinutes: { 'Abu Dhabi City': 100, 'Dubai City': 45, 'Al Ain': 145, 'Sharjah City': 75, 'Self-drive / no transport': 0 },
      safetyScore: 90, mobileSignal: 'Good', permitNotes: 'Use an approved, low-disturbance site and respect public-area rules.',
      campLightingPotential: 48, bestFor: ['Family night-sky experience', 'School astronomy workshop', 'Moon and planets telescope night'],
      operationalNotes: 'Accessible low-risk beginner location; do not market as a pristine deep-sky site.',
      risks: ['Light pollution', 'Public activity', 'Wildlife disturbance']
    },
    {
      id: 'al-ain-oasis-edge', emirate: 'Abu Dhabi', name: 'Al Ain Desert Edge', latitude: 24.1740, longitude: 55.7660,
      darknessScore: 50, accessType: 'Paved desert edge', vehicleRequirement: 'Coach, SUV or private vehicle',
      transferMinutes: { 'Abu Dhabi City': 120, 'Dubai City': 125, 'Al Ain': 30, 'Sharjah City': 165, 'Self-drive / no transport': 0 },
      safetyScore: 90, mobileSignal: 'Good', permitNotes: 'Confirm private event site or approved outdoor operating zone.',
      campLightingPotential: 58, bestFor: ['School astronomy workshop', 'Arabic astronomy storytelling', 'Family night-sky experience'],
      operationalNotes: 'Easy operational choice for Al Ain departure groups; treat darkness as moderate.',
      risks: ['Light glow', 'Heat', 'Public access']
    }
  ],
  products: {
    'beginner-constellation': { label: 'Beginner constellation night', short: 'Constellation night', primary: 'constellation', requiredEquipment: ['Naked-eye and laser pointer'], idealDarkness: 45, moonSensitive: 'medium' },
    'milky-way': { label: 'Milky Way photography', short: 'Milky Way photography', primary: 'milky', requiredEquipment: ['Astrophotography setup'], idealDarkness: 75, moonSensitive: 'high' },
    'moon-planets': { label: 'Moon and planets telescope night', short: 'Moon & planets', primary: 'moon', requiredEquipment: ['Planet telescope'], idealDarkness: 35, moonSensitive: 'positive' },
    'arabic-astronomy': { label: 'Arabic astronomy storytelling', short: 'Arabic astronomy', primary: 'story', requiredEquipment: ['Naked-eye and laser pointer'], idealDarkness: 45, moonSensitive: 'low' },
    'luxury-dinner': { label: 'Luxury desert dinner and stargazing', short: 'Luxury dinner', primary: 'luxury', requiredEquipment: ['Small telescope'], idealDarkness: 50, moonSensitive: 'medium' },
    'school-workshop': { label: 'School astronomy workshop', short: 'School workshop', primary: 'school', requiredEquipment: ['Small telescope'], idealDarkness: 35, moonSensitive: 'low' },
    'meteor-shower': { label: 'Meteor shower campaign', short: 'Meteor campaign', primary: 'meteor', requiredEquipment: ['Naked-eye and laser pointer'], idealDarkness: 75, moonSensitive: 'high' },
    'private-astro': { label: 'Private astrophotography experience', short: 'Private astrophotography', primary: 'astro', requiredEquipment: ['Astrophotography setup'], idealDarkness: 75, moonSensitive: 'high' },
    'family-night': { label: 'Family night-sky experience', short: 'Family night-sky', primary: 'family', requiredEquipment: ['Naked-eye and laser pointer'], idealDarkness: 45, moonSensitive: 'medium' }
  },
  originOptions: ['Abu Dhabi City', 'Dubai City', 'Al Ain', 'Sharjah City', 'Self-drive / no transport'],
  seasons: {
    winter: { label: 'Winter', months: [12, 1, 2], note: 'Cooler evenings, stronger comfort, and classic winter constellations.' },
    spring: { label: 'Spring', months: [3, 4, 5], note: 'Shoulder-season nights with improving Milky Way planning potential later in the season.' },
    summer: { label: 'Summer', months: [6, 7, 8], note: 'Milky Way season, but heat, humidity, haze and guest comfort need tighter controls.' },
    autumn: { label: 'Autumn', months: [9, 10, 11], note: 'Early-evening Milky Way tail and improving comfort as heat reduces.' }
  },
  constellationGuide: [
    {
      id: 'orion', name: 'Orion', season: 'winter', months: [12, 1, 2, 3],
      appears: 'Rises in the east during early evening in winter and moves high across the southern sky.',
      disappears: 'Sets toward the west late night; by late spring it becomes difficult after sunset.',
      guideStory: 'Use Orion as the main visual anchor for star colours, the three-star belt, and how guests can orient themselves in the winter sky.',
      bestWindow: 'December to February evening programmes'
    },
    {
      id: 'taurus', name: 'Taurus', season: 'winter', months: [11, 12, 1, 2, 3],
      appears: 'Visible from late autumn into winter, usually near Orion in the evening sky.',
      disappears: 'Moves west and becomes less useful for evening tours during spring.',
      guideStory: 'Connect Taurus with the bright star Aldebaran, winter navigation, and the nearby Pleiades cluster.',
      bestWindow: 'November to February'
    },
    {
      id: 'pleiades', name: 'Pleiades', season: 'winter', months: [10, 11, 12, 1, 2, 3],
      appears: 'A small star cluster visible in the evening from autumn through winter.',
      disappears: 'Drops lower in the western sky during spring evenings.',
      guideStory: 'A strong beginner object: ask guests how many stars they can count, then explain cluster viewing with naked eye or binoculars.',
      bestWindow: 'October to February'
    },
    {
      id: 'leo', name: 'Leo', season: 'spring', months: [2, 3, 4, 5, 6],
      appears: 'Rises in the east during late winter and becomes a strong evening target in spring.',
      disappears: 'Moves west after midnight and fades from prime evening use by early summer.',
      guideStory: 'Use the sickle shape as a simple pattern-recognition exercise and connect it to seasonal sky movement.',
      bestWindow: 'March to May'
    },
    {
      id: 'virgo', name: 'Virgo', season: 'spring', months: [3, 4, 5, 6, 7],
      appears: 'A spring constellation rising after Leo, with Spica as the main guide star.',
      disappears: 'Shifts west through summer and becomes less useful for short family sessions.',
      guideStory: 'Use Spica for orientation and explain why some constellations are better for storytelling than photography.',
      bestWindow: 'April to June'
    },
    {
      id: 'ursa-major', name: 'Ursa Major', season: 'spring', months: [1, 2, 3, 4, 5, 6],
      appears: 'Useful in the northern sky through winter and spring, especially for orientation.',
      disappears: 'Remains partly useful but can be lower depending on site horizon and viewing time.',
      guideStory: 'Use the Big Dipper pattern to teach guests how guides find north and build sky orientation confidence.',
      bestWindow: 'February to May'
    },
    {
      id: 'scorpius', name: 'Scorpius', season: 'summer', months: [5, 6, 7, 8, 9],
      appears: 'Rises in the southeast from late spring and becomes a major summer evening target.',
      disappears: 'Sets toward the southwest later in the night; by autumn it becomes an early-evening low target.',
      guideStory: 'Use Antares, the red heart of the scorpion, and connect the constellation to the Milky Way core region.',
      bestWindow: 'June to August'
    },
    {
      id: 'sagittarius', name: 'Sagittarius', season: 'summer', months: [6, 7, 8, 9, 10],
      appears: 'Visible low in the southern sky during summer evenings, near the Milky Way core.',
      disappears: 'Moves to the southwest and becomes low early in autumn evenings.',
      guideStory: 'Explain the “teapot” shape and why this direction is important for Milky Way photography planning.',
      bestWindow: 'June to September'
    },
    {
      id: 'summer-triangle', name: 'Summer Triangle', season: 'summer', months: [6, 7, 8, 9, 10],
      appears: 'Climbs into the evening sky during summer and remains useful into autumn.',
      disappears: 'Moves west later in autumn and is less central in winter sessions.',
      guideStory: 'Use Vega, Deneb, and Altair as a simple three-point navigation story for mixed beginner groups.',
      bestWindow: 'July to October'
    },
    {
      id: 'pegasus', name: 'Pegasus', season: 'autumn', months: [8, 9, 10, 11, 12],
      appears: 'Rises in the east during late summer and becomes a strong autumn evening target.',
      disappears: 'Moves west through winter and becomes less central after midnight.',
      guideStory: 'Use the Great Square as an easy geometry exercise for guests and a bridge to Andromeda.',
      bestWindow: 'September to November'
    },
    {
      id: 'andromeda', name: 'Andromeda', season: 'autumn', months: [8, 9, 10, 11, 12],
      appears: 'Visible in autumn evenings, connected visually to Pegasus.',
      disappears: 'Moves west through winter; deep-sky viewing depends heavily on darkness and Moon conditions.',
      guideStory: 'Discuss the Andromeda Galaxy only with careful expectation-setting: it is a faint object, not a bright photo-like view.',
      bestWindow: 'September to November'
    },
    {
      id: 'cassiopeia', name: 'Cassiopeia', season: 'autumn', months: [8, 9, 10, 11, 12, 1],
      appears: 'A useful W-shaped northern-sky pattern in autumn and early winter evenings.',
      disappears: 'Remains useful for orientation but changes position through the night.',
      guideStory: 'Use the W shape for beginner recognition, north-sky orientation, and storytelling when deep-sky visibility is weak.',
      bestWindow: 'September to January'
    }
  ],
  meteorWindows: [
    { id: 'quadrantids', name: 'Quadrantids', month: 1, day: 3, activeStart: '12-28', activeEnd: '01-12', zhr: 110, strength: 'Strong but narrow peak', radiant: 'Boötes / northern sky', notes: 'Short peak window; best when Moon and cloud are low.' },
    { id: 'lyrids', name: 'Lyrids', month: 4, day: 22, activeStart: '04-14', activeEnd: '04-30', zhr: 18, strength: 'Medium annual shower', radiant: 'Lyra / north-east after rise', notes: 'Useful for storytelling; do not oversell high meteor counts.' },
    { id: 'eta-aquariids', name: 'Eta Aquariids', month: 5, day: 5, activeStart: '04-19', activeEnd: '05-28', zhr: 50, strength: 'Strong, better pre-dawn', radiant: 'Aquarius / eastern pre-dawn sky', notes: 'Best after midnight/pre-dawn; less suitable for early family sessions.' },
    { id: 'southern-delta-aquariids', name: 'Southern Delta Aquariids', month: 7, day: 30, activeStart: '07-12', activeEnd: '08-23', zhr: 25, strength: 'Medium southern-sky shower', radiant: 'Aquarius / southern sky', notes: 'Useful for UAE summer meteor campaigns when Moon and haze cooperate.' },
    { id: 'alpha-capricornids', name: 'Alpha Capricornids', month: 7, day: 30, activeStart: '07-03', activeEnd: '08-15', zhr: 5, strength: 'Low rate, bright fireballs possible', radiant: 'Capricornus / southern sky', notes: 'Good as a secondary story, not a main high-count promise.' },
    { id: 'perseids', name: 'Perseids', month: 8, day: 12, activeStart: '07-17', activeEnd: '08-24', zhr: 100, strength: 'Major annual shower', radiant: 'Perseus / north-east late night', notes: 'Flagship meteor campaign candidate when Moon and haze are favourable.' },
    { id: 'orionids', name: 'Orionids', month: 10, day: 21, activeStart: '10-02', activeEnd: '11-07', zhr: 20, strength: 'Medium swift shower', radiant: 'Orion / east after rise', notes: 'Best later at night; combine with Orion storytelling.' },
    { id: 'leonids', name: 'Leonids', month: 11, day: 17, activeStart: '11-06', activeEnd: '11-30', zhr: 15, strength: 'Variable annual shower', radiant: 'Leo / after midnight', notes: 'Good educational story; peak rates vary by year.' },
    { id: 'geminids', name: 'Geminids', month: 12, day: 14, activeStart: '12-04', activeEnd: '12-20', zhr: 120, strength: 'Major annual shower', radiant: 'Gemini / evening to late night', notes: 'Strong management-calendar candidate; check Moon and cloud before promotion.' },
    { id: 'ursids', name: 'Ursids', month: 12, day: 22, activeStart: '12-17', activeEnd: '12-26', zhr: 10, strength: 'Minor annual shower', radiant: 'Ursa Minor / northern sky', notes: 'Backup winter meteor story, not a primary sales promise.' }
  ]
};
