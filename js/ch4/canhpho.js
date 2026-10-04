/* Chương IV · street life (owner): a lion dance, a horse caravan, a mandarin carried past in his palanquin, quarrels
   that come to blows, children's folk games on the grass in front; each day its own paper colour and its own row of
   houses and trees; the wife and husband calling out to passers-by with jokes. The houses and big trees are the same every day (owner). Kept light: one procession at a time,
   only what is on screen is drawn, simple paths. Hooks in cho.js: c4DayLook (day start), c4StreetUpdate (update),
   c4StreetItems (drawing), c4CoupleTalk (update). */

/* ---------- each day its own look ---------- */
Object.assign(PAPERS, {
  peach: { base: '#e6bf9c', hi: '#f3d6bd', lo: '#cc9f7a', s1: '#b88b67', s2: '#f8e3cf', fib: '#a9795a', css: '#e6bf9c', spark: '#fff6ec' },
  mint: { base: '#bfd0bb', hi: '#d7e3d3', lo: '#9fb39a', s1: '#8ea38a', s2: '#e9f1e6', fib: '#7f947b', css: '#bfd0bb', spark: '#fbfff9' },
  stone: { base: '#cfc7b4', hi: '#e2dccd', lo: '#b3aa95', s1: '#a29983', s2: '#efeadf', fib: '#938a74', css: '#cfc7b4', spark: '#ffffff' },
});
const C4_DAY_PAPERS = ['yellow', 'sage', 'peach', 'white', 'blue', 'mint', 'pink', 'stone', 'lilac'];
function c4DayLook() {
  const key = C4_DAY_PAPERS[(SAVE4.day - 1) % C4_DAY_PAPERS.length];
  C4.paperKey = key; PAPER = getPaper(key); document.documentElement.style.setProperty('--paper', PAPERS[key].css);
  // the row of houses, trees and bamboo behind the lane, and a far row, drawn afresh each day
  const r = mulberry(SAVE4.seed + SAVE4.day * 977), kinds = ['house', 'house', 'tree', 'bamboo', 'bamboo', 'house'];   // owner: no haystack, it read as a bell
  const rs = mulberry(SAVE4.seed + 977);                                    // owner: the houses and big trees stay the same every day
  const far = [], near = [];
  for (let x = -120; x < 2700; x += 220 + rs() * 160) { const k = kinds[(rs() * kinds.length) | 0]; far.push([x, k === 'hay' ? 'house' : k, .4 + rs() * .08, (rs() * 6) | 0]); }
  for (let x = 160; x < C4_W + 60; x += 240 + rs() * 200) { if (Math.abs(x - C4_STALL) < 150) continue; near.push([x, kinds[(rs() * kinds.length) | 0], .6 + rs() * .35, (rs() * 6) | 0]); }
  C4.scene = { far, near };
  // the children's games on the grass in front, two of them, somewhere along the lane
  const games = ['dacau', 'daynhay', 'keoco', 'oanquan'], gs = [];
  for (let i = 0; i < 2; i++) gs.push({ k: games.splice((r() * games.length) | 0, 1)[0], x: 300 + i * 900 + r() * 600, ph: r() * 6 });
  C4.games = gs; C4.show = null; C4.streetT = 25 + r() * 20; C4.fightT = 40 + r() * 40; C4.talkT = 4;
}

/* ---------- processions along the lane: lion dance, horses, a mandarin ---------- */
const C4_SHOWS = {
  lan: { sp: 46, len: 330, say: ['Múa lân! Múa lân kìa!', 'Tùng tùng cắc… vui quá!', 'Lân vào nhà nào là nhà ấy phát tài!'] },
  ngua: { sp: 62, len: 430, say: ['Đoàn ngựa thồ hàng lên mạn ngược đấy.', 'Ngựa to thế, chở được bao nhiêu thúng nhỉ?', 'Tránh ra kẻo ngựa đá!'] },
  quan: { sp: 34, len: 420, say: ['Quan huyện đi qua, cúi đầu!', 'Võng điều lọng xanh, oai quá!', 'Quan đi đâu mà vội thế nhỉ?'] },
};
function c4StreetUpdate(dt) {
  if (C4.phase !== 'open') return;
  const V = c4View();
  if (C4.show) {
    const S = C4.show; S.x += C4_SHOWS[S.k].sp * dt; S.t += dt;
    if (Math.abs(S.x - C4.camX - V.vw / 2) < V.vw * .6) {                  // on screen: the drum for the lion, a horn for the mandarin
      if (S.k === 'lan' && (S.beat = (S.beat || 0) - dt) <= 0) { S.beat = .45; AU.thump(); }
      if (!S.said && R() < dt * .8) { S.said = true; const w = C4.walkers.find(q => q.st === 'walk' && !q.say && Math.abs(q.x - S.x) < 260); if (w) c4Say(w, c4Pick(C4_SHOWS[S.k].say)); }
    }
    if (S.x - C4_SHOWS[S.k].len > C4.camX + V.vw + 200 && S.x > C4_W) C4.show = null;
  } else if (!C4.parade || C4.parade.x === null) {
    if ((C4.streetT -= dt) <= 0) {
      C4.streetT = 35 + R() * 35;
      const k = c4Pick(SAVE4.plan && SAVE4.plan.hoi ? ['lan', 'lan', 'ngua', 'quan'] : ['lan', 'ngua', 'ngua', 'quan']);
      C4.show = { k, x: C4.camX - 120, t: 0, ph: R() * 6 };
      if (k === 'quan') AU.kenCall();
    }
  }
  // a quarrel that comes to blows: two passers-by stop, shout, swing; the crowd turns to look
  if ((C4.fightT -= dt) <= 0) {
    C4.fightT = 60 + R() * 60;
    const ws = C4.walkers.filter(w => w.st === 'walk' && w.kind === 'mouse' && !w.buy && !w.guest && C4_MOUSE_SORTS[w.sort].role === 'adult' && Math.abs(w.x - C4.camX - V.vw / 2) < V.vw * .45);
    if (ws.length >= 2) {
      const a = ws[0], b = ws.find(q => q !== a && Math.abs(q.x - a.x) < 260) || ws[1];
      const mid = (a.x + b.x) / 2, z = (a.z + b.z) / 2;
      Object.assign(a, { st: 'fight', x: mid - 40, z, face: 1, fightT: 9, talk: true }); Object.assign(b, { st: 'fight', x: mid + 40, z, face: -1, fightT: 9, talk: true });
      c4Say(a, c4Pick(C4_FIGHT)); setTimeout(() => { if (b.st === 'fight') c4Say(b, c4Pick(C4_FIGHT)); }, 1300);
      C4.fight = { x: mid, z, t: 0 };
    }
  }
  if (C4.fight) {
    C4.fight.t += dt;
    for (const w of C4.walkers) if (w.st === 'fight' && (w.fightT -= dt) <= 0) { w.st = 'leave'; w.talk = false; w.face = w.x < C4.fight.x ? -1 : 1; w.sp = 90; }
    if (C4.fight.t > 9.5) { C4.fight = null; const w = C4.walkers.find(q => q.st === 'walk' && !q.say && q.kind === 'mouse'); if (w) c4Say(w, c4Pick(['Thôi, hai bác về nhà mà cãi!', 'Đánh nhau ngoài chợ, xấu hổ chưa!', 'Gọi tuần đinh ra đây!'])); }
  }
}
const C4_FIGHT = ['Mày dám nói lại câu nữa xem!', 'Con gà nhà mày mổ hết thóc nhà tao!', 'Ai bảo mày giẫm vào chân tao!', 'Nợ tao ba đồng từ Tết năm ngoái!', 'Láo! Láo quá!', 'Đứng lại đấy!', 'Tao nói thế đấy, làm gì nhau!'];

/* ---------- the couple calling out (owner: more lines, cheerful and witty) ---------- */
const C4_WIFE_OUT = ['Hết trầu rồi cô bác ơi, mai lại có nhé!', 'Trầu bán hết sạch rồi, cảm ơn cả làng!', 'Hôm nay hết trầu rồi, mai em để phần!', 'Hết veo rồi ạ, cô bác thông cảm!'];
const C4_WIFE_WAIT = ['Chồng em đi lấy trầu rồi, cô bác đợi tí nhé!', 'Trầu sắp về tới, ai đợi được thì đợi nhé!', 'Hết tạm thôi, chồng em gánh về ngay đây!'];
const C4_WIFE_CALL = [
  'Trầu không cau non đây, ăn một miếng đỏ môi cả ngày!', 'Miếng trầu là đầu câu chuyện, mời các bác ghé!', 'Trầu têm cánh phượng, cau Hưng Yên, ngon nức tiếng!',
  'Ăn trầu nhà em, mẹ chồng khen dâu đảm!', 'Ai chưa có người yêu, ăn trầu nhà em là có!', 'Cau non, vỏ mỏng, bổ ra trắng như ngà!', 'Mời bà ơi, trầu cay vừa miệng, vôi không xót lưỡi!',
  'Đi chợ không ăn trầu, như đi hội không đội nón!', 'Trầu tươi hơn cả nụ cười của em đây!', 'Mua một miếng nhớ một đời, mua hai miếng nhớ hai đời!',
  'Ơ kìa anh ơi, ghé qua đây, cau còn xanh mà người còn son!', 'Hôm nay bán rẻ lấy may, mai lại bán đắt như thường!', 'Trầu này cha mẹ em trồng, vợ chồng em bán, khách sang em mời!',
];
const C4_HUSB_IDLE = ['Vợ tôi têm trầu khéo nhất làng đấy!', 'Mình ơi, nghỉ tay uống bát nước đi!', 'Nhà mình đắt hàng thế này, tối nay ăn cá kho nhé!', 'Ai chê trầu nhà tôi là chưa ăn thử đấy!', 'Hôm qua tôi gánh hai chuyến, lưng còn mỏi đây này.'];
function c4CoupleTalk(dt) {
  if (C4.phase !== 'open' || (C4.talkT -= dt) > 0) return;
  C4.talkT = 9 + R() * 8;
  const near = C4.walkers.some(w => w.st === 'walk' && Math.abs(w.x - C4_STALL) < 300);
  if (!(C4.SV.trau || []).length && near && !C4.wife.say && R() < .75) c4Say(C4.wife, c4Pick(c4Stock('trau') > 0 ? C4_WIFE_CALL : C4.porter.st !== 'idle' && C4.porter.good === 'trau' ? C4_WIFE_WAIT : C4_WIFE_OUT));
  else if (C4.porter.st === 'idle' && !C4.porter.say && R() < .4) c4Say(C4.porter, c4Pick(C4_HUSB_IDLE));
}

/* ---------- drawing ---------- */
const c4Ink = (g, w = 2.2) => { g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = 'round'; g.lineCap = 'round'; };
function c4LionHead(g, x, y, s, ph) {
  g.save(); g.translate(x, y); g.scale(s, s); c4Ink(g, 2.6);
  const jaw = Math.abs(Math.sin(ph * 2)) * 8;
  g.fillStyle = '#a3332a'; g.beginPath(); g.moveTo(-34, -10); g.quadraticCurveTo(-40, -62, 0, -70); g.quadraticCurveTo(44, -66, 42, -14); g.quadraticCurveTo(10, -2, -34, -10); g.fill(); g.stroke();   // the head
  g.fillStyle = '#f2c640'; g.beginPath(); g.moveTo(-30, -16 + jaw); g.quadraticCurveTo(6, 4 + jaw, 40, -12 + jaw); g.lineTo(36, -2 + jaw); g.quadraticCurveTo(4, 14 + jaw, -28, -4 + jaw); g.closePath(); g.fill(); g.stroke();   // the jaw
  g.fillStyle = '#f2ecde'; for (const [ex, ey] of [[-8, -40], [18, -38]]) { g.beginPath(); g.arc(ex, ey, 9, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(ex + 2, ey, 4, 0, 6.283); g.fill(); g.fillStyle = '#f2ecde'; }
  g.fillStyle = '#2f6a4c'; g.beginPath(); g.moveTo(-4, -70); g.lineTo(4, -92); g.lineTo(12, -68); g.closePath(); g.fill(); g.stroke();   // the horn
  g.fillStyle = '#f2ecde'; g.beginPath(); for (let i = 0; i < 5; i++) { g.moveTo(-24 + i * 14, -2 + jaw); g.lineTo(-28 + i * 14, 18 + jaw + (i % 2) * 6); } g.stroke();   // the beard
  g.strokeStyle = '#f2c640'; g.lineWidth = 3; g.beginPath(); g.arc(4, -50, 30, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  g.restore();
}
function c4Horse(g, x, y, s, ph, pack) {
  g.save(); g.translate(x, y); g.scale(s, s); c4Ink(g, 2.2);
  const k = Math.sin(ph);
  g.fillStyle = '#5b2f1f'; for (const [lx, a] of [[-38, k], [-26, -k], [26, k], [38, -k]]) { g.save(); g.translate(lx, -48); g.rotate(a * .35); g.fillRect(-4, 0, 8, 48); g.strokeRect(-4, 0, 8, 48); g.restore(); }
  g.fillStyle = '#8a5a2a'; g.beginPath(); g.ellipse(0, -62, 52, 22, 0, 0, 6.283); g.fill(); g.stroke();   // body
  g.beginPath(); g.moveTo(34, -76); g.lineTo(52, -118); g.lineTo(66, -116); g.lineTo(58, -70); g.closePath(); g.fill(); g.stroke();   // the neck
  g.beginPath(); g.ellipse(70, -118, 22, 11, .35, 0, 6.283); g.fill(); g.stroke();                        // the head, long
  g.beginPath(); g.moveTo(56, -128); g.lineTo(54, -144); g.lineTo(64, -132); g.closePath(); g.fill(); g.stroke();   // an ear
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(50, -126); g.lineTo(36, -84); g.stroke(); c4Ink(g, 2.2);   // the mane
  g.fillStyle = INK; g.beginPath(); g.arc(68, -122, 2.8, 0, 6.283); g.fill(); g.beginPath(); g.arc(88, -108, 2, 0, 6.283); g.fill();
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(-50, -66); g.quadraticCurveTo(-70, -50 + k * 4, -64, -28); g.stroke();   // tail
  if (pack) { c4Ink(g, 2); g.fillStyle = '#b57a22'; g.fillRect(-26, -96, 26, 26); g.strokeRect(-26, -96, 26, 26); g.fillStyle = '#c98a1c'; g.fillRect(2, -94, 24, 24); g.strokeRect(2, -94, 24, 24); }
  g.restore();
}
function c4Palanquin(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); c4Ink(g, 2.4);
  g.strokeStyle = '#5b2f1f'; g.lineWidth = 6; g.beginPath(); g.moveTo(-110, -96); g.lineTo(110, -96); g.stroke(); c4Ink(g, 2.4);
  g.fillStyle = '#a3332a'; g.fillRect(-46, -170, 92, 70); g.strokeRect(-46, -170, 92, 70);
  g.fillStyle = '#f2c640'; g.beginPath(); g.moveTo(-58, -170); g.quadraticCurveTo(0, -206, 58, -170); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#f2ecde'; g.fillRect(-26, -158, 52, 40); g.strokeRect(-26, -158, 52, 40);
  g.restore();
}
function c4StreetItems(items, g, vis) {
  const S = C4.show;
  if (S) {
    const z = .66, s = c4S(z), y = c4Y(z), ph = S.t * 6 + S.ph;
    if (S.k === 'lan') {
      const hx = S.x, jump = Math.abs(Math.sin(S.t * 3)) * 18;
      if (vis(hx - 60, 160)) items.push({ z, f: () => {
        // the cloth body behind the head, two dancers' legs under it
        g.save(); c4Ink(g, 2.4); g.fillStyle = '#c98a1c';
        g.beginPath(); g.moveTo(hx - 20 * s, y - (70 + jump) * s); for (let i = 0; i <= 6; i++) { const bx = hx - (20 + i * 24) * s, by = y - (78 + Math.sin(ph + i) * 10 - jump * (1 - i / 6)) * s; g.lineTo(bx, by); } g.lineTo(hx - 170 * s, y - 34 * s); g.lineTo(hx - 10 * s, y - 34 * s); g.closePath(); g.fill(); g.stroke();
        g.strokeStyle = '#a3332a'; g.lineWidth = 3; for (let i = 1; i < 6; i++) { const bx = hx - (20 + i * 24) * s; g.beginPath(); g.moveTo(bx, y - 74 * s); g.lineTo(bx, y - 40 * s); g.stroke(); }
        g.restore();
        for (const lx of [hx - 30 * s, hx - 140 * s]) { g.save(); c4Ink(g, 3); const k = Math.sin(ph * 2); g.beginPath(); g.moveTo(lx, y - 36 * s); g.lineTo(lx + k * 8 * s, y); g.moveTo(lx + 14 * s, y - 36 * s); g.lineTo(lx + 14 * s - k * 8 * s, y); g.stroke(); g.restore(); }
        c4LionHead(g, hx + 10 * s, y - (40 + jump) * s, s * 1.1, ph);
      } });
      [[MICE.c, ITEM.drum, -.4], [c4MouseRig(15), null, -.9]].forEach(([M, it, arm], i) => { const x = hx - 230 - i * 70; if (vis(x, 80)) items.push({ z: z - .01, f: () => c4Mouse(g, M, x, 1, ph + i, true, arm + Math.sin(ph * 3) * .3, it, s, y, 7 + i) }); });
    } else if (S.k === 'ngua') {
      for (let i = 0; i < 3; i++) { const x = S.x - i * 140; if (vis(x, 120)) items.push({ z: z + i * .002, f: () => c4Horse(g, x, y, s * .9, ph + i, true) }); }
      const lx = S.x + 70; if (vis(lx, 60)) items.push({ z: z + .01, f: () => c4Mouse(g, c4MouseRig(23), lx, 1, ph, true, -.6, null, s, y, 9) });
    } else if (S.k === 'quan') {
      const px = S.x - 160;
      [[c4MouseRig(20), -.6], [c4MouseRig(6), -.6]].forEach(([M, arm], i) => { const x = S.x - i * 60; if (vis(x, 70)) items.push({ z: z + .01, f: () => { c4Mouse(g, M, x, 1, ph + i, true, arm, null, s, y, 11 + i);
        c4Ink(g, 2); g.beginPath(); g.moveTo(x + 18 * s, y - 70 * s); g.lineTo(x + 18 * s, y - 190 * s); g.stroke(); g.fillStyle = i ? '#2f6a4c' : '#a3332a'; g.beginPath(); g.moveTo(x + 18 * s, y - 190 * s); g.lineTo(x + 60 * s, y - 176 * s); g.lineTo(x + 18 * s, y - 160 * s); g.closePath(); g.fill(); g.stroke(); } }); });
      if (vis(px, 160)) {
        items.push({ z: z - .005, f: () => c4Palanquin(g, px, y - Math.abs(Math.sin(ph)) * 3 * s, s) });
        for (const dx of [-90, -50, 50, 90]) items.push({ z: z + (dx < 0 ? -.004 : .004), f: () => c4Mouse(g, c4MouseRig(dx < 0 ? 4 : 7), px + dx * s, 1, ph + dx, true, -1.3, null, s * .95, y, 13) });
      }
      const ux = S.x - 300; if (vis(ux, 90)) items.push({ z: z + .006, f: () => c4Mouse(g, c4MouseRig(2), ux, 1, ph, true, -1.35, ITEM.parasol, s, y, 15) });
    }
  }
  // dust and stars over a fight
  if (C4.fight && vis(C4.fight.x, 120)) {
    const F = C4.fight, y = c4Y(F.z), s = c4S(F.z);
    items.push({ z: F.z + .01, f: () => { g.save(); g.globalAlpha = .55; g.fillStyle = '#c3b596';
      for (let i = 0; i < 5; i++) { const a = F.t * 3 + i * 1.3; g.beginPath(); g.arc(F.x + Math.cos(a) * 30 * s, y - (40 + Math.sin(a * 1.3) * 16) * s, (14 + (i % 2) * 6) * s, 0, 6.283); g.fill(); }
      g.globalAlpha = 1; g.font = `900 ${Math.round(22 * s)}px "Playfair Display", serif`; g.textAlign = 'center'; g.fillStyle = '#a3332a';
      g.fillText(['!', '✱', '!!', '✱'][Math.floor(F.t * 4) % 4], F.x + Math.sin(F.t * 7) * 12 * s, y - 170 * s); g.restore(); } });
  }
  // children's games on the grass in front of the lane
  for (const G of C4.games || []) {
    if (!vis(G.x, 160)) continue;
    const y = c4Y(1) + 104, s = c4S(1) * .62, ph = C4.t * 4 + G.ph, kid = i => c4MouseRig(11 + (i % 3));
    items.push({ z: 2, f: () => {
      if (G.k === 'dacau') {
        c4Mouse(g, kid(0), G.x - 60, 1, ph, false, null, null, s, y - Math.max(0, Math.sin(ph)) * 6, 21); c4Mouse(g, kid(1), G.x + 60, -1, ph, false, null, null, s, y - Math.max(0, -Math.sin(ph)) * 6, 22);
        const t = (Math.sin(ph * .5) + 1) / 2, cx = G.x - 50 + t * 100, cy = y - 60 - Math.sin(t * Math.PI) * 70;   // the shuttlecock arcing between them
        c4Ink(g, 1.6); g.fillStyle = '#a3332a'; g.beginPath(); g.arc(cx, cy, 5, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = '#2f6a4c'; g.lineWidth = 2; g.beginPath(); for (const a of [-.5, 0, .5]) { g.moveTo(cx, cy - 4); g.lineTo(cx + Math.sin(a) * 8, cy - 16); } g.stroke();
      } else if (G.k === 'daynhay') {
        c4Mouse(g, kid(0), G.x - 80, 1, 0, false, -.8, null, s, y, 23); c4Mouse(g, kid(2), G.x + 80, -1, 0, false, -.8, null, s, y, 24);
        const sw = Math.sin(ph * 1.5), jump = Math.max(0, -sw) * 26;
        c4Ink(g, 2); g.beginPath(); g.moveTo(G.x - 66, y - 58); g.quadraticCurveTo(G.x, y - 58 + sw * 60, G.x + 66, y - 58); g.stroke();   // the rope
        c4Mouse(g, kid(1), G.x, 1, 0, false, -.5, null, s, y - jump, 25);
      } else if (G.k === 'keoco') {
        const pull = Math.sin(ph * .4) * 14;
        c4Ink(g, 3); g.strokeStyle = '#b57a22'; g.beginPath(); g.moveTo(G.x - 130 + pull, y - 50); g.lineTo(G.x + 130 + pull, y - 50); g.stroke();
        g.fillStyle = '#a3332a'; g.fillRect(G.x + pull - 4, y - 58, 8, 16);
        for (let i = 0; i < 3; i++) { c4Mouse(g, kid(i), G.x - 40 - i * 40 + pull, -1, ph + i, false, -.2, null, s, y, 26 + i); c4Mouse(g, kid(i + 1), G.x + 40 + i * 40 + pull, 1, ph + i, false, -.2, null, s, y, 29 + i); }
      } else if (G.k === 'oanquan') {
        c4Ink(g, 2); g.fillStyle = '#c9a24a'; g.beginPath(); g.ellipse(G.x, y - 6, 70, 16, 0, 0, 6.283); g.fill(); g.stroke();
        g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(G.x + i * 22, y - 18); g.lineTo(G.x + i * 22, y + 6); } g.moveTo(G.x - 55, y - 6); g.lineTo(G.x + 55, y - 6); g.stroke();
        g.fillStyle = '#5b2f1f'; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(G.x - 44 + (i % 5) * 22, y - 12 + Math.floor(i / 5) * 12, 2.6, 0, 6.283); g.fill(); }
        c4Mouse(g, kid(0), G.x - 90, 1, 0, false, Math.sin(ph) > .7 ? -.9 : -.2, null, s, y, 32); c4Mouse(g, kid(2), G.x + 90, -1, 0, false, null, null, s, y, 33);
      }
    } });
  }
}

/* ---------- the soundscape (owner): a murmur that grows with the crowd, rain, wind, and now and then a dog, a buffalo,
   birds, a pipe, the woodblock of the pagoda, footsteps, a quarrel ---------- */
function c4Ambience(dt) {
  const V = c4View(), on = w => Math.abs(w.x - C4.camX - V.vw / 2) < V.vw * .6, here = C4.walkers.filter(on);
  const n = here.length, moving = here.filter(w => w.st === 'walk' || w.st === 'leave').length, wx = c4Wx();
  AU.ambient({ rain: wx === 'mua' ? .4 : 0 });   // owner: no wind or crowd hiss (it sounded like rushing water); only rain on rainy days
  if (R() < n * .22 * dt) AU.chatter();
  if (R() < moving * .5 * dt) AU.step();
  if (here.some(w => w.kind === 'dog') && R() < dt / 10) AU.bark();
  if (here.some(w => w.buf) && R() < dt / 22) AU.moo();
  if (wx !== 'mua' && R() < dt / 8) AU.chirp();
  if (R() < dt / 35) AU.knock(3);
  for (const w of here) if (w.st === 'sit' && w.smokeX !== undefined && !w.gurgled) { w.gurgled = true; AU.gurgle(); }
  if (C4.fight && R() < dt * 1.3) AU.shout();
  if (here.some(w => w.hoa) && R() < dt / 14) AU.chirp();
  if ((C4.vendors.some(v => (v.ware === 'hangThit' || v.ware === 'hangCa') && Math.abs(v.x - C4.camX - V.vw / 2) < V.vw * .5) || ['bun', 'che'].some(g => c4Own(g) && c4Stock(g))) && R() < dt / 7) AU.buzz();   // flies
}

/* ---------- steam from the pots, fire under the stove, smoke from kitchen roofs, water in the fish baskets (owner) ---------- */
function c4Puffs(g, x, y, s, seed, n = 3, col = '220,214,200', rise = 60, size = 7) {
  for (let i = 0; i < n; i++) {
    const k = (C4.t * .45 + i / n + seed) % 1, a = .85 * (1 - k) * Math.min(1, k * 5);
    g.fillStyle = `rgba(${col},${a})`; g.strokeStyle = `rgba(29,25,21,${a * .35})`; g.lineWidth = 1.2; g.beginPath(); g.arc(x + Math.sin(k * 5 + seed * 7) * 8 * s, y - k * rise * s, (size + k * size * 1.6) * s, 0, 6.283); g.fill(); g.stroke();   // a soft puff with a faint ink edge
  }
}
function c4Flames(g, x, y, s, seed) {
  for (let i = 0; i < 3; i++) {
    const h = (14 + Math.sin(C4.t * 13 + i * 2 + seed) * 5) * s, fx = x + (i - 1) * 9 * s;
    g.fillStyle = i === 1 ? '#f2c640' : '#d97b2a'; g.beginPath(); g.moveTo(fx - 5 * s, y); g.quadraticCurveTo(fx - 4 * s, y - h * .6, fx, y - h); g.quadraticCurveTo(fx + 4 * s, y - h * .6, fx + 5 * s, y); g.closePath(); g.fill();
  }
}
function c4FxItems(items, g, vis) {
  const sy = c4Y(C4_STALL_Z), ss = c4S(C4_STALL_Z);
  // the couple's food stalls (art drawn at the ware's x + 20)
  const POT = { che: [[-40, -132, 3, 7]], bun: [[-55, -132, 4, 8]], xoi: [[-46, -112, 2, 5]] };
  for (const sh of ['che', 'bun', 'xoi']) {
    if (!c4Own(sh) || !c4Stock(sh) || (sh === 'xoi' && C4.mins >= 12 * 60)) continue;
    const bx = C4_GOODS[sh].x + 20; if (!vis(bx, 160)) continue;
    items.push({ z: C4_STALL_Z + .005, f: () => {
      for (const [px, py, n, sz] of POT[sh]) c4Puffs(g, bx + px * ss, sy + py * ss, ss, sh.length * .37, n, '250,247,240', 80, sz * 1.3);
      if (sh === 'bun') c4Flames(g, bx - 55 * ss, sy - 63 * ss, ss, 1);
      if (sh === 'che') { c4Flames(g, bx - 40 * ss, sy - 60 * ss, ss * .8, 2); }
    } });
  }
  // the neighbours: smoke over the rice cakes on the brazier, water jumping in the fish baskets
  for (const v of C4.vendors) {
    if (!vis(v.x, 140)) continue;
    const vz = v.z ? v.z + .01 : .1, y = c4Y(vz), s = c4S(vz), wx = v.x + 50;
    if (v.ware === 'hangBanh') items.push({ z: vz + .005, f: () => { c4Flames(g, wx - 70 * s, y - 6 * s, s * .8, 3); c4Puffs(g, wx - 70 * s, y - 20 * s, s, .3, 3, '200,195,185', 80, 6); } });
    if (v.ware === 'hangCa') items.push({ z: vz + .005, f: () => {
      for (const bx of [-62, 62]) { const k = (C4.t * 1.3 + bx * .01) % 1; if (k > .5) continue; const t = k * 2;
        g.fillStyle = 'rgba(120,170,200,.85)'; for (let i = -1; i <= 1; i++) { g.beginPath(); g.arc(wx + (bx + i * 10 + i * t * 10) * s, y + (-46 - Math.sin(t * Math.PI) * 26) * s, 2.4 * s, 0, 6.283); g.fill(); } }
    } });
    if (v.ware === 'hangThit') items.push({ z: vz + .005, f: () => c4Puffs(g, wx - 30 * s, y - 50 * s, s, .8, 2, '220,214,200', 30, 4) });
  }
  // kitchen smoke from some thatched and straw roofs behind the lane
  for (const [x, k, s, hv] of (C4.scene ? C4.scene.near : [])) {
    if (k !== 'house' || ![0, 2, 4].includes(hv) || !vis(x, 260)) continue;
    const o = C4_HOUSE_V[hv], top = -(o.tall ? 215 : 150) + 12 - 98;
    items.push({ z: -.5, f: () => c4Puffs(g, x + o.w * .45 * s, C4_Y0 + top * s, s, x * .001, 4, '190,186,176', 120, 9) });
  }
}

/* ---------- flies over the meat, the fish and the soup; a stretch of river with a sampan; a flower seller (owner) ---------- */
function c4Flies(g, cx, cy, s, n, seed) {
  for (let i = 0; i < n; i++) {
    const t = C4.t * (1.6 + i * .3) + seed + i * 2.1, x = cx + (Math.sin(t * 2.3) * 22 + Math.sin(t * 5.1) * 7) * s, y = cy + (Math.cos(t * 1.9) * 12 + Math.sin(t * 6.7) * 5) * s;
    g.fillStyle = 'rgba(242,236,222,.8)'; const fl = Math.sin(C4.t * 60 + i) * 2;
    g.beginPath(); g.ellipse(x - 2.2 * s, y - 2 * s, 2.6 * s, (1.4 + fl * .2) * s, -.5, 0, 6.283); g.ellipse(x + 2.2 * s, y - 2 * s, 2.6 * s, (1.4 - fl * .2) * s, .5, 0, 6.283); g.fill();
    g.fillStyle = '#1d1915'; g.beginPath(); g.arc(x, y, 1.7 * s, 0, 6.283); g.fill();
  }
}
function c4FlyItems(items, g, vis) {
  for (const v of C4.vendors) {
    if (!(v.ware === 'hangThit' || v.ware === 'hangCa') || !vis(v.x, 140)) continue;
    const vz = v.z ? v.z + .01 : .1, s = c4S(vz), wx = v.x + 50, y = c4Y(vz);
    items.push({ z: vz + .02, f: () => c4Flies(g, wx - 20 * s, y - (v.ware === 'hangThit' ? 100 : 70) * s, s, 4, v.x * .01) });
  }
  for (const sh of ['bun', 'che']) { if (!c4Own(sh) || !c4Stock(sh)) continue; const bx = C4_GOODS[sh].x + 60; if (!vis(bx, 120)) continue;
    items.push({ z: C4_STALL_Z + .02, f: () => c4Flies(g, bx, c4Y(C4_STALL_Z) - 90 * c4S(C4_STALL_Z), c4S(C4_STALL_Z), 2, sh.length) }); }
}
// a river behind the houses: water, little waves, reeds, now and then a sampan poled along
function c4River(g, cx, vw) {
  const y0 = C4_Y0 - 104, y1 = C4_Y0 - 50, x0 = cx - 40, x1 = cx + vw + 40;
  g.fillStyle = 'rgba(122,168,182,.85)'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y0); g.stroke();
  g.strokeStyle = 'rgba(242,236,222,.8)'; g.lineWidth = 1.6; g.beginPath();
  for (let r = 0; r < 3; r++) { const y = y0 + 12 + r * 15, off = (C4.t * (8 + r * 4)) % 70; for (let x = Math.floor((x0 - off) / 70) * 70 + off; x < x1; x += 70) { g.moveTo(x + r * 20, y); g.quadraticCurveTo(x + r * 20 + 9, y - 4, x + r * 20 + 18, y); } }
  g.stroke();
  g.strokeStyle = '#2f6a4c'; g.lineWidth = 2; g.beginPath(); for (let x = Math.floor(x0 / 37) * 37; x < x1; x += 37) { if ((x / 37) % 3) continue; g.moveTo(x, y0 + 3); g.lineTo(x - 3, y0 - 14); g.moveTo(x + 4, y0 + 3); g.lineTo(x + 6, y0 - 11); } g.stroke();
  const B = C4.boat || (C4.boat = { x: -200, sp: 18 });
  B.x += B.sp * (C4.paused ? 0 : 1 / 60); if (B.x > C4_W + 300) B.x = -300;
  if (B.x > x0 - 120 && B.x < x1 + 120) {
    const y = y0 + 26 + Math.sin(C4.t * 1.5) * 1.5;
    g.fillStyle = '#5b2f1f'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(B.x - 60, y - 8); g.quadraticCurveTo(B.x, y + 14, B.x + 60, y - 8); g.lineTo(B.x + 50, y - 2); g.quadraticCurveTo(B.x, y + 6, B.x - 50, y - 2); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#b57a22'; g.beginPath(); g.moveTo(B.x - 22, y - 6); g.quadraticCurveTo(B.x, y - 30, B.x + 22, y - 6); g.closePath(); g.fill(); g.stroke();   // the rounded awning
    g.fillStyle = '#9d95b9'; g.beginPath(); g.ellipse(B.x + 38, y - 18, 7, 9, 0, 0, 6.283); g.fill(); g.stroke();                                         // the boatman
    g.fillStyle = '#b57a22'; g.beginPath(); g.moveTo(B.x + 28, y - 24); g.lineTo(B.x + 38, y - 36); g.lineTo(B.x + 48, y - 24); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 2.4; g.beginPath(); g.moveTo(B.x + 44, y - 30); g.lineTo(B.x + 20 + Math.sin(C4.t) * 6, y + 26); g.stroke();
  }
}
const C4_HOA_CALL = ['Hoa đây! Hoa cúc, hoa hồng, hoa huệ đây!', 'Mua hoa về cắm bàn thờ đi cô bác ơi!', 'Hoa tươi mới hái sáng nay!', 'Tặng vợ bó hoa, vợ cười cả ngày!'];
function c4FlowerSeller(dt) {
  if (C4.phase !== 'open') return;
  const h = C4.walkers.find(w => w.hoa);
  if (h) { if (!h.say && R() < dt / 6 && Math.abs(h.x - C4.camX - c4View().vw / 2) < c4View().vw * .6) c4Say(h, c4Pick(C4_HOA_CALL)); return; }
  if ((C4.hoaT = (C4.hoaT ?? 20) - dt) > 0) return;
  C4.hoaT = 50 + R() * 40;
  for (let k = 0; k < 6; k++) {
    const n = C4.walkers.length; c4Spawn(); const w = C4.walkers[C4.walkers.length - 1];
    if (C4.walkers.length > n && w.kind === 'mouse' && C4_MOUSE_SORTS[w.sort].role !== 'child' && !w.buf) { Object.assign(w, { hoa: true, buy: false, shop: null, look: { ...(w.look || {}), tool: 'ganh', hat: 'quai' }, sp: 45, umb: false }); break; }
  }
}
