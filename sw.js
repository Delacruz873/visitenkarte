// Macht die App offline nutzbar. Netz zuerst, damit Updates ankommen; sonst aus dem Zwischenspeicher.
var CACHE = 'visitenkarte-5';
var FILES = ['./', 'index.html', 'style.css', 'vc.js', 'qrcode.js', 'manifest.webmanifest', 'icon-180.png', 'k/', 'k/index.html'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok) { var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }); }));
});
