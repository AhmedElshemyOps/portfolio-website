/* Offline reading cache for previously opened public pages and assets. */
const VERSION = "ahmed-portfolio-v4";
const STATIC_CACHE = `${VERSION}-static`;
const READING_CACHE = `${VERSION}-reading`;
const APP_SHELL = ["/", "/knowledge/index.html", "/saved/index.html", "/offline/index.html", "/assets/css/design-tokens.css", "/assets/css/launch-pages.css", "/assets/js/site-config.js", "/assets/js/saved-reading.js"];
self.addEventListener("install", (event) => { event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  const isPage = request.mode === "navigate";
  event.respondWith((async () => {
    const cache = await caches.open(isPage ? READING_CACHE : STATIC_CACHE);
    const cached = await cache.match(request);
    const network = fetch(request).then((response) => { if (response.ok) cache.put(request, response.clone()); return response; });
    if (cached) { event.waitUntil(network.catch(() => undefined)); return cached; }
    try { return await network; } catch (_error) { return isPage ? (await caches.match("/offline/index.html")) : Response.error(); }
  })());
});
