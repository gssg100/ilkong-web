import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// 실제 배포 HTML에 포함된 함수를 실행해 날짜 전환 및 진통 판정 회귀를 확인한다.
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
function sourceBetween(start, end) {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  assert(from >= 0 && to > from, `Cannot locate application functions: ${start}`);
  return html.slice(from, to);
}

const fields = Object.fromEntries(['healthDate', 'healthWeight', 'healthSys', 'healthDia', 'healthMemo'].map((id) => [id, { value: '' }]));
const healthState = {
  picked: [],
  logs: [
    { date: '2026-10-07', weight: 58.4, systolic: 112, diastolic: 70, memo: '첫째 날', supplements: ['엽산'] },
    { date: '2026-10-09', weight: null, systolic: 121, diastolic: null, memo: '', supplements: [] },
  ],
};
const health = { el: (id) => fields[id], healthState, renderSupplementPills() {} };
vm.createContext(health);
vm.runInContext(sourceBetween('function fillHealthFormForDate(){', 'function renderSupplementPills(){'), health);

fields.healthDate.value = '2026-10-07';
health.fillHealthFormForDate();
assert.equal(fields.healthWeight.value, '58.4');
assert.equal(fields.healthSys.value, '112');
assert.equal(fields.healthDia.value, '70');
assert.equal(fields.healthMemo.value, '첫째 날');
assert.deepEqual(Array.from(healthState.picked), ['엽산']);

fields.healthDate.value = '2026-10-08';
health.fillHealthFormForDate();
for (const id of ['healthWeight', 'healthSys', 'healthDia', 'healthMemo']) {
  assert.equal(fields[id].value, '', `${id} retained the previous date's value`);
}
assert.equal(healthState.picked.length, 0);

fields.healthDate.value = '2026-10-09';
health.fillHealthFormForDate();
assert.equal(fields.healthWeight.value, '');
assert.equal(fields.healthSys.value, '121');
assert.equal(fields.healthDia.value, '');
assert.equal(fields.healthMemo.value, '');

const now = Date.now();
class FixedDate extends Date {
  static now() { return now; }
}
const widgets = {};
const labor = {
  Date: FixedDate,
  LABOR_WINDOW_MS: 60 * 60 * 1000,
  LABOR_KEEP_MS: 6 * 60 * 60 * 1000,
  state: { labor: { items: [], saving: false } },
  el(id) { return widgets[id] ||= { className: '', innerHTML: '', textContent: '' }; },
  text(node, value) { node.textContent = String(value); },
  escapeHtml(value) { return String(value); },
  pad2(n) { return String(n).padStart(2, '0'); },
  renderLaborLive() {},
};
vm.createContext(labor);
vm.runInContext(sourceBetween('function completedLabor(){', 'function renderLaborLive(){'), labor);

function contractions(count, gapSeconds = 300, durationSeconds = 60) {
  // 맨 마지막 진통은 1분 전에 끝났고, 앞선 진통들은 설정된 간격으로 발생했다.
  const firstStart = now - 60_000 - (count - 1) * gapSeconds * 1000;
  return Array.from({ length: count }, (_, i) => {
    const start = firstStart + i * gapSeconds * 1000;
    return { start, end: start + durationSeconds * 1000 };
  });
}
function checkLabor(items, expected, label) {
  labor.state.labor.items = items;
  const result = labor.laborSummary();
  assert.equal(result.meets, expected, label);
  labor.renderLaborTimer();
  assert.equal(widgets.laborSignal.innerHTML.includes('5-1-1 조건에 해당'), expected, `${label}: UI disagrees with decision`);
}

checkLabor(contractions(13), true, '5분 이내 간격, 매회 60초, 60분 연속');
checkLabor(contractions(12), false, '55분 연속은 1시간 미달');
checkLabor(contractions(13, 300, 45), false, '45초 진통은 1분 미달');
checkLabor(contractions(13, 300, 59), false, '59초 진통은 1분 미달');
const brokenDuration = contractions(13);
brokenDuration[6].end = brokenDuration[6].start + 45_000;
checkLabor(brokenDuration, false, '한 번이라도 1분 미만이면 연속성 중단');
const brokenGap = contractions(14);
for (let i = 0; i < 7; i++) {
  brokenGap[i].start -= 60_000;
  brokenGap[i].end -= 60_000;
}
checkLabor(brokenGap, false, '한 번이라도 5분을 넘기면 연속성 중단');
checkLabor(contractions(13).map(({ start, end }) => ({ start: start - 20 * 60_000, end: end - 20 * 60_000 })), false, '오래 지난 기록은 현재 경보에서 제외');
assert.match(html, /의료진이 안내한 연락·내원 기준을 가장 먼저 따라 주세요/);

console.log('[health-labor-check] passed: per-date health fields, exact 5-1-1 thresholds, continuous intervals, alert text');
