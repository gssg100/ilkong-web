import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { throw new Error(`[release-check] ${message}`); };
const assert = (condition, message) => { if (!condition) fail(message); };

const html = read('index.html');
const serviceWorker = read('sw.js');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
assert(scriptStart >= 0 && scriptEnd > scriptStart, 'inline application script is missing');

const appScript = html.slice(scriptStart + '<script>'.length, scriptEnd);
const markup = html.slice(0, scriptStart);
new Function(appScript);

const versionMatch = appScript.match(/var VERSION = '([^']+)'/);
assert(versionMatch, 'application version is missing');
const version = versionMatch[1];
assert(new RegExp(`v${version.replace(/[.]/g, '\\.')}`).test(serviceWorker), 'service worker version does not match application version');
assert(html.includes(`일콩 기록 v${version}`), 'visible version label does not match application version');

const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
assert(duplicateIds.length === 0, `duplicate element ids: ${duplicateIds.join(', ')}`);

const dynamicIds = new Set(['inlineRetry']);
const referencedIds = [...appScript.matchAll(/\bel\('([^']+)'\)/g)].map((match) => match[1]);
const missingIds = [...new Set(referencedIds.filter((id) => !ids.includes(id) && !dynamicIds.has(id)))];
assert(missingIds.length === 0, `missing static element ids: ${missingIds.join(', ')}`);

for (const requiredId of ['pin', 'loadAllRecords', 'clearLibraryFilters', 'healthDetail', 'backupStatus', 'moreMemories']) {
  assert(ids.includes(requiredId), `required interface element is missing: ${requiredId}`);
}

assert(/maxlength="12"/.test(markup) && /\^\\d\{4,12\}\$/.test(appScript), 'PIN input and validation rules are inconsistent');
assert(appScript.includes('SUPABASE_PRIMARY_WRITE_CUTOVER'), 'Supabase primary write cutover guard is missing');
assert(!appScript.includes("||(!SUPABASE_PRIMARY_WRITE_CUTOVER||(error&&error.code==='MODE'))"), 'legacy MODE fallback was reintroduced');
assert(!appScript.includes("||!SUPABASE_PRIMARY_WRITE_CUTOVER||(error&&error.code==='MODE')"), 'legacy MODE fallback was reintroduced');
assert(appScript.includes('validClientRequestId') && appScript.includes('persistPendingSave'), 'safe post retry safeguards are missing');

console.log(`[release-check] ${version} passed: syntax, ids, versions, PIN policy, write-route guard, retry safeguards`);
