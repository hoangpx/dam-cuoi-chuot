/* Chương XI · chickens for the pot or the coop (owner 2026-11-01: "gà khi có dao có thể làm thịt, hoặc khi học được kỹ năng thuần hoá có
   thể bắt gà cho vào chuồng để nuôi"; eggs and selling grown animals were already there, slaughter was not).
   - KNIFE: a 'dao_phay' (cleaver) sold at bác Năm Thọ's forge. Holding it, a tap on a wild hen or cock on the home farm (close by)
     makes meat at once ('thit_ga'); that bird is gone until the next morning (SAVE11.gaKill). Holding it, a tap on a grown animal in
     a pen asks first, then gives its meat (pigs, cows and buffalo more than one piece).
   - TAMING: the skill 'thuan' (chị Dậu, 4 hearts, after "Nuôi gà vịt"). With it, a tap on a wild hen or cock (no knife in hand) catches
     it into a coop with room; it then lives there like a bought one (eggs, feeding, selling). */
const GA_WILD = ['ga', 'trong'];
SAVE11.gaKill = SAVE11.gaKill || {};
for (const [id, name, price, food, col, desc] of [['dao_phay', 'Dao phay', 0, 0, '#8a8a8a', 'Dao to bản, để làm thịt gà vịt, lợn bò.'], ['thit_ga', 'Thịt gà', 40, 30, '#e8b08a', 'Gà ta luộc chấm muối chanh lá chanh.'],
  ['thit_vit', 'Thịt vịt', 55, 28, '#d8a07a', 'Vịt luộc chấm mắm gừng.'], ['thit_lon', 'Thịt lợn', 70, 34, '#e89a8a', 'Thịt ba chỉ, luộc hay kho đều ngon.'], ['thit_bo', 'Thịt bò', 110, 40, '#b85a4a', 'Bò tái chanh, bò xào lá lốt.'], ['thit_trau', 'Thịt trâu', 100, 40, '#9a4a3a', 'Trâu gác bếp, trâu xào cần.']])
  if (!C11_ITEMS[id]) C11_ITEMS[id] = { id, name, cat: id === 'dao_phay' ? 'do' : 'thu', price, food, col, desc };
const GA_MEAT = { ga: ['thit_ga', 1], vit: ['thit_vit', 1], lon: ['thit_lon', 3], bo: ['thit_bo', 4], trau: ['thit_trau', 4] };
C11_SKILLS.thuan = { name: 'Thuần hoá gà', who: 'chidau', hearts: 4, fee: 120, desc: 'Bắt được gà thả rông ngoài vườn đem về chuồng nuôi.', say: ['Gà nhà thả rông quen hơi người, rắc nắm thóc rồi khẽ khàng mà bế.', 'Bế gà phải ôm cánh, đừng túm chân, nó hoảng là bay mất.'] };
/* the cleaver's picture: a broad blade on a wooden handle */
(() => { const old = c11ItemIcon; c11ItemIcon = function (g, id, cx, cy, sz, n) {
  if (id !== 'dao_phay') return old(g, id, cx, cy, sz, n);
  const u = sz / 40; g.save(); g.translate(cx, cy); g.rotate(-.5); g.lineJoin = 'round'; g.strokeStyle = INK; g.lineWidth = 1.4;
  g.fillStyle = '#8a5a34'; g.beginPath(); g.roundRect(-16 * u, -2.5 * u, 12 * u, 5 * u, 2 * u); g.fill(); g.stroke();
  g.fillStyle = '#c8ccd0'; g.beginPath(); g.moveTo(-4 * u, -4 * u); g.lineTo(15 * u, -6 * u); g.lineTo(15 * u, 8 * u); g.lineTo(-4 * u, 4 * u); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(0, -3.4 * u, 13 * u, 1.6 * u); g.restore();
}; })();
/* butchering the big animals takes a butcher's skill (owner: "trâu bò lợn cần kỹ năng làm thịt cao"): pigs need Mổ lợn, cows and buffalo
   the higher Mổ trâu bò; both taught by the village butcher (đồ tể). Chickens and ducks need no skill. */
C11_SKILLS.mo = { name: 'Mổ lợn', who: 'trade:đồ tể', hearts: 4, fee: 200, desc: 'Biết chọc tiết, cạo lông, pha thịt lợn.', say: ['Dao phải sắc, nước phải sôi, tay phải vững, thế là xong con lợn.', 'Pha thịt theo thớ, miếng nào ra miếng ấy.'] };
C11_SKILLS.mo2 = { name: 'Mổ trâu bò', who: 'trade:đồ tể', hearts: 7, fee: 600, desc: 'Nghề khó nhất của đồ tể: mổ trâu bò, lóc thịt, giữ da.', say: ['Con trâu to gấp mười con lợn, phải có người giữ, có sức mới làm nổi.', 'Lóc thịt bò theo từng tảng, da để nguyên mà bán.'] };
const GA_SKILL = { lon: 'mo', bo: 'mo2', trau: 'mo2' };
const gaKnife = () => { const it = c11HandItem(); return it && it.id === 'dao_phay'; };
const gaHasKnife = () => c11Count('dao_phay') > 0 || SAVE11.chest.some(s => s && s.id === 'dao_phay');
(() => {
  /* the forge sells the cleaver */
  const oldRows = c11ToolRows;
  c11ToolRows = function (shop) {
    const rows = oldRows(shop);
    if (shop.who === 'tho') { const has = gaHasKnife(); rows.push({ name: 'Dao phay', sub: has ? 'Đã có' : 'cầm dao chạm vào gà, vịt, lợn, bò để làm thịt', price: 250, ok: !has && SAVE11.money >= 250, f: () => {
      if (gaHasKnife()) { C11.menu.note = 'Bạn đã có dao rồi'; return; } if (SAVE11.money < 250) { C11.menu.note = 'Chưa đủ tiền'; return; }
      if (c11Add('dao_phay', 1)) { C11.menu.note = 'Túi đầy rồi'; return; } c11Money2(250); C11.menu.note = 'Đã mua dao phay'; C11.menu.rows = c11ToolRows(shop); } }); }
    return rows;
  };
  /* birds killed today stay gone until the next morning */
  const oldBeasts = c11Beasts;
  c11Beasts = function () {
    oldBeasts();
    const L = C11_BEASTS[C11.area] || []; let i = 0;
    for (const b of C11.beasts) { if (b.herd) continue; while (i < L.length && L[i][0] !== b.kind) i++; b.bi = i++; }
    C11.beasts = C11.beasts.filter(b => b.herd || SAVE11.gaKill[C11.area + ':' + b.bi] !== SAVE11.day);
  };
  const near = b => Math.hypot(b.x - C11.px, b.y - C11.py) < 2.2;
  const gaPen = () => SAVE11.pens.find(q => q.kind === 'ga' && SAVE11.herd.filter(h => h.pen === q.id).length < C11_PENS.ga.cap);
  const oldTap = c11Tap;
  c11Tap = function (tx, ty, wx, wy) {
    if (C11.sleep || C11.menu || C11.fence || (typeof C11O !== 'undefined' && C11O.visit) || C11.area !== 'ruong') return oldTap(tx, ty, wx, wy);
    const hit = (C11.beasts || []).find(b => b !== C11.carry && Math.abs(wx - b.x) < .8 && wy > b.y - 1.2 && wy < b.y + .35);
    if (hit && gaKnife()) {
      if (!near(hit)) { c11Msg('Lại gần hơn nữa', '#5b2f1f'); return; }
      if (!hit.herd && GA_WILD.includes(hit.kind)) {                         // a wild bird: meat at once
        SAVE11.gaKill[C11.area + ':' + hit.bi] = SAVE11.day; C11.beasts = C11.beasts.filter(b => b !== hit);
        c11Drop('thit_ga', 1, Math.floor(hit.x), Math.floor(hit.y)); c11Dots(Math.floor(hit.x), Math.floor(hit.y) - .3, '#f2ecde', 14, 1.6); c11Spend(1); c11Xp && c11Xp(4);
        c11Pop(Math.floor(hit.x), Math.floor(hit.y) - 1, 'Được thịt gà', '#5b2f1f'); persist11(); return;
      }
      if (hit.herd && GA_MEAT[hit.herd.kind]) {                                // a kept animal: ask first
        const h = hit.herd, A = C11_ANIMALS[h.kind], [meat, n] = GA_MEAT[h.kind];
        if (h.age < A.adult) { c11Msg(`${h.nm} còn bé quá, chưa làm thịt được`, '#5b2f1f'); return; }
        const need = GA_SKILL[h.kind]; if (need && !c11Know(need)) { { const t = c11TeacherOf(need); c11Msg(`Phải học "${C11_SKILLS[need].name}" ở ${t ? t.name + ' (đồ tể)' : 'người đồ tể'} mới làm thịt được`, '#a3332a'); } return; }
        C11.menu = { title: `Làm thịt ${h.nm}?`, note: `Được ${n} ${C11_ITEMS[meat].name.toLowerCase()} · bán sống được ${c4Money(A.sell)}`, cols: 1, rows: [
          { name: 'Làm thịt', sub: 'không làm lại được', tag: ' ', ok: true, f: () => { const i = SAVE11.herd.indexOf(h); if (i < 0) return; SAVE11.herd.splice(i, 1); c11HerdBuild(); C11.menu = null;
            c11Drop(meat, n, Math.floor(hit.x), Math.floor(hit.y)); c11Spend(2); c11Xp && c11Xp(6); c11Msg(`Được ${n} ${C11_ITEMS[meat].name.toLowerCase()}`, '#5b2f1f'); persist11(); } },
          { name: 'Thôi', sub: 'để nuôi tiếp', tag: ' ', ok: true, f: () => { C11.menu = null; } }] };
        return;
      }
    }
    if (hit && !hit.herd && GA_WILD.includes(hit.kind) && c11Know('thuan') && !gaKnife() && c11HandTool() !== 'sickle') {   // taming: into the coop
      if (!near(hit)) { c11Msg('Lại gần hơn nữa', '#5b2f1f'); return; }
      const pen = gaPen(); if (!pen) { c11Msg(SAVE11.pens.some(q => q.kind === 'ga') ? 'Chuồng gà đã đầy' : 'Chưa có chuồng gà vịt để nhốt', '#a3332a'); return; }
      SAVE11.gaKill[C11.area + ':' + hit.bi] = SAVE11.day; C11.beasts = C11.beasts.filter(b => b !== hit);
      const nm = C11_NAMES.ga[SAVE11.uid % C11_NAMES.ga.length] + ' ' + (1 + SAVE11.herd.filter(q => q.kind === 'ga').length);
      SAVE11.herd.push({ id: SAVE11.uid++, kind: 'ga', nm, age: C11_ANIMALS.ga.adult, fed: 0, hung: 0, pen: pen.id }); c11HerdBuild(); c11Xp && c11Xp(5);
      c11Msg(`Bắt được gà, đã nhốt vào chuồng: ${nm}`, '#2f6a4c'); persist11(); return;
    }
    return oldTap(tx, ty, wx, wy);
  };
  /* a new day: yesterday's killed or caught birds come back (a fresh one wanders in) */
  const oldDay = c11NewDayNew;
  c11NewDayNew = function () { for (const k of Object.keys(SAVE11.gaKill)) if (SAVE11.gaKill[k] < SAVE11.day) delete SAVE11.gaKill[k]; return oldDay(); };
})();
