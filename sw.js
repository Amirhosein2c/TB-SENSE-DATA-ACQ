// Service Worker for TB Sense PWA
const CACHE_NAME = 'TB_Sense-v3';
const urlsToCache = [
  '/TBSense/',
  '/TBSense/index.html',
  '/TBSense/passport_scan.html',
  '/TBSense/cough_record.html',
  '/TBSense/show_result.html',
  '/TBSense/style.css',
  '/TBSense/js/config.js',
  '/TBSense/js/index.js',
  '/TBSense/js/passport_scan.js',
  '/TBSense/js/cough_record.js',
  '/TBSense/js/show_result.js',
  '/TBSense/js/pwa-init.js',
  '/TBSense/js/permissions.js',
  '/TBSense/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('Cache installation failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(error => {
          console.log('Fetch failed:', error);
          // You can return a custom offline page here
          return caches.match('/TB_Sense/index.html');
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
