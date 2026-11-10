/* Chương XI · thieves in the night (owner 2026-11-10, batch 1 of the new jobs: "bắt trộm cướp").
   - AT HOME: from day 4, about one night in three (only when there is something to take: crops, or hens and ducks in a coop), a thief
     comes between 21:30 and midnight (SAVE11.trom { day, at, done }). If the player is on the farm and awake, the thief walks in from the
     far way in, crouches at its target for 3 s and runs for the way out; seeing the player close (3.2 tiles) it runs at once. A tap on
     the thief from within TR.reach tiles is a grab: it stumbles; the third grab catches it. If it gets away, or the player was asleep
     or elsewhere, up to three crops (ripe ones first) or a bird from the coop are gone, and the game says so.
   - CAUGHT: a sheet with two answers. "Giải lên cụ Bá": money and cụ Bá's regard, the thief (a poor villager, named now) likes you much
     less. "Tha cho về": no money, that villager becomes a friend and brings a small gift the next time you greet them (langxa.js s.gg).
     Closing the sheet leaves the thief kneeling; tap it to choose.
   - THE ĐÌNH'S JOB "Canh trộm" (viec.js c11Board, step { t: 'guard', who, a }): be in that villager's hamlet after 21:00; a little later
     the thief comes for their house. Catch it (either answer) and the job is done; if it gets away, wait for the next night (the job
     runs out at the end of the next day like the other posts). */
const TR = { in: 2.2, out: 2.25, reach: 1.9, hits: 3, see: 3.2 };
const tromOwn = () => !(typeof C11O !== 'undefined' && C11O.visit);
const tromCrops = () => Object.entries(SAVE11.tiles).filter(([k, s]) => !k.includes(':') && s.crop && !s.dead);
const tromBirds = () => (SAVE11.herd || []).filter(h => ['ga', 'vit'].includes(h.kind));
const tromWho = () => { const pool = C11_PPL.filter(p => p.role !== 'c' && !p.stall && !C11_HQ[p.id]); return pool[Math.floor(c11Hash(SAVE11.day, 7, 811) * pool.length)]; };
/* what an unseen or escaped thief takes from the farm; returns the words for it */
function tromLoss() {
  const C = tromCrops().sort((a, b) => (c11Stage(b[1]) === 3) - (c11Stage(a[1]) === 3));
  if (C.length) { const n = Math.min(3, C.length), names = {}; for (const [, s] of C.slice(0, n)) { names[C11_CROPS[s.crop] ? C11_CROPS[s.crop].name.toLowerCase() : s.crop] = 1; s.crop = null; s.age = 0; s.wet = 0; s.dry = 0; } persist11(); return `${n} cây (${Object.keys(names).join(', ')})`; }
  const B = tromBirds(); if (B.length) { const h = B[0]; SAVE11.herd.splice(SAVE11.herd.indexOf(h), 1); if (typeof c11HerdBuild === 'function' && C11.area === 'ruong') c11HerdBuild(); persist11(); return `con ${h.kind === 'ga' ? 'gà' : 'vịt'} ${h.nm || ''}`.trim(); }
  const m = Math.min(40, SAVE11.money); SAVE11.money -= m; persist11(); return m ? c4Money(m) : 'chẳng có gì đáng lấy';
}
const tromNear = (tx, ty) => { for (let r = 0; r <= 4; r++) for (let y = ty - r; y <= ty + r; y++) for (let x = tx - r; x <= tx + r; x++) if (x > 0 && y > 0 && x < C11_W - 1 && y < C11_H - 1 && !c11Blocked(x, y) && c11Kind(x, y) !== 'E') return [x, y]; return [tx, ty]; };
const tromGo = (t, tx, ty) => { const sx = Math.max(0, Math.min(C11_W - 1, Math.floor(t.x))), sy = Math.max(0, Math.min(C11_H - 1, Math.floor(t.y - .01))), d = c11Dist(sx, sy); t.path = d[ty] && d[ty][tx] >= 0 ? c11Route(d, tx, ty) : []; };
const tromExits = () => Object.keys(C11_AR.exits).map(k => k.split(',').map(Number)).sort((a, b) => Math.hypot(b[0] + .5 - C11.px, b[1] + .5 - C11.py) - Math.hypot(a[0] + .5 - C11.px, a[1] + .5 - C11.py));   // farthest from the player first
function tromSpawn(tx, ty, job) {
  const E = tromExits(); if (!E.length) return false;
  const who = tromWho(), [ex, ey] = E[0];
  const t = { x: ex + .5, y: ey + .6, face: 1, ph: 0, moving: false, st: 'in', hits: 0, stun: 0, wait: 0, job: job || null, who: who.id, p: { sort: who.sort, name: 'Kẻ trộm', sc: who.sc }, path: [] };
  tromGo(t, tx, ty); if (!t.path.length) return false;
  C11.thief = t; return true;
}
function tromFlee(t, shout) {
  const [ex, ey] = tromExits()[0]; t.st = 'out'; tromGo(t, ex, ey);
  if (shout) c11Pop(Math.floor(t.x), Math.floor(t.y) - 2, 'Chết, có người!', '#a3332a');
}
function tromEscape(quiet) {
  const G = C11, t = G.thief; if (!t) return; G.thief = null;
  if (t.st === 'gone' || t.st === 'caught') return;                      // already dealt with (a kneeling thief left behind slips away with nothing)
  if (t.job) { const q = c11Q().act.find(x => x.id === t.job); if (q) { q.gd = SAVE11.day; q.gw = 0; } if (!quiet) c11Msg('Kẻ trộm chạy thoát rồi. Đêm mai canh lại vậy', '#a3332a'); persist11(); return; }
  if (SAVE11.trom) SAVE11.trom.done = 1;
  const lost = tromLoss(); c11Msg(`Kẻ trộm chạy thoát, mất ${lost}`, '#a3332a');
}
function tromChoice(t) {
  const who = c11P(t.who), q = t.job && c11Q().act.find(x => x.id === t.job);
  const end = (line, msg) => { C11.menu = null; t.p.name = who.name; t.st = 'gone'; t.stun = 1.2; const [ex, ey] = tromExits()[0]; tromGo(t, ex, ey); if (SAVE11.trom && !t.job) SAVE11.trom.done = 1; if (typeof c11Xp === 'function') c11Xp(12);
    if (q) { q.end = line; c11QuestDone(q, t); } else { c11Say(t, line); c11Msg(msg, '#2f6a4c'); } persist11(); };
  C11.menu = { title: 'Bắt được kẻ trộm!', note: `Hoá ra là ${who.name}. "Lạy anh, nhà tôi mấy hôm nay không còn gì ăn..."`, cols: 1, rows: [
    { name: 'Giải lên cụ Bá', sub: 'được thưởng 60 đồng, cụ Bá quý anh · người này sẽ oán anh', tag: ' ', ok: true, f: () => { SAVE11.money += 60; const b = c11PP('ba'); b.f = Math.min(2500, b.f + 100); const s = c11PP(who.id); s.met = 1; s.f = Math.max(0, s.f - 200); end('Anh ác quá... Rồi anh sẽ thấy.', `Giải ${who.name} lên cụ Bá · +${c4Money(60)}`); } },
    { name: 'Tha cho về', sub: 'không được gì · người này nhớ ơn anh', tag: ' ', ok: true, f: () => { const s = c11PP(who.id); s.met = 1; s.f = Math.min(2500, s.f + 250); s.gg = 2; end('Đội ơn anh! Tôi không bao giờ dám nữa. Ơn này tôi xin nhớ.', `Tha cho ${who.name} · ♥ +250`); } }] };
}
/* ---------- the night's plan, and what happens while the player sleeps ---------- */
const tromDay0 = c11NewDay;
c11NewDay = function () {
  let note = '';
  if (C11.thief) { const t = C11.thief; C11.thief = null; if (!t.job && t.st !== 'gone' && t.st !== 'caught') note = tromLoss(); }
  else { const P = SAVE11.trom; if (P && P.day === SAVE11.day && !P.done && tromOwn()) note = tromLoss(); }   // asleep (or away) when it came
  tromDay0();
  const day = SAVE11.day, r = c11Hash(day, 3, 823);
  SAVE11.trom = day >= 4 && r < .32 && (tromCrops().length || tromBirds().length) ? { day, at: 21.5 * 60 + Math.floor(c11Hash(day, 5, 829) * 150), done: 0 } : null;
  if (note && C11.msg) C11.msg.text += ` · Đêm qua trộm vào nhà, mất ${note}`;
  persist11();
};
const tromEnter0 = c11Enter;
c11Enter = function (id, x, y, quiet) { if (C11.thief) tromEscape(true); return tromEnter0(id, x, y, quiet); };
/* ---------- each frame ---------- */
const tromUpdate0 = c11NewUpdate;
c11NewUpdate = function (dt) {
  const G = C11, P = SAVE11.trom, mins = SAVE11.mins, day = SAVE11.day;
  if (!G.thief && !G.sleep && tromOwn()) {
    if (P && P.day === day && !P.done && mins >= P.at) {
      if (G.area === 'ruong') {
        const C = tromCrops().sort((a, b) => (c11Stage(b[1]) === 3) - (c11Stage(a[1]) === 3)), pen = tromBirds().length ? SAVE11.pens[0] : null;
        const tg = C.length ? C[0][0].split(',').map(Number) : pen ? [pen.x + 1, pen.y + 2] : [Math.floor(G.px), Math.floor(G.py)], [tx, ty] = tromNear(tg[0], tg[1]);
        if (tromSpawn(tx, ty, null)) c11Msg('Có tiếng sột soạt ngoài ruộng...', '#b0701a'); else P.done = 1;
      } else if (mins >= P.at + 40) { P.done = 1; SAVE11.tromNote = tromLoss(); persist11(); }   // nobody home: it is found out on coming back
    }
    for (const q of c11Q().act) {                                          // the đình's job: wait near the house at night
      const st = q.steps[q.si]; if (!st || st.t !== 'guard' || G.thief) continue;
      if (G.area !== st.a || mins < 21 * 60 || q.gd === day) { q.gw = 0; continue; }
      if (!q.gw) c11Msg(`Nấp canh quanh nhà ${c11P(st.who).name}...`, '#2f6a4c');
      q.gw = (q.gw || 0) + dt;
      if (q.gw > 6) { const hs = C11_HOUSES[c11P(st.who).home.key], [tx, ty] = tromNear(Math.floor(hs.x), hs.y + 1); if (tromSpawn(tx, ty, q.id)) c11Msg('Kia rồi! Có bóng người lẻn vào', '#b0701a'); else { q.gd = day; q.gw = 0; } }
    }
  }
  if (SAVE11.tromNote && G.area === 'ruong' && !G.sleep) { c11Msg(`Nhà có trộm lúc đi vắng, mất ${SAVE11.tromNote}`, '#a3332a'); SAVE11.tromNote = null; persist11(); }
  const t = G.thief;
  if (t && !G.menu) {
    t.moving = false;
    if (t.stun > 0) t.stun -= dt;
    else if (t.st !== 'caught') {
      const near = Math.hypot(t.x - G.px, t.y - G.py);
      if ((t.st === 'in' || t.st === 'steal') && near < TR.see) tromFlee(t, true);
      else if (t.st === 'steal') { t.wait -= dt; if (t.wait <= 0) tromFlee(t, false); }
      if (t.st !== 'steal') {
        if (t.path.length) {
          const [cx, cy] = t.path[0], tx = cx + .5, ty = cy + .6, ex = tx - t.x, ey = ty - t.y, d = Math.hypot(ex, ey), stp = (t.st === 'in' ? TR.in : TR.out) * dt;
          if (d <= stp) { t.x = tx; t.y = ty; t.path.shift(); } else { t.x += ex / d * stp; t.y += ey / d * stp; if (Math.abs(ex) > .02) t.face = ex > 0 ? 1 : -1; }
          t.moving = true; t.ph += dt * 9;
        } else if (t.st === 'in') { t.st = 'steal'; t.wait = 3; }
        else if (t.st === 'gone') G.thief = null;
        else tromEscape(false);
      }
    }
  }
  return tromUpdate0(dt);
};
/* ---------- grabbing it ---------- */
const tromTap0 = c11Tap;
c11Tap = function (tx, ty, wx, wy) {
  const t = C11.thief;
  if (t && !C11.sleep && !C11.menu && t.st !== 'gone' && Math.abs(wx - t.x) < .75 && wy > t.y - 1.4 && wy < t.y + .35) {
    if (Math.hypot(t.x - C11.px, t.y - C11.py) > TR.reach) return tromTap0(tx, ty, wx, wy);   // too far: the tap walks there
    if (t.st === 'caught') { tromChoice(t); return; }
    t.hits++; C11.face = t.x >= C11.px ? 1 : -1; c11Dots(Math.floor(t.x), Math.floor(t.y) - .4, '#e8d8a0', 8); if (c11Sfx.tap) c11Sfx.tap();
    if (t.hits >= TR.hits) { t.st = 'caught'; t.path = []; tromChoice(t); }
    else { t.stun = .7; c11Pop(Math.floor(t.x), Math.floor(t.y) - 2, t.hits === 1 ? 'Đứng lại!' : 'Túm được áo rồi!', '#a3332a'); }
    return;
  }
  return tromTap0(tx, ty, wx, wy);
};
const tromDraw0 = c11NewDraw;
c11NewDraw = function (E, g, sx, sy, k, T) {
  tromDraw0(E, g, sx, sy, k, T);
  const t = C11.thief; if (!t) return;
  E.push({ y: t.y, d: () => {
    const X = sx(t.x), Y = sy(t.y), carry = t.st === 'out' && !t.job;
    if (carry) { g.fillStyle = '#8a6a3a'; g.strokeStyle = INK; g.lineWidth = 1.6 * k; g.beginPath(); g.ellipse(X - t.face * T * .3, Y - T * .62, T * .2, T * .24, 0, 0, 6.283); g.fill(); g.stroke(); }   // the sack on its back
    c11Folk1(g, t.p, X, Y + (t.st === 'caught' ? T * .12 : 0), t.face, t.ph, t.moving, T, null, C11.v);
    if (t.stun > 0 && t.st !== 'gone') { g.fillStyle = '#f2cf5a'; g.font = `800 ${Math.round(14 * k)}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.fillText('✦ ✦', X, Y - T * 1.6 + Math.sin(C11.t * 14) * 3); }
    if (t.st === 'caught') { g.fillStyle = '#a3332a'; g.font = `800 ${Math.round(18 * k)}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.fillText('!', X, Y - T * 1.75); }
  } });
};
