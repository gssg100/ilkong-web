// SW 로직을 실제 소스에서 VM에 로드해 설치/캐시 범위/오프라인 홈을 검증한다.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const activeCache = source.match(/var CACHE = '([^']+)'/)?.[1];
assert.ok(activeCache && activeCache.startsWith('ilkong-shell-v'), 'service worker cache version missing');
const listeners = {};
const calls = [];
let failInstall = false;
let offline = false;
const scope = 'https://gssg100.github.io/ilkong-web/';
const cacheResponse = { from: 'offline-shell' };
const runtime = {
  URL,
  Promise,
  Request: class { constructor(url) { this.url = new URL(url, scope).href; } },
  Response: { error: () => ({ failed: true }) },
  self: {
    location: { origin: new URL(scope).origin },
    registration: { scope },
    addEventListener: (name, callback) => { listeners[name] = callback; },
    skipWaiting: () => { calls.push('skipWaiting'); },
    clients: { claim: () => { calls.push('claim'); } },
  },
  caches: {
    open: async () => ({
      async add(request) {
        calls.push(`add:${request.url}`);
        if (failInstall && request.url.endsWith('icon-192.png')) throw new Error('offline asset missing');
      },
      async put() {},
    }),
    keys: async () => ['other-app-cache', 'ilkong-shell-v4.8.7', 'ilkong-shell-v4.8.8', activeCache],
    async delete(key) { calls.push(`delete:${key}`); },
    async match(request) {
      const value = typeof request === 'string' ? request : request.url;
      calls.push(`match:${value}`);
      return value === scope + 'index.html' ? cacheResponse : undefined;
    },
  },
  fetch: async () => {
    if (offline) throw new Error('network unavailable');
    return { status: 200, type: 'basic', clone() { return this; } };
  },
};
vm.runInNewContext(source, runtime);
assert.deepEqual(Object.keys(listeners).sort(), ['activate', 'fetch', 'install', 'notificationclick', 'push']);

let job;
failInstall = true;
listeners.install({ waitUntil(promise) { job = promise; } });
await assert.rejects(job, /offline asset missing/);
assert.ok(!calls.includes('skipWaiting'), 'broken offline shell must not activate');
failInstall = false;
calls.length = 0;
listeners.install({ waitUntil(promise) { job = promise; } });
await job;
assert.ok(calls.includes('skipWaiting'), 'complete offline shell may activate');

calls.length = 0;
listeners.activate({ waitUntil(promise) { job = promise; } });
await job;
assert.ok(calls.includes('delete:ilkong-shell-v4.8.7'));
assert.ok(!calls.includes('delete:other-app-cache'), 'SW must not remove another app cache');
assert.ok(!calls.includes(`delete:${activeCache}`));

offline = true;
const request = { method: 'GET', url: scope + '?updated=' + activeCache.slice('ilkong-shell-v'.length), mode: 'navigate' };
listeners.fetch({ request, respondWith(promise) { job = promise; } });
assert.equal(await job, cacheResponse, 'deep-link navigation should find cached offline shell');

// Exercise notification clicks against the actual worker. In particular, './'
// must resolve inside the app even when no existing window can hide a bad URL.
async function clickNotification(url, windows = [], dataPresent = true) {
  const actions = [];
  runtime.self.clients.matchAll = async (options) => {
    assert.equal(options.type, 'window');
    assert.equal(options.includeUncontrolled, true);
    return windows.map((window) => ({
      url: window,
      async focus() { actions.push(['focus', window]); },
      async navigate(target) { actions.push(['navigate', target]); },
    }));
  };
  runtime.self.clients.openWindow = async (target) => { actions.push(['open', target]); };
  let clickJob;
  listeners.notificationclick({
    notification: {
      ...(dataPresent ? { data: { url } } : {}),
      close() { actions.push(['close']); },
    },
    waitUntil(promise) { clickJob = promise; },
  });
  assert.ok(clickJob, 'notification navigation must extend the event lifetime');
  await clickJob;
  assert.deepEqual(actions[0], ['close']);
  return actions.slice(1);
}

assert.deepEqual(await clickNotification('./'), [['open', scope]], 'closed app must open its folder, never the GitHub user root');
assert.deepEqual(await clickNotification(undefined, [], false), [['open', scope]], 'old notifications without data must open the app');
assert.deepEqual(await clickNotification('?from=notification#record'), [['open', scope + '?from=notification#record']]);
assert.deepEqual(await clickNotification('./', [scope]), [['focus', scope]], 'an existing app window should be reused');
assert.deepEqual(await clickNotification('./', [scope + '?old=1']), [['focus', scope + '?old=1'], ['navigate', scope]]);
assert.deepEqual(await clickNotification('./', ['https://gssg100.github.io/']), [['open', scope]], 'another GitHub Pages window must not be focused');
for (const outside of [
  '../',
  '/',
  'https://example.com/',
  '//example.com/ilkong-web/',
  'https://gssg100.github.io/another-app/',
  'https://gssg100.github.io/ilkong-web-lookalike/',
]) {
  assert.deepEqual(await clickNotification(outside), [['open', scope]], `outside target must fall back to app scope: ${outside}`);
}
assert.deepEqual(await clickNotification('./', ['https://gssg100.github.io/another-app/', scope]), [['focus', scope]]);

console.log('[sw-check] passed: incomplete-install rejection, owned caches only, offline navigation fallback, notification scope and window reuse (13 cases)');
