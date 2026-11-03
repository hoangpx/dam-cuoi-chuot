/* Chương II: writes the Siêu khó maps into js/ch2/levels.js. tools/c2-sk.json lists them in order
   ([{ id, han, name, chain? }]); each map comes from tools/c2-gen/<id>.json (tools/c2-gen.js). Everything after the
   Siêu khó marker in C2LEVELS and in C2_CHAIN is rewritten. Then run tools/c2-solve.js --out and tools/c2-chain.js. */
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'c2-sk.json'), 'utf8'));
const PAPERS = ['yellow', 'pink', 'blue', 'white', 'sage', 'lilac'], KEYS = [0, 2, -3, 0, -2, -1];
const f = path.join(root, 'js/ch2/levels.js');
let s = fs.readFileSync(f, 'utf8'); const NL = s.includes('\r\n') ? '\r\n' : '\n'; s = s.split('\r\n').join('\n');
const MK = '  /* ---- Siêu khó (sieu): found by tools/c2-gen.js, written by tools/c2-sk-build.js ---- */';
const MKC = '  // Siêu khó';
const lv = list.map((l, i) => {
  const g = JSON.parse(fs.readFileSync(path.join(__dirname, 'c2-gen', l.file || l.id + '.json'), 'utf8'));
  return `  {\n    han: ${JSON.stringify(l.han)}, name: ${JSON.stringify(l.name)}, paper: "${PAPERS[i % 6]}", key: ${KEYS[i % 6]}, sieu: true,\n` +
    `    map: ${JSON.stringify(g.map).replace(/","/g, '", "')},\n    fixed: ${JSON.stringify(g.fixed)},${g.dirs && g.dirs.length ? '\n    dirs: ' + JSON.stringify(g.dirs) + ',' : ''}\n  },`;
});
const chains = list.map(l => '  ' + JSON.stringify(l.chain || JSON.parse(fs.readFileSync(path.join(__dirname, 'c2-gen', l.file || l.id + '.json'), 'utf8')).chain) + ',');
// C2LEVELS: cut the old block (marker → the array's end) and put the new one in
const endL = s.indexOf('\n];\n// the bought hint');
let a = s.indexOf(MK); if (a < 0 || a > endL) a = endL + 1;
s = s.slice(0, a) + MK + '\n' + lv.join('\n') + '\n' + s.slice(endL + 1);
const cs = s.indexOf('const C2_CHAIN = ['), ce = s.indexOf('\n];', cs);
let b = s.indexOf(MKC, cs); if (b < 0 || b > ce) b = ce + 1;
let head = s.slice(0, b); if (!/,\n$/.test(head)) head = head.replace(/"\n$/, '",\n');
s = head + MKC + '\n' + chains.join('\n').replace(/,$/, '') + s.slice(ce);
fs.writeFileSync(f, s.split('\n').join(NL));
console.log('wrote', list.length, 'Siêu khó maps');
