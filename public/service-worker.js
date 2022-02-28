const APP_PREFIX = 'budgetapp'
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "/",
  "./index.html",
  "./manifest.json",
  "./css/styles.css",
  "./js/idb.js",
  "./js/index.js",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(FILES_TO_CACHE);
        })
    )
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(list) {
            let keepList = list.filter(function(key) {
                return key.indexOf(APP_PREFIX);
            });
            keepList.push(CACHE_NAME);

            return Promise.all(
                list.map(function(key, i) {
                    if (keepList.indexOf(key) === -1) {
                        return caches.delete(list[i]);
                    }
                })
            )
        })
    )
});

self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function (request) {
            return request || fetch(e.request);
        })
    );
});