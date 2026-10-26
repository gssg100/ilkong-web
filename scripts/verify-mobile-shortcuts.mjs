import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function source(name) {
  const match = html.match(new RegExp('^      function ' + name + '\\([^]*?^      }', 'm'));
  assert.ok(match, `missing ${name}`);
  return match[0];
}
function run(names, dependencies = {}) {
  const c = vm.createContext({ JSON, ...dependencies });
  names.forEach(name => vm.runInContext(source(name), c));
  return c;
}
function node(value = '') {
  return { value, textContent: '', innerHTML: '', attributes: {}, children: [], events: {},
    classList: { hidden: true, contains() { return this.hidden; }, toggle(_, hidden) { this.hidden = hidden; } },
    setAttribute(key, value) { this.attributes[key] = value; },
    removeAttribute(key) { delete this.attributes[key]; },
    appendChild(child) { this.children.push(child); },
    addEventListener(name, handler) { this.events[name] = handler; },
  };
}
const text = (target, value) => target.textContent = value;
const hide = target => target.classList.hidden = true;

test('collapsing filters preserves the active search and dates and updates expanded state', () => {
  const nodes = { libraryFilterPanel: node(), toggleLibraryFilters: node() };
  const state = { searchQuery: '기록', rangeFrom: '2026-10-01' };
  const c = run(['toggleLibraryFilters'], { state, el: id => nodes[id] });
  c.toggleLibraryFilters();
  assert.equal(nodes.libraryFilterPanel.classList.hidden, false);
  assert.equal(nodes.toggleLibraryFilters.attributes['aria-expanded'], 'true');
  c.toggleLibraryFilters();
  assert.equal(nodes.libraryFilterPanel.classList.hidden, true);
  assert.equal(state.searchQuery, '기록');
  assert.equal(state.rangeFrom, '2026-10-01');
});

test('month and explicit date ranges cannot silently intersect after changing period mode', () => {
  const nodes = Object.fromEntries(['libraryPeriodType', 'monthFilterField', 'rangeFilterFields', 'monthFilter', 'rangeFrom', 'rangeTo', 'rangeWarning'].map(id => [id, node('old')]));
  const state = { monthFilter: '2026-10', rangeFrom: '2026-09-01', rangeTo: '2026-09-30', home: { posts: [] } };
  let renders = 0;
  const c = run(['setLibraryPeriod'], { state, el: id => nodes[id], text, hide, renderPosts: () => renders++ });
  c.setLibraryPeriod('month');
  assert.equal(state.monthFilter, '2026-10');
  assert.equal(state.rangeFrom, '');
  assert.equal(state.rangeTo, '');
  assert.equal(nodes.monthFilterField.classList.hidden, false);
  assert.equal(nodes.rangeFilterFields.classList.hidden, true);
  c.setLibraryPeriod('range');
  assert.equal(state.monthFilter, '');
  assert.equal(nodes.monthFilter.value, '');
  assert.equal(nodes.rangeFilterFields.classList.hidden, false);
  state.rangeFrom = '2026-10-01';
  c.setLibraryPeriod('all');
  assert.equal(state.rangeFrom, '');
  assert.equal(nodes.rangeFilterFields.classList.hidden, true);
  assert.equal(renders, 3);
});

test('active filters remain described while their inputs are collapsed', () => {
  const nodes = { viewFilter: { options: [{ textContent: '사진 있는 기록만' }], selectedIndex: 0 }, toggleLibraryFilters: node(), libraryActiveFilters: node() };
  const state = { searchQuery: '여행', catFilter: 'PHOTO', rangeFrom: '2026-10-01', rangeTo: '2026-10-26' };
  const c = run(['renderLibraryFilterSummary'], { state, el: id => nodes[id], text });
  c.renderLibraryFilterSummary();
  assert.equal(nodes.toggleLibraryFilters.textContent, '필터 2');
  assert.match(nodes.libraryActiveFilters.textContent, /검색: 여행/);
  assert.match(nodes.libraryActiveFilters.textContent, /사진 있는 기록만/);
  assert.match(nodes.libraryActiveFilters.textContent, /2026-10-01 ~ 2026-10-26/);
  state.searchQuery = ''; state.catFilter = ''; state.rangeFrom = ''; state.rangeTo = '';
  c.renderLibraryFilterSummary();
  assert.equal(nodes.libraryActiveFilters.classList.hidden, true);
  assert.equal(nodes.toggleLibraryFilters.textContent, '필터');
});

const prefFunctions = ['shortcutOptions', 'normalizeShortcutPreferences', 'shortcutPreferences'];
test('shortcut preferences are account-scoped and invalid stored values cannot become routes', () => {
  let user = 'JISU';
  const stored = { ilkong_shortcuts_v1_JISU: JSON.stringify({ home: 'health', favorites: ['health', 'health', 'unknown', 'notes', 'kick', 'memories'] }) };
  const c = run(prefFunctions, { currentUserId: () => user, storageGet: key => stored[key] });
  assert.equal(c.shortcutPreferences().home, 'health');
  assert.deepEqual(Array.from(c.shortcutPreferences().favorites), ['health', 'notes', 'kick']);
  user = 'HAKONG';
  assert.equal(c.shortcutPreferences().home, 'checklist');
  stored.ilkong_shortcuts_v1_HAKONG = '{broken';
  assert.equal(c.shortcutPreferences().home, 'checklist');
  user = '';
  assert.equal(c.shortcutPreferences().home, 'checklist');
});

test('shortcut storage failure preserves the previous preference and does not claim a successful UI change', () => {
  let accepts = false, rendered = 0, summaries = 0;
  const stored = {}, toasts = [];
  const state = { home: {} };
  const c = run([...prefFunctions, 'saveShortcutPreferences'], {
    state, currentUserId: () => 'JISU', storageGet: key => stored[key],
    storageSet(key, value) { if (accepts) stored[key] = value; return accepts; },
    toast: message => toasts.push(message), renderFavoriteShortcuts: () => rendered++, renderHomeSummary: () => summaries++,
  });
  assert.equal(c.saveShortcutPreferences('health', ['health']), false);
  assert.equal(c.shortcutPreferences().home, 'checklist');
  assert.equal(rendered, 0);
  assert.equal(summaries, 0);
  assert.match(toasts[0], /저장하지 못했어/);
  accepts = true;
  assert.equal(c.saveShortcutPreferences('health', ['health']), true);
  assert.equal(c.shortcutPreferences().home, 'health');
  assert.equal(rendered, 1);
  assert.equal(summaries, 1);
});

test('shortcut editor enforces three favorites while allowing removal and replacement', () => {
  const nodes = { homeShortcutSelect: node(), shortcutChoices: node() }, toasts = [];
  let prefs = { home: 'checklist', favorites: ['health', 'notes', 'checklist'] }, saves = 0;
  const c = run(['shortcutOptions', 'renderShortcutSettings'], {
    el: id => nodes[id], shortcutPreferences: () => prefs,
    document: { createElement: () => node(), createTextNode: textContent => ({ textContent }) },
    renderFavoriteShortcuts() {}, toast: message => toasts.push(message),
    saveShortcutPreferences(home, favorites) { saves++; prefs = { home, favorites: Array.from(favorites) }; return true; },
  });
  c.renderShortcutSettings();
  const labels = nodes.shortcutChoices.children;
  const kick = labels[3].children[0], notes = labels[1].children[0];
  kick.checked = true; kick.events.change.call(kick);
  assert.equal(kick.checked, false);
  assert.equal(saves, 0);
  assert.match(toasts[0], /최대 3개/);
  notes.checked = false; notes.events.change.call(notes);
  kick.checked = true; kick.events.change.call(kick);
  assert.deepEqual(prefs.favorites, ['health', 'checklist', 'kick']);
  assert.equal(prefs.home, 'checklist');
  assert.equal(saves, 2);
});

test('favorite shortcuts return to More while a home shortcut opens directly', () => {
  const state = { sheetReturn: {} }, opened = [], nodes = { moreSheet: node() };
  const c = run(['shortcutOptions', 'openShortcut', 'openHomeShortcut'], {
    state, el: id => nodes[id], hide,
    shortcutPreferences: () => ({ home: 'health' }),
    openHealthSheet: () => { opened.push('health'); delete state.sheetReturn.healthSheet; },
    openCheckupNotes: () => opened.push('notes'), openChecklist: () => opened.push('checklist'),
    openKickCounter: () => opened.push('kick'), openMemories: () => opened.push('memories'),
  });
  c.openShortcut('health', true);
  assert.equal(state.sheetReturn.healthSheet, 'moreSheet');
  c.openHomeShortcut();
  assert.equal(state.sheetReturn.healthSheet, undefined);
  c.openShortcut('unknown', true);
  assert.deepEqual(opened, ['health', 'health']);
});

test('the chosen home card retains checklist counts or displays its selected destination', () => {
  const nodes = {}, el = id => nodes[id] ||= node();
  let selected = 'checklist';
  const state = { homeSummaryChecklist: [{ done: false, content: '준비 항목' }, { done: true }] };
  const c = run(['shortcutOptions', 'renderHomeSummary'], {
    state, el, text, shortcutPreferences: () => ({ home: selected }), hasTodayRecordForCurrentUser: () => false,
    formatKoreanDate: date => date,
  });
  c.renderHomeSummary({ valid: true, checkupDate: '2026-11-20', checkupDday: 25 });
  assert.equal(nodes.summaryChecklistTitle.textContent, '남은 준비 1개');
  selected = 'health';
  c.renderHomeSummary({});
  assert.equal(nodes.summaryShortcutIcon.textContent, '🩺');
  assert.equal(nodes.summaryChecklistTitle.textContent, '엄마 건강 기록');
  assert.match(nodes.summaryChecklistDesc.textContent, /체중/);
});

test('light and dark theme key text combinations meet 4.5:1 contrast', () => {
  const css = html.split('<style>')[1].split('</style>')[0];
  const themes = [css.match(/:root\s*\{([^}]+)\}/)[1], css.match(/html\[data-theme="dark"\]\{([^}]+)\}/)[1]];
  const luminance = hex => {
    const channels = hex.match(/../g).map(h => parseInt(h, 16) / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  for (const theme of themes) {
    const colors = Object.fromEntries([...theme.matchAll(/--([a-z-]+):#([a-f0-9]{6})/g)].map(match => [match[1], match[2]]));
    for (const [a, b] of [['on-accent', 'accent'], ['muted', 'bg'], ['muted', 'card']]) {
      const values = [luminance(colors[a]), luminance(colors[b])];
      assert.ok((Math.max(...values) + .05) / (Math.min(...values) + .05) >= 4.5, `${a}/${b} contrast`);
    }
  }
});
