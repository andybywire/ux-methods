/* Service Worker for UX Methods */

const BUILD_ID = "__BUILD_ID__"; // stamped at build time
const CACHE_PREFIX = "uxm-";
const STATIC_CACHE = `${CACHE_PREFIX}static-${BUILD_ID}`;
const PAGE_CACHE = `${CACHE_PREFIX}pages-${BUILD_ID}`;

// URLs you *always* want available offline
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  // "/offline/index.html", // re-enable if/when you add it
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (k) =>
                k.startsWith(CACHE_PREFIX) &&
                k !== STATIC_CACHE &&
                k !== PAGE_CACHE
            )
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET (avoid breaking form posts, etc.)
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  const isNav = req.mode === "navigate";

  if (isNav) {
    // Network-first for HTML navigation: users see updates after deploys
    event.respondWith(networkFirst(req));
    return;
  }

  // Cache-first for assets: fast repeat views
  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreVary: true });
  if (cached) return cached;

  const res = await fetch(req);

  // Cache only successful same-origin responses
  if (res.ok && res.type === "basic") {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(req, res.clone());
  }

  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);

    // Cache successful navigation (HTML) so back/refresh works offline
    if (res.ok && res.type === "basic") {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(req, res.clone());
    }

    return res;
  } catch (err) {
    // fallback to cached page
    const cached = await caches.match(req);
    if (cached) return cached;

    // fallback for offline navigation
    return caches.match("/index.html");
    // or: return caches.match("/offline/index.html");
  }
}