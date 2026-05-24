/* ===================================================
   Service Worker — B&B Arco Gentile 2026
=================================================== */

const CACHE_NAME = 'arco-gentile-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/Foto/Logo/bb-arco-gentile-logo.png',
  '/Foto/Sylos/bb-arco-gentile-camera-sylos-letto-matrimoniale.jpg',
  '/Foto/Traetta/bb-arco-gentile-camera-traetta-letto-matrimoniale.jpg',
  '/Foto/Giordano/bb-arco-gentile-camera-giordano-letto-matrimoniale.jpg',
  '/Foto/Montemar/bb-arco-gentile-camera-montemar-letto-matrimoniale.jpg'
];

/* In sviluppo (localhost) il SW non fa nulla */
const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  if (IS_DEV) { self.skipWaiting(); return; }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  if (IS_DEV) { self.clients.claim(); return; }
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (IS_DEV) return;
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isCore = ['/index.html', '/style.css', '/script.js', '/'].includes(url.pathname);

  if (isCore) {
    /* Network first per file core: prende sempre la versione aggiornata */
    event.respondWith(
      fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      }).catch(() => caches.match(event.request).then(cached => cached || caches.match('/index.html')))
    );
  } else {
    /* Cache first per immagini e risorse statiche */
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      }).catch(() => caches.match('/index.html'))
    );
  }
});
