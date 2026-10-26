// Exercise the application functions without credentials or production writes.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { test } from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function source(name) {
  const match = html.match(new RegExp('^      function ' + name + '\\([^]*?^      }', 'm'));
  assert.ok(match, `missing application function: ${name}`);
  return match[0];
}
function run(names, dependencies = {}) {
  const context = vm.createContext({ Date, Promise, ...dependencies });
  names.forEach(name => vm.runInContext(source(name), context));
  return context;
}
const dateFunctions = ['calendarDay', 'pregnancyForToday', 'homeForToday'];
const basePregnancy = () => ({
  valid: true, phase: 'PREGNANCY', week: 13, day: 5, dday: 184,
  dueDate: '2027-03-03', referenceDate: '2026-07-21', referenceWeek: 7, referenceDay: 6,
  calculatedOn: '2026-08-31', checkupDate: '2026-09-17', checkupDday: 17,
});

test('old snapshots recompute calibrated week, due date and expired checkup without mutating the snapshot', () => {
  const c = run(dateFunctions, { today: () => '2026-10-26' });
  const p = basePregnancy();
  const home = { asOfDate: '2026-08-31', fetchedAt: 1234, app: { pregnancy: p }, posts: [] };
  const result = c.homeForToday(home, { fromSnapshot: true });
  assert.equal(result.app.pregnancy.week, 21);
  assert.equal(result.app.pregnancy.day, 5);
  assert.equal(result.app.pregnancy.dday, 128);
  assert.equal(result.app.pregnancy.checkupDate, '');
  assert.equal(result.app.pregnancy.checkupDday, null);
  assert.equal(result.fetchedAt, 1234, 'offline recalculation must not claim a fresh server fetch');
  assert.equal(result.asOfDate, '2026-10-26');
  assert.equal(home.asOfDate, '2026-08-31');
  assert.equal(p.week, 13);
  assert.equal(p.checkupDday, 17);
});

test('legacy snapshot with no date baseline hides unverified week and never carries an old positive checkup countdown', () => {
  const c = run(dateFunctions, { today: () => '2026-10-26' });
  const p = { valid: true, phase: 'PREGNANCY', week: 13, day: 5, dday: 184,
    dueDate: '2027-03-03', checkupDate: '2026-09-17', checkupDday: 17 };
  const first = c.homeForToday({ app: { pregnancy: p } }, { fromSnapshot: true });
  assert.equal(first.app.pregnancy.valid, false);
  assert.equal(first.app.pregnancy.week, undefined);
  assert.equal(first.app.pregnancy.day, undefined);
  assert.equal(first.app.pregnancy.checkupDate, '');
  const second = c.homeForToday(first, { fromSnapshot: true, dateOnly: true });
  assert.equal(second.app.pregnancy.valid, false, 'a fabricated current baseline must not validate an unknown old week');
});

test('known legacy baseline advances exact calendar days and preserves same-day and future checkups', () => {
  const c = run(dateFunctions, { today: () => '2026-10-26' });
  const p = { valid: true, phase: 'PREGNANCY', week: 21, day: 4, dueDate: '2027-03-03', checkupDate: '2026-10-26' };
  const result = c.pregnancyForToday(p, '2026-10-25');
  assert.equal(result.week, 21);
  assert.equal(result.day, 5);
  assert.equal(result.checkupDday, 0);
  const next = c.pregnancyForToday({ ...p, checkupDate: '2026-11-20' }, '2026-10-25');
  assert.equal(next.checkupDday, 25);
});

test('birth age uses the actual birth date and calendar validation rejects impossible dates', () => {
  const c = run(dateFunctions, { today: () => '2028-03-01' });
  const result = c.pregnancyForToday({ valid: true, phase: 'BORN', birthDate: '2028-02-28', ageDays: 0 }, '2028-02-28');
  assert.equal(result.ageDays, 2);
  assert.equal(result.dday, -2);
  assert.equal(result.checkupDate, '');
  assert.ok(Number.isNaN(c.calendarDay('2026-02-29')));
  assert.ok(Number.isNaN(c.calendarDay('2026-13-01')));
  assert.ok(Number.isNaN(c.calendarDay('2026-10-26T00:00:00Z')));
});

test('trip date labels advance with an offline snapshot', () => {
  const c = run(dateFunctions, { today: () => '2026-10-26' });
  const result = c.homeForToday({ app: { trip: { name: '여행', from: '2026-10-25', to: '2026-10-28', dday: 2, dayIndex: null } } }, { fromSnapshot: true });
  assert.equal(result.app.trip.dday, -1);
  assert.equal(result.app.trip.dayIndex, 2);
});

test('KST day rollover recalculates once, retains failed refresh work and avoids disturbing active input', async () => {
  let day = '2026-10-25', paused = true, applications = 0, refreshes = 0;
  const state = { home: {}, homeDateKey: day, homeFromSnapshot: true, autoRefreshFailures: 0 };
  const c = run(['refreshDateContext', 'checkForUpdates'], {
    state, today: () => day, AUTO_REFRESH_MS: 30000,
    el: () => ({ classList: { contains: () => true } }),
    applyHome(home, options) {
      applications++;
      assert.equal(options.dateOnly, true);
      state.homeDateKey = day;
    },
    shouldPauseAutoRefresh: () => paused,
    refreshHome(options) {
      refreshes++;
      assert.equal(options.source, 'day-change');
      return Promise.resolve(false); // An offline failure must be retried later.
    },
    callApi() { throw new Error('day rollover must fetch home even without a revision change'); },
  });
  c.checkForUpdates();
  assert.equal(applications, 0);
  day = '2026-10-26';
  c.checkForUpdates();
  assert.equal(applications, 1);
  assert.equal(state.dateRefreshNeeded, true);
  assert.equal(refreshes, 0, 'typing pauses network application, not the calendar correction');
  paused = false;
  await c.checkForUpdates();
  await c.checkForUpdates();
  assert.equal(applications, 1);
  assert.equal(refreshes, 2);
  assert.equal(state.dateRefreshNeeded, true);
});

test('date freshness distinguishes cached data from a successful network response', () => {
  const node = { textContent: '', hidden: true };
  const state = { homeFromSnapshot: true, home: { fetchedAt: 42, app: { pregnancy: { valid: true } } } };
  const c = run(['renderDateFreshness'], {
    state, el: () => node, text: (n, value) => n.textContent = value,
    hide: n => n.hidden = true, show: n => n.hidden = false,
    formatOperationalTime: () => '2026.10.25 23:00',
  });
  c.renderDateFreshness();
  assert.equal(node.hidden, false);
  assert.match(node.textContent, /마지막 확인 2026.10.25 23:00/);
  assert.match(node.textContent, /날짜는 오늘 기준/);
  state.homeFromSnapshot = false;
  c.renderDateFreshness();
  assert.equal(node.hidden, true);
  state.dateRefreshNeeded = true;
  c.renderDateFreshness();
  assert.equal(node.hidden, false);
});

test('guide displays past/current/upcoming/unknown timing without implying that an exam was completed', () => {
  const nodes = {};
  const el = id => nodes[id] ||= { innerHTML: '', children: [], appendChild(node) { this.children.push(node); } };
  let info = { week: 21, day: 5, phase: 'PREGNANCY' };
  const c = run(['renderGuidebook'], {
    currentPregnancyWeekInfo: () => info, el,
    PRENATAL_TESTS: [
      { name: '과거 검사', from: 6, to: 9, desc: '안내' },
      { name: '현재 검사', from: 20, to: 24, desc: '안내' },
      { name: '다음 검사', from: 28, to: 30, desc: '안내' },
    ],
    NUTRITION_GUIDE: [], FOOD_SAFETY: [], DANGER_SIGNS: [], PARTNER_TIPS: [],
    document: { createElement: () => ({ innerHTML: '', className: '' }) },
    escapeHtml: x => x, renderGuideList() {}, weekStageIndex: () => 0,
  });
  c.renderGuidebook();
  const rows = nodes.guideTests.children;
  assert.match(rows[0].innerHTML, /안내 시기 지남/);
  assert.match(rows[1].innerHTML, /현재 시기/);
  assert.match(rows[2].innerHTML, /예정 시기/);
  assert.ok(rows.every(row => !/✅|검사 완료|guide-done/.test(row.innerHTML + row.className)));
  nodes.guideTests.children = [];
  info = null;
  c.renderGuidebook();
  assert.ok(nodes.guideTests.children.every(row => /시기 확인 전/.test(row.innerHTML)));
});

test('record-date sorting keeps cached and merged feed months contiguous without mutating source order', () => {
  const state = { activeTab: 'home', viewFilter: 'ALL' };
  const c = run(['filteredPosts'], { state });
  const posts = [
    { id: 'backdated', recordDate: '2026-08-31' },
    { id: 'october-a', recordDate: '2026-10-10' },
    { id: 'september', recordDate: '2026-09-02' },
    { id: 'october-b', recordDate: '2026-10-10' },
  ];
  assert.deepEqual(Array.from(c.filteredPosts(posts), post => post.id), ['october-a', 'october-b', 'september', 'backdated']);
  assert.equal(posts[0].id, 'backdated');
});

test('visibility resume checks calendar changes even before the polling interval expires', () => {
  assert.match(html, /visibilitychange'[\s\S]{0,180}refreshDateContext\(\)/);
  assert.match(html, /state\.homeDateKey=''; state\.homeFromSnapshot=false; state\.dateRefreshNeeded=false;/);
});
