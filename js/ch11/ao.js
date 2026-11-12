/* Chương XI · Làng Vũ Đại — ao cá ở nhà (owner 2026-11-10/11, batch C of "nuôi cá"). The pond on the home farm can be stocked.
   A fish trap on a bamboo post stands on its bank (C11_AO_AT): tap it for the pond's sheet. Skill 'ao' (Nuôi cá) from the fisher,
   who also sells fingerlings in fives (C11_AO_KINDS: rô, trê, chép, trắm; items giong_*). At the pond: release the fingerlings in
   the bag (the pond holds C11_AO_CAP fish; "Kè bờ ao" once doubles it), feed once a day (one feed for every five fish: cám, or
   greens and dry grass), and take the grown ones. A batch grows one day for each day it was fed; three days unfed running and a
   fifth of the fish die. Grown fish left in the pond spawn fingerlings now and then, so a kept pond never runs out.
   SAVE11.ao = { cap, fish: [{ k, n, d }], fed (day), hung }. */

const C11_AO_AT = [18.5, 8.8], C11_AO_CAP = 20, C11_AO_BIG = { go: 30, m: 500 };
const C11_AO_KINDS = {
  ro: { fish: 'ca_ro', name: 'cá rô', days: 4, seed: 5 },
  tre: { fish: 'ca_tre', name: 'cá trê', days: 5, seed: 8 },
  chep: { fish: 'ca_chep', name: 'cá chép', days: 6, seed: 10 },
  tram: { fish: 'ca_tram', name: 'cá trắm', days: 8, seed: 14 },
};
const C11_AO_FEED = ['cam', 'muong', 'cai', 'rau', 'co'];
for (const [k, K] of Object.entries(C11_AO_KINDS)) if (!C11_ITEMS['giong_' + k]) C11_ITEMS['giong_' + k] = { id: 'giong_' + k, name: `${K.name[0].toUpperCase() + K.name.slice(1)} giống`, cat: 'vat', price: K.seed, food: 0, col: '#7fb0c4', desc: `Thả xuống ao nhà, cho ăn ${K.days} ngày thì lớn.` };
C11_SKILLS.ao = { name: 'Nuôi cá', who: 'trade:chài lưới', hearts: 3, fee: 80, desc: 'Thả cá giống xuống ao nhà, cho ăn mỗi ngày, cá lớn thì bắt.', say: ['Ao phải có bèo có rau, ngày nào cũng cho ăn một bữa thì cá mau lớn.', 'Đừng thả dày quá. Ao chật thì cá còi, bỏ đói ba hôm là chết.'] };

const c11Ao = () => SAVE11.ao || (SAVE11.ao = { cap: C11_AO_CAP, fish: [], fed: 0, hung: 0 });
const c11AoN = () => c11Ao().fish.reduce((s, b) => s + b.n, 0);
const c11AoNeed = () => Math.ceil(c11AoN() / 5);
const c11AoHave = () => C11_AO_FEED.reduce((s, id) => s + c11Count(id), 0);
function c11AoFeed() {
  const A = c11Ao(); let need = c11AoNeed();
  if (!need) { C11.menu.note = 'Ao chưa có cá'; return; }
  if (A.fed === SAVE11.day) { C11.menu.note = 'Hôm nay cho ăn rồi'; return; }
  if (c11AoHave() < need) { C11.menu.note = `Cần ${need} phần thức ăn (cám, rau muống, cải, rau dại, cỏ khô), trong túi có ${c11AoHave()}`; return; }
  for (const id of C11_AO_FEED) { const g = Math.min(need, c11Count(id)); if (g) { c11Take(id, g); need -= g; } if (!need) break; }
  A.fed = SAVE11.day; A.hung = 0; C11.aoSplash = 2.2; persist11(); c11OpenAo(); C11.menu.note = 'Cá tranh nhau đớp mồi';
}
function c11AoRelease(k) {
  const A = c11Ao(), have = c11Count('giong_' + k), room = A.cap - c11AoN(), n = Math.min(have, room);
  if (n <= 0) { C11.menu.note = room <= 0 ? `Ao đầy rồi (${A.cap} con)` : 'Không có cá giống'; return; }
  c11Take('giong_' + k, n); A.fish.push({ k, n, d: 0 }); C11.aoSplash = 1.2; persist11(); c11OpenAo(); C11.menu.note = `Đã thả ${n} ${C11_AO_KINDS[k].name} giống`;
}
function c11AoCatch(k) {
  const A = c11Ao(), K = C11_AO_KINDS[k]; let got = 0;
  for (const b of A.fish) { if (b.k !== k || b.d < K.days) continue; while (b.n > 0) { if (c11Add(K.fish, 1)) break; b.n--; got++; } }
  A.fish = A.fish.filter(b => b.n > 0);
  if (!got) { C11.menu.note = 'Túi đầy, không cầm thêm cá được'; return; }
  if (typeof c11Xp === 'function') c11Xp(got * 3); C11.aoSplash = 1.5; persist11(); c11OpenAo(); C11.menu.note = `Bắt được ${got} ${K.name}`;
}
function c11OpenAo() {
  const A = c11Ao(), n = c11AoN(), rows = [];
  if (!c11Know('ao')) { C11.menu = { title: 'Ao nhà mình', note: 'Chưa biết nuôi cá. Người chài lưới ở bến sông dạy nghề này.', cols: 1, rows: [] }; return; }
  const by = {}; for (const b of A.fish) { const K = C11_AO_KINDS[b.k], o = by[b.k] || (by[b.k] = { big: 0, small: 0, left: 99 }); if (b.d >= K.days) o.big += b.n; else { o.small += b.n; o.left = Math.min(o.left, K.days - b.d); } }
  for (const [k, o] of Object.entries(by)) { const K = C11_AO_KINDS[k];
    rows.push({ name: `${K.name[0].toUpperCase() + K.name.slice(1)}: ${o.big} con lớn${o.small ? `, ${o.small} con nhỏ` : ''}`, sub: o.small ? `Con nhỏ còn ${o.left} ngày được cho ăn nữa thì lớn` : 'Để lại trong ao thì thỉnh thoảng cá đẻ thêm', tag: o.big ? `Bắt ${o.big} con lớn` : 'Chưa bắt được', ok: o.big > 0, f: () => c11AoCatch(k) }); }
  if (n) { const need = c11AoNeed(), fed = A.fed === SAVE11.day;
    rows.push({ name: fed ? 'Hôm nay đã cho cá ăn' : 'Cho cá ăn', sub: fed ? 'Mai lại cho ăn một bữa' : `Cần ${need} phần: cám, rau muống, cải, rau dại hoặc cỏ khô (trong túi có ${c11AoHave()})${A.hung ? ` · cá đã đói ${A.hung} ngày` : ''}`, tag: fed ? ' ' : 'Rải thức ăn', ok: !fed && c11AoHave() >= need, f: c11AoFeed }); }
  for (const k of Object.keys(C11_AO_KINDS)) { const have = c11Count('giong_' + k); if (have) rows.push({ name: `Thả ${have} ${C11_AO_KINDS[k].name} giống`, sub: `Cho ăn ${C11_AO_KINDS[k].days} ngày thì lớn`, tag: 'Thả xuống ao', ok: n < A.cap, f: () => c11AoRelease(k) }); }
  if (A.cap <= C11_AO_CAP) rows.push({ name: 'Kè bờ, đào rộng ao', sub: `Ao chứa được ${C11_AO_CAP * 2} con · cần ${C11_AO_BIG.go} gỗ (có ${c11Count('go')}) và ${c4Money(C11_AO_BIG.m)}`, tag: 'Làm', ok: c11Count('go') >= C11_AO_BIG.go && SAVE11.money >= C11_AO_BIG.m, f: () => {
    if (c11Count('go') < C11_AO_BIG.go || SAVE11.money < C11_AO_BIG.m) { C11.menu.note = 'Chưa đủ gỗ hoặc tiền'; return; }
    c11Take('go', C11_AO_BIG.go); SAVE11.money -= C11_AO_BIG.m; A.cap = C11_AO_CAP * 2; persist11(); c11OpenAo(); C11.menu.note = 'Ao đã rộng gấp đôi'; } });
  C11.menu = { title: 'Ao nhà mình', note: n ? `Trong ao có ${n}/${A.cap} con` : 'Ao chưa có cá. Mua cá giống ở người chài lưới rồi mang về thả', cols: 1, rows };
}

(() => {
  const mine = () => C11.area === 'ruong' && !(typeof C11O !== 'undefined' && C11O.visit);
  /* the night: fed batches grow a day; hunger; spawning */
  const oldDay = c11NewDay;
  c11NewDay = function () {
    const A = c11Ao(), n = c11AoN(); let note = '';
    if (n) {
      if (A.fed === SAVE11.day) { for (const b of A.fish) b.d++; A.hung = 0; }
      else { A.hung = (A.hung || 0) + 1; if (A.hung >= 3) { let dead = 0; for (const b of A.fish) { const d = Math.ceil(b.n * .2); b.n -= d; dead += d; } A.fish = A.fish.filter(b => b.n > 0); note = `Cá trong ao đói ba ngày, chết ${dead} con`; } }
      const kinds = [...new Set(A.fish.filter(b => b.d >= C11_AO_KINDS[b.k].days && b.n >= 2).map(b => b.k))];
      if (kinds.length && c11AoN() < A.cap && Math.random() < .3) { const k = kinds[(Math.random() * kinds.length) | 0], m = Math.min(A.cap - c11AoN(), 2 + ((Math.random() * 3) | 0)); A.fish.push({ k, n: m, d: 0 }); note = note || `Ao nhà có thêm ${m} ${C11_AO_KINDS[k].name} con mới nở`; }
      if (!note && A.fish.some(b => b.d === C11_AO_KINDS[b.k].days)) note = 'Cá trong ao đã lớn, bắt được rồi';
    }
    oldDay();
    if (note) setTimeout(() => { if (S.mode === 'c11play') c11Msg(note, note.includes('chết') ? '#a3332a' : '#2f6a4c'); }, 3200);
  };
  /* tapping the trap on the bank */
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) {
    const G = C11;
    if (mine() && !G.sleep && !G.eat && !G.menu && !G.inW && Math.abs(wx - C11_AO_AT[0]) < .6 && wy > C11_AO_AT[1] - 1.5 && wy < C11_AO_AT[1] + .3) {
      if (Math.hypot(G.px - C11_AO_AT[0], G.py - C11_AO_AT[1]) < 1.8) { G.go = null; c11OpenAo(); return; }
      const [ptx, pty] = c11Tile(), d = c11Dist(Math.max(0, Math.min(C11_W - 1, ptx)), Math.max(0, Math.min(C11_H - 1, pty))), gx = Math.floor(C11_AO_AT[0]), gy = Math.floor(C11_AO_AT[1]);
      if (d[gy] && d[gy][gx] >= 0) { G.go = { path: c11Route(d, gx, gy), act: null }; G.aoGo = 1; return; }
    }
    oldTap(tx, ty, wx, wy);
  };
  const oldUpd = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd(dt);
    const G = C11; if (G.aoSplash > 0) G.aoSplash -= dt;
    if (G.aoGo) { if (!mine()) G.aoGo = 0; else if (!G.go) { G.aoGo = 0; if (!G.menu && Math.hypot(G.px - C11_AO_AT[0], G.py - C11_AO_AT[1]) < 2.2) c11OpenAo(); } }
  };
  /* the trap on its post, the fish in the pond */
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    if (!mine()) return;
    const G = C11, A = c11Ao(), n = c11AoN(), P = C11_AREAS.ruong.pond || { x: 16.2, y: 10.2, rx: 1.2, ry: .85 };
    E.push({ y: C11_AO_AT[1], d: () => {
      const X = sx(C11_AO_AT[0]), Y = sy(C11_AO_AT[1]);
      g.fillStyle = 'rgba(22,46,34,.22)'; g.beginPath(); g.ellipse(X + 3, Y, T * .2, T * .06, 0, 0, 6.283); g.fill();
      g.strokeStyle = INK; g.lineWidth = 2; g.lineCap = 'round'; g.fillStyle = '#c9a04a';
      g.beginPath(); g.roundRect(X - T * .035, Y - T * .95, T * .07, T * .95, 2); g.fill(); g.stroke();                                    // the bamboo post
      g.beginPath(); g.moveTo(X, Y - T * .9); g.lineTo(X + T * .3, Y - T * .98); g.stroke();                                               // its arm
      const bx = X + T * .3, by = Y - T * .98 + Math.sin(G.t * 1.4) * 1.5;                                                              // the trap (lờ) hanging from it
      g.strokeStyle = '#5b3a1e'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx, by + T * .1); g.stroke();
      g.fillStyle = '#d8b46a'; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(bx - T * .1, by + T * .1); g.lineTo(bx + T * .1, by + T * .1); g.quadraticCurveTo(bx + T * .17, by + T * .34, bx, by + T * .46); g.quadraticCurveTo(bx - T * .17, by + T * .34, bx - T * .1, by + T * .1); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(91,58,30,.6)'; g.lineWidth = 1; for (const q of [.18, .27, .36]) { g.beginPath(); g.moveTo(bx - T * .13, by + T * q); g.lineTo(bx + T * .13, by + T * q); g.stroke(); }
      if (n && A.fed !== SAVE11.day && c11Know('ao')) { g.fillStyle = '#f2cf5a'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(X, Y - T * 1.2 + Math.sin(G.t * 3) * 2, 9, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.font = '900 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('!', X, Y - T * 1.2 + Math.sin(G.t * 3) * 2 + 1); }   // hungry fish
    } });
    if (!n) return;
    E.push({ y: 8.01, d: () => {                                         // the stock: shadows circling, more of them in a fuller pond
      const m = Math.min(9, 2 + Math.floor(n / 3)), stir = G.aoSplash > 0;
      for (let i = 0; i < m; i++) {
        const sp = (.25 + c11Hash(i, 3, 41) * .3) * (stir ? 3 : 1), a = G.t * sp * (i % 2 ? 1 : -1) + i * 2.1, r = .35 + c11Hash(i, 5, 41) * .6, fx = P.x + .3 + Math.cos(a) * P.rx * r * 1.25, fy = P.y + .1 + Math.sin(a) * P.ry * r * 1.15;
        const X = sx(fx), Y = sy(fy), ang = Math.atan2(Math.cos(a) * P.ry * (i % 2 ? 1 : -1), -Math.sin(a) * P.rx * (i % 2 ? 1 : -1)), L = T * (.13 + c11Hash(i, 7, 41) * .08);
        g.save(); g.translate(X, Y); g.rotate(ang); g.fillStyle = 'rgba(30,52,66,.5)'; g.beginPath(); g.ellipse(0, 0, L, L * .36, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(-L * .8, 0); g.lineTo(-L * 1.5, -L * .4 + Math.sin(G.t * 9 + i) * L * .15); g.lineTo(-L * 1.5, L * .4 + Math.sin(G.t * 9 + i) * L * .15); g.closePath(); g.fill(); g.restore();
      }
      const jp = (G.t * .23 + .3) % 1;                                    // one leaps now and then; all of them when fed
      if (jp < .12 || stir) { const q = stir ? (G.t * 2.2) % 1 : jp / .12, jx = sx(P.x + .3 + Math.sin(Math.floor(G.t * (stir ? 2.2 : .23)) * 7.3) * P.rx * .8), jy = sy(P.y + .1);
        g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(jx, jy, T * (.08 + q * .25), T * (.03 + q * .1), 0, 0, 6.283); g.stroke();
        g.fillStyle = '#c8402f'; g.strokeStyle = INK; g.lineWidth = 1.4; g.save(); g.translate(jx, jy - Math.sin(q * 3.1416) * T * .32); g.rotate(-1.2 + q * 2.4); g.beginPath(); g.ellipse(0, 0, T * .1, T * .045, 0, 0, 6.283); g.fill(); g.stroke(); g.restore(); }
    } });
  };
  /* the fisher sells fingerlings */
  if (typeof c11ToolRows === 'function') {
    const oldRows = c11ToolRows;
    c11ToolRows = function (shop) {
      const rows = oldRows(shop);
      if (shop.who === 'trade:chài lưới') for (const [k, K] of Object.entries(C11_AO_KINDS)) rows.push({ name: `${K.name[0].toUpperCase() + K.name.slice(1)} giống`, sub: c11Know('ao') ? `Thả ao nhà, cho ăn ${K.days} ngày thì lớn` : 'phải học "Nuôi cá" trước', price: K.seed * 5, tag: `5 con · ${c4Money(K.seed * 5)}`, ok: c11Know('ao') && SAVE11.money >= K.seed * 5, f: () => {
        if (!c11Know('ao')) { C11.menu.note = 'Học "Nuôi cá" trước đã'; return; } if (SAVE11.money < K.seed * 5) { C11.menu.note = 'Chưa đủ tiền'; return; }
        const left = c11Add('giong_' + k, 5); if (left === 5) { C11.menu.note = 'Túi đầy rồi'; return; }
        c11Money2(K.seed * (5 - left)); C11.menu.note = `Đã mua ${5 - left} ${K.name} giống. Mang về thả xuống ao nhà`; } });
      return rows;
    };
  }
})();
