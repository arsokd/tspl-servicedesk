// ============================================================================
// TSPL ServiceDesk — Service Worker
// ============================================================================
// Purpose today: makes the app installable ("Add to Home Screen") on Android
// and iOS, and keeps the app shell (HTML/CSS/JS/icons) available for a beat
// when a field engineer briefly loses signal mid-site-visit.
//
// Deliberately NOT doing: caching Firestore/Auth/RTDB traffic. Those all go
// to Firebase's own domains (firestore.googleapis.com etc.), which this
// same-origin service worker never intercepts anyway — so live docket data
// always comes straight from the network, never a stale cache. Good.
//
// Strategy: network-first for every request. Try the network; if it succeeds,
// use it AND refresh the cache. Only fall back to the cache when the network
// genuinely fails (offline / no signal). This means the app never shows stale
// content when a connection is available, which matters a lot for SLA-timer
// accuracy — the one thing this app must never get wrong.
//
// NOTE for later: when push notifications (Firebase Cloud Messaging) are
// wired up, FCM's own service worker (firebase-messaging-sw.js) can either
// live alongside this one or this file can be extended with the
// `messaging.onBackgroundMessage` handler — see the audit report's Phase 2.
// ============================================================================

var CACHE_NAME = 'tspl-servicedesk-shell-v1';

var APP_SHELL = [
  '/',
  '/index.html',
  '/login.html',
  '/manifest.json',
  '/assets/tspl-logo.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function (err) {
        // Don't let one missing asset block installation
        console.warn('[SW] Shell pre-cache partial failure:', err);
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;

  // Only handle same-origin GET requests — everything else (Firebase APIs,
  // POSTs, cross-origin CDN scripts) passes straight through untouched.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(req).then(function (networkResponse) {
      var copy = networkResponse.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy); });
      return networkResponse;
    }).catch(function () {
      return caches.match(req).then(function (cached) {
        return cached || caches.match('/index.html');
      });
    })
  );
});
