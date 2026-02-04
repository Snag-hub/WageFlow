const CACHE_NAME = 'wageflow-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        clients.claim().then(() => {
            // Clean up old caches if any
            return caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            });
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Basic pass-through fetch for now
    if (event.request.method !== 'GET') return;
});
