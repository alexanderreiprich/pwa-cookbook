// src/serviceWorker.js

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('weather-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        // Add other assets you want to cache here
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});