const CACHE_NAME = 'jbilo-portfolio-cache-v2';
const APP_SHELL = [
  './',
  './index.html',
  './about.html',
  './portfolio.html',
  './browse.html',
  './contact.html',
  './css/style.css',
  './js/main.js',
  './data/manifest.json',
  './data/portfolio/portfolio.json',
  './data/categories/categories.json',
  './images/background.jpg',
  './images/artwork_01.jpg',
  './images/artwork_02.jpg',
  './images/artwork_03.jpg',
  './images/artwork_05.jpg',
  './images/artwork_06.jpg',
  './images/artwork_08.jpg',
  './images/artwork_09.jpg',
  './images/artwork_11.jpeg',
  './images/belabbas.jpg',
  './images/cat.jpg',
  './images/DSCF9478%20(1).jpg',
  './images/DSCF9498.jpg',
  './images/DSCF9561.jpg',
  './images/DSCF9795.jpg',
  './images/people.jpg',
  './images/work_in.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isStaticAsset = isSameOrigin && (
    requestUrl.pathname.startsWith('/images/') ||
    requestUrl.pathname.startsWith('/css/') ||
    requestUrl.pathname.startsWith('/js/') ||
    requestUrl.pathname.startsWith('/data/') ||
    requestUrl.pathname.endsWith('.html')
  );

  if (!isSameOrigin || isStaticAsset) {
    event.respondWith(cacheFirst(event.request));
    return;
  }
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    return caches.match('./index.html');
  }
}
