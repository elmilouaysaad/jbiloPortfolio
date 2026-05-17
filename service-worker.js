const CACHE_NAME = 'jbilo-portfolio-cache-v4';
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
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      syncImageCache(),
    ])
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isImageAsset = isSameOrigin && requestUrl.pathname.startsWith('/images/');
  const isDataAsset = isSameOrigin && requestUrl.pathname.startsWith('/data/');
  const isStaticAsset = isSameOrigin && (
    requestUrl.pathname.startsWith('/css/') ||
    requestUrl.pathname.startsWith('/js/') ||
    requestUrl.pathname.endsWith('.html')
  );

  if (isImageAsset) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isDataAsset) {
    event.respondWith(networkFirst(event.request));
    return;
  }

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

async function networkFirst(request) {
  const cachedResponse = await caches.match(request);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    if (cachedResponse) return cachedResponse;
    throw error;
  }
}

async function syncImageCache() {
  const [portfolioResponse, categoriesResponse] = await Promise.all([
    fetch('./data/portfolio/portfolio.json', { cache: 'no-store' }),
    fetch('./data/categories/categories.json', { cache: 'no-store' }),
  ]);

  if (!portfolioResponse.ok || !categoriesResponse.ok) {
    return;
  }

  const [portfolioData, categoriesData] = await Promise.all([
    portfolioResponse.json(),
    categoriesResponse.json(),
  ]);

  const allowedImageUrls = new Set([
    ...(portfolioData?.favorites ?? []).map(item => new URL(`./images/${item.filename}`, self.location.href).href),
    ...(categoriesData?.categories ?? []).map(category => new URL(`./images/${category.thumbnail}`, self.location.href).href),
    ...(categoriesData?.images ?? [])
      .filter(item => item.category)
      .map(item => new URL(`./images/${item.filename}`, self.location.href).href),
  ]);

  const cache = await caches.open(CACHE_NAME);
  const requests = await cache.keys();

  await Promise.all(requests.map(async request => {
    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith('/images/')) {
      return;
    }

    if (!allowedImageUrls.has(request.url)) {
      await cache.delete(request);
      return;
    }

    try {
      const response = await fetch(request, { cache: 'no-store' });
      if (response.ok) {
        await cache.put(request, response);
      }
    } catch (error) {
      // Keep the cached image if the network is unavailable.
    }
  }));
}
