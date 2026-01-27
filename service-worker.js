// ==== Dynamic Cache Version for Every Deploy ====
const CACHE_NAME = 'bhavix-cache-v' + new Date().getTime(); 
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.png',
  '/manifest.json',
  // Agar aur files hai to add karo
];

// ==== Install Event ====
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Force service worker to activate immediately
});

// ==== Activate Event (Delete Old Caches) ====
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of pages immediately
});

// ==== Fetch Event (Network First, then Cache) ====
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response and update cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, use cache
        return caches.match(event.request);
      })
  );
});