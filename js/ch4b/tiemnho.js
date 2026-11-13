/* Chương IV phần 2 · Phố Huyện: selling by hand at any shop we run, the same game as têm trầu (owner, 2026-11-06: "làm như têm trầu cơ
   mà"). It runs on têm trầu's own engine (temtrau.js: the view from inside the shop over the counter to the river, customers queueing
   with an order bubble of little pictures and a patience bar, two trays to build on, dragged to the customer, a tip for speed), with
   the shop's own pieces and recipes (P4_MINI[game]), drawn by p4ShopIcon. While a shop's shift runs, P4T.shop is set: têm trầu's lists
   P4_TEM_ING / P4_TEM_RECIPES hold the shop's pieces and wares (put back when it ends), and the functions that know betel rules (adding a
   piece, handing over, the tray, the icons, the shift's clock) are wrapped here; the betel house's game is unchanged.
   The rules for a shop: put the pieces of the order on a tray (any order, each once), drag it to the customer. Right: the shop's price
   for one, plus up to 50 % for speed, one leaves the shop's stock. Wrong: "Không phải thế!", patience lost. 'bo' empties a tray. */
const P4_MINI = {
  buncha: { pieces: [['bun', 'Bún'], ['cha', 'Chả nướng'], ['nuoc', 'Nước chấm'], ['rau', 'Rau sống'], ['nem', 'Nem'], ['da', 'Đá'], ['tra', 'Trà']],
    r: { buncha: ['bun', 'cha', 'nuoc', 'rau'], nem: ['nem', 'nuoc'], trada: ['da', 'tra'] } },
  banhbao: { pieces: [['vo', 'Vỏ bánh'], ['thit', 'Nhân thịt'], ['chay', 'Nhân chay'], ['trung', 'Trứng cút'], ['tom', 'Tôm'], ['xm', 'Xíu mại'], ['sot', 'Nước sốt'], ['hap', 'Hấp'], ['chien', 'Chiên'], ['hanh', 'Hành phi']],
    r: { thit: ['vo', 'thit', 'trung', 'hap'], chay: ['vo', 'chay', 'hap'], xiumai: ['xm', 'sot'], banhvac: ['vo', 'tom', 'hap', 'hanh'], chien: ['vo', 'tom', 'chien'] } },
  comga: { pieces: [['com', 'Cơm'], ['gaxe', 'Gà xé'], ['nuaga', 'Nửa con gà'], ['ram', 'Rau răm'], ['gung', 'Mắm gừng'], ['canh', 'Canh']],
    r: { comga: ['com', 'gaxe', 'ram', 'gung'], galuoc: ['nuaga', 'gung'], canh: ['canh'] } },
  pho: { pieces: [['banh', 'Bánh phở'], ['hu', 'Hủ tiếu'], ['mi', 'Mì'], ['tai', 'Thịt tái'], ['chin', 'Thịt chín'], ['hoanh', 'Hoành thánh'], ['nuoc', 'Nước dùng'], ['hanh', 'Hành'], ['rau', 'Rau'], ['quay', 'Quẩy']],
    r: { tai: ['banh', 'tai', 'nuoc', 'hanh'], chin: ['banh', 'chin', 'nuoc', 'hanh'], quay: ['quay'], hutieu: ['hu', 'chin', 'nuoc', 'hanh'], hoanh: ['hoanh', 'nuoc', 'hanh'], caolau: ['mi', 'chin', 'rau'], miquang: ['mi', 'chin', 'nuoc', 'rau'] } },
  comtam: { pieces: [['com', 'Cơm tấm'], ['suon', 'Sườn'], ['trung', 'Trứng'], ['bi', 'Bì'], ['cha', 'Chả'], ['mo', 'Mỡ hành'], ['mam', 'Nước mắm']],
    r: { suon: ['com', 'suon', 'mo', 'mam'], trung: ['trung'], bicha: ['bi', 'cha'] } },
  che: { pieces: [['coc', 'Cốc'], ['bat', 'Bát'], ['dau', 'Đậu'], ['thach', 'Thạch'], ['dua', 'Nước cốt dừa'], ['da', 'Đá'], ['duong', 'Nước đường']],
    r: { dau: ['coc', 'dau', 'dua', 'da'], thapcam: ['coc', 'dau', 'thach', 'dua', 'da'], nong: ['bat', 'dau', 'duong'] } },
  gao: { pieces: [['thung', 'Thúng'], ['hu', 'Hũ'], ['tam', 'Gạo tám'], ['nep', 'Gạo nếp'], ['muoi', 'Muối'], ['gat', 'Gạt'], ['nap', 'Nắp']],
    r: { gao: ['thung', 'tam', 'gat'], nep: ['thung', 'nep', 'gat'], muoi: ['hu', 'muoi', 'nap'] } },
  thuoc: { pieces: [['giay', 'Giấy gói'], ['lo', 'Lọ'], ['gung', 'Gừng'], ['que', 'Quế'], ['camthao', 'Cam thảo'], ['quy', 'Đương quy'], ['sam', 'Nhân sâm'], ['cao', 'Cao']],
    r: { cam: ['giay', 'gung', 'que', 'camthao'], bo: ['giay', 'quy', 'sam', 'camthao'], cao: ['lo', 'cao'] } },
  giay: { pieces: [['giay', 'Giấy dó'], ['but', 'Bút lông'], ['muc', 'Mực tàu'], ['goi', 'Giấy gói'], ['day', 'Dây buộc']],
    r: { giay: ['giay', 'day'], but: ['but', 'goi'], muc: ['muc', 'goi'] } },
  xen: { pieces: [['kim', 'Kim'], ['chi', 'Chỉ'], ['guong', 'Gương'], ['luoc', 'Lược'], ['khan', 'Khăn'], ['goi', 'Giấy gói']],
    r: { kim: ['kim', 'chi', 'goi'], guong: ['guong', 'luoc', 'goi'], khan: ['khan', 'goi'] } },
  tra: { pieces: [['goi', 'Giấy gói'], ['sen', 'Trà sen'], ['man', 'Trà mạn'], ['day', 'Dây buộc'], ['am', 'Ấm'], ['chen', 'Chén']],
    r: { sen: ['goi', 'sen', 'day'], man: ['goi', 'man', 'day'], am: ['am', 'chen', 'goi'] } },
  may: { pieces: [['do', 'Thước đo'], ['vai', 'Vải'], ['keo', 'Kéo'], ['kim', 'Kim chỉ'], ['khan', 'Khăn'], ['gap', 'Gấp']],
    r: { aodai: ['do', 'vai', 'keo', 'kim'], sua: ['keo', 'kim'], khanxep: ['khan', 'gap'] } },
  vai: { pieces: [['thuoc', 'Thước đo'], ['lua', 'Lụa'], ['vai', 'Vải nâu'], ['the', 'Vải the'], ['keo', 'Kéo'], ['gap', 'Gấp'], ['day', 'Dây buộc']],
    r: { lua: ['thuoc', 'lua', 'keo', 'gap'], vai: ['thuoc', 'vai', 'keo', 'day'], the: ['thuoc', 'the', 'gap'] } },
  gom: { pieces: [['bat', 'Bát'], ['dia', 'Đĩa'], ['binh', 'Bình'], ['am', 'Ấm'], ['rom', 'Rơm lót'], ['giay', 'Giấy gói'], ['day', 'Dây buộc']],
    r: { bat: ['bat', 'dia', 'rom', 'day'], binh: ['binh', 'rom', 'giay'], am: ['am', 'rom', 'giay', 'day'] } },
  vang: { pieces: [['nhan', 'Nhẫn'], ['khuyen', 'Khuyên'], ['vong', 'Vòng'], ['da', 'Đá quý'], ['khan', 'Khăn nhung'], ['hop', 'Hộp gỗ'], ['giay', 'Giấy hồng']],
    r: { nhan: ['nhan', 'hop'], khuyen: ['khuyen', 'khan', 'hop'], vong: ['vong', 'khan', 'hop', 'giay'], daquy: ['da', 'khan', 'hop'] } },
  den: { pieces: [['khung', 'Khung tre'], ['do', 'Giấy đỏ'], ['vang', 'Giấy vàng'], ['canh', 'Cánh sen'], ['ho', 'Hồ dán'], ['nen', 'Nến'], ['tua', 'Tua']],
    r: { tron: ['khung', 'do', 'ho', 'tua'], sen: ['khung', 'canh', 'ho', 'nen'], keo: ['khung', 'vang', 'ho', 'nen', 'tua'], hoa: ['canh', 'nen'] } },
};
// how each piece is drawn: [shape, colour, colour 2]; shapes are painted by P4_ICON_DRAW (r = radius, origin at the middle)
const P4_ICON_OF = {
  buncha: { bun: ['noodle', '#f4efe2'], cha: ['patty', '#8a4a22'], nuoc: ['dip', '#c98a3a'], rau: ['herb', '#4f9a48'], nem: ['roll', '#c9893a'], da: ['ice'], tra: ['leaves', '#6b7a2a'] },
  banhbao: { vo: ['dough', '#f6f0e2'], thit: ['filling', '#a8583a'], chay: ['filling', '#7a9a48'], trung: ['egg'], tom: ['shrimp'], xm: ['balls', '#b8683a'], sot: ['dip', '#c4473a'], hap: ['steam'], chien: ['pan'], hanh: ['bits', '#a8682a'] },
  comga: { com: ['rice', '#f4efe2'], gaxe: ['slices', '#e8c27a'], nuaga: ['chicken'], ram: ['herb', '#3a7a3a'], gung: ['dip', '#d9a03a'], canh: ['soup', '#d9b878'] },
  pho: { banh: ['noodle', '#f4efe2'], hu: ['noodle', '#efe2c4'], mi: ['noodle', '#e8c45a'], tai: ['slices', '#c4605a'], chin: ['slices', '#8a5a3a'], hoanh: ['dumpling'], nuoc: ['liquid', '#c98a3a'], hanh: ['herb', '#6cb85c'], rau: ['herb', '#3a8a40'], quay: ['stick'] },
  comtam: { com: ['rice', '#f2e8cf'], suon: ['rib'], trung: ['egg'], bi: ['bits', '#e8d8a8'], cha: ['patty', '#d9a05a'], mo: ['bits', '#6cb85c'], mam: ['dip', '#b8682a'] },
  che: { coc: ['cup', '#dfe8ea'], bat: ['bowl', '#fbf8ef'], dau: ['beans', '#8a3a2a'], thach: ['jelly', '#6aa86a'], dua: ['liquid', '#fbf8ef'], da: ['ice'], duong: ['liquid', '#c98a3a'] },
  gao: { thung: ['basket'], hu: ['jar', '#9a6a3a'], tam: ['ricelong'], nep: ['riceround'], muoi: ['salt'], gat: ['ruler', '#b57a22'], nap: ['lid', '#9a6a3a'] },
  thuoc: { giay: ['paper', '#e8d8a8'], lo: ['jar', '#3a5a3a'], gung: ['root', '#d9a05a'], que: ['bark', '#8a4a22'], camthao: ['discs', '#e0b43a'], quy: ['discs', '#a8683a'], sam: ['ginseng'], cao: ['cake', '#3a2a1a'] },
  giay: { giay: ['paper', '#f2ecde'], but: ['brush'], muc: ['inkstick'], goi: ['paper', '#d9b878'], day: ['string', '#a3332a'] },
  xen: { kim: ['needle'], chi: ['spool', '#c4473a'], guong: ['mirror'], luoc: ['comb'], khan: ['cloth', '#2f5f8f'], goi: ['paper', '#d9b878'] },
  tra: { goi: ['paper', '#d9b878'], sen: ['leaves', '#4f8a5a'], man: ['leaves', '#2f3a1a'], day: ['string', '#a3332a'], am: ['kettle'], chen: ['teacup'] },
  may: { do: ['ruler', '#e0b43a'], vai: ['cloth', '#c0567a'], keo: ['scissors'], kim: ['spool', '#2f5f8f'], khan: ['cloth', '#2a221d'], gap: ['fold'] },
  vai: { thuoc: ['ruler', '#e0b43a'], lua: ['cloth', '#c0567a'], vai: ['cloth', '#7a4a22'], the: ['cloth', '#2a221d'], keo: ['scissors'], gap: ['fold'], day: ['string', '#a3332a'] },
  gom: { bat: ['bowl', '#fbf8ef'], dia: ['plate'], binh: ['vase', '#2f5f8f'], am: ['kettle'], rom: ['bits', '#e0c070'], giay: ['paper', '#d9b878'], day: ['string', '#a3332a'] },
  vang: { nhan: ['ring', '#c8ccd2'], khuyen: ['earring', '#e0b43a'], vong: ['bangle', '#e0b43a'], da: ['gem', '#2f8a6a'], khan: ['cloth', '#a3332a'], hop: ['box'], giay: ['paper', '#e88aa8'] },
  den: { khung: ['frame'], do: ['paper', '#c4473a'], vang: ['paper', '#e0b43a'], canh: ['petals', '#e88aa8'], ho: ['jar', '#e8e2d2'], nen: ['candle'], tua: ['tassel', '#c4473a'] },
};
const p4IconStroke = (g, r) => { g.strokeStyle = INK; g.lineWidth = Math.max(1, r * .07); g.lineJoin = 'round'; g.lineCap = 'round'; };
const p4El = (g, x, y, rx, ry, col, rot = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.283); g.fill(); g.stroke(); };
const P4_ICON_DRAW = {
  noodle: (g, r, c) => { p4El(g, 0, r * .1, r * .85, r * .55, '#e8dcc0'); g.strokeStyle = c; g.lineWidth = Math.max(1, r * .1); g.beginPath(); for (let i = 0; i < 7; i++) { const y = -r * .2 + i * r * .09; g.moveTo(-r * .6, y); g.bezierCurveTo(-r * .2, y - r * .2, r * .2, y + r * .2, r * .6, y); } g.stroke(); p4IconStroke(g, r); },
  patty: (g, r, c) => { for (const [x, y] of [[-.3, .1], [.3, .05], [0, -.2]]) { p4El(g, x * r, y * r, r * .38, r * .28, c); g.strokeStyle = '#2a1a0a'; g.beginPath(); g.moveTo(x * r - r * .2, y * r); g.lineTo(x * r + r * .2, y * r - r * .05); g.stroke(); p4IconStroke(g, r); } },
  dip: (g, r, c) => { p4El(g, 0, r * .1, r * .7, r * .4, '#fbf8ef'); g.fillStyle = c; g.beginPath(); g.ellipse(0, r * .08, r * .52, r * .26, 0, 0, 6.283); g.fill(); g.fillStyle = '#c4473a'; g.beginPath(); g.arc(-r * .15, 0, r * .07, 0, 6.283); g.arc(r * .15, r * .12, r * .06, 0, 6.283); g.fill(); },
  herb: (g, r, c) => { for (const [a, k] of [[-.9, 1], [-.3, 1.1], [.3, 1], [.9, .9], [0, .8]]) { g.save(); g.rotate(a); g.fillStyle = c; g.beginPath(); g.moveTo(0, r * .5); g.quadraticCurveTo(r * .32 * k, -r * .1, 0, -r * .7 * k); g.quadraticCurveTo(-r * .32 * k, -r * .1, 0, r * .5); g.fill(); g.stroke(); g.restore(); } },
  roll: (g, r, c) => { for (const [x, y, a] of [[-.25, .15, -.3], [.2, 0, -.3], [-.05, -.25, -.3]]) { g.save(); g.translate(x * r, y * r); g.rotate(a); g.fillStyle = c; g.beginPath(); g.roundRect ? g.roundRect(-r * .55, -r * .16, r * 1.1, r * .32, r * .16) : g.rect(-r * .55, -r * .16, r * 1.1, r * .32); g.fill(); g.stroke(); g.restore(); } },
  ice: (g, r) => { for (const [x, y] of [[-.3, .15], [.25, .1], [0, -.25]]) { g.fillStyle = 'rgba(214,236,242,.95)'; g.beginPath(); g.rect(x * r - r * .25, y * r - r * .25, r * .5, r * .5); g.fill(); g.stroke(); g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(x * r - r * .15, y * r - r * .12); g.lineTo(x * r + r * .05, y * r - r * .15); g.stroke(); p4IconStroke(g, r); } },
  leaves: (g, r, c) => { p4El(g, 0, r * .2, r * .8, r * .4, '#c9a45a'); for (let i = 0; i < 9; i++) { const x = (i % 3 - 1) * r * .32, y = r * .05 - Math.floor(i / 3) * r * .16; g.fillStyle = c; g.beginPath(); g.ellipse(x, y, r * .18, r * .08, i * .7, 0, 6.283); g.fill(); } },
  dough: (g, r, c) => { p4El(g, 0, 0, r * .8, r * .5, c); g.strokeStyle = 'rgba(42,34,29,.3)'; g.beginPath(); g.ellipse(0, 0, r * .55, r * .32, 0, 0, 6.283); g.stroke(); p4IconStroke(g, r); },
  filling: (g, r, c) => { p4El(g, 0, r * .15, r * .75, r * .4, '#fbf8ef'); g.fillStyle = c; g.beginPath(); for (let i = 0; i <= 10; i++) { const t = i / 10 * 6.283, rr = r * (.45 + (i % 2) * .08); i ? g.lineTo(Math.cos(t) * rr, -r * .05 + Math.sin(t) * rr * .5) : g.moveTo(Math.cos(t) * rr, -r * .05 + Math.sin(t) * rr * .5); } g.closePath(); g.fill(); g.stroke(); },
  egg: (g, r) => { p4El(g, 0, 0, r * .75, r * .55, '#fbf8ef'); g.fillStyle = '#e8a83a'; g.beginPath(); g.arc(r * .05, -r * .02, r * .26, 0, 6.283); g.fill(); g.stroke(); },
  shrimp: (g, r) => { g.fillStyle = '#e88a5a'; g.beginPath(); g.arc(0, 0, r * .55, Math.PI * .2, Math.PI * 1.6); g.arc(0, 0, r * .25, Math.PI * 1.6, Math.PI * .2, true); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(r * .45, -r * .25); g.lineTo(r * .75, -r * .45); g.moveTo(r * .45, -r * .25); g.lineTo(r * .8, -r * .2); g.stroke(); },
  balls: (g, r, c) => { for (const [x, y] of [[-.3, .15], [.3, .15], [0, -.2]]) p4El(g, x * r, y * r, r * .3, r * .28, c); },
  steam: (g, r) => { p4El(g, 0, r * .3, r * .8, r * .3, '#c9a45a'); g.fillStyle = '#d9b878'; g.fillRect(-r * .8, -r * .05, r * 1.6, r * .35); g.strokeRect(-r * .8, -r * .05, r * 1.6, r * .35); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = Math.max(1.2, r * .09); g.beginPath(); for (const x of [-.4, 0, .4]) { g.moveTo(x * r, -r * .15); g.bezierCurveTo(x * r - r * .15, -r * .4, x * r + r * .15, -r * .55, x * r, -r * .8); } g.stroke(); p4IconStroke(g, r); },
  pan: (g, r) => { g.lineWidth = Math.max(2, r * .14); g.beginPath(); g.moveTo(r * .55, 0); g.lineTo(r * 1, -r * .25); g.stroke(); p4IconStroke(g, r); p4El(g, -r * .1, 0, r * .7, r * .38, '#3a2a1a'); g.fillStyle = 'rgba(232,168,58,.8)'; g.beginPath(); g.ellipse(-r * .1, 0, r * .5, r * .24, 0, 0, 6.283); g.fill(); },
  bits: (g, r, c) => { p4El(g, 0, r * .15, r * .72, r * .38, '#fbf8ef'); g.fillStyle = c; for (let i = 0; i < 14; i++) { const t = i * 2.4, rr = r * .4 * ((i % 4) / 4 + .2); g.beginPath(); g.arc(Math.cos(t) * rr, r * .1 + Math.sin(t) * rr * .5, r * .07, 0, 6.283); g.fill(); } },
  // the two rices of the rice shop told apart (owner 2026-11-12: "gạo tám và gạo nếp giống y hệt nhau"): tám = slender ivory grains in a bowl; nếp = round
  // plump white grains on a green banana leaf
  ricelong: (g, r) => { p4El(g, 0, r * .25, r * .82, r * .4, '#e9dcc0'); g.fillStyle = '#efe2bb'; g.beginPath(); g.ellipse(0, r * .05, r * .64, r * .44, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#8a6d2e'; g.lineWidth = Math.max(1, r * .045); g.lineCap = 'round'; for (let i = 0; i < 9; i++) { const x = -r * .42 + (i % 5) * r * .21 + (i > 4 ? r * .1 : 0), y = -r * .08 - (i > 4 ? r * .14 : 0); g.beginPath(); g.moveTo(x - r * .07, y + r * .03); g.lineTo(x + r * .07, y - r * .03); g.stroke(); } g.strokeStyle = '#1d1915'; },
  riceround: (g, r) => { g.fillStyle = '#4f8a3a'; g.beginPath(); g.ellipse(0, r * .32, r * .9, r * .3, -.12, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-r * .85, r * .38); g.lineTo(r * .85, r * .26); g.stroke();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(0, r * .2, r * .66, r * .55, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
    const lw = g.lineWidth; g.strokeStyle = '#b9b09a'; g.lineWidth = Math.max(.8, r * .025); g.fillStyle = '#ffffff';
    for (let i = 0; i < 11; i++) { const row = i < 5 ? 0 : i < 9 ? 1 : 2, k = row ? (row === 1 ? i - 5 : i - 9) : i, n = [5, 4, 2][row], x = (k - (n - 1) / 2) * r * .22, y = r * .08 - row * r * .16; g.beginPath(); g.arc(x, y, r * .1, 0, 6.283); g.fill(); g.stroke(); }
    g.strokeStyle = '#1d1915'; g.lineWidth = lw; },
  rice: (g, r, c) => { p4El(g, 0, r * .2, r * .8, r * .4, '#fbf8ef'); g.fillStyle = c; g.beginPath(); g.ellipse(0, r * .02, r * .62, r * .42, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = 'rgba(160,140,100,.55)'; for (let i = 0; i < 10; i++) { g.beginPath(); g.ellipse(-r * .4 + (i % 5) * r * .2, -r * .1 - Math.floor(i / 5) * r * .12, r * .05, r * .025, .4, 0, 6.283); g.fill(); } },
  slices: (g, r, c) => { for (const [x, y, a] of [[-.3, .1, -.3], [.05, -.05, .1], [.35, .12, .4]]) { g.save(); g.translate(x * r, y * r); g.rotate(a); p4El(g, 0, 0, r * .36, r * .22, c); g.strokeStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(-r * .2, 0); g.lineTo(r * .2, 0); g.stroke(); p4IconStroke(g, r); g.restore(); } },
  chicken: (g, r) => { p4El(g, 0, r * .05, r * .75, r * .5, '#e8c27a'); g.fillStyle = '#d9a05a'; g.beginPath(); g.ellipse(r * .45, -r * .25, r * .22, r * .3, .5, 0, 6.283); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(-r * .2, -r * .15, r * .3, r * .1, -.3, 0, 6.283); g.fill(); },
  soup: (g, r, c) => { P4_ICON_DRAW.bowl(g, r, c); g.fillStyle = '#4f9a48'; for (const x of [-.2, .15]) { g.beginPath(); g.ellipse(x * r, -r * .08, r * .12, r * .05, .3, 0, 6.283); g.fill(); } },
  bowl: (g, r, c) => { g.fillStyle = '#fbf8ef'; g.beginPath(); g.moveTo(-r * .8, -r * .1); g.quadraticCurveTo(-r * .7, r * .7, 0, r * .7); g.quadraticCurveTo(r * .7, r * .7, r * .8, -r * .1); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#2f5a9a'; g.beginPath(); g.moveTo(-r * .7, r * .2); g.quadraticCurveTo(0, r * .35, r * .7, r * .2); g.stroke(); p4IconStroke(g, r); p4El(g, 0, -r * .1, r * .8, r * .2, c || '#e8dcc0'); },
  cup: (g, r, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(-r * .45, -r * .6); g.lineTo(r * .45, -r * .6); g.lineTo(r * .32, r * .7); g.lineTo(-r * .32, r * .7); g.closePath(); g.fill(); g.stroke(); p4El(g, 0, -r * .6, r * .45, r * .12, 'rgba(255,255,255,.7)'); },
  stick: (g, r) => { for (const dx of [-.12, .12]) { g.save(); g.translate(dx * r, 0); g.rotate(-.5); g.fillStyle = '#d9a05a'; g.beginPath(); g.roundRect ? g.roundRect(-r * .18, -r * .75, r * .36, r * 1.5, r * .18) : g.rect(-r * .18, -r * .75, r * .36, r * 1.5); g.fill(); g.stroke(); g.restore(); } },
  dumpling: (g, r) => { for (const [x, y] of [[-.3, .1], [.3, .1], [0, -.2]]) { g.fillStyle = '#f2e8cf'; g.beginPath(); g.moveTo(x * r - r * .3, y * r + r * .1); g.quadraticCurveTo(x * r, y * r - r * .45, x * r + r * .3, y * r + r * .1); g.closePath(); g.fill(); g.stroke(); } },
  liquid: (g, r, c) => { g.fillStyle = '#9a6a3a'; g.beginPath(); g.moveTo(-r * .2, -r * .7); g.lineTo(r * .2, -r * .7); g.lineTo(r * .1, -r * .2); g.lineTo(-r * .1, -r * .2); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, r * .15, r * .45, 0, Math.PI); g.lineTo(-r * .45, r * .15); g.closePath(); g.fillStyle = '#5b3a22'; g.fill(); g.stroke(); g.fillStyle = c; g.beginPath(); g.ellipse(0, r * .15, r * .45, r * .12, 0, 0, 6.283); g.fill(); g.stroke(); },
  rib: (g, r) => { g.save(); g.rotate(-.3); g.fillStyle = '#a8583a'; g.beginPath(); g.roundRect ? g.roundRect(-r * .7, -r * .25, r * 1.4, r * .5, r * .2) : g.rect(-r * .7, -r * .25, r * 1.4, r * .5); g.fill(); g.stroke(); g.fillStyle = '#f2ecde'; g.fillRect(r * .55, -r * .08, r * .3, r * .16); g.strokeRect(r * .55, -r * .08, r * .3, r * .16); g.strokeStyle = '#3a1a0a'; g.beginPath(); for (const x of [-.4, -.1, .2]) { g.moveTo(x * r, -r * .2); g.lineTo(x * r + r * .1, r * .2); } g.stroke(); g.restore(); },
  beans: (g, r, c) => { p4El(g, 0, r * .2, r * .7, r * .35, '#fbf8ef'); g.fillStyle = c; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-r * .35 + (i % 3) * r * .35, r * .05 - Math.floor(i / 3) * r * .14, r * .12, r * .08, 0, 0, 6.283); g.fill(); g.stroke(); } },
  jelly: (g, r, c) => { for (const [x, y] of [[-.3, .15], [.25, .1], [0, -.22]]) { g.fillStyle = c; g.globalAlpha = .85; g.fillRect(x * r - r * .22, y * r - r * .22, r * .44, r * .44); g.globalAlpha = 1; g.strokeRect(x * r - r * .22, y * r - r * .22, r * .44, r * .44); } },
  basket: (g, r) => { g.fillStyle = '#c9a45a'; g.beginPath(); g.moveTo(-r * .8, -r * .2); g.quadraticCurveTo(-r * .75, r * .7, 0, r * .7); g.quadraticCurveTo(r * .75, r * .7, r * .8, -r * .2); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = 'rgba(90,60,25,.6)'; g.beginPath(); for (let x = -.6; x <= .6; x += .2) { g.moveTo(x * r, -r * .15); g.lineTo(x * r * .8, r * .6); } g.stroke(); p4IconStroke(g, r); p4El(g, 0, -r * .2, r * .8, r * .18, '#b8935a'); },
  jar: (g, r, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(-r * .3, -r * .55); g.quadraticCurveTo(-r * .75, -r * .2, -r * .55, r * .5); g.lineTo(r * .55, r * .5); g.quadraticCurveTo(r * .75, -r * .2, r * .3, -r * .55); g.closePath(); g.fill(); g.stroke(); g.fillRect(-r * .3, -r * .72, r * .6, r * .18); g.strokeRect(-r * .3, -r * .72, r * .6, r * .18); },
  salt: (g, r) => { p4El(g, 0, r * .2, r * .7, r * .35, '#9a6a3a'); g.fillStyle = '#fbfbf6'; g.beginPath(); g.moveTo(-r * .6, r * .15); g.quadraticCurveTo(0, -r * .7, r * .6, r * .15); g.closePath(); g.fill(); g.stroke(); },
  ruler: (g, r, c) => { g.save(); g.rotate(-.4); g.fillStyle = c; g.fillRect(-r * .85, -r * .14, r * 1.7, r * .28); g.strokeRect(-r * .85, -r * .14, r * 1.7, r * .28); g.beginPath(); for (let x = -.7; x <= .7; x += .2) { g.moveTo(x * r, -r * .14); g.lineTo(x * r, 0); } g.stroke(); g.restore(); },
  lid: (g, r, c) => { p4El(g, 0, r * .15, r * .75, r * .3, c); g.fillStyle = c; g.beginPath(); g.arc(0, -r * .1, r * .16, 0, 6.283); g.fill(); g.stroke(); },
  paper: (g, r, c) => { g.save(); g.rotate(-.15); g.fillStyle = c; g.fillRect(-r * .7, -r * .55, r * 1.4, r * 1.1); g.strokeRect(-r * .7, -r * .55, r * 1.4, r * 1.1); g.strokeStyle = 'rgba(42,34,29,.25)'; g.beginPath(); for (let y = -.3; y <= .3; y += .2) { g.moveTo(-r * .5, y * r); g.lineTo(r * .5, y * r); } g.stroke(); g.restore(); },
  root: (g, r, c) => { g.fillStyle = c; g.beginPath(); for (const [x, y, rx] of [[-.3, .1, .32], [.15, 0, .38], [.45, -.2, .2], [-.05, -.3, .2]]) g.ellipse(x * r, y * r, rx * r, rx * r * .7, .3, 0, 6.283); g.fill(); g.stroke(); },
  bark: (g, r, c) => { for (const dx of [-.25, 0, .25]) { g.save(); g.translate(dx * r, 0); g.rotate(.4); g.fillStyle = c; g.fillRect(-r * .1, -r * .7, r * .2, r * 1.4); g.strokeRect(-r * .1, -r * .7, r * .2, r * 1.4); g.restore(); } },
  discs: (g, r, c) => { for (const [x, y] of [[-.3, .15], [.25, .2], [0, -.15], [.35, -.25]]) { p4El(g, x * r, y * r, r * .28, r * .2, c); g.beginPath(); g.arc(x * r, y * r, r * .08, 0, 6.283); g.stroke(); } },
  ginseng: (g, r) => { g.fillStyle = '#e8d0a0'; g.beginPath(); g.ellipse(0, -r * .1, r * .2, r * .5, 0, 0, 6.283); g.fill(); g.stroke(); g.beginPath(); for (const [a, b] of [[-.15, .3], [.15, .3]]) { g.moveTo(a * r, b * r); g.quadraticCurveTo(a * 3 * r, r * .6, a * 2.5 * r, r * .8); } g.moveTo(0, -r * .6); g.lineTo(0, -r * .85); g.stroke(); g.fillStyle = '#4f9a48'; g.beginPath(); g.ellipse(r * .12, -r * .85, r * .15, r * .07, -.4, 0, 6.283); g.fill(); g.stroke(); },
  cake: (g, r, c) => { g.fillStyle = c; g.fillRect(-r * .6, -r * .35, r * 1.2, r * .7); g.strokeRect(-r * .6, -r * .35, r * 1.2, r * .7); g.fillStyle = '#e0b43a'; g.fillRect(-r * .3, -r * .15, r * .6, r * .3); g.strokeRect(-r * .3, -r * .15, r * .6, r * .3); },
  brush: (g, r) => { g.save(); g.rotate(-.6); g.fillStyle = '#b57a22'; g.fillRect(-r * .08, -r * .8, r * .16, r * 1.1); g.strokeRect(-r * .08, -r * .8, r * .16, r * 1.1); g.fillStyle = '#2a221d'; g.beginPath(); g.moveTo(-r * .12, r * .3); g.quadraticCurveTo(0, r * .9, r * .12, r * .3); g.closePath(); g.fill(); g.stroke(); g.restore(); },
  inkstick: (g, r) => { g.save(); g.rotate(-.4); g.fillStyle = '#2a221d'; g.fillRect(-r * .2, -r * .7, r * .4, r * 1.4); g.strokeRect(-r * .2, -r * .7, r * .4, r * 1.4); g.fillStyle = '#e0b43a'; g.fillRect(-r * .1, -r * .4, r * .2, r * .4); g.restore(); },
  string: (g, r, c) => { g.strokeStyle = c; g.lineWidth = Math.max(1.5, r * .12); g.beginPath(); for (let i = 0; i < 3; i++) g.ellipse(0, 0, r * (.6 - i * .15), r * (.4 - i * .1), .3, 0, 6.283); g.stroke(); p4IconStroke(g, r); },
  needle: (g, r) => { g.save(); g.rotate(-.7); g.fillStyle = '#c9c4b8'; g.beginPath(); g.moveTo(0, -r * .85); g.lineTo(r * .05, r * .8); g.lineTo(-r * .05, r * .8); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.ellipse(0, -r * .6, r * .03, r * .1, 0, 0, 6.283); g.stroke(); g.restore(); },
  spool: (g, r, c) => { g.fillStyle = '#b57a22'; g.fillRect(-r * .45, -r * .6, r * .9, r * .15); g.strokeRect(-r * .45, -r * .6, r * .9, r * .15); g.fillRect(-r * .45, r * .45, r * .9, r * .15); g.strokeRect(-r * .45, r * .45, r * .9, r * .15); g.fillStyle = c; g.fillRect(-r * .35, -r * .45, r * .7, r * .9); g.strokeRect(-r * .35, -r * .45, r * .7, r * .9); },
  mirror: (g, r) => { g.fillStyle = '#b57a22'; g.fillRect(-r * .1, r * .3, r * .2, r * .55); g.strokeRect(-r * .1, r * .3, r * .2, r * .55); p4El(g, 0, -r * .15, r * .5, r * .5, '#c4473a'); p4El(g, 0, -r * .15, r * .38, r * .38, '#dfe8ea'); },
  comb: (g, r) => { g.fillStyle = '#9a6a3a'; g.fillRect(-r * .7, -r * .35, r * 1.4, r * .25); g.strokeRect(-r * .7, -r * .35, r * 1.4, r * .25); g.beginPath(); for (let x = -.6; x <= .6; x += .12) { g.moveTo(x * r, -r * .1); g.lineTo(x * r, r * .4); } g.stroke(); },
  cloth: (g, r, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(-r * .7, -r * .3); g.lineTo(r * .7, -r * .45); g.lineTo(r * .75, r * .35); g.lineTo(-r * .65, r * .45); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.moveTo(-r * .6, 0); g.lineTo(r * .65, -r * .1); g.stroke(); p4IconStroke(g, r); },
  kettle: (g, r) => { p4El(g, 0, r * .15, r * .6, r * .45, '#9a4a2a'); g.beginPath(); g.moveTo(r * .5, r * .05); g.lineTo(r * .85, -r * .25); g.stroke(); g.beginPath(); g.arc(0, -r * .25, r * .35, Math.PI, 0); g.stroke(); p4El(g, 0, -r * .3, r * .15, r * .08, '#9a4a2a'); },
  teacup: (g, r) => { for (const x of [-.35, .35]) { g.fillStyle = '#fbf8ef'; g.beginPath(); g.moveTo(x * r - r * .28, -r * .2); g.quadraticCurveTo(x * r - r * .25, r * .35, x * r, r * .35); g.quadraticCurveTo(x * r + r * .25, r * .35, x * r + r * .28, -r * .2); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#2f5a9a'; g.beginPath(); g.moveTo(x * r - r * .22, r * .05); g.lineTo(x * r + r * .22, r * .05); g.stroke(); p4IconStroke(g, r); } },
  scissors: (g, r) => { g.lineWidth = Math.max(1.5, r * .1); g.beginPath(); g.moveTo(-r * .1, -r * .1); g.lineTo(r * .7, -r * .6); g.moveTo(-r * .1, r * .1); g.lineTo(r * .7, r * .6); g.stroke(); p4IconStroke(g, r); p4El(g, -r * .4, -r * .25, r * .2, r * .15, '#a3332a'); p4El(g, -r * .4, r * .25, r * .2, r * .15, '#a3332a'); },
  fold: (g, r) => { g.fillStyle = '#e0b43a'; g.beginPath(); g.moveTo(-r * .6, r * .4); g.lineTo(r * .2, r * .4); g.lineTo(r * .6, -r * .1); g.lineTo(-r * .2, -r * .1); g.closePath(); g.fill(); g.stroke(); g.lineWidth = Math.max(1.5, r * .1); g.beginPath(); g.arc(0, -r * .1, r * .45, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.moveTo(r * .38, -r * .45); g.lineTo(r * .45, -r * .25); g.lineTo(r * .25, -r * .3); g.stroke(); p4IconStroke(g, r); },
  frame: (g, r) => { g.strokeStyle = '#b57a22'; g.lineWidth = Math.max(1.5, r * .1); g.beginPath(); g.ellipse(0, 0, r * .55, r * .7, 0, 0, 6.283); for (const k of [-.3, 0, .3]) { g.moveTo(k * r, -r * .7); g.quadraticCurveTo(k * r * 2, 0, k * r, r * .7); } g.stroke(); p4IconStroke(g, r); },
  candle: (g, r) => { g.fillStyle = '#c4473a'; g.fillRect(-r * .15, -r * .35, r * .3, r * .9); g.strokeRect(-r * .15, -r * .35, r * .3, r * .9); g.fillStyle = '#f2c640'; g.beginPath(); g.moveTo(0, -r * .8); g.quadraticCurveTo(r * .15, -r * .5, 0, -r * .38); g.quadraticCurveTo(-r * .15, -r * .5, 0, -r * .8); g.fill(); g.stroke(); },
  tassel: (g, r, c) => { g.fillStyle = '#e0b43a'; g.beginPath(); g.arc(0, -r * .5, r * .15, 0, 6.283); g.fill(); g.stroke(); g.strokeStyle = c; g.lineWidth = Math.max(1, r * .08); g.beginPath(); for (let x = -.25; x <= .25; x += .1) { g.moveTo(0, -r * .38); g.lineTo(x * r, r * .7); } g.stroke(); p4IconStroke(g, r); },
  petals: (g, r, c) => { for (let i = 0; i < 6; i++) { g.save(); g.rotate(i * 1.05); g.fillStyle = c; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(r * .3, -r * .35, 0, -r * .75); g.quadraticCurveTo(-r * .3, -r * .35, 0, 0); g.fill(); g.stroke(); g.restore(); } g.fillStyle = '#e0b43a'; g.beginPath(); g.arc(0, 0, r * .14, 0, 6.283); g.fill(); g.stroke(); },
  plate: (g, r) => { p4El(g, 0, r * .1, r * .8, r * .38, '#fbf8ef'); g.strokeStyle = '#2f5a9a'; g.lineWidth = Math.max(1, r * .07); g.beginPath(); g.ellipse(0, r * .1, r * .55, r * .24, 0, 0, 6.283); g.stroke(); p4IconStroke(g, r); },
  vase: (g, r, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(-r * .18, -r * .75); g.lineTo(r * .18, -r * .75); g.quadraticCurveTo(r * .1, -r * .4, r * .45, -r * .05); g.quadraticCurveTo(r * .6, r * .5, r * .25, r * .8); g.lineTo(-r * .25, r * .8); g.quadraticCurveTo(-r * .6, r * .5, -r * .45, -r * .05); g.quadraticCurveTo(-r * .1, -r * .4, -r * .18, -r * .75); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#fbf8ef'; g.lineWidth = Math.max(1, r * .08); g.beginPath(); g.moveTo(-r * .4, r * .2); g.quadraticCurveTo(0, 0, r * .4, r * .2); g.stroke(); p4IconStroke(g, r); },
  // a cut gem: crown, table and pavilion facets (đá quý, owner 2026-11-12)
  gem: (g, r, c) => { const top = -r * .38, mid = -r * .08, bot = r * .62, w = r * .72, t = r * .36;
    g.fillStyle = c; g.beginPath(); g.moveTo(-t, top); g.lineTo(t, top); g.lineTo(w, mid); g.lineTo(0, bot); g.lineTo(-w, mid); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(-t, top); g.lineTo(t, top); g.lineTo(t * .55, mid); g.lineTo(-t * .55, mid); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-w, mid); g.lineTo(w, mid); g.moveTo(-t * .55, mid); g.lineTo(0, bot); g.lineTo(t * .55, mid); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.arc(-t * .35, top + r * .1, r * .06, 0, 6.283); g.fill(); },
  ring: (g, r, c) => { g.strokeStyle = INK; g.lineWidth = Math.max(2, r * .22); g.beginPath(); g.arc(0, r * .15, r * .45, 0, 6.283); g.stroke(); g.strokeStyle = c; g.lineWidth = Math.max(1, r * .12); g.stroke(); p4IconStroke(g, r); p4El(g, 0, -r * .35, r * .17, r * .14, '#c4473a'); },
  earring: (g, r, c) => { for (const x of [-.32, .32]) { g.strokeStyle = c; g.lineWidth = Math.max(1, r * .08); g.beginPath(); g.arc(x * r, -r * .35, r * .14, Math.PI, 0); g.stroke(); p4IconStroke(g, r); p4El(g, x * r, r * .15, r * .15, r * .32, c); } },
  bangle: (g, r, c) => { g.strokeStyle = INK; g.lineWidth = Math.max(2, r * .3); g.beginPath(); g.ellipse(0, 0, r * .62, r * .45, 0, 0, 6.283); g.stroke(); g.strokeStyle = c; g.lineWidth = Math.max(1, r * .18); g.stroke(); p4IconStroke(g, r); },
  box: (g, r) => { g.fillStyle = '#9a4a2a'; g.fillRect(-r * .65, -r * .2, r * 1.3, r * .65); g.strokeRect(-r * .65, -r * .2, r * 1.3, r * .65); g.fillStyle = '#b8683a'; g.fillRect(-r * .7, -r * .45, r * 1.4, r * .28); g.strokeRect(-r * .7, -r * .45, r * 1.4, r * .28); p4El(g, 0, r * .05, r * .08, r * .08, '#e0b43a'); },
  bin: (g, r) => P4_ICON_DRAW.basket(g, r),
};
function p4ShopIcon(g, k, x, y, r) {
  const S = P4T.shop, d = k === 'bo' ? ['bin'] : (P4_ICON_OF[S.K.game] || {})[k] || ['cake', '#c9a45a'];
  g.save(); g.translate(x, y); p4IconStroke(g, r); (P4_ICON_DRAW[d[0]] || P4_ICON_DRAW.cake)(g, r, d[1], d[2]); g.restore();
}

/* ---------- running têm trầu's engine for a shop ---------- */
const P4_TEM_SAVE = { ing: null, rec: null };
const p4ShopRecipesAll = S => S.K.wares.filter(w => p4Has(S.R, w) && S.G.r[w.id]).map(w => ({ id: w.id, name: w.n, need: S.G.r[w.id], fold: false, price: p4WPrice(S.R, w), w: w.w * c4PFlow(p4WRatio(S.R, w)), ware: w }));
// (owner, 2026-11-09: "vẫn tự bán được chứ, chẳng qua sẽ không ai ghé mua"): a shift opens with every ware on the menu; wares nobody wants at
// their price (w 0) are simply never ordered, so at prices nobody pays the shift runs with nobody coming
const p4ShopRecipes = S => p4ShopRecipesAll(S).filter(r => r.w > 0);   // dear wares are asked for less (as on the street)
// how willing the shift's customers are: the menu's flow at its prices (owner, 2026-11-08: at triple price the hand-selling game paid ~25 quan a shift)
const p4MiniFlow = S => { const ws = S.K.wares.filter(w => p4Has(S.R, w)), t = ws.reduce((a, w) => a + w.w, 0); return (t ? ws.reduce((a, w) => a + w.w * c4PFlow(p4WRatio(S.R, w)), 0) / t : 1) * 1.2 * Math.min(1, .3 + .7 * S.K.cust / 46); };   // a shop few people visit (the goldsmith) is quieter in the game too
// standing at the counter oneself draws a few more (owner, 2026-11-09: "đứng ở quầy bán như kiểu têm trầu thì vẫn đông hơn một chút"): ×1.2, and a quiet shop keeps
// at least .3 of the flow (gold .58 of a busy shop, was .26)
// shifts a day, all the town's shops together (owner: the street waits during a shift, so without a limit a day had no end of them)
const P4_MINI_DAY = 3;
const p4MiniLeft = () => { const M = SAVE4B.mini; return P4_MINI_DAY - (M && M.day === SAVE4.day ? M.n : 0); };
function p4MiniStart(key) {
  const R = p4Shops()[key]; if (!R) return; p4ShopFix(R);
  const K = p4Kind(R), G = P4_MINI[K.game];
  if (!G) { toast('Quán này chưa có trò tự tay bán.', 2.4); return; }
  if (R.shut) { toast('Quán đang đóng cửa: mở cửa rồi hẵng bán.', 2.6); return; }
  const S = { key, R, K, G }; if (!p4ShopRecipesAll(S).length) { toast('Quán chưa bày món nào để bán.', 2.8); return; }
  if (p4MiniLeft() <= 0) { toast(`Hôm nay đã tự tay bán đủ ${P4_MINI_DAY} ca rồi, mai lại bán tiếp.`, 3); return; }
  const M = SAVE4B.mini && SAVE4B.mini.day === SAVE4.day ? SAVE4B.mini : (SAVE4B.mini = { day: SAVE4.day, n: 0 }); M.n++; p4Persist();
  if (!P4_TEM_SAVE.ing) { P4_TEM_SAVE.ing = P4_TEM_ING.slice(); P4_TEM_SAVE.rec = P4_TEM_RECIPES.slice(); }
  P4_TEM_ING.splice(0, P4_TEM_ING.length, ...G.pieces.map(([k, name]) => ({ k, name })), { k: 'bo', name: 'Bỏ' });
  P4_TEM_RECIPES.splice(0, P4_TEM_RECIPES.length, ...p4ShopRecipesAll(S));
  p4Sheets(null); $('#p4hud').hidden = true; $('#p4temHud').hidden = false;
  Object.assign(P4T, { shop: S, drag: null, on: true, out: 0, fetch: 0, early: false, t: 0, cust: [], boards: [{ items: [], fold: false }, { items: [], fold: false }], sel: 0, next: 1.2, served: 0, wrong: 0, missed: 0, earned: 0, cost: 0, fx: [], shake: null });
}
function p4MiniRestore() {
  if (P4_TEM_SAVE.ing) { P4_TEM_ING.splice(0, P4_TEM_ING.length, ...P4_TEM_SAVE.ing); P4_TEM_RECIPES.splice(0, P4_TEM_RECIPES.length, ...P4_TEM_SAVE.rec); P4_TEM_SAVE.ing = null; }
}
// the layout: the shop has more pieces than betel, so they go in rows (4 a row on a phone, 6 on a wide screen) below the trays
{ const lay0 = p4TemLay;
  p4TemLay = function () {
    const L = lay0(); if (!P4T.shop) return L;
    const n = P4_TEM_ING.length, per = L.port ? 4 : Math.ceil(n / 2), rows = Math.ceil(n / per), ing = [], W = L.W, H = L.H;
    const top = L.port ? .72 : .78, step = L.port ? .095 : .125, ingW = Math.min(W / (per + .4), 130 * L.u);
    for (let i = 0; i < n; i++) { const ri = Math.floor(i / per), inRow = Math.min(per, n - ri * per), ci = i % per; ing.push([W / 2 + (ci - (inRow - 1) / 2) * ingW, H * (top + ri * step)]); }
    const by = L.port ? .6 : .66;
    return { ...L, ing, ingR: Math.min(ingW * .38, H * step * .4), boards: [[W * (L.port ? .27 : .3), H * by], [W * (L.port ? .73 : .7), H * by]], boardR: Math.min(W * (L.port ? .16 : .12), H * .075) };
  }; }
// customers ask for a ware of the shop that is on the menu and in stock; no betel to fetch: an empty shop closes the shift
{ const up0 = p4TemUpdate;
  p4TemUpdate = function (dt) {
    const S = P4T.shop; if (!S) return up0(dt);
    if (!P4T.on) return;
    P4T.t += dt;
    if (P4T.t >= P4_TEM_SHIFT && !P4T.cust.some(c => !c.leaving)) { p4TemStop(); return; }
    P4_TEM_RECIPES.splice(0, P4_TEM_RECIPES.length, ...p4ShopRecipesAll(S));
    if (!P4_TEM_RECIPES.length && !P4T.cust.some(c => !c.leaving)) { P4T.early = true; p4TemStop(); return; }
    if (P4T.t < P4_TEM_SHIFT - 6 && (P4T.next -= dt) <= 0 && P4_TEM_RECIPES.some(r => r.w > 0)) {
      const free = p4TemLay().slots.map((_, i) => i).filter(i => !P4T.cust.some(c => c.slot === i && !c.gone));
      if (free.length) {
        const tot = P4_TEM_RECIPES.reduce((a, r) => a + r.w, 0); let k = Math.random() * tot, rec = P4_TEM_RECIPES.find(r => r.w > 0);
        for (const r of P4_TEM_RECIPES) if ((k -= r.w) <= 0) { rec = r; break; }
        const sort = p4Pick(C4_ADULT_SORTS2), seed = Math.random() * 6, pat = 26 - 9 * P4T.t / P4_TEM_SHIFT;
        P4T.cust.push({ slot: p4Pick(free), sort, M: c4MouseRig(sort), seed, look: p4TownLook({ skirt: Math.random() < .5, hat: Math.random() < .2 ? 'quai' : null }, seed), umb: false,
          order: rec, pat: pat * c4Clamp(c4PQty(p4WRatio(S.R, rec.ware)), .45, 1.15), patMax: pat * c4Clamp(c4PQty(p4WRatio(S.R, rec.ware)), .45, 1.15), in: 0, leaving: 0, gone: false, say: null, face: 1, ph: 0, st: 'stand' });
      }
      P4T.next = (4.8 - 2.2 * P4T.t / P4_TEM_SHIFT + Math.random() * 1.5) / Math.max(.15, p4MiniFlow(S));   // dear prices: customers come seldom
    }
    for (const c of P4T.cust) {
      c.in = Math.min(1, c.in + dt * 2.5);
      if (c.say) { c.say.t += dt; if (c.say.t > c.say.life) c.say = null; }
      if (c.leaving) { c.leaving += dt; if (c.leaving > .8) c.gone = true; continue; }
      c.pat -= dt; if (c.pat <= 0) { c.leaving = .01; P4T.missed++; c.say = { text: 'Chậm quá, thôi!', t: 0, life: 1.4 }; }
    }
    P4T.cust = P4T.cust.filter(c => !c.gone);
    for (const f of P4T.fx) f.t += dt; P4T.fx = P4T.fx.filter(f => f.t < 1.2);
    if (P4T.shake) { P4T.shake.t += dt; if (P4T.shake.t > .35) P4T.shake = null; }
  }; }
// a piece onto the chosen tray: any order, each piece once, at most 6; Bỏ empties it
{ const add0 = p4TemAdd;
  p4TemAdd = function (k) {
    if (!P4T.shop) return add0(k);
    const b = P4T.boards[P4T.sel];
    if (k === 'bo') { b.items = []; return; }
    if (b.items.includes(k) || b.items.length >= 6) { P4T.shake = { i: P4T.sel, t: 0 }; return; }
    b.items.push(k);
  }; }
// handing a tray over: paid at the shop's price, one taken from the shop's stock
{ const give0 = p4TemGive;
  p4TemGive = function (c) {
    const S = P4T.shop; if (!S) return give0(c);
    const b = P4T.boards[P4T.sel]; if (!b.items.length) { P4T.shake = { i: P4T.sel, t: 0 }; return; }
    const L = p4TemLay(), x = L.slots[c.slot], y = p4TemOrderY(L);
    if (p4TemMatch(b, c.order)) {
      const r = p4ShopSell(S.R, S.key, c.order.ware, 1, false);
      if (r.n) {
        const tip = Math.round(r.got * .5 * Math.max(0, c.pat / c.patMax)); SAVE4.money += tip; P4.today.take += tip;
        const got = r.got + tip; P4T.earned += got; P4T.cost = (P4T.cost || 0) + r.n * c.order.ware.c;   // the goods were paid out of the purse as they sold (owner, 2026-11-08: a player saw Thu 30 quan, 20 in the purse)
        P4T.served++; persist4(); p4Persist(); AU.pluck(84 + (got % 5));
        P4T.fx.push({ x, y, s: '+' + got, t: 0, ok: true }); c.say = { text: tip > r.got * .3 ? 'Nhanh quá, thưởng thêm!' : 'Đúng rồi, cảm ơn!', t: 0, life: 1.2 };
      } else c.say = { text: 'Hết ' + String((c.order && c.order.name) || 'món này').toLowerCase() + ' rồi à?', t: 0, life: 1.3 };
      c.leaving = .01;
    } else { P4T.wrong++; c.pat = Math.max(.5, c.pat - c.patMax * .3); c.say = { text: 'Không phải thế!', t: 0, life: 1.2 }; P4T.fx.push({ x, y, s: '✗', t: 0, ok: false }); }
    b.items = [];
  }; }
// the pictures: the shop's own (the betel ones stay for the betel house)
{ const icon0 = p4TemIcon;
  p4TemIcon = function (g, k, x, y, r, mode) { if (!P4T.shop) return icon0(g, k, x, y, r, mode); p4ShopIcon(g, k, x, y, r * (mode === 'pile' ? 1.4 : 1)); }; }
// the tray: a wooden tray (a bowl's rim for the eating houses), what is on it laid round its middle
{ const board0 = p4TemBoard;
  p4TemBoard = function (g, L, b, i) {
    if (!P4T.shop) return board0(g, L, b, i);
    const D = P4T.drag && P4T.drag.moved && P4T.drag.i === i ? P4T.drag : null;
    if (D) { const [hx, hy] = L.boards[i]; g.strokeStyle = 'rgba(242,236,222,.35)'; g.setLineDash([6, 6]); g.lineWidth = 2; g.beginPath(); g.ellipse(hx, hy, L.boardR, L.boardR * .55, 0, 0, 6.283); g.stroke(); g.setLineDash([]); }
    const sh = P4T.shake && P4T.shake.i === i ? Math.sin(P4T.shake.t * 60) * 5 : 0, x = (D ? D.x : L.boards[i][0]) + sh, y = D ? D.y : L.boards[i][1], r = L.boardR * (D ? .8 : 1), sel = P4T.sel === i, food = P4T.shop.K.t === 'an';
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(x + (D ? 14 : 4), y + (D ? 26 : 8), r, r * .55, 0, 0, 6.283); g.fill();
    const gr = g.createLinearGradient(x, y - r * .55, x, y + r * .55); gr.addColorStop(0, food ? '#fbf8ef' : '#b88048'); gr.addColorStop(1, food ? '#d7cfbd' : '#7a4a22');
    g.fillStyle = gr; g.strokeStyle = sel ? '#f7d548' : INK; g.lineWidth = sel ? 4 : 2; g.beginPath(); g.ellipse(x, y, r, r * .55, 0, 0, 6.283); g.fill(); g.stroke();
    g.strokeStyle = food ? '#2f5a9a' : 'rgba(42,26,14,.5)'; g.lineWidth = Math.max(1.5, r * .03); g.beginPath(); g.ellipse(x, y, r * .86, r * .47, 0, 0, 6.283); g.stroke();
    const n = b.items.length; b.items.forEach((k, j) => { const a = n === 1 ? 0 : -Math.PI / 2 + j / n * 6.283, d = n === 1 ? 0 : r * .42; p4ShopIcon(g, k, x + Math.cos(a) * d, y + Math.sin(a) * d * .5 - r * .05, r * (n > 4 ? .28 : .34)); });
  }; }
// the shift's clock: the shop's stock, not betel
{ const render0 = p4TemRender;
  p4TemRender = function () { render0(); const S = P4T.shop; if (S && P4T.on) $('#p4temMoney').textContent = `Lãi ${c4Money(P4T.earned - (P4T.cost || 0))}`; }; }
// the end: the shop's words, "bán tiếp" starts the same shop again; têm trầu's lists are put back
{ const stop0 = p4TemStop;
  p4TemStop = function () {
    const S = P4T.shop; if (!S) return stop0();
    P4T.shop = null; P4T.on = false; $('#p4temHud').hidden = true; $('#p4hud').hidden = false; p4MiniRestore(); p4Persist(); p4Hud();
    $('#p4temEnd h3').textContent = 'Hết ca · ' + S.R.name;
    $('#p4temEndB').innerHTML = (P4T.early === 'dear' ? '<p class="bad"><b>Chẳng có ai ghé hỏi mua, đóng ca sớm.</b></p>' : P4T.early ? '<p class="bad"><b>Hết hàng, đóng ca sớm.</b></p>' : '') + `<p>Đưa đúng <b>${P4T.served}</b> món · thu <b>${c4Money(P4T.earned)}</b></p><p>Tiền vốn hàng: ${c4Money(P4T.cost || 0)} · <b>lãi vào túi ${c4Money(P4T.earned - (P4T.cost || 0))}</b></p>`
      + (P4T.wrong ? `<p>Đưa nhầm ${P4T.wrong} lần</p>` : '') + (P4T.missed ? `<p class="bad">${P4T.missed} khách chờ lâu bỏ đi</p>` : '');
    $('#p4temAgain').hidden = true;
    const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Bán tiếp';
    b.addEventListener('click', () => { AU.tap(); p4Sheets(null); $('#p4temEnd h3').textContent = 'Hết ca têm trầu'; p4MiniStart(S.key); });
    if (p4Left(S.R) > 0 && p4MiniLeft() > 0) $('#p4temEndB').appendChild(b);
    { const p = document.createElement('p'); p.className = 'sm'; p.textContent = p4MiniLeft() > 0 ? `Hôm nay còn ${p4MiniLeft()} ca tự tay bán.` : 'Hôm nay hết ca tự tay bán, mai lại bán tiếp.'; $('#p4temEndB').appendChild(p); }
    p4Sheets('p4temEnd');
  }; }
// leaving the town mid-shift: the lists go back too
{ const hide0 = p4Hide; p4Hide = function () { if (P4T.shop) { P4T.shop = null; p4MiniRestore(); } return hide0.apply(this, arguments); }; }
// the betel house's own shift starts clean (its title, its lists)
{ const start0 = p4TemStart; p4TemStart = function () { P4T.shop = null; p4MiniRestore(); $('#p4temEnd h3').textContent = 'Hết ca têm trầu'; return start0.apply(this, arguments); }; }
// a long order (a lantern of five pieces) is drawn smaller so the bubbles of neighbours never run into each other
{ const order0 = p4TemOrder;
  p4TemOrder = function (g, L, c, x, hot) {
    if (!P4T.shop) return order0(g, L, c, x, hot);
    const r = 13 * L.u + 4, w = c.order.need.length * r * 2.1 + 12, f = Math.min(1, (L.port ? L.W * .3 : L.W * .22) / w), y = p4TemOrderY(L);
    g.save(); g.translate(x, y); g.scale(f, f); g.translate(-x, -y); order0(g, L, c, x, hot); g.restore();
  }; }
