/* Chương XI · cattle and pigs (owner 2026-11-01):
   - The buffalo, cow and pig that used to stand on the home farm belong to the neighbours: they are gone from the farm and only come
     over now and then (one at a time, through the way in from the hamlet), go for the crops like before (rao.js raiders; a pig too
     now), and wander home after a minute and a half or when shooed. A label says whose it is.
   - Your own animals (bought young and raised, nghe.js) live in their pen. Tap one (not holding its food or the cleaver) for a list:
     lead it out and TIE it to a stake on a grass tile (it grazes within a tile of the stake), let it roam free (it may stray and be
     lost for good at night), or bring it back to the pen.
   - A buffalo or cow out of the pen eats the wild grass where it stands (the grass is mown, and it counts as fed), and once a day can
     PLOUGH: every grass or mown tile within 2.5 tiles of it becomes hoed soil (up to 8).
   - MANURE: fed grown buffalo, cows and pigs leave manure more often. Holding Phân chuồng, tap hoed soil to spread it (SAVE11.tiles
     [k].phan): the plant there grows faster (an extra day of growth on most nights) and gives one more at harvest.
   - THEFT (owner: "giết trâu bò lợn gà nhà khác thì lấy được thịt nhưng có thể bị kiện mất tiền, nếu nhiều người nhìn thấy"): with the
     cleaver, a neighbour's visiting animal or any animal in another place can be butchered (same skills as your own: Mổ lợn / Mổ trâu
     bò). Villagers within 7 tiles are witnesses; with one the owner sues 30% of the time, each more adds 20% (at most 90%). The fine
     (TR_FINE, more than the meat is worth) is paid the next morning (SAVE11.kien), and the owner likes you a good deal less. The free
     hens of your own farm are nobody's and can be taken freely. */
const TR_BIG = ['bo', 'trau', 'lon'], TR_NAME = { bo: 'Bò', trau: 'Trâu', lon: 'Lợn' }, TR_IN = [18.4, 6.6], TR_OUT = [18, 6];
if (!RAO_RAID.includes('lon')) RAO_RAID.push('lon');
if (!RAO_SHOO.includes('lon')) RAO_SHOO.push('lon');
const TR_HITS = { ga: 2, trong: 2, vit: 2, lon: 4, bo: 6, trau: 7 }, TR_CRY = { ga: 'Cục tác!', trong: 'Ò ó o!', vit: 'Cạc cạc!', lon: 'Éc éc!', bo: 'Ò ò!', trau: 'Ụm ò!' };
/* an animal that is not yours runs off when you come close (owner): away from the player for a moment, then a short rest */
function trRun(b, t) { const dx = b.x - C11.px, dy = b.y - C11.py, L = Math.hypot(dx, dy) || 1, j = (Math.random() - .5) * .8; b.run = { dx: dx / L * Math.cos(j) - dy / L * Math.sin(j), dy: dx / L * Math.sin(j) + dy / L * Math.cos(j), t }; b.raid = null; b.rc = Math.max(b.rc || 0, 20); b.to = null; }
const TR_FINE = { ga: 120, trong: 120, vit: 120, lon: 600, bo: 1000, trau: 1200 }, TR_KIND = { ga: 'gà', trong: 'gà trống', vit: 'vịt', lon: 'lợn', bo: 'bò', trau: 'trâu' };
SAVE11.kien = SAVE11.kien || [];
const trHerdBeast = h => (C11.beasts || []).find(b => b.herd === h);
const trOut = h => !!(h.tie || h.free);
(() => {
  /* the farm no longer keeps the neighbours' animals */
  const oldBeasts = c11Beasts;
  c11Beasts = function () { oldBeasts(); if (C11.area === 'ruong') C11.beasts = C11.beasts.filter(b => b.herd || !TR_BIG.includes(b.kind)); C11.visT = 60 + Math.random() * 90; };
  /* own animals out of the pen: tied to a stake, or roaming */
  const oldBuild = c11HerdBuild;
  c11HerdBuild = function () {
    oldBuild(); if (C11.area !== 'ruong' || !C11.beasts) return;
    for (const b of C11.beasts) { const h = b.herd; if (!h) continue;
      if (h.tie) { const [x, y] = h.tie; b.box = [Math.max(1, x - 1), Math.max(1, y - 1), Math.min(C11_W - 2, x + 1), Math.min(C11_H - 2, y + 1)]; b.x = x + .5 + (Math.random() - .5) * .8; b.y = y + .7; }
      else if (h.free) { b.box = [1, 1, C11_W - 2, C11_H - 2]; if (h.fx !== undefined) { b.x = h.fx; b.y = h.fy; } } }
  };
  const fieldOk = (tx, ty) => c11Field(tx, ty) && !SAVE11.tiles[tx + ',' + ty] && !(typeof raoOn === 'function' && raoOn(tx, ty)) && !c11PenAt(tx, ty);
  /* the list for one of your animals */
  const menuFor = (b) => {
    const h = b.herd, A = C11_ANIMALS[h.kind], big = h.kind === 'bo' || h.kind === 'trau', adult = h.age >= A.adult, rows = [];
    if (!trOut(h)) rows.push({ name: 'Dắt ra cột', sub: 'chạm vào ô cỏ gần đó để đóng cọc · trâu bò tự gặm cỏ quanh cọc', tag: ' ', ok: true, f: () => { C11.menu = null; C11.tieMode = h; c11Msg(`Chạm vào ô cỏ để cột ${h.nm}`, '#2f6a4c'); } });
    else rows.push({ name: 'Cột chỗ khác', sub: 'chạm vào ô cỏ gần đó để đóng cọc mới', tag: ' ', ok: true, f: () => { C11.menu = null; C11.tieMode = h; c11Msg(`Chạm vào ô cỏ để cột ${h.nm}`, '#2f6a4c'); } });
    if (!h.free) rows.push({ name: 'Thả rông', sub: 'đi khắp vườn · đêm có thể đi lạc mất', tag: ' ', ok: true, f: () => { h.free = 1; h.tie = null; h.fx = b.x; h.fy = b.y; c11HerdBuild(); persist11(); C11.menu = null; c11Msg(`Đã thả rông ${h.nm}, nhớ cột lại kẻo đêm đi lạc`, '#b0701a'); } });
    if (trOut(h)) rows.push({ name: 'Dắt về chuồng', sub: c11PenOf(h) ? C11_PENS[c11PenOf(h).kind].name : 'chuồng', tag: ' ', ok: true, f: () => { h.free = 0; h.tie = null; c11HerdBuild(); persist11(); C11.menu = null; c11Msg(`${h.nm} đã về chuồng`, '#2f6a4c'); } });
    if (big && adult && trOut(h)) rows.push({ name: 'Cày quanh đây', sub: h.plough === SAVE11.day ? 'hôm nay cày rồi, mai cày tiếp' : 'cỏ quanh con vật thành đất cuốc, tối đa 8 ô', tag: ' ', ok: h.plough !== SAVE11.day, f: () => {
      if (h.plough === SAVE11.day) { C11.menu.note = 'Hôm nay cày rồi'; return; }
      let n = 0; const cx = b.x, cy = b.y, L = [];
      for (let ty = Math.floor(cy) - 3; ty <= Math.floor(cy) + 3; ty++) for (let tx = Math.floor(cx) - 3; tx <= Math.floor(cx) + 3; tx++) { const d = Math.hypot(tx + .5 - cx, ty + .6 - cy); if (d <= 2.5 && fieldOk(tx, ty)) L.push([d, tx, ty]); }
      L.sort((p, q) => p[0] - q[0]);
      for (const [, tx, ty] of L.slice(0, 8)) { const k = tx + ',' + ty; SAVE11.clear[k] = SAVE11.day; SAVE11.tiles[k] = { soil: 1, wet: 0, crop: null, age: 0 }; c11Dots(tx, ty, '#7a4a28', 6); n++; }
      h.plough = SAVE11.day; persist11(); C11.menu = null; c11Msg(n ? `${h.nm} cày được ${n} ô đất` : 'Quanh đây không còn cỏ để cày', n ? '#2f6a4c' : '#5b2f1f'); } });
    C11.menu = { title: h.nm, note: `${A.name.replace(' con', '').replace(' giống', '')} · ${h.age} ngày${adult ? ', đã lớn' : `, còn ${A.adult - h.age} ngày nữa lớn`} · ${h.fed ? 'đã ăn' : 'đang đói'}${h.tie ? ' · đang cột' : h.free ? ' · đang thả rông' : ' · trong chuồng'}`, cols: 1, rows };
  };
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) {
    if (!C11.sleep && !C11.menu && !C11.tieMode && !(typeof C11O !== 'undefined' && C11O.visit) && typeof gaKnife === 'function' && gaKnife()) {   // butchering someone else's animal
      const hit = (C11.beasts || []).find(q => !q.herd && TR_FINE[q.kind] && Math.abs(wx - q.x) < .8 && wy > q.y - 1.2 && wy < q.y + .35);
      if (hit && (hit.visitor || C11.area !== 'ruong' || GA_WILD.includes(hit.kind))) {
        if (Math.hypot(hit.x - C11.px, hit.y - C11.py) > 1.8) return oldTap(tx, ty, wx, wy);   // too far: the tap just walks toward it
        const need = GA_SKILL[hit.kind]; if (need && !c11Know(need)) { const t = c11TeacherOf(need); c11Msg(`Phải học "${C11_SKILLS[need].name}" ở ${t ? t.name + ' (đồ tể)' : 'người đồ tể'} mới làm thịt được`, '#a3332a'); return; }
        /* several strokes, like hoeing (owner): each one startles it into running off, so the player has to keep up */
        const hitsNeed = TR_HITS[hit.kind] || 2; if (C11.t - (hit.hitT ?? -99) > 6) hit.hits = 0; hit.hits = (hit.hits || 0) + 1; hit.hitT = C11.t;
        c11Spend(.6); c11Sfx.thump && c11Sfx.thump(); c11Dots(Math.floor(hit.x), Math.floor(hit.y) - .3, '#c8392d', 5, 1);
        if (hit.hits < hitsNeed) { c11Pop(Math.floor(hit.x), Math.floor(hit.y) - 1.2, TR_CRY[hit.kind] || '!', '#a3332a'); trRun(hit, 1.1); return; }
        const [meat, n] = GA_MEAT[hit.kind === 'trong' ? 'ga' : hit.kind] || ['thit_ga', 1];
        const other = hit.visitor || C11.area !== 'ruong';
        let owner = null;
        if (hit.visitor) owner = { name: hit.visitor.owner, id: hit.visitor.id };
        else { const folk = C11_PPL.filter(p => p.home && p.home.a === C11.area && p.trade); const p = folk.length ? folk[(c11Hash(Math.round(hit.x), hit.bi || 0, 73) * folk.length) | 0] : null; owner = p ? { name: p.name, id: p.id } : { name: 'hàng xóm' };
          SAVE11.gaKill[C11.area + ':' + hit.bi] = SAVE11.day; }
        if (!other) SAVE11.gaKill[C11.area + ':' + hit.bi] = SAVE11.day;
        C11.beasts = C11.beasts.filter(q => q !== hit);
        c11Drop(meat, n, Math.floor(hit.x), Math.floor(hit.y)); c11Dots(Math.floor(hit.x), Math.floor(hit.y) - .3, '#c8392d', 12, 1.4); c11Spend(TR_BIG.includes(hit.kind) ? 2 : 1); c11Xp(TR_BIG.includes(hit.kind) ? 6 : 4);
        if (!other) { c11Pop(Math.floor(hit.x), Math.floor(hit.y) - 1, `Được ${C11_ITEMS[meat].name.toLowerCase()}`, '#5b2f1f'); persist11(); return; }   // the farm's own free hens are nobody's
        const seen = (C11.vill || []).filter(v => Math.hypot(v.x - hit.x, v.y - hit.y) < 7), chance = seen.length ? Math.min(.9, .3 + .2 * (seen.length - 1)) : 0;
        if (Math.random() < chance) { SAVE11.kien.push({ fine: TR_FINE[hit.kind], owner: owner.name, id: owner.id || null, kind: hit.kind, by: seen[0].p.name });
          c11Msg(`${seen[0].p.name} nhìn thấy rồi! Thế nào nhà ${owner.name} cũng đi kiện`, '#a3332a'); }
        else c11Msg(seen.length ? `Được ${n} ${C11_ITEMS[meat].name.toLowerCase()} · ${seen.length} người ở gần, mong là không ai để ý` : `Được ${n} ${C11_ITEMS[meat].name.toLowerCase()} · không ai nhìn thấy`, seen.length ? '#b0701a' : '#5b2f1f');
        persist11(); return;
      }
    }
    if (C11.sleep || C11.menu || C11.area !== 'ruong' || (typeof C11O !== 'undefined' && C11O.visit)) return oldTap(tx, ty, wx, wy);
    if (C11.tieMode) {                                                         // placing the stake
      const h = C11.tieMode;
      if (!SAVE11.herd.includes(h)) { C11.tieMode = null; return oldTap(tx, ty, wx, wy); }
      if (Math.hypot(tx + .5 - C11.px, ty + .5 - C11.py) > 6) { c11Msg('Đứng gần chỗ muốn cột hơn', '#5b2f1f'); return; }
      if (!fieldOk(tx, ty) && !(SAVE11.clear[tx + ',' + ty] && !SAVE11.tiles[tx + ',' + ty])) { c11Msg('Cột ở chỗ có cỏ, không cột trên ruộng hay hàng rào', '#5b2f1f'); return; }
      h.tie = [tx, ty]; h.free = 0; C11.tieMode = null; c11HerdBuild(); c11Dots(tx, ty, '#a07040', 6); persist11(); c11Msg(`Đã cột ${h.nm}`, '#2f6a4c'); return;
    }
    const b = (C11.beasts || []).find(q => q.herd && Math.abs(wx - q.x) < .8 && wy > q.y - 1.2 && wy < q.y + .35);
    if (b) { const it = c11HandItem(), A = C11_ANIMALS[b.herd.kind];
      if (!(it && (A.feed.includes(it.id) || it.id === 'dao_phay'))) { menuFor(b); return; } }   // food feeds, the cleaver butchers (gaga.js); otherwise the list
    return oldTap(tx, ty, wx, wy);
  };

  /* every frame: neighbours' visits, grazing */
  const oldUp = c11NewUpdate;
  c11NewUpdate = function (dt) {
    const G = C11;
    if (G.beasts && !G.sleep && !G.fade && !G.menu) for (const b of G.beasts) {                     // animals that are not yours keep their distance
      if (b.herd || !TR_FINE[b.kind] || b === G.carry || b.fly || (b.visitor && b.visitor.t <= 0)) continue;
      b.runCool = (b.runCool || 0) - dt;
      if (!b.run && b.runCool <= 0 && Math.hypot(b.x - G.px, b.y - G.py) < 1.7) trRun(b, .9);
      if (b.run) { const r = b.run, sp = (TR_BIG.includes(b.kind) ? 2.4 : 2.9) * dt, ok = (x, y) => x > 1 && y > 1 && x < C11_W - 1 && y < C11_H - 1 && c11Free(x, y) && !(G.area === 'ruong' && typeof raoHit === 'function' && raoHit(x, y));
        let nx = b.x + r.dx * sp, ny = b.y + r.dy * sp;
        if (!ok(nx, ny)) { [r.dx, r.dy] = Math.random() < .5 ? [-r.dy, r.dx] : [r.dy, -r.dx]; nx = b.x + r.dx * sp; ny = b.y + r.dy * sp; }
        if (ok(nx, ny)) { b.x = nx; b.y = ny; if (Math.abs(r.dx) > .05) b.face = r.dx > 0 ? 1 : -1; b.moving = true; b.ph += dt * 13; }
        b.wait = Math.max(b.wait || 0, .3); b.to = null; r.t -= dt; if (r.t <= 0) { b.run = null; b.runCool = 1.3; } }
    }
    if (G.area === 'ruong' && G.beasts && !G.sleep && !G.fade && !(typeof C11O !== 'undefined' && C11O.visit)) {
      const vis = G.beasts.find(b => b.visitor);
      if (!vis) { G.visT = (G.visT ?? 120) - dt;
        if (G.visT <= 0 && SAVE11.mins > 7 * 60 && SAVE11.mins < 19 * 60) { G.visT = 150 + Math.random() * 150;
          const kind = TR_BIG[(Math.random() * 3) | 0], folk = C11_PPL.filter(p => p.trade && p.home && p.home.a !== 'ruong'), p = folk[(Math.random() * folk.length) | 0];
          G.beasts.push({ kind, x: TR_IN[0], y: TR_IN[1], col: '#8a5a3a', face: -1, ph: 0, moving: false, to: null, wait: .5, dn: 0, peck: 0, rc: 4 + Math.random() * 6, visitor: { owner: p ? p.name : 'hàng xóm', id: p ? p.id : null, t: 90 } });
          c11Msg(`${TR_NAME[kind]} nhà ${p ? p.name : 'hàng xóm'} sang vườn nhà mình, coi chừng rau!`, '#b0701a'); } }
      else { const v = vis.visitor; v.t -= dt; if (vis.flee) v.t = Math.min(v.t, 2.5);
        if (v.t <= 0) { vis.raid = null; vis.rc = 999; vis.flee = null; vis.wait = 0; vis.to = TR_OUT;
          if (Math.hypot(vis.x - TR_OUT[0] - .5, vis.y - TR_OUT[1] - .6) < .7) G.beasts = G.beasts.filter(q => q !== vis); } }
      for (const b of G.beasts) { const h = b.herd; if (!h || !trOut(h)) continue;
        if (h.free) { h.fx = b.x; h.fy = b.y; }
        if ((h.kind === 'bo' || h.kind === 'trau') && b.wait > 0) { const tx = Math.floor(b.x), ty = Math.floor(b.y), k = tx + ',' + ty;
          if (c11Field(tx, ty) && !SAVE11.clear[k] && !SAVE11.tiles[k]) { b.graze = (b.graze || 0) + dt; if (b.graze > 5) { b.graze = 0; SAVE11.clear[k] = SAVE11.day; h.fed = 1; h.hung = 0; c11Dots(tx, ty, '#6fa54c', 6, .6); } } }
      }
    }
    return oldUp(dt);
  };

  /* night: roaming animals may stray; fed grown cattle and pigs leave manure */
  const oldDay = c11NewDayNew;
  c11NewDayNew = function () {
    const dung = SAVE11.herd.filter(h => h.fed && TR_BIG.includes(h.kind) && h.age >= C11_ANIMALS[h.kind].adult).map(h => [h, h.tie ? { x: h.tie[0] - .5, y: h.tie[1] - 1.4 } : h.free ? { x: (h.fx || 9) - 1.5, y: (h.fy || 9) - 2 } : c11PenOf(h)]);
    const lost = SAVE11.herd.filter(h => h.free && Math.random() < .3);
    oldDay();
    if (SAVE11.kien.length) {                                                 // lawsuits for yesterday's stolen animals
      let paid = 0; const k0 = SAVE11.kien[0];
      for (const k of SAVE11.kien) { const f = Math.min(SAVE11.money, k.fine); SAVE11.money -= f; paid += f; if (k.id && typeof c11PP === 'function') { const s = c11PP(k.id); s.f = Math.max(0, (s.f || 0) - 300); } }
      C11.herdMsg = `Nhà ${k0.owner} kiện lên cụ Lý vì ${k0.by} thấy bạn giết ${TR_KIND[k0.kind]} của họ${SAVE11.kien.length > 1 ? ` (và ${SAVE11.kien.length - 1} vụ nữa)` : ''}: nộp phạt ${c4Money(paid)}`;
      SAVE11.kien = [];
    }
    for (const [h, P] of dung) if (P && Math.random() < .45) SAVE11.drops.push({ k: 'phan_chuong', a: 'ruong', x: P.x + .6 + Math.random() * 1.8, y: P.y + 2.1 + Math.random() * .3, x0: P.x + 1.5, y0: P.y + 1, t: 0, dur: .5, h: .6 });
    if (lost.length) { SAVE11.herd = SAVE11.herd.filter(h => !lost.includes(h)); C11.herdMsg = `${lost[0].nm} thả rông đêm qua, đi lạc mất rồi`; c11HerdBuild(); }
  };

  /* manure on the soil: spread it, grow faster, harvest more */
  const isDung = () => { const it = c11HandItem(); return it && it.id === 'phan_chuong'; };
  const oldAct = c11ActNew, oldCan = c11CanNew;
  c11ActNew = function (tx, ty, tool, k, key) {
    const s = SAVE11.tiles[key];
    if (isDung() && s && !s.dead && !(typeof C11O !== 'undefined' && C11O.visit)) {
      if (s.phan) { c11Pop(tx, ty - 1, 'Ô này bón rồi', '#5b2f1f'); return true; }
      c11Take('phan_chuong', 1); s.phan = 1; c11Spend(.5); c11Dots(tx, ty, '#6a4a2a', 8); c11Pop(tx, ty - 1, 'Đã bón phân', '#2f6a4c'); persist11(); return true;
    }
    return oldAct(tx, ty, tool, k, key);
  };
  c11CanNew = function (tx, ty, tool, k, key) { const s = SAVE11.tiles[key || (c11Pre() + tx + ',' + ty)]; if (isDung() && s && !s.dead) return !s.phan; return oldCan(tx, ty, tool, k, key); };
  const oldNewDay = c11NewDay;
  c11NewDay = function () { for (const s of Object.values(SAVE11.tiles)) if (s.phan && s.crop && !s.dead && s.wet && c11Stage(s) < 2 && Math.random() < .6) s.age++; return oldNewDay(); };
  const oldActAll = c11Act;
  c11Act = function (tx, ty) {
    const s = SAVE11.tiles[c11Pre() + tx + ',' + ty], crop = s && s.phan && s.crop && !s.dead && c11Stage(s) === 3 ? s.crop : null, age = s && s.age;
    oldActAll(tx, ty);
    if (crop && s && (s.crop !== crop || s.age !== age)) { c11Drop(crop, 1, tx, ty); if (!s.crop) s.phan = 0; }   // one more from a manured plant
  };

  /* drawing: the stake and rope, the neighbour's name, manure on the soil */
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    if (C11.area !== 'ruong') return;
    for (const [key, s] of Object.entries(SAVE11.tiles)) { if (!s.phan || key.includes(':')) continue; const [x, y] = key.split(',').map(Number);
      E.push({ y: y + .05, d: () => { g.fillStyle = 'rgba(80,50,25,.55)'; for (let i = 0; i < 7; i++) { const a = c11Hash(x * 7 + i, y, 71), r = c11Hash(x, y * 7 + i, 72); g.beginPath(); g.ellipse(sx(x + .15 + a * .7), sy(y + .2 + r * .65), T * .05, T * .035, 0, 0, 6.283); g.fill(); } } }); }
    for (const b of C11.beasts || []) {
      if (b.herd && b.herd.tie) { const [x, y] = b.herd.tie, bb = b;
        E.push({ y: y + .7, d: () => { const X = sx(x + .5), Y = sy(y + .7); g.fillStyle = '#8a5a34'; g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.roundRect(X - T * .04, Y - T * .32, T * .08, T * .34, 2); g.fill(); g.stroke(); } });
        E.push({ y: bb.y + .01, d: () => { g.strokeStyle = '#c8a46a'; g.lineWidth = Math.max(1.2, T * .025); g.beginPath(); g.moveTo(sx(x + .5), sy(y + .45)); g.quadraticCurveTo((sx(x + .5) + sx(bb.x)) / 2, Math.max(sy(y + .55), sy(bb.y - .2)) + T * .12, sx(bb.x + bb.face * .25), sy(bb.y - .45)); g.stroke(); } }); }
      if (b.visitor) { const bb = b; E.push({ y: 998, d: () => { g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; const t = `${TR_NAME[bb.kind]} nhà ${bb.visitor.owner}`, X = sx(bb.x), Y = sy(bb.y) - T * 1.25; g.lineWidth = 4; g.strokeStyle = '#fbf4dc'; g.strokeText(t, X, Y); g.fillStyle = '#7a3a1a'; g.fillText(t, X, Y); } }); }
    }
  };
})();
