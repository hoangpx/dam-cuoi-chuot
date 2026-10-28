/* Chương XI · Làng Vũ Đại — trades, tools, animals, fishing, digging (owner 2026-10-27: "dụng cụ phải mua, mỗi NPC có một nghề để dạy
   nhưng phải làm quen, tặng quà, làm việc cho họ thì mới thân rồi mới dạy; mua con giống, học nuôi gà lợn trâu bò, học đóng giàn,
   đóng chuồng; đào đất tìm đồ, câu cá"). Loaded after dinhba.js; it hooks into nongtrai.js through c11ActNew / c11CanNew / c11NewDayNew /
   c11NewUpdate / c11NewDraw / c11FishTap / c11SlotNote and wraps c11TalkTo, c11Beasts, c11Beast and c11Tool.
   Everything the player owns or knows is in SAVE11 (tools, skill, pens, herd, dug, fish), so a later online layer only has to carry it.
   C11_ONLINE (off) is where the per-player seed and item limits will live. */
const C11_ONLINE = false;

/* ---------- tools: bought from the smith; the sickle is the one thing a new farmer owns ---------- */
const C11_TOOLS = {
  sickle: { name: 'Liềm', price: 25, sub: 'Cắt cỏ, dọn cây chết' }, hoe: { name: 'Cuốc', price: 40, sub: 'Cuốc đất đã cắt cỏ' }, axe: { name: 'Rìu', price: 70, sub: 'Chặt cây lấy gỗ' },
  can: { name: 'Bình tưới', price: 35, sub: 'Tưới cây, múc nước ở ao' }, dan: { name: 'Búa đục', price: 60, sub: 'Bắc giàn, đóng chuồng (phải có nghề)' }, shovel: { name: 'Xẻng', price: 45, sub: 'Đào đất tìm đồ' },
  rod: { name: 'Cần câu', price: 50, sub: 'Câu cá ở ao, ở sông (phải học câu)' },
};
const c11Has = t => !C11_TOOLS[t] || !!(SAVE11.tools && SAVE11.tools[t]);
for (const t of ['rod', 'shovel']) if (!C11_SLOTS.includes(t)) C11_SLOTS.push(t);
Object.assign(C11_COST, { rod: 1, shovel: 2 }); Object.assign(C11_HIT, { rod: .5, shovel: .6 });
C11_KEYS.shovel = C11_KEYS.hoe; C11_KEYS.rod = C11_KEYS.can;
if (!SAVE11.tools) {                                                                   // old saves keep what they had; a new farmer has a sickle and a starting purse
  const old = SAVE11.day > 1 || Object.keys(SAVE11.tiles || {}).length > 0;
  SAVE11.tools = old ? { sickle: 1, hoe: 1, axe: 1, can: 1, dan: 1 } : { sickle: 1 }; SAVE11.skill = old ? { dan: 1 } : {};
  SAVE11.gift = old ? 1 : 0;
}
SAVE11.skill = SAVE11.skill || {}; SAVE11.herd = SAVE11.herd || []; SAVE11.pens = SAVE11.pens || []; SAVE11.dug = SAVE11.dug || {}; SAVE11.fishN = SAVE11.fishN || 0; SAVE11.dex = SAVE11.dex || {}; SAVE11.uid = SAVE11.uid || 1;

/* ---------- a few more things to find, grow and sell ---------- */
for (const [id, name, cat, price, food, col, desc] of [
  ['sua_bo', 'Sữa bò', 'thu', 30, 12, '#f4f0e8', 'Vắt buổi sáng, còn ấm.'], ['thit_lon', 'Thịt lợn', 'thu', 90, 30, '#e9a99c', 'Lợn nhà nuôi bằng cám với rau.'],
  ['cam', 'Cám', 'vat', 4, 0, '#c8a060', 'Cám gạo trộn rau, gà lợn vịt đều thích.'], ['manh_sanh', 'Mảnh sành', 'vat', 2, 0, '#a86a4a', 'Mảnh nồi vỡ từ đời nào.'],
]) if (!C11_ITEMS[id]) C11_ITEMS[id] = { id, name, cat, price, food, col, desc };

/* ---------- skills: each has one teacher who teaches it only to someone they know well enough ---------- */
const C11_SKILLS = {
  dan: { name: 'Bắc giàn', who: 'trade:thợ mộc', alt: 'tho', hearts: 3, fee: 40, desc: 'Dựng giàn tre cho mướp và đậu leo.', say: ['Giàn phải chôn cọc sâu, buộc lạt chéo, gió thổi không đổ.', 'Cọc tre già, lạt giang, anh nhớ ba điều ấy là xong.'] },
  chuong: { name: 'Đóng chuồng', who: 'trade:thợ mộc', alt: 'tho', hearts: 5, fee: 80, desc: 'Đóng chuồng cho gà vịt, lợn, trâu bò.', say: ['Chuồng nền cao ráo, mái lợp kín, kẻo mưa gió là súc vật ốm.', 'Cột chôn chắc, phên đan khít, cáo chuột không chui vào được.'] },
  ga: { name: 'Nuôi gà vịt', who: 'chidau', hearts: 3, fee: 30, desc: 'Biết cho gà vịt ăn, ấp và lấy trứng.', say: ['Gà vịt ăn thóc ngô, uống nước sạch, đẻ đều lắm.', 'Sáng nhặt trứng, chiều lùa vào chuồng, đừng để cáo tha.'] },
  lon: { name: 'Nuôi lợn', who: 'tugoa', hearts: 5, fee: 80, desc: 'Nuôi lợn cho béo, không bị ốm.', say: ['Lợn ăn cám, ăn khoai, ăn rau, nhớ cho đều bữa.', 'Con lợn mà bỏ bữa là sụt cân ngay, anh ạ.'] },
  bo: { name: 'Nuôi trâu bò', who: 'dau', hearts: 6, fee: 120, desc: 'Chăm trâu bò, vắt sữa, kéo cày.', say: ['Trâu bò ăn cỏ ăn rơm, cho ăn đủ thì khoẻ như vâm.', 'Con trâu là đầu cơ nghiệp, anh chăm cho tử tế.'] },
  cau: { name: 'Câu cá', who: 'trade:chài lưới', hearts: 3, fee: 40, desc: 'Biết thả cần, chờ cá cắn và giật đúng lúc.', say: ['Thả mồi xuống, ngồi im, khi phao chìm thì giật nhẹ.', 'Cá khôn lắm, anh nóng vội là nó chạy mất.'] },
};
const c11Know = id => !!SAVE11.skill[id];
function c11TeacherOf(id) {
  const S = C11_SKILLS[id]; if (!S) return null;
  if (S.who.startsWith('trade:')) return C11_PPL.find(p => p.trade === S.who.slice(6)) || C11_PPL.find(p => p.id === S.alt) || null;
  return C11_PPL.find(p => p.id === S.who) || null;
}
const c11Teaches = p => Object.keys(C11_SKILLS).filter(id => { const t = c11TeacherOf(id); return t && t.id === p.id; });

/* ---------- the shops are people: the smith, the fisher, the ones who sell young animals ---------- */
const C11_ANIMALS = {
  ga: { name: 'Gà con', price: 25, skill: 'ga', pen: 'ga', adult: 3, sell: 35, feed: ['ngo', 'lua', 'cam'] },
  vit: { name: 'Vịt con', price: 30, skill: 'ga', pen: 'ga', adult: 3, sell: 42, feed: ['lua', 'muong', 'cam'] },
  lon: { name: 'Lợn giống', price: 220, skill: 'lon', pen: 'lon', adult: 8, sell: 330, feed: ['khoai', 'muong', 'cai', 'bi', 'cam'] },
  bo: { name: 'Bê con', price: 450, skill: 'bo', pen: 'bo', adult: 6, sell: 680, feed: ['co', 'rom', 'muong'] },
  trau: { name: 'Nghé con', price: 520, skill: 'bo', pen: 'bo', adult: 6, sell: 780, feed: ['co', 'rom', 'muong'] },
};
const C11_PENS = { ga: { name: 'Chuồng gà vịt', wood: 12, cap: 6, skills: ['chuong', 'ga'] }, lon: { name: 'Chuồng lợn', wood: 16, cap: 3, skills: ['chuong', 'lon'] }, bo: { name: 'Chuồng trâu bò', wood: 22, cap: 2, skills: ['chuong', 'bo'] } };
const C11_NAMES = { ga: ['Cục Tác', 'Mái Hoa', 'Chấm', 'Tía', 'Vàng'], vit: ['Bầu', 'Lạch Bạch', 'Cọc Cạch', 'Xám'], lon: ['Ỉn', 'Mập', 'Hồng', 'Quắn Đuôi'], bo: ['Khoang', 'Vàng', 'Nâu', 'Hoa'], trau: ['Đen', 'Mun', 'Cu Li', 'Đầu Cơ'] };
const C11_SHOPS = [
  { who: 'tho', title: 'Lò rèn bác Năm Thọ', tools: ['sickle', 'hoe', 'axe', 'can', 'dan', 'shovel'], say: 'Đồ nhà tôi rèn từ sắt tốt, dùng ba năm không cùn.' },
  { who: 'trade:chài lưới', title: 'Đồ câu', tools: ['rod'], feed: ['cam'], say: 'Cần tre già, dây cước chắc, ra sông là có cá.' },
  { who: 'chidau', title: 'Con giống gà vịt', animals: ['ga', 'vit'], feed: ['cam'], say: 'Gà vịt con khoẻ lắm, anh nuôi ba hôm là biết.' },
  { who: 'tugoa', title: 'Lợn giống nhà bà Tư', animals: ['lon'], feed: ['cam'], say: 'Lợn giống nái này, ăn khỏe chóng lớn.' },
  { who: 'dau', title: 'Trâu bò nhà anh Dậu', animals: ['bo', 'trau'], say: 'Nghé bê này tôi chọn kỹ, anh nuôi cho tử tế nhé.' },
];
const c11WhoIs = (p, who) => who.startsWith('trade:') ? p.trade === who.slice(6) : p.id === who;
const c11ShopsOf = p => C11_SHOPS.filter(s => c11WhoIs(p, s.who));
function c11Money2(cost) { if (SAVE4.money < cost) return false; SAVE4.money -= cost; persist4(); persist11(); return true; }
function c11ToolRows(shop) {
  const rows = [];
  for (const t of shop.tools || []) { const T = C11_TOOLS[t]; rows.push({ name: T.name, sub: c11Has(t) ? 'Đã có' : T.sub, price: T.price, ok: !c11Has(t) && SAVE4.money >= T.price, f: () => {
    if (c11Has(t)) { C11.menu.note = 'Bạn đã có rồi'; return; } if (!c11Money2(T.price)) { C11.menu.note = 'Chưa đủ tiền'; return; }
    SAVE11.tools[t] = 1; persist11(); C11.menu.note = `Đã mua ${T.name.toLowerCase()}`; } }); }
  for (const f of shop.feed || []) rows.push({ name: C11_ITEMS[f].name, sub: C11_ITEMS[f].desc, price: C11_ITEMS[f].price * 5, tag: `5 phần · ${c4Money(C11_ITEMS[f].price * 5)}`, f: () => {
    if (SAVE4.money < C11_ITEMS[f].price * 5) { C11.menu.note = 'Chưa đủ tiền'; return; } const left = c11Add(f, 5); if (left === 5) { C11.menu.note = 'Túi đầy rồi'; return; }
    c11Money2(C11_ITEMS[f].price * (5 - left)); C11.menu.note = `Đã mua ${5 - left} phần ${C11_ITEMS[f].name.toLowerCase()}`; } });
  for (const k of shop.animals || []) { const A = C11_ANIMALS[k]; rows.push({ name: A.name, sub: c11Know(A.skill) ? `${C11_PENS[A.pen].name} · lớn sau ${A.adult} ngày` : `phải học "${C11_SKILLS[A.skill].name}" trước`, price: A.price, ok: SAVE4.money >= A.price && c11Know(A.skill), f: () => c11BuyAnimal(k) }); }
  if (shop.animals) for (const h of SAVE11.herd.filter(h => shop.animals.includes(h.kind) && h.age >= C11_ANIMALS[h.kind].adult)) rows.push({ name: `Bán ${h.nm}`, sub: `${C11_ANIMALS[h.kind].name.replace(' con', '').replace(' giống', '')} đã lớn`, price: 0, tag: `Được ${c4Money(C11_ANIMALS[h.kind].sell)}`, f: () => {
    const i = SAVE11.herd.indexOf(h); if (i < 0) return; SAVE11.herd.splice(i, 1); SAVE4.money += C11_ANIMALS[h.kind].sell; persist4(); persist11(); c11HerdBuild(); C11.menu.note = `Đã bán ${h.nm}`; c11OpenShopOf(C11.menu.shop); } });
  return rows;
}
function c11OpenShopOf(shop) { C11.menu = { title: shop.title, note: '', shop, cols: 1, rows: c11ToolRows(shop) }; }

/* ---------- talking to someone who sells or teaches opens a short list first ---------- */
const c11TalkBase = c11TalkTo;
c11TalkTo = function (v) {
  const p = v.p, it = c11HandItem(), tool = c11HandTool();
  if (it && (tool === 'item' || tool === 'seed')) { c11TalkBase(v); return; }              // a gift goes straight to the person
  const teach = c11Teaches(p), shops = c11ShopsOf(p);
  if (!teach.length && !shops.length) { c11TalkBase(v); return; }
  const s = c11PP(p.id), h = c11Hearts(p.id), rows = [{ name: 'Trò chuyện', sub: 'chào hỏi, nghe chuyện, nhận việc', tag: '', ok: true, f: () => { C11.menu = null; c11TalkBase(v); } }];
  for (const sh of shops) rows.push({ name: 'Mua đồ', sub: sh.title, tag: 'Xem hàng', ok: true, f: () => { C11.say = { who: v, text: sh.say, t: 0 }; c11OpenShopOf(sh); } });
  for (const id of teach) {
    const S = C11_SKILLS[id], known = c11Know(id), need = !s.met ? 'chưa quen nhau, hãy trò chuyện trước' : h < S.hearts ? `cần thân đến ♥${S.hearts} (đang ♥${h})` : '';
    rows.push({ name: known ? `${S.name} · đã biết` : `Học ${S.name.toLowerCase()}`, sub: known ? S.desc : need || S.desc, tag: known ? '' : `Học phí ${c4Money(S.fee)}`, ok: !known && !need && SAVE4.money >= S.fee, f: () => {
      if (known) { C11.menu.note = 'Bạn đã biết nghề này rồi'; return; }
      if (need) { C11.menu.note = need[0].toUpperCase() + need.slice(1) + '. Trò chuyện, tặng quà, làm việc giúp họ'; return; }
      if (!c11Money2(S.fee)) { C11.menu.note = 'Chưa đủ tiền học phí'; return; }
      SAVE11.skill[id] = SAVE11.day; persist11(); C11.menu = null; c11Say(v, S.say[SAVE11.day % S.say.length]); c11Msg(`Đã học: ${S.name}`, '#2f6a4c'); } });
  }
  C11.menu = { title: p.name, note: '', cols: 1, rows };
};

/* ---------- the list of trades and animals ---------- */
function c11OpenSkills() {
  const rows = Object.keys(C11_SKILLS).map(id => { const S = C11_SKILLS[id], t = c11TeacherOf(id), known = c11Know(id); return { name: known ? `${S.name} ✓` : S.name, sub: known ? S.desc : `${t ? t.name : '?'}${t ? ` · ♥${S.hearts} · ${c11WhereText(t)}` : ''}`, tag: known ? 'Đã biết' : `Học phí ${c4Money(S.fee)}`, ok: !known, f: () => { C11.menu.note = known ? S.desc : `${t ? t.name : 'Người dạy'}: ${S.desc}`; } }; });
  for (const k of Object.keys(C11_PENS)) { const P = C11_PENS[k], n = SAVE11.pens.filter(q => q.kind === k).length, an = SAVE11.herd.filter(h => C11_ANIMALS[h.kind].pen === k); rows.push({ name: `${P.name}: ${n}`, sub: an.length ? an.map(h => `${h.nm} (${h.age} ngày${h.age >= C11_ANIMALS[h.kind].adult ? ', lớn' : ''}${h.fed ? '' : ', đói'})`).join(', ') : 'chưa nuôi con nào', tag: '', ok: n > 0, f: () => { C11.menu.note = `Chứa tối đa ${P.cap * Math.max(1, n)} con`; } }); }
  C11.menu = { title: 'Nghề và thú nuôi', note: 'Muốn học nghề, tìm thầy rồi làm quen, tặng quà', cols: 1, rows };
}
function c11SlotNote(i) { const t = C11_SLOTS[i]; if (!c11Has(t)) { const sh = C11_SHOPS.find(s => (s.tools || []).includes(t)), p = sh && C11_PPL.find(q => c11WhoIs(q, sh.who)); c11Msg(`Chưa có ${C11_TOOLS[t].name.toLowerCase()}${p ? `: mua ở ${p.name}` : ''}`, '#5b2f1f'); } }

/* ---------- pens and the herd ---------- */
const c11PenAt = (x, y) => SAVE11.pens.find(q => x >= q.x && x < q.x + 3 && y >= q.y && y < q.y + 2);
const c11PenOf = h => SAVE11.pens.find(q => q.id === h.pen);
function c11HerdBuild() {                                                                 // the animals that live on the farm join the beasts at home
  if (!C11.beasts) return; C11.beasts = C11.beasts.filter(b => !b.herd);
  if (C11.area !== 'ruong') return;
  for (const h of SAVE11.herd) { const P = c11PenOf(h); if (!P) continue; const A = C11_ANIMALS[h.kind];
    C11.beasts.push({ kind: h.kind, x: P.x + .8 + Math.random() * 1.4, y: P.y + .9 + Math.random() * .5, col: ['#c119a5a', '#f2ecde', '#8a5a3a'][h.id % 3], herd: h, box: [P.x, P.y, P.x + 2, P.y + 1], young: h.age < A.adult, face: h.id % 2 ? -1 : 1, ph: 0, moving: false, to: null, wait: 1 + (h.id % 4), dn: 0, peck: 0 }); }
}
const c11BeastsBase = c11Beasts;
c11Beasts = function () { c11BeastsBase(); c11HerdBuild(); };
const c11BeastBase = c11Beast;
c11Beast = function (g, b, X, Y, u) { if (b.kind === 'vit') { g.fillStyle = 'rgba(29,25,21,.18)'; g.beginPath(); g.ellipse(X, Y, 10 * u, 3 * u, 0, 0, 6.283); g.fill(); c11Duck(g, X, Y, u * .8, b.face, b.herd ? b.herd.id % 2 === 0 : false); return; } c11BeastBase(g, b, X, Y, u); };
function c11BuyAnimal(k) {
  const A = C11_ANIMALS[k], P = C11_PENS[A.pen];
  if (!c11Know(A.skill)) { C11.menu.note = `Phải học "${C11_SKILLS[A.skill].name}" trước`; return; }
  if (SAVE4.money < A.price) { C11.menu.note = 'Chưa đủ tiền'; return; }
  const pen = SAVE11.pens.find(q => q.kind === A.pen && SAVE11.herd.filter(h => h.pen === q.id).length < P.cap);
  if (!pen) { C11.menu.note = SAVE11.pens.some(q => q.kind === A.pen) ? 'Chuồng đã đầy' : `Nhà bạn chưa có ${P.name.toLowerCase()}`; return; }
  c11Money2(A.price);
  const nm = C11_NAMES[k][SAVE11.uid % C11_NAMES[k].length] + ' ' + (1 + SAVE11.herd.filter(h => h.kind === k).length);
  SAVE11.herd.push({ id: SAVE11.uid++, kind: k, nm, age: 0, fed: 1, hung: 0, pen: pen.id }); persist11(); c11HerdBuild(); C11.menu.note = `${nm} về chuồng của bạn`; C11.menu.rows = c11ToolRows(C11.menu.shop);
}
function c11BuildMenu(tx, ty) {
  const key = c11Pre() + tx + ',' + ty, cleared = !!(SAVE11.clear[key]), rows = [];
  rows.push({ name: 'Giàn tre', sub: c11Know('dan') ? (cleared ? `${C11_DAN_WOOD} gỗ · cho mướp, đậu leo` : 'Cắt cỏ chỗ này trước đã') : 'Phải học "Bắc giàn" trước', price: 0, tag: `${C11_DAN_WOOD} gỗ`, ok: c11Know('dan') && cleared, f: () => {
    if (!c11Know('dan')) { C11.menu.note = 'Phải học "Bắc giàn" trước'; return; } if (!cleared) { C11.menu.note = 'Cắt cỏ chỗ này trước đã'; return; }
    if (!c11Take('go', C11_DAN_WOOD)) { C11.menu.note = `Cần ${C11_DAN_WOOD} gỗ trong túi`; return; }
    c11Spend(C11_COST.dan); SAVE11.tiles[key] = { dan: 1, wet: 0, crop: null, age: 0 }; C11.menu = null; c11Dots(tx, ty, '#c89a5e', 8); c11Chips(tx, ty - .3, C11.face * -1, 8); persist11(); } });
  for (const k of Object.keys(C11_PENS)) { const P = C11_PENS[k], ok = P.skills.every(c11Know);
    rows.push({ name: P.name, sub: ok ? `${P.wood} gỗ · nuôi được ${P.cap} con, chiếm 3×2 ô` : `phải học ${P.skills.filter(s => !c11Know(s)).map(s => `"${C11_SKILLS[s].name}"`).join(' và ')}`, price: 0, tag: `${P.wood} gỗ`, ok, f: () => {
      if (!ok) { C11.menu.note = 'Chưa đủ nghề để đóng chuồng này'; return; }
      if (C11.area !== 'ruong') { C11.menu.note = 'Chỉ đóng chuồng ở nhà mình'; return; }
      for (let y = ty; y < ty + 2; y++) for (let x = tx; x < tx + 3; x++) if (x < 1 || y < 1 || x >= C11_W - 1 || y >= C11_H - 1 || c11Kind(x, y) !== 'g' || SAVE11.tiles[x + ',' + y] || c11PenAt(x, y)) { C11.menu.note = 'Chỗ này không đủ rộng, chọn bãi cỏ trống 3×2 ô'; return; }
      if (!c11Take('go', P.wood)) { C11.menu.note = `Cần ${P.wood} gỗ trong túi`; return; }
      c11Spend(C11_COST.dan * 2); SAVE11.pens.push({ id: SAVE11.uid++, kind: k, x: tx, y: ty }); for (let y = ty; y < ty + 2; y++) for (let x = tx; x < tx + 3; x++) SAVE11.clear[x + ',' + y] = SAVE11.day;
      C11.menu = null; for (let i = 0; i < 6; i++) c11Dots(tx + i % 3, ty + (i / 3 | 0), '#c89a5e', 5); persist11(); c11Msg(`Đã đóng ${P.name.toLowerCase()}`, '#2f6a4c'); } }); }
  C11.menu = { title: 'Đóng gì ở đây?', note: 'Búa đục · gỗ lấy từ cây chặt ở rừng, ở nhà', cols: 1, rows };
}
function c11PenMenu(pen) {
  const P = C11_PENS[pen.kind], an = SAVE11.herd.filter(h => h.pen === pen.id);
  C11.menu = { title: P.name, note: '', cols: 1, rows: [{ name: `Đang nuôi ${an.length}/${P.cap} con`, sub: an.map(h => `${h.nm}${h.fed ? '' : ' (đói)'}`).join(', ') || 'Chưa có con nào, mua con giống ở người bán', tag: '', ok: true, f: () => {} },
    { name: 'Dỡ chuồng', sub: an.length ? 'Phải bán hết súc vật trước' : `lấy lại ${P.wood >> 1} gỗ`, tag: '', ok: !an.length, f: () => {
      if (an.length) { C11.menu.note = 'Còn súc vật trong chuồng'; return; } SAVE11.pens.splice(SAVE11.pens.indexOf(pen), 1); const left = c11Add('go', P.wood >> 1); persist11(); C11.menu = null; c11Msg(`Dỡ chuồng, được ${(P.wood >> 1) - left} gỗ`, '#5b2f1f'); } }] };
}
const c11HerdAt = (tx, ty) => (C11.beasts || []).find(b => b.herd && Math.abs(b.x - (tx + .5)) < .95 && Math.abs(b.y - (ty + .5)) < 1.1);
function c11FeedHerd(b) {
  const h = b.herd, A = C11_ANIMALS[h.kind], it = c11HandItem(), tool = c11HandTool(), at = A.adult - h.age;
  if (it && (tool === 'item' || tool === 'seed')) {
    if (!A.feed.includes(it.id)) { c11Pop(Math.floor(b.x), Math.floor(b.y) - 1, `${h.nm} không ăn ${C11_ITEMS[it.id].name.toLowerCase()}`, '#5b2f1f'); return; }
    if (h.fed) { c11Pop(Math.floor(b.x), Math.floor(b.y) - 1, `${h.nm} no rồi`, '#5b2f1f'); return; }
    c11Take(it.id, 1); h.fed = 1; h.hung = 0; c11Spend(.5); c11Dots(Math.floor(b.x), Math.floor(b.y) - .3, '#c8a060', 6, .6); c11Pop(Math.floor(b.x), Math.floor(b.y) - 1, `${h.nm} ăn ngon lành`, '#2f6a4c'); persist11(); return;
  }
  c11Msg(`${h.nm}: ${h.fed ? 'đã ăn' : 'đang đói, cho ăn ' + A.feed.slice(0, 3).map(i => C11_ITEMS[i].name.toLowerCase()).join(', ')} · ${h.age} ngày${at > 0 ? `, còn ${at} ngày nữa mới lớn` : ', đã lớn'}`, h.fed ? '#2f6a4c' : '#a3332a');
}

/* ---------- fishing: cast, wait, a bite, pull in ---------- */
const C11_FISH = {
  ruong: [['ca_diec', 3], ['ca_bong', 3], ['ca_ro', 2], ['rac', 1], ['ca_me', 1, 1]], lang: [['ca_diec', 3], ['ca_bong', 3], ['ca_ro', 2], ['rac', 1], ['ca_me', 1.5, 1]],
  ben: [['ca_chep', 3], ['ca_tre', 2.4], ['ca_me', 2], ['ca_bong', 2], ['ca_qua', 1.4, 1], ['ca_tram', 1, 2], ['rac', 1], ['ngoc_trai', .15, 3]],
};
const c11FishLevel = () => Math.min(5, Math.floor(Math.sqrt(SAVE11.fishN)));
function c11Cast(tx, ty) {
  if (C11.fish) return;
  if (!c11Know('cau')) { c11Pop(tx, ty - 1, 'Chưa biết câu, tìm người chài lưới học đi', '#5b2f1f'); return; }
  c11Spend(C11_COST.rod); const [px, py] = c11Tile();
  C11.fish = { tx, ty, px: C11.px, py: C11.py, t: 0, wait: 2.5 + Math.random() * 3.5, bite: 0, st: 'wait' }; C11.face = tx + .5 < C11.px ? -1 : 1; c11Dots(tx, ty, '#7fb0c4', 6, .5);
}
function c11FishTap() {
  const f = C11.fish; if (!f) return false;
  if (f.st === 'bite') { c11Catch(f); } else { c11Pop(f.tx, f.ty - 1, 'Kéo dây về, chưa có gì', '#5b2f1f'); }
  C11.fish = null; return true;
}
function c11Catch(f) {
  const lv = c11FishLevel(), L = (C11_FISH[C11.area] || C11_FISH.ruong).filter(r => (r[2] || 0) <= lv), tot = L.reduce((s, r) => s + r[1], 0);
  let q = Math.random() * tot, id = L[0][0]; for (const r of L) { q -= r[1]; if (q <= 0) { id = r[0]; break; } }
  SAVE11.fishN++; SAVE11.dex[id] = (SAVE11.dex[id] || 0) + 1;
  if (c11Add(id, 1)) c11Drop(id, 1, f.tx, f.ty); c11Dots(f.tx, f.ty, '#bfe0ea', 12, 1.8);
  c11Pop(f.tx, f.ty - 1, id === 'rac' ? `Vướng ${C11_ITEMS[id].name.toLowerCase()}` : `Được ${C11_ITEMS[id].name.toLowerCase()}!`, id === 'rac' ? '#5b2f1f' : '#2f6a4c'); persist11();
}

/* ---------- digging: a find now and then, one hole a day ---------- */
const C11_DIG = {
  all: [['dat_set', 3], ['da', 3], ['soi', 3], ['cat', 2], ['manh_sanh', 2], ['cu_mai', .6], ['tien_dong', .22], ['tien_bao_dai', .2], ['vong_bac', .03]],
  dinh: [['tien_dong', 1.2], ['tien_bao_dai', 1], ['bat_men_lam', .12], ['tram_cai', .08]], ben: [['cat', 3], ['soi', 2], ['ngoc_trai', .1], ['dat_set', 2]],
};
function c11Dig(tx, ty, key) {
  if (SAVE11.dug[key]) { c11Pop(tx, ty - 1, 'Đào rồi, mai đào tiếp', '#5b2f1f'); return; }
  c11Spend(C11_COST.shovel); SAVE11.dug[key] = SAVE11.day; c11Dots(tx, ty, '#7a4a28', 10, 1.2); c11Chips(tx, ty - .1, C11.face * -1, 5);
  if (Math.random() < .3) { c11Pop(tx, ty - 1, 'Chỉ thấy đất', '#5b2f1f'); return; }
  const L = [...(C11_DIG[C11.area] || []), ...C11_DIG.all], tot = L.reduce((s, r) => s + r[1], 0); let q = Math.random() * tot, id = L[0][0]; for (const r of L) { q -= r[1]; if (q <= 0) { id = r[0]; break; } }
  c11Drop(id, 1, tx, ty); c11Pop(tx, ty - 1, `Đào được ${C11_ITEMS[id].name.toLowerCase()}`, '#2f6a4c'); persist11();
}

/* ---------- hooks used by nongtrai.js ---------- */
function c11ActNew(tx, ty, tool, k, key) {
  const hb = c11HerdAt(tx, ty); if (hb && !'DBCSNQUTYZ'.includes(k)) { c11FeedHerd(hb); return true; }
  if (tool === 'rod') { if (k === 'w') { c11Cast(tx, ty); } return true; }
  if (tool === 'shovel') { if (c11DigOk(tx, ty, k)) c11Dig(tx, ty, key); return true; }
  if (tool === 'dan' && (k === 'g' || k === 'f')) {
    if (C11.area !== 'ruong') { c11Pop(tx, ty - 1, 'Chỉ bắc giàn, đóng chuồng ở nhà mình', '#5b2f1f'); return true; }
    const pen = c11PenAt(tx, ty); if (pen) { c11PenMenu(pen); return true; }
    const s = SAVE11.tiles[key]; if (s) { c11Pop(tx, ty - 1, s.dan ? 'Đã có giàn rồi' : 'Đất đã cuốc, đóng ở chỗ cỏ', '#5b2f1f'); return true; }
    c11BuildMenu(tx, ty); return true;
  }
  return false;
}
const c11DigOk = (tx, ty, k) => (k === 'g' || k === 'p' || k === 'q') && !SAVE11.tiles[c11Pre() + tx + ',' + ty] && !c11PenAt(tx, ty);
function c11CanNew(tx, ty, tool, k) {
  if (c11HerdAt(tx, ty) && !'DBCSNQUTYZ'.includes(k)) return true;
  if (tool === 'rod') return k === 'w' && !C11.fish;
  if (tool === 'shovel') return c11DigOk(tx, ty, k);
  if (tool === 'dan') return (k === 'g' || k === 'f') && C11.area === 'ruong' && !SAVE11.tiles[c11Pre() + tx + ',' + ty];
  return undefined;
}
function c11NewDayNew() {
  SAVE11.dug = {}; const eggs = [];
  for (const h of SAVE11.herd) {
    const A = C11_ANIMALS[h.kind], P = c11PenOf(h); if (!P) continue; h.age++;
    if (h.fed) {
      h.hung = 0; const adult = h.age >= A.adult; let id = null;
      if (adult && h.kind === 'ga' && Math.random() < .8) id = 'trung_ga'; else if (adult && h.kind === 'vit' && Math.random() < .7) id = 'trung_vit'; else if (adult && h.kind === 'bo') id = 'sua_bo'; else if (h.kind === 'trau' && adult && Math.random() < .35) id = 'phan_chuong';
      if (id) eggs.push([id, P]);
      if (Math.random() < .25) eggs.push(['phan_chuong', P]);
    } else if (++h.hung >= 5) { h.gone = 1; }
    h.fed = 0;
  }
  const lost = SAVE11.herd.filter(h => h.gone); SAVE11.herd = SAVE11.herd.filter(h => !h.gone); if (lost.length) C11.herdMsg = `${lost[0].nm} bỏ đi vì bị đói quá lâu`;
  for (const [id, P] of eggs) SAVE11.drops.push({ k: id, a: 'ruong', x: P.x + .6 + Math.random() * 1.8, y: P.y + 2.1 + Math.random() * .3, x0: P.x + 1.5, y0: P.y + 1, t: 0, dur: .5, h: .6 });
  c11HerdBuild();
}
function c11NewUpdate(dt) {
  const G = C11;
  if (!SAVE11.gift) { SAVE11.gift = 1; SAVE4.money += 100; persist4(); persist11(); c11Msg('Bà con góp vốn cho 1 quan 100 đồng, mua cuốc và bình tưới ở lò rèn nhé', '#2f6a4c'); }
  if (G.herdMsg && !G.msg) { c11Msg(G.herdMsg, '#a3332a'); G.herdMsg = null; }
  const f = G.fish; if (!f) return;
  if (G.area !== 'ruong' && G.area !== f.area && f.area) { G.fish = null; return; } f.area = G.area;
  if (Math.hypot(G.px - f.px, G.py - f.py) > .6 || G.sleep || G.menu) { G.fish = null; c11Pop(f.tx, f.ty - 1, 'Cá sợ chạy mất', '#5b2f1f'); return; }
  f.t += dt;
  if (f.st === 'wait' && f.t > f.wait) { f.st = 'bite'; f.t = 0; f.bite = 1.2 + Math.random() * .5; c11Dots(f.tx, f.ty, '#bfe0ea', 6, 1); }
  else if (f.st === 'bite' && f.t > f.bite) { c11Pop(f.tx, f.ty - 1, 'Cá nhả mồi rồi', '#5b2f1f'); G.fish = null; }
}
function c11NewDraw(E, g, sx, sy, k, T) {
  const G = C11;
  for (const key of Object.keys(SAVE11.dug)) {                                           // a hole dug today
    const pre = c11Pre(); if (pre ? !key.startsWith(pre) : key.includes(':')) continue; const [x, y] = key.slice(pre.length).split(',').map(Number);
    E.push({ y: y - .4, d: () => { g.fillStyle = 'rgba(70,40,20,.5)'; g.beginPath(); g.ellipse(sx(x + .5), sy(y + .62), T * .3, T * .1, 0, 0, 6.283); g.fill(); g.fillStyle = '#8a5a38'; g.beginPath(); g.ellipse(sx(x + .5) + T * .1, sy(y + .55), T * .22, T * .08, 0, 0, 6.283); g.fill(); } });
  }
  if (G.area === 'ruong') for (const P of SAVE11.pens) {
    const x0 = sx(P.x), x1 = sx(P.x + 3), yb = sy(P.y + 2), yt = sy(P.y), straw = P.kind === 'ga' ? '#e2c880' : '#d8b878';
    E.push({ y: P.y - .5, d: () => { g.fillStyle = straw; g.globalAlpha = .6; g.beginPath(); g.roundRect(x0, yt, x1 - x0, yb - yt, T * .1); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = '#7a5530'; g.lineWidth = Math.max(2, T * .06); g.beginPath(); g.moveTo(x0, yt); g.lineTo(x1, yt); g.stroke();
      for (let i = 0; i <= 6; i++) { const X = x0 + (x1 - x0) * i / 6; g.beginPath(); g.moveTo(X, yt); g.lineTo(X, yt - T * .32); g.stroke(); } g.beginPath(); g.moveTo(x0, yt - T * .2); g.lineTo(x1, yt - T * .2); g.stroke(); } });
    E.push({ y: P.y + 2.05, d: () => { g.strokeStyle = '#7a5530'; g.lineWidth = Math.max(2, T * .06); g.beginPath(); g.moveTo(x0, yb); g.lineTo(x1, yb); g.stroke(); g.beginPath(); g.moveTo(x0, yb - T * .2); g.lineTo(x1, yb - T * .2); g.stroke();
      for (let i = 0; i <= 6; i++) { const X = x0 + (x1 - x0) * i / 6; g.beginPath(); g.moveTo(X, yb); g.lineTo(X, yb - T * .3); g.stroke(); }
      g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 1.6; const lw = T * .9; g.beginPath(); g.roundRect((x0 + x1) / 2 - lw / 2, yb + 2, lw, T * .26, 4); g.fill(); g.stroke(); g.fillStyle = INK; g.font = `700 ${Math.max(8, T * .15) | 0}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(`${SAVE11.herd.filter(h => h.pen === P.id).length}/${C11_PENS[P.kind].cap}`, (x0 + x1) / 2, yb + 2 + T * .13); } });
  }
  const f = G.fish;
  if (f) E.push({ y: f.ty + .6, d: () => {
    const bx = sx(f.tx + .5), by = sy(f.ty + .55), px = sx(G.px) + G.face * T * .5, py = sy(G.py) - T * 1.15, bite = f.st === 'bite', bob = bite ? Math.sin(G.t * 40) * 3 + 4 : Math.sin(G.t * 2.4) * 1.5;
    g.strokeStyle = 'rgba(29,25,21,.65)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo((px + bx) / 2, Math.min(py, by) - T * .5, bx, by + bob); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.4; for (const r of [.16, .28]) { g.beginPath(); g.ellipse(bx, by + 3, T * r * (1 + (G.t * 1.5 % 1) * .4), T * r * .35, 0, 0, 6.283); g.stroke(); }
    g.fillStyle = '#f4f0e0'; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.arc(bx, by + bob, T * .07, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = '#c8392d'; g.beginPath(); g.arc(bx, by + bob - T * .04, T * .045, Math.PI, 0); g.fill();
    if (bite) { g.fillStyle = '#c8392d'; g.font = `900 ${T * .6 | 0}px "Playfair Display", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.strokeStyle = '#fbf4dc'; g.strokeText('!', sx(G.px), sy(G.py) - T * 1.9); g.fillText('!', sx(G.px), sy(G.py) - T * 1.9); }
  } });
}

/* ---------- the shovel and the rod, in the bar and in the hand ---------- */
function c11ToolIcon(g, id, cx, cy) {
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (id === 'shovel') {
    g.strokeStyle = '#5b2f1f'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 10, cy + 16); g.lineTo(cx + 6, cy - 12); g.stroke(); g.beginPath(); g.moveTo(cx + 1, cy - 15); g.lineTo(cx + 13, cy - 8); g.stroke();
    g.fillStyle = '#8a9296'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx + 2, cy - 4); g.lineTo(cx + 16, cy + 6); g.quadraticCurveTo(cx + 16, cy + 18, cx + 6, cy + 20); g.quadraticCurveTo(cx - 2, cy + 12, cx + 2, cy - 4); g.closePath(); g.fill(); g.stroke();
  } else {
    g.strokeStyle = '#7a5530'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(cx - 14, cy + 16); g.quadraticCurveTo(cx + 2, cy - 4, cx + 18, cy - 15); g.stroke();
    g.strokeStyle = 'rgba(29,25,21,.7)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(cx + 18, cy - 15); g.quadraticCurveTo(cx + 22, cy, cx + 14, cy + 10); g.stroke();
    g.fillStyle = '#c8392d'; g.strokeStyle = INK; g.lineWidth = 1.6; g.beginPath(); g.arc(cx + 14, cy + 11, 3.6, 0, 6.283); g.fill(); g.stroke();
  }
  g.restore();
}
const c11ToolBase = c11Tool;
c11Tool = function (g, tool, hx, hy, phi) {
  if (tool !== 'shovel' && tool !== 'rod') { c11ToolBase(g, tool, hx, hy, phi); return; }
  g.save(); g.translate(hx, hy); g.rotate(phi); g.lineCap = 'round'; g.lineJoin = 'round';
  if (tool === 'shovel') {
    const L = 66; g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(0, 14); g.lineTo(0, -L); g.stroke(); g.strokeStyle = '#a06a3c'; g.lineWidth = 4.5; g.beginPath(); g.moveTo(0, 14); g.lineTo(0, -L); g.stroke();
    g.fillStyle = '#8a9296'; g.strokeStyle = INK; g.lineWidth = 2.8; g.beginPath(); g.moveTo(-8, -L - 2); g.lineTo(8, -L - 2); g.lineTo(11, -L + 22); g.quadraticCurveTo(0, -L + 34, -11, -L + 22); g.closePath(); g.fill(); g.stroke();
  } else {
    const L = 96; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 14); g.quadraticCurveTo(10, -L * .5, 26, -L); g.stroke(); g.strokeStyle = '#a07838'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 14); g.quadraticCurveTo(10, -L * .5, 26, -L); g.stroke();
    g.strokeStyle = 'rgba(29,25,21,.6)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(26, -L); g.lineTo(30, -L + 40); g.stroke();
  }
  g.restore();
};
