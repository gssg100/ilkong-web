// Fast UI behavior regressions against the real inline application functions.
// No browser session, credentials, or live Supabase calls are required.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function source(name) {
  const match = html.match(new RegExp('^      function ' + name + '\\([^]*?^      }', 'm'));
  assert.ok(match, 'missing function: ' + name);
  return match[0];
}

function run(names, dependencies = {}) {
  const context = vm.createContext({ ...dependencies });
  for (const name of names) vm.runInContext(source(name), context);
  return context;
}

const posts = [
  { id: 'photo', authorId: 'JISU', authorName: '지수', title: '여행', body: '풍경', category: '일상', mood: '🥰', recordDate: '2026-10-21', images: [{ id: 'img' }], comments: [] },
  { id: 'hospital', authorId: 'HAKONG', authorName: '하콩', title: '검진', body: 'Q. 오늘의 질문', category: '병원', mood: '😴', recordDate: '2026-09-18', images: [], comments: [{ content: '검사 결과' }] },
];

function baseState() {
  return { activeTab: 'records', viewFilter: 'ALL', catFilter: '', searchQuery: '', monthFilter: '', rangeFrom: '', rangeTo: '' };
}

test('record select applies PHOTO, MOOD, CAT and resets ALL', () => {
  const state = { ...baseState(), home: { posts } };
  const calls = [];
  const c = run(['setLibraryCategoryFilter', 'filteredPosts'], {
    state,
    ensureAllPostsForLibrary: (reason) => calls.push(reason),
    renderPosts: (items) => calls.push(c.filteredPosts(items).map((item) => item.id).join(',')),
    scrollFeedTop: () => {},
  });
  c.setLibraryCategoryFilter('PHOTO');
  assert.equal(state.catFilter, 'PHOTO');
  assert.equal(calls.at(-1), 'photo');
  c.setLibraryCategoryFilter('MOOD:😴');
  assert.equal(calls.at(-1), 'hospital');
  c.setLibraryCategoryFilter('CAT:병원');
  assert.equal(calls.at(-1), 'hospital');
  c.setLibraryCategoryFilter('ALL');
  assert.equal(state.catFilter, '');
  assert.equal(calls.at(-1), 'photo,hospital');
  assert.equal(calls.filter((item) => item === 'category').length, 3);
  assert.match(html, /viewFilter'\)\.addEventListener\('change',function\(\)\{ setLibraryCategoryFilter\(this\.value\); \}\)/);
});

test('record-only search, comments and date filters do not leak into home or question', () => {
  const state = { ...baseState(), searchQuery: '검사 결과', monthFilter: '2026-09', catFilter: 'CAT:병원' };
  const c = run(['filteredPosts'], { state });
  assert.deepEqual(c.filteredPosts(posts).map((post) => post.id), ['hospital']);
  state.rangeFrom = '2026-10-01';
  assert.equal(c.filteredPosts(posts).length, 0);
  state.activeTab = 'home';
  assert.deepEqual(c.filteredPosts(posts).map((post) => post.id), ['photo', 'hospital']);
  state.activeTab = 'question';
  state.viewFilter = 'QUESTION';
  assert.deepEqual(c.filteredPosts(posts).map((post) => post.id), ['hospital']);
});

test('home summary is hidden on record/question tabs and restored when returning home', () => {
  const state = { ...baseState(), recordSegment: 'ALL', home: { posts } };
  const classes = {};
  const tabs = ['home', 'records', 'question', 'guide', 'more'].map((tab) => ({
    getAttribute: () => tab,
    classList: { toggle(name, value) { if (name === 'active') this.active = value; } },
    setAttribute(name, value) { if (name === 'aria-selected') this.selected = value; },
  }));
  const c = run(['activateTab'], {
    state,
    document: { querySelectorAll: () => tabs },
    el(id) { return classes[id] ||= { classList: { hidden: false, toggle(name, hidden) { if (name === 'hidden') this.hidden = hidden; } } }; },
    openGuidebook() { throw new Error('should not open guide'); },
    openOverlaySheet() { throw new Error('should not open sheet'); },
    syncSegUI() {}, renderQuestionHead() {}, ensureAllPostsForLibrary() {}, renderPosts() {},
    window: { scrollTo() {} },
  });
  c.activateTab('records');
  assert.equal(classes.homeSummary.classList.hidden, true);
  assert.equal(classes.libraryTools.classList.hidden, false);
  c.activateTab('question');
  assert.equal(classes.homeSummary.classList.hidden, true);
  assert.equal(classes.questionHead.classList.hidden, false);
  assert.equal(tabs[2].selected, 'true');
  c.activateTab('home');
  assert.equal(classes.homeSummary.classList.hidden, false);
  assert.equal(classes.libraryTools.classList.hidden, true);
  assert.equal(tabs[0].selected, 'true');
});

test('empty states describe active tab instead of a filter from another tab', () => {
  const state = { ...baseState(), searchQuery: '없는 기록' };
  const c = run(['emptyStateHtml'], { state });
  assert.match(c.emptyStateHtml(), /검색 결과가 없어/);
  state.searchQuery = '';
  state.catFilter = 'PHOTO';
  assert.match(c.emptyStateHtml(), /사진이 있는 기록이 없어/);
  assert.match(c.emptyStateHtml(), /id="resetEmptyFilters"/);
  state.catFilter = 'MOOD:🥹';
  assert.match(c.emptyStateHtml(), /이 기분의 기록이 없어/);
  state.activeTab = 'question';
  state.searchQuery = '없는 기록';
  assert.match(c.emptyStateHtml(), /아직 답한 질문이 없어/);
  assert.doesNotMatch(c.emptyStateHtml(), /id="resetEmptyFilters"/);
  state.activeTab = 'home';
  assert.match(c.emptyStateHtml(), /아직 기록이 없어/);
});

test('resetting record filters cancels pending search and clears date warnings', () => {
  const state = { ...baseState(), home: { posts }, recordSegment: 'PHOTO', searchQuery: '여행', rangeFrom: '2026-10-30', rangeTo: '2026-10-01' };
  const inputs = Object.fromEntries(['searchInput', 'viewFilter', 'monthFilter', 'rangeFrom', 'rangeTo', 'rangeWarning'].map((id) => [
    id,
    { value: id === 'searchInput' ? '여행' : 'x', textContent: '날짜 오류', classList: { add() {} }, remove() {} },
  ]));
  const cleared = [], rendered = [];
  let nextTimer = 0;
  const c = run(['scheduleSearchApply', 'resetLibraryFilters'], {
    state, el: (id) => inputs[id],
    isImeComposing: () => false,
    setTimeout: () => ++nextTimer,
    clearTimeout: (id) => cleared.push(id),
    text: (node, value) => { node.textContent = value; },
    hide: () => {},
    syncSegUI: () => {},
    renderPosts: () => rendered.push(true),
    scrollFeedTop: () => {},
  });
  inputs.rangeFrom.removeAttribute = () => {};
  inputs.rangeTo.removeAttribute = () => {};
  c.scheduleSearchApply(inputs.searchInput);
  assert.equal(state.searchApplyTimer, 1);
  c.resetLibraryFilters();
  assert.deepEqual(cleared, [1]);
  assert.equal(state.searchApplyPending, false);
  assert.equal(state.searchApplyTimer, null);
  assert.equal(state.searchQuery, '');
  assert.equal(state.recordSegment, 'ALL');
  assert.equal(inputs.searchInput.value, '');
  assert.equal(inputs.rangeWarning.textContent, '');
  assert.equal(rendered.length, 1);
});

test('reversed date range gives an inline warning and avoids unnecessary loading', () => {
  const rangeSource = html.match(/^        function applyRange\(\)\{[\s\S]*?^        }/m)?.[0];
  assert.ok(rangeSource, 'date range handler missing');
  const state = { ...baseState(), home: { posts } };
  const attributes = {};
  const nodes = {
    rangeFrom: { value: '2026-10-30', setAttribute: (key, value) => { attributes.from = value; } },
    rangeTo: { value: '2026-10-01', setAttribute: (key, value) => { attributes.to = value; } },
    rangeWarning: { classList: { toggle(name, value) { this.hidden = value; } }, textContent: '' },
  };
  const loaded = [], shown = [];
  const c = vm.createContext({
    state, el: (id) => nodes[id], text: (node, value) => { node.textContent = value; },
    ensureAllPostsForLibrary: (reason) => loaded.push(reason),
    renderPosts: () => shown.push(true),
  });
  vm.runInContext(rangeSource, c);
  c.applyRange();
  assert.match(nodes.rangeWarning.textContent, /시작일이 종료일보다 늦어/);
  assert.equal(nodes.rangeWarning.classList.hidden, false);
  assert.equal(attributes.from, 'true');
  assert.equal(loaded.length, 0);
  nodes.rangeTo.value = '2026-11-01';
  c.applyRange();
  assert.equal(nodes.rangeWarning.textContent, '');
  assert.equal(nodes.rangeWarning.classList.hidden, true);
  assert.equal(attributes.to, 'false');
  assert.deepEqual(loaded, ['range']);
  assert.equal(shown.length, 2);
  assert.match(html, /class="date-range-controls"/);
  assert.match(html, /@media\(max-width:540px\)\{\.date-range-controls\{display:grid/);
});

test('closing settings and kick counter from More returns to the visible More panel', () => {
  const moreButton = { id: 'tab-more' };
  const nodes = Object.fromEntries(['settings', 'kickCounter', 'moreSheet', 'photoPicker'].map((id) => [
    id, { id, hidden: id === 'moreSheet' },
  ]));
  const state = { sheetReturn: { settings: 'moreSheet' }, dialogReturnFocus: { id: 'stale' } };
  const focused = [], restored = [];
  const c = run(['closeOverlaySheet', 'closeSettings', 'closeKickCounter'], {
    state, el: (id) => nodes[id], hide: (node) => { node.hidden = true; },
    show: (node) => { node.hidden = false; }, focusFirstInDialog: (node) => focused.push(node.id),
    restoreDialogFocus: () => restored.push(true),
    document: { querySelector: () => moreButton },
    stopKickTimer() {}, persistKickSession() {},
  });
  c.closeSettings();
  assert.equal(nodes.settings.hidden, true);
  assert.equal(nodes.moreSheet.hidden, false);
  assert.deepEqual(focused, ['moreSheet']);
  assert.equal(state.dialogReturnFocus, moreButton);
  assert.equal(state.sheetReturn.settings, undefined);
  nodes.moreSheet.hidden = true;
  state.sheetReturn.kickCounter = 'moreSheet';
  c.closeKickCounter();
  assert.equal(nodes.kickCounter.hidden, true);
  assert.equal(nodes.moreSheet.hidden, false);
  assert.deepEqual(focused, ['moreSheet', 'moreSheet']);
  c.closeOverlaySheet('photoPicker');
  assert.equal(nodes.photoPicker.hidden, true);
  assert.equal(restored.length, 1);
});

test('photo viewer moves focus inside on open and returns it to the photo on close', () => {
  const original = { isConnected: true, focusCalls: 0, focus() { this.focusCalls++; } };
  const state = { viewerImages: [], viewerIndex: 0, viewerReturnFocus: null };
  const nodes = { photoViewer: { hidden: true }, viewerStage: { innerHTML: '' } };
  const opened = [];
  const c = run(['openPhotoViewer', 'closePhotoViewer'], {
    state, document: { activeElement: original }, el: (id) => nodes[id],
    show: (node) => { node.hidden = false; }, hide: (node) => { node.hidden = true; },
    renderViewer: () => {}, focusFirstInDialog: (node) => opened.push(node),
    zoomReset() {}, viewerZoom: { img: 'image' },
    setTimeout: (fn) => fn(),
  });
  c.openPhotoViewer([{ id: 'one' }], 0);
  assert.equal(nodes.photoViewer.hidden, false);
  assert.deepEqual(opened, [nodes.photoViewer]);
  c.closePhotoViewer();
  assert.equal(nodes.photoViewer.hidden, true);
  assert.equal(state.viewerReturnFocus, null);
  assert.equal(original.focusCalls, 1);
});
