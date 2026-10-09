/* Public offline reading only. Quotation drafts remain in localStorage. */
const VERSION = 'ahmed-portfolio-v37-shared-frame';
const PREFIX = 'ahmed-portfolio-';
const POLICIES = {
  pages: { limit: 40, age: 14 * 86400000 },
  images: { limit: 48, age: 30 * 86400000 },
  assets: { limit: 64, age: 30 * 86400000 },
  documents: { limit: 8, age: 7 * 86400000 }
};
const SHELL = `${VERSION}-shell`;
const STAMP = 'x-offline-stored-at';
const queues = new Map();
self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL).then(cache => cache.add(new Request('/offline/index.html', { cache: 'reload' }))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && !key.startsWith(VERSION + '-')).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
function groupFor(request, url) {
  if (request.mode === 'navigate') return 'pages';
  if (/\.(webp|avif|png|jpe?g|svg|gif|ico)$/i.test(url.pathname)) return 'images';
  if (/\.(pdf|docx)$/i.test(url.pathname)) return 'documents';
  if (/\.(css|js|woff2?|json|webmanifest)$/i.test(url.pathname)) return 'assets';
  return null;
}
function fresh(response, group) {
  return response && Date.now() - Number(response.headers.get(STAMP) || 0) < POLICIES[group].age;
}
async function store(group, request, response) {
  if (!response.ok || response.type === 'opaque' || /no-store|private/i.test(response.headers.get('cache-control') || '')) return;
  if (Number(response.headers.get('content-length')) > 4 * 1024 * 1024) return;
  const body = await response.arrayBuffer();
  if (body.byteLength > 4 * 1024 * 1024) return;
  const headers = new Headers(response.headers);
  // Fetch exposes decoded bytes; do not retain transport encoding/length headers.
  headers.delete('content-encoding'); headers.delete('content-length');
  headers.set(STAMP, String(Date.now()));
  const previous = queues.get(group) || Promise.resolve();
  const work = previous.catch(() => {}).then(async () => {
    const cache = await caches.open(`${VERSION}-${group}`);
    await cache.delete(request); // Reinsertion makes eviction oldest-first.
    await cache.put(request, new Response(body, { status: response.status, statusText: response.statusText, headers }));
    const keys = await cache.keys();
    for (const key of keys) if (!fresh(await cache.match(key), group)) await cache.delete(key);
    const remaining = await cache.keys();
    await Promise.all(remaining.slice(0, Math.max(0, remaining.length - POLICIES[group].limit)).map(key => cache.delete(key)));
  });
  queues.set(group, work); await work;
}
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || /^\/(api|private|drafts)(\/|$)/.test(url.pathname) || request.headers.has('authorization') || request.headers.has('range')) return;
  const group = groupFor(request, url); if (!group) return;
  // Network-first revalidates ordinary URLs as well as versioned assets.
  const network = fetch(new Request(request, { cache: 'no-cache' }));
  event.waitUntil(network.then(response => store(group, request, response.clone())).catch(() => {}));
  event.respondWith((async () => {
    let timer;
    try {
      return await Promise.race([network, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Offline timeout')), 5000); })]);
    } catch (_) {
      const cache = await caches.open(`${VERSION}-${group}`), cached = await cache.match(request);
      if (fresh(cached, group)) return cached;
      if (group === 'pages') return (await caches.match('/offline/index.html')) || Response.error();
      return Response.error();
    } finally { clearTimeout(timer); }
  })());
});
