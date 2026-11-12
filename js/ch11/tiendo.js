/* Chương XI · growing stronger (owner 2026-11-01): levels from work (XP), a bigger bag and chest (bought, earned by village jobs, or by
   level), a seller of bags and chests (the hàng xén) and of clothes (the weavers), and a fishing notebook with many fish, rare ones
   only now and then and hard to land.
   - XP: c11Xp(n). Harvesting / felling / digging (c11Drop by kind), fish (by rarity), village jobs (c11QuestDone). Level n needs
     C11_XP(n) in all; each level +8 max sức and +8 max máu; some levels give a perk (C11_PERKS).
   - LIMITS: c11Caps() works out C11_BAG / C11_CHEST / C11_EN / C11_HP from SAVE11.up { bag, chest, hat, coat }, the level, and the
     number of village jobs done (10 and 25 jobs: +2 bag slots each), and grows SAVE11.bag / chest to fit.
   - FISH: C11_FISH2 per water [id, weight, rarity 0/1/2, min fishing level, hours]; a rare fish bites for a shorter moment and then
     fights: tap quickly N times before it breaks the line. SAVE11.dex counts every catch; the notebook has a tab Cá and a tab Bản thân. */
SAVE11.xp = SAVE11.xp || 0; SAVE11.up = SAVE11.up || {}; SAVE11.dex = SAVE11.dex || {};
const C11_XP = n => 20 * n * (n - 1);                                   // total XP for level n: 2 at 40, 3 at 120, 5 at 400, 10 at 1800
const c11Lv = () => { let n = 1; while (n < 30 && SAVE11.xp >= C11_XP(n + 1)) n++; return n; };
const C11_PERKS = { 3: ['cau', 'Câu khéo', 'cá hiếm cắn câu lâu hơn, giằng co dễ hơn'], 4: ['kheo', 'Khéo tay', 'làm việc đỡ tốn sức một phần mười'], 5: ['tui1', 'Túi rộng', 'thêm 2 ô túi'],
  7: ['kheo2', 'Khéo tay hơn', 'làm việc đỡ tốn sức một phần năm'], 8: ['ruong', 'Rương rộng', 'thêm 10 ô rương'], 10: ['tui2', 'Túi rộng hơn', 'thêm 2 ô túi'] };
const c11Perk = id => Object.entries(C11_PERKS).some(([lv, p]) => p[0] === id && c11Lv() >= +lv);
/* what can be bought: bags and chests at the hàng xén, clothes at the weavers; "a little dear" (owner) */
const C11_UPS = {
  bag: [{ name: 'Túi vải', add: 4, price: 1200, sub: 'thêm 4 ô túi' }, { name: 'Túi da trâu', add: 4, price: 3600, sub: 'thêm 4 ô túi nữa' }],
  chest: [{ name: 'Rương gỗ lớn', add: 15, price: 1800, sub: 'thêm 15 ô rương' }, { name: 'Rương gỗ lim', add: 15, price: 5400, sub: 'thêm 15 ô rương nữa' }],
};
const C11_WEAR = {
  hat: [{ id: 'nonla', name: 'Nón lá', price: 400, sub: 'che nắng · làm việc đỡ tốn sức một chút', en: 0, hp: 0, save: .05 }, { id: 'quaithao', name: 'Nón quai thao', price: 1500, sub: '+15 sức tối đa', en: 15, hp: 0 }],
  coat: [{ id: 'aotoi', name: 'Áo tơi', price: 800, sub: '+15 máu tối đa', en: 0, hp: 15 }, { id: 'aothe', name: 'Áo the', price: 3000, sub: '+10 sức, +10 máu tối đa', en: 10, hp: 10 }],
};
const c11Worn = k => { const id = SAVE11.up[k]; return id ? C11_WEAR[k].find(w => w.id === id) : null; };
function c11Caps() {
  const lv = c11Lv(), U = SAVE11.up, jobs = (SAVE11.q && SAVE11.q.n) || 0;
  C11_BAG = 10 + C11_UPS.bag.slice(0, U.bag || 0).reduce((s, b) => s + b.add, 0) + (jobs >= 10 ? 2 : 0) + (jobs >= 25 ? 2 : 0) + (lv >= 5 ? 2 : 0) + (lv >= 10 ? 2 : 0);
  C11_CHEST = 30 + C11_UPS.chest.slice(0, U.chest || 0).reduce((s, b) => s + b.add, 0) + (lv >= 8 ? 10 : 0);
  const h = c11Worn('hat'), c = c11Worn('coat');
  C11_EN = 100 + (lv - 1) * 8 + (h ? h.en : 0) + (c ? c.en : 0); C11_HP = 100 + (lv - 1) * 8 + (h ? h.hp : 0) + (c ? c.hp : 0);
  while (SAVE11.bag.length < C11_BAG) SAVE11.bag.push(null);
  while (SAVE11.chest.length < C11_CHEST) SAVE11.chest.push(null);
}
c11Caps();
function c11Xp(n) {
  if (!n || (typeof C11O !== 'undefined' && C11O.visit)) return;
  const was = c11Lv(); SAVE11.xp += n; const now = c11Lv(); if (now <= was) return;
  c11Caps(); SAVE11.stamina = Math.min(C11_EN, SAVE11.stamina + 20); SAVE11.hp = Math.min(C11_HP, (SAVE11.hp ?? C11_HP) + 20);
  const perk = C11_PERKS[now]; c11Msg(`Lên cấp ${now}! +8 sức, +8 máu${perk ? ` · ${perk[1]}: ${perk[2]}` : ''}`, '#2f6a4c'); c11Sfx.pluck && c11Sfx.pluck();
  c11Dots(Math.floor(C11.px), Math.floor(C11.py) - 1, '#f2cf5a', 18, 2); persist11();
}
/* XP for work: what drops tells what was done */
(() => {
  const oldDrop = c11Drop;
  c11Drop = function (kind, n, tx, ty) {
    oldDrop(kind, n, tx, ty);
    const I = C11_ITEMS[kind]; if (!I) return;
    c11Xp(C11_CROPS[kind] ? 3 * n : kind === 'go' ? 2 : kind === 'buong_chuoi' ? 3 * n : I.cat === 'ca' ? 0 : 1);
  };
  /* village jobs: XP, and at 10 and 25 jobs done the bag grows by two */
  const oldDone = c11QuestDone;
  c11QuestDone = function (q, v) {
    const before = (SAVE11.q && SAVE11.q.n) || 0; oldDone(q, v); const after = (SAVE11.q && SAVE11.q.n) || 0;
    c11Xp(q.giver ? 40 : 25);
    if ((before < 10 && after >= 10) || (before < 25 && after >= 25)) { c11Caps(); c11Msg(`Làm được ${after} việc làng: làng tặng túi to hơn, thêm 2 ô`, '#2f6a4c'); }
  };
  /* skill perks: work costs less sức */
  const oldSpend = c11Spend;
  c11Spend = function (n) { const h = c11Worn('hat'); oldSpend(n * (1 - (c11Perk('kheo2') ? .2 : c11Perk('kheo') ? .1 : 0) - (h && h.save || 0))); };
})();

/* ---------- fish ---------- */
if (!C11_ITEMS.ca_anh_vu) C11_ITEMS.ca_anh_vu = { id: 'ca_anh_vu', name: 'Cá anh vũ', cat: 'ca', price: 600, food: 20, col: '#c89a6a', desc: 'Cá tiến vua, môi dày như vòi, rất hiếm.' };
if (!C11_ITEMS.ca_chien) C11_ITEMS.ca_chien = { id: 'ca_chien', name: 'Cá chiên', cat: 'ca', price: 280, food: 16, col: '#7a6a4a', desc: 'Cá sông sâu, da vằn, khoẻ như trâu.' };
/* [id, weight, rarity 0 common / 1 rare / 2 very rare, fishing level needed, hours it bites (from, to; may wrap past midnight)] */
const C11_FISH2 = {
  ruong: [['ca_diec', 3], ['ca_bong', 3], ['ca_ro', 2.4], ['tep', 1.5], ['oc_buou', 1], ['rac', .8], ['ca_me', 1, 0, 1], ['ca_vang', .25, 1], ['ca_chep_do', .06, 2, 0, [5, 8]], ['ca_chep_do', .06, 2, 0, [17, 19]]],
  lang: [['ca_diec', 3], ['ca_ro', 2.4], ['ca_bong', 2.4], ['ech', 1], ['chach', 1], ['luon', .8, 0, 1], ['rac', .8], ['ca_qua', .6, 0, 1], ['ca_vang', .2, 1], ['ca_chep_do', .06, 2, 0, [5, 8]], ['ca_chep_do', .06, 2, 0, [17, 19]]],
  ben: [['ca_chep', 3], ['ca_tre', 2.4], ['ca_me', 2], ['cua_dong', 1.2], ['tom_dong', 1.2], ['ca_qua', 1.4, 0, 1], ['ca_tram', 1, 0, 2], ['rac', 1], ['ca_nheo', .5, 1, 1], ['ca_lang', .4, 1, 2, [19, 5]], ['ca_chien', .14, 2, 2], ['ca_anh_vu', .05, 2, 3, [4, 7]], ['ngoc_trai', .1, 1, 3]],
};
const C11_RARE = ['Thường', 'Hiếm', 'Rất hiếm'];
const c11FishTable = () => C11_FISH2[C11.area] || (C11.area === 'ruong' ? C11_FISH2.ruong : C11_FISH2.lang);
const c11HourIn = (h, [a, b]) => a <= b ? h >= a && h < b : h >= a || h < b;
function c11RollFish() {
  const lv = c11FishLevel(), h = Math.floor(SAVE11.mins / 60) % 24, L = c11FishTable().filter(r => (r[3] || 0) <= lv && (!r[4] || c11HourIn(h, r[4]))), tot = L.reduce((s, r) => s + r[1], 0);
  let q = Math.random() * tot; for (const r of L) { q -= r[1]; if (q <= 0) return r; } return L[0];
}
(() => {
  /* the bite: the fish is chosen at once; a rare one lets go sooner */
  const oldUp = c11NewUpdate;
  c11NewUpdate = function (dt) {
    const f = C11.fish;
    if (f && f.st === 'bite' && !f.row) { f.row = c11RollFish(); const r = f.row[2] || 0; if (r) f.bite = (r === 2 ? .55 : .75) * (c11Perk('cau') ? 1.3 : 1); }
    if (f && f.st === 'fight') { f.ft -= dt; if (f.ft <= 0) { c11Pop(f.tx, f.ty - 1, `${C11_ITEMS[f.row[0]].name} giật đứt dây rồi!`, '#a3332a'); C11.fish = null; } }
    return oldUp(dt);
  };
  /* the pull: a common fish comes in at once; a rare one has to be fought (quick taps before the time runs out) */
  const oldTap = c11FishTap;
  c11FishTap = function () {
    const f = C11.fish; if (!f) return false;
    if (f.st === 'fight') { f.hits++; c11Dots(f.tx, f.ty, '#bfe0ea', 4, 1.2); if (f.hits >= f.need) { c11Catch(f); C11.fish = null; } return true; }
    if (f.st === 'bite' && f.row && f.row[2]) { const r = f.row[2], easy = c11Perk('cau'); f.st = 'fight'; f.hits = 0; f.need = r === 2 ? 6 : 4; f.ft = (r === 2 ? 2.4 : 2.8) + (easy ? .6 : 0); f.ft0 = f.ft;
      c11Pop(f.tx, f.ty - 1.4, r === 2 ? 'Cá lớn! Giật liên tục!' : 'Cá khoẻ! Giật nhanh!', '#a3332a'); return true; }
    return oldTap();
  };
  c11Catch = function (f) {
    const row = f.row || c11RollFish(), id = row[0], r = row[2] || 0;
    SAVE11.fishN++; SAVE11.dex[id] = (SAVE11.dex[id] || 0) + 1;
    if (c11Add(id, 1)) c11Drop(id, 1, f.tx, f.ty); c11Dots(f.tx, f.ty, r ? '#f2cf5a' : '#bfe0ea', r ? 22 : 12, 1.8);
    c11Pop(f.tx, f.ty - 1, id === 'rac' ? `Vướng ${C11_ITEMS[id].name.toLowerCase()}` : `${r ? C11_RARE[r] + '! ' : ''}Được ${C11_ITEMS[id].name.toLowerCase()}!`, id === 'rac' ? '#5b2f1f' : r ? '#a3332a' : '#2f6a4c');
    if (r && SAVE11.dex[id] === 1) c11Msg(`Lần đầu bắt được ${C11_ITEMS[id].name.toLowerCase()} (${C11_RARE[r].toLowerCase()})! Đã ghi vào sổ tay cá`, '#2f6a4c');
    c11Xp(id === 'rac' ? 1 : [5, 25, 60][r]); persist11();
  };
  /* the fight on screen: a ring that empties with the time left and the taps still needed */
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    const f = C11.fish; if (!f || f.st !== 'fight') return;
    E.push({ y: 999, d: () => { const x = sx(C11.px), y = sy(C11.py) - T * 2.2, R = T * .42, a = Math.max(0, f.ft / f.ft0);
      g.fillStyle = 'rgba(251,244,220,.92)'; g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); g.arc(x, y, R, 0, 6.283); g.fill(); g.stroke();
      g.strokeStyle = a > .35 ? '#2f6a4c' : '#c8402f'; g.lineWidth = 5; g.beginPath(); g.arc(x, y, R - 5, -Math.PI / 2, -Math.PI / 2 + a * 6.283); g.stroke();
      g.fillStyle = INK; g.font = `900 ${Math.round(T * .3)}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${f.hits}/${f.need}`, x, y);
      g.font = `800 ${Math.round(T * .2)}px "Be Vietnam Pro", sans-serif`; g.lineWidth = 3; g.strokeStyle = '#fbf4dc'; g.strokeText('Chạm liên tục!', x, y + R + T * .2); g.fillText('Chạm liên tục!', x, y + R + T * .2); } });
  };
})();

/* ---------- shops: the hàng xén sells bags and chests, the weavers sell clothes ---------- */
C11_SHOPS.push({ who: 'trade:hàng xén', title: 'Hàng xén: túi và rương', ups: true, say: 'Túi này may chắc lắm, đựng gì cũng vừa. Rương gỗ lim để đời con đời cháu.' });
C11_SHOPS.push({ who: 'trade:dệt vải', title: 'Quần áo, nón', wear: true, say: 'Áo the vải nhà dệt, mặc vào đi đình ai cũng ngó.' });
(() => {
  const oldRows = c11ToolRows;
  c11ToolRows = function (shop) {
    const rows = oldRows(shop);
    if (shop.ups) for (const k of ['bag', 'chest']) {
      const got = SAVE11.up[k] || 0, nx = C11_UPS[k][got];
      if (!nx) { rows.push({ name: k === 'bag' ? 'Túi' : 'Rương', sub: 'Đã có loại tốt nhất', tag: ' ', ok: false, f: () => {} }); continue; }
      rows.push({ name: nx.name, sub: `${nx.sub} · đang có ${k === 'bag' ? C11_BAG + ' ô túi' : C11_CHEST + ' ô rương'}`, price: nx.price, ok: SAVE11.money >= nx.price, f: () => {
        if (!c11Money2(nx.price)) { C11.menu.note = 'Chưa đủ tiền'; return; }
        SAVE11.up[k] = got + 1; c11Caps(); persist11(); C11.menu.note = `Đã mua ${nx.name.toLowerCase()}`; c11OpenShopOf(shop); } });
    }
    if (shop.wear) for (const k of ['hat', 'coat']) for (const w of C11_WEAR[k]) {
      const on = SAVE11.up[k] === w.id, own = (SAVE11.up.own || []).includes(w.id);
      rows.push({ name: w.name + (on ? ' · đang mặc' : own ? ' · đã có' : ''), sub: w.sub, price: own ? 0 : w.price, tag: own ? (on ? 'Cởi ra' : 'Mặc vào') : undefined, ok: own || SAVE11.money >= w.price, f: () => {
        if (!own) { if (!c11Money2(w.price)) { C11.menu.note = 'Chưa đủ tiền'; return; } SAVE11.up.own = [...(SAVE11.up.own || []), w.id]; }
        SAVE11.up[k] = on ? null : w.id; c11Caps(); SAVE11.stamina = Math.min(SAVE11.stamina, C11_EN); SAVE11.hp = Math.min(SAVE11.hp, C11_HP); persist11();
        C11.menu.note = on ? `Đã cởi ${w.name.toLowerCase()}` : `Đã mặc ${w.name.toLowerCase()}`; c11OpenShopOf(shop); } });
    }
    return rows;
  };
})();

/* ---------- the notebook: tab Cá (every fish there is, caught or not) and tab Bản thân (level, limits, perks) ---------- */
function c11FishAll() {
  const seen = new Map();
  for (const [area, L] of Object.entries(C11_FISH2)) for (const r of L) { if (r[0] === 'rac') continue; const e = seen.get(r[0]) || { id: r[0], rare: r[2] || 0, where: new Set(), hours: r[4] }; e.where.add(area); e.rare = Math.max(e.rare, r[2] || 0); seen.set(r[0], e); }
  return [...seen.values()].sort((a, b) => a.rare - b.rare || C11_ITEMS[a.id].price - C11_ITEMS[b.id].price);
}
const C11_WATER = { ruong: 'ao nhà mình', lang: 'ao làng, đình, các xóm', ben: 'bến sông' };
function c11DrawFishDex(g, W, px, py, pw, ph, top, m, btn) {
  const all = c11FishAll(), got = all.filter(e => SAVE11.dex[e.id]).length;
  g.fillStyle = INK; g.font = '700 12px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`Đã bắt ${got}/${all.length} loài · tổng ${SAVE11.fishN || 0} lần câu được`, W / 2, top + 4);
  const cols = pw >= 520 ? 3 : 2, gap = 6, ch = 66, cw = (pw - 24 - gap * (cols - 1)) / cols, avail = ph - (top - py) - 66, rowsN = Math.max(1, Math.floor((avail + gap) / (ch + gap))), per = cols * rowsN, pages = Math.ceil(all.length / per);
  m.fpage = Math.max(0, Math.min(pages - 1, m.fpage || 0));
  all.slice(m.fpage * per, m.fpage * per + per).forEach((e, i) => {
    const x = px + 12 + (i % cols) * (cw + gap), y = top + 18 + Math.floor(i / cols) * (ch + gap), n = SAVE11.dex[e.id] || 0, I = C11_ITEMS[e.id];
    g.fillStyle = n ? (e.rare === 2 ? '#f6e0a0' : e.rare ? '#e8efc8' : '#efe3c4') : '#e4dccb'; g.strokeStyle = e.rare === 2 ? '#a3332a' : 'rgba(29,25,21,.55)'; g.lineWidth = e.rare ? 2 : 1.4; g.beginPath(); g.roundRect(x, y, cw, ch, 9); g.fill(); g.stroke();
    if (n) c11ItemIcon(g, e.id, x + 30, y + ch / 2, 40, 0); else { g.fillStyle = 'rgba(29,25,21,.25)'; g.beginPath(); g.ellipse(x + 30, y + ch / 2, 16, 7, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(x + 14, y + ch / 2); g.lineTo(x + 6, y + ch / 2 - 7); g.lineTo(x + 6, y + ch / 2 + 7); g.closePath(); g.fill(); }
    g.textAlign = 'left'; g.fillStyle = INK; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.fillText(n ? I.name : '???', x + 56, y + 15);
    g.font = '600 10px "Be Vietnam Pro", sans-serif'; g.fillStyle = e.rare === 2 ? '#a3332a' : e.rare ? '#2f6a4c' : 'rgba(29,25,21,.7)';
    g.fillText(`${C11_RARE[e.rare]}${'★'.repeat(e.rare)}${n ? ` · đã bắt ${n}` : ''}`, x + 56, y + 31);
    g.fillStyle = 'rgba(29,25,21,.65)'; const wh = [...e.where].map(a => C11_WATER[a]).join(', ') + (n && e.hours ? ` · ${e.hours[0]}–${e.hours[1]} giờ` : '');
    let t = wh; g.font = '600 9.5px "Be Vietnam Pro", sans-serif'; while (g.measureText(t).width > cw - 62 && t.length > 4) t = t.slice(0, -2); if (t !== wh) t += '…'; g.fillText(n || !e.rare ? t : 'Chưa ai kể ở đâu có', x + 56, y + 47);
  });
  if (pages > 1) { const pv = c11Tag(g, px + 14, py + ph - 42, '‹ Trước', { size: 11, h: 26, pad: 16 }), nx = c11Tag(g, px + pw - 14, py + ph - 42, 'Sau ›', { right: true, size: 11, h: 26, pad: 16 });
    btn.push({ r: pv, f: () => { m.fpage = Math.max(0, m.fpage - 1); } }, { r: nx, f: () => { m.fpage = Math.min(pages - 1, m.fpage + 1); } });
    g.fillStyle = INK; g.font = '700 11px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.fillText(`${m.fpage + 1}/${pages}`, W / 2, py + ph - 29); }
}
function c11DrawSelf(g, W, px, py, pw, ph, top) {
  const lv = c11Lv(), a = C11_XP(lv), b = C11_XP(lv + 1), f = Math.max(0, Math.min(1, (SAVE11.xp - a) / (b - a))), jobs = (SAVE11.q && SAVE11.q.n) || 0, x = px + 20, w = pw - 40;
  let y = top + 8;
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = '900 20px "Playfair Display", serif'; g.fillText(`Cấp ${lv}`, x, y); y += 22;
  g.fillStyle = '#efe3c4'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, w, 14, 7); g.fill(); g.stroke();
  g.fillStyle = '#d9a52a'; g.beginPath(); g.roundRect(x + 2, y + 2, Math.max(8, (w - 4) * f), 10, 5); g.fill();
  g.fillStyle = INK; g.font = '700 10px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.fillText(`${SAVE11.xp - a}/${b - a} kinh nghiệm`, x + w / 2, y + 7); y += 30;
  g.textAlign = 'left'; g.font = '700 12px "Be Vietnam Pro", sans-serif';
  const line = (t, c = INK) => { g.fillStyle = c; g.fillText(t, x, y); y += 20; };
  line(`Sức tối đa ${C11_EN} · Máu tối đa ${C11_HP}`); line(`Túi ${C11_BAG} ô · Rương ${C11_CHEST} ô`);
  const h = c11Worn('hat'), c = c11Worn('coat'); line(`Đang đội: ${h ? h.name : 'không'} · Đang mặc: ${c ? c.name : 'áo thường'}`);
  line(`Việc làng đã làm: ${jobs}${jobs < 10 ? ` · làm đủ 10 việc được thêm 2 ô túi` : jobs < 25 ? ` · làm đủ 25 việc được thêm 2 ô túi nữa` : ''}`);
  y += 6; g.font = '800 13px "Be Vietnam Pro", sans-serif'; line('Kỹ năng theo cấp');
  g.font = '600 11.5px "Be Vietnam Pro", sans-serif';
  for (const [l, p] of Object.entries(C11_PERKS)) line(`${lv >= +l ? '✓' : '○'} Cấp ${l} · ${p[1]}: ${p[2]}`, lv >= +l ? '#2f6a4c' : 'rgba(29,25,21,.55)');
  y += 6; g.font = '600 10.5px "Be Vietnam Pro", sans-serif'; line('Kinh nghiệm có từ thu hoạch, chặt cây, câu cá, đào đất và làm việc làng. Mỗi cấp thêm 8 sức, 8 máu.', 'rgba(29,25,21,.7)');
}
/* the level under the Sức bar: a thin gold bar with "Cấp N" beside it */
(() => {
  const oldHud = c11OHud;
  c11OHud = function (g, st) {
    oldHud(g, st);
    const W = cv.width / DPR, lv = c11Lv(), a = C11_XP(lv), b = C11_XP(lv + 1), f = Math.max(0, Math.min(1, (SAVE11.xp - a) / (b - a))), cx = W - 10 - 16, cy = 95, r = 13;
    g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, r + 3, 0, 6.283); g.fill(); g.stroke();   // the level: its number inside a ring that fills with experience (owner 2026-11-11)
    g.strokeStyle = 'rgba(29,25,21,.18)'; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r - 1.5, 0, 6.283); g.stroke();
    if (f > 0) { g.strokeStyle = '#d9a52a'; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, r - 1.5, -1.5708, -1.5708 + 6.283 * f); g.stroke(); g.lineCap = 'butt'; }
    g.fillStyle = INK; g.font = `900 ${lv > 99 ? 9 : 11}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lv, cx, cy + .5);
    C11.hud.push({ r: [cx - 20, cy - 20 + st, 40, 40], f: () => c11OpenBook('ban') });
  };
})();
