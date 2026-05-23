const CACHE_VERSION = "__BUILD_ID__";
const CACHE_NAME = `lifehub-cache-${CACHE_VERSION}`;
const STATIC_ASSET_PREFIX = "/static/";
const OFFLINE_URL = "/index.html";

// Paths the service worker MUST NOT touch (Firebase OAuth proxy, etc.).
// Caching the proxy response as the SPA shell corrupts subsequent navigations.
const BYPASS_PATH_PREFIXES = ["/__/", "/__"];

function shouldBypass(url) {
  return BYPASS_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

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
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cross-origin (Firebase APIs, fonts, etc.) — pass through.
  if (url.origin !== self.location.origin) return;

  // Auth proxy / Firebase reserved paths — never intercept or cache.
  if (shouldBypass(url)) return;

  // Navigation / HTML: network-first, fall back to cached shell offline only.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache real same-origin HTML responses as the shell. Skip
          // opaque/redirect/non-200 responses (e.g. proxied auth responses).
          if (response && response.ok && response.type === "basic") {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(OFFLINE_URL, clone))
              .catch(() => {});
          }
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
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, clone))
              .catch(() => {});
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: pass through to network.
});
