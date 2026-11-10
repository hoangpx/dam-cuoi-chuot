/* Chương XI · weather (a contributor, owner 2026-11-10: "thời tiết nắng mưa: mưa thì khỏi tưới, nắng gắt thì héo nhanh").
   Each day is nang (plain sun), mua (rain) or gat (scorching), worked out from the day and a seed kept in the save (c11Wx), so a
   reload shows the same sky. The first two days are always plain; never two scorching days running.
   - mua: every hoed tile is wet all day (nothing to water), rain falls over the view under a grey light.
   - gat: a crop left unwatered dies that very night (no wilted day in between), under a hot yellow light.
   - nang: as before: one dry night wilts, the second kills (nongtrai.js c11NewDay).
   The morning message says what the sky is doing, and the day label in the corner carries its sign. */
const C11_WXI = { nang: '☀️', mua: '🌧️', gat: '🔥' };
const c11WxSeed = () => SAVE11.wxSeed || (SAVE11.wxSeed = 1 + Math.floor(Math.random() * 900));
const c11WxRaw = day => { if (day <= 2) return 'nang'; const r = c11Hash(day, c11WxSeed(), 77); return r < .26 ? 'mua' : r < .4 && day > 4 ? 'gat' : 'nang'; };
const c11Wx = (day = SAVE11.day) => { const w = c11WxRaw(day); return w === 'gat' && c11WxRaw(day - 1) === 'gat' ? 'nang' : w; };
const c11WxIcon = () => C11_WXI[c11Wx()];
const c11WxOwn = () => !(typeof C11O !== 'undefined' && C11O.visit);          // on a friend's farm the tiles are theirs: leave them alone
const troiDay0 = c11NewDay;
c11NewDay = function () {
  const wx = c11Wx(SAVE11.day);                                             // the sky of the day that is ending
  for (const s of Object.values(SAVE11.tiles)) if (s.crop && !s.dead) { if (wx === 'mua') s.wet = 1; else if (wx === 'gat' && !s.wet) s.dry = 1; }   // rain watered it; a scorching day skips the wilted day
  troiDay0();
  const now = c11Wx(SAVE11.day);
  if (now === 'mua') for (const s of Object.values(SAVE11.tiles)) s.wet = 1;
  if (C11.msg && now !== 'nang') C11.msg.text += now === 'mua' ? ' · Trời mưa, hôm nay khỏi tưới' : ' · Nắng gắt, cây nào không tưới hôm nay sẽ chết khô';
  persist11();
};
const troiUpdate0 = c11NewUpdate;
c11NewUpdate = function (dt) {
  const G = C11; G.wxT = (G.wxT || 0) - dt;
  if (G.wxT <= 0) { G.wxT = 1; if (c11Wx() === 'mua' && c11WxOwn()) for (const s of Object.values(SAVE11.tiles)) if (!s.wet) s.wet = 1; }   // earth hoed in the rain is wet too
  return troiUpdate0(dt);
};
/* over the whole view, under the buttons (called by renderC11) */
function c11WxDraw(g, W, H) {
  const wx = c11Wx(), t = C11.t;
  if (wx === 'mua') {
    g.fillStyle = 'rgba(52,70,98,.2)'; g.fillRect(0, 0, W, H);
    const n = isTouch ? 60 : 110; g.strokeStyle = 'rgba(226,238,255,.5)'; g.lineWidth = 1.4; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i < n; i++) {
      const y = ((i * 53.7 + t * 820 * (.8 + (i % 7) * .06)) % (H + 60)) - 30, x = ((((i * 131.1 - y * .28) % (W + 80)) + W + 80) % (W + 80)) - 40;
      g.moveTo(x, y); g.lineTo(x - 5, y + 18);
    }
    g.stroke();
  } else if (wx === 'gat') {
    g.fillStyle = 'rgba(255,196,70,.1)'; g.fillRect(0, 0, W, H);
    const gr = g.createRadialGradient(W, 0, 0, W, 0, Math.max(W, H) * .7); gr.addColorStop(0, 'rgba(255,236,150,.34)'); gr.addColorStop(1, 'rgba(255,236,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }
}
