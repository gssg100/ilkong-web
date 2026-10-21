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
  state.catFilter = 'MOOD:🥹';
  assert.match(c.emptyStateHtml(), /이 기분의 기록이 없어/);
  state.activeTab = 'question';
  state.searchQuery = '없는 기록';
  assert.match(c.emptyStateHtml(), /아직 답한 질문이 없어/);
  state.activeTab = 'home';
  assert.match(c.emptyStateHtml(), /아직 기록이 없어/);
});
