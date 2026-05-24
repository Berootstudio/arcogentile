/* ===================================================
   Service Worker — B&B Arco Gentile 2026
=================================================== */

const CACHE_NAME = 'arco-gentile-img-v1';

/* Estensioni da mettere in cache (solo immagini) */
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.ico'];

const IS_DEV = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  /* Pulisce tutte le cache vecchie */
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
  const isImage = IMAGE_EXTS.some(ext => url.pathname.toLowerCase().endsWith(ext));

  if (isImage) {
    /* Cache first solo per immagini */
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'opaque') return response;
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
  /* HTML / CSS / JS: nessuna intercettazione → sempre dalla rete */
});
