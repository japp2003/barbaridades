/* Service worker: la app se abre rápido y sin conexión con la última versión descargada. */
var CACHE = 'gpb-v1';
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['./', './index.html', './peerjs.min.js', './manifest.json', './icon-192.png']); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
/* primero la red (siempre la versión nueva); si no hay conexión, lo guardado */
self.addEventListener('fetch', function (e) {
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(function (res) {
    var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); });
    return res;
  }).catch(function () { return caches.match(r).then(function (m) { return m || caches.match('./index.html'); }); }));
});
