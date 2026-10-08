import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// 배포 HTML의 실제 함수를 VM에서 실행한다. 별도 구현을 테스트하지 않는다.
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function sliceBetween(start, end) {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, `Cannot locate ${start}`);
  return html.slice(from, to);
}

const sources = [
  ['function clearSession(){', 'function boot(){'],
  ['function flushDraftSave(){', 'function saveDraft(force,preserveAttempt){'],
  ['function saveDraft(force,preserveAttempt){', 'function restoreDraft(userId){'],
  ['function pendingSnapshot(status){', 'function persistPendingSave(status){'],
  ['function persistPendingSave(status){', 'function restorePendingSave(userId){'],
  ['function clearPendingSave(){', 'function discardPendingSave(){'],
  ['function hasLocalDraft(key){', 'function renderOperationalHealth(){'],
  ['function clearLogoutReadCache(){', 'function resetAppStateForLogout(){'],
].map(([start, end]) => sliceBetween(start, end)).join('\n');

function harness({ choices, photos = true, existingPending = true, failPhotoWrite = false, failTextWrite = false, failCacheCleanup = false, writingCache = false, serverSession = false, failServerLogout = false } = {}) {
  const idb = new Map();
  const local = new Map();
  const notices = [];
  const revokeCalls = [];
  const cacheKeys = [
    'ilkong_home_snapshot_U1',
    'ilkong_home_snapshot_OTHER',
    'ilkong_v282_image_cache_index',
    'ilkong_v282_image_cache_v36:thumbnail:111',
    'ilkong_v282_image_cache_orphan',
  ];
  for (const key of cacheKeys) idb.set(key, `cached:${key}`);
  idb.set('other_user_private_draft', { title: 'another user draft' });
  if (existingPending) idb.set('pending_U1', { userId: 'U1', images: [{ dataUrl: 'data:image/jpeg;base64,old' }] });
  idb.set('session', 'session');
  local.set('session', 'session');
  local.set('draft_U1', JSON.stringify({ title: '이전 초안' }));
  local.set('checkin_U1', JSON.stringify({ note: '오늘 한 줄' }));
  const fields = {
    postTitle: { value: '작성 중 제목' },
    postBody: { value: '작성 중 본문' },
    recordDate: { value: '2026-10-08' },
    category: { value: '일상' },
  };
  const state = {
    session: { user: { id: 'u1' }, token: 'abc', supabase: serverSession },
    composerMode: 'create', images: photos ? [{ id: 'p1', name: '사진.jpg', dataUrl: 'data:image/jpeg;base64,new', thumbnailDataUrl: 'data:image/jpeg;base64,thumb', status: 'ready', width: 100, height: 100 }] : [],
    saving: false, composerClosing: false, saveAttempt: null, selectedMood: '', draftSaveTimer: null, draftSavePending: false,
    pendingPersistChain: Promise.resolve(), imagePersistChain: Promise.resolve(), homeSnapshotPersistChain: Promise.resolve(), logoutBusy: false,
  };
  let confirmationIndex = 0;
  const ctx = {
    state,
    Promise,
    IMAGE_CACHE_INDEX_KEY: 'ilkong_v282_image_cache_index',
    IMAGE_CACHE_PREFIX: 'ilkong_v282_image_cache_',
    DB_STORE: 'kv',
    SESSION_KEY: 'session', LEGACY_SESSION_KEY: 'legacy_session', OLDER_SESSION_KEY: 'older_session',
    supabaseToken: 'token',
    storageGet(key) { return local.get(key) ?? null; },
    storageSet(key, value) { if (failTextWrite && key.startsWith('draft_')) return false; local.set(key, value); return true; },
    storageRemove(key) { local.delete(key); },
    currentUserId() { return state.session?.user?.id ?? ''; },
    draftKey(user) { return `draft_${String(user).toUpperCase()}`; },
    pendingSaveKey(user) { return `pending_${String(user).toUpperCase()}`; },
    checkinDraftKey(user) { return `checkin_${String(user).toUpperCase()}`; },
    nativeClearSession() {},
    idbGet(key) { return Promise.resolve(idb.get(key) ?? null); },
    idbSet(key, value) {
      if (failPhotoWrite && key.startsWith('pending_')) return Promise.reject(new Error('IndexedDB full'));
      idb.set(key, value);
      return Promise.resolve(true);
    },
    idbRemove(key) { idb.delete(key); return Promise.resolve(true); },
    openDb() {
      if (failCacheCleanup) return Promise.reject(new Error('Cache cleanup unavailable'));
      return Promise.resolve({
        close() {},
        transaction(_name, mode) {
          assert.equal(mode, 'readwrite');
          const tx = {
            oncomplete: null, onerror: null, onabort: null,
            objectStore() {
              return {
                openCursor() {
                  const req = { result: null, onsuccess: null };
                  const keys = [...idb.keys()];
                  let index = 0;
                  const advance = () => {
                    if (index === keys.length) {
                      req.result = null;
                      req.onsuccess?.();
                      queueMicrotask(() => tx.oncomplete?.());
                      return;
                    }
                    const key = keys[index];
                    req.result = { key, delete() { idb.delete(key); }, continue() { index++; queueMicrotask(advance); } };
                    req.onsuccess?.();
                  };
                  queueMicrotask(advance);
                  return req;
                },
              };
            },
          };
          return tx;
        },
      });
    },
    el(id) { return fields[id] ?? {}; },
    isImeComposing() { return false; },
    cancelDraftSave() {},
    invalidateSaveAttempt() {},
    confirm(message) { notices.push(message); assert(confirmationIndex < choices.length, 'Unexpected confirmation'); return choices[confirmationIndex++]; },
    toast(message) { notices.push(message); },
    errorMessage(error) { return error.message; },
    supabaseRequest(body, timeout) {
      assert(state.session, 'server revocation must precede local session clear');
      revokeCalls.push({ body, timeout });
      return failServerLogout ? Promise.reject(new Error('network unavailable')) : Promise.resolve({ ok: true });
    },
    stopAutoRefresh() {},
    resetAppStateForLogout() { state.reset = true; },
    hide() {}, show() {},
    setLoginStatus(message) { state.loginStatus = message; },
  };
  vm.createContext(ctx);
  vm.runInContext(sources, ctx);
  if (writingCache) {
    state.imagePersistChain = Promise.resolve().then(() => idb.set('ilkong_v282_image_cache_late', 'late'));
    state.homeSnapshotPersistChain = Promise.resolve().then(() => idb.set('ilkong_home_snapshot_LATE', 'late'));
  }
  return { ctx, state, idb, local, cacheKeys, notices, fields, revokeCalls };
}

async function preservePhotoDraft() {
  const t = harness({ choices: [true, true], writingCache: true });
  assert.equal(await t.ctx.logout(), true, JSON.stringify(t.notices));
  assert.equal(t.state.session, null, 'session must be cleared');
  assert.equal(t.state.reset, true, 'logged-out screen must be reset');
  assert.equal(t.state.logoutBusy, false);
  for (const key of [...t.cacheKeys, 'ilkong_v282_image_cache_late', 'ilkong_home_snapshot_LATE']) {
    assert.equal(t.idb.has(key), false, `Readable cache retained on logout: ${key}`);
  }
  assert.equal(t.idb.has('other_user_private_draft'), true);
  assert.equal(t.local.has('draft_U1'), true);
  assert.equal(t.local.has('checkin_U1'), true);
  assert.equal(t.idb.get('pending_U1').images[0].dataUrl, 'data:image/jpeg;base64,new');
  assert.equal(t.idb.get('pending_U1').title, '작성 중 제목');
  assert.match(t.state.loginStatus, /초안은 같은 계정/);
}

async function deleteDraftExplicitly() {
  const t = harness({ choices: [true, false, true] });
  assert.equal(await t.ctx.logout(), true);
  assert.equal(t.idb.has('pending_U1'), false);
  assert.equal(t.local.has('draft_U1'), false);
  assert.equal(t.local.has('checkin_U1'), false);
  assert.equal(t.idb.has('other_user_private_draft'), true);
  assert.equal(t.state.session, null);
}

async function cancelWithoutLosingAnything() {
  const t = harness({ choices: [true, false, false] });
  assert.equal(await t.ctx.logout(), false);
  assert.equal(t.state.session.user.id, 'u1');
  assert.equal(t.idb.has('pending_U1'), true);
  assert.equal(t.local.has('draft_U1'), true);
  assert.equal(t.idb.has(t.cacheKeys[0]), true);
  assert.equal(t.state.logoutBusy, false);
}

async function failedPhotoSaveStopsLogout() {
  const t = harness({ choices: [true, true], failPhotoWrite: true });
  assert.equal(await t.ctx.logout(), false);
  assert.equal(t.state.session.user.id, 'u1');
  assert.equal(t.state.reset, undefined);
  assert.equal(t.idb.has('pending_U1'), true, 'old pending draft must remain');
  assert.equal(t.idb.has(t.cacheKeys[0]), true, 'failed pre-logout save must not clear caches');
}

async function failedTextSaveWithPhotosStopsLogout() {
  const t = harness({ choices: [true, true], failTextWrite: true });
  assert.equal(await t.ctx.logout(), false, 'photo snapshot must not hide failed text draft write');
  assert.equal(t.state.session.user.id, 'u1');
  assert.equal(t.state.reset, undefined);
  assert.equal(t.idb.has('pending_U1'), true);
}

async function supabaseServerLogout() {
  const success = harness({ choices: [true, true], serverSession: true });
  assert.equal(await success.ctx.logout(), true);
  assert.equal(success.revokeCalls.length, 1);
  assert.equal(success.revokeCalls[0].body.op, 'logout');
  assert.equal(success.revokeCalls[0].body.token, 'abc');
  assert.equal(success.revokeCalls[0].timeout, 8000);
  assert.doesNotMatch(success.state.loginStatus, /서버 세션 폐기를 확인하지 못했어/);

  const failure = harness({ choices: [true, true], serverSession: true, failServerLogout: true });
  assert.equal(await failure.ctx.logout(), true, 'server failure must not strand local logout');
  assert.equal(failure.state.session, null);
  assert.equal(failure.revokeCalls.length, 1);
  assert.match(failure.state.loginStatus, /서버 세션 폐기를 확인하지 못했어/);
}

async function failedCacheCleanupStopsLogout() {
  const t = harness({ choices: [true, true], failCacheCleanup: true });
  assert.equal(await t.ctx.logout(), false);
  assert.equal(t.state.session.user.id, 'u1');
  assert.equal(t.idb.has('pending_U1'), true);
  assert.equal(t.state.logoutBusy, false);
}

async function incompletePhotoAndDiskOnlyDraft() {
  const t = harness({ choices: [true, true] });
  t.state.images = [{ id: 'queued', file: { name: 'raw.jpg' }, dataUrl: '', status: 'processing' }];
  assert.equal(await t.ctx.logout(), false, 'pending compression cannot be silently lost');
  assert.equal(t.state.session.user.id, 'u1');

  const failed = harness({ choices: [true, true] });
  failed.state.images = [{ id: 'failed', dataUrl: '', status: 'error', error: 'conversion failed' }];
  assert.equal(await failed.ctx.logout(), false, 'failed conversion cannot masquerade as a preserved photo');

  const previous = harness({ choices: [true, true], photos: false });
  previous.local.clear();
  previous.fields.postTitle.value = '';
  previous.fields.postBody.value = '';
  assert.equal(await previous.ctx.logout(), true);
  assert.equal(previous.idb.get('pending_U1').images[0].dataUrl, 'data:image/jpeg;base64,old', 'disk-only photo draft must survive');
}

async function confirmPermanentCleanup() {
  const code = sliceBetween('function runCleanup(){', '// ===== v4.7.0 엄마 건강 기록');
  const shown = [];
  let calls = 0;
  const ctx = {
    state: { session: { token: 'session' } },
    confirm(message) { shown.push(message); return false; },
    el() { return { disabled: false }; },
    text() {},
    toast() {},
    callApi() { calls++; return Promise.resolve({ ok: true, photos: 0 }); },
    unwrap(value) { return value; },
    refreshStorageReport() {},
    formatBytes() { return '0B'; },
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  ctx.runCleanup();
  assert.equal(calls, 0, 'cleanup API must never run without explicit confirmation');
  assert.match(shown[0], /외부에 원본을 백업/);
  assert.match(shown[0], /영구 삭제/);
  ctx.confirm = () => true;
  ctx.runCleanup();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1, 'confirmed cleanup must call API');

  assert.match(html, /삭제한 기록의 사진은 30일 후 이 화면에서 수동으로 정리할 수 있어/);
  assert.match(html, /저장공간 상태를 불러오지 못했어/);
  assert.doesNotMatch(html, /지운 기록의 사진은 30일간 보관했다가 정리돼/);
}

await preservePhotoDraft();
await deleteDraftExplicitly();
await cancelWithoutLosingAnything();
await failedPhotoSaveStopsLogout();
await failedTextSaveWithPhotosStopsLogout();
await failedCacheCleanupStopsLogout();
await incompletePhotoAndDiskOnlyDraft();
await supabaseServerLogout();
await confirmPermanentCleanup();
console.log('[logout-privacy-check] passed: draft preservation, explicit discard/cancel, write failures, cache purge, write races, Supabase revocation/fallback, cleanup confirmation');
