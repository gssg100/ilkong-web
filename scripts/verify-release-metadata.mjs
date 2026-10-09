// Every web upgrade must expose a verifiable version, KST release date and
// changelog. The CI job fetches the prior commit to detect silent changes.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const get = (file) => readFileSync(resolve(root, file), 'utf8');
const html = get('index.html');
const serviceWorker = get('sw.js');
const refresh = get('refresh.html');
const pkg = JSON.parse(get('package.json'));
const script = html.split('<script>')[1]?.split('</script>')[0] || '';
const version = script.match(/\bvar VERSION = '([0-9]+\.[0-9]+\.[0-9]+)';/)?.[1];
assert.ok(version, '[release-metadata] application version missing');

const releaseMatch = script.match(/\bvar RELEASE_INFO\s*=\s*(\{[\s\S]*?\})\s*;/);
assert.ok(releaseMatch, '[release-metadata] RELEASE_INFO object missing');
// Only evaluate the literal release object, never the running application.
const release = Function('VERSION', `"use strict";return (${releaseMatch[1]});`)(version);
assert.equal(release.version, version, '[release-metadata] release metadata version mismatch');
assert.equal(release.timezone, 'Asia/Seoul', '[release-metadata] release timezone must be Asia/Seoul');

function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return false;
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}
function semver(v) { return v.split('.').map(Number); }
function newer(a, b) {
  const x = semver(a), y = semver(b);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
}
const goodNotes = (notes) => Array.isArray(notes) && notes.length > 0 && notes.every((note) => typeof note === 'string' && note.trim().length >= 6);
assert.ok(validDate(release.date), '[release-metadata] release date missing/invalid');
assert.ok(goodNotes(release.notes), '[release-metadata] release notes missing');
assert.ok(Array.isArray(release.history) && release.history.length >= 3, '[release-metadata] recent release history missing');
let lastVersion = version;
let lastDate = release.date;
for (const entry of release.history) {
  assert.ok(/^\d+\.\d+\.\d+$/.test(entry.version) && newer(lastVersion, entry.version), '[release-metadata] history versions must descend');
  assert.ok(validDate(entry.date) && entry.date <= lastDate, '[release-metadata] release history dates must descend');
  assert.ok(goodNotes(entry.notes), '[release-metadata] release history requires changes');
  lastVersion = entry.version;
  lastDate = entry.date;
}

const dateLabel = release.date.replaceAll('-', '.');
for (const attr of ['ilkong-release-version', 'ilkong-release-date']) {
  const expected = attr.endsWith('version') ? version : release.date;
  const tag = html.match(new RegExp(`<meta\\s+name=["']${attr}["']\\s+content=["']([^"']+)["']`));
  assert.equal(tag?.[1], expected, `[release-metadata] ${attr} meta tag missing/stale`);
}
for (const id of ['loginVersion', 'versionText']) {
  const visible = html.match(new RegExp(`<[^>]+id=["']${id}["'][^>]*>([^<]+)`))?.[1] || '';
  assert.ok(visible.includes(`v${version}`) && visible.includes(dateLabel), `[release-metadata] ${id} must show version and KST upgrade date without JavaScript`);
}
for (const id of ['releaseHistory', 'loginReleaseHistory', 'settingsReleaseHistory', 'releaseInfo', 'settingsReleaseStamp']) {
  assert.ok(html.includes(`id="${id}"`), `[release-metadata] ${id} must appear on the site`);
}
assert.ok((html.match(/<details\b[^>]*class="release-details"/g) || []).length >= 2, '[release-metadata] release history must be expandable before and after login');
assert.equal(pkg.version, version, '[release-metadata] package version mismatch');
assert.ok(serviceWorker.includes(`var CACHE = 'ilkong-shell-v${version}'`), '[release-metadata] PWA cache version mismatch');
assert.ok(serviceWorker.includes(`v${version}`) && serviceWorker.includes(release.date), '[release-metadata] service worker version/date mismatch');
assert.ok(refresh.includes(`?updated=${version}`) && refresh.includes(`sw.js?v=${version}`) && refresh.includes(dateLabel), '[release-metadata] refresh page version/date mismatch');

function git(...args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
try {
  const dirtyApp = !!git('status', '--porcelain', '--', 'index.html', 'sw.js', 'manifest.json', 'refresh.html');
  const base = dirtyApp ? 'HEAD' : 'HEAD^';
  const previousHtml = git('show', `${base}:index.html`);
  const previousVersion = previousHtml.match(/\bvar VERSION = '([0-9]+\.[0-9]+\.[0-9]+)';/)?.[1];
  const changed = !!git('diff', '--name-only', base, '--', 'index.html', 'sw.js', 'manifest.json', 'refresh.html');
  if (changed && previousVersion) {
    assert.ok(newer(version, previousVersion), `[release-metadata] app changed but version was not increased (was ${previousVersion})`);
    const oldDate = previousHtml.match(/\bvar RELEASE_INFO\s*=\s*\{[\s\S]*?date\s*:\s*'([\d-]+)'/)?.[1];
    if (oldDate) assert.ok(release.date >= oldDate, '[release-metadata] date went backwards');
  }
} catch (error) {
  // Missing git parent can occur in exported source directories; CI uses a
  // two-commit checkout and must never skip a failed release assertion.
  if (error.code === 'ERR_ASSERTION') throw error;
  if (process.env.GITHUB_ACTIONS === 'true') throw error;
}

console.log(`[release-metadata] v${version} · ${dateLabel} KST: visible labels, changes/history, meta, package, SW, refresh, upgrade gate passed`);
