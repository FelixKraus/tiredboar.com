const cacheName = "Tired Boar Games-OB-Spice Race-1.0.4";
const contentToCache = [
    "Build/Version 1.2.loader.js?v=1.0.4",
    "Build/Version 1.2.framework.js.unityweb?v=1.0.4",
    "Build/Version 1.2.data.unityweb?v=1.0.4",
    "Build/Version 1.2.wasm.unityweb?v=1.0.4",
    "TemplateData/style.css?v=1.0.4"
];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
        try {
            // Try fetching from the network first
            const networkResponse = await fetch(e.request);
            const cache = await caches.open(cacheName);
            // Cache the new response if successful
            await cache.put(e.request, networkResponse.clone());
            return networkResponse;
        } catch (err) {
            // Fall back to cache if offline
            const cachedResponse = await caches.match(e.request);
            return cachedResponse || new Response("Offline fallback");
        }
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== cacheName) {
                        return caches.delete(key); // Delete old caches
                    }
                })
            );
        }).then(() => self.clients.claim()) // Take control of all clients
    );
});
