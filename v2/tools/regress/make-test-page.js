// Build _test.html: the game with a seeded Math.random, a frozen rAF loop and cleared saves, so a run is repeatable.
// Usage:  node tools/regress/make-test-page.js   → open /_test.html, then in the page:
//   await __regress()                → { title, ch1: [...], ch2: [...] } frame hashes and state per tranh
// Save a run before a refactor and compare after: the hashes must match exactly when behaviour should not change.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
let s = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const paths = fs.readFileSync(path.join(__dirname, 'ch2-solutions.json'), 'utf8');
const pre = `<script>(()=>{try{localStorage.clear()}catch(e){};let x=1234567;Math.random=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296};window.requestAnimationFrame=()=>0;})();
window.__PATHS=${paths.trim()};
window.__onGameReady=()=>{window.__G={S,loadLevel,startPlay,update:tick,render:draw,keys,groom,followers,startC2,c2Move,C2,C2LEVELS,LEVELS};window.__ready=true;};</script>
<script src="tools/regress/harness.js"></script>
`;
s = s.replace(/<script data-goatcounter[^\n]*\n/, '');
s = s.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n' + pre);
fs.writeFileSync(path.join(root, '_test.html'), s);
console.log('wrote _test.html');
