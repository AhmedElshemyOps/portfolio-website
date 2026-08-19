/*
  InfraSky — UAE Stargazing Revenue, Sales and Operations Intelligence System
  Static front-end MVP: local astronomy planning model + optional Open-Meteo forecast calls.
  The application intentionally labels forecasts versus planning estimates and does not guarantee visibility.
*/
'use strict';

(function initInfraSkyApp() {
  const DATA = window.INFRASKY_DATA;
  if (!DATA || !Array.isArray(DATA.locations)) return;

  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const DAY = 86400000;
  const HISTORY_KEY = 'infrasky_plan_history_v1';
  const TZ = 'Asia/Dubai';
  const statusOrder = { 'EXCELLENT': 5, 'SELL': 4, 'WATCH': 3, 'AVOID': 2, 'NO-GO': 1 };

  const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
  const round = (value) => Math.round(value);
  const rad = (value) => value * Math.PI / 180;
  const deg = (value) => value * 180 / Math.PI;
  const pad = (value) => String(Math.round(value)).padStart(2, '0');

  function dubaiDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const map = Object.fromEntries(parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
    return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
  }

  function localIsoToday() {
    const { year, month, day } = dubaiDateParts();
    return `${year}-${pad(month)}-${pad(day)}`;
  }

  function dateFromIso(value) {
    const [y, m, d] = String(value || localIsoToday()).split('-').map(Number);
    return new Date(Date.UTC(y || 2026, (m || 1) - 1, d || 1, 12, 0, 0));
  }

  function isoFromDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function dayDifference(dateValue) {
    const target = dateFromIso(dateValue).getTime();
    const today = dateFromIso(localIsoToday()).getTime();
    return Math.round((target - today) / DAY);
  }

  function dateLabel(value) {
    return new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(dateFromIso(value));
  }

  function minutesToTime(minutes) {
    const normal = ((Math.round(minutes) % 1440) + 1440) % 1440;
    return `${pad(Math.floor(normal / 60))}:${pad(normal % 60)}`;
  }

  function minutesToLongTime(minutes) {
    const normal = ((Math.round(minutes) % 1440) + 1440) % 1440;
    const hour = Math.floor(normal / 60);
    const minute = normal % 60;
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).format(new Date(Date.UTC(2026, 0, 1, hour - 4, minute)));
  }

  function timeToMinutes(value, fallback) {
    if (!value || !/^\d{2}:\d{2}$/.test(value)) return fallback;
    const [hour, minute] = value.split(':').map(Number);
    return hour * 60 + minute;
  }

  function dayOfYear(date) {
    const year = date.getUTCFullYear();
    const start = Date.UTC(year, 0, 0);
    return Math.floor((date.getTime() - start) / DAY);
  }

  // NOAA-inspired solar approximation. Suitable for operational planning; not a navigation tool.
  function solarDeclinationAndEqTime(date) {
    const gamma = 2 * Math.PI / 365 * (dayOfYear(date) - 1 + 0.5);
    const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
      - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma)
      - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma)
      - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
    return { decl, eqtime };
  }

  function solarTimeMinutes(date, latitude, longitude, altitude = -0.833, isSet = true) {
    const { decl, eqtime } = solarDeclinationAndEqTime(date);
    const lat = rad(latitude);
    const solarAltitude = rad(altitude);
    let cosHourAngle = (Math.cos(Math.PI / 2 - solarAltitude) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
    cosHourAngle = clamp(cosHourAngle, -1, 1);
    const hourAngle = deg(Math.acos(cosHourAngle));
    const solarNoon = 720 - (4 * longitude) - eqtime + (4 * 60); // UTC+4 / no DST
    return solarNoon + (isSet ? 4 * hourAngle : -4 * hourAngle);
  }

  function astronomyFor(dateValue, location) {
    const date = dateFromIso(dateValue);
    const sunset = solarTimeMinutes(date, location.latitude, location.longitude, -0.833, true);
    const civilEnd = solarTimeMinutes(date, location.latitude, location.longitude, -6, true);
    const nauticalEnd = solarTimeMinutes(date, location.latitude, location.longitude, -12, true);
    const astroEnd = solarTimeMinutes(date, location.latitude, location.longitude, -18, true);
    const sunrise = solarTimeMinutes(date, location.latitude, location.longitude, -0.833, false);

    // Synodic-age approximation, deliberately labelled as an astronomy planning estimate in the UI.
    const newMoonEpoch = Date.UTC(2000, 0, 6, 18, 14, 0);
    const synodic = 29.53058867;
    const age = (((date.getTime() - newMoonEpoch) / DAY) % synodic + synodic) % synodic;
    const illumination = clamp((1 - Math.cos((2 * Math.PI * age) / synodic)) * 50, 0, 100);
    const phaseName = age < 1.85 ? 'New Moon' : age < 7.38 ? 'Waxing Crescent' : age < 11.07 ? 'First Quarter' : age < 14.77 ? 'Waxing Gibbous' : age < 16.61 ? 'Full Moon' : age < 22.15 ? 'Waning Gibbous' : age < 25.84 ? 'Last Quarter' : 'Waning Crescent';
    const moonrise = (360 + age * 50.8) % 1440;
    const moonset = (moonrise + 745) % 1440;
    const month = date.getUTCMonth() + 1;
    const guideConstellations = (DATA.constellationGuide || []).filter((item) => item.months.includes(month));
    const constellations = guideConstellations.length ? guideConstellations.map((item) => item.name).slice(0, 4)
      : month <= 2 || month === 12 ? ['Orion', 'Taurus', 'Pleiades']
        : month <= 4 ? ['Leo', 'Virgo', 'Ursa Major']
          : month <= 8 ? ['Scorpius', 'Sagittarius', 'Summer Triangle']
            : ['Pegasus', 'Andromeda', 'Cassiopeia'];
    const milkySeason = month >= 3 && month <= 10;
    const milkyWindow = milkySeason ? (month <= 5 ? 'Late night to pre-dawn' : month <= 8 ? 'Evening through late night' : 'Early evening, low south-west') : 'Not a primary UAE Milky Way season';
    const nearestMeteor = DATA.meteorWindows.map((event) => {
      const candidate = new Date(Date.UTC(date.getUTCFullYear(), event.month - 1, event.day, 12));
      return { ...event, delta: Math.abs(Math.round((candidate - date) / DAY)) };
    }).sort((a, b) => a.delta - b.delta)[0];
    const activeMeteors = activeMeteorShowers(dateValue);
    const meteorSuitability = nearestMeteor.delta <= 2 ? `${nearestMeteor.name} peak window` : nearestMeteor.delta <= 10 ? `${nearestMeteor.name} campaign window` : activeMeteors.length ? `${activeMeteors.map((item) => item.name).slice(0, 2).join(' + ')} active window` : `No major peak within 10 days`;

    return {
      sunrise, sunset, civilEnd, nauticalEnd, astroEnd,
      moonAge: age, moonIllumination: illumination, moonPhase: phaseName, moonrise, moonset,
      constellations, guideConstellations, milkySeason, milkyWindow, nearestMeteor, meteorSuitability,
      planetNote: 'Planet visibility is a planning target only. Confirm altitude and actual object availability with the on-site astronomy app before service.'
    };
  }

  function dayOfYearFromMonthDay(year, monthDay) {
    const [month, day] = monthDay.split('-').map(Number);
    return dayOfYear(new Date(Date.UTC(year, month - 1, day || 1, 12)));
  }

  function activeMeteorShowers(dateValue) {
    const date = dateFromIso(dateValue);
    const year = date.getUTCFullYear();
    const doy = dayOfYear(date);
    return (DATA.meteorWindows || []).filter((event) => {
      const start = dayOfYearFromMonthDay(year, event.activeStart || `${pad(event.month)}-${pad(event.day)}`);
      const end = dayOfYearFromMonthDay(year, event.activeEnd || `${pad(event.month)}-${pad(event.day)}`);
      return start <= end ? doy >= start && doy <= end : doy >= start || doy <= end;
    }).map((event) => {
      const peak = new Date(Date.UTC(year, event.month - 1, event.day, 12));
      return { ...event, delta: Math.abs(Math.round((peak - date) / DAY)) };
    }).sort((a, b) => a.delta - b.delta || (b.zhr || 0) - (a.zhr || 0));
  }

  function constellationBestTime(item, analysisOrInput) {
    const input = analysisOrInput.input || analysisOrInput;
    const location = analysisOrInput.location || getLocation(input.locationId);
    const astro = analysisOrInput.astro || astronomyFor(input.date, location);
    const month = dateFromIso(input.date).getUTCMonth() + 1;
    const seasonMatch = item.months.includes(month);
    const baseStart = Math.max(astro.nauticalEnd + 10, astro.astroEnd - 20);
    const lateBias = item.id === 'orion' || item.id === 'taurus' ? 20 : item.id === 'scorpius' || item.id === 'sagittarius' ? 35 : item.id === 'ursa-major' ? 0 : 15;
    return {
      ...item,
      fit: seasonMatch ? 92 : 42,
      bestTime: minutesToTime(baseStart + lateBias),
      direction: item.id === 'ursa-major' || item.id === 'cassiopeia' ? 'North' : item.id === 'scorpius' || item.id === 'sagittarius' ? 'South / south-east' : item.id === 'pegasus' || item.id === 'andromeda' ? 'East to overhead' : 'East to south'
    };
  }

  function bestConstellationPlan(analysisOrInput) {
    const input = analysisOrInput.input || analysisOrInput;
    const month = dateFromIso(input.date).getUTCMonth() + 1;
    const candidates = (DATA.constellationGuide || [])
      .filter((item) => item.months.includes(month))
      .map((item) => constellationBestTime(item, analysisOrInput))
      .sort((a, b) => b.fit - a.fit);
    return candidates[0] || constellationBestTime((DATA.constellationGuide || [])[0] || { name: 'Bright anchor stars', months: [month], guideStory: 'Use the brightest available stars for orientation.', bestWindow: 'Confirm on site' }, analysisOrInput);
  }

  function operationLabel(status) {
    if (status === 'EXCELLENT' || status === 'SELL') return 'GO SHOW';
    if (status === 'WATCH') return 'WATCH / RECONFIRM';
    return 'NO SHOW';
  }

  function dataSourceMode(input, weather) {
    const days = dayDifference(input.date);
    if (weather.isForecast || weather.isAirForecast) return 'Live public forecast window';
    if (days >= 0 && days <= 16) return 'Forecast unavailable fallback';
    return 'Annual planning estimate';
  }

  function seasonKeyForMonth(month) {
    if ([12, 1, 2].includes(month)) return 'winter';
    if ([3, 4, 5].includes(month)) return 'spring';
    if ([6, 7, 8].includes(month)) return 'summer';
    return 'autumn';
  }

  function seasonForDate(dateValue) {
    const month = dateFromIso(dateValue).getUTCMonth() + 1;
    const key = seasonKeyForMonth(month);
    return { key, ...(DATA.seasons?.[key] || { label: key, note: '' }) };
  }

  function skyAppearance(analysis) {
    const cloud = analysis.weather.cloud;
    const dust = analysis.components.dust;
    const moon = analysis.astro.moonIllumination;
    const product = analysis.product.primary;
    let headline = 'Balanced desert-sky session';
    let visual = 'Guests should expect a guided night-sky experience with visible anchor stars and condition-aware storytelling rather than a guaranteed photo-like sky.';
    if (cloud >= 75) {
      headline = 'Cloud-limited sky';
      visual = 'The sky may look mostly muted or broken by cloud. The guide should shift toward storytelling, telescope demonstration only where possible, and expectation control.';
    } else if (dust < 45 || analysis.weather.visibility < 5) {
      headline = 'Hazy desert sky';
      visual = 'The sky may appear washed out, with fewer faint stars. Bright constellations, Moon/planet work, and cultural sky stories are safer than deep-sky promises.';
    } else if (moon >= 75 && analysis.astro.moonUp) {
      headline = 'Bright Moon night';
      visual = 'The Moon will brighten the sky and reduce faint stars. It can be beautiful for lunar storytelling and telescope moments, but weak for Milky Way or meteor claims.';
    } else if ((product === 'milky' || product === 'astro') && analysis.location.darknessScore >= 75 && analysis.astro.milkySeason && moon < 35) {
      headline = 'Deep-sky candidate night';
      visual = 'If cloud and haze stay low on site, guests may experience a darker sky with stronger Milky Way planning potential. Photography still depends on real visibility and equipment.';
    } else if (analysis.location.darknessScore < 58) {
      headline = 'Accessible beginner sky';
      visual = 'The sky will be better for orientation, Moon/planet work, and simple constellation recognition than for faint deep-sky viewing.';
    }
    return { headline, visual };
  }

  function constellationCards(analysis) {
    const month = dateFromIso(analysis.input.date).getUTCMonth() + 1;
    return (DATA.constellationGuide || [])
      .filter((item) => item.months.includes(month))
      .slice(0, 4);
  }

  function guideNarrativePlan(analysis) {
    const cards = constellationCards(analysis);
    const first = cards[0];
    const second = cards[1];
    const deepSkySensitive = ['milky', 'astro', 'meteor'].includes(analysis.product.primary);
    return [
      `Open with expectation control: explain that this is a natural-sky session affected by cloud, haze, Moon brightness and site lighting.`,
      first ? `Use ${first.name} first: ${first.guideStory}` : `Start with the brightest available stars and basic desert-sky orientation.`,
      second ? `Add ${second.name} as the second story layer: ${second.guideStory}` : `Keep the second layer flexible based on what is actually visible on site.`,
      deepSkySensitive ? `If faint sky detail is weak, switch from deep-sky promise to orientation, Moon/planet viewing, camera basics and cultural sky stories.` : `Keep the session practical: short visual anchors, guest questions, telescope or binocular moments, and comfort checks.`,
      `Close by linking the sky back to navigation, seasons, guest memory, and responsible tourism promise control.`
    ];
  }

  function skyStoryReport(analysis) {
    const appearance = skyAppearance(analysis);
    const season = seasonForDate(analysis.input.date);
    const cards = constellationCards(analysis);
    const lines = [];
    lines.push(`INFRA SKY · VISUAL SKY & GUIDE STORY REPORT`);
    lines.push(`Date: ${dateLabel(analysis.input.date)}`);
    lines.push(`Season: ${season.label} · ${season.note}`);
    lines.push(`Location: ${analysis.location.name} · Darkness ${analysis.location.darknessScore}/100`);
    lines.push(`Decision: ${analysis.status} · Score ${analysis.score} · ${analysis.confidence} confidence`);
    lines.push('');
    lines.push(`HOW THE SKY MAY FEEL`);
    lines.push(`${appearance.headline}: ${appearance.visual}`);
    lines.push('');
    lines.push(`MOON AND DARKNESS`);
    lines.push(`${analysis.astro.moonPhase}, about ${round(analysis.astro.moonIllumination)}% illuminated. Estimated Moon rise/set: ${minutesToTime(analysis.astro.moonrise)} / ${minutesToTime(analysis.astro.moonset)}. Astronomical darkness starts around ${minutesToTime(analysis.astro.astroEnd)}.`);
    lines.push('');
    lines.push(`CONSTELLATION WINDOWS`);
    if (cards.length) {
      cards.forEach((item) => {
        lines.push(`- ${item.name}: ${item.bestWindow}. Appears: ${item.appears} Disappears: ${item.disappears}`);
      });
    } else {
      lines.push('- No constellation guide entry is configured for this date. Use live sky confirmation before service.');
    }
    lines.push('');
    lines.push(`TEXT SKY MAP FOR THE GUIDE`);
    lines.push(`- Start orientation after astronomical darkness: ${minutesToTime(analysis.astro.astroEnd)}.`);
    lines.push(`- Face guests toward the clearest open horizon first; avoid bright camp lights and vehicle headlights.`);
    lines.push(`- Use the first visible bright constellation as the anchor, then move from large patterns to telescope/binocular objects.`);
    lines.push(`- If Moon illumination is high, place Moon/planet storytelling before faint-star promises.`);
    lines.push('');
    lines.push(`WHAT THE GUIDE SHOULD EXPLAIN`);
    guideNarrativePlan(analysis).forEach((item, index) => lines.push(`${index + 1}. ${item}`));
    lines.push('');
    lines.push(`SALES / OPERATIONS BOUNDARY`);
    lines.push(`Do not describe the sky as guaranteed. Confirm real visibility on site and re-check forecast 72 and 24 hours before service.`);
    return lines.join('\n');
  }

  function seasonWeather(dateValue) {
    const month = dateFromIso(dateValue).getUTCMonth() + 1;
    if ([12, 1, 2].includes(month)) return { cloud: 24, rain: 8, humidity: 58, wind: 13, temperature: 21, visibility: 12, pm10: 55, aod: 0.18, dust: 34, source: 'Estimated planning model · cool-season profile' };
    if ([3, 4, 5].includes(month)) return { cloud: 15, rain: 4, humidity: 48, wind: 16, temperature: 28, visibility: 10, pm10: 78, aod: 0.24, dust: 52, source: 'Estimated planning model · shoulder-season profile' };
    if ([6, 7, 8].includes(month)) return { cloud: 10, rain: 2, humidity: 68, wind: 19, temperature: 35, visibility: 7, pm10: 112, aod: 0.37, dust: 91, source: 'Estimated planning model · summer heat/haze profile' };
    return { cloud: 18, rain: 4, humidity: 52, wind: 15, temperature: 30, visibility: 9, pm10: 85, aod: 0.28, dust: 63, source: 'Estimated planning model · autumn profile' };
  }

  function pickHourlyValue(dataset, targetDate, targetMinutes, key, fallback) {
    const times = dataset?.hourly?.time || [];
    const values = dataset?.hourly?.[key] || [];
    const targetHour = Math.max(0, Math.min(23, Math.round(targetMinutes / 60)));
    const expected = `${targetDate}T${pad(targetHour)}:00`;
    const direct = times.indexOf(expected);
    if (direct >= 0 && Number.isFinite(Number(values[direct]))) return Number(values[direct]);
    const sameDay = times.findIndex((time) => String(time).startsWith(targetDate));
    if (sameDay >= 0 && Number.isFinite(Number(values[sameDay]))) return Number(values[sameDay]);
    return fallback;
  }

  async function fetchConditionData(location, dateValue, targetMinutes) {
    const planned = seasonWeather(dateValue);
    const daysAway = dayDifference(dateValue);
    if (daysAway < 0 || daysAway > 15) {
      return { ...planned, isForecast: false, isAirForecast: false, source: `${planned.source}. Live forecast is not available for this date; re-check 72 and 24 hours before operation.` };
    }

    const weatherQuery = new URLSearchParams({
      latitude: location.latitude, longitude: location.longitude,
      hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,cloud_cover,wind_speed_10m,visibility,weather_code',
      timezone: TZ, forecast_days: '16'
    });
    const airQuery = new URLSearchParams({
      latitude: location.latitude, longitude: location.longitude,
      hourly: 'pm10,pm2_5,aerosol_optical_depth,dust', timezone: TZ, forecast_days: '5'
    });

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?${weatherQuery.toString()}`;
    const airUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?${airQuery.toString()}`;
    const [weatherResult, airResult] = await Promise.allSettled([
      fetch(weatherUrl, { cache: 'no-store' }).then((response) => response.ok ? response.json() : Promise.reject(new Error(`Weather HTTP ${response.status}`))),
      fetch(airUrl, { cache: 'no-store' }).then((response) => response.ok ? response.json() : Promise.reject(new Error(`Air HTTP ${response.status}`)))
    ]);

    const weatherOk = weatherResult.status === 'fulfilled';
    const airOk = airResult.status === 'fulfilled';
    const weatherJson = weatherOk ? weatherResult.value : null;
    const airJson = airOk ? airResult.value : null;

    const result = {
      cloud: pickHourlyValue(weatherJson, dateValue, targetMinutes, 'cloud_cover', planned.cloud),
      rain: pickHourlyValue(weatherJson, dateValue, targetMinutes, 'precipitation_probability', planned.rain),
      humidity: pickHourlyValue(weatherJson, dateValue, targetMinutes, 'relative_humidity_2m', planned.humidity),
      wind: pickHourlyValue(weatherJson, dateValue, targetMinutes, 'wind_speed_10m', planned.wind),
      temperature: pickHourlyValue(weatherJson, dateValue, targetMinutes, 'temperature_2m', planned.temperature),
      visibility: pickHourlyValue(weatherJson, dateValue, targetMinutes, 'visibility', planned.visibility * 1000) / 1000,
      pm10: pickHourlyValue(airJson, dateValue, targetMinutes, 'pm10', planned.pm10),
      pm25: pickHourlyValue(airJson, dateValue, targetMinutes, 'pm2_5', Math.round(planned.pm10 * .35)),
      aod: pickHourlyValue(airJson, dateValue, targetMinutes, 'aerosol_optical_depth', planned.aod),
      dust: pickHourlyValue(airJson, dateValue, targetMinutes, 'dust', planned.dust),
      isForecast: weatherOk,
      isAirForecast: airOk,
      source: weatherOk && airOk ? 'Forecast + air-quality forecast (Open‑Meteo)' : weatherOk ? 'Weather forecast + estimated air-quality fallback' : airOk ? 'Air-quality forecast + estimated weather fallback' : `${planned.source}. Forecast unavailable; conservative planning values used.`,
      errors: [weatherOk ? null : 'Weather forecast unavailable', airOk ? null : 'Air-quality forecast unavailable'].filter(Boolean)
    };
    return result;
  }

  function getInput() {
    const equipment = $$('input[name="equipment"]:checked').map((box) => box.value);
    const specialNotes = $$('input[name="operational-flag"]:checked').map((box) => box.value);
    return {
      locationId: $('skyLocation').value,
      date: $('skyDate').value || localIsoToday(),
      pax: Math.max(1, Number($('skyPax').value || 1)),
      guestType: $('guestType').value,
      experienceType: $('experienceType').value,
      language: $('skyLanguage').value,
      origin: $('pickupOrigin').value,
      earliestStart: $('earliestStart').value || '19:30',
      latestFinish: $('latestFinish').value || '23:00',
      transport: $('transportMode').value,
      riskTolerance: $('riskTolerance').value,
      campLighting: $('campLighting').value,
      equipment,
      guideLevel: $('guideLevel').value,
      notes: $('operationalNotes').value.trim(),
      specialNotes
    };
  }

  function calcComfort(weather, input) {
    const idealMax = ['Family with children', 'School / educational group', 'VIP private group'].includes(input.guestType) ? 29 : 32;
    let score = 100;
    if (weather.temperature > idealMax) score -= (weather.temperature - idealMax) * 7;
    if (weather.temperature < 15) score -= (15 - weather.temperature) * 4;
    if (weather.humidity > 65) score -= (weather.humidity - 65) * .6;
    if (weather.wind > 28) score -= (weather.wind - 28) * 1.2;
    return round(clamp(score));
  }

  function calcDust(weather) {
    const pmPenalty = Math.max(0, weather.pm10 - 25) * .38;
    const aodPenalty = Math.max(0, weather.aod - .12) * 70;
    const visibilityPenalty = Math.max(0, 9 - weather.visibility) * 6;
    return round(clamp(100 - pmPenalty - aodPenalty - visibilityPenalty));
  }

  function calcTransport(location, input) {
    const requires4x4 = /4x4|SUV/i.test(location.vehicleRequirement) && !/Coach or SUV|Coach, SUV/i.test(location.vehicleRequirement);
    const selected = input.transport;
    if (requires4x4 && selected === 'Coach') return 18;
    if (requires4x4 && selected === 'Self-drive / no transport') return 48;
    if (requires4x4 && selected === 'Private luxury vehicle') return 35;
    if (requires4x4 && selected === 'SUV / 4x4') return 96;
    if (/Coach/.test(location.vehicleRequirement) && selected === 'Coach') return 92;
    if (selected === 'Self-drive / no transport') return 60;
    return selected === 'SUV / 4x4' ? 92 : 84;
  }

  function calcCampLighting(location, input) {
    const operational = { 'Full red-light ready': 100, 'White light can be reduced': 76, 'Bright camp with limited control': 30, 'No camp setup': 58 }[input.campLighting] || 55;
    return round((operational * .65) + (location.campLightingPotential * .35));
  }

  function calcGuide(input) {
    const base = { 'Beginner guide': 52, 'Intermediate guide': 72, 'Expert astronomer': 100, 'Tour guide with astronomy support': 80 }[input.guideLevel] || 60;
    const product = DATA.products[input.experienceType];
    const adjustment = ['milky', 'meteor', 'astro'].includes(product.primary) && input.guideLevel !== 'Expert astronomer' ? -14 : 0;
    return round(clamp(base + adjustment));
  }

  function calcEquipment(input) {
    const equipment = new Set(input.equipment);
    const product = DATA.products[input.experienceType];
    let score = 58;
    if (equipment.has('Naked-eye and laser pointer')) score += 12;
    if (equipment.has('Binoculars')) score += 7;
    if (equipment.has('Small telescope')) score += 10;
    if (equipment.has('Planet telescope')) score += 13;
    if (equipment.has('Astrophotography setup')) score += 15;
    if (product.requiredEquipment.some((item) => equipment.has(item))) score += 18;
    if (product.primary === 'milky' || product.primary === 'astro') {
      if (!equipment.has('Astrophotography setup')) score -= 42;
      if (!equipment.has('Naked-eye and laser pointer')) score -= 8;
    }
    if (product.primary === 'moon' && !equipment.has('Planet telescope') && !equipment.has('Small telescope')) score -= 32;
    return round(clamp(score));
  }

  function timeBetween(start, end, moment) {
    if (start <= end) return moment >= start && moment <= end;
    return moment >= start || moment <= end;
  }

  function calcMoonScore(astro, product, viewingStart) {
    const isUp = timeBetween(astro.moonrise, astro.moonset, viewingStart);
    const illum = astro.moonIllumination;
    if (product.primary === 'moon') return round(clamp((isUp ? 65 : 30) + (illum >= 28 && illum <= 98 ? 35 : 10)));
    if (product.primary === 'milky' || product.primary === 'astro' || product.primary === 'meteor') {
      if (!isUp) return 96;
      return round(clamp(100 - illum * .96));
    }
    if (product.primary === 'constellation' || product.primary === 'family') return round(clamp(88 - (isUp ? illum * .36 : 0)));
    if (product.primary === 'luxury') return round(clamp(80 - (isUp ? illum * .22 : 0)));
    return round(clamp(90 - (isUp ? illum * .18 : 0)));
  }

  function calcAstronomy(astro, location, product, viewingStart) {
    const moon = calcMoonScore(astro, product, viewingStart);
    const darkness = location.darknessScore;
    const meteorBonus = product.primary === 'meteor' ? (astro.nearestMeteor.delta <= 2 ? 100 : astro.nearestMeteor.delta <= 10 ? 68 : 32) : 65;
    const milkyBonus = (product.primary === 'milky' || product.primary === 'astro') ? (astro.milkySeason ? 90 : 20) : 72;
    const planetBonus = product.primary === 'moon' ? 88 : 65;
    let overall;
    if (product.primary === 'milky' || product.primary === 'astro') overall = moon * .34 + darkness * .31 + milkyBonus * .35;
    else if (product.primary === 'meteor') overall = moon * .34 + darkness * .26 + meteorBonus * .40;
    else if (product.primary === 'moon') overall = moon * .42 + planetBonus * .35 + darkness * .23;
    else overall = moon * .28 + darkness * .32 + 78 * .40;
    return { score: round(clamp(overall)), moonScore: moon, darknessScore: darkness, meteorBonus, milkyBonus, planetBonus, moonUp: timeBetween(astro.moonrise, astro.moonset, viewingStart) };
  }

  function weightScore(productPrimary, values) {
    const weights = {
      milky: { weather: .27, dust: .18, darkness: .17, astronomy: .18, equipment: .08, transport: .06, camp: .04, guide: .02 },
      astro: { weather: .24, dust: .17, darkness: .17, astronomy: .18, equipment: .10, transport: .06, camp: .04, guide: .04 },
      moon: { weather: .28, astronomy: .21, equipment: .15, guide: .10, transport: .10, camp: .06, comfort: .05, safety: .05 },
      constellation: { weather: .27, astronomy: .13, darkness: .10, guide: .16, comfort: .13, transport: .11, camp: .05, safety: .05 },
      family: { weather: .24, astronomy: .13, darkness: .08, guide: .14, comfort: .18, transport: .12, camp: .06, safety: .05 },
      school: { weather: .23, astronomy: .10, darkness: .07, guide: .17, comfort: .16, transport: .13, camp: .06, safety: .08 },
      meteor: { weather: .28, dust: .18, darkness: .17, astronomy: .20, equipment: .04, transport: .06, camp: .04, safety: .03 },
      story: { weather: .22, astronomy: .15, darkness: .12, guide: .19, comfort: .14, transport: .08, camp: .05, safety: .05 },
      luxury: { weather: .22, astronomy: .14, darkness: .10, guide: .12, comfort: .18, transport: .10, camp: .08, safety: .06 }
    }[productPrimary] || {};
    return round(Object.entries(weights).reduce((sum, [key, weight]) => sum + (values[key] || 0) * weight, 0));
  }

  function classifyScore(score, override) {
    if (override === 'NO-GO') return 'NO-GO';
    if (override === 'AVOID') return 'AVOID';
    if (override === 'WATCH') return 'WATCH';
    if (score >= 82) return 'EXCELLENT';
    if (score >= 67) return 'SELL';
    if (score >= 50) return 'WATCH';
    if (score >= 35) return 'AVOID';
    return 'NO-GO';
  }

  function analyze(input, location, weather, planningOnly = false) {
    const product = DATA.products[input.experienceType];
    const astro = astronomyFor(input.date, location);
    const earliest = timeToMinutes(input.earliestStart, 1170);
    const latest = timeToMinutes(input.latestFinish, 1380);
    const astroStart = Math.max(astro.astroEnd + 10, earliest);
    const maxEnd = latest >= astroStart ? latest : latest + 1440;
    const viewingStart = astroStart;
    const viewingEnd = Math.min(viewingStart + (input.guestType === 'School / educational group' ? 95 : 130), maxEnd);
    const transfer = location.transferMinutes[input.origin] ?? 90;
    const setupBuffer = (input.equipment.includes('Astrophotography setup') ? 75 : input.equipment.some((item) => item.includes('telescope')) ? 55 : 35);
    const arrival = viewingStart - setupBuffer;
    const pickup = input.origin === 'Self-drive / no transport' ? null : arrival - transfer - 18;
    const departure = viewingEnd + 12;
    const returnArrival = input.origin === 'Self-drive / no transport' ? null : departure + transfer;

    const weatherScore = round(clamp(100 - weather.cloud * .62 - weather.rain * .75 - Math.max(0, weather.wind - 25) * 1.45));
    const dustScore = calcDust(weather);
    const comfortScore = calcComfort(weather, input);
    const transportScore = calcTransport(location, input);
    const campScore = calcCampLighting(location, input);
    const guideScore = calcGuide(input);
    const equipmentScore = calcEquipment(input);
    const safetyScore = round(clamp(location.safetyScore - (input.riskTolerance === 'Strict VIP risk' ? 0 : input.riskTolerance === 'Flexible adventure group' ? -2 : 0) - (input.specialNotes.includes('No off-road driving') && /4x4/i.test(location.vehicleRequirement) ? 45 : 0)));
    const astronomy = calcAstronomy(astro, location, product, viewingStart);

    const components = {
      weather: weatherScore, dust: dustScore, darkness: location.darknessScore, astronomy: astronomy.score,
      equipment: equipmentScore, transport: transportScore, camp: campScore, guide: guideScore, comfort: comfortScore, safety: safetyScore
    };
    let rawScore = weightScore(product.primary, components);
    let override = null;
    const risks = [];
    const reasons = [];
    let recommendedProduct = product.label;

    if (weather.isForecast && weather.cloud >= 82) { override = 'NO-GO'; risks.push('Heavy forecast cloud cover can prevent meaningful sky viewing.'); }
    if (weather.isForecast && weather.rain >= 55) { override = 'NO-GO'; risks.push('Rain probability is too high for an outdoor sky operation.'); }
    if (weather.isAirForecast && (weather.pm10 >= 240 || weather.visibility < 3)) { override = 'NO-GO'; risks.push('Dust / haze or low visibility is beyond a responsible outdoor sky-selling threshold.'); }
    if (transportScore < 35) { override = 'NO-GO'; risks.push(`Selected transport does not match the location requirement: ${location.vehicleRequirement}.`); }
    if (input.specialNotes.includes('No off-road driving') && /4x4/i.test(location.vehicleRequirement)) { override = 'NO-GO'; risks.push('No off-road driving is selected but this location needs a 4x4 operating plan.'); }
    if ((product.primary === 'milky' || product.primary === 'astro' || product.primary === 'meteor') && astronomy.moonUp && astro.moonIllumination > 72) {
      override = override || 'AVOID';
      risks.push('A bright Moon is above the horizon during the planned viewing window, reducing deep-sky / Milky Way suitability.');
      recommendedProduct = product.primary === 'meteor' ? 'Moon-and-planets telescope night or Arabic astronomy storytelling' : 'Moon-and-planets telescope night or guided constellation storytelling';
    }
    if ((input.guestType === 'School / educational group' || input.guestType === 'Family with children') && comfortScore < 42) {
      override = override || 'AVOID';
      risks.push('Heat, humidity or wind is weak for a child-focused outdoor session.');
    }
    if (input.riskTolerance === 'Strict VIP risk' && rawScore < 68 && !override) {
      override = 'WATCH';
      risks.push('Strict VIP risk tolerance requires a stronger condition threshold than standard tourism operation.');
    }
    if (location.permitNotes.toLowerCase().includes('confirm') || location.permitNotes.toLowerCase().includes('approval')) risks.push('Access, permit or partner approval must be confirmed before the booking is confirmed.');

    if (weatherScore >= 75) reasons.push('Sky forecast is operationally favourable for the selected viewing window.');
    else reasons.push('Sky conditions require cautious expectation-setting and an on-site backup flow.');
    if (astronomy.score >= 75) reasons.push(`${product.short} has a good astronomy fit for the selected date and location.`);
    else reasons.push(`Astronomy fit is limited for ${product.short}; use the recommended alternative where needed.`);
    if (location.darknessScore >= product.idealDarkness) reasons.push(`${location.name} meets the product’s darkness requirement for planning.`);
    else reasons.push(`${location.name} is more suitable for guided storytelling or telescope work than for a deep-sky promise.`);
    if (campScore < 60) risks.push('Camp lighting control is weak; reduce white light, reposition generators and keep phone flash off near the viewing zone.');
    if (weather.pm10 >= 120) risks.push('Dust / PM10 is elevated; prepare eye and camera-lens protection and downgrade photography claims if conditions persist.');
    if (weather.temperature >= 34) risks.push('High outdoor temperature needs additional water, shade/cooling buffer, and a shorter guest-facing sky session.');

    const status = classifyScore(rawScore, override);
    const confidence = !planningOnly && weather.isForecast && weather.isAirForecast && dayDifference(input.date) <= 5 ? 'High'
      : !planningOnly && (weather.isForecast || weather.isAirForecast) ? 'Medium'
        : 'Low';
    const premium = status === 'EXCELLENT' && ['milky', 'astro', 'meteor', 'luxury'].includes(product.primary) && location.darknessScore >= 70;
    const operationalDecision = operationLabel(status);
    const sourceMode = dataSourceMode(input, weather);
    const activeMeteors = activeMeteorShowers(input.date);
    const bestConstellation = bestConstellationPlan({ input, location, astro });
    const bestAction = status === 'EXCELLENT' ? 'Actively promote and apply the premium-night modifier where the product and supplier plan support it.'
      : status === 'SELL' ? 'Sell with normal condition-aware wording and complete the 72-hour / 24-hour re-checks.'
        : status === 'WATCH' ? 'Keep the enquiry warm, use cautious wording, prepare a backup experience and reconfirm conditions.'
          : status === 'AVOID' ? 'Do not actively promote this selected product. Offer the recommended alternative or another date/location.'
            : 'Block sales for this configuration. Reschedule, change the product, or choose an operationally safer location.';

    return {
      input, location, product, weather, astro, components, score: rawScore, status, confidence, risks: Array.from(new Set(risks)).slice(0, 6), reasons: reasons.slice(0, 4),
      recommendedProduct, premium, bestAction, operationalDecision, sourceMode, activeMeteors, bestConstellation,
      timeline: { pickup, arrival, setup: arrival, viewingStart, viewingEnd, departure, returnArrival, transfer, setupBuffer },
      planningOnly
    };
  }

  function sourceLabel(analysis) {
    const bits = [];
    if (analysis.weather.isForecast) bits.push('Weather forecast');
    if (analysis.weather.isAirForecast) bits.push('Air-quality forecast');
    if (!bits.length) bits.push('Estimated planning model');
    return bits.join(' + ');
  }

  function safeSalesCopy(analysis) {
    const { input, location, product, status, recommendedProduct } = analysis;
    const wording = status === 'EXCELLENT' ? 'A premium guided UAE desert night-sky experience with a strong planning fit for this date.'
      : status === 'SELL' ? 'A guided UAE desert night-sky experience planned around the best available window for this date.'
        : status === 'WATCH' ? 'A guided UAE desert night-sky experience subject to final sky and operational checks.'
          : `For this date, we recommend ${recommendedProduct} rather than actively selling ${product.label}.`;
    return `${wording}\n\nSelected location: ${location.name}\nGuest profile: ${input.guestType} · ${input.pax} guests\n\nWe will guide guests through constellations, cultural sky stories and telescope or photography elements that match the confirmed conditions. Natural sky visibility depends on cloud, dust, haze, Moon brightness and safe site access. Specific Milky Way, meteor-shower or planet visibility is never guaranteed.\n\nSales action: ${analysis.bestAction}`;
  }

  function outputsFor(analysis) {
    const { input, location, product, astro, weather, timeline, status } = analysis;
    const windowText = `${minutesToTime(timeline.viewingStart)}–${minutesToTime(timeline.viewingEnd)} (Asia/Dubai)`;
    const storyReport = skyStoryReport(analysis);
    const guide = `INFRA SKY · GUIDE BRIEF\nDate: ${dateLabel(input.date)}\nLocation: ${location.name}\nProduct: ${product.label}\nGuests: ${input.pax} · ${input.guestType} · ${input.language}\n\nBEST WINDOW\nAstronomical darkness: ${minutesToTime(astro.astroEnd)}\nGuest viewing window: ${windowText}\n\nSKY FOCUS\nSeasonal targets: ${astro.constellations.join(', ')}\nMoon: ${astro.moonPhase} · ${round(astro.moonIllumination)}% illuminated · estimated rise ${minutesToTime(astro.moonrise)} / set ${minutesToTime(astro.moonset)}\nMilky Way: ${astro.milkyWindow}\nMeteor note: ${astro.meteorSuitability}\n\nSTORY FLOW\n1. Welcome guests, set realistic expectations and protect dark adaptation.\n2. Explain how desert navigation, seasonal stars and Arabic astronomy connect to the UAE landscape.\n3. Use the ${astro.constellations[0]} story as the first visual anchor; adapt depth to the guest group.\n4. Introduce equipment only after a safety and red-light reminder.\n5. If visibility drops, use the approved backup: cultural sky storytelling, simple sky orientation, telescope demonstration where possible, and a short guided reflection.\n\nOPERATIONS\n${location.operationalNotes}\nSafety: ${location.risks.join('; ')}.\nDo not promise a specific object. Confirm real visibility on site before inviting guests to view.`;

    const guest = `Hello,\n\nYour UAE desert night-sky experience is planned for ${dateLabel(input.date)}. Please be ready at ${timeline.pickup == null ? minutesToTime(timeline.arrival) : minutesToTime(timeline.pickup)}${timeline.pickup == null ? ' at the agreed viewing location' : ` for pickup from ${input.origin}`}.\n\nPlease bring a light jacket, comfortable closed shoes, water, and a phone/camera if you wish. To protect night vision, please avoid phone flash near the viewing area.\n\nThe sky is a natural environment: cloud, dust, haze and Moon brightness can affect what is visible. Our guide will provide the best safe experience available, but Milky Way, meteors and specific planets cannot be guaranteed.\n\nThank you — we look forward to welcoming you under the UAE night sky.`;

    const driverCamp = `INFRA SKY · DRIVER & CAMP BRIEF\nDate: ${dateLabel(input.date)}\nLocation: ${location.name}\nPickup: ${timeline.pickup == null ? 'Self-drive / no transfer' : `${minutesToTime(timeline.pickup)} from ${input.origin}`}\nTransfer estimate: ${timeline.transfer} min each way\nArrival / setup target: ${minutesToTime(timeline.arrival)}\nGuest viewing: ${windowText}\nReturn departure: ${minutesToTime(timeline.departure)}${timeline.returnArrival == null ? '' : ` · estimated hotel return ${minutesToTime(timeline.returnArrival)}`}\nVehicle requirement: ${location.vehicleRequirement}\n\nSITE CONTROL\n• Stop headlights before the viewing zone; use hazard-safe staging only.\n• Generator and white-light sources must face away from the viewing zone.\n• Red lights, first aid, water, blankets/comfort items and guest-count control ready before arrival.\n• Set seating toward the darkest open horizon and keep a clear telescope zone.\n• Mobile signal: ${location.mobileSignal}. Share the exact location pin and escalation contact before departure.\n• Confirm access / permit: ${location.permitNotes}\n\nEscalate immediately for unsafe road access, rain, lightning, severe dust/haze, medical issue or loss of communications.`;

    const sop = `INFRA SKY · SOP & ESCALATION\nBefore confirming: verify location approval, vehicle suitability, guide level, equipment, guest restrictions and the product promise.\n72 hours before: re-run InfraSky; review weather, dust/haze and road access; keep backup product ready.\n24 hours before: re-run InfraSky; confirm driver, guide, camp lighting, equipment, guest WhatsApp and supplier access.\nOn site: assess real cloud, haze, wind, safety, lighting discipline and guest comfort.\n\nDowngrade when: deep-sky visibility is weak, Moon brightness changes product fit, or photography conditions fail. Use guided constellation, lunar storytelling or telescope demonstration if safe.\nReschedule when: the guest product cannot be delivered honestly and an alternative date improves the operating case.\nCancel / block when: access is unsafe, vehicle is unsuitable, heavy cloud/rain/dust prevents safe operation, or management safety policy requires it.\nDocument: final sky condition, decision time, guest communication sent, supplier impact, recovery action and any refund/credit decision.`;

    const quote = `INFRA SKY · QUOTE & PRICING SIGNALS\nBase level: ${status === 'EXCELLENT' ? 'Premium-ready' : status === 'SELL' ? 'Standard sellable' : 'Condition-sensitive / quote only after reconfirmation'}\nLocation modifier: ${timeline.transfer >= 160 ? 'Remote-transfer modifier' : timeline.transfer >= 90 ? 'Extended-transfer modifier' : 'Standard-transfer modifier'}\nVehicle modifier: ${/4x4/i.test(location.vehicleRequirement) ? '4x4 / recovery-ready vehicle modifier' : 'Standard transport logic'}\nGuide modifier: ${input.guideLevel === 'Expert astronomer' ? 'Expert astronomer modifier' : 'Guide + astronomy-support modifier'}\nEquipment modifier: ${input.equipment.includes('Astrophotography setup') ? 'Astrophotography equipment modifier' : input.equipment.some((item) => item.includes('telescope')) ? 'Telescope setup modifier' : 'Naked-eye / storytelling baseline'}\nNight modifier: ${timeline.departure >= 1320 ? 'Late-night operations modifier' : 'Standard evening window'}\nVIP/private modifier: ${input.guestType === 'VIP private group' ? 'Private VIP modifier' : 'Group product'}\nCamp modifier: ${input.campLighting}\n\nSuggested upsells: ${['Telescope', 'Astrophotography', 'Private astronomer', 'Premium dinner', 'Arabic astronomy storytelling', 'Desert photography', 'Luxury transfer', 'Family astronomy kit'].join(' · ')}\n\nPricing note: This is an operating signal, not a final price. Confirm supplier cost, permits, vehicle capacity, guide fee, equipment, margin and cancellation policy in InfraQuote.`;

    const training = `INFRA SKY · GUIDE TRAINING NOTES\nKnow before service: date, selected product, location risks, access note, Moon condition, best window, approved promise language, guest profile and backup plan.\nSimple objects: ${astro.constellations.join(', ')}. Explain one visual feature, one cultural or navigation connection, and one guest observation question for each.\nLikely guest questions: “Can we see the Milky Way?”, “Why is the Moon bright?”, “Which star is the brightest?”, “How did desert travellers navigate?”\nFamily / school version: keep segments short, use one question at a time, include a red-light game, and protect comfort breaks.\nPoor visibility explanation: “Tonight the sky is affected by natural cloud, dust, haze or Moon brightness. We will focus on the best safe elements that conditions allow rather than promise something the sky cannot provide.”\nArabic heritage prompts: lunar months, seasonal navigation, desert orientation, respect for darkness and the relationship between travel, time and the sky.\nSafety: count guests at every move, protect edges and vehicle zones, keep no-flash rules, and stop any activity that is no longer safe.`;

    const checklist = `INFRA SKY · FIELD CHECKLIST\n☐ Location access / permit confirmed\n☐ Driver, vehicle and route suitable\n☐ Guide and equipment confirmed\n☐ 72-hour re-check completed\n☐ 24-hour re-check completed\n☐ Guest WhatsApp sent\n☐ Red lights ready; white lights and generator repositioned\n☐ Telescope / binocular / camera setup tested\n☐ Water, first aid, blankets/comfort items ready\n☐ Exact pin and emergency communication confirmed\n☐ Guest safety, accessibility and return deadline checked\n☐ On-site sky, wind, dust and comfort assessment completed\n☐ Backup experience ready\n☐ Decision / condition outcome documented`;

    return { sales: safeSalesCopy(analysis), guide, skyStory: storyReport, guest, driverCamp, sop, quote, training, checklist };
  }

  async function copyText(text, button) {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea'); area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      }
      const original = button.textContent; button.textContent = 'Copied'; setTimeout(() => { button.textContent = original; }, 1600);
    } catch (error) { button.textContent = 'Copy blocked'; setTimeout(() => { button.textContent = 'Copy'; }, 1600); }
  }

  function scoreCard(label, value, note) {
    return `<article class="sky-score-card"><span>${escapeHtml(label)}</span><strong>${round(value)}</strong><small>${escapeHtml(note)}</small></article>`;
  }

  function renderAnalysis(analysis) {
    const outputs = outputsFor(analysis);
    const statusClass = analysis.status.toLowerCase().replace(/[^a-z]/g, '');
    const appearance = skyAppearance(analysis);
    const season = seasonForDate(analysis.input.date);
    const cards = constellationCards(analysis);
    $('analysisEmpty').hidden = true;
    const report = $('skyReport'); report.hidden = false;
    $('resultStatus').textContent = analysis.operationalDecision;
    $('resultStatus').className = `sky-status ${statusClass}`;
    $('resultScore').textContent = analysis.score;
    $('resultConfidence').textContent = `${analysis.confidence} confidence`;
    $('resultSource').textContent = `${sourceLabel(analysis)} · ${analysis.sourceMode}`;
    $('resultAction').textContent = analysis.bestAction;
    $('resultReasons').innerHTML = analysis.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('');
    $('resultRisks').innerHTML = analysis.risks.map((risk) => `<li>${escapeHtml(risk)}</li>`).join('') || '<li>No major operational warnings generated by the current planning model.</li>';

    const c = analysis.components;
    $('scoreGrid').innerHTML = [
      scoreCard('Product suitability', analysis.score, analysis.product.short),
      scoreCard('Astronomy', c.astronomy, `${analysis.astro.moonPhase} · ${round(analysis.astro.moonIllumination)}% Moon`),
      scoreCard('Weather', c.weather, `${round(analysis.weather.cloud)}% cloud · ${round(analysis.weather.rain)}% rain`),
      scoreCard('Dust / haze', c.dust, `PM10 ${round(analysis.weather.pm10)} µg/m³`),
      scoreCard('Darkness', c.darkness, `${analysis.location.name}`),
      scoreCard('Comfort', c.comfort, `${round(analysis.weather.temperature)}°C · ${round(analysis.weather.humidity)}% RH`),
      scoreCard('Safety', c.safety, analysis.location.mobileSignal),
      scoreCard('Camp lighting', c.camp, analysis.input.campLighting),
      scoreCard('Transport', c.transport, analysis.location.vehicleRequirement),
      scoreCard('Equipment', c.equipment, analysis.input.equipment.length ? analysis.input.equipment.join(', ') : 'No equipment selected')
    ].join('');

    const best = analysis.bestConstellation;
    const meteorText = analysis.activeMeteors.length ? analysis.activeMeteors.map((item) => `${item.name}: ${item.strength}; peak in ${item.delta} day(s). ${item.notes}`).join(' ') : 'No major meteor-shower active window is selected for this date.';
    const dataTruth = analysis.sourceMode === 'Live public forecast window'
      ? 'Weather/air-quality values are public API forecast values where provider data is available.'
      : 'This date is using annual planning estimates for weather/air quality. Do not present it as an approved live forecast.';
    const teamBrief = document.createElement('div');
    teamBrief.className = 'sky-section-card sky-management-brief';
    teamBrief.innerHTML = `
      <h3>Management operating decision</h3>
      <div class="sky-management-grid">
        <div><span>Show decision</span><strong>${escapeHtml(analysis.operationalDecision)}</strong><small>${escapeHtml(analysis.bestAction)}</small></div>
        <div><span>Data mode</span><strong>${escapeHtml(analysis.sourceMode)}</strong><small>${escapeHtml(dataTruth)}</small></div>
        <div><span>Best constellation</span><strong>${escapeHtml(best.name)} · ${escapeHtml(best.bestTime)}</strong><small>${escapeHtml(best.direction)} · ${escapeHtml(best.guideStory || best.bestWindow || 'Confirm on site')}</small></div>
        <div><span>Meteor focus</span><strong>${escapeHtml(analysis.astro.meteorSuitability)}</strong><small>${escapeHtml(meteorText)}</small></div>
      </div>`;
    const existingBrief = $('skyReport').querySelector('.sky-management-brief');
    if (existingBrief) existingBrief.replaceWith(teamBrief);
    else $('scoreGrid').insertAdjacentElement('afterend', teamBrief);

    const t = analysis.timeline;
    $('timelineGrid').innerHTML = [
      ['Sunset', minutesToTime(analysis.astro.sunset)], ['Civil twilight end', minutesToTime(analysis.astro.civilEnd)], ['Nautical twilight end', minutesToTime(analysis.astro.nauticalEnd)], ['Astronomical darkness', minutesToTime(analysis.astro.astroEnd)],
      ['Guest arrival', minutesToTime(t.arrival)], ['Guide setup', minutesToTime(t.setup)], ['Best viewing', `${minutesToTime(t.viewingStart)}–${minutesToTime(t.viewingEnd)}`], ['Return departure', minutesToTime(t.departure)],
      ['Pickup', t.pickup == null ? 'Self-drive / agreed point' : minutesToTime(t.pickup)], ['Estimated return', t.returnArrival == null ? 'Self-drive' : minutesToTime(t.returnArrival)]
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');

    $('weatherSummary').innerHTML = `
      <div class="sky-data-line"><span>Cloud cover</span><strong>${round(analysis.weather.cloud)}%</strong></div>
      <div class="sky-data-line"><span>Rain probability</span><strong>${round(analysis.weather.rain)}%</strong></div>
      <div class="sky-data-line"><span>Temperature</span><strong>${round(analysis.weather.temperature)}°C</strong></div>
      <div class="sky-data-line"><span>Humidity</span><strong>${round(analysis.weather.humidity)}%</strong></div>
      <div class="sky-data-line"><span>Wind</span><strong>${round(analysis.weather.wind)} km/h</strong></div>
      <div class="sky-data-line"><span>Visibility</span><strong>${round(analysis.weather.visibility)} km</strong></div>
      <div class="sky-data-line"><span>PM10 / dust</span><strong>${round(analysis.weather.pm10)} µg/m³</strong></div>
      <div class="sky-data-line"><span>Data state</span><strong>${escapeHtml(analysis.weather.source)}</strong></div>`;

    $('astronomySummary').innerHTML = `
      <div class="sky-data-line"><span>Moon</span><strong>${escapeHtml(analysis.astro.moonPhase)} · ${round(analysis.astro.moonIllumination)}% illuminated</strong></div>
      <div class="sky-data-line"><span>Estimated Moon rise / set</span><strong>${minutesToTime(analysis.astro.moonrise)} / ${minutesToTime(analysis.astro.moonset)}</strong></div>
      <div class="sky-data-line"><span>Seasonal constellations</span><strong>${escapeHtml(analysis.astro.constellations.join(', '))}</strong></div>
      <div class="sky-data-line"><span>Best visible constellation</span><strong>${escapeHtml(analysis.bestConstellation.name)} · ${escapeHtml(analysis.bestConstellation.bestTime)} · ${escapeHtml(analysis.bestConstellation.direction)}</strong></div>
      <div class="sky-data-line"><span>Milky Way</span><strong>${escapeHtml(analysis.astro.milkyWindow)}</strong></div>
      <div class="sky-data-line"><span>Meteor campaign</span><strong>${escapeHtml(analysis.astro.meteorSuitability)}</strong></div>
      <div class="sky-data-line"><span>Active meteor windows</span><strong>${analysis.activeMeteors.length ? escapeHtml(analysis.activeMeteors.map((item) => `${item.name} (${item.delta}d from peak)`).join(', ')) : 'No active major window'}</strong></div>
      <div class="sky-data-line"><span>Planet note</span><strong>${escapeHtml(analysis.astro.planetNote)}</strong></div>`;

    $('locationSummary').innerHTML = `
      <div class="sky-data-line"><span>Location</span><strong>${escapeHtml(analysis.location.name)}, ${escapeHtml(analysis.location.emirate)}</strong></div>
      <div class="sky-data-line"><span>Coordinates</span><strong>${Number(analysis.location.latitude).toFixed(4)}, ${Number(analysis.location.longitude).toFixed(4)}</strong></div>
      <div class="sky-data-line"><span>Darkness</span><strong>${analysis.location.darknessScore}/100</strong></div>
      <div class="sky-data-line"><span>Access</span><strong>${escapeHtml(analysis.location.accessType)}</strong></div>
      <div class="sky-data-line"><span>Vehicle</span><strong>${escapeHtml(analysis.location.vehicleRequirement)}</strong></div>
      <div class="sky-data-line"><span>Transfer</span><strong>${analysis.timeline.transfer} min from ${escapeHtml(analysis.input.origin)}</strong></div>
      <div class="sky-data-line"><span>Mobile / permit</span><strong>${escapeHtml(analysis.location.mobileSignal)} · ${escapeHtml(analysis.location.permitNotes)}</strong></div>`;

    $('visualSkyReport').innerHTML = `
      <div class="visual-report-head">
        <div><span class="eyebrow">Sky Reality Report</span><h3>${escapeHtml(appearance.headline)}</h3><p>${escapeHtml(appearance.visual)}</p></div>
        <div class="season-badge"><strong>${escapeHtml(season.label)}</strong><span>${escapeHtml(season.note)}</span></div>
      </div>
      <div class="sky-map-card"><span>Text sky map</span><strong>${escapeHtml(analysis.astro.milkyWindow)}</strong><p>Begin after astronomical darkness around ${minutesToTime(analysis.astro.astroEnd)}. Moon: ${escapeHtml(analysis.astro.moonPhase)} at ${round(analysis.astro.moonIllumination)}% illumination. Use bright seasonal anchors first, then adjust the story depth to real visibility on site.</p></div>
      <div class="constellation-grid">${cards.map((item) => `<article><span>${escapeHtml(item.name)}</span><strong>${escapeHtml(item.bestWindow)}</strong><p>${escapeHtml(item.guideStory)}</p><small>Appears: ${escapeHtml(item.appears)}<br/>Disappears: ${escapeHtml(item.disappears)}</small></article>`).join('') || '<article><span>Live sky check</span><strong>Confirm on site</strong><p>No configured constellation story for this date yet.</p><small>Use the guide astronomy app before service.</small></article>'}</div>
      <div class="guide-story-steps">${guideNarrativePlan(analysis).map((item, index) => `<div><span>${index + 1}</span><p>${escapeHtml(item)}</p></div>`).join('')}</div>`;

    $('promiseSummary').innerHTML = `
      <h3>What sales may say</h3><p>${escapeHtml(analysis.status === 'EXCELLENT' || analysis.status === 'SELL' ? `This date is suitable to offer ${analysis.product.label} with an honest natural-conditions disclaimer.` : `Use cautious wording or offer ${analysis.recommendedProduct}; do not actively promise the selected product.`)}</p>
      <h3>What sales must not promise</h3><p>Do not guarantee Milky Way visibility, meteors, a specific planet, a cloud-free sky, or photography results. Confirm conditions at 72 and 24 hours before service.</p>
      <h3>Recommended product wording</h3><p>${escapeHtml(analysis.recommendedProduct)}</p>
      <h3>Main limitation</h3><p>${escapeHtml(analysis.risks[0] || 'Natural conditions can change. Re-check live forecast before confirmation.')}</p>`;

    const targetMap = { sales: 'salesOutput', guide: 'guideOutput', skyStory: 'skyStoryOutput', guest: 'guestOutput', driverCamp: 'driverOutput', sop: 'sopOutput', quote: 'quoteOutput', training: 'trainingOutput', checklist: 'checklistOutput' };
    Object.entries(targetMap).forEach(([key, id]) => { $(id).textContent = outputs[key]; });
    bindCopyButtons();
    $('skyReport').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bindCopyButtons() {
    $$('[data-sky-copy]').forEach((button) => {
      if (button.dataset.bound) return;
      button.dataset.bound = 'true';
      button.addEventListener('click', () => copyText($(button.dataset.skyCopy)?.textContent || '', button));
    });
  }

  function populateLocations() {
    const options = DATA.locations.sort((a, b) => a.emirate.localeCompare(b.emirate) || a.name.localeCompare(b.name));
    $('skyLocation').innerHTML = options.map((location) => `<option value="${location.id}">${escapeHtml(location.name)} · ${escapeHtml(location.emirate)} · Darkness ${location.darknessScore}/100</option>`).join('');
    ['compareLocation1', 'compareLocation2', 'compareLocation3'].forEach((id, index) => {
      $(id).innerHTML = options.map((location) => `<option value="${location.id}" ${location.id === ['al-quaa', 'al-wathba', 'al-khatim-camp-zone'][index] ? 'selected' : ''}>${escapeHtml(location.name)} · ${location.emirate}</option>`).join('');
    });
    renderLocationTools();
    renderLocationBrief();
  }

  function getLocation(id) { return DATA.locations.find((location) => location.id === id) || DATA.locations[0]; }

  function locationKind(location) {
    return /camp|sonara|terra solis/i.test(location.name) ? 'Camp / supplier site' : /reserve|conservation|heritage|centre/i.test(location.accessType) ? 'Managed site' : 'Desert location';
  }

  function renderLocationTools() {
    const host = $('locationTools');
    if (!host) return;
    const featuredIds = ['al-quaa', 'al-wathba', 'al-wathba-camp-zone', 'al-khatim-camp-zone', 'sweihan-desert', 'mleiha-camp'];
    const chips = featuredIds.map(getLocation).filter(Boolean);
    host.innerHTML = `<span>Quick camps</span>${chips.map((location) => `<button type="button" data-location-pick="${location.id}">${escapeHtml(location.name)}</button>`).join('')}`;
    $$('[data-location-pick]', host).forEach((button) => button.addEventListener('click', () => {
      $('skyLocation').value = button.dataset.locationPick;
      renderLocationBrief();
      renderComparison(getInput());
    }));
  }

  function renderLocationBrief() {
    const host = $('locationBrief');
    if (!host || !$('skyLocation')) return;
    const location = getLocation($('skyLocation').value);
    const origin = $('pickupOrigin')?.value || 'Abu Dhabi City';
    const transfer = location.transferMinutes?.[origin] ?? 0;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.latitude},${location.longitude}`)}`;
    host.innerHTML = `
      <div class="sky-brief-main">
        <div><span>${escapeHtml(locationKind(location))}</span><strong>${escapeHtml(location.name)}</strong><p>${escapeHtml(location.operationalNotes)}</p></div>
        <a class="sky-map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">Open map pin</a>
      </div>
      <div class="sky-brief-metrics">
        <div><span>Darkness</span><strong>${location.darknessScore}/100</strong></div>
        <div><span>Camp light control</span><strong>${location.campLightingPotential}/100</strong></div>
        <div><span>Transfer from ${escapeHtml(origin)}</span><strong>${transfer} min</strong></div>
        <div><span>Vehicle</span><strong>${escapeHtml(location.vehicleRequirement)}</strong></div>
      </div>
      <div class="sky-brief-footer"><span>${escapeHtml(location.mobileSignal)} signal</span><span>${escapeHtml(location.permitNotes)}</span></div>`;
  }

  function recommendedStartPlan() {
    const location = getLocation($('skyLocation').value);
    const date = $('skyDate').value || localIsoToday();
    const product = DATA.products[$('experienceType').value] || DATA.products['beginner-constellation'];
    const guestType = $('guestType')?.value || 'Beginner mixed group';
    const astro = astronomyFor(date, location);
    let start = astro.astroEnd + 10;
    let reason = 'Best for dark-sky viewing after astronomical darkness.';
    if (product.primary === 'moon') {
      start = Math.max(astro.civilEnd + 20, astro.sunset + 45);
      reason = 'Moon and planets can start earlier; full dark adaptation is less critical.';
    } else if (['family', 'school', 'story', 'constellation', 'luxury'].includes(product.primary)) {
      start = Math.max(astro.nauticalEnd + 10, astro.sunset + 60);
      reason = 'Good balance for guests: dark enough for stories, not unnecessarily late.';
    } else if (product.primary === 'milky' || product.primary === 'astro' || product.primary === 'meteor') {
      start = astro.astroEnd + 20;
      reason = 'Deep-sky products need full darkness and stronger dark adaptation.';
    }
    if (guestType === 'Family with children' || guestType === 'School / educational group') {
      start = Math.min(start, astro.astroEnd + 5);
      reason += ' Kept as early as practical for children/school comfort.';
    }
    return { start: minutesToTime(start), astro, product, reason };
  }

  function renderTimeAdvisor(apply = false) {
    const host = $('timeAdvisor');
    if (!host || !$('earliestStart')) return;
    const plan = recommendedStartPlan();
    if (apply) $('earliestStart').value = plan.start;
    host.innerHTML = `
      <div class="time-advisor-main"><span>Recommended start</span><strong>${plan.start}</strong><p>${escapeHtml(plan.reason)}</p></div>
      <div class="time-advisor-facts">
        <div><span>Sunset</span><strong>${minutesToTime(plan.astro.sunset)}</strong></div>
        <div><span>Darkness</span><strong>${minutesToTime(plan.astro.astroEnd)}</strong></div>
        <div><span>Experience</span><strong>${escapeHtml(plan.product.short || plan.product.label)}</strong></div>
      </div>
      <button type="button" id="applyRecommendedStart">Use recommended time</button>`;
    $('applyRecommendedStart')?.addEventListener('click', () => renderTimeAdvisor(true), { once: true });
  }

  function populateProducts() {
    $('experienceType').innerHTML = Object.entries(DATA.products).map(([id, product]) => `<option value="${id}">${escapeHtml(product.label)}</option>`).join('');
  }

  function populateConstellationFilter() {
    if (!$('annualConstellation')) return;
    $('annualConstellation').innerHTML = '<option value="">All constellations</option>' + (DATA.constellationGuide || [])
      .map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · ${escapeHtml(DATA.seasons?.[item.season]?.label || item.season)}</option>`)
      .join('');
    if ($('annualMeteor')) $('annualMeteor').innerHTML = '<option value="">All meteor windows</option>' + (DATA.meteorWindows || [])
      .map((item) => `<option value="${item.id}">${escapeHtml(item.name)} · peak ${pad(item.month)}/${pad(item.day)}</option>`)
      .join('');
  }

  function renderOperatingCalendar(input) {
    const location = getLocation(input.locationId);
    const start = dateFromIso(input.date);
    const rows = [];
    for (let offset = 0; offset < 14; offset += 1) {
      const date = new Date(start.getTime() + offset * DAY);
      const dateValue = isoFromDate(date);
      const weather = { ...seasonWeather(dateValue), isForecast: false, isAirForecast: false, source: 'Planning estimate for 14-night board' };
      const analysis = analyze({ ...input, date: dateValue }, location, weather, true);
      rows.push(analysis);
    }
    $('operatingCalendar').innerHTML = `<div class="sky-table-wrap"><table class="sky-table"><caption>Next 14 nights · planning board only. Confirm live forecast 72 and 24 hours before service.</caption><thead><tr><th>Date</th><th>Status</th><th>Score</th><th>Moon risk</th><th>Weather risk</th><th>Recommended product</th><th>Best window</th><th>Sales action</th></tr></thead><tbody>${rows.map((item) => `<tr><td>${escapeHtml(dateLabel(item.input.date))}</td><td><span class="sky-mini-status ${item.status.toLowerCase().replace(/[^a-z]/g, '')}">${item.status}</span></td><td>${item.score}</td><td>${round(item.astro.moonIllumination)}%${item.components.astronomy < 55 ? ' · high' : ''}</td><td>${round(item.weather.cloud)}% cloud · PM10 ${round(item.weather.pm10)}</td><td>${escapeHtml(item.recommendedProduct)}</td><td>${minutesToTime(item.timeline.viewingStart)}–${minutesToTime(item.timeline.viewingEnd)}</td><td>${item.status === 'EXCELLENT' ? 'Promote' : item.status === 'SELL' ? 'Sell' : item.status === 'WATCH' ? 'Re-check' : 'Avoid / block'}</td></tr>`).join('')}</tbody></table></div>`;
  }

  let annualRows = [];
  function generateAnnual(input) {
    const year = Number($('annualYear').value || dateFromIso(input.date).getUTCFullYear());
    const location = getLocation(input.locationId);
    const start = new Date(Date.UTC(year, 0, 1, 12));
    annualRows = [];
    for (let day = 0; day < 366; day += 1) {
      const date = new Date(start.getTime() + day * DAY);
      if (date.getUTCFullYear() !== year) break;
      const dateValue = isoFromDate(date);
      const weather = { ...seasonWeather(dateValue), isForecast: false, isAirForecast: false, source: 'Annual planning model' };
      annualRows.push(analyze({ ...input, date: dateValue }, location, weather, true));
    }
    renderAnnualRows();
  }

  function renderAnnualRows() {
    const monthFilter = $('annualMonth').value;
    const statusFilter = $('annualStatus').value;
    const seasonFilter = $('annualSeason')?.value || '';
    const constellationFilter = $('annualConstellation')?.value || '';
    const meteorFilter = $('annualMeteor')?.value || '';
    const constellation = constellationFilter ? (DATA.constellationGuide || []).find((item) => item.id === constellationFilter) : null;
    const meteor = meteorFilter ? (DATA.meteorWindows || []).find((item) => item.id === meteorFilter) : null;
    const filtered = annualRows.filter((row) => {
      const month = dateFromIso(row.input.date).getUTCMonth() + 1;
      const seasonMatch = !seasonFilter || seasonKeyForMonth(month) === seasonFilter;
      const monthMatch = !monthFilter || month === Number(monthFilter);
      const constellationMatch = !constellation || constellation.months.includes(month);
      const meteorMatch = !meteor || activeMeteorShowers(row.input.date).some((item) => item.id === meteor.id);
      const statusMatch = !statusFilter || row.status === statusFilter;
      return seasonMatch && monthMatch && constellationMatch && meteorMatch && statusMatch;
    });
    const counts = Object.keys(statusOrder).map((status) => `<span class="sky-count ${status.toLowerCase().replace(/[^a-z]/g, '')}"><strong>${annualRows.filter((row) => row.status === status).length}</strong> ${status}</span>`).join('');
    $('annualCounts').innerHTML = counts;
    const seasonNote = seasonFilter ? DATA.seasons?.[seasonFilter]?.note : 'Choose a season to plan around winter, spring, summer or autumn sky products.';
    const constellationNote = constellation ? `${constellation.name}: ${constellation.appears} ${constellation.disappears}` : 'Choose a constellation to see when it is useful for operations.';
    const meteorNote = meteor ? `${meteor.name}: ${meteor.strength}. ${meteor.notes}` : 'Choose a meteor shower to filter dates inside its active window.';
    if ($('seasonConstellationNote')) $('seasonConstellationNote').innerHTML = `<strong>${escapeHtml(seasonNote || '')}</strong><span>${escapeHtml(constellationNote)}</span><span>${escapeHtml(meteorNote)}</span>`;
    $('annualCalendar').innerHTML = `<div class="sky-table-wrap"><table class="sky-table"><caption>Annual board uses astronomy, meteor-calendar windows, location darkness and conservative seasonal climate estimates. It is not a full-year live weather forecast.</caption><thead><tr><th>Date</th><th>Season</th><th>Show decision</th><th>Score</th><th>Moon</th><th>Best constellation / time</th><th>Meteor window</th><th>Primary fit</th><th>Planning action</th></tr></thead><tbody>${filtered.map((row) => {
      const month = dateFromIso(row.input.date).getUTCMonth() + 1;
      const season = seasonForDate(row.input.date);
      const visible = (DATA.constellationGuide || []).filter((item) => item.months.includes(month)).map((item) => item.name).slice(0, 3).join(', ');
      const best = row.bestConstellation || bestConstellationPlan(row);
      const meteors = activeMeteorShowers(row.input.date);
      return `<tr><td>${escapeHtml(dateLabel(row.input.date))}</td><td>${escapeHtml(season.label)}</td><td><span class="sky-mini-status ${row.status.toLowerCase().replace(/[^a-z]/g, '')}">${escapeHtml(row.operationalDecision)}</span><br/><small>${row.status}</small></td><td>${row.score}</td><td>${round(row.astro.moonIllumination)}%</td><td><strong>${escapeHtml(best.name)}</strong><br/><small>${escapeHtml(best.bestTime)} · ${escapeHtml(best.direction)} · ${escapeHtml(visible || 'Confirm on site')}</small></td><td>${meteors.length ? meteors.map((item) => `${escapeHtml(item.name)} (${item.delta}d)`).join('<br/>') : 'No active major window'}</td><td>${escapeHtml(row.recommendedProduct)}</td><td>${row.status === 'EXCELLENT' ? 'Premium candidate' : row.status === 'SELL' ? 'Sell' : row.status === 'WATCH' ? 'Watch / re-check' : row.status === 'AVOID' ? 'Avoid promotion' : 'Block / replace'}</td></tr>`;
    }).join('')}</tbody></table></div>`;
  }

  function downloadFile(filename, content, mime = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }

  function annualCsv(kind) {
    const monthFilter = $('annualMonth').value;
    let rows = annualRows;
    if (kind === 'month') rows = rows.filter((row) => dateFromIso(row.input.date).getUTCMonth() + 1 === Number(monthFilter || 1));
    if (kind === 'blocked') rows = rows.filter((row) => row.status === 'NO-GO' || row.status === 'AVOID');
    if (kind === 'premium') rows = rows.filter((row) => row.status === 'EXCELLENT' && row.premium);
    const header = ['date', 'season', 'location', 'experience', 'show_decision', 'status', 'score', 'moon_illumination_pct', 'cloud_planning_pct', 'pm10_planning', 'best_constellation', 'best_constellation_time', 'meteor_windows', 'recommended_product', 'best_viewing_window'];
    const csv = [header.join(','), ...rows.map((row) => {
      const month = dateFromIso(row.input.date).getUTCMonth() + 1;
      const meteors = activeMeteorShowers(row.input.date).map((item) => item.name).join(' / ');
      const best = row.bestConstellation || bestConstellationPlan(row);
      return [row.input.date, seasonForDate(row.input.date).label, row.location.name, row.product.label, row.operationalDecision, row.status, row.score, round(row.astro.moonIllumination), round(row.weather.cloud), round(row.weather.pm10), best.name, best.bestTime, meteors, row.recommendedProduct, `${minutesToTime(row.timeline.viewingStart)}-${minutesToTime(row.timeline.viewingEnd)}`].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    })].join('\n');
    downloadFile(`infrasky-${kind}-${$('annualYear').value}.csv`, csv, 'text/csv;charset=utf-8');
  }

  function renderComparison(input) {
    const ids = ['compareLocation1', 'compareLocation2', 'compareLocation3'].map((id) => $(id).value);
    const selected = ids.map(getLocation);
    const rows = selected.map((location) => {
      const weather = { ...seasonWeather(input.date), isForecast: false, isAirForecast: false, source: 'Comparison planning model' };
      return analyze(input, location, weather, true);
    }).sort((a, b) => b.score - a.score);
    const pick = (predicate, fallback) => rows.filter(predicate).sort((a, b) => b.score - a.score)[0] || rows[0] || fallback;
    const recommendations = [
      ['Best premium option', pick((row) => row.location.darknessScore >= 70 && row.components.comfort >= 50)],
      ['Best family option', pick((row) => row.components.transport >= 70 && row.components.safety >= 80)],
      ['Best beginner option', pick((row) => row.components.transport >= 70 && row.components.guide >= 60)],
      ['Best low-risk option', pick((row) => row.components.safety >= 85 && row.components.transport >= 80)],
      ['Best Milky Way option', pick((row) => row.location.darknessScore >= 70)],
      ['Best Moon-and-planets option', pick((row) => row.components.astronomy >= 60)],
      ['Best backup option', pick((row) => row.components.safety >= 80)]
    ];
    $('locationComparison').innerHTML = `<div class="sky-recommend-grid">${recommendations.map(([label, row]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(row?.location.name || 'No option')}</strong><small>${escapeHtml(row?.recommendedProduct || '')}</small></div>`).join('')}</div><div class="sky-table-wrap"><table class="sky-table"><thead><tr><th>Location</th><th>Status / score</th><th>Darkness</th><th>Moon fit</th><th>Dust / haze</th><th>Transfer</th><th>Safety</th><th>Photography</th><th>Recommendation</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.location.name)}</td><td><span class="sky-mini-status ${row.status.toLowerCase().replace(/[^a-z]/g, '')}">${row.status}</span> ${row.score}</td><td>${row.location.darknessScore}</td><td>${row.components.astronomy}</td><td>${row.components.dust}</td><td>${row.timeline.transfer} min</td><td>${row.components.safety}</td><td>${row.product.primary === 'milky' || row.product.primary === 'astro' ? row.score : round((row.location.darknessScore + row.components.dust) / 2)}</td><td>${escapeHtml(row.recommendedProduct)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function getHistory() {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      const validLocationIds = new Set(DATA.locations.map((location) => location.id));
      const history = Array.isArray(stored) ? stored.filter((record) => validLocationIds.has(record?.input?.locationId)) : [];
      if (!Array.isArray(stored) || history.length !== stored.length) localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      return history;
    } catch (error) { return []; }
  }
  function setHistory(history) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30))); } catch (error) {} }
  let historyCompare = new Set();

  function savePlan(analysis) {
    const history = getHistory();
    const record = { id: `sky-${Date.now()}`, createdAt: new Date().toISOString(), input: analysis.input, result: { score: analysis.score, status: analysis.status, location: analysis.location.name, product: analysis.product.label, confidence: analysis.confidence, action: analysis.bestAction } };
    history.unshift(record); setHistory(history); renderHistory();
    $('historyStatus').textContent = 'Plan saved locally in this browser.';
  }

  function renderHistory() {
    const history = getHistory();
    $('savedPlans').innerHTML = history.length ? history.map((record) => `<article class="sky-history-card"><div><span class="sky-mini-status ${record.result.status.toLowerCase().replace(/[^a-z]/g, '')}">${record.result.status}</span><strong>${escapeHtml(record.result.product)}</strong><small>${escapeHtml(record.result.location)} · ${escapeHtml(record.input.date)} · Score ${record.result.score}</small></div><div class="sky-history-actions"><button type="button" data-history-open="${record.id}" class="btn secondary">Open</button><button type="button" data-history-duplicate="${record.id}" class="btn secondary">Duplicate</button><label class="sky-compare-check"><input type="checkbox" data-history-compare="${record.id}" ${historyCompare.has(record.id) ? 'checked' : ''}/> Compare</label><button type="button" data-history-delete="${record.id}" class="btn text-btn">Delete</button></div></article>`).join('') : '<p class="muted">No saved plans yet. Save a completed InfraSky analysis to reuse it.</p>';

    $$('[data-history-open]').forEach((button) => button.addEventListener('click', () => {
      const record = getHistory().find((item) => item.id === button.dataset.historyOpen); if (!record) return;
      fillForm(record.input); runPlanner();
    }));
    $$('[data-history-duplicate]').forEach((button) => button.addEventListener('click', () => {
      const record = getHistory().find((item) => item.id === button.dataset.historyDuplicate); if (!record) return;
      fillForm(record.input); $('historyStatus').textContent = 'Plan duplicated into the planner. Adjust inputs and run again.';
    }));
    $$('[data-history-delete]').forEach((button) => button.addEventListener('click', () => {
      setHistory(getHistory().filter((item) => item.id !== button.dataset.historyDelete)); historyCompare.delete(button.dataset.historyDelete); renderHistory();
    }));
    $$('[data-history-compare]').forEach((box) => box.addEventListener('change', () => {
      if (box.checked) historyCompare.add(box.dataset.historyCompare); else historyCompare.delete(box.dataset.historyCompare); renderHistory();
    }));
  }

  function compareHistory() {
    const records = getHistory().filter((item) => historyCompare.has(item.id));
    if (records.length < 2) { $('historyStatus').textContent = 'Select at least two saved plans to compare.'; return; }
    $('historyComparison').innerHTML = `<div class="sky-table-wrap"><table class="sky-table"><thead><tr><th>Plan</th><th>Date</th><th>Location</th><th>Product</th><th>Status</th><th>Score</th><th>Action</th></tr></thead><tbody>${records.map((record) => `<tr><td>${escapeHtml(new Date(record.createdAt).toLocaleString())}</td><td>${escapeHtml(record.input.date)}</td><td>${escapeHtml(record.result.location)}</td><td>${escapeHtml(record.result.product)}</td><td><span class="sky-mini-status ${record.result.status.toLowerCase().replace(/[^a-z]/g, '')}">${record.result.status}</span></td><td>${record.result.score}</td><td>${escapeHtml(record.result.action)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function fillForm(input) {
    Object.entries({ skyLocation: input.locationId, skyDate: input.date, skyPax: input.pax, guestType: input.guestType, experienceType: input.experienceType, skyLanguage: input.language, pickupOrigin: input.origin, earliestStart: input.earliestStart, latestFinish: input.latestFinish, transportMode: input.transport, riskTolerance: input.riskTolerance, campLighting: input.campLighting, guideLevel: input.guideLevel, operationalNotes: input.notes }).forEach(([id, value]) => { if ($(id) && value != null) $(id).value = value; });
    $$('input[name="equipment"]').forEach((box) => { box.checked = (input.equipment || []).includes(box.value); });
    $$('input[name="operational-flag"]').forEach((box) => { box.checked = (input.specialNotes || []).includes(box.value); });
  }

  function exportCurrent(analysis) {
    const payload = { product: 'InfraSky', version: DATA.version, generatedAt: new Date().toISOString(), plan: analysis.input, result: { score: analysis.score, status: analysis.status, confidence: analysis.confidence, decision: analysis.bestAction, location: analysis.location, weather: analysis.weather, astronomy: analysis.astro, timeline: analysis.timeline, integrationPayloads: {
      infraDispatch: { location: analysis.location.name, tourDate: analysis.input.date, pickupOrigin: analysis.input.origin, recommendedPickupTime: analysis.timeline.pickup == null ? null : minutesToTime(analysis.timeline.pickup), arrivalTime: minutesToTime(analysis.timeline.arrival), setupTime: minutesToTime(analysis.timeline.setup), returnDepartureTime: minutesToTime(analysis.timeline.departure), vehicleRequirements: analysis.location.vehicleRequirement, driverNotes: $('driverOutput').textContent, guideNotes: $('guideOutput').textContent, riskNotes: analysis.risks },
      infraQuote: { productType: analysis.product.label, location: analysis.location.name, groupSize: analysis.input.pax, transferMinutes: analysis.timeline.transfer, equipment: analysis.input.equipment, guideLevel: analysis.input.guideLevel, premiumNight: analysis.premium, suggestedAddOns: ['Telescope', 'Astrophotography', 'Private astronomer', 'Premium dinner', 'Arabic astronomy storytelling'] }
    } } };
    downloadFile(`infrasky-plan-${analysis.input.date}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  }

  function reportLine(value) {
    return escapeHtml(String(value || '')).split('\n').map((line) => `<p>${line || '&nbsp;'}</p>`).join('');
  }

  function printableSkyReport(analysis) {
    const outputs = outputsFor(analysis);
    const t = analysis.timeline;
    const best = analysis.bestConstellation || bestConstellationPlan(analysis);
    const meteors = analysis.activeMeteors.length ? analysis.activeMeteors.map((item) => `${item.name} (${item.delta} day(s) from peak)`).join(', ') : 'No active major meteor window';
    const rows = [
      ['Show decision', analysis.operationalDecision],
      ['InfraSky score', `${analysis.score} / 100`],
      ['Confidence', `${analysis.confidence} · ${analysis.sourceMode}`],
      ['Date', dateLabel(analysis.input.date)],
      ['Location', `${analysis.location.name}, ${analysis.location.emirate}`],
      ['Coordinates', `${Number(analysis.location.latitude).toFixed(4)}, ${Number(analysis.location.longitude).toFixed(4)}`],
      ['Product', analysis.product.label],
      ['Guests', `${analysis.input.pax} · ${analysis.input.guestType} · ${analysis.input.language}`],
      ['Best viewing', `${minutesToTime(t.viewingStart)}-${minutesToTime(t.viewingEnd)}`],
      ['Pickup', t.pickup == null ? 'Self-drive / agreed point' : `${minutesToTime(t.pickup)} from ${analysis.input.origin}`],
      ['Arrival / setup', `${minutesToTime(t.arrival)} / ${minutesToTime(t.setup)}`],
      ['Return departure', minutesToTime(t.departure)],
      ['Best constellation', `${best.name} · ${best.bestTime} · ${best.direction}`],
      ['Meteor window', meteors],
      ['Moon', `${analysis.astro.moonPhase} · ${round(analysis.astro.moonIllumination)}% illuminated`],
      ['Weather', `${round(analysis.weather.cloud)}% cloud · ${round(analysis.weather.rain)}% rain · ${round(analysis.weather.wind)} km/h wind`],
      ['Dust / visibility', `PM10 ${round(analysis.weather.pm10)} µg/m³ · ${round(analysis.weather.visibility)} km visibility`],
      ['Vehicle', analysis.location.vehicleRequirement],
      ['Data source', analysis.weather.source]
    ];
    return `<!doctype html><html><head><meta charset="utf-8"/><title>InfraSky Operation Report</title><style>
      @page{size:A4;margin:12mm}
      *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#111827;margin:0;background:#fff;line-height:1.38}
      .report{max-width:190mm;margin:0 auto}.header{display:flex;justify-content:space-between;gap:18px;border:2px solid #07162d;border-radius:12px;padding:14px;margin-bottom:12px;background:#f8fafc}
      .brand{font-weight:900;color:#07162d;font-size:22px}.meta{text-align:right;color:#475569;font-size:11px}.decision{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0 12px}
      .decision div,.box{border:1px solid #cbd5e1;border-radius:10px;padding:10px;background:#fff}.decision span,.box h2{display:block;color:#765c20;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin:0 0 5px}
      .decision strong{display:block;color:#07162d;font-size:18px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.line{display:grid;grid-template-columns:38% 62%;border-bottom:1px solid #e5e7eb;padding:5px 0;font-size:11px}.line b{color:#334155}
      h1{font-size:24px;line-height:1.05;margin:0 0 5px;color:#07162d}h2{font-size:13px}.box{break-inside:avoid;margin:8px 0}.box p{font-size:11px;margin:3px 0;white-space:pre-wrap}.wide{grid-column:1/-1}.risk li{font-size:11px;margin:3px 0}
      .footer{margin-top:12px;border-top:1px solid #cbd5e1;padding-top:8px;color:#64748b;font-size:10px} @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.report{max-width:none}}
    </style></head><body><main class="report">
      <section class="header"><div><div class="brand">InfraSky</div><h1>Operation Report</h1><p>Prepared for field operation, guide briefing and management review.</p></div><div class="meta">Generated ${escapeHtml(new Date().toLocaleString())}<br/>Static MVP · Re-check 72h / 24h / on site</div></section>
      <section class="decision"><div><span>Decision</span><strong>${escapeHtml(analysis.operationalDecision)}</strong></div><div><span>Score</span><strong>${analysis.score}/100</strong></div><div><span>Confidence</span><strong>${escapeHtml(analysis.confidence)}</strong></div></section>
      <section class="box"><h2>Operation summary</h2>${rows.map(([label, value]) => `<div class="line"><b>${escapeHtml(label)}</b><span>${escapeHtml(value)}</span></div>`).join('')}</section>
      <section class="grid"><div class="box risk"><h2>Why this decision</h2><ul>${analysis.reasons.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div class="box risk"><h2>Main risks</h2><ul>${analysis.risks.map((item) => `<li>${escapeHtml(item)}</li>`).join('') || '<li>No major warnings generated.</li>'}</ul></div></section>
      <section class="grid"><div class="box"><h2>Guide briefing</h2>${reportLine(outputs.guide)}</div><div class="box"><h2>Driver & camp briefing</h2>${reportLine(outputs.driverCamp)}</div></section>
      <section class="grid"><div class="box"><h2>Guest WhatsApp message</h2>${reportLine(outputs.guest)}</div><div class="box"><h2>SOP & escalation</h2>${reportLine(outputs.sop)}</div></section>
      <section class="grid"><div class="box"><h2>Quote & pricing signals</h2>${reportLine(outputs.quote)}</div><div class="box"><h2>Mobile field checklist</h2>${reportLine(outputs.checklist)}</div></section>
      <section class="box"><h2>Sky & story report</h2>${reportLine(outputs.skyStory)}</section>
      <div class="footer">InfraSky separates public forecast windows from annual planning estimates. Final operation authority remains with the on-site operating team.</div>
    </main><script>window.onload=function(){setTimeout(function(){window.focus();window.print();},250)};</script></body></html>`;
  }

  async function printSkyOperationReport() {
    if (!latestAnalysis) await runPlanner();
    if (!latestAnalysis) return;
    const win = window.open('', '_blank');
    if (!win) { window.print(); return; }
    win.document.open();
    win.document.write(printableSkyReport(latestAnalysis));
    win.document.close();
  }

  let latestAnalysis = null;
  async function runPlanner() {
    const input = getInput();
    const location = getLocation(input.locationId);
    const button = $('runInfraSky');
    button.disabled = true; button.textContent = 'Checking conditions…';
    $('analysisLoading').hidden = false; $('analysisError').hidden = true;
    try {
      const roughAstro = astronomyFor(input.date, location);
      const targetMinutes = Math.max(roughAstro.astroEnd + 50, timeToMinutes(input.earliestStart, 1170));
      const weather = await fetchConditionData(location, input.date, targetMinutes);
      latestAnalysis = analyze(input, location, weather, false);
      renderAnalysis(latestAnalysis);
      renderOperatingCalendar(input);
      if (!annualRows.length) { $('annualYear').value = dateFromIso(input.date).getUTCFullYear(); generateAnnual(input); }
      renderComparison(input);
      $('liveDataStatus').textContent = latestAnalysis.weather.source;
    } catch (error) {
      const fallback = { ...seasonWeather(input.date), isForecast: false, isAirForecast: false, source: 'Forecast unavailable due to a network or browser error. Conservative estimated planning model used.' };
      latestAnalysis = analyze(input, location, fallback, false);
      renderAnalysis(latestAnalysis);
      renderOperatingCalendar(input); renderComparison(input);
      $('analysisError').hidden = false;
      $('analysisError').textContent = 'Live forecast could not be retrieved. Results below use conservative planning estimates; re-check 72 and 24 hours before operation.';
    } finally {
      $('analysisLoading').hidden = true; button.disabled = false; button.textContent = 'Run InfraSky';
    }
  }

  function setupTabs() {
    $$('[data-sky-tab]').forEach((button) => button.addEventListener('click', () => {
      const target = button.dataset.skyTab;
      $$('[data-sky-tab]').forEach((tab) => { tab.classList.toggle('active', tab === button); tab.setAttribute('aria-selected', String(tab === button)); });
      $$('.sky-tab-panel').forEach((panel) => { panel.hidden = panel.id !== target; });
    }));
  }

  function bindEvents() {
    $('runInfraSky').addEventListener('click', runPlanner);
    $('saveSkyPlan').addEventListener('click', () => latestAnalysis ? savePlan(latestAnalysis) : $('historyStatus').textContent = 'Run an InfraSky analysis first.');
    $('exportSkyJson').addEventListener('click', () => latestAnalysis && exportCurrent(latestAnalysis));
    $('printSkyReport').addEventListener('click', printSkyOperationReport);
    $('copyDispatchPayload').addEventListener('click', () => latestAnalysis && copyText(JSON.stringify({ location: latestAnalysis.location.name, date: latestAnalysis.input.date, pickup: latestAnalysis.timeline.pickup == null ? null : minutesToTime(latestAnalysis.timeline.pickup), arrival: minutesToTime(latestAnalysis.timeline.arrival), vehicle: latestAnalysis.location.vehicleRequirement, risks: latestAnalysis.risks }, null, 2), $('copyDispatchPayload')));
    $('copyQuotePayload').addEventListener('click', () => latestAnalysis && copyText(JSON.stringify({ product: latestAnalysis.product.label, location: latestAnalysis.location.name, pax: latestAnalysis.input.pax, transfer: latestAnalysis.timeline.transfer, equipment: latestAnalysis.input.equipment, guide: latestAnalysis.input.guideLevel, premium: latestAnalysis.premium }, null, 2), $('copyQuotePayload')));
    $('buildAnnual').addEventListener('click', () => generateAnnual(getInput()));
    $('annualMonth').addEventListener('change', renderAnnualRows);
    $('annualSeason').addEventListener('change', renderAnnualRows);
    $('annualConstellation').addEventListener('change', renderAnnualRows);
    $('annualMeteor')?.addEventListener('change', renderAnnualRows);
    $('annualStatus').addEventListener('change', renderAnnualRows);
    $$('[data-annual-export]').forEach((button) => button.addEventListener('click', () => annualCsv(button.dataset.annualExport)));
    $('runLocationComparison').addEventListener('click', () => renderComparison(getInput()));
    $('compareSavedPlans').addEventListener('click', compareHistory);
    $('skyDate').addEventListener('change', () => { $('daysAway').textContent = `${dayDifference($('skyDate').value)} day(s) from today`; renderTimeAdvisor(true); });
    $('skyLocation').addEventListener('change', () => { renderLocationBrief(); renderTimeAdvisor(true); renderComparison(getInput()); });
    $('pickupOrigin').addEventListener('change', renderLocationBrief);
    ['experienceType', 'guestType'].forEach((id) => $(id)?.addEventListener('change', () => renderTimeAdvisor(true)));
    bindCopyButtons();
  }

  function init() {
    const app = $('infraSkyApp');
    if (!app) return;
    populateLocations(); populateProducts(); populateConstellationFilter();
    $('skyDate').value = localIsoToday();
    $('annualYear').value = dateFromIso(localIsoToday()).getUTCFullYear();
    $('daysAway').textContent = 'Today';
    $('liveDataStatus').textContent = 'No date analysed yet. InfraSky will request a forecast when the selected date is inside the provider forecast window; otherwise it uses an estimated planning model.';
    renderTimeAdvisor(true);
    setupTabs(); bindEvents(); renderHistory();
    renderOperatingCalendar(getInput()); generateAnnual(getInput()); renderComparison(getInput());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
