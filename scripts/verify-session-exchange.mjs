// Exercise the shipped session exchange function with deterministic delayed responses.
// No login credentials, browser session or live API connection are needed.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = html.match(/^      function ensureSupabaseSession\(\)\{[\s\S]*?^      }/m)?.[0];
assert.ok(source, 'production session exchange function missing');

const legacy = (id, token = `legacy-${id}`) => ({
  token, supabase: false, user: { id, name: `Name ${id}`, emoji: '🌿' }
});
const modern = (id, token = `modern-${id}`) => ({
  token, expiresAt: Date.now() + 60000, user: { id, name: `Name ${id}`, emoji: '🌿' }
});

function harness(initial = legacy('A')) {
  const requests = [];
  const saved = [];
  const state = { session: initial, loginAttemptGeneration: 1, logoutBusy: false };
  const context = vm.createContext({
    Promise, Date, state, SUPABASE_READ_ROLLOUT: true,
    supabaseToken: '', supabaseExchangePending: null,
    supabaseRequest(body) {
      return new Promise((resolve, reject) => requests.push({ body, resolve, reject }));
    },
    saveSession(session) { saved.push(session); }
  });
  vm.runInContext(source, context);
  return {
    state, context, requests, saved,
    exchange(id, index = 0) { requests[index].resolve({ data: modern(id) }); }
  };
}

test('one successful legacy exchange upgrades the same user and shares concurrent requests', async () => {
  const t = harness();
  const first = t.context.ensureSupabaseSession();
  const second = t.context.ensureSupabaseSession();
  assert.equal(first, second, 'concurrent callers must share the same pending exchange');
  assert.equal(t.requests.length, 1);
  assert.equal(t.requests[0].body.legacyToken, 'legacy-A');
  t.exchange('A');
  assert.equal(await first, 'modern-A');
  assert.equal(t.state.session.user.id, 'A');
  assert.equal(t.state.session.supabase, true);
  assert.equal(t.saved.length, 1);
  assert.equal(await t.context.ensureSupabaseSession(), 'modern-A');
  assert.equal(t.requests.length, 1, 'an upgraded session must not exchange again');
});

test('a delayed exchange cannot restore a session after logout', async () => {
  const t = harness();
  const pending = t.context.ensureSupabaseSession();
  t.state.logoutBusy = true;
  t.state.session = null;
  t.state.loginAttemptGeneration++;
  t.exchange('A');
  await assert.rejects(pending, /로그인 상태가 바뀌어/);
  assert.equal(t.state.session, null);
  assert.equal(t.context.supabaseToken, '');
  assert.equal(t.saved.length, 0, 'stale session must not be persisted');
});

test('an exchange arriving during a pending logout cannot be persisted', async () => {
  const t = harness();
  const pending = t.context.ensureSupabaseSession();
  t.state.logoutBusy = true;
  t.exchange('A');
  await assert.rejects(pending, /로그인 상태가 바뀌어/);
  assert.equal(t.state.session.token, 'legacy-A');
  assert.equal(t.saved.length, 0);
  await assert.rejects(t.context.ensureSupabaseSession(), /로그아웃 중인 세션/);
  assert.equal(t.requests.length, 1);
});

test('switching accounts rejects the old result without overwriting the new user', async () => {
  const t = harness();
  const oldRequest = t.context.ensureSupabaseSession();
  t.state.session = legacy('B');
  t.state.loginAttemptGeneration++;
  const currentRequest = t.context.ensureSupabaseSession();
  assert.equal(t.requests.length, 2);
  t.exchange('A', 0);
  await assert.rejects(oldRequest, /로그인 상태가 바뀌어/);
  assert.equal(t.saved.length, 0);
  assert.equal(t.state.session.user.id, 'B');
  t.exchange('B', 1);
  assert.equal(await currentRequest, 'modern-B');
  assert.equal(t.saved.length, 1);
  assert.equal(t.saved[0].user.id, 'B');
  assert.equal(t.context.supabaseToken, 'modern-B');
});

test('exchange results for another server user are rejected and can be retried', async () => {
  const t = harness();
  const first = t.context.ensureSupabaseSession();
  t.exchange('B');
  await assert.rejects(first, /사용자가 일치하지 않아/);
  assert.equal(t.saved.length, 0);
  assert.equal(t.state.session.token, 'legacy-A');
  const retry = t.context.ensureSupabaseSession();
  assert.equal(t.requests.length, 2);
  t.exchange('A', 1);
  assert.equal(await retry, 'modern-A');
});

test('a cached token without a current session is never accepted', async () => {
  const t = harness(null);
  t.context.supabaseToken = 'stale-token';
  await assert.rejects(t.context.ensureSupabaseSession(), /legacy session missing/);
  assert.equal(t.requests.length, 0);
});
