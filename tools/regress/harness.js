// Regression harness (see make-test-page.js): runs every tranh of both chapters and hashes the frames.
// Needs globals: S, loadLevel, startPlay, update, render, keys, groom, followers, startC2, c2Move, C2, C2LEVELS, LEVELS
window.__regress = async function () {
  const G = window.__G || window;
  const out = { ch1: [], ch2: [], title: null };
  const cv = document.getElementById('cv');
  const hash = () => { const s = cv.toDataURL('image/png'); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
  const tick = (sec) => { for (let i = 0; i < Math.round(sec * 60); i++) G.update(1 / 60); };
  G.render(); out.title = hash();
  for (let i = 0; i < G.LEVELS.length; i++) {
    G.loadLevel(i); G.startPlay();
    const S = G.S, rec = { i };
    tick(1); G.render(); rec.h0 = hash();
    G.keys.add('ArrowRight'); tick(5); G.keys.delete('ArrowRight'); tick(.5);
    G.render(); rec.h1 = hash();
    rec.x = Math.round(G.groom.x); rec.catches = S.catches; rec.cp = S.cp; rec.inv = S.inv.join();
    // tap everything clickable once (entities decide what happens), then drag whatever is carried onto the nearest taker
    for (const e of S.ents) if (e.onClick) { const x = e.ax ?? e.x ?? G.groom.x; e.onClick(x, 250); }
    tick(2); G.render(); rec.h2 = hash(); rec.inv2 = S.inv.join(); rec.x2 = Math.round(G.groom.x);
    out.ch1.push(rec);
  }
  const PATHS = window.__PATHS;
  const D = { L: [-1, 0], R: [1, 0], U: [0, -1], D: [0, 1] };
  for (let i = 0; i < G.C2LEVELS.length; i++) {
    G.startC2(i); tick(.5); G.render(); const h0 = hash();
    for (const c of PATHS[i] || '') G.c2Move(...D[c]);
    tick(1); G.render();
    out.ch2.push({ i, h0, h1: hash(), won: !!G.C2.st.won, moves: G.C2.moves });
  }
  return out;
};
