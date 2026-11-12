/* Chương XI · Làng Vũ Đại — wild things and weapons (owner 2026-11-10/11, batch D: "đánh quái các kiểu"). One small engine for
   everything that fights: C11_WILD (kinds: hp, dmg, speed, how far it sees, how it behaves, what it drops, how it is drawn) and
   C11_WILD_AT (where each stands in a place). They are NOT C11.beasts: C11.wild is built on entering a place, less the ones killed
   today (SAVE11.san { day, dead: { area: [index] } }). ai: 'charge' runs at the mouse in bursts (lợn rừng, robbers), 'bite' lies
   still and bites what steps on it, with poison (rắn), 'swoop' flies over everything (dơi), 'boss' is a slow charger with a long
   reach. Fighting: tap a wild thing; within the weapon's reach it is struck (C11_WEAPONS by the item in hand: gậy tầm vông, ngọn
   giáo, dao rựa; bare hands do little), else the mouse runs up to it. A hit takes health (the red bar shows), throws the mouse
   back; health 0 = the usual fainting. Later batches add kinds and places with c11WildKind / C11_WILD_AT. */

const C11_WEAPONS = { gay_tre: { dmg: 1, reach: 1.5 }, giao: { dmg: 2, reach: 2.1 }, dao_rua: { dmg: 3, reach: 1.5 }, dao_phay: { dmg: 1.5, reach: 1.2 } };
const C11_WEAPON_SHOP = [['gay_tre', 'Gậy tầm vông', 40, 'Gậy tre đực đặc ruột. Đánh nhẹ nhưng với được xa.'], ['giao', 'Ngọn giáo', 260, 'Cán tre bịt sắt nhọn. Đâm xa, mạnh gấp đôi gậy.'], ['dao_rua', 'Dao rựa', 420, 'Dao đi rừng lưỡi dày. Chém mạnh nhất, phải vào gần.']];
for (const [id, name, price, desc] of C11_WEAPON_SHOP) if (!C11_ITEMS[id]) C11_ITEMS[id] = { id, name, cat: 'do', price, food: 0, col: '#8a6a4a', desc };
for (const [id, name, cat, price, food, col, desc] of [['thit_rung', 'Thịt lợn rừng', 'thu', 70, 28, '#a8483a', 'Thịt săn chắc, nướng lên thơm lừng.'], ['nanh_lon', 'Nanh lợn rừng', 'quy', 150, 0, '#efe6cc', 'Cặp nanh cong, người ta đeo lấy khước.'], ['da_ran', 'Da rắn', 'vat', 60, 0, '#5f8a4a', 'Lột khéo thì bán được cho thầy lang.'], ['mat_ran', 'Mật rắn', 'che', 120, 0, '#3f7a3a', 'Ngâm rượu, người già quý lắm.'], ['canh_doi', 'Cánh dơi khô', 'vat', 25, 0, '#4a3a4a', 'Thầy lang mua làm thuốc.']])
  if (!C11_ITEMS[id]) C11_ITEMS[id] = { id, name, cat, price, food, col, desc };

const C11_WILD = {
  lon: { name: 'Lợn rừng', hp: 6, dmg: 14, sp: 3.3, see: 4.2, ai: 'charge', run: 1.6, rest: 1.3, xp: 20, r: .55, drops: [['thit_rung', 1, 2], ['nanh_lon', .35, 1]] },
  ran: { name: 'Rắn', hp: 2, dmg: 8, sp: .7, see: .85, ai: 'bite', xp: 10, r: .4, poison: 6, drops: [['da_ran', .7, 1], ['mat_ran', .3, 1]] },
  doi: { name: 'Dơi', hp: 1, dmg: 5, sp: 3.6, see: 3.4, ai: 'swoop', xp: 6, r: .45, drops: [['canh_doi', .5, 1]] },
};
const C11_WILD_AT = {
  rungram: [['lon', 24, 5], ['lon', 27, 16], ['lon', 14, 20], ['ran', 13, 13], ['ran', 29, 7], ['ran', 20, 17], ['ran', 22, 9], ['lon', 4, 9], ['ran', 4, 18]],
  hang: [['doi', 11, 4], ['doi', 12, 11], ['doi', 20, 6], ['doi', 21, 13], ['doi', 19, 7], ['doi', 13, 5], ['ran', 20, 8], ['ran', 10, 11]],
};
function c11WildKind(id, def, draw) { C11_WILD[id] = def; if (draw) C11_WILD_DRAW[id] = draw; }
const c11San = () => { const S0 = SAVE11.san || (SAVE11.san = { day: 0, dead: {} }); if (S0.day !== SAVE11.day) { S0.day = SAVE11.day; S0.dead = {}; } return S0; };
const c11Weapon = () => { const it = c11HandItem(), W = it && C11_WEAPONS[it.id]; return W ? { ...W, id: it.id } : { dmg: .5, reach: 1.2, id: null }; };
const c11WildFree = (x, y) => { const tx = Math.floor(x), ty = Math.floor(y), k = c11Kind(tx, ty); return k !== 'w' && k !== 'E' && !c11Blocked(tx, ty); };
function c11WildSpawn() {
  const L = C11_WILD_AT[C11.area] || [], dead = c11San().dead[C11.area] || [];
  C11.wild = [];
  L.forEach(([kind, x, y, opt], i) => {
    if (dead.includes(i)) return; const K = C11_WILD[kind]; if (!K) return;
    let px = x + .5, py = y + .6; if (K.ai !== 'swoop' && !c11WildFree(px, py)) { let best = null; for (let yy = 1; yy < C11_H - 1; yy++) for (let xx = 1; xx < C11_W - 1; xx++) if (c11WildFree(xx + .5, yy + .6)) { const d = Math.hypot(xx - x, yy - y); if (!best || d < best.d) best = { x: xx + .5, y: yy + .6, d }; } if (best) { px = best.x; py = best.y; } }
    C11.wild.push(Object.assign({ i, kind, x: px, y: py, hx: px, hy: py, hp: K.hp, face: 1, ph: Math.random() * 6, t: Math.random() * 3, cd: 0, stun: 0, mode: 'idle', tx: px, ty: py }, opt || {}));
  });
}
function c11HurtMe(n, fromX, fromY, why) {
  const G = C11; if (G.sleep || G.fade) return;
  SAVE11.hp = Math.max(0, (SAVE11.hp ?? C11_HP) - n); G.hurt = .6; c11Pop(Math.floor(G.px), Math.floor(G.py) - 2, `−${n} máu`, '#c8402f');
  const dx = G.px - fromX, dy = G.py - fromY, d = Math.hypot(dx, dy) || 1, nx = G.px + dx / d * .7, ny = G.py + dy / d * .7; if (c11Free(nx, ny)) { G.px = nx; G.py = ny; } G.go = null; G.swimTo = null;
  if (SAVE11.hp <= 0 && !G.sleep) { c11Msg(why || 'Bị thương nặng, ngất đi', '#a3332a'); G.fainted = true; c11StartSleep(true); }
}
function c11WildDie(w) {
  const K = C11_WILD[w.kind], S0 = c11San(); (S0.dead[C11.area] = S0.dead[C11.area] || []).push(w.i); S0.n = (S0.n || 0) + 1; (S0.by = S0.by || {})[w.kind] = (S0.by[w.kind] || 0) + 1;
  w.dead = .6; const tx = Math.floor(w.x), ty = Math.floor(w.y);
  for (const [id, ch, n] of K.drops || []) if (Math.random() < ch) c11Drop(id, n, tx, ty);
  if (typeof c11Xp === 'function') c11Xp(K.xp || 5); c11Dots(tx, ty, '#e8d8b0', 12, 1.6); c11Msg(`Hạ được ${K.name.toLowerCase()}`, '#2f6a4c');
  if (w.onDead) w.onDead(w); persist11();
}
function c11Strike(w) {
  const G = C11, W = c11Weapon(), K = C11_WILD[w.kind];
  G.atkCd = .5; G.swing = C11_SW; G.face = w.x < G.px ? -1 : 1; c11Spend(1.2);
  w.hp -= W.dmg; w.stun = .4; w.flash = .25; c11Pop(Math.floor(w.x), Math.floor(w.y) - 2, `−${W.dmg}`, '#fbf4dc');
  const dx = w.x - G.px, dy = w.y - G.py, d = Math.hypot(dx, dy) || 1, nx = w.x + dx / d * .45, ny = w.y + dy / d * .45; if (K.ai === 'swoop' || c11WildFree(nx, ny)) { w.x = nx; w.y = ny; }
  if (w.hp <= 0) c11WildDie(w); else if (K.ai === 'bite') w.cd = Math.min(w.cd, .5);
}

/* ---------- how they look ---------- */
const C11_WILD_DRAW = {
  lon(g, X, Y, T, w) {
    const f = w.face, u = T / 64, step = Math.sin(w.ph * 2) * 3 * u * (w.mov ? 1 : 0);
    g.fillStyle = 'rgba(22,46,34,.25)'; g.beginPath(); g.ellipse(X, Y, 26 * u, 6 * u, 0, 0, 6.283); g.fill();
    g.strokeStyle = '#1d1915'; g.lineWidth = 2; g.lineJoin = g.lineCap = 'round';
    g.fillStyle = '#3a2a22'; for (const [dx, s] of [[-13, 1], [-5, -1], [9, 1], [16, -1]]) { g.beginPath(); g.roundRect(X + (dx - 3) * u * f - (f < 0 ? 6 * u : 0), Y - 13 * u, 6 * u, 13 * u + step * s, 2); g.fill(); g.stroke(); }
    g.fillStyle = '#5a4234'; g.beginPath(); g.ellipse(X, Y - 22 * u, 25 * u, 14 * u, 0, 0, 6.283); g.fill(); g.stroke();                      // body
    g.fillStyle = '#2a1e18'; g.beginPath(); for (let i = -4; i <= 3; i++) { const bx = X + i * 5 * u * f; g.moveTo(bx - 2 * u, Y - 34 * u); g.lineTo(bx - 1 * u * f, Y - 42 * u); g.lineTo(bx + 3 * u, Y - 34 * u); } g.fill();   // the bristle ridge
    g.fillStyle = '#5a4234'; g.beginPath(); g.ellipse(X + 22 * u * f, Y - 20 * u, 13 * u, 11 * u, 0, 0, 6.283); g.fill(); g.stroke();         // head
    g.fillStyle = '#7a5a4a'; g.beginPath(); g.ellipse(X + 34 * u * f, Y - 17 * u, 5 * u, 4.5 * u, 0, 0, 6.283); g.fill(); g.stroke();       // snout
    g.fillStyle = '#f4ecd6'; g.beginPath(); g.moveTo(X + 29 * u * f, Y - 14 * u); g.quadraticCurveTo(X + 33 * u * f, Y - 22 * u, X + 30 * u * f, Y - 25 * u); g.quadraticCurveTo(X + 29 * u * f, Y - 19 * u, X + 26 * u * f, Y - 15 * u); g.closePath(); g.fill(); g.stroke();   // tusk
    g.fillStyle = w.mode === 'run' ? '#e5391a' : '#1d1915'; g.beginPath(); g.arc(X + 24 * u * f, Y - 24 * u, 2 * u, 0, 6.283); g.fill();
    g.fillStyle = '#3a2a22'; g.beginPath(); g.moveTo(X + 14 * u * f, Y - 30 * u); g.lineTo(X + 18 * u * f, Y - 38 * u); g.lineTo(X + 21 * u * f, Y - 29 * u); g.closePath(); g.fill(); g.stroke();   // ear
  },
  ran(g, X, Y, T, w) {
    const u = T / 64, f = w.face, up = w.mode === 'run' || w.cd > .9;
    g.lineCap = g.lineJoin = 'round'; const P = []; for (let i = 0; i <= 14; i++) { const q = i / 14; P.push([X + (q - .5) * 40 * u * f, Y - 3 * u + Math.sin(q * 7 + w.ph * (w.mov ? 2 : .6)) * 5 * u * (1 - q * .4) - (up ? Math.max(0, q - .75) * 70 * u : 0)]); }
    for (const [col, lw] of [['#1d1915', 8], ['#5f8a3a', 5]]) { g.strokeStyle = col; g.lineWidth = lw * u; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); }
    g.strokeStyle = '#e0c040'; g.lineWidth = 5 * u; for (let i = 2; i < 13; i += 3) { g.beginPath(); g.moveTo(P[i][0], P[i][1]); g.lineTo(P[i][0] + .5, P[i][1]); g.stroke(); }
    const [hx, hy] = P[14]; g.fillStyle = '#5f8a3a'; g.strokeStyle = '#1d1915'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(hx + 2 * u * f, hy, 5.5 * u, 4 * u, 0, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#e5391a'; g.beginPath(); g.arc(hx + 3 * u * f, hy - 1 * u, 1.2 * u, 0, 6.283); g.fill();
    if (up) { g.strokeStyle = '#c8402f'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(hx + 7 * u * f, hy); g.lineTo(hx + 12 * u * f, hy - 2 * u); g.moveTo(hx + 10 * u * f, hy - 1 * u); g.lineTo(hx + 12 * u * f, hy + 2 * u); g.stroke(); }
  },
  doi(g, X, Y, T, w) {
    const u = T / 64, fl = Math.sin(w.ph * 5), yy = Y - (34 + Math.sin(w.ph * 1.3) * 5) * u;
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(X, Y, 10 * u, 3 * u, 0, 0, 6.283); g.fill();
    g.fillStyle = '#3a2e3e'; g.strokeStyle = '#141018'; g.lineWidth = 1.6; g.lineJoin = 'round';
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(X, yy); g.quadraticCurveTo(X + s * 12 * u, yy - (14 + fl * 10) * u, X + s * 24 * u, yy - fl * 8 * u); g.lineTo(X + s * 18 * u, yy + 4 * u - fl * 3 * u); g.lineTo(X + s * 12 * u, yy + 1 * u); g.lineTo(X + s * 6 * u, yy + 6 * u); g.closePath(); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(X, yy + 1 * u, 5 * u, 7 * u, 0, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(X - 4 * u, yy - 4 * u); g.lineTo(X - 5 * u, yy - 11 * u); g.lineTo(X - 1 * u, yy - 6 * u); g.moveTo(X + 4 * u, yy - 4 * u); g.lineTo(X + 5 * u, yy - 11 * u); g.lineTo(X + 1 * u, yy - 6 * u); g.fill(); g.stroke();
    g.fillStyle = '#f2cf5a'; g.beginPath(); g.arc(X - 2 * u, yy - 2 * u, 1.1 * u, 0, 6.283); g.arc(X + 2 * u, yy - 2 * u, 1.1 * u, 0, 6.283); g.fill();
  },
};

(() => {
  const oldEnter = c11Enter;
  c11Enter = function (id, x, y, quiet) { oldEnter(id, x, y, quiet); c11WildSpawn(); C11.poison = 0; };
  const oldUpd = c11NewUpdate;
  c11NewUpdate = function (dt) {
    oldUpd(dt);
    const G = C11; if (G.fade || G.sleep) return;
    if (G.atkCd > 0) G.atkCd -= dt;
    if (G.poison > 0) { G.poison -= dt; G.poisonT = (G.poisonT || 0) + dt; if (G.poisonT >= 1) { G.poisonT = 0; SAVE11.hp = Math.max(0, SAVE11.hp - 2); G.hurt = .3; c11Pop(Math.floor(G.px), Math.floor(G.py) - 2, 'nọc rắn −2', '#3f7a3a'); if (SAVE11.hp <= 0 && !G.sleep) { c11Msg('Nọc rắn ngấm, ngất đi', '#a3332a'); G.fainted = true; c11StartSleep(true); } } }
    for (const w of G.wild || []) {
      const K = C11_WILD[w.kind]; if (w.dead) { w.dead -= dt; continue; }
      w.ph += dt * 3; w.t -= dt; if (w.cd > 0) w.cd -= dt; if (w.flash > 0) w.flash -= dt; w.mov = false;
      if (w.stun > 0) { w.stun -= dt; continue; }
      const dx = G.px - w.x, dy = G.py - w.y, d = Math.hypot(dx, dy) || .001, inW = G.inW;
      const go = (tx, ty, sp, fly) => { const ex = tx - w.x, ey = ty - w.y, l = Math.hypot(ex, ey); if (l < .05) return true; const st = Math.min(l, sp * dt), nx = w.x + ex / l * st, ny = w.y + ey / l * st; let ok = false;
        if (fly || c11WildFree(nx, w.y)) { w.x = nx; ok = true; } if (fly || c11WildFree(w.x, ny)) { w.y = ny; ok = true; } if (Math.abs(ex) > .05) w.face = ex > 0 ? 1 : -1; w.mov = ok; return !ok; };
      const hit = () => { if (w.cd > 0 || inW && K.ai !== 'swoop') return; w.cd = K.cdHit || 1.5; c11HurtMe(K.dmg, w.x, w.y, K.why); if (K.poison) { G.poison = K.poison; c11Msg('Bị rắn cắn! Nọc ngấm dần, ăn gì đó cho lại máu', '#a3332a'); } };
      if (K.ai === 'bite') {
        if (d < K.see) { w.mode = 'run'; w.face = dx > 0 ? 1 : -1; hit(); }
        else { w.mode = 'idle'; if (w.t <= 0) { w.t = 3 + Math.random() * 5; const a = Math.random() * 6.283; w.tx = w.hx + Math.cos(a) * 1.5; w.ty = w.hy + Math.sin(a) * 1; } go(w.tx, w.ty, K.sp); }
      } else if (K.ai === 'swoop') {
        if (d < K.see && w.cd <= 0) { w.mode = 'run'; go(G.px, G.py - .2, K.sp, true); if (d < .5) { hit(); w.t = 0; } }
        else { w.mode = 'idle'; if (w.t <= 0 || Math.hypot(w.tx - w.x, w.ty - w.y) < .2) { w.t = 1.5 + Math.random() * 2.5; const a = Math.random() * 6.283, r = 1 + Math.random() * 2.2; w.tx = w.hx + Math.cos(a) * r; w.ty = w.hy + Math.sin(a) * r * .7; } go(w.tx, w.ty, K.sp * .55, true); }
      } else {                                                         // charge / boss
        const far = Math.hypot(w.x - w.hx, w.y - w.hy) > (K.leash || 9);
        if (w.mode === 'rest') { if (w.t <= 0) w.mode = 'idle'; }
        else if (d < K.see && !far && !inW) {
          if (w.mode !== 'run') { w.mode = 'run'; w.t = K.run || 2; }
          go(G.px, G.py, K.sp); if (d < (K.hitR || .75)) { hit(); w.mode = 'rest'; w.t = K.rest || 1.2; } else if (w.t <= 0) { w.mode = 'rest'; w.t = K.rest || 1.2; }
        } else { w.mode = 'idle'; if (w.t <= 0) { w.t = 2.5 + Math.random() * 4; const a = Math.random() * 6.283, r = Math.random() * 2.5; w.tx = w.hx + Math.cos(a) * r; w.ty = w.hy + Math.sin(a) * r * .7; } go(far ? w.hx : w.tx, far ? w.hy : w.ty, far ? K.sp * .6 : Math.min(1, K.sp * .3)); }
      }
    }
    if (G.wild) G.wild = G.wild.filter(w => !(w.dead !== undefined && w.dead <= 0));
    if (G.huntTo) { const w = G.huntTo; if (!G.wild || !G.wild.includes(w) || w.dead) G.huntTo = null; else { const W = c11Weapon(); if (Math.hypot(w.x - G.px, w.y - G.py) <= W.reach + .2) { G.swimTo = null; G.huntTo = null; if (!(G.atkCd > 0)) c11Strike(w); } else G.swimTo = { x: w.x, y: w.y }; } }
  };
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) {
    const G = C11; if (G.sleep || G.eat || G.menu || G.inW) return oldTap(tx, ty, wx, wy);
    let best = null; for (const w of G.wild || []) { if (w.dead) continue; const K = C11_WILD[w.kind], top = K.ai === 'swoop' ? 1.5 : (K.tall || 1.1); if (Math.abs(wx - w.x) < (K.r || .5) + .25 && wy > w.y - top && wy < w.y + .35) { const d = Math.hypot(w.x - G.px, w.y - G.py); if (!best || d < best.d) best = { w, d }; } }
    if (!best) return oldTap(tx, ty, wx, wy);
    const W = c11Weapon(); G.go = null;
    if (best.d <= W.reach + .2) { if (!(G.atkCd > 0)) c11Strike(best.w); } else { G.huntTo = best.w; G.swimTo = { x: best.w.x, y: best.w.y }; }
  };
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    for (const w of C11.wild || []) {
      const K = C11_WILD[w.kind], D = C11_WILD_DRAW[w.kind]; if (!D) continue;
      E.push({ y: w.y, d: () => {
        const X = sx(w.x), Y = sy(w.y);
        g.save(); if (w.dead !== undefined) g.globalAlpha = Math.max(0, w.dead / .6); if (w.flash > 0 && Math.floor(w.flash * 30) % 2) g.globalAlpha *= .45;
        D(g, X, Y, T, w); g.restore();
        if (w.hp < K.hp && w.dead === undefined) { const bw = T * (K.bar || .6), by = Y - T * (K.barY || 1.05); g.fillStyle = '#1d1915'; g.fillRect(X - bw / 2 - 1, by - 1, bw + 2, 6); g.fillStyle = '#c8402f'; g.fillRect(X - bw / 2, by, bw * Math.max(0, w.hp / K.hp), 4); }
      } });
    }
  };
  /* the forge sells weapons */
  if (typeof c11ToolRows === 'function') {
    const oldRows = c11ToolRows;
    c11ToolRows = function (shop) {
      const rows = oldRows(shop);
      if (shop.who === 'tho') for (const [id, name, price, desc] of C11_WEAPON_SHOP) { const has = c11Count(id) > 0 || SAVE11.chest.some(s => s && s.id === id);
        rows.push({ name, sub: has ? 'Đã có' : `${desc} Cầm trên tay rồi chạm vào thú dữ`, price, ok: !has && SAVE11.money >= price, f: () => {
          if (c11Count(id) > 0) { C11.menu.note = 'Bạn đã có rồi'; return; } if (SAVE11.money < price) { C11.menu.note = 'Chưa đủ tiền'; return; }
          if (c11Add(id, 1)) { C11.menu.note = 'Túi đầy rồi'; return; } c11Money2(price); C11.menu.note = `Đã mua ${name.toLowerCase()}`; } }); }
      return rows;
    };
  }
  /* villagers ask for game once the player carries a weapon */
  if (typeof C11_AGAIN !== 'undefined') {
    C11_AGAIN.san = { items: () => ['thit_rung', 'da_ran', 'canh_doi'], n: [1, 2], ask: ['Nghe nói anh dám vào rừng rậm. Kiếm giúp tôi {n} {i}, tôi trả hậu.', 'Thầy lang kê đơn cần {n} {i}. Anh đi săn được thì giúp tôi với.', 'Nhà sắp có cỗ, tôi muốn có {n} {i} cho ra tấm ra món.'], end: ['Của hiếm đấy! Anh giỏi thật. Tiền đây.', 'Vào rừng rậm mà về lành lặn, phục anh. Cầm lấy.'] };
    const oldKinds = c11AgainKinds;
    c11AgainKinds = function (p) { const K = oldKinds(p); if (p.role !== 'c' && Object.keys(C11_WEAPONS).some(id => id !== 'dao_phay' && (c11Count(id) > 0 || SAVE11.chest.some(s => s && s.id === id)))) K.push('san'); return K; };
  }
})();
