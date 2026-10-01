const CACHE_NAME = 'nexus-prime-cache-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// NETWORK-FIRST STRATEGY:
// Always fetch fresh HTML & assets from network first.
// Only fall back to cache if offline.
self.addEventListener('fetch', (event) => {
  // Always bypass cache for Google Apps Script API calls or non-GET
  if (event.request.url.includes('script.google.com') || event.request.method !== 'GET') {
    return;
  }

  // Network-First for navigation & app assets
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the fresh copy
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if network fails (offline)
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('./index.html');
        });
      })
  );
});
