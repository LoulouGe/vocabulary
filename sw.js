const CACHE_NAME = 'vocab-v2';
const FILES_TO_CACHE = [
  '/vocabulary/',
  '/vocabulary/index.html',
  '/vocabulary/style.css',
  '/vocabulary/js/app.js',
  '/vocabulary/js/state.js',
  '/vocabulary/js/data.js',
  '/vocabulary/js/ui.js',
  '/vocabulary/js/utils.js',
  '/vocabulary/js/quiz.js',
  '/vocabulary/js/match.js',
  '/vocabulary/js/flashcard.js',
  '/vocabulary/js/crossword.js',
  '/vocabulary/js/stats.js',
  '/vocabulary/js/chinese-kb.js',
  '/vocabulary/js/custom-lists.js',
  '/vocabulary/data/themes-en.json',
  '/vocabulary/manifest.json',
  '/vocabulary/assets/IMG_3722.png'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    }).catch((error) => {
      console.log('Cache installation error:', error);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
      .catch(() => {
        // Return offline page or cached response
        return caches.match('/vocabulary/index.html');
      })
  );
});
