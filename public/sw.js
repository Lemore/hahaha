// Service worker: caches the app shell so the app opens offline (ARCHITECTURE 2.9).
// Bump the version whenever the cached shell needs a refresh.
const CACHE_NAME = "hahaha-v1";

const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/apple-icon.png",
];

// Next.js build files have hashed names, so collect them from the home page HTML.
function extractAssetUrls(html) {
  const urls = new Set();
  // Excludes backslashes so escaped copies inside the inline RSC payload match cleanly.
  const pattern = /\/_next\/(?:static\/[^"'\s,)\\]+|image\?[^"'\s,\\]+)/g;
  for (const match of html.matchAll(pattern)) {
    urls.add(match[0].replace(/&amp;/g, "&"));
  }
  return [...urls];
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(SHELL_URLS);
      const home = await cache.match("/");
      const assets = extractAssetUrls(await home.text());
      // One missing asset should not fail the whole install.
      await Promise.allSettled(assets.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Other origins (Google Fonts) are never cached; offline falls back to system fonts.
  if (url.origin !== self.location.origin) return;
  // API is network-only: jokes are never cached.
  if (url.pathname.startsWith("/api/")) return;
  // Skip Next.js RSC / prefetch payloads.
  if (request.headers.has("RSC") || request.headers.has("Next-Router-Prefetch")) {
    return;
  }

  event.respondWith(networkFirst(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Optimized images vary by Accept header; the precached copy was fetched with a different one.
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;
    // Single-screen app: any offline navigation gets the home page.
    if (request.mode === "navigate") {
      const home = await cache.match("/");
      if (home) return home;
    }
    throw error;
  }
}
