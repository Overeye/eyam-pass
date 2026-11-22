/* Offline cache for The Eyam Pass. Relative URLs, so a /play/ folder works. */
const CACHE = "eyam-pass-v1";

const ASSETS = [
  "./index.html",
  "./css/styles.css",
  "./js/data.js",
  "./js/geo.js",
  "./js/certificate.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/well.svg",
  "./assets/stone.svg",
  "./assets/graves.svg",
  "./assets/fonts/source-serif-4-latin-400-normal.woff2",
  "./assets/fonts/source-serif-4-latin-600-normal.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(respond(request));
});

async function respond(request) {
  const cached = await caches.match(request, { ignoreSearch: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok && response.type === "basic") {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (request.mode === "navigate") {
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
    }
    throw error;
  }
}
