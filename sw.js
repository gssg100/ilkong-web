/*
 * 일콩 기록 서비스워커 v4.8.0
 * 화면(껍데기)을 기기에 저장해 인터넷이 없어도 앱이 열리게 한다.
 * 백그라운드 Web Push 알림 수신 및 탭 이동 지원.
 */
var CACHE = 'ilkong-shell-v4.8.0';
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
  // 서버 통신(브리지 및 Supabase)은 항상 네트워크로 — 오래된 데이터를 보여주지 않는다.
  if (url.origin !== self.location.origin) return;

  // 화면 진입은 네트워크 우선이다. 이전 서비스워커가 오래된 index.html을 계속
  // 제공하면 전환 플래그와 API 경로가 엇갈릴 수 있으므로, 연결된 상태에서는 항상
  // 최신 운영 코드를 받는다. 오프라인일 때만 마지막 정상 화면으로 되돌린다.
  if (request.mode === 'navigate' || /\/ilkong-web\/(?:index\.html)?$/.test(url.pathname)) {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var copy = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(request, copy); }).catch(function () {});
        }
        return response;
      }).catch(function () { return caches.match(request, { ignoreSearch: true }); })
    );
    return;
  }

  // 정적 아이콘 등 나머지 화면 자산은 캐시 우선으로 빠르게 연다.
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

/*
 * Web Push 백그라운드 수신
 * 앱이 닫혀 있거나 화면이 꺼져 있어도 시스템 알림 배너를 띄운다.
 */
self.addEventListener('push', function (event) {
  var data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (parseError) {
      data = { title: '일콩 기록 🔔', body: event.data.text() };
    }
  }
  var title = data.title || '일콩 기록 🔔';
  var options = {
    body: data.body || '새로운 소식이 도착했어.',
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: data.tag || ('ilkong-push-' + Date.now()),
    data: {
      url: data.url || './'
    },
    renotify: true
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

/*
 * 알림 터치 시 앱 열기 / 포커스
 */
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || './';
  var targetAbsolute = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url && 'focus' in client) {
          if (client.url === targetAbsolute || client.url.indexOf(self.location.origin) === 0) {
            client.focus();
            if ('navigate' in client && client.url !== targetAbsolute) {
              client.navigate(targetAbsolute);
            }
            return;
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetAbsolute);
      }
    })
  );
});

