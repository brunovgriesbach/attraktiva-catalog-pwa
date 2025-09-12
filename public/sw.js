const CACHE_NAME = 'catalog-cache-v1';
const OFFLINE_RESOURCES = [];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_RESOURCES)));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const isProductData = request.url.endsWith('/products.json');
  const isImage = request.destination === 'image';
  if (isProductData || isImage) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});
