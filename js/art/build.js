/* Render every shared part once (fonts are already loaded by index.html), plus the paper colours. */
buildItems();
const PROPS = buildProps();
const CAT = buildCat();
const WP = buildWorldParts();
const MP = buildMoreParts();
const MICE = {
  groom: buildMouse({ robe: 'green', trim: 'red', head: 'dark', hat: 'dark', dots: true }),
  a: buildMouse({ robe: 'red', trim: 'green', head: 'brown' }),
  b: buildMouse({ robe: 'lilac', trim: 'red', head: 'dark' }),
  c: buildMouse({ robe: 'green', trim: 'yellow', head: 'brown' }),
  d: buildMouse({ robe: 'red', trim: 'lilac', head: 'dark', dots: true }),
};
const PAPERS = {
  yellow: { base: '#e1b23a', hi: '#f0cb63', lo: '#c8981f', s1: '#b98a1e', s2: '#f5d57a', fib: '#a97a17', css: '#e2b43c', spark: '#fff6d8' },
  pink: { base: '#e2a597', hi: '#f2c6bc', lo: '#c98575', s1: '#b57266', s2: '#f8d9d1', fib: '#a2665b', css: '#e2a597', spark: '#fff3ef' },
  blue: { base: '#a7c0c1', hi: '#c8dbda', lo: '#86a3a4', s1: '#7a9798', s2: '#e1ecea', fib: '#6c8889', css: '#a7c0c1', spark: '#ffffff' },
  white: { base: '#ebe3cd', hi: '#faf6ea', lo: '#d6cbb0', s1: '#c3b596', s2: '#fdfbf3', fib: '#b3a37f', css: '#ebe3cd', spark: '#ffffff' },
  sage: { base: '#b4c19a', hi: '#cdd8b3', lo: '#94a27b', s1: '#859371', s2: '#e3ecd0', fib: '#7a8867', css: '#b4c19a', spark: '#fbfff0' },
  lilac: { base: '#b8a5c8', hi: '#d2c3df', lo: '#9985ab', s1: '#8a779d', s2: '#e8def1', fib: '#7b698e', css: '#b8a5c8', spark: '#ffffff' },
};
let paperKey = null, paperImg = null;
const getPaper = k => { if (k !== paperKey) { if (paperImg) paperImg.width = paperImg.height = 0; paperImg = makePaper(PAPERS[k]); paperKey = k; } return paperImg; };
