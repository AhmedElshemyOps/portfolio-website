/* Ahmed Mahmoud Portfolio — consolidated website JavaScript.
   Shared navigation, accessible interaction utilities, and InfraDispatch planner logic. */
'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

(function removeRemovedArticleWidgets(){
  function clean(){
    const oldName = 'article-' + 'audio';
    const oldData = 'data-article-' + 'audio';
    const oldControl = 'data-' + 'audio';
    document.querySelectorAll('.' + oldName + '-tool,[' + oldData + '],[' + oldControl + '-play],[' + oldControl + '-stop],[' + oldControl + '-rate],[' + oldControl + '-voice]').forEach((element) => {
      const widget = element.closest('.' + oldName + '-tool,[' + oldData + ']') || element;
      widget.remove();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean);
  else clean();
  window.addEventListener('load', clean);
  if ('MutationObserver' in window) {
    const observer = new MutationObserver(clean);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

function setupNavigation() {
  const menuButton = $('[data-menu-button]');
  const nav = $('[data-nav]');
  if (!menuButton || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  };

  menuButton.type = 'button';
  menuButton.setAttribute('aria-expanded', 'false');

  menuButton.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });

  $$('.nav a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      menuButton.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  }, { passive: true });
}

function setupActiveNavigation() {
  const current = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('#')[0];
    if (href === current || (current === 'index.html' && href === 'index.html')) {
      link.setAttribute('aria-current', 'page');
    }
  });
}

function setupImageDecoding() {
  $$('img').forEach((image) => {
    if (!image.hasAttribute('decoding')) image.setAttribute('decoding', 'async');
    if (!image.hasAttribute('loading') && !image.closest('.portrait-card')) {
      image.setAttribute('loading', 'lazy');
    }
  });
}

function setupArticleTools() {
  const progress = $('.progress, .article-progress');
  if (progress) {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      progress.style.width = `${percentage}%`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  const toc = $('[data-auto-toc]');
  const article = $('.article-body, .article-content');
  if (toc && article) {
    const headings = $$('h2', article).slice(0, 10);
    if (headings.length) {
      const list = document.createElement('ol');
      headings.forEach((heading, index) => {
        if (!heading.id) heading.id = `section-${index + 1}`;
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#${heading.id}`;
        link.textContent = heading.textContent.trim();
        item.appendChild(link);
        list.appendChild(item);
      });
      toc.replaceChildren(Object.assign(document.createElement('h3'), { textContent: 'On this page' }), list);
    }
  }
}

function setupStatCounters() {
  const counters = $$('[data-counter]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      const element = entry.target;
      const target = Number(element.dataset.counter);
      if (!Number.isFinite(target)) return;
      const suffix = element.dataset.suffix || '';
      const start = performance.now();
      const duration = 700;
      const render = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = `${Math.round(target * eased).toLocaleString()}${suffix}`;
        if (progress < 1) requestAnimationFrame(render);
      };
      element.dataset.counted = 'true';
      requestAnimationFrame(render);
      observer.unobserve(element);
    });
  }, { threshold: .4 });

  counters.forEach((counter) => observer.observe(counter));
}


function copyTextAsync(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const copied = document.execCommand('copy');
      textarea.remove();
      if (copied) resolve();
      else reject(new Error('Copy command was not supported.'));
    } catch (error) {
      textarea.remove();
      reject(error);
    }
  });
}

function setupCopyButtons() {
  $$('[data-copy-target]').forEach((button) => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target || button.dataset.copyReady) return;

    const panel = button.closest('.article-prompt');
    const status = panel ? $('[data-copy-status]', panel) : null;
    const originalLabel = button.textContent.trim();
    button.dataset.copyReady = 'true';

    button.addEventListener('click', async () => {
      try {
        await copyTextAsync(target.textContent.trim());
        button.classList.add('is-copied');
        button.innerHTML = '<span aria-hidden="true">✓</span> Copied';
        if (status) status.textContent = 'The complete prompt has been copied to your clipboard.';
        window.setTimeout(() => {
          button.classList.remove('is-copied');
          button.innerHTML = '<span aria-hidden="true">⧉</span> Copy prompt';
          if (status) status.textContent = '';
        }, 2200);
      } catch (error) {
        if (status) status.textContent = 'Copy was blocked by this browser. Select the prompt text and copy it manually.';
        button.focus();
      }
    });
  });
}

setupNavigation();
setupActiveNavigation();
setupImageDecoding();
setupArticleTools();
setupCopyButtons();
setupStatCounters();

/*
  InfraDispatch Enhanced Planner
  --------------------------------
  Purpose:
  - Keep the public page simple.
  - Keep the operational database hidden inside the planner.
  - Convert pickup/drop-off inputs into a dispatch decision.
  - Add route score, split recommendation, operational reasons, and messages.

  Notes:
  - This is still a front-end beta. The time estimates are operational heuristics,
    not live Google traffic data.
  - The code is defensive: extra output boxes are used only if they exist in HTML.
*/

const defaultLocations = [];

const LOCATION_DATA_PATH = './data/locations.json';
const LOCATION_DB_KEY = 'infradispatch_locations_v5_operational_enhanced';
let locations = [];

async function loadPlannerLocationData() {
  const embeddedLocations = window.INFRADISPATCH_LOCATIONS;
  if (Array.isArray(embeddedLocations) && embeddedLocations.length) {
    locations = embeddedLocations;
    return;
  }

  try {
    const response = await fetch(LOCATION_DATA_PATH);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const remoteLocations = await response.json();
    if (!Array.isArray(remoteLocations)) throw new Error('Planner location dataset is not an array.');
    locations = remoteLocations;
  } catch (error) {
    console.warn('InfraDispatch location data is unavailable. Load assets/js/infradispatch-locations.js before main.js.', error);
    locations = [];
  }
}

const PLANNER_RULES = {
  maxPickupWindow: 60,
  maxZonesPerVehicle: 3,
  maxPaxPerVehicle: 20,
  maxStopsPerVehicle: 5,
  pickupServiceMinutes: 6,
  dropoffServiceMinutes: 5,
  defaultFirstArrival: '09:15',
  defaultLastDepart: '16:30',
  delayEscalationMinutes: 10
};

const zoneMatrix = {
  'Yas Island': {
    'Yas Island': 8, 'Saadiyat Island': 22, Corniche: 35, 'Abu Dhabi City': 32, 'Al Maryah Island': 28,
    'Airport Area': 14, 'Mina Zayed': 34, 'Al Ain': 95, Liwa: 170
  },
  'Saadiyat Island': {
    'Yas Island': 22, 'Saadiyat Island': 8, Corniche: 24, 'Abu Dhabi City': 20, 'Al Maryah Island': 16,
    'Airport Area': 28, 'Mina Zayed': 18, 'Al Ain': 105, Liwa: 185
  },
  Corniche: {
    'Yas Island': 35, 'Saadiyat Island': 24, Corniche: 8, 'Abu Dhabi City': 14, 'Al Maryah Island': 16,
    'Airport Area': 30, 'Mina Zayed': 16, 'Al Ain': 105, Liwa: 175
  },
  'Abu Dhabi City': {
    'Yas Island': 32, 'Saadiyat Island': 20, Corniche: 14, 'Abu Dhabi City': 8, 'Al Maryah Island': 12,
    'Airport Area': 25, 'Mina Zayed': 14, 'Al Ain': 100, Liwa: 170
  },
  'Al Maryah Island': {
    'Yas Island': 28, 'Saadiyat Island': 16, Corniche: 16, 'Abu Dhabi City': 12, 'Al Maryah Island': 8,
    'Airport Area': 25, 'Mina Zayed': 12, 'Al Ain': 100, Liwa: 175
  },
  'Airport Area': {
    'Yas Island': 14, 'Saadiyat Island': 28, Corniche: 30, 'Abu Dhabi City': 25, 'Al Maryah Island': 25,
    'Airport Area': 8, 'Mina Zayed': 32, 'Al Ain': 85, Liwa: 160
  },
  'Mina Zayed': {
    'Yas Island': 34, 'Saadiyat Island': 18, Corniche: 16, 'Abu Dhabi City': 14, 'Al Maryah Island': 12,
    'Airport Area': 32, 'Mina Zayed': 8, 'Al Ain': 110, Liwa: 180
  },
  'Al Ain': {
    'Yas Island': 95, 'Saadiyat Island': 105, Corniche: 105, 'Abu Dhabi City': 100, 'Al Maryah Island': 100,
    'Airport Area': 85, 'Mina Zayed': 110, 'Al Ain': 12, Liwa: 185
  },
  Liwa: {
    'Yas Island': 170, 'Saadiyat Island': 185, Corniche: 175, 'Abu Dhabi City': 170, 'Al Maryah Island': 175,
    'Airport Area': 160, 'Mina Zayed': 180, 'Al Ain': 185, Liwa: 18
  },
  'Madinat Zayed': {
    'Yas Island': 155, 'Saadiyat Island': 170, Corniche: 162, 'Abu Dhabi City': 158, 'Al Maryah Island': 160,
    'Airport Area': 150, 'Mina Zayed': 168, 'Al Ain': 175, Liwa: 85, 'Madinat Zayed': 10, Ruwais: 95
  },
  Ruwais: {
    'Yas Island': 235, 'Saadiyat Island': 248, Corniche: 240, 'Abu Dhabi City': 236, 'Al Maryah Island': 238,
    'Airport Area': 228, 'Mina Zayed': 246, 'Al Ain': 255, Liwa: 140, 'Madinat Zayed': 95, Ruwais: 10
  }
};

const i18n = {
  en: {
    driverTitle: 'Driver Dispatch', guideTitle: 'Guide Briefing', guestTitle: 'Guest Message', opsTitle: 'Operations Summary',
    gm: 'Good morning', pickup: 'Pickup sequence', dropoff: 'Drop-off sequence', adults: 'Adults', children: 'Child/infant', seat: 'Child seat',
    vehicle: 'Vehicle recommendation', split: 'Split route', yes: 'Yes', no: 'No', route: 'Route', note: 'Note', score: 'Route score', risk: 'Risk', reason: 'Reason',
    itil: 'ITIL v4 service continuity note',
    itilText: 'Escalate delays above 10 minutes immediately to protect service level and guest experience.',
    guestBody: 'Please be ready at the hotel lobby 10 minutes before pickup. Thank you.',
    guideBody: 'Monitor readiness, child-seat compliance, and report service-impacting delays immediately.'
  },
  ar: {
    driverTitle: 'رسالة السائق', guideTitle: 'إحاطة المرشد', guestTitle: 'رسالة الضيف', opsTitle: 'ملخص العمليات',
    gm: 'صباح الخير', pickup: 'تسلسل الاستلام', dropoff: 'تسلسل الإنزال', adults: 'البالغون', children: 'الأطفال/الرضع', seat: 'مقعد الطفل',
    vehicle: 'توصية المركبة', split: 'تقسيم المسار', yes: 'نعم', no: 'لا', route: 'المسار', note: 'ملاحظة', score: 'تقييم المسار', risk: 'المخاطر', reason: 'السبب',
    itil: 'ملاحظة استمرارية الخدمة وفق ITIL v4',
    itilText: 'يرجى تصعيد أي تأخير يتجاوز 10 دقائق فورًا لحماية مستوى الخدمة وتجربة الضيف.',
    guestBody: 'يرجى التواجد في لوبي الفندق قبل 10 دقائق من وقت الاستلام. شكرًا.',
    guideBody: 'يرجى متابعة جاهزية الضيوف ومتطلبات مقاعد الأطفال والإبلاغ فورًا عن أي تأخير يؤثر على الخدمة.'
  },
  fr: {
    driverTitle: 'Message Chauffeur', guideTitle: 'Brief Guide', guestTitle: 'Message Client', opsTitle: 'Résumé Opérations',
    gm: 'Bonjour', pickup: 'Séquence de ramassage', dropoff: 'Séquence de dépose', adults: 'Adultes', children: 'Enfants/nourrissons', seat: 'Siège enfant',
    vehicle: 'Véhicule recommandé', split: 'Itinéraire divisé', yes: 'Oui', no: 'Non', route: 'Itinéraire', note: 'Note', score: 'Score itinéraire', risk: 'Risque', reason: 'Raison',
    itil: 'Note de continuité de service ITIL v4',
    itilText: 'Escaladez immédiatement tout retard supérieur à 10 minutes pour protéger le niveau de service.',
    guestBody: 'Merci d\'être prêt au lobby de l\'hôtel 10 minutes avant le pickup.',
    guideBody: 'Surveillez la préparation des clients, les sièges enfant et signalez tout retard impactant le service.'
  },
  it: {
    driverTitle: 'Messaggio Autista', guideTitle: 'Brief Guida', guestTitle: 'Messaggio Ospite', opsTitle: 'Riepilogo Operativo',
    gm: 'Buongiorno', pickup: 'Sequenza pickup', dropoff: 'Sequenza drop-off', adults: 'Adulti', children: 'Bambini/neonati', seat: 'Seggiolino',
    vehicle: 'Veicolo consigliato', split: 'Percorso diviso', yes: 'Si', no: 'No', route: 'Percorso', note: 'Nota', score: 'Punteggio percorso', risk: 'Rischio', reason: 'Motivo',
    itil: 'Nota continuita servizio ITIL v4',
    itilText: 'Escalare immediatamente ritardi oltre 10 minuti per proteggere il livello di servizio.',
    guestBody: 'Si prega di essere pronti nella lobby 10 minuti prima del pickup.',
    guideBody: 'Monitorare puntualita ospiti, seggiolini e segnalare subito ritardi critici.'
  },
  es: {
    driverTitle: 'Mensaje Conductor', guideTitle: 'Brief Guia', guestTitle: 'Mensaje Huesped', opsTitle: 'Resumen Operativo',
    gm: 'Buenos dias', pickup: 'Secuencia de recogida', dropoff: 'Secuencia de regreso', adults: 'Adultos', children: 'Ninos/bebes', seat: 'Asiento infantil',
    vehicle: 'Vehiculo recomendado', split: 'Ruta dividida', yes: 'Si', no: 'No', route: 'Ruta', note: 'Nota', score: 'Puntuacion ruta', risk: 'Riesgo', reason: 'Razon',
    itil: 'Nota de continuidad ITIL v4',
    itilText: 'Escalar retrasos mayores a 10 minutos inmediatamente para proteger el nivel de servicio.',
    guestBody: 'Por favor, este listo en el lobby 10 minutos antes de la recogida.',
    guideBody: 'Controle puntualidad, asientos infantiles y reporte retrasos que impacten el servicio.'
  },
  ru: {
    driverTitle: 'Сообщение водителю', guideTitle: 'Бриф гиду', guestTitle: 'Сообщение гостю', opsTitle: 'Оперативное резюме',
    gm: 'Доброе утро', pickup: 'Последовательность посадки', dropoff: 'Последовательность высадки', adults: 'Взрослые', children: 'Дети/младенцы', seat: 'Детское кресло',
    vehicle: 'Рекомендованный транспорт', split: 'Разделение маршрута', yes: 'Да', no: 'Нет', route: 'Маршрут', note: 'Примечание', score: 'Оценка маршрута', risk: 'Риск', reason: 'Причина',
    itil: 'Заметка ITIL v4 по непрерывности сервиса',
    itilText: 'Задержки более 10 минут нужно сразу эскалировать для сохранения уровня сервиса.',
    guestBody: 'Пожалуйста, будьте готовы в лобби отеля за 10 минут до посадки.',
    guideBody: 'Контролируйте готовность гостей, детские кресла и сразу сообщайте о критических задержках.'
  }
};

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatTime(total) {
  total = round5(Number(total));
  total = ((Number(total) % 1440) + 1440) % 1440;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function parseTime(value, fallback = '09:15') {
  const raw = String(value || fallback).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return parseTime(fallback, '09:15');
  const h = Math.min(23, Math.max(0, Number(match[1])));
  const m = Math.min(59, Math.max(0, Number(match[2])));
  return h * 60 + m;
}

function round5(m) {
  return Math.round(Number(m) / 5) * 5;
}

function safeText(sel, value) {
  const el = $(sel);
  if (el) el.textContent = value;
}

function safeHtml(sel, value) {
  const el = $(sel);
  if (el) el.innerHTML = value;
}

function setClass(sel, className) {
  const el = $(sel);
  if (!el) return;
  el.className = className;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function cloneLocations(items) {
  return JSON.parse(JSON.stringify(items));
}

function loadLocationsFromStorage() {
  try {
    const raw = localStorage.getItem(LOCATION_DB_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) locations = parsed;
  } catch (err) {
    // localStorage can be unavailable in restricted preview contexts; default database remains active.
  }
}

function saveLocationsToStorage() {
  try {
    localStorage.setItem(LOCATION_DB_KEY, JSON.stringify(locations));
  } catch (err) {
    // Storage can be unavailable in private/restricted contexts; planner still works for the current session.
  }
}

function routeUrl(stops) {
  const clean = stops.filter(Boolean);
  if (clean.length < 2) return 'https://www.google.com/maps';
  const origin = encodeURIComponent(clean[0]);
  const destination = encodeURIComponent(clean[clean.length - 1]);
  const waypoints = clean.slice(1, -1).map(encodeURIComponent).join('|');
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`;
}

function waLink(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

async function shortenUrl(url) {
  // Keep direct Google Maps links for reliability and better UX.
  // External shorteners add redirects and can fail in some browsers.
  return '';
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function totalPax(entries) {
  return entries.reduce((sum, entry) => sum + Number(entry.adults || 0) + Number(entry.children || 0), 0);
}

function getZoneMinutes(fromZone, toZone) {
  if (!fromZone || !toZone) return 20;
  if (zoneMatrix[fromZone]?.[toZone] !== undefined) return zoneMatrix[fromZone][toZone];
  if (zoneMatrix[toZone]?.[fromZone] !== undefined) return zoneMatrix[toZone][fromZone];
  return fromZone === toZone ? 8 : 25;
}

function recommendVehicle(pax, routeCount = 1, luggageSeatLoad = 0) {
  const operationalPax = pax + Math.max(0, Number(luggageSeatLoad || 0));
  const paxPerRoute = Math.ceil(operationalPax / Math.max(1, routeCount));

  if (routeCount > 1) {
    return {
      vehicle: `${routeCount} vehicles recommended`,
      cap: routeCount * PLANNER_RULES.maxPaxPerVehicle,
      split: true,
      detail: paxPerRoute <= 12 ? 'Van / minibus mix depending on luggage' : 'Minibus / coaster per route',
      operationalPax
    };
  }

  if (operationalPax <= 4) return { vehicle: 'Sedan (up to 4 pax)', cap: 4, split: false, detail: 'Suitable for small private transfer', operationalPax };
  if (operationalPax <= 6) return { vehicle: 'SUV / MPV (up to 6 pax)', cap: 6, split: false, detail: 'Better for small family or luggage', operationalPax };
  if (operationalPax <= 12) return { vehicle: 'Van (up to 12 pax)', cap: 12, split: false, detail: 'Suitable for small group operation', operationalPax };
  if (operationalPax <= 20) return { vehicle: 'Minibus / Coaster (up to 20 pax)', cap: 20, split: false, detail: 'Suitable for medium group operation', operationalPax };

  const needed = Math.ceil(operationalPax / PLANNER_RULES.maxPaxPerVehicle);
  return {
    vehicle: `Split operation: ${needed} vehicles required`,
    cap: needed * PLANNER_RULES.maxPaxPerVehicle,
    split: true,
    detail: 'Passenger/luggage load exceeds one-vehicle threshold',
    operationalPax
  };
}

function orderPickupsTowardFirstAttraction(entries, firstAttraction) {
  return [...entries].sort((a, b) => {
    const zoneA = getZoneMinutes(a.loc.zone, firstAttraction.zone);
    const zoneB = getZoneMinutes(b.loc.zone, firstAttraction.zone);
    if (zoneA !== zoneB) return zoneB - zoneA;
    return a.loc.name.localeCompare(b.loc.name);
  });
}

function estimatePickupWindow(orderedEntries, firstAttraction) {
  if (!orderedEntries.length) return 0;

  let minutes = 0;
  orderedEntries.forEach((entry, index) => {
    minutes += PLANNER_RULES.pickupServiceMinutes;
    const next = orderedEntries[index + 1]?.loc || firstAttraction;
    minutes += getZoneMinutes(entry.loc.zone, next.zone);
  });

  return round5(minutes);
}

function orderDropoffsFromLastAttraction(lastAttraction, dropoffList) {
  const remaining = [...dropoffList].filter(Boolean);
  const ordered = [];
  let current = lastAttraction;

  while (remaining.length) {
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    remaining.forEach((loc, index) => {
      const score = getZoneMinutes(current.zone, loc.zone);
      if (score < bestScore || (score === bestScore && loc.name.localeCompare(remaining[bestIndex].name) < 0)) {
        bestScore = score;
        bestIndex = index;
      }
    });
    const [next] = remaining.splice(bestIndex, 1);
    ordered.push(next);
    current = next;
  }

  return ordered;
}

function estimateDropoffWindow(lastAttraction, dropoffList) {
  if (!dropoffList.length) return 0;

  let minutes = 0;
  let current = lastAttraction;
  dropoffList.forEach((drop) => {
    minutes += getZoneMinutes(current.zone, drop.zone);
    minutes += PLANNER_RULES.dropoffServiceMinutes;
    current = drop;
  });

  return round5(minutes);
}

function estimateDarbTolls(stops, pickupStartMinutes, transferMode) {
  if (!Array.isArray(stops) || stops.length < 2) return 0;
  const peak = (() => {
    const hh = Math.floor((pickupStartMinutes % 1440) / 60);
    return (hh >= 7 && hh < 10) || (hh >= 17 && hh < 20);
  })();
  const zones = unique(stops.map((name) => locations.find((l) => l.name === name)?.zone));
  const transitions = Math.max(0, zones.length - 1);
  if (!peak) return transferMode === 'airport_transfer' ? Math.min(2, transitions + 1) : Math.min(1, transitions);
  if (transferMode === 'airport_transfer') return Math.max(1, Math.min(4, transitions + 1));
  return Math.min(3, transitions);
}

function getRiskLevel(score) {
  if (score >= 85) return 'Good';
  if (score >= 70) return 'Acceptable';
  if (score >= 50) return 'Watch';
  return 'Risky';
}

function scorePlan({ entries, orderedEntries, first, total, pickupWindow, pickupWindowTarget }) {
  const zones = unique(entries.map((entry) => entry.loc.zone));
  const reasons = [];
  let score = 100;

  if (total > PLANNER_RULES.maxPaxPerVehicle) {
    const over = total - PLANNER_RULES.maxPaxPerVehicle;
    score -= Math.min(35, 15 + over);
    reasons.push(`Pax count is ${total}, above the ${PLANNER_RULES.maxPaxPerVehicle}-pax single vehicle threshold.`);
  }

  if (pickupWindow > pickupWindowTarget) {
    score -= Math.min(30, pickupWindow - pickupWindowTarget + 10);
    reasons.push(`Estimated pickup window is ${pickupWindow} minutes; target is ${pickupWindowTarget} minutes.`);
  }

  if (zones.length > PLANNER_RULES.maxZonesPerVehicle) {
    score -= (zones.length - PLANNER_RULES.maxZonesPerVehicle) * 10;
    reasons.push(`${zones.length} pickup zones detected; target is maximum ${PLANNER_RULES.maxZonesPerVehicle} zones per vehicle.`);
  }

  if (orderedEntries.length > PLANNER_RULES.maxStopsPerVehicle) {
    score -= (orderedEntries.length - PLANNER_RULES.maxStopsPerVehicle) * 5;
    reasons.push(`${orderedEntries.length} pickup stops detected; consider reducing stops per vehicle.`);
  }

  if (first.name.includes('Sheikh Zayed Grand Mosque')) {
    score -= 5;
    reasons.push('First attraction is timing-sensitive; keep buffer for access, dress code, and group entry.');
  }

  const childSeatCount = entries.filter((entry) => entry.childSeat === 'Required').length;
  if (childSeatCount > 0) {
    reasons.push(`${childSeatCount} pickup point(s) require child-seat confirmation before dispatch.`);
  }

  if (!reasons.length) {
    reasons.push('Plan is within the current beta rules for pax, zones, pickup window, and service flow.');
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return {
    score,
    level: getRiskLevel(score),
    reasons,
    zones
  };
}

function buildSplitGroups(entries) {
  const sorted = [...entries].sort((a, b) => {
    const zoneCompare = a.loc.zone.localeCompare(b.loc.zone);
    if (zoneCompare !== 0) return zoneCompare;
    return (Number(b.adults) + Number(b.children)) - (Number(a.adults) + Number(a.children));
  });

  const groups = [];

  sorted.forEach((entry) => {
    const pax = Number(entry.adults || 0) + Number(entry.children || 0);
    let target = groups.find((group) => {
      const groupZones = unique([...group.entries.map((x) => x.loc.zone), entry.loc.zone]);
      return group.pax + pax <= PLANNER_RULES.maxPaxPerVehicle && groupZones.length <= PLANNER_RULES.maxZonesPerVehicle;
    });

    if (!target) {
      target = { entries: [], pax: 0 };
      groups.push(target);
    }

    target.entries.push(entry);
    target.pax += pax;
  });

  return groups;
}

function buildSupervisorOptions(entries, first, total, pickupWindow, scoreData, pickupWindowTarget) {
  const splitGroups = buildSplitGroups(entries);
  const splitNeeded = total > PLANNER_RULES.maxPaxPerVehicle
    || pickupWindow > pickupWindowTarget
    || scoreData.zones.length > PLANNER_RULES.maxZonesPerVehicle;

  const optionOneRisk = splitNeeded ? 'Risky' : scoreData.level;
  const optionOne = {
    title: 'Option 1 · Single vehicle',
    badge: optionOneRisk,
    recommended: !splitNeeded,
    summary: splitNeeded
      ? 'Lowest cost, but operationally risky for timing, pax, or zone spread.'
      : 'Recommended for this plan because it stays inside the beta dispatch rules.',
    routes: [{ label: 'Main route', url: routeUrl([...orderPickupsTowardFirstAttraction(entries, first).map((e) => e.loc.name), first.name]) }]
  };

  const optionTwo = {
    title: `Option 2 · Smart split (${splitGroups.length} route${splitGroups.length > 1 ? 's' : ''})`,
    badge: splitNeeded ? 'Recommended' : 'Optional',
    recommended: splitNeeded,
    summary: splitNeeded
      ? 'Best balance between guest experience, pickup window, and vehicle capacity.'
      : 'Optional backup if operations wants a faster guest pickup experience.',
    routes: splitGroups.map((group, index) => ({
      label: `Route ${index + 1} · ${group.pax} pax · ${unique(group.entries.map((e) => e.loc.zone)).join(' / ')}`,
      url: routeUrl([...orderPickupsTowardFirstAttraction(group.entries, first).map((e) => e.loc.name), first.name])
    }))
  };

  const zoneGroups = Object.values(entries.reduce((acc, entry) => {
    acc[entry.loc.zone] ||= { zone: entry.loc.zone, entries: [], pax: 0 };
    acc[entry.loc.zone].entries.push(entry);
    acc[entry.loc.zone].pax += Number(entry.adults || 0) + Number(entry.children || 0);
    return acc;
  }, {}));

  const optionThree = {
    title: `Option 3 · Zone-based control (${zoneGroups.length} zone${zoneGroups.length > 1 ? 's' : ''})`,
    badge: zoneGroups.length > 1 ? 'Supervisor view' : 'Simple',
    recommended: false,
    summary: 'Useful when a supervisor wants to assign vehicles by area, hotel cluster, or supplier responsibility.',
    routes: zoneGroups.map((group, index) => ({
      label: `Zone ${index + 1} · ${group.zone} · ${group.pax} pax`,
      url: routeUrl([...group.entries.map((e) => e.loc.name), first.name])
    }))
  };

  return [optionOne, optionTwo, optionThree];
}

function renderSupervisorOptions(options) {
  const box = $('#supervisorOptions');
  if (!box) return;

  box.innerHTML = options.map((option) => `
    <article class="dispatch-option ${option.recommended ? 'recommended' : ''}">
      <div class="dispatch-option-head">
        <h4>${escapeHtml(option.title)}</h4>
        <span>${escapeHtml(option.badge)}</span>
      </div>
      <p>${escapeHtml(option.summary)}</p>
      <div class="dispatch-option-routes">
        ${option.routes.map((route) => `<a href="${route.url}" target="_blank" rel="noopener">${escapeHtml(route.label)}</a>`).join('')}
      </div>
    </article>
  `).join('');
}

function renderWarnings(scoreData) {
  const box = $('#riskWarnings');
  if (!box) return;

  box.innerHTML = scoreData.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('');
}

function renderSequence(container, rows) {
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="empty-state">No stops yet. Add locations or load the demo plan.</div>';
    return;
  }
  container.innerHTML = rows.map((s, i) => `
    <div class="stop">
      <span class="stop-num">${i + 1}</span>
      <div>
        <strong>${escapeHtml(s.name)}</strong>
        <small>${escapeHtml(s.meta || `${s.zone} · ${s.note}`)}</small>
      </div>
      <time>${escapeHtml(s.time)}</time>
    </div>
  `).join('');
}

function addResultButtons(input, box, kind) {
  if (!input || !box) return;
  const q = input.value.trim().toLowerCase();
  const matches = locations
    .filter((l) => `${l.name} ${l.type} ${l.category || ''} ${l.stars || ''} ${l.zone} ${l.note}`.toLowerCase().includes(q))
    .slice(0, 10);

  box.innerHTML = matches.map((l) => `
    <button type="button" data-kind="${kind}" data-name="${escapeHtml(l.name)}">
      <strong>${escapeHtml(l.name)}</strong>
      <small>${escapeHtml(l.category || l.type)}${l.stars ? ` · ${l.stars}-star` : ''} · ${escapeHtml(l.zone)} · ${escapeHtml(l.note)} · ${escapeHtml(l.access || 'Access to verify')}</small>
    </button>
  `).join('');
}

function populateSelect(select, preferredValue) {
  if (!select) return;
  select.innerHTML = '';
  locations.forEach((l, i) => {
    select.add(new Option(`${l.name} · ${l.zone}`, i));
  });
  select.value = preferredValue;
}

function toCsvRow(values) {
  return values.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text);
    return;
  }

  const temp = document.createElement('textarea');
  temp.value = text;
  temp.setAttribute('readonly', '');
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
}

function todayIso() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - tzOffset * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDateReadable(value) {
  if (!value) return 'Not specified';
  const parts = String(value).split('-');
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function buildManifestRef(serviceDate, minutes) {
  const dateToken = String(serviceDate || todayIso()).replace(/-/g, '');
  const timeToken = formatTime(minutes || 0).replace(':', '');
  return `ID-${dateToken}-${timeToken}`;
}

function val(id, fallback = '') {
  const el = $(`#${id}`);
  return (el?.value || fallback || '').trim();
}

if (document.body.dataset.page === 'infra') {
  const locByName = (name, fallbackIndex = 0) => locations.find((l) => l.name === name) || locations[fallbackIndex];
  const buildSamplePickups = () => [
    { loc: locByName('W Abu Dhabi - Yas Island', 0), adults: 6, children: 1, childSeat: 'Required', note: 'Family room booking. Confirm child seat.' },
    { loc: locByName('St. Regis Saadiyat Island Resort', 1), adults: 8, children: 1, childSeat: 'Required', note: 'Group entrance / lobby coordination.' },
    { loc: locByName('Conrad Abu Dhabi Etihad Towers', 2), adults: 8, children: 1, childSeat: 'Not required', note: 'Main lobby pickup.' }
  ].filter((entry) => entry.loc);
  const buildSampleDropoffs = () => [
    locByName('Conrad Abu Dhabi Etihad Towers', 2),
    locByName('St. Regis Saadiyat Island Resort', 1),
    locByName('W Abu Dhabi - Yas Island', 0)
  ].filter(Boolean);

  let pickupEntries = [];

  let dropoffs = [];

  const firstSelect = $('#firstAttraction');

  async function initInfraPlanner() {
    await loadPlannerLocationData();
    loadLocationsFromStorage();
    pickupEntries = buildSamplePickups();
    dropoffs = buildSampleDropoffs();
    refreshPlannerLocationSelectors();
    renderPickupEntries();
    updateFlowUi();
    renderPlan();
    renderDatabaseStats();
  }
  const lastSelect = $('#lastAttraction');
  const languageSelect = $('#languageSelect');
  const languageChips = $$('#languageChips .lang-chip');
  const serviceType = $('#serviceType');
  const generatePlanBtn = $('#generatePlanBtn');
  const jumpMessagesBtn = $('#jumpMessagesBtn');
  const downloadManifestPdfBtn = $('#downloadManifestPdfBtn');
  const planStatus = $('#planStatus');
  const pickupEntriesWrap = $('#pickupEntries');
  const adminSection = $('#adminDb');
  const adminLocationForm = $('#adminLocationForm');
  const adminLocationsList = $('#adminLocationsList');
  const adminEditIndex = $('#adminEditIndex');
  const importLocationsJsonInput = $('#importLocationsJson');
  const importLocationsCsvInput = $('#importLocationsCsv');
  const manifestSummary = $('#manifestSummary');
  const dropoffBlock = $('#dropoffBlock');
  const addMorePickupBtn = $('#addMorePickupBtn');
  const addMoreDropoffBtn = $('#addMoreDropoffBtn');
  const pickupSearchInput = $('#pickupSearch');
  const dropoffSearchInput = $('#dropoffSearch');
  const serviceDateInput = $('#serviceDate');
  if (serviceDateInput && !serviceDateInput.value) serviceDateInput.value = todayIso();
  let activeLang = 'en';
  let latestShortMainRoute = '';
  let latestShortSplitRoute = '';

  populateSelect(firstSelect, String(locations.findIndex((l) => l.name === 'Sheikh Zayed Grand Mosque')));
  populateSelect(lastSelect, String(locations.findIndex((l) => l.name === 'Louvre Abu Dhabi')));

  function refreshPlannerLocationSelectors() {
    const prevFirst = firstSelect?.value;
    const prevLast = lastSelect?.value;
    populateSelect(firstSelect, prevFirst ?? '0');
    populateSelect(lastSelect, prevLast ?? '0');
  }

  function refreshPickupDropoffRefs() {
    pickupEntries = pickupEntries
      .map((entry) => {
        const updated = locations.find((l) => l.name === entry.loc.name);
        return updated ? { ...entry, loc: updated } : null;
      })
      .filter(Boolean);
    dropoffs = dropoffs
      .map((loc) => locations.find((l) => l.name === loc.name))
      .filter(Boolean);
  }

  function resetAdminForm() {
    if (!adminLocationForm) return;
    adminLocationForm.reset();
    if (adminEditIndex) adminEditIndex.value = '';
  }

  function renderAdminLocations() {
    if (!adminLocationsList) return;
    adminLocationsList.innerHTML = locations.map((loc, idx) => `
      <div class="admin-location-row">
        <strong>${escapeHtml(loc.name)}</strong>
        <div class="admin-location-meta">${escapeHtml(loc.category || loc.type)}${loc.stars ? ` · ${loc.stars}-star` : ''} · ${escapeHtml(loc.zone)} · ${escapeHtml(loc.note)}</div>
        <div class="admin-location-actions">
          <button type="button" data-admin-edit="${idx}">Edit</button>
          <button type="button" data-admin-delete="${idx}">Delete</button>
        </div>
      </div>
    `).join('');
  }

  function renderDatabaseStats() {
    const zones = unique(locations.map((loc) => loc.zone));
    const attractions = locations.filter((loc) => (loc.category || '').toLowerCase() === 'attraction');
    const museums = locations.filter((loc) => String(loc.type || '').toLowerCase().includes('museum'));
    const hotels = locations.filter((loc) => (loc.category || '').toLowerCase() === 'hotel');
    safeText('#dbTotalCount', String(locations.length));
    safeText('#dbTotalCountMini', String(locations.length));
    safeText('#dbAttractionCount', String(attractions.length));
    safeText('#dbMuseumCount', String(museums.length));
    safeText('#dbZoneCount', String(zones.length));
    safeText('#dbHotelCount', String(hotels.length));
  }

  function updateFlowUi() {
    const flow = $('#serviceFlow')?.value || 'roundtrip';
    const transferMode = $('#transferMode')?.value || 'city_tour';
    const dropModeField = $('#dropMode')?.closest('label');
    const luggageField = $('#luggageCount')?.closest('label');
    const pickupListWrap = $('#pickupList')?.closest('div');
    const dropoffListWrap = $('#dropoffList')?.closest('div');

    if (dropModeField) dropModeField.hidden = flow !== 'roundtrip';
    if (dropoffBlock) dropoffBlock.hidden = flow !== 'roundtrip' && flow !== 'dropoff_only';
    if (pickupListWrap) pickupListWrap.hidden = flow === 'dropoff_only';
    if (dropoffListWrap) dropoffListWrap.hidden = flow === 'pickup_only';
    if (luggageField) luggageField.hidden = transferMode !== 'airport_transfer';
  }

  function renderPickupEntries() {
    if (!pickupEntriesWrap) return;

    pickupEntriesWrap.innerHTML = pickupEntries.map((entry, i) => `
      <div class="entry-card" data-entry-index="${i}">
        <div class="entry-card-head">
          <h4>${escapeHtml(entry.loc.name)}</h4>
          <div class="entry-card-actions">
            <button type="button" data-move-up="${i}">↑</button>
            <button type="button" data-move-down="${i}">↓</button>
            <button type="button" data-remove-pickup="${i}">Remove</button>
          </div>
        </div>
        <small>${escapeHtml(entry.loc.category || entry.loc.type)}${entry.loc.stars ? ` · ${entry.loc.stars}-star` : ''} · ${escapeHtml(entry.loc.zone)} · ${escapeHtml(entry.loc.note)}</small>
        <div class="field-row">
          <label>Adults
            <input type="number" min="0" data-pickup-field="adults" data-entry-index="${i}" value="${Number(entry.adults || 0)}" />
          </label>
          <label>Child / infant
            <input type="number" min="0" data-pickup-field="children" data-entry-index="${i}" value="${Number(entry.children || 0)}" />
          </label>
        </div>
        <div class="field-row">
          <label>Child seat
            <select data-pickup-field="childSeat" data-entry-index="${i}">
              <option ${entry.childSeat === 'Required' ? 'selected' : ''}>Required</option>
              <option ${entry.childSeat === 'Not required' ? 'selected' : ''}>Not required</option>
            </select>
          </label>
          <label>Optional note
            <input type="text" data-pickup-field="note" data-entry-index="${i}" value="${escapeHtml(entry.note)}" placeholder="Wheelchair / delayed guest / etc." />
          </label>
        </div>
      </div>
    `).join('');
  }

  function bindSearch(inputId, boxId, kind) {
    const input = $(inputId);
    const box = $(boxId);
    if (!input || !box) return;

    input.addEventListener('input', () => addResultButtons(input, box, kind));
    input.addEventListener('focus', () => addResultButtons(input, box, kind));

    box.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const loc = locations.find((l) => l.name === btn.dataset.name);
      if (!loc) return;

      if (kind === 'pickup') {
        if (!pickupEntries.some((x) => x.loc.name === loc.name)) {
          pickupEntries.push({ loc, adults: 2, children: 0, childSeat: 'Not required', note: '' });
        }
        renderPickupEntries();
      } else if (!dropoffs.some((x) => x.name === loc.name)) {
        dropoffs.push(loc);
      }

      input.value = '';
      box.innerHTML = '';
      renderPlan();
    });

    document.addEventListener('click', (e) => {
      if (!box.contains(e.target) && e.target !== input) box.innerHTML = '';
    });
  }

  function buildPlanData() {
    const lang = activeLang || languageSelect?.value || 'en';
    const t = i18n[lang] || i18n.en;
    const serviceFlow = $('#serviceFlow')?.value || 'roundtrip';
    const dropMode = $('#dropMode')?.value || 'same';
    const transferMode = $('#transferMode')?.value || 'city_tour';
    const isAirportTransfer = transferMode === 'airport_transfer';
    const pickupWindowTarget = Number($('#pickupWindowTarget')?.value || PLANNER_RULES.maxPickupWindow);
    const luggageCount = Number($('#luggageCount')?.value || 0);
    const pettyCashType = $('#pettyCashType')?.value || 'none';
    const pettyCashAmount = Number($('#pettyCashAmount')?.value || 0);
    const pettyCashNote = ($('#pettyCashNote')?.value || '').trim();
    const guideSpecialNote = $('#guideSpecialNote')?.value || 'normal';
    const guideCustomNote = ($('#guideCustomNote')?.value || '').trim();
    const first = locations[Number(firstSelect?.value || 6)] || locations[6];
    const last = locations[Number(lastSelect?.value || 5)] || locations[5];
    const firstArrival = round5(parseTime($('#firstArrivalTime')?.value, PLANNER_RULES.defaultFirstArrival));
    const lastDepart = round5(parseTime($('#lastDepartTime')?.value, PLANNER_RULES.defaultLastDepart));
    const orderedEntries = orderPickupsTowardFirstAttraction(pickupEntries, first);
    const pickupWindow = serviceFlow === 'dropoff_only' ? 0 : estimatePickupWindow(orderedEntries, first);
    const pickupStart = firstArrival - pickupWindow;
    const dropoffWindow = serviceFlow === 'pickup_only' ? 0 : estimateDropoffWindow(last, dropoffs);
    const totalAdults = pickupEntries.reduce((a, b) => a + Number(b.adults || 0), 0);
    const totalChildren = pickupEntries.reduce((a, b) => a + Number(b.children || 0), 0);
    const total = totalAdults + totalChildren;
    const luggageSeatLoad = isAirportTransfer ? Math.ceil(luggageCount / 2) : 0;
    const scoreData = scorePlan({ entries: pickupEntries, orderedEntries, first, total: total + luggageSeatLoad, pickupWindow, pickupWindowTarget });
    const supervisorOptions = buildSupervisorOptions(pickupEntries, first, total + luggageSeatLoad, pickupWindow, scoreData, pickupWindowTarget);
    const recommendedOption = supervisorOptions.find((option) => option.recommended) || supervisorOptions[0];
    const routeCount = recommendedOption.title.includes('Smart split') ? recommendedOption.routes.length : 1;
    const vehicle = recommendVehicle(total, routeCount, luggageSeatLoad);

    return {
      t,
      serviceFlow,
      dropMode,
      transferMode,
      isAirportTransfer,
      luggageCount,
      pickupWindowTarget,
      luggageSeatLoad,
      pettyCashType,
      pettyCashAmount,
      pettyCashNote,
      guideSpecialNote,
      guideCustomNote,
      first,
      last,
      orderedEntries,
      pickupWindow,
      pickupStart,
      firstArrival,
      lastDepart,
      dropoffWindow,
      totalAdults,
      totalChildren,
      total,
      scoreData,
      supervisorOptions,
      recommendedOption,
      vehicle
    };
  }

  function renderPlan() {
    const plan = buildPlanData();
    const {
      t, serviceFlow, dropMode, transferMode, isAirportTransfer, luggageCount, pickupWindowTarget, luggageSeatLoad,
      pettyCashType, pettyCashAmount, pettyCashNote, guideSpecialNote, guideCustomNote,
      first, last, orderedEntries, pickupStart, firstArrival, lastDepart, totalAdults, totalChildren, total,
      scoreData, supervisorOptions, recommendedOption, vehicle
    } = plan;

    const serviceDate = val('serviceDate', todayIso());
    const driverName = val('driverName', 'Driver TBC');
    const driverMobile = val('driverMobile', 'Mobile TBC');
    const guideName = val('guideName', 'Guide TBC');
    const guideMobile = val('guideMobile', 'Mobile TBC');
    const vehiclePlate = val('vehiclePlate', 'Plate TBC');
    const vehicleTypeManual = val('vehicleTypeManual', 'Vehicle model TBC');
    const approvedBy = val('approvedBy', 'Operations Supervisor TBC');
    const manifestRef = buildManifestRef(serviceDate, pickupStart);

    const pickupRows = orderedEntries.map((entry, i) => {
      const seat = entry.childSeat === 'Required' ? t.yes : t.no;
      const notePart = entry.note ? ` · ${t.note}: ${entry.note}` : '';
      return {
        name: entry.loc.name,
        time: formatTime(pickupStart + i * 15),
        meta: `${entry.loc.zone} · ${t.adults}: ${entry.adults} · ${t.children}: ${entry.children} · ${t.seat}: ${seat}${notePart}`,
        zone: entry.loc.zone,
        note: entry.loc.note
      };
    }).concat(serviceFlow === 'dropoff_only' ? [] : [{ ...first, name: `First attraction: ${first.name}`, time: formatTime(firstArrival), meta: `${first.zone} · ${first.note}` }]);

    const effectiveDropoffs = dropMode === 'same'
      ? orderDropoffsFromLastAttraction(last, orderedEntries.map((entry) => entry.loc))
      : orderDropoffsFromLastAttraction(last, dropoffs);
    const effectiveDropoffCount = serviceFlow === 'pickup_only' ? 0 : effectiveDropoffs.length;
    const dropoffRows = (serviceFlow === 'pickup_only' ? [] : [{ ...last, name: `Last attraction: ${last.name}`, time: formatTime(lastDepart), meta: `${last.zone} · ${last.note}` }])
      .concat(effectiveDropoffs.map((l, i) => ({
        ...l,
        time: formatTime(lastDepart + 25 + i * 20),
        meta: `${l.zone} · ${l.note}`
      })));

    renderSequence($('#pickupList'), pickupRows);
    renderSequence($('#dropoffList'), dropoffRows);
    renderSupervisorOptions(supervisorOptions);
    renderWarnings(scoreData);

    let mainRouteStops = [];
    if (serviceFlow === 'pickup_only') {
      mainRouteStops = [
        ...orderedEntries.map((e) => e.loc.name),
        first.name
      ];
    } else if (serviceFlow === 'dropoff_only') {
      mainRouteStops = [
        last.name,
        ...effectiveDropoffs.map((l) => l.name)
      ];
    } else {
      mainRouteStops = [
        ...orderedEntries.map((e) => e.loc.name),
        first.name,
        last.name,
        ...effectiveDropoffs.map((l) => l.name)
      ];
    }
    const mainRoute = routeUrl(mainRouteStops);
    const mapLink = $('#mapLink');
    if (mapLink) mapLink.href = mainRoute;
    const copyMainBtn = $('#copyMainRouteBtn');
    const copySplitBtn = $('#copySplitRouteBtn');

    const splitAnchor = $('#mapLinkSplit');
    const splitRoutes = recommendedOption.routes || [];
    if (splitAnchor && recommendedOption.recommended && splitRoutes.length > 1) {
      splitAnchor.href = splitRoutes[1].url;
      splitAnchor.textContent = 'Open second route map';
      splitAnchor.style.display = 'inline';
      if (copySplitBtn) {
        copySplitBtn.hidden = false;
        copySplitBtn.disabled = !latestShortSplitRoute;
      }
    } else if (splitAnchor) {
      splitAnchor.href = '#';
      splitAnchor.textContent = '';
      splitAnchor.style.display = 'none';
      latestShortSplitRoute = '';
      if (copySplitBtn) {
        copySplitBtn.hidden = true;
        copySplitBtn.disabled = true;
      }
    }

    latestShortMainRoute = mainRoute;
    if (copyMainBtn) {
      copyMainBtn.textContent = 'Copy Google Maps route';
      copyMainBtn.disabled = false;
    }

    if (splitAnchor && splitAnchor.style.display !== 'none' && splitRoutes.length > 1) {
      const splitRoute = splitRoutes[1].url;
      latestShortSplitRoute = splitRoute;
      if (copySplitBtn) {
        copySplitBtn.textContent = 'Copy second Google Maps route';
        copySplitBtn.disabled = false;
      }
    }

    const autoDarbTollCount = estimateDarbTolls(mainRouteStops, pickupStart, transferMode);
    const darbInput = $('#darbTollCount');
    if (darbInput) darbInput.value = String(autoDarbTollCount);

    const transferContext = `${String(transferMode).replace(/_/g, ' ')}${isAirportTransfer ? ` · luggage: ${luggageCount} (${luggageSeatLoad} seat load)` : ''}`;

    safeText('#serviceSnapshot', `${serviceType?.value || 'Tour / transfer'} · ${total} pax · ${transferContext}`);
    safeText('#vehicleRecommendation', `${vehicle.vehicle}${vehicle.detail ? ` · ${vehicle.detail}` : ''} · Operational load: ${vehicle.operationalPax}`);
    safeText('#splitRecommendation', recommendedOption.recommended ? `${t.yes} - ${recommendedOption.title}` : `${t.no} - single route suitable`);
    safeText('#zoningSummary', scoreData.zones.join(' • '));
    safeText('#routeScore', `${scoreData.score}/100 · ${scoreData.level}`);
    safeText('#routeReason', scoreData.reasons[0]);
    safeText('#pickupWindow', `${plan.pickupWindow} minutes (target ${pickupWindowTarget})`);
    safeText('#dropoffWindow', `${plan.dropoffWindow} minutes`);
    safeText('#zoneCount', `${scoreData.zones.length} zone${scoreData.zones.length === 1 ? '' : 's'}: ${scoreData.zones.join(', ')}`);
    setClass('#routeScoreBadge', `score-badge score-${scoreData.level.toLowerCase()}`);
    safeText('#routeScoreBadge', scoreData.level);

    const sequenceZones = mainRouteStops.map((name) => locations.find((loc) => loc.name === name)?.zone || '').filter(Boolean);
    const cleanSequenceZones = unique(sequenceZones);
    const sequenceText = mainRouteStops.length ? mainRouteStops.join(' → ') : 'Add pickup/drop-off locations to build a route.';
    const mainWhy = scoreData.reasons[0] || 'Plan is ready for operations review.';
    safeHtml('#routeNarrative', `<strong>Recommended sequence:</strong> ${escapeHtml(sequenceText)}<br><strong>Why:</strong> ${escapeHtml(mainWhy)}${cleanSequenceZones.length ? `<br><strong>Zones:</strong> ${escapeHtml(cleanSequenceZones.join(' → '))}` : ''}`);
    safeText('#topReasonInline', mainWhy);

    const pickupLine = pickupRows.length ? pickupRows.map((s) => `${s.time} ${s.name}`).join(', ') : 'N/A';
    const dropoffLine = dropoffRows.length ? dropoffRows.map((s) => `${s.time} ${s.name}`).join(', ') : 'N/A';
    const reasonLine = scoreData.reasons.join(' | ');
    const recommendedRouteLine = recommendedOption.routes.map((route) => route.label).join(' | ');
    const shortRouteForMessage = mainRoute;
    const guidePriorityNote = guideSpecialNote === 'vip'
      ? 'VIP guests. Special care required.'
      : guideSpecialNote === 'repeater'
        ? 'Repeater guest. Deliver personalized continuity.'
        : guideSpecialNote === 'custom'
          ? (guideCustomNote || 'Custom guide note selected.')
          : 'Normal service profile.';
    const pettyCashLine = pettyCashType === 'none'
      ? 'No petty cash assigned.'
      : `${pettyCashType} petty cash: AED ${pettyCashAmount}${pettyCashNote ? ` (${pettyCashNote})` : ''}.`;
    const pickupText = `${t.pickup}: ${pickupLine}`;
    const dropoffText = `${t.dropoff}: ${dropoffLine}`;
    const flowRouteBlock = serviceFlow === 'pickup_only'
      ? pickupText
      : serviceFlow === 'dropoff_only'
        ? dropoffText
        : `${pickupText}\n${dropoffText}`;
    const assignedVehicle = `${vehicleTypeManual} · ${vehiclePlate} · System recommendation: ${vehicle.vehicle}`;
    const driverMessage = `${t.gm}. ${t.driverTitle}
Manifest Ref: ${manifestRef}
Service date: ${formatDateReadable(serviceDate)}
Service: ${serviceType?.value || 'Tour / transfer'} (${transferContext})
Driver: ${driverName} · ${driverMobile}
Guide: ${guideName} · ${guideMobile}
Vehicle: ${assignedVehicle}
${flowRouteBlock}
Pax: ${t.adults} ${totalAdults}, ${t.children} ${totalChildren}
DARB toll gates: ${autoDarbTollCount}
${t.route}: ${shortRouteForMessage}
Escalation: report any delay above 10 minutes immediately.`;

    const attractionBlock = `First attraction: ${first.name} (${formatTime(firstArrival)})
Last attraction: ${last.name} (${formatTime(lastDepart)})`;
    const guideWindow = serviceFlow === 'dropoff_only'
      ? `Drop-off window: ${formatTime(lastDepart)} onwards (${plan.dropoffWindow} minutes)`
      : `Pickup window: ${formatTime(pickupStart)}-${formatTime(firstArrival)} (${plan.pickupWindow} minutes)`;
    const guideMessage = `${t.gm}. ${t.guideTitle}
Manifest Ref: ${manifestRef}
Service date: ${formatDateReadable(serviceDate)}
Guide: ${guideName} · ${guideMobile}
Driver: ${driverName} · ${driverMobile}
Vehicle: ${assignedVehicle}
${guideWindow}
${t.guideBody}
${attractionBlock}
Guide priority note: ${guidePriorityNote}
${t.reason}: ${reasonLine}
${t.itil}: ${t.itilText}`;

    const guestWelcome = `Dear Guest, we are pleased to confirm your ${serviceType?.value || 'tour'} service.`;
    const guestTiming = `Your pickup window is ${formatTime(pickupStart)} - ${formatTime(firstArrival)}. Kindly be ready at the hotel lobby or confirmed pickup point 10 minutes before your scheduled time.`;
    const guestHospitality = `Our team will support a smooth, comfortable, and well-coordinated experience.`;
    const guestMessage = `${t.gm}. ${t.guestTitle}
${guestWelcome}
${guestTiming}
${guestHospitality}`;

    const opsMessage = `${t.opsTitle}
Manifest Ref: ${manifestRef}
Service date: ${formatDateReadable(serviceDate)}
Service: ${serviceType?.value || 'Tour / transfer'}
Approved by: ${approvedBy}
Driver: ${driverName} · ${driverMobile}
Guide: ${guideName} · ${guideMobile}
Vehicle: ${assignedVehicle}
Flow: ${serviceFlow} · Drop mode: ${dropMode}
Transfer context: ${transferContext}
Pax: ${total} (${t.adults} ${totalAdults}, ${t.children} ${totalChildren})
Operational seat load: ${vehicle.operationalPax}
${t.score}: ${scoreData.score}/100 (${scoreData.level})
Top reason: ${scoreData.reasons[0]}
Recommended decision: ${recommendedOption.title}
Route groups: ${recommendedRouteLine}
DARB toll gates: ${autoDarbTollCount}
Petty cash: ${pettyCashLine}
Guide note: ${guidePriorityNote}
${t.reason}: ${reasonLine}`;



    safeText('#driverMessage', driverMessage);
    safeText('#guideMessage', guideMessage);
    safeText('#guestMessage', guestMessage);

    const allMessages = `[${t.driverTitle}]\n${driverMessage}\n\n[${t.guideTitle}]\n${guideMessage}\n\n[${t.guestTitle}]\n${guestMessage}`;
    if (manifestSummary) {
      manifestSummary.textContent = [
        `Manifest Ref: ${manifestRef}`,
        `Service date: ${formatDateReadable(serviceDate)}`,
        `Service: ${serviceType?.value || 'Tour / transfer'} (${transferContext})`,
        `Approved by: ${approvedBy}`,
        `Driver: ${driverName} · ${driverMobile}`,
        `Guide: ${guideName} · ${guideMobile}`,
        `Vehicle: ${assignedVehicle}`,
        `Flow: ${serviceFlow} · Drop mode: ${dropMode}`,
        `Pax total: ${total} (${totalAdults} adults, ${totalChildren} child/infant)`,
        `Pickup stops: ${serviceFlow === 'dropoff_only' ? 0 : orderedEntries.length} · Drop-off stops: ${effectiveDropoffCount}`,
        `Pickup window: ${formatTime(pickupStart)} - ${formatTime(firstArrival)} (${plan.pickupWindow} minutes)`,
        `Drop-off window: ${serviceFlow === 'pickup_only' ? 'N/A' : `${formatTime(lastDepart)} onwards (${plan.dropoffWindow} minutes)`}`,
        `Zones: ${scoreData.zones.join(', ') || 'N/A'}`,
        `Route score: ${scoreData.score}/100 (${scoreData.level})`,
        `Top reason: ${scoreData.reasons[0]}`,
        `Vehicle recommendation: ${vehicle.vehicle}`,
        `DARB toll gates: ${autoDarbTollCount}`,
        `Petty cash: ${pettyCashLine}`,
        `Guide note: ${guidePriorityNote}`,
        `Route: ${shortRouteForMessage}`,
        `Generated by InfraDispatch — Tourism Operations Dispatch Planning MVP`
      ].join('\n');
    }
    if (planStatus) {
      planStatus.textContent = 'Plan updated. You can copy route links, stakeholder messages, and the manifest.';
    }

    const waDriverLink = $('#waDriverLink');
    const waGuideLink = $('#waGuideLink');
    const waGuestLink = $('#waGuestLink');
    const waAllLink = $('#waAllLink');

    if (waDriverLink) waDriverLink.href = waLink(driverMessage);
    if (waGuideLink) waGuideLink.href = waLink(guideMessage);
    if (waGuestLink) waGuestLink.href = waLink(guestMessage);
    if (waAllLink) waAllLink.href = waLink(allMessages);
  }

  bindSearch('#pickupSearch', '#pickupResults', 'pickup');
  bindSearch('#dropoffSearch', '#dropoffResults', 'dropoff');

  if (pickupEntriesWrap) {
    pickupEntriesWrap.addEventListener('input', (e) => {
      const field = e.target.dataset.pickupField;
      if (!field) return;

      const idx = Number(e.target.dataset.entryIndex);
      const entry = pickupEntries[idx];
      if (!entry) return;

      if (field === 'adults' || field === 'children') {
        entry[field] = Math.max(0, Number(e.target.value || 0));
      } else {
        entry[field] = e.target.value;
      }

      renderPlan();
    });

    pickupEntriesWrap.addEventListener('change', (e) => {
      const field = e.target.dataset.pickupField;
      if (!field) return;

      const idx = Number(e.target.dataset.entryIndex);
      const entry = pickupEntries[idx];
      if (!entry) return;

      entry[field] = e.target.value;
      renderPlan();
    });
  }

  document.addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    const removeIdx = button.dataset.removePickup;
    const moveUpIdx = button.dataset.moveUp;
    const moveDownIdx = button.dataset.moveDown;
    if (moveUpIdx !== undefined) {
      const i = Number(moveUpIdx);
      if (i > 0) {
        [pickupEntries[i - 1], pickupEntries[i]] = [pickupEntries[i], pickupEntries[i - 1]];
        renderPickupEntries();
        renderPlan();
      }
      return;
    }
    if (moveDownIdx !== undefined) {
      const i = Number(moveDownIdx);
      if (i < pickupEntries.length - 1) {
        [pickupEntries[i + 1], pickupEntries[i]] = [pickupEntries[i], pickupEntries[i + 1]];
        renderPickupEntries();
        renderPlan();
      }
      return;
    }
    if (removeIdx === undefined) return;

    pickupEntries = pickupEntries.filter((_, i) => i !== Number(removeIdx));
    renderPickupEntries();
    renderPlan();
  });

  [
    'firstAttraction', 'lastAttraction', 'serviceType', 'firstArrivalTime', 'lastDepartTime',
    'serviceFlow', 'dropMode', 'transferMode', 'pickupWindowTarget', 'luggageCount',
    'pettyCashType', 'pettyCashAmount', 'pettyCashNote', 'guideSpecialNote', 'guideCustomNote',
    'serviceDate', 'driverName', 'driverMobile', 'guideName', 'guideMobile', 'vehiclePlate', 'vehicleTypeManual', 'approvedBy'
  ].forEach((id) => {
    const el = $(`#${id}`);
    if (el) el.addEventListener('change', renderPlan);
  });

  const serviceFlowSelect = $('#serviceFlow');
  if (serviceFlowSelect) {
    serviceFlowSelect.addEventListener('change', updateFlowUi);
  }
  const transferModeSelect = $('#transferMode');
  if (transferModeSelect) {
    transferModeSelect.addEventListener('change', updateFlowUi);
  }

  if (addMorePickupBtn && pickupSearchInput) {
    addMorePickupBtn.addEventListener('click', () => pickupSearchInput.focus());
  }
  if (addMoreDropoffBtn && dropoffSearchInput) {
    addMoreDropoffBtn.addEventListener('click', () => dropoffSearchInput.focus());
  }

  const resetPlan = $('#resetPlan');
  if (resetPlan) {
    resetPlan.addEventListener('click', () => {
      pickupEntries = buildSamplePickups();
      dropoffs = buildSampleDropoffs();
      if (serviceDateInput && !serviceDateInput.value) serviceDateInput.value = todayIso();
      renderPickupEntries();
      renderPlan();
      if (planStatus) planStatus.textContent = 'Demo plan loaded. Review the route, messages, and manifest.';
    });
  }
  const clearPlanBtn = $('#clearPlanBtn');
  if (clearPlanBtn) {
    clearPlanBtn.addEventListener('click', () => {
      pickupEntries = [];
      dropoffs = [];
      if (pickupSearchInput) pickupSearchInput.value = '';
      if (dropoffSearchInput) dropoffSearchInput.value = '';
      const pickupResults = $('#pickupResults');
      const dropoffResults = $('#dropoffResults');
      if (pickupResults) pickupResults.innerHTML = '';
      if (dropoffResults) dropoffResults.innerHTML = '';
      renderPickupEntries();
      renderPlan();
      if (planStatus) planStatus.textContent = 'Clear mode. Add pickup/drop-off locations or load the demo plan.';
    });
  }

  // Hidden admin mode shortcut: Ctrl/Cmd + Shift + A
  document.addEventListener('keydown', (e) => {
    if (!(e.shiftKey && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a')) return;
    if (!adminSection) return;
    adminSection.hidden = !adminSection.hidden;
    if (!adminSection.hidden) renderAdminLocations();
  });

  if (adminLocationForm) {
    adminLocationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const payload = {
        name: $('#adminName')?.value?.trim(),
        type: $('#adminType')?.value?.trim(),
        category: $('#adminCategory')?.value?.trim(),
        stars: Number($('#adminStars')?.value || 0) || null,
        zone: $('#adminZone')?.value?.trim(),
        note: $('#adminNote')?.value?.trim(),
        access: $('#adminAccess')?.value?.trim()
      };
      if (!payload.name || !payload.type || !payload.category || !payload.zone || !payload.note || !payload.access) return;

      const editIdx = adminEditIndex?.value === '' ? -1 : Number(adminEditIndex?.value);
      if (editIdx >= 0 && locations[editIdx]) locations[editIdx] = payload;
      else locations.push(payload);

      saveLocationsToStorage();
      refreshPlannerLocationSelectors();
      refreshPickupDropoffRefs();
      renderPickupEntries();
      renderAdminLocations();
      renderDatabaseStats();
      renderPlan();
      resetAdminForm();
    });
  }

  const adminResetForm = $('#adminResetForm');
  if (adminResetForm) adminResetForm.addEventListener('click', resetAdminForm);

  if (adminLocationsList) {
    adminLocationsList.addEventListener('click', (e) => {
      const editIdx = e.target.dataset.adminEdit;
      const deleteIdx = e.target.dataset.adminDelete;
      if (editIdx !== undefined) {
        const loc = locations[Number(editIdx)];
        if (!loc) return;
        if (adminEditIndex) adminEditIndex.value = String(editIdx);
        $('#adminName').value = loc.name || '';
        $('#adminType').value = loc.type || '';
        $('#adminCategory').value = loc.category || '';
        $('#adminStars').value = loc.stars || '';
        $('#adminZone').value = loc.zone || '';
        $('#adminNote').value = loc.note || '';
        $('#adminAccess').value = loc.access || '';
      }
      if (deleteIdx !== undefined) {
        const loc = locations[Number(deleteIdx)];
        if (!loc) return;
        locations = locations.filter((_, i) => i !== Number(deleteIdx));
        pickupEntries = pickupEntries.filter((x) => x.loc.name !== loc.name);
        dropoffs = dropoffs.filter((x) => x.name !== loc.name);
        saveLocationsToStorage();
        refreshPlannerLocationSelectors();
        refreshPickupDropoffRefs();
        renderPickupEntries();
        renderAdminLocations();
        renderDatabaseStats();
        renderPlan();
      }
    });
  }

  const exportLocationsJson = $('#exportLocationsJson');
  if (exportLocationsJson) {
    exportLocationsJson.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(locations, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'infradispatch-locations.json';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  const exportLocationsCsv = $('#exportLocationsCsv');
  if (exportLocationsCsv) {
    exportLocationsCsv.addEventListener('click', () => {
      const rows = [
        ['name', 'type', 'category', 'stars', 'zone', 'note', 'access'],
        ...locations.map((l) => [l.name, l.type, l.category || '', l.stars || '', l.zone, l.note, l.access || ''])
      ];
      const csv = rows.map(toCsvRow).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'infradispatch-locations.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  if (importLocationsJsonInput) {
    importLocationsJsonInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed) || !parsed.length) return;
      locations = parsed;
      saveLocationsToStorage();
      refreshPlannerLocationSelectors();
      refreshPickupDropoffRefs();
      renderPickupEntries();
      renderAdminLocations();
      renderDatabaseStats();
      renderPlan();
    });
  }

  if (importLocationsCsvInput) {
    importLocationsCsvInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) return;
      const parseLine = (line) => {
        const out = [];
        let cur = '';
        let inQ = false;
        for (let i = 0; i < line.length; i += 1) {
          const ch = line[i];
          if (ch === '"' && line[i + 1] === '"') { cur += '"'; i += 1; continue; }
          if (ch === '"') { inQ = !inQ; continue; }
          if (ch === ',' && !inQ) { out.push(cur); cur = ''; continue; }
          cur += ch;
        }
        out.push(cur);
        return out.map((x) => x.trim());
      };
      const headers = parseLine(lines[0]).map((h) => h.toLowerCase());
      const idx = (name) => headers.indexOf(name);
      const records = lines.slice(1).map((line) => parseLine(line)).map((row) => ({
        name: row[idx('name')] || '',
        type: row[idx('type')] || '',
        category: row[idx('category')] || row[idx('type')] || '',
        stars: Number(row[idx('stars')] || 0) || null,
        zone: row[idx('zone')] || '',
        note: row[idx('note')] || '',
        access: row[idx('access')] || ''
      })).filter((r) => r.name && r.type && r.zone && r.note);
      if (!records.length) return;
      locations = records;
      saveLocationsToStorage();
      refreshPlannerLocationSelectors();
      refreshPickupDropoffRefs();
      renderPickupEntries();
      renderAdminLocations();
      renderDatabaseStats();
      renderPlan();
    });
  }

  const resetLocationsDb = $('#resetLocationsDb');
  if (resetLocationsDb) {
    resetLocationsDb.addEventListener('click', () => {
      locations = cloneLocations(defaultLocations);
      localStorage.removeItem(LOCATION_DB_KEY);
      refreshPlannerLocationSelectors();
      refreshPickupDropoffRefs();
      renderPickupEntries();
      renderAdminLocations();
      renderDatabaseStats();
      renderPlan();
      resetAdminForm();
    });
  }

  const copyAllMessages = $('#copyAllMessages');
  if (copyAllMessages) {
    copyAllMessages.addEventListener('click', () => {
      const d = $('#driverMessage')?.textContent || '';
      const g = $('#guideMessage')?.textContent || '';
      const guest = $('#guestMessage')?.textContent || '';
      copyText(`[Driver]
${d}

[Guide]
${g}

[Guest]
${guest}`);
    });
  }
  const copyManifestBtn = $('#copyManifestBtn');
  if (copyManifestBtn) copyManifestBtn.addEventListener('click', () => copyText($('#manifestSummary')?.textContent || ''));
  function openManifestPrintWindow() {
    const title = serviceType?.value || 'InfraDispatch Service';
    const manifest = $('#manifestSummary')?.textContent || '';
    const win = window.open('', '_blank', 'width=980,height=1200');
    if (!win) return;
    win.document.write(`<html><head><title>${escapeHtml(title)} - Manifest</title><style>
      @page { size: A4; margin: 12mm; }
      html,body{margin:0;padding:0}
      body{font-family:Arial,sans-serif;color:#0f172a;line-height:1.42;background:#fff;}
      .page{max-width:185mm;margin:0 auto;}
      .manifest-header{display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #d6a11f;padding-bottom:10px;margin-bottom:12px;}
      .brand{font-weight:900;font-size:22px;letter-spacing:-.04em;color:#0b1730}.brand span{color:#d6a11f}.subtitle{text-align:right;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.12em}
      h1{font-size:19px;margin:0 0 8px;}
      .meta{font-size:12px;color:#475569;margin:0 0 12px;}
      .box{border:1px solid #dbe2ef;border-radius:10px;padding:12px;white-space:pre-wrap;font-size:12px;}
      .line{break-inside:avoid;page-break-inside:avoid;margin:0 0 4px;overflow-wrap:anywhere;}
      .footer{border-top:1px solid #e2e8f0;margin-top:12px;padding-top:8px;font-size:11px;color:#64748b;text-align:center;}
      @media print {
        .page{max-width:none}
        .box{border:1px solid #cbd5e1}
      }
    </style></head><body><div class="page"><div class="manifest-header"><div class="brand"><span>Infra</span>Dispatch</div><div class="subtitle">Tourism Operations<br>Dispatch Manifest</div></div><h1>${escapeHtml(title)} - Dispatch Manifest</h1><p class="meta">A4 print layout · Direct Google Maps route · Prepared for operations review</p><div class="box">${escapeHtml(manifest).split('\n').map((ln) => `<p class="line">${ln || '&nbsp;'}</p>`).join('')}</div><div class="footer">Generated by InfraDispatch — Tourism Operations Dispatch Planning MVP</div></div></body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  const printManifestBtn = $('#printManifestBtn');
  if (printManifestBtn) printManifestBtn.addEventListener('click', openManifestPrintWindow);
  if (downloadManifestPdfBtn) {
    downloadManifestPdfBtn.addEventListener('click', openManifestPrintWindow);
  }
  if (generatePlanBtn) {
    generatePlanBtn.addEventListener('click', () => {
      renderPlan();
      document.querySelector('#messages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (planStatus) {
        planStatus.textContent = 'Plan generated. Route links, messages, and manifest are ready.';
      }
    });
  }

  if (jumpMessagesBtn) {
    jumpMessagesBtn.addEventListener('click', () => {
      document.querySelector('#messages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  if (languageChips.length) {
    languageChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        activeLang = chip.dataset.lang || 'en';
        languageChips.forEach((c) => c.classList.toggle('active', c === chip));
        renderPlan();
      });
    });
  }

  const copyMainRouteBtn = $('#copyMainRouteBtn');
  if (copyMainRouteBtn) {
    copyMainRouteBtn.addEventListener('click', () => {
      if (latestShortMainRoute) copyText(latestShortMainRoute);
    });
  }
  const copySplitRouteBtn = $('#copySplitRouteBtn');
  if (copySplitRouteBtn) {
    copySplitRouteBtn.addEventListener('click', () => {
      if (latestShortSplitRoute) copyText(latestShortSplitRoute);
    });
  }

  const copyAllStakeholderMessages = $('#copyAllStakeholderMessages');
  if (copyAllStakeholderMessages) {
    copyAllStakeholderMessages.addEventListener('click', () => {
      const d = $('#driverMessage')?.textContent || '';
      const g = $('#guideMessage')?.textContent || '';
      const guest = $('#guestMessage')?.textContent || '';
      copyText(`[Driver]
${d}

[Guide]
${g}

[Guest]
${guest}`);
    });
  }

  $$('.copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!btn.dataset.copy) return;
      copyText($(`#${btn.dataset.copy}`)?.textContent || '');
    });
  });

  if (document.body.dataset.page === 'infra') {
    initInfraPlanner();
  }
}
(function(){
  function addProjectFallbackMenu(){
    if(document.querySelector('.dropdown-menu')) return;
    var nav=document.querySelector('[data-nav], .nav, .nav-links');
    if(!nav) return;
    var links=[].slice.call(nav.querySelectorAll('a'));
    var projectLink=links.find(function(a){return /projects/i.test((a.textContent||'').trim());});
    if(!projectLink || projectLink.dataset.projectFallback==='true') return;
    var depth=location.pathname.split('/').filter(Boolean).length>1?'../':'';
    var menu=document.createElement('div');
    menu.className='legacy-project-menu';
    menu.innerHTML='<a href="'+depth+'projects.html">All Projects</a><a href="'+depth+'infradispatch/">InfraDispatch · Dispatch Planner</a><a href="'+depth+'infracluster.html">InfraCluster · Hotel Clustering</a><a href="'+depth+'infrasky.html">InfraSky · Stargazing Planner</a><a href="'+depth+'infraquote.html">InfraQuote · Quotation Tool</a>';
    projectLink.dataset.projectFallback='true';
    projectLink.setAttribute('aria-haspopup','true');
    projectLink.setAttribute('aria-expanded','false');
    projectLink.parentNode.insertBefore(menu, projectLink.nextSibling);
    projectLink.addEventListener('click',function(event){
      event.preventDefault();
      var open=menu.classList.toggle('open');
      projectLink.setAttribute('aria-expanded',open?'true':'false');
    });
    document.addEventListener('click',function(event){
      if(event.target===projectLink || menu.contains(event.target)) return;
      menu.classList.remove('open');
      projectLink.setAttribute('aria-expanded','false');
    });
  }
  var style=document.createElement('style');
  style.textContent='.legacy-project-menu{display:none;position:absolute;z-index:80;background:#fff;color:#101828;border:1px solid #e5e7eb;border-radius:16px;box-shadow:0 20px 50px rgba(8,17,31,.16);padding:8px;min-width:270px}.legacy-project-menu.open{display:grid}.legacy-project-menu a{display:block!important;color:#101828!important;padding:9px 12px!important;border-radius:10px!important}.legacy-project-menu a:hover{background:#f3f5f8!important}@media(max-width:900px){.legacy-project-menu{position:static;box-shadow:none;border-radius:12px;margin:6px 0}}';
  if(document.head) document.head.appendChild(style);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',addProjectFallbackMenu); else addProjectFallbackMenu();
}());
