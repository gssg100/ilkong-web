// Keep one self-contained HTML delivery for GitHub Pages, PWA and Android OTA.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(resolve(root, file), 'utf8').replace(/\r\n/g, '\n');
const app = read('src/app.js').replace(/^      \/\/ @include (modules\/[a-z]+\.js)\r?\n/gm, (_, file) => read('src/' + file));
if (app.includes('// @include ')) throw new Error('Unresolved source module');
const output = read('src/index.template.html')
  .replace(/<style>[\s\S]*?<\/style>/, () => '<style>' + read('src/styles.css') + '</style>')
  .replace(/<script>[\s\S]*?<\/script>/, () => '<script>' + app.trimEnd() + '\n</script>');
if (process.argv.includes('--check')) {
  if (read('index.html') !== output) throw new Error('index.html is stale. Run npm run build.');
  console.log('Generated HTML matches feature sources.');
} else {
  writeFileSync(resolve(root, 'index.html'), output);
  console.log('Built self-contained index.html.');
}
