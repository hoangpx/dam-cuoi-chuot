/* Chương XI · Làng Vũ Đại — hang chằn tinh (owner 2026-11-10/11, the last batch: "đánh quái", after the folk tale of Thạch Sanh;
   nothing of the tale's text is used). A deeper cave (area hangtinh, 20×14, dark like the cave) behind the far end of Hang động.
   CHẰN TINH (san.js kind 'tinh'): a big slow ogre, 40 hp, 22 a blow, long reach; bats round it. Struck down it leaves its hoard
   (money, a jade, an old bronze drum the first time) and stays away C11_TINH_DAYS days (SAVE11.tinh = the day it fell), then is
   back, a little stronger each time (hp +8 a fall, up to 80). The đình's board asks for it now and then (duong.js hunt posts). */

const C11_TINH_DAYS = 7;
const C11_TINH_MAP = (() => {
  const W = 20, H = 14, m = Array.from({ length: H }, () => Array(W).fill('X'));
  const put = (x, y, k) => { if (x > 0 && x < W - 1 && y > 0 && y < H - 1) m[y][x] = k; };
  const room = (cx, cy, rx, ry) => { for (let y = cy - ry; y <= cy + ry; y++) for (let x = cx - rx; x <= cx + rx; x++) if (((x - cx) / (rx + .4)) ** 2 + ((y - cy) / (ry + .4)) ** 2 <= 1) put(x, y, 'q'); };
  room(12, 7, 6, 4); for (let x = 1; x <= 7; x++) { put(x, 7, 'q'); put(x, 8, 'q'); }
  for (const [x, y] of [[9, 4], [15, 10], [16, 5]]) put(x, y, 'X');
  m[7][0] = 'E';
  return m;
})();
C11_AREAS.hangtinh = { id: 'hangtinh', name: 'Hang chằn tinh', map: C11_TINH_MAP, treeAt: {}, houses: [], stalls: [], cave: 1, wild: 1, exits: { '0,7': ['hang', 23.2, 13.6, '← Hang động'] }, lane: [] };
C11_CAVE_MAP[13][25] = 'E'; C11_CAVE_MAP[13][24] = 'q'; C11_CAVE_MAP[14][24] = 'q';
C11_AREAS.hang.exits['25,13'] = ['hangtinh', 1.8, 7.7, 'Hang sâu →'];
C11_BEASTS.hangtinh = [];
if (typeof C11_DIG !== 'undefined') C11_DIG.hangtinh = [['than', 5], ['sat', 5], ['dong', 4], ['bac_vun', 2], ['vang_cam', .6], ['hat_da_quy', .3], ['ngoc_bich', .1]].filter(r => C11_ITEMS[r[0]]);

const c11TinhOut = () => SAVE11.tinh && SAVE11.day - SAVE11.tinh < C11_TINH_DAYS;
c11WildKind('tinh', { name: 'Chằn tinh', hp: 40, dmg: 22, sp: 2.2, see: 6.5, ai: 'charge', run: 3.2, rest: 1.6, hitR: 1.15, cdHit: 1.8, xp: 300, r: .9, tall: 2.3, bar: 1.4, barY: 2.45, leash: 12, drops: [['ngoc_bich', .5, 1], ['vang_cam', 1, 2]],
  why: 'Chằn tinh quật ngã, ngất đi',
  onDead: () => { const first = !SAVE11.tinhN; SAVE11.tinh = SAVE11.day; SAVE11.tinhN = (SAVE11.tinhN || 0) + 1; const m = 1200 + 300 * Math.min(5, SAVE11.tinhN); SAVE11.money += m;
    if (first && C11_ITEMS.trong_dong_nho && c11Add('trong_dong_nho', 1)) c11Put(SAVE11.chest, 'trong_dong_nho', 1);
    for (const p of C11_PPL) { const s = SAVE11.ppl && SAVE11.ppl[p.id]; if (s && s.met) s.f = Math.min(2500, s.f + 60); }
    setTimeout(() => c11Msg(`Hạ được chằn tinh! Kho của nó: ${c4Money(m)}${first ? ' và một chiếc trống đồng cổ' : ''} · cả làng quý bạn hơn`, '#8a5a12'), 1800); } },
  function (g, X, Y, T, w) {
    const u = T / 64, f = w.face, sw = Math.sin(w.ph * 1.6) * (w.mov ? 5 : 1.5) * u, raise = w.mode === 'run' ? Math.sin(w.ph * 2) * .5 + .5 : .2;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(X, Y, 46 * u, 10 * u, 0, 0, 6.283); g.fill();
    g.strokeStyle = '#120e12'; g.lineWidth = 2.6; g.lineJoin = g.lineCap = 'round';
    g.fillStyle = '#3f5a3a'; for (const s of [-1, 1]) { g.beginPath(); g.roundRect(X + s * 16 * u - 11 * u, Y - 40 * u + (s > 0 ? sw : -sw) * .4, 22 * u, 40 * u, 8 * u); g.fill(); g.stroke(); }   // legs
    g.fillStyle = '#4f7046'; g.beginPath(); g.ellipse(X, Y - 78 * u, 44 * u, 48 * u, 0, 0, 6.283); g.fill(); g.stroke();                                    // the body
    g.fillStyle = '#6a8a5a'; g.beginPath(); g.ellipse(X + 6 * u * f, Y - 70 * u, 26 * u, 30 * u, 0, 0, 6.283); g.fill();                                  // the belly
    g.fillStyle = '#7a4a2a'; g.beginPath(); g.moveTo(X - 40 * u, Y - 56 * u); g.quadraticCurveTo(X, Y - 36 * u, X + 40 * u, Y - 56 * u); g.lineTo(X + 34 * u, Y - 40 * u); g.quadraticCurveTo(X, Y - 24 * u, X - 34 * u, Y - 40 * u); g.closePath(); g.fill(); g.stroke();   // a hide round the waist
    g.fillStyle = '#4f7046'; g.beginPath(); g.ellipse(X - 40 * u * f, Y - 84 * u + sw, 13 * u, 26 * u, .3 * f, 0, 6.283); g.fill(); g.stroke();              // the far arm
    const ax = X + 44 * u * f, ay = Y - 96 * u - raise * 22 * u;                                                                                            // the near arm with a club
    g.strokeStyle = '#5b3a1e'; g.lineWidth = 11 * u; g.beginPath(); g.moveTo(ax, ay + 10 * u); g.lineTo(ax + 26 * u * f, ay - 46 * u - raise * 10 * u); g.stroke();
    g.strokeStyle = '#120e12'; g.lineWidth = 2.6; g.fillStyle = '#7a5a34'; g.beginPath(); g.ellipse(ax + 28 * u * f, ay - 50 * u - raise * 10 * u, 11 * u, 15 * u, .4 * f, 0, 6.283); g.fill(); g.stroke();
    g.fillStyle = '#4f7046'; g.beginPath(); g.ellipse(ax - 4 * u * f, ay + 16 * u, 13 * u, 24 * u, -.5 * f, 0, 6.283); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(X + 4 * u * f, Y - 132 * u, 30 * u, 26 * u, 0, 0, 6.283); g.fill(); g.stroke();                                               // the head
    g.fillStyle = '#e8dcc0'; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(X + 4 * u * f + s * 18 * u, Y - 152 * u); g.quadraticCurveTo(X + 4 * u * f + s * 34 * u, Y - 170 * u, X + 4 * u * f + s * 26 * u, Y - 182 * u); g.quadraticCurveTo(X + 4 * u * f + s * 20 * u, Y - 166 * u, X + 4 * u * f + s * 10 * u, Y - 156 * u); g.closePath(); g.fill(); g.stroke(); }   // horns
    g.fillStyle = '#f2cf5a'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(X + (8 + s * 11) * u * f, Y - 136 * u, 6 * u, 5 * u, 0, 0, 6.283); g.fill(); g.stroke(); }
    g.fillStyle = '#c8402f'; for (const s of [-1, 1]) { g.beginPath(); g.arc(X + (9 + s * 11) * u * f, Y - 136 * u, 2.4 * u, 0, 6.283); g.fill(); }
    g.fillStyle = '#2a1414'; g.beginPath(); g.moveTo(X - 10 * u * f, Y - 122 * u); g.quadraticCurveTo(X + 8 * u * f, Y - 108 * u, X + 26 * u * f, Y - 122 * u); g.quadraticCurveTo(X + 8 * u * f, Y - 116 * u, X - 10 * u * f, Y - 122 * u); g.fill(); g.stroke();   // the mouth
    g.fillStyle = '#f4ecd6'; for (const q of [0, 18]) { g.beginPath(); g.moveTo(X + (q - 4) * u * f, Y - 121 * u); g.lineTo(X + (q - 1) * u * f, Y - 131 * u); g.lineTo(X + (q + 3) * u * f, Y - 120 * u); g.closePath(); g.fill(); g.stroke(); }                         // tusks
  });
C11_WILD_AT.hangtinh = [['tinh', 13, 7, { when: () => !c11TinhOut() }], ['doi', 8, 5], ['doi', 15, 4], ['doi', 16, 9], ['doi', 10, 9]];
if (typeof C11_HUNT_POSTS !== 'undefined') C11_HUNT_POSTS.push({ kind: 'tinh', n: 1, from: 12, who: 'tu', title: 'Chằn tinh trong hang sâu', m: 800, say: 'Cậu hạ được chằn tinh thật ư? Từ nay làng không còn mất trâu mất gà. Cả làng góp tiền tạ cậu.' });
(() => {
  /* it comes back stronger; a word at the cave's mouth */
  const oldEnter = c11Enter;
  c11Enter = function (id, x, y, quiet) {
    oldEnter(id, x, y, quiet);
    if (id !== 'hangtinh') return;
    const t = (C11.wild || []).find(w => w.kind === 'tinh');
    if (t) { t.hp = Math.min(80, 40 + 8 * (SAVE11.tinhN || 0)); t.hpMax = t.hp; setTimeout(() => { if (C11.area === 'hangtinh') c11Msg('Có tiếng thở phì phò trong hang sâu...', '#a3332a'); }, 900); }
    else setTimeout(() => { if (C11.area === 'hangtinh') c11Msg(`Hang vắng. Chằn tinh còn ${C11_TINH_DAYS - (SAVE11.day - SAVE11.tinh)} ngày nữa mới mò về`, '#2f6a4c'); }, 900);
  };
})();
