/*
 * 일콩 기록 서비스워커 v3.9.9
 * 화면(껍데기)을 기기에 저장해 인터넷이 없어도 앱이 열리게 한다.
 * 데이터는 브리지(script.google.com)로 오가며, 그건 절대 캐시하지 않는다.
 */
var CACHE = 'ilkong-shell-v3.9.9';
var SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(SHELL.map(function (url) {
        return cache.add(new Request(url, { cache: 'reload' })).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        return key === CACHE ? null : caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  var url = new URL(request.url);
  // 서버 통신(브리지)은 항상 네트워크로 — 오래된 데이터를 보여주지 않는다.
  if (url.origin !== self.location.origin) return;

  // 화면은 캐시를 먼저 보여주고(즉시 실행), 뒤에서 조용히 최신본을 받아 다음 실행에 반영한다.
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(function (cached) {
      var network = fetch(request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); }).catch(function () {});
        }
        return response;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
