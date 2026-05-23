const CACHE_VERSION = "__BUILD_ID__";
const CACHE_NAME = `lifehub-cache-${CACHE_VERSION}`;
const STATIC_ASSET_PREFIX = "/static/";
const OFFLINE_URL = "/index.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );

      await self.clients.claim();

      // Force-reload any open tabs so users stuck on the stale shell
      // (cached by the previous cache-first SW) pick up the new build.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        try {
          await client.navigate(client.url);
        } catch (_) {
          // navigate() can reject for cross-origin/foreign clients; ignore.
        }
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Don't touch cross-origin requests (Firebase, APIs, fonts, etc.).
  if (url.origin !== self.location.origin) return;

  // Navigation requests / HTML: network-first, fall back to cached shell offline.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(OFFLINE_URL, clone));
          return response;
        })
        .catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Hashed static assets (CRA emits /static/{js,css,media}/[hash]): cache-first.
  if (url.pathname.startsWith(STATIC_ASSET_PREFIX)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else (manifest, icons, API, etc.): just hit the network.
});
