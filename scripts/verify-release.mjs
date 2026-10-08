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
assert(!html.includes('화면 v4.4.2'), 'stale settings version label remains');
assert(appScript.includes("serviceWorker.register('sw.js?v='+encodeURIComponent(VERSION)"), 'service worker registration is pinned to a stale hard-coded version');
assert(appScript.includes("event.source!==bridge.frame.contentWindow"), 'bridge messages are not pinned to the created iframe');
assert(appScript.includes("bridge.target.postMessage({ilkongBridge:'call'" ) && appScript.includes(',bridge.origin);'), 'bridge calls are not pinned to the verified origin');
assert(!appScript.includes("bridge.target.postMessage({ilkongBridge:'call',id:id,fn:name,args:args||[]},'*')"), 'bridge token-bearing calls still use wildcard targetOrigin');
assert(appScript.includes("document.querySelectorAll('#moodChoices .mood-btn')"), 'composer mood handlers are not scoped away from check-in controls');
assert(!/function setupPwa\(\)[\s\S]{0,900}\bensureBridge\(\)/.test(appScript), 'PWA still eagerly opens the legacy GAS bridge');
assert(appScript.includes('var ALLOW_BROWSER_GAS_FALLBACK=false;'), 'browser GAS fallback was re-enabled');
assert(appScript.includes('var APPS_SCRIPT_EXEC=\'\';'), 'legacy GAS deployment URL is still embedded in the PWA');
assert(!html.includes('script.google.com/macros/s/'), 'legacy GAS deployment URL leaked into the public PWA source');
assert(!appScript.includes('SUPABASE_DIRECT_READS'), 'post-cutover read fallback allowlist remains');
assert(/if\(!SUPABASE_PRIMARY_WRITE_CUTOVER\)\{[\s\S]{0,180}callSupabaseLegacyApi/.test(appScript), 'legacy read fallback is not limited to pre-cutover mode');
assert(appScript.includes("if(!SUPABASE_PRIMARY_WRITE_CUTOVER) return callSupabaseLegacyApi(name,args,timeout);"), 'unmapped API fallback is not limited to pre-cutover mode');
assert(!/callSupabaseRead\(name,args,timeout\)\.catch\(function\(error\)\{\s*supabaseToken=''/.test(appScript), 'home/image reads still fall back to legacy after cutover');
assert(/state\.session=upgradedSession;[\s\S]{0,120}saveSession\(upgradedSession\)/.test(appScript), 'legacy-to-Supabase session exchange is not persisted');

const calledApis = [...new Set([...appScript.matchAll(/\bcallApi\('([^']+)'/g)].map((match) => match[1]))];
const directBlock = appScript.match(/var SUPABASE_DIRECT_FUNCTIONS=\{([\s\S]*?)\};/);
assert(directBlock, 'Supabase direct routing table is missing');
const directApis = new Set([...directBlock[1].matchAll(/([A-Za-z0-9_]+):true/g)].map((match) => match[1]));
const specialSupabaseApis = new Set(['apiLoginV221', 'apiGetHomeV221', 'apiGetImagesBatchV285']);
const legacyOnlyCalls = calledApis.filter((name) => !directApis.has(name) && !specialSupabaseApis.has(name));
assert(legacyOnlyCalls.length === 0, `active APIs still depend on browser GAS fallback: ${legacyOnlyCalls.join(', ')}`);
assert(/if\(name==='apiLoginV221'\)\{[\s\S]{0,220}callSupabaseLogin/.test(appScript), 'login is not routed to Supabase first');
assert(appScript.includes("requestId:actionId"), 'each direct user action must provide an operation id');
assert(appScript.includes('function send(){ return supabaseRequest(requestBody,timeout); }'), 'direct retries must reuse their original request body');
assert(appScript.includes("if(name==='apiChangePinV320') return send();"), 'PIN changes must not be retried after a session may have been revoked');
assert(appScript.includes('function clearLogoutReadCache(){'), 'logout privacy cache cleanup missing');
assert(appScript.includes("supabaseRequest({op:'logout',token:String(oldSession.token)},8000)"), 'logout must revoke the active server session');
assert(appScript.includes('외부에 원본을 백업했는지 확인했어?'), 'permanent Storage cleanup lacks a backup confirmation');

console.log(`[release-check] ${version} passed: syntax, ids, versions, PIN policy, write/read cutover guards, stable action retry ids, logout privacy, cleanup confirmation, Supabase routing coverage`);
