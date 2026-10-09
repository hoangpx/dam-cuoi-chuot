/* Chương VIII: pull the engine-format map out of each analysis script (tools/c8-<name>.js) by running it with c8-solve stubbed. node tools/c8-ref-maps.js [name…] */
const fs = require('fs'), vm = require('vm');
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['crumbly', 'totems', 'elevator', 'terrace', 'frigid', 'hut', 'ladder', 'gate', 'dim'];
const out = {};
for (const n of names) {
  let src = fs.readFileSync(`tools/c8-${n}.js`, 'utf8').replace(/require\('\.\/c8-solve\.js'\)/g, '({ solve: () => ({}), level: () => ({}), chains: () => [], settle: () => {} })');
  src = src.replace(/^#!.*\n/, '') + '\n;globalThis.__map = typeof map !== "undefined" ? map : null;';
  const ctx = { console: { log() {}, error() {} }, process: { argv: ['node', 'x'], env: {}, exit() { throw new Error('exit'); } }, require: () => ({ solve: () => ({}), level: () => ({}), chains: () => [], settle: () => {}, makeModel: () => ({}) }), module: {}, String, Array, Math, JSON, Number, Set, Map, Object };
  vm.createContext(ctx); try { vm.runInContext(src, ctx); } catch (e) { out[n] = 'ERR ' + e.message; continue; }
  out[n] = ctx.__map;
}
for (const [n, m] of Object.entries(out)) { console.log('== ' + n); console.log(Array.isArray(m) ? m.join('\n') : m); }
