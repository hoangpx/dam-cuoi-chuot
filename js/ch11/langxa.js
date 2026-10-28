/* Chương XI · Làng Vũ Đại — the village beyond the player's own home: the hamlet (xóm làng) with its gate, banyan, pond and houses,
   the communal house (đình làng: the village's hall), the river landing (bến sông); and a hundred villagers who live there, keep
   their own hours (home, work, a stroll), talk, take gifts and, as the player becomes their friend (Stardew Valley's 10 hearts),
   tell their stories. The 23 people of the old stories are written by hand (lines all original); the rest are drawn from pools by a
   fixed seed, so the village is the same for every player. */

/* ---------- the places ---------- */
const c11Grid = (W, H) => Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 't' : 'g'));
const c11Fill = (m, x0, y0, x1, y1, k) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (m[y] && m[y][x] !== undefined) m[y][x] = k; };
/* every house of the village: area, front-door x (centre) and y, footprint w × h tiles, its picture (tranh = thatch, ngoi = tiled
   roof, ngoiW = a wide brick house with a tiled roof, leu = a shack) and size */
const C11_HOUSES = {
  hac: { a: 'lang', x: 4.5, y: 3, w: 3, h: 2, kind: '', s: .6, name: 'Nhà lão Hạc' },
  giao: { a: 'lang', x: 9.5, y: 3, w: 3, h: 2, kind: 'ngoi', s: .58, name: 'Nhà ông giáo' },
  dau: { a: 'lang', x: 9.5, y: 8, w: 3, h: 2, kind: '', s: .6, name: 'Nhà anh Dậu' },
  ba: { a: 'dinhba', x: 12.5, y: 7, w: 9, h: 3, kind: 'ngoiW', s: 1.25, name: 'Nhà cụ Bá Kiến' },          // the compound of its own: dinhba.js
  ba2: { a: 'dinhba', x: 4.5, y: 9, w: 3, h: 2, kind: 'ngoi', s: .6, name: 'Nhà ngang' },
  ba3: { a: 'dinhba', x: 20.5, y: 9, w: 3, h: 2, kind: 'ngoi', s: .6, name: 'Nhà ngang' },
  chuc: { a: 'lang', x: 17.5, y: 4, w: 3, h: 2, kind: '', s: .56, name: 'Nhà Binh Chức' },
  tao: { a: 'lang', x: 27.5, y: 8, w: 3, h: 2, kind: 'ngoi', s: .58, name: 'Nhà Đội Tảo' },
  dong: { a: 'lang', x: 10.5, y: 14, w: 3, h: 2, kind: '', s: .58, name: 'Nhà mụ đồng' },
  kieu: { a: 'lang', x: 4.5, y: 18, w: 3, h: 2, kind: 'ngoi', s: .58, name: 'Nhà cô Kiều' },
  xeto: { a: 'lang', x: 10.5, y: 18, w: 3, h: 2, kind: '', s: .58, name: 'Nhà anh Lành xe tơ' },
  tu: { a: 'lang', x: 18.5, y: 13, w: 3, h: 2, kind: '', s: .56, name: 'Nhà bà goá Tư' },
  x1: { a: 'lang', x: 22.5, y: 13, w: 3, h: 2, kind: 'ngoi', s: .56, name: 'Nhà thầy đồ Nho' },
  x2: { a: 'lang', x: 26.5, y: 13, w: 3, h: 2, kind: '', s: .56, name: 'Nhà cô Duyên' },
  x3: { a: 'lang', x: 19.5, y: 18, w: 3, h: 2, kind: '', s: .56, name: 'Nhà anh Mõ' },
  x4: { a: 'lang', x: 23.5, y: 18, w: 3, h: 2, kind: '', s: .56, name: '' },
  x5: { a: 'lang', x: 27.5, y: 18, w: 3, h: 2, kind: 'ngoi', s: .56, name: '' },
  thi: { a: 'ben', x: 5.5, y: 5, w: 3, h: 2, kind: '', s: .6, name: 'Nhà bà cô Thị' },
  chi: { a: 'ben', x: 2.5, y: 8, w: 2, h: 1, kind: 'leu', s: .8, name: 'Túp lều anh Chí' },
  b1: { a: 'ben', x: 17.5, y: 5, w: 3, h: 2, kind: '', s: .58, name: '' },
  b2: { a: 'ben', x: 21.5, y: 5, w: 3, h: 2, kind: '', s: .58, name: '' },
};
/* a yard of its own for every house (owner): a bamboo fence ('R') down both sides and along the back, the front open to the lane; only on grass */
const c11Fences = (m, a) => { for (const hs of Object.values(C11_HOUSES)) { if (hs.a !== a || hs.kind === 'leu') continue; const x0 = Math.round(hs.x - hs.w / 2) - 1, x1 = x0 + hs.w + 1, y0 = hs.y - hs.h - 1; const put = (x, y) => { if (m[y] && m[y][x] === 'g') m[y][x] = 'R'; }; for (let x = x0; x <= x1; x++) put(x, y0); for (let y = y0; y <= hs.y; y++) { put(x0, y); put(x1, y); } } };
const c11Footprint = (m, a) => { for (const hs of Object.values(C11_HOUSES)) if (hs.a === a) c11Fill(m, Math.round(hs.x - hs.w / 2), hs.y - hs.h, Math.round(hs.x - hs.w / 2) + hs.w - 1, hs.y - 1, 'V'); };
const C11_XOM = (() => {
  const m = c11Grid(30, 20);
  c11Fill(m, 1, 9, 28, 9, 'p'); c11Fill(m, 15, 1, 15, 18, 'p');
  m[9][0] = 'E'; m[9][29] = 'E'; m[0][15] = 'E'; m[19][15] = 'E';
  for (const [y, a, b] of [[12, 3, 6], [13, 2, 7], [14, 2, 7], [15, 3, 6]]) c11Fill(m, a, y, b, y, 'w');      // the village pond
  c11Footprint(m, 'lang');
  c11Fill(m, 2, 5, 4, 7, 'S'); m[8][3] = 'T';                                                          // cô Duyên's tea stall
  m[17][14] = 'I'; m[17][16] = 'I';                                                                     // the village gate's pillars
  m[10][18] = 'K';
  for (const [x, y] of [[6, 6], [13, 6], [25, 15], [7, 16]]) m[y][x] = 'H';
  for (const [x, y] of [[12, 11], [13, 3], [26, 3], [2, 10], [28, 10], [6, 10], [20, 7], [12, 16]]) if (m[y][x] === 'g') m[y][x] = 't';
  c11Fill(m, 19, 1, 24, 4, 't'); c11Fill(m, 19, 5, 24, 5, 'G'); m[5][22] = 'p'; m[4][22] = 'E';   // cụ Bá's gate in the hamlet: his garden's trees over the wall
  c11Fences(m, 'lang');
  return m;
})();
const C11_DINH = (() => {
  const m = c11Grid(24, 16);
  c11Fill(m, 5, 6, 18, 10, 'q'); c11Fill(m, 7, 2, 16, 5, 'J');
  c11Fill(m, 12, 11, 12, 14, 'p'); m[15][12] = 'E';
  m[11][10] = 'I'; m[11][14] = 'I';
  for (const [y, a, b] of [[12, 3, 7], [13, 2, 8], [14, 3, 7]]) c11Fill(m, a, y, b, y, 'w');
  m[8][19] = 'Y'; m[7][4] = 'Z'; m[7][9] = 'L'; m[7][15] = 'L';
  for (const [x, y] of [[3, 4], [20, 4], [2, 10], [21, 10], [19, 13], [21, 13], [16, 13], [5, 2], [18, 2]]) if (m[y][x] === 'g') m[y][x] = 't';
  return m;
})();
const C11_BEN = (() => {
  const m = c11Grid(24, 15);
  c11Fill(m, 0, 9, 23, 13, 'w'); c11Fill(m, 11, 9, 12, 10, 'b');
  c11Fill(m, 12, 1, 12, 8, 'p'); m[0][12] = 'E';
  c11Footprint(m, 'ben'); c11Fences(m, 'ben');
  m[8][8] = 'O';
  for (const [x, y] of [[9, 4], [14, 6]]) m[y][x] = 'H';
  for (const [x, y] of [[14, 3], [2, 4], [8, 2], [16, 2], [21, 8], [20, 2], [9, 7], [15, 8]]) if (m[y][x] === 'g') m[y][x] = 't';
  return m;
})();
/* three more hamlets (owner 2026-10-27: "cho mỗi NPC một nhà, một khu khác nhau để bản đồ rộng hơn"): Xóm Đông beyond the market, Xóm
   Đoài beyond the đình, Xóm Bãi beyond the river landing. Each is three lanes with five houses facing each, joined by short lanes, with
   wells, haystacks, trees and a little pond in the strips between; every villager without a family house gets one of these (c11PPL). */
const C11_HAMLETS = [['dongx', 'Xóm Đông', 'w', 'cho', 41], ['doai', 'Xóm Đoài', 'e', 'dinh', 53], ['bai', 'Xóm Bãi', 'w', 'ben', 67]];
const C11_HAMLET_MAPS = {};
for (const [id, name, side, to, seed] of C11_HAMLETS) {
  const W = 31, m = c11Grid(W, 20), r = k => c11Hash(seed, k, 9);
  for (const y of [5, 11, 17]) c11Fill(m, 1, y, W - 2, y, 'p');
  for (const x of [6, 12, 18, 24]) c11Fill(m, x, 5, x, 17, 'p');
  const ex = side === 'w' ? 0 : W - 1; m[11][ex] = 'E';
  let i = 0;
  for (const L of [5, 11, 17]) for (const cx of [3.5, 9.5, 15.5, 21.5, 27.5]) { C11_HOUSES[id + i] = { a: id, x: cx, y: L - 1, w: 3, h: 2, kind: r(i) < .35 ? 'ngoi' : '', s: .56 + r(i + 40) * .05, name: '' }; i++; }
  c11Footprint(m, id); c11Fences(m, id);
  for (const [x, y] of [[13, 7], [25, 13]]) m[y][x] = 'K';
  for (const [x, y] of [[7, 13], [19, 7], [2, 13], [29, 7]]) m[y][x] = 'H';
  const py = r(90) < .5 ? 12 : 6, px = [2, 8, 14, 20, 26][Math.floor(r(91) * 5)]; c11Fill(m, px, py, px + 2, py + 1, 'w');
  for (let k = 0; k < 14; k++) { const x = 1 + Math.floor(r(100 + k) * (W - 2)), y = [6, 7, 12, 13, 18][Math.floor(r(120 + k) * 5)]; if (m[y][x] === 'g') m[y][x] = 't'; }
  C11_HAMLET_MAPS[id] = { m, name, side, to, ex, py, px };
}
const c11HouseList = a => Object.entries(C11_HOUSES).filter(([, hs]) => hs.a === a).map(([key, hs]) => Object.assign(hs, { key }));
Object.assign(C11_AREAS, {
  lang: { id: 'lang', name: 'Xóm làng Vũ Đại', map: C11_XOM, treeAt: { '19,1': 'cau', '20,2': 'dao', '21,1': 'xoai', '23,1': 'cau', '24,2': 'phuong', '19,4': 'dao', '24,4': 'dao', '12,11': 'xoai', '13,3': 'xoai', '26,3': 'cau', '2,10': 'bamboo', '6,10': 'dao', '20,7': 'cau', '12,16': 'phuong' }, houses: c11HouseList('lang'),
    stalls: [{ x0: 2, by: 8, kind: 'T' }], outExit: [15, 19],
    exits: { '0,9': ['ruong', 18.4, 6.6, '← Nhà mình'], '22,4': ['dinhba', 13.5, 15.4, '↑ Dinh cụ Bá'], '29,9': ['cho', 1.7, 6.6, 'Chợ làng →'], '15,0': ['dinh', 12.5, 13.6, '↑ Đình làng'], '15,19': ['ben', 12.5, 1.7, 'Bến sông ↓'] },
    lane: [[[[-.5, 9], [29.5, 9]], .9], [[[15, -.5], [15, 19.5]], .9], [[[4, 3.4], [4, 5]], .5], [[[9, 3.4], [9, 4.6], [10, 6]], .5], [[[22, 6.3], [22, 8.6]], .7], [[[18, 13.4], [17, 14.5], [15.4, 14.6]], .5]],
    pond: { x: 4.6, y: 13.6, rx: 1.6, ry: .9 } },
  dinh: { id: 'dinh', name: 'Đình làng Vũ Đại', map: C11_DINH, treeAt: { '3,4': 'da', '20,4': 'phuong', '2,10': 'bamboo', '21,10': 'bamboo', '5,2': 'cau', '18,2': 'cau' }, houses: [], stalls: [],
    exits: { '12,15': ['lang', 15.5, 1.7, '↓ Xóm làng'] }, lane: [[[[12, 10.6], [12, 15.5]], .8]], pond: { x: 5.1, y: 13.1, rx: 1.9, ry: .55 } },
  ben: { id: 'ben', name: 'Bến sông', map: C11_BEN, treeAt: { '14,3': 'banana', '2,4': 'banana', '21,8': 'willow', '9,7': 'willow', '15,8': 'bamboo' }, houses: c11HouseList('ben'), stalls: [],
    exits: { '12,0': ['lang', 15.5, 18.2, '↑ Xóm làng'] }, lane: [[[[12, -.5], [12, 8.8]], .8]], pond: { x: 9, y: 11.2, rx: 6, ry: 1.2, ducks: [[6.3, 3.2], [16.8, 3]] } },
});
C11_BEASTS.lang = [['cho', 5.5, 4.6, '#d9a441'], ['ga', 7.5, 5.6, '#c119a5a'], ['ga', 12.5, 7.6, '#f2ecde'], ['trong', 13.5, 8.5], ['lon', 20.5, 14.6], ['ga', 25.5, 10.6, '#8a5a3a'], ['meo', 9.5, 10.6]];
C11_BEASTS.dinh = [['ga', 20.5, 9.5, '#c119a5a'], ['trong', 3.5, 9.5]];
for (const [id, H] of Object.entries(C11_HAMLET_MAPS)) {
  const back = { dongx: [18.3, 6.6], doai: [1.6, 8.6], bai: [21.3, 6.6] }[id], inX = H.side === 'w' ? 1.6 : 28.4;
  C11_AREAS[id] = { id, name: H.name, map: H.m, treeAt: {}, houses: c11HouseList(id), stalls: [], exits: { [H.ex + ',11']: [H.to, back[0], back[1], H.side === 'w' ? '← ' + C11_AREAS[H.to].name.replace(' làng Vũ Đại', '') : C11_AREAS[H.to].name.replace(' làng Vũ Đại', '') + ' →'] },
    lane: [[[[-.5, 5], [30.5, 5]], .8], [[[-.5, 11], [30.5, 11]], .9], [[[-.5, 17], [30.5, 17]], .8], ...[6, 12, 18, 24].map(x => [[[x, 5], [x, 17]], .6])], pond: { x: H.px + 1.5, y: H.py + 1.1, rx: 1.1, ry: .5 } };
  C11_AREAS[H.to].exits[{ dongx: '19,6', doai: '0,8', bai: '23,6' }[id]] = [id, inX, 11.6, H.side === 'w' ? H.name + ' →' : '← ' + H.name];
}
C11_MARKET[6][19] = 'E';                                                            // the ways out to the new hamlets
c11Fill(C11_DINH, 1, 8, 4, 8, 'p'); C11_DINH[8][0] = 'E'; C11_AREAS.dinh.lane.push([[[-.5, 8], [5, 8.4]], .7]);
c11Fill(C11_BEN, 13, 6, 22, 6, 'p'); C11_BEN[6][23] = 'E'; C11_AREAS.ben.lane.push([[[12, 6], [23.5, 6]], .7]);
C11_BEASTS.dongx = [['ga', 8.5, 7.6, '#c119a5a'], ['cho', 15.5, 12.6], ['meo', 21.5, 6.6]]; C11_BEASTS.doai = [['ga', 20.5, 13.6, '#f2ecde'], ['trong', 9.5, 7.6], ['lon', 26.5, 18.4]]; C11_BEASTS.bai = [['trau', 10.5, 18.4], ['ga', 16.5, 7.6, '#8a5a3a'], ['cho', 4.5, 12.6]];
C11_BEASTS.ben = [['trau', 7.5, 6.4], ['trau', 16.5, 7.4], ['bo', 4.5, 7.4], ['cho', 13.5, 4.5]];
const C11_SPOTS = {
  dongx: [[4, 6], [10, 12], [16, 6], [22, 12], [27, 18], [12, 13]], doai: [[4, 12], [10, 6], [16, 12], [22, 6], [27, 12], [18, 13]], bai: [[4, 6], [10, 12], [16, 18], [22, 6], [27, 12], [6, 13]],
  lang: [[3, 10], [8, 10], [13, 8], [17, 8], [21, 10], [25, 10], [15, 5], [15, 14], [21, 15], [6, 8], [13, 15], [24, 8]],
  cho: [[4, 7], [8, 7], [12, 8], [15, 7], [18, 7], [10, 10], [7, 12], [12, 12]],
  dinh: [[8, 8], [11, 9], [13, 9], [16, 9], [7, 10], [17, 10], [12, 12], [20, 11]],
  ben: [[3, 8], [6, 7], [10, 8], [13, 8], [17, 7], [19, 8], [12, 5], [7, 5]],
};

/* ---------- the people ---------- */
const C11_STORY_AT = [2, 4, 6, 8, 10];
const C11_TEMPER_NAME = { hien: 'hiền lành', nong: 'nóng tính', keo: 'keo kiệt', lam: 'lắm điều', vui: 'vui tính', ru: 'rụt rè', cham: 'chăm chỉ', luoi: 'lười biếng', chu: 'hay chữ', say: 'nghiện rượu', tham: 'tham lam', the: 'thật thà', kieu: 'kiêu kỳ', lo: 'lo xa', buon: 'u buồn', khoac: 'khoác lác', khon: 'khôn lỏi', kho: 'khó tính', it: 'ít nói', lua: 'lắm mưu' };
/* what each temper says to a stranger, to someone known (2–5 hearts), to a friend (6+); {Y} = someone they know */
const C11_TEMPER = {
  hien: [['Chào anh, anh mới về làng à?', 'Trời hôm nay đẹp anh nhỉ.', 'Đi đâu mà vội thế, đường làng có chạy mất đâu.'], ['Anh ăn cơm chưa? Ghé nhà tôi ăn tạm bát cơm.', 'Có rau ngoài vườn, anh cần thì cứ hái.', 'Hôm qua tôi thấy anh tưới ruộng từ sớm, chăm thật.'], ['Gặp anh là tôi vui cả ngày.', 'Anh như người nhà rồi, khách sáo làm gì.', 'Nhà tôi có nồi chè, tối anh qua ăn nhé.']],
  nong: [['Gì? Có việc thì nói nhanh.', 'Đừng đứng chắn đường.', 'Nhìn gì mà nhìn?'], ['Ừ, hôm nay tôi không bực lắm.', 'Anh cũng được đấy, không như bọn kia.', 'Thằng {Y} lại làm tôi điên tiết, mà thôi.'], ['Ai bắt nạt anh cứ bảo tôi.', 'Tôi nóng thế thôi, chứ quý anh thật.', 'Cả làng này tôi chỉ chịu mỗi anh.']],
  keo: [['Không mua gì thì đừng hỏi giá.', 'Đồ nhà tôi không cho mượn đâu.', 'Chào... mà anh không định vay tiền đấy chứ?'], ['Hôm nay tôi mua được mớ rau rẻ, vui!', 'Anh tiết kiệm như tôi thì giàu to.', 'Mỡ để dành mãi rồi cũng thành của.'], ['Cầm lấy củ khoai này... tôi không cho ai đâu đấy.', 'Với anh thì tôi không tính toán.', 'Nói nhỏ nhé, tôi chôn ít tiền dưới gốc chuối. Đừng kể ai!']],
  lam: [['Anh là người mới à? Nhà ở đâu? Có vợ chưa?', 'Ơ, anh có nghe chuyện gì chưa?', 'Làng này chuyện gì tôi cũng biết, hỏi tôi.'], ['Nghe nói nhà {Y} sắp có chuyện to.', 'Đừng nói là tôi kể nhé, nhưng mà...', 'Hôm qua tôi thấy hai người đứng thì thầm ở gốc đa, lạ lắm.'], ['Chuyện này tôi chỉ kể với anh thôi đấy.', 'Cả làng nói gì về anh, tôi cũng bênh.', 'Anh mà đi vắng là tôi chẳng biết kể chuyện với ai.']],
  vui: [['Ha ha, anh trông lạ mặt thế!', 'Hôm nay có gì vui không anh?', 'Cười cái nào, mặt anh căng như dây đàn.'], ['Con lợn nhà {Y} sổng chuồng chạy khắp xóm, buồn cười lắm.', 'Cười lên anh ơi, một nụ cười bằng mười thang thuốc bổ.', 'Tôi vừa nghĩ ra câu đố: con gì càng to càng nhỏ? Con cua đấy!'], ['Có anh ở làng vui hẳn ra.', 'Tối nay ra đình hát trống quân với tôi không?', 'Anh mà đi xa, tôi buồn thối ruột.']],
  ru: [['À... chào... chào anh.', 'Tôi... tôi đang bận.', '...'], ['Hôm nay tôi dám nói chuyện với anh lâu hơn rồi đấy.', 'Anh đừng kể với ai là tôi hay đứng một mình nhé.', 'Anh có thấy trời chiều nay đẹp không...'], ['Với anh thì tôi không ngại nữa.', 'Tôi có đan một cái nhỏ tặng anh... à thôi, lần sau.', 'Cảm ơn anh hay nói chuyện với tôi.']],
  cham: [['Đang dở việc, chào anh nhé.', 'Làm sớm còn kịp về nấu cơm.', 'Một ngày không làm là một ngày đói.'], ['Anh chăm thế, ruộng nhà anh chắc tốt lắm.', 'Nghỉ tay một lát nói chuyện cũng được.', 'Cuốc kỹ thì cây mới bén rễ.'], ['Hôm nào cần người giúp gặt, anh cứ gọi tôi.', 'Làm với anh, việc nặng cũng thấy nhẹ.', 'Anh nghỉ đi, làm quá là ốm đấy.']],
  luoi: [['Ngáp... chào anh.', 'Việc gì để mai hẵng làm.', 'Trời nóng thế này mà anh vẫn đi được à?'], ['Nằm võng dưới gốc đa là sướng nhất.', 'Anh làm gì mà vội thế, ngồi chơi đã.', 'Hôm nay tôi định làm... mà thôi, mai.'], ['Vì anh mà tôi định chăm chỉ... từ tuần sau.', 'Anh tốt với tôi quá, tôi ngại.', 'Tôi để phần anh cái chõng tre mát nhất đấy.']],
  chu: [['Kẻ sĩ gặp nhau, xin chào.', 'Anh có biết chữ không?', 'Đi một ngày đàng, học một sàng khôn.'], ['Học ăn, học nói, học gói, học mở.', 'Người quân tử biết lắng nghe.', 'Chữ tâm kia mới bằng ba chữ tài.'], ['Tri kỷ khó tìm, gặp được anh là may.', 'Tôi chép tặng anh mấy câu thơ, treo trong nhà cho vui.', 'Bàn chuyện với anh, tôi quên cả đói.']],
  say: [['Hức... anh là ai?', 'Có rượu không? Không à... thế thôi.', 'Đường làng hôm nay sao cứ nghiêng nghiêng.'], ['Hôm nay tôi mới uống có một chén thôi.', 'Rượu nhạt, đời cũng nhạt.', 'Nhà {Y} nấu rượu ngon nhất làng đấy.'], ['Vì anh mà tôi uống ít lại đấy.', 'Anh là bạn tôi, bạn thật.', 'Hôm nay tôi chưa uống giọt nào! Anh khen tôi đi.']],
  tham: [['Anh có gì bán rẻ không?', 'Đất nhà anh rộng nhỉ.', 'Làm ăn thì phải khôn, anh ạ.'], ['Mối hời này tôi rủ anh cùng làm.', 'Tiền vào như nước, chỉ cần khôn.', 'Nhà {Y} sắp bán ruộng, giá hời lắm.'], ['Tôi cũng biết điều đấy, không lừa anh đâu.', 'Hoá ra có bạn còn quý hơn có tiền.', 'Lần đầu tôi cho không ai cái gì đấy.']],
  the: [['Chào anh, tôi nói thật lòng nhé.', 'Tôi không biết nói khéo, anh bỏ quá cho.', 'Anh trông hiền, chắc không phải người xấu.'], ['Ai hỏi gì tôi nói nấy, không giấu.', 'Anh tốt thật, tôi nhìn là biết.', 'Hôm qua tôi nhặt được đồng xu, đem trả ông từ rồi.'], ['Có gì khó anh cứ nói, tôi giúp hết sức.', 'Quen anh tôi thấy yên tâm.', 'Anh là người tôi tin nhất làng.']],
  kieu: [['Ai cho anh nói chuyện với tôi?', 'Nhà tôi khác với nhà người ta.', 'Đừng đứng gần, bụi lắm.'], ['Anh cũng không đến nỗi quê mùa.', 'Thôi được, tôi tiếp chuyện anh một lát.', 'Áo này may bằng lụa Hà Đông đấy, anh có biết không?'], ['Anh là người hiếm hoi tôi coi ra gì.', 'Đừng kể ai là tôi cũng biết cười nhé.', 'Thật ra tôi cũng cô đơn lắm.']],
  lo: [['Trời này sắp mưa đấy, anh mang áo tơi chưa?', 'Cẩn thận, dạo này trộm nhiều.', 'Anh khoá cửa chưa đấy?'], ['Để dành được đồng nào hay đồng ấy.', 'Anh nhớ tích thóc phòng năm hạn.', 'Nghe nói sắp có lụt, tôi lo quá.'], ['Có anh ở gần tôi yên tâm hơn.', 'Năm nay tôi bớt lo được một chút rồi.', 'Anh nhớ giữ sức khoẻ, đừng làm khuya.']],
  buon: [['Chào anh...', 'Trời hôm nay u ám quá.', 'Anh đi đi, tôi muốn ngồi một mình.'], ['Có những chuyện nói ra cũng chẳng ai hiểu.', 'Anh có bao giờ nhớ một người chưa?', 'Tiếng sáo chiều nay buồn quá.'], ['Ngồi với anh tôi thấy nhẹ lòng.', 'Anh đừng đi vội, ngồi thêm chút nữa.', 'Lâu lắm rồi tôi mới cười được.']],
  khoac: [['Anh biết tôi là ai không?', 'Chuyện này nhỏ, tôi làm trong một nốt nhạc.', 'Ở trên tỉnh người ta nể tôi lắm.'], ['Hồi xưa tôi từng... à mà chuyện dài lắm.', 'Anh nghe tôi kể chuyện đánh hổ chưa?', 'Cả huyện này chẳng ai bằng tôi.'], ['Với anh thì tôi nói thật: tôi nói phét nhiều lắm.', 'Anh là người duy nhất không cười tôi.', 'Bạn thật thì không cần khoe.']],
  khon: [['Ồ, anh đấy à. Ngồi chơi, ngồi chơi.', 'Làng có lệ làng, anh nhớ cho.', 'Trẻ người thì nên nghe lời người già.'], ['Anh làm ăn khá đấy. Cần gì cứ tìm tôi.', 'Người khôn ăn nói nửa chừng, anh ạ.', 'Một điều nhịn là chín điều lành.'], ['Anh hợp ý tôi lắm.', 'Có việc lớn, tôi chỉ tin anh.', 'Già rồi, quý nhất là người thật lòng.']],
  kho: [['Hừ.', 'Lại ai đây?', 'Có việc gì thì nói, tôi không rảnh.'], ['Hôm nay trông anh cũng tươm tất.', 'Anh không đến nỗi tệ.', 'Thời buổi này người tử tế hiếm lắm.'], ['Thôi được, tôi công nhận anh là người tốt.', 'Ngồi xuống, tôi pha ấm chè.', 'Đừng để tôi phải lo cho anh.']],
  it: [['Ừm.', 'Chào.', '...'], ['Ừ, được.', 'Hôm nay nắng.', 'Anh làm tốt.'], ['Anh là bạn.', 'Cảm ơn.', 'Ngồi đi.']],
  lua: [['Ồ, quý nhân đây rồi!', 'Để tôi xem tướng anh nào... phúc hậu lắm.', 'Anh có muốn biết vận hạn năm nay không?'], ['Anh tin tôi đi, tôi không lừa ai bao giờ... ít khi thôi.', 'Muốn yên thì phải cúng, mà cúng thì phải có lễ.', 'Nhà {Y} sắp gặp hạn đấy.'], ['Với anh thì tôi nói thật, chẳng có ma quỷ gì đâu.', 'Anh hiểu tôi hơn ai hết.', 'Tôi định bỏ nghề này, làm gì đó tử tế.']],
};
const C11_TIME_LINES = [[0, 9.5, ['Sáng sớm sương còn đẫm cỏ.', 'Anh ăn sáng chưa?', 'Gà gáy từ canh tư, tôi dậy từ đấy.']], [11, 13.5, ['Trưa nắng quá, nghỉ tay đã.', 'Đến bữa trưa rồi, về ăn cơm thôi.']], [17, 20, ['Chiều rồi, về thổi cơm thôi.', 'Hoàng hôn trên sông đẹp lắm.', 'Khói bếp lên rồi, nhà ai nấu cá thơm thế.']], [20, 30, ['Khuya rồi, sao anh còn đi lang thang?', 'Trăng lên rồi kìa.']]];
/* what each trade talks about */
const C11_TRADE_LINES = {
  'tá điền': ['Ruộng là của nhà cụ Bá, thóc mình chỉ được ba phần.', 'Mùa này mà được, tôi mua cho con cái áo mới.'],
  'cày thuê': ['Con trâu với cái cày, thế là cả gia tài.', 'Đất bãi bồi bên sông dễ cày lắm.'],
  'chài lưới': ['Nước lên rồi, cá về nhiều.', 'Lưới rách phải vá cả đêm.'],
  'kéo vó': ['Một mẻ vó được dăm con tép là may.', 'Ngồi kéo vó cả ngày, mỏi lưng lắm.'],
  'lái đò': ['Sang sông một xu, không có thì nợ.', 'Đêm qua sông nổi gió, đò suýt lật.'],
  'thợ gốm': ['Đất sét bờ sông dẻo, nặn nồi tốt lắm.', 'Lò gốm mà tắt lửa là hỏng cả mẻ.'],
  'mò cua bắt ốc': ['Ốc bươu ở ruộng chiêm to bằng nắm tay.', 'Cua đồng giã nấu canh rau đay, mát cả người.'],
  'bán rau': ['Rau sáng nay mới hái, còn đẫm sương.', 'Mớ rau muống này cả nhà ăn ba bữa.'],
  'bán cá': ['Cá chép sông này to nhất vùng.', 'Mua cá về kho với riềng, ăn hao cơm lắm.'],
  'hàng xén': ['Kim chỉ, gương lược, gì cũng có.', 'Mấy cô hay mua sáp bôi tóc của tôi lắm.'],
  'bán bún': ['Bún riêu cua nóng đây!', 'Bún phải ăn với mắm tôm mới đúng vị.'],
  'đồ tể': ['Thịt lợn mới mổ sáng nay.', 'Cụ Bá đặt mua cả cái thủ lợn cho giỗ.'],
  'thầy lang': ['Ốm thì phải uống thuốc, đừng tin bùa.', 'Ngải cứu với gừng là thuốc quý trong vườn nhà.'],
  'phó cạo': ['Cạo đầu, ráy tai, một hào thôi.', 'Ngồi ghế cắt tóc là người ta kể đủ chuyện làng.'],
  'buôn chuyến': ['Mai tôi lên tỉnh, anh cần gì tôi mua hộ.', 'Hàng trên tỉnh lạ lắm, có cả đèn không cần dầu.'],
  'bán trầu cau': ['Miếng trầu là đầu câu chuyện.', 'Cau non thì ngọt, trầu không thì cay.'],
  'bán nồi đất': ['Nồi đất kho cá là thơm nhất.', 'Ấm đất pha chè, nước ngọt hơn.'],
  'thợ mộc': ['Gỗ lim chắc như sắt.', 'Làm cái chõng tre mất ba ngày, ngồi được ba đời.'],
  'thợ nhuộm': ['Củ nâu nhuộm áo, càng giặt càng bền màu.', 'Tay tôi nhuộm mãi giờ thâm như củ nâu.'],
  'dệt vải': ['Khung cửi kêu lách cách cả đêm.', 'Một tấm vải mất nửa tháng dệt.'],
  'đan rổ rá': ['Tre làng mình dẻo, đan rổ bền lắm.', 'Anh cần cái thúng không, tôi đan cho.'],
  'nấu rượu': ['Rượu nếp cái hoa vàng là nhất.', 'Bã rượu nuôi lợn, lợn béo nhanh.'],
  'làm đậu phụ': ['Đậu phụ phải xay từ đêm.', 'Chấm mắm tôm là hết sảy.'],
  'ươm tơ': ['Kén vàng óng thế này là tơ tốt.', 'Mùi nhộng luộc thơm cả xóm.'],
  'làm tương': ['Tương phải phơi đủ nắng mới ngọt.', 'Chum tương nhà tôi để ba năm rồi.'],
  'tuần đinh': ['Đêm nay tôi đi tuần, có gì cứ gọi.', 'Dạo này hay mất gà, phải canh kỹ.'],
  'phó lý': ['Sổ đinh của làng tôi giữ đấy.', 'Có việc kiện cáo thì phải ra đình.'],
  'kiếm củi': ['Củi khô bờ sông dễ cháy.', 'Gánh củi này đổi được hai bát gạo.'],
  'hái thuốc': ['Rừng trúc có nhiều cây thuốc lắm.', 'Mộc nhĩ, nấm hương phải hái sau mưa.'],
  'ngồi lê đôi mách': ['Ngồi đây xem ai đi qua cho vui.', 'Nhà {Y} hôm qua cãi nhau to lắm.'],
  'trông cháu': ['Thằng cháu nghịch như quỷ sứ.', 'Già rồi, trông cháu là vui nhất.'],
  'bốc thuốc nam': ['Thuốc nam chữa bệnh bằng cây cỏ quanh nhà.', 'Tía tô giải cảm, kinh giới trừ phong.'],
  'têm trầu': ['Trầu têm cánh phượng phải khéo tay.', 'Ăn miếng trầu cho thắm môi.'],
  'kể chuyện cổ': ['Ngày xửa ngày xưa, ở làng này có một con rồng...', 'Gốc đa đầu làng có ông thần giữ làng đấy.'],
  'đánh cờ tướng': ['Pháo đầu, mã nhảy... thắng rồi!', 'Anh có biết chơi cờ không? Ngồi đây một ván.'],
  'làm vườn': ['Vườn nhà có ổi, có chuối, đủ ăn quanh năm.', 'Trồng cây thì phải kiên nhẫn.'],
  'chăn trâu': ['Con trâu nhà cháu khôn lắm, gọi là về.', 'Ngồi lưng trâu thổi sáo là sướng nhất.'],
  'đi học chữ': ['Hôm nay thầy dạy chữ "Nhân".', 'Cháu viết chữ còn xấu lắm.'],
  'trông em': ['Em cháu ngủ rồi, cháu được chơi một lát.', 'Mẹ đi chợ, cháu ở nhà trông em.'],
  'bắt cua': ['Cháu bắt được ba con cua rồi!', 'Hang cua sâu lắm, phải thò tay vào.'],
  'thả diều': ['Diều cháu bay cao nhất xóm!', 'Gió nam thổi là thả diều được.'],
};
const C11_TRADES = {
  a: [['tá điền', 'ben', ['com', 'ruou_trang', 'khoai_luoc']], ['cày thuê', 'ben', ['xoi_do', 'ruou_nep', 'thit_kho']], ['chài lưới', 'ben', ['ruou_trang', 'day_thung', 'ca_kho']], ['kéo vó', 'ben', ['ca_nuong', 'ruou_trang', 'vo']],
    ['lái đò', 'ben', ['nuoc_che_xanh', 'ao_toi', 'non_la']], ['thợ gốm', 'ben', ['dat_set', 'than', 'che_kho']], ['mò cua bắt ốc', 'ben', ['bun_rieu', 'canh_cua', 'oc_luoc']], ['bán rau', 'cho', ['h_cai', 'canh_mung_toi', 'rau_muong_xao']],
    ['bán cá', 'cho', ['nuoc_mam', 'ca_kho', 'ruou_trang']], ['hàng xén', 'cho', ['keo_lac', 'mut_gung', 'quat_mo']], ['bán bún', 'cho', ['bun_rieu', 'mam_tom', 'tuong_ot']], ['đồ tể', 'cho', ['ruou_trang', 'gio_lua', 'thit_kho']],
    ['thầy lang', 'cho', ['ngai_cuu', 'gung', 'mat_ong_rung']], ['phó cạo', 'cho', ['che_kho', 'am_dat', 'dau_lac']], ['buôn chuyến', 'cho', ['lua_ha_dong', 'dong_ho', 'ruou_mo']], ['bán trầu cau', 'cho', ['trap_trau', 'binh_voi', 'vo_oc']],
    ['bán nồi đất', 'cho', ['noi_dat', 'am_dat', 'chum']], ['thợ mộc', 'lang', ['go', 'tuong_go', 'ruou_nep']], ['thợ nhuộm', 'lang', ['cu_nau', 'son_ta', 'vai_mo']], ['dệt vải', 'lang', ['to_tam', 'soi_gai', 'khung_cui']],
    ['đan rổ rá', 'lang', ['tre', 'may', 'coi']], ['nấu rượu', 'lang', ['gao_nep', 'lo_ruou', 'ruou_mo']], ['làm đậu phụ', 'lang', ['dau_phu_mam_tom', 'mam_tom', 'dau_lac']], ['ươm tơ', 'lang', ['ken_tam', 'to_tam', 'che_hat_sen']],
    ['làm tương', 'lang', ['tuong_ban', 'gao_nep', 'mat_mia']], ['tuần đinh', 'dinh', ['ruou_trang', 'thit_kho', 'trung_vit_lon']], ['phó lý', 'dinh', ['che_uop_sen', 'giay_do', 'ruou_thuoc']], ['kiếm củi', 'ben', ['cui_kho', 'khoai_nuong', 'ruou_trang']],
    ['hái thuốc', 'cho', ['nam_huong', 'ngai_cuu', 'mat_ong_rung']]],
  o: [['ngồi lê đôi mách', 'lang', ['trap_trau', 'keo_lac', 'nuoc_che_xanh']], ['trông cháu', 'lang', ['banh_troi', 'che_do_den', 'keo_lac']], ['bốc thuốc nam', 'cho', ['tia_to', 'kinh_gioi', 'gung']], ['têm trầu', 'dinh', ['trap_trau', 'binh_voi', 'che_kho']],
    ['kể chuyện cổ', 'dinh', ['che_kho', 'banh_giay', 'tranh_dong_ho']], ['đánh cờ tướng', 'dinh', ['che_uop_sen', 'ruou_thuoc', 'quat_giay']], ['làm vườn', 'lang', ['h_bi', 'phan_bon', 'khoai_luoc']]],
  c: [['chăn trâu', 'ben', ['ngo_nuong', 'khoai_nuong', 'sim']], ['đi học chữ', 'dinh', ['giay_do', 'keo_lac', 'banh_troi']], ['trông em', 'lang', ['keo_lac', 'banh_troi', 'oi_dai']], ['bắt cua', 'ben', ['ngo_luoc', 'sim', 'mua']], ['thả diều', 'lang', ['keo_lac', 'ngo_nuong', 'giay_do']]],
};
/* little life stories for the villagers drawn from the pools: three lines, told at 2, 4 and 6 hearts ({Y} = a neighbour) */
const C11_ARCS = [
  ['Hồi trẻ tôi thương một người bên kia sông.', 'Nhà người ta chê tôi nghèo, gả đi nơi khác.', 'Giờ mỗi lần ra bến, tôi vẫn ngó sang bên ấy.'],
  ['Nhà tôi nợ cụ Bá ba thúng thóc từ năm hạn.', 'Lãi mẹ đẻ lãi con, giờ thành ba mươi thúng rồi.', 'Mùa này mà mất, chắc phải gán ruộng cho cụ thôi.'],
  ['Nhà tôi với nhà {Y} không nhìn mặt nhau.', 'Chỉ vì cái bờ ruộng lấn sang nửa gang tay.', 'Thật ra tôi nhớ {Y} lắm, mà chẳng ai chịu làm lành trước.'],
  ['Đêm qua nhà tôi lại mất một con gà mái.', 'Có người bảo thấy {Y} lảng vảng đầu ngõ.', 'Mà sáng ra tôi thấy dấu chân nhỏ, không giống chân người...'],
  ['Thằng con tôi đi phu cao su trong Nam.', 'Ba năm rồi không có lấy một lá thư.', 'Anh biết chữ thì viết giúp tôi lá thư, tôi đội ơn.'],
  ['Tối qua đi qua đình, tôi thấy ánh đèn le lói.', 'Ông từ bảo không có ai, mà tôi nghe rõ tiếng khóc.', 'Người ta bảo là hồn cô gái nhảy giếng năm nào... tôi không dám nghĩ nữa.'],
  ['Ông nội tôi chôn một hũ bạc trước khi mất.', 'Ông chỉ dặn: chỗ nào gà gáy sớm nhất.', 'Tôi đào khắp vườn rồi, chỉ được toàn sỏi.'],
  ['Vợ tôi bỏ đi theo một anh lái buôn.', 'Để lại thằng cu mới ba tuổi.', 'Hôm qua có người thấy cô ấy ở chợ huyện, gầy lắm.'],
  ['Chồng tôi mê xóc đĩa ở nhà {Y}.', 'Thua sạch cả tiền bán lợn.', 'Tôi giấu được ít gạo dưới gầm giường, không dám cho ai biết.'],
  ['Năm ngoái con bé nhà tôi phải đi ở cho nhà giàu.', 'Mỗi tháng nó được về một lần, gầy rộc đi.', 'Tôi dành dụm từng đồng, đủ tiền là chuộc nó về.'],
  ['Có người gửi tôi giữ một cái tráp, dặn không được mở.', 'Đã hai năm, người ấy không quay lại.', 'Đêm nào tôi cũng muốn mở ra xem... mà thôi.'],
  ['Cân của {Y} ngoài chợ thiếu ba lạng mỗi cân.', 'Tôi thấy tận mắt, mà nói ra ai tin.', 'Lần sau anh ra chợ thì để ý cái quả cân giúp tôi.'],
  ['Con trâu nhà tôi đi lạc từ đầu tháng.', 'Có người thấy nó gần bến sông.', 'Không có trâu thì mùa này lấy gì mà cày.'],
  ['Mẹ chồng tôi khó tính lắm, nồi cơm cũng chê.', 'Hôm qua bà ngã, tôi cõng bà đi thầy lang.', 'Bà nắm tay tôi khóc. Lần đầu bà gọi tôi là con.'],
  ['Mụ đồng bảo nhà tôi có ma, phải cúng ba con gà.', 'Cúng xong, thằng bé vẫn ốm.', 'Thầy lang bảo nó chỉ bị giun. Tôi tiếc ba con gà quá.'],
  ['Năm kia nhà tôi cháy rụi vì một đốm lửa bếp.', 'Cả xóm góp tre, góp rơm dựng lại cho.', 'Tôi chưa trả được ơn ai, cứ nghĩ là áy náy.'],
  ['Tôi có một người em sinh đôi, thất lạc từ năm lụt.', 'Người ta bảo em tôi làm thuê trên tỉnh.', 'Anh có gặp ai giống hệt tôi thì báo tôi nhé.'],
  ['Cha mẹ gả tôi năm mười hai tuổi, chồng tôi mới lên tám.', 'Tôi vừa làm vợ vừa làm chị, cõng chồng đi chơi.', 'Giờ nó lớn rồi, lại chê tôi già. Đời thế đấy.'],
  ['Mấy hôm nay mất cái vòng bạc mẹ để lại.', 'Cả nhà nghi đứa ở, nó khóc mà thề không lấy.', 'Sáng nay tôi thấy con quạ tha cái gì sáng loáng lên cây...'],
  ['Ruộng nhà tôi ở cuối mương, nước chẳng bao giờ tới.', 'Nhà {Y} đắp bờ chặn mất nước.', 'Năm nay mà còn thế, tôi đành đi kiện lên tổng.'],
  ['Thằng con cả bán mất mảnh ruộng hương hoả.', 'Lấy tiền lên tỉnh buôn bán, lỗ sạch.', 'Mồ mả ông bà giờ nằm trên đất người ta.'],
  ['Tôi muốn đi lính để có lương nuôi mẹ.', 'Mẹ tôi khóc, bảo đi lính là đi không về.', 'Tôi ở lại, cấy thuê thêm mấy sào nữa vậy.'],
  ['Ông anh họ tôi làm thông ngôn trên tỉnh, giàu lắm.', 'Về làng ông ấy đi qua nhà tôi mà không vào.', 'Nghèo thì họ hàng cũng xa, anh ạ.'],
  ['Nong tằm nhà tôi chết cả lứa.', 'Người ta bảo do lá dâu nhà {Y} phun gì đó.', 'Tôi không tin, chắc tại trời nồm thôi.'],
  ['Tôi mơ được đi học chữ như người ta.', 'Nhà nghèo, tôi đi chăn trâu từ bé.', 'Tối nào tôi cũng lấy que viết xuống đất mấy chữ học lỏm.'],
  ['Tôi với {Y} hứa hẹn với nhau từ hồi đi cấy.', 'Nhà tôi chê nhà ấy không môn đăng hộ đối.', 'Đêm rằm này chúng tôi định trốn lên tỉnh... anh đừng nói với ai.'],
  ['Có một ông lạ mặt hay hỏi đường đến nhà cụ Bá.', 'Ông ta mang theo một cuộn giấy niêm phong.', 'Hôm sau ông ấy biến mất, chỉ còn cái nón rơi ở bờ ao.'],
  ['Năm lụt ấy, nước ngập đến mái nhà.', 'Tôi ôm thằng em bám vào cây gạo suốt hai ngày.', 'Từ đấy tôi sợ tiếng nước chảy về đêm.'],
  ['Tôi nợ {Y} một món tiền, mà {Y} chẳng bao giờ đòi.', 'Càng không đòi tôi càng thấy nặng lòng.', 'Mùa này bán được thóc, tôi sẽ mang trả cả gốc lẫn lãi.'],
  ['Đêm đêm tôi nghe tiếng sáo từ phía rừng trúc.', 'Đi theo thì chẳng thấy ai, chỉ thấy một nấm mộ không tên.', 'Tôi đặt một bát cơm ở đấy. Từ hôm ấy không nghe sáo nữa.'],
  ['Anh thầy lang ngoài chợ bán cho tôi thuốc giả.', 'Mẹ tôi uống vào ốm thêm.', 'Tôi đã nhặt lại bã thuốc, ai biết thì xem giúp tôi.'],
  ['Chồng tôi bị bắt đi phu làm đường xe lửa.', 'Đã sáu tháng, tiền công không thấy, người cũng không về.', 'Tôi vẫn để phần bát cơm của anh ấy trên mâm.'],
];
const C11_ARCS_KID = [
  ['Cháu bắt được con dế chọi to nhất xóm!', 'Thằng {Y} đòi đổi con dế lấy cái diều.', 'Cháu thả con dế đi rồi. Nó kêu buồn quá.'],
  ['Cháu muốn đi học chữ với thầy đồ.', 'Nhưng phải ở nhà trông em, chăn trâu.', 'Thầy đồ bảo cháu sáng dạ lắm đấy!'],
  ['Đêm qua cháu thấy ma ở gốc đa!', 'Hoá ra là cái áo tơi bác nào phơi.', 'Nhưng mà cháu vẫn sợ, chú đi cùng cháu nhé.'],
  ['Mẹ cháu ốm, cháu đi mò cua nấu cháo.', 'Cháu chỉ bắt được ba con.', 'Chú ơi, chú chỉ cháu chỗ nào nhiều cua đi.'],
  ['Cháu nuôi một con chim sáo biết nói.', 'Nó nói được "chào chú" đấy.', 'Hôm qua nó bay mất rồi, chú có thấy không?'],
  ['Cháu có một hòn bi ve đẹp lắm.', 'Cháu nhặt được ở sân đình.', 'Cháu tặng chú đấy, đừng kể với ai nhé!'],
];
/* the people of the old stories: id, name, role (a adult / o old / c child), mouse sort, trade, temper, home house, where they
   work and where they go when free, what they love and hate, their own lines, and five story lines (2, 4, 6, 8, 10 hearts) */
const C11_STORY_PPL = [
  { id: 'ba', name: 'cụ Bá Kiến', role: 'o', sort: 26, trade: 'chánh tổng', temper: 'khon', home: 'ba', work: 'dinh', free: 'lang', love: ['ruou_thuoc', 'che_uop_sen', 'an_trieu'], hate: ['rac', 'ruou_trang'],
    lines: ['Trẻ người non dạ, cứ nghe lời già này thì không thiệt đâu.', 'Ruộng nhà anh tốt đấy... bán cho tôi thì được giá hời.', 'Ở làng này, việc gì cũng phải qua tay tôi.'],
    story: ['Tôi ngồi ghế chánh tổng ba mươi năm, anh biết vì sao không? Kẻ cứng thì tôi nhún, kẻ mềm thì tôi ép.', 'Mai anh mang giùm tôi phong thư lên huyện. Nhớ đừng bóc, chuyện của người lớn.', 'Cả làng này nợ tôi. Cuốn sổ trong rương kia ghi đủ từng hạt thóc... à mà thôi, nói nhiều quá.', 'Đêm nào tôi cũng mơ thấy người ta đến đòi nợ tôi. Lạ thật, người nợ là họ cơ mà.', 'Già rồi mới biết, tiền đầy rương mà không ai thật lòng ngồi uống với mình một chén.'] },
  { id: 'baba', name: 'bà Ba', role: 'a', sort: 14, trade: 'vợ ba cụ Bá', temper: 'buon', home: 'ba', work: 'lang', free: 'cho', love: ['lua_ha_dong', 'tram_cai', 'khan_tay_theu'], hate: ['phan_chuong'],
    lines: ['Nhà to cửa rộng mà sao lạnh thế không biết.', 'Ra chợ một lúc thôi, kẻo bà Cả lại bắt lỗi.', 'Trầu têm cánh phượng đây, anh ăn một miếng không?'],
    story: ['Tôi về làm lẽ năm mười bảy tuổi. Cha mẹ bảo thế là phúc.', 'Hồi con gái tôi hát quan họ hay nhất xóm, có người hẹn mùa sau sẽ sang hỏi.', 'Tôi viết một lá thư cho người ấy mà chưa bao giờ dám gửi. Nó vẫn nằm dưới đáy tráp.', 'Anh có đi qua làng bên, thì xem giúp người ấy còn sống không. Chỉ cần biết thế thôi.', 'Tôi đốt lá thư rồi. Từ nay tôi sống cho tôi, không cho ai bắt nạt nữa.'] },
  { id: 'cuong', name: 'Lý Cường', role: 'a', sort: 3, trade: 'con trai cụ Bá', temper: 'nong', home: 'ba', work: 'cho', free: 'lang', love: ['ruou_nep', 'thit_kho', 'gio_lua'], hate: ['rau_muong_luoc'],
    lines: ['Tránh ra! Đường làng chứ có phải đường nhà mày đâu.', 'Cha tao là chánh tổng, biết chưa?', 'Hôm nay tao vui, tha cho mày.'],
    story: ['Từ bé ai cũng sợ tao vì cha tao. Chưa ai chơi với tao vì tao cả.', 'Thằng Chí ngày xưa là tá điền nhà tao. Hồi đó nó hiền khô... rồi cha tao cho nó đi tù.', 'Con trâu của bà goá Tư là tao bắt về gán nợ. Bà ấy khóc cả đêm ngoài cổng.', 'Mày nói đúng, bắt nạt đàn bà goá thì có gì đáng mặt đàn ông.', 'Tao trả lại con trâu cho bà Tư rồi. Cha tao chửi một trận, kệ.'] },
  { id: 'tao', name: 'Đội Tảo', role: 'a', sort: 20, trade: 'người thu thuế', temper: 'tham', home: 'tao', work: 'dinh', free: 'cho', love: ['ruou_trang', 'thit_kho', 'tien_bao_dai'], hate: ['khoai_luoc'],
    lines: ['Thuế thân năm nay tăng, nhà nào thiếu thì liệu hồn.', 'Tôi chỉ làm theo lệnh trên thôi nhé.', 'Có lòng thì biếu, tôi không nhận đâu... mà thôi, để đấy.'],
    story: ['Anh tưởng tôi sung sướng à? Thu thiếu thì trên huyện quở, thu đủ thì dưới làng chửi.', 'Nhà anh Dậu còn thiếu suất sưu của người em đã chết. Luật là luật.', 'Tôi giữ lại một phần tiền sưu. Ai mà chẳng thế, anh đừng nhìn tôi như vậy.', 'Đêm qua tôi thấy chị Dậu ngồi khóc trước đình. Tôi quay đi, không dám nhìn.', 'Năm nay tôi xin khất sưu cho mấy nhà nghèo nhất. Bị cắt lương cũng được.'] },
  { id: 'chi', name: 'anh Chí', role: 'a', sort: 7, trade: 'không nghề, rượu chè', temper: 'say', home: 'chi', work: 'lang', free: 'cho', wake: 9, sleep: 25, love: ['chao_hanh', 'ruou_nep', 'ca_nuong'], hate: ['bua_chu'],
    lines: ['Nhìn cái gì? Chưa thấy người say bao giờ à?', 'Cả làng này... ai cũng ghét tao. Thì tao chửi lại!', 'Đưa đây chén rượu, rồi muốn gì thì nói.'],
    story: ['Mày không sợ tao à? Lạ thật. Ai thấy tao cũng tránh như tránh hủi.', 'Tối qua tao ngủ quên ngoài bờ ao. Sáng ra có cái áo đắp trên người. Mày đấy phải không?', 'Ngày xưa tao cũng hiền, cũng mơ một mái nhà, vợ dệt vải, chồng cày thuê.', 'Cái Thị nấu cho tao bát cháo hành. Lần đầu tiên có người nấu cho tao ăn mà không sợ.', 'Tao bỏ rượu rồi. Run tay lắm, nhưng tao muốn làm người tử tế, lấy cái Thị làm vợ.'] },
  { id: 'thi', name: 'Thị', role: 'a', sort: 4, trade: 'dệt vải, mò cua', temper: 'hien', home: 'thi', work: 'ben', free: 'cho', love: ['chao_hanh', 'hoa_bi', 'keo_lac'], hate: ['ot'],
    lines: ['Hi hi, anh lại ra bờ sông đấy à?', 'Người ta bảo tôi xấu, mà tôi có làm gì ai đâu.', 'Trăng hôm nay sáng ghê, ra bến ngồi mát không?'],
    story: ['Bà cô tôi bảo, con gái xấu thì phải chăm. Nên tôi dệt vải đến khuya.', 'Mấy đứa trẻ trêu tôi là ma bến sông. Tôi chẳng giận, chỉ buồn thôi.', 'Đêm trước tôi thấy anh Chí ốm, nằm run một mình. Thương quá.', 'Tôi nấu bát cháo hành mang sang. Anh ấy ăn mà khóc, tôi chưa thấy ai khóc như thế.', 'Anh ấy bảo muốn lấy tôi. Chỉ sợ bà cô không cho... anh nói giúp tôi một lời nhé?'] },
  { id: 'cothi', name: 'bà cô Thị', role: 'o', sort: 9, trade: 'bán bánh đa', temper: 'kho', home: 'thi', work: 'cho', free: 'ben', love: ['banh_da', 'che_kho', 'mut_gung'], hate: ['ruou_trang'],
    lines: ['Hừ, lại cái anh này.', 'Thiên hạ cười cho thì nhục cả họ.', 'Mua bánh đa thì mua, không mua thì đi.'],
    story: ['Tôi nuôi cái Thị từ năm nó lên ba. Nó xấu, nhưng là đứa có hiếu.', 'Cả đời tôi không lấy chồng, chỉ sợ miệng thiên hạ.', 'Cái thằng Chí ấy à? Rạch mặt ăn vạ cả làng, gả con cho nó thì nhục.', 'Anh bảo nó bỏ rượu thật à? Tôi không tin... nhưng anh cứ kể tiếp.', 'Thôi được. Nếu nó tử tế thật, tôi cho cái Thị theo. Đừng để tôi phải hối hận.'] },
  { id: 'hac', name: 'lão Hạc', role: 'o', sort: 10, trade: 'làm vườn', temper: 'hien', home: 'hac', work: 'lang', free: 'dinh', love: ['khoai_luoc', 'nuoc_che_xanh', 'ruou_trang'], hate: ['rac'],
    lines: ['Cậu Vàng đâu rồi? À, nó đây rồi.', 'Mảnh vườn này để dành cho thằng con tôi.', 'Ăn củ khoai với lão một bữa cho vui.'],
    story: ['Vợ tôi mất sớm. Thằng con không đủ tiền cưới vợ, giận dỗi đi phu cao su.', 'Con chó này là của nó để lại. Tôi gọi là cậu Vàng, ăn gì tôi cũng chia cho nó.', 'Có người hỏi mua vườn, tôi không bán. Đói thì ăn rau, chứ vườn là của thằng con.', 'Năm nay mất mùa, tôi định bán cậu Vàng... nó nhìn tôi như trách, tôi không đành.', 'Có thư! Thằng con tôi viết về, nó sắp được về rồi! Cảm ơn cậu, cảm ơn cậu...'] },
  { id: 'giao', name: 'ông giáo', role: 'a', sort: 6, trade: 'người hay chữ', temper: 'chu', home: 'giao', work: 'dinh', free: 'lang', love: ['sach_nom', 'giay_do', 'muc_tau'], hate: ['rac'],
    lines: ['Đọc sách thì no cái bụng chữ, mà đói cái bụng cơm.', 'Lão Hạc nhà bên dạo này gầy lắm, cậu ghé thăm lão hộ tôi.', 'Muốn hiểu ai thì phải ngồi nghe người ta nói đã.'],
    story: ['Tôi từng mơ lên tỉnh làm thầy, rồi về làng với mấy rương sách.', 'Nhà túng, tôi bán dần sách đi. Mỗi cuốn bán đi như cắt một miếng thịt.', 'Cuốn sách chữ Nôm cha tôi để lại, tôi bán cho một lái buôn ở chợ. Hối hận quá.', 'Lão Hạc nhờ tôi giữ ba mươi đồng bạc, để lo ma chay cho lão. Tôi nghe mà xót.', 'Cậu tìm lại được cuốn sách ấy thật ư? Tôi sẽ mở lớp dạy chữ cho bọn trẻ trong xóm.'] },
  { id: 'dau', name: 'anh Dậu', role: 'a', sort: 2, trade: 'cày thuê', temper: 'the', home: 'dau', work: 'ben', free: 'dinh', love: ['gao', 'khoai', 'canh_cua'], hate: ['ruou_trang'],
    lines: ['Ốm dậy rồi, phải đi làm kẻo vợ con đói.', 'Sưu năm nay nặng quá anh ạ.', 'Có việc gì nặng anh cứ gọi tôi.'],
    story: ['Tôi ốm một trận, nhà hết sạch thóc. Vợ tôi gánh vác cả nhà.', 'Thằng em tôi chết rồi mà làng vẫn bắt nộp sưu cho nó. Thế có khổ không.', 'Người ta trói tôi ở sân đình vì thiếu sưu. Nghĩ lại vẫn còn rùng mình.', 'Vợ tôi định cho cái Tí sang nhà cụ Bá đi ở. Tôi là cha mà không làm gì được.', 'Đủ sưu rồi, cái Tí vẫn ở nhà với chúng tôi. Ơn này nhà tôi nhớ đời.'] },
  { id: 'chidau', name: 'chị Dậu', role: 'a', sort: 0, trade: 'gánh khoai ra chợ', temper: 'cham', home: 'dau', work: 'cho', free: 'lang', love: ['gao', 'khoai_luoc', 'canh_cua'], hate: ['bua_chu'],
    lines: ['Anh mua giùm em gánh khoai, rẻ thôi.', 'Chồng em còn yếu, em phải lo cả nhà.', 'Đứa nào động đến chồng con em thì đừng trách.'],
    story: ['Em bán ổ chó mới đẻ, bán gánh khoai, vẫn chưa đủ suất sưu.', 'Nhà cụ Bá trả hai đồng để cái Tí sang ở. Hai đồng, bằng mấy con chó.', 'Có đứa định trói chồng em lần nữa, em xô ngã nó luôn. Sợ gì!', 'Đêm em nằm nghe cái Tí ngủ mê gọi mẹ. Em không bán con được đâu anh ơi.', 'Em lên tỉnh làm vú nuôi cũng được, miễn con em không phải đi ở. Cảm ơn anh.'] },
  { id: 'ti', name: 'cái Tí', role: 'c', sort: 11, trade: 'trông em', temper: 'vui', home: 'dau', work: 'lang', free: 'ben', love: ['keo_lac', 'khoai_nuong', 'ngo_nuong'], hate: ['ot'],
    lines: ['Chú ơi, chú có kẹo không?', 'Con trông em giỏi lắm đấy!', 'Mẹ bảo con không được đi xa.'],
    story: ['Con biết bắt cua, nhặt rau. Mẹ khen con giỏi.', 'Thằng Dần em con hay khóc vì đói, con nhường nó phần khoai.', 'Con nghe mẹ khóc với bố. Có phải con sắp phải đi ở không chú?', 'Con không sợ đâu... à, con sợ một tí thôi.', 'Con được ở nhà rồi! Chú ơi con hái cho chú bông hoa này.'] },
  { id: 'tho', name: 'bác Năm Thọ', role: 'a', sort: 25, trade: 'thợ rèn', temper: 'it', home: 'ren', work: 'cho', free: 'lang', love: ['sat', 'than', 'ruou_trang'], hate: ['hoa_sen'],
    lines: ['Hừm.', 'Dao cùn thì mài, người cùn thì rèn.', 'Đưa đây, tôi xem.'],
    story: ['Hồi trẻ tôi là tay anh chị có tiếng. Giờ chỉ biết đe với búa.', 'Ngày ấy tôi đánh người thay cụ Bá. Ông ta hứa nhiều lắm.', 'Cụ Bá đẩy tôi đi tù thay ông ta. Ra tù, tôi bỏ nghề cũ, học rèn.', 'Thằng Chí bây giờ giống tôi ngày xưa. Bảo nó ghé lò, tôi dạy nó cái nghề.', 'Mai mang liềm cuốc tới, tôi rèn lại cho. Không lấy tiền.'] },
  { id: 'chuc', name: 'Binh Chức', role: 'a', sort: 22, trade: 'lính về hưu', temper: 'khoac', home: 'chuc', work: 'cho', free: 'dinh', love: ['ruou_trang', 'thit_kho', 'trung_vit_lon'], hate: ['nuoc_che_xanh'],
    lines: ['Hồi tôi đánh trận ở Bắc Kỳ, một mình hạ ba thằng giặc!', 'Gà nhà ai mất thì đừng có nhìn tôi.', 'Cho xin điếu thuốc lào, rồi tôi kể chuyện.'],
    story: ['Chuyện chiến trận ấy à... tôi bịa đấy. Tôi chỉ là lính nấu bếp.', 'Cả làng nghi tôi trộm gà. Tôi nghèo thật, nhưng không ăn cắp.', 'Tôi thấy dấu chân nhỏ ở bờ rừng trúc. Không phải chân người đâu.', 'Tôi có một thằng con với người đàn bà ở đồn cũ. Không biết giờ nó ra sao.', 'Cảm ơn anh đã tin tôi. Từ nay tôi kể chuyện thật thôi... chắc thế.'] },
  { id: 'tu', name: 'ông từ Lãng', role: 'o', sort: 8, trade: 'từ đình, hát xẩm', temper: 'vui', home: '@dinh', work: 'dinh', free: 'cho', love: ['che_kho', 'mut_gung', 'banh_giay'], hate: ['ruou_trang'],
    lines: ['Đình này có từ thời các cụ khai làng đấy.', 'Đêm rằm đình hay có tiếng động lạ, cậu đừng đến muộn.', 'Nghe tôi hát một câu xẩm không?'],
    story: ['Tôi giữ đình bốn mươi năm. Mái dột, cột mọt, mà làng chẳng ai góp.', 'Ngày xưa đình có mảnh trầm hương quý, thắp lên thơm cả làng. Mất rồi.', 'Đêm mất trầm, tôi thấy một bóng người áo the chạy qua sân.', 'Người ấy... là người trong họ cụ Bá. Tôi biết mà không dám nói.', 'Nếu cậu góp đủ lễ, ta sửa lại đình. Đình còn thì làng còn.'] },
  { id: 'do', name: 'thầy đồ Nho', role: 'o', sort: 27, trade: 'viết câu đối', temper: 'chu', home: 'x1', work: 'cho', free: 'dinh', love: ['giay_do', 'muc_tau', 'che_kho'], hate: ['rac'],
    lines: ['Chữ nghĩa bây giờ rẻ hơn mớ rau.', 'Mua đôi câu đối về treo cho may mắn nào.', 'Mực tàu giấy đỏ, chờ người mua mãi.'],
    story: ['Ngày trước nhà nào Tết cũng đến xin chữ. Giờ người ta đi qua không nhìn.', 'Tôi dạy chữ cho bao nhiêu đứa, giờ chúng đi học chữ Tây cả rồi.', 'Có đứa học trò cũ làm quan trên tỉnh, đi qua mà giả vờ không quen.', 'Cậu xin tôi một chữ đi. Chữ "Nhẫn" nhé, đời cần nhất cái đó.', 'Từ mai tôi mở lớp ở đình, trẻ nghèo học không mất tiền.'] },
  { id: 'duyen', name: 'cô Duyên', role: 'a', sort: 18, trade: 'bán hàng nước', temper: 'lam', home: 'x2', work: 'lang', free: 'cho', stall: 'T', love: ['che_uop_sen', 'keo_lac', 'hoa_sen'], hate: ['mam_tom'],
    lines: ['Ngồi xuống đây uống bát nước chè, em kể cho mà nghe.', 'Chuyện gì trong làng em cũng biết hết.', 'Anh có nghe chuyện nhà cụ Bá chưa?'],
    story: ['Hàng nước của em là nơi cả làng kháo chuyện. Ai cũng tưởng em vô tư lắm.', 'Có anh học trò ngày nào cũng ngồi đây đọc sách, uống chè chịu.', 'Anh ấy lên tỉnh thi, hứa đỗ về sẽ cưới em. Ba năm rồi.', 'Người ta bảo anh ấy lấy con gái quan huyện. Em không tin... em không muốn tin.', 'Thôi, em không đợi nữa. Ai thật lòng ngồi uống chè với em mỗi ngày, mới là người em thương.'] },
  { id: 'lanh', name: 'anh Lành', role: 'a', sort: 15, trade: 'xe tơ', temper: 'cham', home: 'xeto', work: 'lang', free: 'ben', love: ['to_tam', 'ken_tam', 'com_lang_vong'], hate: ['ot'],
    lines: ['Một nong tằm là năm nong kén đấy anh.', 'Nhà gái thách cưới cao quá, tôi xe tơ cả đời chưa đủ.', 'Cô ấy cười một cái là tôi quên mệt.'],
    story: ['Tôi thương cô Mận làng bên, hai đứa hẹn nhau từ hồi chăn trâu.', 'Nhà cô ấy thách một trăm cau, một trăm quan tiền, năm mâm xôi gấc.', 'Tôi bán con lợn, bán khung cửi, vẫn còn thiếu nhiều lắm.', 'Có người dạm hỏi cô ấy cho con trai nhà giàu. Cô ấy khóc mà không dám cãi.', 'Đủ lễ rồi! Tháng sau rước dâu, anh nhớ đến uống rượu mừng nhé.'] },
  { id: 'kieu', name: 'cô Kiều', role: 'a', sort: 5, trade: 'đàn hát', temper: 'buon', home: 'kieu', work: 'lang', free: 'dinh', love: ['quat_giay', 'hoa_sen', 'lua_ha_dong'], hate: ['ruou_trang'],
    lines: ['Tiếng đàn này... anh có nghe thấy buồn không?', 'Em chỉ mong cha em được yên.', 'Trăng tròn rồi lại khuyết, người đi rồi có về không?'],
    story: ['Cha em bị vu oan, người ta đòi bạc mới thả. Nhà chỉ còn em.', 'Có mụ đàn bà ở tỉnh trả tiền, bảo em lên làm việc nhà. Em biết là không phải thế.', 'Em có hẹn ước với một người học trò. Em bảo em gái thay em giữ lời hẹn ấy.', 'Mụ ta lại đến. Em sợ lắm. Chiếc khăn tay này, nếu em đi, anh giữ giùm em.', 'Anh lật được mặt mụ ta rồi. Em không phải đi đâu nữa... em chỉ muốn khóc.'] },
  { id: 'xuan', name: 'cậu Xuân Tóc Đỏ', role: 'a', sort: 21, trade: 'cậu ấm trên tỉnh về', temper: 'khoac', home: '@cho', work: 'cho', free: 'dinh', love: ['dong_ho', 'quat_giay', 'ruou_mo'], hate: ['phan_chuong'],
    lines: ['Bông-jua! Ở làng này buồn thế, chẳng ai biết đánh quần vợt.', 'Tôi bây giờ là người văn minh, cải cách đấy nhé.', 'Nhìn kiểu tóc này, cả tỉnh đang bắt chước.'],
    story: ['Nói nhỏ nhé: trước tôi là thằng nhặt bóng ở sân quần, có gì đâu.', 'Một hôm tôi nói bừa, ai cũng tưởng tôi thông thái. Thế là tôi phất lên.', 'Tôi về làng để khoe, mà không ai thèm nghe. Hơi tủi.', 'Thật ra tôi mồ côi, ở làng này từ bé. Chẳng ai nhớ tôi là ai.', 'Anh là người đầu tiên chơi với tôi khi tôi chưa có gì để khoe. Mẹc-xi lắm!'] },
  { id: 'tugoa', name: 'bà goá Tư', role: 'o', sort: 27, trade: 'nuôi lợn, góp họ', temper: 'lo', home: 'tu', work: 'lang', free: 'cho', love: ['cam', 'khoai', 'tia_to'], hate: ['ruou_trang'],
    lines: ['Lợn nhà tôi mắn đẻ lắm, anh có lấy một con không?', 'Góp họ thì phải chọn người tin được.', 'Chồng mất rồi, một mình tôi nuôi con.'],
    story: ['Chồng tôi chết đuối ở khúc sông đầu làng. Con trâu là thứ duy nhất ông để lại.', 'Nhà cụ Bá bắt trâu gán nợ, mà món nợ ấy tôi chưa từng vay.', 'Tôi góp họ với chị em trong xóm, dồn từng đồng mua lại trâu.', 'Chủ họ ôm tiền bỏ trốn rồi! Cả xóm điêu đứng.', 'Trâu về rồi, tiền họ cũng tìm lại được. Anh ở lại ăn bữa cơm với mẹ con tôi.'] },
  { id: 'dong', name: 'mụ đồng Lạc', role: 'a', sort: 23, trade: 'xem bói, lên đồng', temper: 'lua', home: 'dong', work: 'cho', free: 'dinh', love: ['dau_hoa', 'son_ta', 'vong_bac'], hate: ['sach_nom'],
    lines: ['Để tôi xem cho một quẻ, số anh có quý nhân phù trợ.', 'Nhà ai có người ốm, gọi tôi trừ tà.', 'Lá bùa này ba hào thôi, rẻ mà thiêng.'],
    story: ['Bói thì có gì, nhìn mặt mà nói, mười câu trúng năm là thiêng.', 'Con dâu nhà bên ốm lăn ốm lóc, tôi bảo là ma rừng nhập.', 'Thật ra hôm trước cô ấy ăn nấm hái trong rừng. Tôi biết mà không nói.', 'Nói ra thì ai còn tin bùa của tôi nữa. Anh hiểu cho tôi.', 'Thôi, tôi khuyên họ đi thầy lang. Bùa không chữa được ngộ độc đâu.'] },
  { id: 'mo', name: 'anh Mõ', role: 'a', sort: 24, trade: 'mõ làng', temper: 'hien', home: 'x3', work: 'dinh', free: 'lang', love: ['com', 'xoi_do', 'banh_duc'], hate: ['ot'],
    lines: ['Cốc cốc cốc! Loa loa, làng có việc!', 'Người ta coi mõ là hạng bét, nhưng tin gì tôi cũng biết trước.', 'Anh là người đầu tiên chào tôi trong tuần này đấy.'],
    story: ['Nhà tôi ba đời làm mõ. Đám giỗ người ta cho ăn ở ngoài sân.', 'Mai có quan huyện về đình, anh đừng nói tôi kể nhé.', 'Tôi thương một cô ở xóm bên, mà ai gả con cho thằng mõ.', 'Tôi biết đêm mất trầm ở đình, có người đưa cho ông từ một gói tiền để im lặng.', 'Anh coi tôi là bạn, thế là đủ. Từ nay có tin gì, tôi báo anh trước tiên.'] },
];
/* their households: [house, role, gender, name or null, trade or null] — kin and servants, then the stall keepers */
const C11_KIN = [['ba', 'o', 'f', 'bà Cả', 'vợ cả cụ Bá'], ['ba2', 'a', 'm', 'thằng Sứt', 'đầy tớ nhà cụ Bá'], ['ba3', 'a', 'f', 'con Hĩm', 'đầy tớ nhà cụ Bá'], ['dau', 'c', 'm', 'thằng Dần', null], ['dau', 'o', 'f', 'bà cụ Dậu', 'trông cháu'],
  ['giao', 'a', 'f', 'bà giáo', 'dệt vải'], ['tao', 'a', 'f', 'mợ Đội', 'hàng xén'], ['tao', 'a', 'm', null, 'tuần đinh'], ['tao', 'a', 'm', null, 'tuần đinh'], ['xeto', 'o', 'f', 'bà cụ Lành', 'ươm tơ'], ['xeto', 'c', 'f', 'cái Nhài', 'trông em'],
  ['kieu', 'o', 'm', 'ông Viên', 'đánh cờ tướng'], ['kieu', 'a', 'f', 'cô Vân', 'dệt vải'], ['kieu', 'c', 'm', 'cậu Quan', 'đi học chữ'], ['tu', 'c', 'm', 'thằng Cún', 'chăn trâu'], ['ren', 'a', 'f', 'thím Năm', 'bán nồi đất'], ['ren', 'a', 'm', 'anh Bễ', 'thợ phụ lò rèn'],
  ['x1', 'o', 'f', 'bà đồ', 'têm trầu'], ['x2', 'o', 'f', 'bà Hàng', 'ngồi lê đôi mách']];
const C11_STALLERS = [['x4', 'a', 'm', 'bác Sáu Giống', 'bán hạt giống', 'N', 'cho'], ['@cho', 'o', 'f', 'bà Hai hàng cơm', 'bán hàng cơm', 'Q', 'cho'], ['@cho', 'a', 'm', 'chú Tư lái buôn', 'lái buôn thu mua', 'U', 'cho']];
const C11_FILL = [['x4', 4], ['x5', 6], ['b1', 7], ['b2', 7], ['@cho', 3], ['out', 99]];
const C11_GIVEN = { m: ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Lộc', 'Phúc', 'Tài', 'Đức', 'Thành', 'Hùng', 'Sinh', 'Toàn', 'Bình', 'Tâm', 'Khoa', 'Lợi', 'Quý', 'Thịnh', 'Đông', 'Tráng', 'Mạnh', 'Nhỡ', 'Cò', 'Cuội', 'Bờm', 'Tèo', 'Đực', 'Sửu', 'Mão', 'Thìn', 'Ngọ', 'Thân', 'Hợi', 'Mít', 'Ổi', 'Quắn', 'Hến', 'Khoai', 'Bưởi', 'Lý', 'Cẩn', 'Vượng', 'Kha', 'Thắng'],
  f: ['Nụ', 'Hoa', 'Mận', 'Đào', 'Cúc', 'Huệ', 'Lan', 'Sen', 'Thắm', 'Gái', 'Hiền', 'Nết', 'Na', 'Mơ', 'Tằm', 'Trinh', 'Thơm', 'Xoan', 'Ngần', 'Mây', 'Hồng', 'Gấm', 'Lụa', 'Mai', 'Liên', 'Nhung', 'Hạnh', 'Cốm', 'Bống', 'Thóc', 'Lựu', 'Tươi', 'Yến', 'Ngoan', 'Bèo', 'Rỡ', 'Diệu'] };
const C11_TITLE = { o: { m: ['cụ', 'ông'], f: ['bà cụ', 'bà'] }, a: { m: ['bác', 'chú', 'anh'], f: ['bác', 'cô', 'chị', 'thím', 'mợ'] }, c: { m: ['thằng'], f: ['cái'] } };
const C11_TEMPERS = ['hien', 'nong', 'keo', 'lam', 'vui', 'ru', 'cham', 'luoi', 'chu', 'say', 'tham', 'the', 'kieu', 'lo'];
const C11_HATE_POOL = ['rac', 'phan_chuong', 'ot', 'mam_tom', 'ruou_trang', 'soi', 'long_ga', 'bua_chu'];
const C11_LIKE_CAT = { say: 'che', chu: 'quy', keo: 'nong', tham: 'quy', cham: 'nong', luoi: 'mon', lam: 'che', vui: 'mon', hien: 'rung', ru: 'rung', the: 'nong', kieu: 'quy', lo: 'che', nong: 'ca' };
const C11_PPL = (() => {
  const rnd = mulberry(0x7a11c9), pick = a => a[(rnd() * a.length) | 0], out = [], used = new Set(), sorts = { a: C4_ADULT_SORTS2, o: C4_OLD_SORTS2, c: [11, 12, 13] };
  const homeOf = key => {
    if (key === 'out') return { a: 'out', key, x: 15, y: 19 };
    if (key[0] === '@') { const a = key.slice(1), sp = (C11_SPOTS[a] || [[8, 8]])[0]; return { a, key, x: sp[0] + .5, y: sp[1] }; }
    if (key === 'ren') return { a: 'cho', key, x: 4.5, y: 13 };
    const hs = C11_HOUSES[key]; return { a: hs.a, key, x: hs.x, y: hs.y };
  };
  const add = o => { o.n = out.length + 1; o.sc = o.role === 'c' ? .74 : o.role === 'o' ? .94 : 1; if (o.wake === undefined) o.wake = 5.5 + rnd() * 1.5; if (o.sleep === undefined) o.sleep = o.role === 'c' ? 20.5 + rnd() : 21 + rnd() * 1.8; out.push(o); used.add(o.name); return o; };
  const known = id => typeof C11_ITEMS !== 'undefined' && C11_ITEMS[id];
  for (const s of C11_STORY_PPL) add({ ...s, home: homeOf(s.home), love: s.love.filter(known), hate: s.hate.filter(known), likeCat: C11_LIKE_CAT[s.temper] || 'mon' });
  const gen = (hk, role, g, name, trade, extra = {}) => {
    g = g || (rnd() < .5 ? 'm' : 'f'); role = role || (rnd() < .2 ? 'o' : rnd() < .25 ? 'c' : 'a');
    for (let i = 0; !name || used.has(name); i++) name = `${pick(C11_TITLE[role][g])} ${pick(C11_GIVEN[g])}` + (i > 30 ? ' ' + (i - 29) : '');
    const T = C11_TRADES[role].find(t => t[0] === trade) || (trade ? null : pick(C11_TRADES[role]));
    const temper = role === 'c' ? pick(['vui', 'ru', 'hien', 'luoi', 'nong']) : pick(C11_TEMPERS);
    const arc = role === 'c' ? pick(C11_ARCS_KID) : pick(C11_ARCS), loves = (T ? T[2] : ['com', 'xoi_do']).slice(0, 2).concat([pick(['xoi_gac', 'banh_chung', 'che_troi_nuoc', 'ca_kho', 'thit_kho', 'nem_ran', 'banh_cuon', 'bun_rieu'])]);
    let hate = pick(C11_HATE_POOL); if (loves.includes(hate)) hate = 'rac';
    return add({ id: 'p' + (out.length + 1), name, role, sort: pick(sorts[role]), trade: trade || T[0], temper, home: homeOf(hk), work: T ? T[1] : 'lang', free: pick(['lang', 'cho', 'dinh', 'lang', 'ben']),
      love: loves.filter(known), hate: [hate].filter(known), likeCat: C11_LIKE_CAT[temper] || 'mon', lines: [], story: arc, ...extra });
  };
  for (const [hk, r, g, nm, tr] of C11_KIN) gen(hk, r, g, nm, tr);
  for (const [hk, r, g, nm, tr, st, wk] of C11_STALLERS) gen(hk, r, g, nm, tr, { stall: st, work: wk });
  for (const [hk, n] of C11_FILL) for (let i = 0; i < n && out.length < 100; i++) gen(hk);
  for (const p of out) { if (!p.y) { const o = out[(p.n * 37 + 11) % out.length]; p.y = o === p ? out[0].name : o.name; } p.work = p.work || 'lang'; }
  /* everyone without a family house gets a house of their own in the hamlets (children stay with the grown-up drawn just before them) */
  { const pool = ['x4', 'x5', 'b1', 'b2', ...Object.keys(C11_HOUSES).filter(k => /^(dongx|doai|bai)\d/.test(k))]; let last = null;
    for (const p of out) { if (!['x4', 'x5', 'b1', 'b2', '@cho', 'out'].includes(p.home.key)) continue; if (p.role === 'c' && last) { p.home = { ...last }; continue; } const k = pool.shift(); if (!k) { last = null; continue; } p.home = homeOf(k); last = p.home; } }
  for (const [key, hs] of Object.entries(C11_HOUSES)) if (!hs.name) { const head = out.find(p => p.home.key === key && p.role !== 'c'); hs.name = head ? 'Nhà ' + head.name : 'Nhà bỏ không'; }
  return out;
})();

/* where everyone is and what they do, and how they move about: viecngay.js (c11Plan, c11VillEnter / c11VillCheck / c11VillUpdate) */

/* ---------- friendship: talking (once a day +20), gifts (one a day, two a week), stories at 2/4/6/8/10 hearts ---------- */
function c11PP(id) { const P = SAVE11.ppl || (SAVE11.ppl = {}); return P[id] || (P[id] = { f: 0, met: 0, td: 0, gd: 0, gw: -1, gn: 0, st: 0, ln: 0, kn: {} }); }
const c11Hearts = id => Math.floor(Math.min(2500, Math.max(0, c11PP(id).f)) / 250);
const c11HomeName = p => p.home.a === 'out' ? 'xóm ngoài' : p.home.key[0] === '@' ? (p.home.a === 'dinh' ? 'trong đình' : 'gần chợ') : p.home.key === 'ren' ? 'lò rèn ngoài chợ' : C11_HOUSES[p.home.key].name.replace(/^Nhà/, 'nhà').replace(/^Túp/, 'túp') + (C11_HAMLET_MAPS[p.home.a] ? ', ' + C11_HAMLET_MAPS[p.home.a].name.replace(/^X/, 'x') : p.home.a === 'ben' ? ', bến sông' : '');
/* how someone names themself (owner: nobody introduces themself as "thằng Hùng"): the title others use is dropped, children say cháu */
const C11_SELF_NAME = { 'bà cụ Dậu': 'mẹ anh Dậu', 'bà cụ Lành': 'mẹ anh Lành', 'mợ Đội': 'vợ Đội Tảo', 'bà đồ': 'vợ thầy đồ Nho', 'bà Hàng': 'mẹ cô Duyên', 'thím Năm': 'vợ bác Năm Thọ', 'bà giáo': 'vợ ông giáo', 'bà Cả': 'vợ cả cụ Bá', 'ông Viên': 'cha cô Kiều' };
const C11_SELF = { ba: 'Bá Kiến, chánh tổng làng này', cothi: 'cô ruột của cái Thị', tu: 'ông từ giữ đình', do: 'đồ Nho, ngồi viết chữ ngoài chợ', mo: 'Mõ, người đánh mõ của làng', dong: 'bà Lạc, người làng gọi là mụ đồng', chi: 'Chí', hac: 'Hạc, người làng gọi là lão Hạc', xuan: 'Xuân, cả tỉnh gọi là Xuân Tóc Đỏ', tugoa: 'Tư, goá chồng đã mấy năm' };
const C11_TITLES = ['bà cụ', 'thầy đồ', 'ông từ', 'mụ đồng', 'thằng', 'cái', 'con', 'cụ', 'ông', 'bà', 'bác', 'chú', 'anh', 'chị', 'cô', 'thím', 'mợ', 'cậu', 'lão', 'mụ'];
const c11SelfName = p => { if (C11_SELF[p.id]) return C11_SELF[p.id]; if (C11_SELF_NAME[p.name]) return C11_SELF_NAME[p.name]; let n = p.name; for (const t of C11_TITLES) if (n.startsWith(t + ' ')) { n = n.slice(t.length + 1); break; } return n; };
function c11Intro(p) {
  const hs = C11_HOUSES[p.home.key], own = hs && hs.name === 'Nhà ' + p.name, area = C11_HAMLET_MAPS[p.home.a] ? C11_HAMLET_MAPS[p.home.a].name.replace(/^X/, 'x') : p.home.a === 'ben' ? 'bến sông' : 'xóm trong';
  const home = own ? (p.role === 'c' ? 'nhà ' : 'nhà mình ') + 'ở ' + area : c11HomeName(p);   // nobody calls their own house "nhà mợ Cúc"
  if (p.role === 'c') return `Cháu chào chú! Cháu tên là ${c11SelfName(p)}, ${own ? 'nhà cháu ở ' + area : 'cháu ở ' + home}.`;
  return C11_SELF[p.id] || C11_SELF_NAME[p.name] ? `Chào anh. Tôi là ${c11SelfName(p)}, ${own ? home : 'ở ' + home}.` : `Chào anh. Tôi là ${c11SelfName(p)}, làm nghề ${p.trade}, ${own ? home : 'ở ' + home}.`;
}
const c11Say = (v, text) => { C11.say = { who: v, text, t: 0, dur: 2.4 + text.length * .045 }; v.wait = Math.max(v.wait, C11.say.dur * .8); v.face = C11.px < v.x ? -1 : 1; };
function c11Line(p, h) {
  const s = c11PP(p.id), tier = h < 2 ? 0 : h < 6 ? 1 : 2, hr = SAVE11.mins / 60;
  const tl = C11_TIME_LINES.find(([a, b]) => hr >= a && hr < b), pool = [...(p.lines || []), ...(C11_TEMPER[p.temper] || C11_TEMPER.hien)[tier], ...(C11_TRADE_LINES[p.trade] || [])];
  s.ln = (s.ln || 0) + 1;
  const text = tl && c11Hash(p.n, SAVE11.day, s.ln) < .2 ? tl[2][s.ln % tl[2].length] : pool[(s.ln * 7 + p.n) % pool.length];
  return text.replace(/\{Y\}/g, p.y);
}
function c11TalkTo(v) {
  const p = v.p, s = c11PP(p.id), day = SAVE11.day, tool = c11HandTool(), it = c11HandItem();
  v.path = v.leaving ? v.path : null;
  if (c11QuestTalk(v)) return;                                       // a job to hand in, or a request (viec.js)
  if (it && (tool === 'item' || tool === 'seed')) { c11Gift(v, it); return; }
  let text, gain = 0;
  if (!s.met) { s.met = 1; s.td = day; gain = 20; text = c11Intro(p); c11Msg(`Làm quen với ${p.name}`, '#2f6a4c'); }
  else {
    if (s.td !== day) { s.td = day; gain = 20; }
    s.f += gain; gain && c11Pop(Math.floor(v.x), Math.floor(v.y) - 2, '♥ +' + gain, '#c8402f'); const h = c11Hearts(p.id); s.f -= gain;
    const th = C11_STORY_AT[s.st];
    if (th !== undefined && h >= th && p.story[s.st]) { text = p.story[s.st].replace(/\{Y\}/g, p.y); s.st++; c11Msg(`Nghe thêm chuyện của ${p.name}`, '#2f6a4c'); }
    else text = c11Line(p, h);
    s.f += gain; c11Say(v, text); persist11(); return;
  }
  s.f += gain; c11Pop(Math.floor(v.x), Math.floor(v.y) - 2, '♥ +' + gain, '#c8402f'); c11Say(v, text); persist11();
}
function c11Taste(p, id) {
  const I = C11_ITEMS[id];
  if (p.love.includes(id)) return 'love'; if (p.hate.includes(id)) return 'hate';
  if (['rac', 'phan_chuong', 'soi', 'da', 'co', 'rom', 'cat', 'dat_set'].includes(id)) return 'dis';
  if (I.cat === p.likeCat || I.cat === 'mon' || I.cat === 'quy') return 'like';
  return 'neu';
}
const C11_GIFT_PTS = { love: 80, like: 45, neu: 20, dis: -20, hate: -40 };
const C11_GIFT_SAY = { love: ['Trời ơi, {i}! Đúng thứ tôi thích nhất!', 'Sao anh biết tôi mê {i}? Cảm ơn anh nhiều lắm!'], like: ['Cảm ơn anh, {i} quý quá.', 'Ồ, {i}! Anh chu đáo thật.'], neu: ['Cảm ơn anh nhé.', 'Anh có lòng quá.'], dis: ['Ơ... {i} à. Thôi, cảm ơn.', 'Tôi giữ {i} làm gì nhỉ...'], hate: ['Anh đưa tôi {i} làm gì? Mang đi đi!', 'Hừ, {i}! Anh trêu tôi đấy à?'] };
function c11Gift(v, it) {
  const p = v.p, s = c11PP(p.id), day = SAVE11.day, wk = Math.floor((day - 1) / 7), I = C11_ITEMS[it.id];
  if (I.cat === 'truyen') { c11Say(v, 'Cái này anh nên giữ lấy, có ngày cần đến.'); return; }
  if (s.gd === day) { c11Say(v, 'Hôm nay anh cho tôi quà rồi mà.'); return; }
  if (s.gw === wk && s.gn >= 2) { c11Say(v, 'Tuần này anh cho tôi hai lần rồi, để tuần sau nhé.'); return; }
  const r = c11Taste(p, it.id), pts = C11_GIFT_PTS[r] + (s.td !== day ? 20 : 0);
  c11Take(it.id, 1); s.gd = day; s.td = day; if (s.gw !== wk) { s.gw = wk; s.gn = 0; } s.gn++; s.met = 1; s.kn[it.id] = r;
  s.f = Math.max(0, Math.min(2500, s.f + pts)); c11Sfx.pluck && c11Sfx.pluck();
  c11Pop(Math.floor(v.x), Math.floor(v.y) - 2, (pts >= 0 ? '♥ +' : '♥ ') + pts, pts >= 0 ? '#c8402f' : '#5b2f1f');
  const L = C11_GIFT_SAY[r]; c11Say(v, L[day % L.length].replace('{i}', I.name.toLowerCase())); persist11();
}

/* ---------- the village book: everyone met, their hearts, and what they have told ---------- */
/* one notebook (owner 2026-10-27: "việc làng, nhiệm vụ, sổ dân làng cho vào 1 sổ tay"): tab 'dan' = the villagers met, tab 'viec' = the jobs running */
function c11OpenBook(tab) { C11.menu = { book: true, tab: tab || 'dan', page: 0, vpage: 0, sel: null }; c11Sfx.tap(); }
function c11Wrap(g, text, w) { const out = []; let cur = ''; for (const wd of text.split(' ')) { const t = cur ? cur + ' ' + wd : wd; if (g.measureText(t).width > w && cur) { out.push(cur); cur = wd; } else cur = t; } if (cur) out.push(cur); return out; }
function c11Heart(g, cx, cy, sz, on) {
  g.fillStyle = on ? '#c8402f' : 'rgba(29,25,21,.16)'; g.beginPath(); g.moveTo(cx, cy + sz * .42);
  g.bezierCurveTo(cx - sz * .62, cy - sz * .02, cx - sz * .34, cy - sz * .58, cx, cy - sz * .2); g.bezierCurveTo(cx + sz * .34, cy - sz * .58, cx + sz * .62, cy - sz * .02, cx, cy + sz * .42); g.fill();
}
const c11WhereText = p => { const pl = c11Plan(p); return !pl ? c11Why(p) : (C11_ACT_NAME[pl.act] && pl.act !== 'dao' ? C11_ACT_NAME[pl.act] + ' · ' : '') + C11_AREAS[pl.a].name; };
function c11DrawBook(g, W, H, m) {
  g.fillStyle = 'rgba(20,16,30,.55)'; g.fillRect(0, 0, W, H);
  const pw = Math.min(W - 16, 620), ph = Math.min(H - 16, 660), px = (W - pw) / 2, py = (H - ph) / 2, btn = [], tab = m.tab || 'dan', Q = c11Q();
  g.fillStyle = '#f4ead0'; g.strokeStyle = INK; g.lineWidth = 3.2; g.beginPath(); g.roundRect(px, py, pw, ph, 14); g.fill(); g.stroke();
  const met = C11_PPL.filter(p => c11PP(p.id).met).sort((a, b) => c11PP(b.id).f - c11PP(a.id).f || a.n - b.n);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = '900 22px "Playfair Display", serif'; g.fillText('Sổ tay', W / 2, py + 26);
  const x0 = c11Tag(g, px + pw - 12, py + 12, '✕', { right: true, size: 13, h: 28, pad: 18 }); btn.push({ r: x0, f: () => { C11.menu = null; } });
  const t1 = c11Tag(g, W / 2 - 5, py + 42, `Dân làng · ${met.length}`, { right: true, size: 12, h: 28, pad: 20, fill: tab === 'dan' ? '#f2cf5a' : '#f4ead0' });
  const t2 = c11Tag(g, W / 2 + 5, py + 42, `Việc làng${Q.act.length ? ` · ${Q.act.length}` : ''}`, { size: 12, h: 28, pad: 20, fill: tab === 'viec' ? '#f2cf5a' : '#f4ead0' });
  btn.push({ r: t1, f: () => { m.tab = 'dan'; m.sel = null; c11Sfx.tap(); } }, { r: t2, f: () => { m.tab = 'viec'; m.sel = null; c11Sfx.tap(); } });
  const top = py + 80;
  if (tab === 'viec') c11DrawJobs(g, W, px, py, pw, ph, top, m, btn, Q);
  else if (m.sel) c11DrawPerson(g, px, py, pw, ph, m, btn);
  else if (!met.length) { g.fillStyle = INK; g.font = '600 13px "Be Vietnam Pro", sans-serif'; g.fillText('Chưa quen ai trong làng.', W / 2, py + ph / 2); }
  else {
    const cols = pw >= 520 ? 3 : 2, ch = 70, gap = 6, avail = ph - 80 - 54, rowsN = Math.max(1, Math.floor((avail + gap) / (ch + gap))), per = cols * rowsN, pages = Math.ceil(met.length / per);
    m.page = Math.max(0, Math.min(pages - 1, m.page)); const cw = (pw - 24 - gap * (cols - 1)) / cols;
    met.slice(m.page * per, m.page * per + per).forEach((p, i) => {
      const x = px + 12 + (i % cols) * (cw + gap), y = top + Math.floor(i / cols) * (ch + gap), h = c11Hearts(p.id);
      g.fillStyle = '#f7e3a4'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(x, y, cw, ch, 10); g.fill(); g.stroke();
      g.save(); g.beginPath(); g.roundRect(x + 4, y + 4, 46, ch - 8, 8); g.clip(); g.fillStyle = 'rgba(111,165,76,.22)'; g.fillRect(x + 4, y + 4, 46, ch - 8); c11Mouse(g, p, x + 25, y + ch + 2, 1, 0, false, .4 * (p.sc || 1), null); g.restore();
      g.textAlign = 'left'; g.fillStyle = INK; g.font = '800 13px "Be Vietnam Pro", sans-serif'; g.fillText(p.name, x + 56, y + 16, cw - 62);
      g.font = '600 10px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.72)'; g.fillText(p.trade, x + 56, y + 32, cw - 62);
      const hs = Math.min(11, (cw - 64) / 10 - 1.5); for (let j = 0; j < 10; j++) c11Heart(g, x + 56 + j * (hs + 1.5) + hs / 2, y + 52, hs, j < h);
      btn.push({ r: [x, y, cw, ch], f: () => { m.sel = p.id; c11Sfx.tap(); } });
    });
    if (pages > 1) c11Pager(g, W, py, ph, m, 'page', pages, btn);
  }
  for (const b of btn) C11.hud.push({ r: b.r, modal: true, f: b.f });
  C11.hud.push({ r: [px, py, pw, ph], modal: true, f: () => {} });
}
function c11Pager(g, W, py, ph, m, key, pages, btn) {
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = '700 12px "Be Vietnam Pro", sans-serif'; g.fillText(`Trang ${m[key] + 1} / ${pages}`, W / 2, py + ph - 24);
  const a = c11Tag(g, W / 2 - 60, py + ph - 40, '‹', { right: true, size: 15, h: 30, pad: 26 }), b = c11Tag(g, W / 2 + 60, py + ph - 40, '›', { size: 15, h: 30, pad: 26 });
  btn.push({ r: a, f: () => { m[key] = (m[key] - 1 + pages) % pages; c11Sfx.tap(); } }, { r: b, f: () => { m[key] = (m[key] + 1) % pages; c11Sfx.tap(); } });
}
/* the jobs tab: a card per job running, every line wrapped inside the card; pages when they do not all fit */
function c11DrawJobs(g, W, px, py, pw, ph, top, m, btn, Q) {
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (!Q.act.length) {
    g.fillStyle = INK; g.font = '600 13px "Be Vietnam Pro", sans-serif'; let y = top + 30;
    for (const l of c11Wrap(g, 'Chưa nhận việc nào. Xem bảng yết thị ở đình, hoặc làm thân với dân làng để họ nhờ việc.', pw - 60)) { g.fillText(l, W / 2, y); y += 20; }
    g.fillStyle = 'rgba(29,25,21,.7)'; g.font = '600 12px "Be Vietnam Pro", sans-serif'; g.fillText(`Đã làm xong ${Q.n || 0} việc`, W / 2, y + 12); return;
  }
  const cw = pw - 24, tw = cw - 24, cards = Q.act.map(q => {
    const s = q.steps[q.si], who = c11P(c11Who(s.who)), ready = c11StepReady(s);
    g.font = '800 14px "Be Vietnam Pro", sans-serif'; const head = c11Wrap(g, q.title + (q.due ? (q.due === SAVE11.day ? ' · hết hạn hôm nay' : ' · hạn ngày mai') : ''), tw);
    g.font = '600 12px "Be Vietnam Pro", sans-serif'; const body = c11Wrap(g, c11StepText(s), tw), at = c11Wrap(g, who ? `${who.name}: ${c11WhereText(who)}` : '', tw).filter(Boolean);
    return { head, body, at, ready, h: 14 + head.length * 18 + body.length * 16 + at.length * 15 + (ready ? 20 : 0) + 8 };
  });
  const avail = ph - 80 - 62, pages = []; let cur = [], used = 0;
  for (const c of cards) { if (cur.length && used + c.h + 8 > avail) { pages.push(cur); cur = []; used = 0; } cur.push(c); used += c.h + 8; }
  pages.push(cur); m.vpage = Math.max(0, Math.min(pages.length - 1, m.vpage || 0));
  let y = top;
  for (const c of pages[m.vpage]) {
    g.fillStyle = c.ready ? '#f7e3a4' : '#efe3c4'; g.strokeStyle = INK; g.lineWidth = 2.2; g.beginPath(); g.roundRect(px + 12, y, cw, c.h, 10); g.fill(); g.stroke();
    let ty = y + 18; g.textAlign = 'left'; g.fillStyle = INK; g.font = '800 14px "Be Vietnam Pro", sans-serif'; for (const l of c.head) { g.fillText(l, px + 24, ty); ty += 18; }
    g.font = '600 12px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.88)'; ty -= 2; for (const l of c.body) { g.fillText(l, px + 24, ty); ty += 16; }
    g.fillStyle = '#6d5a3c'; for (const l of c.at) { g.fillText(l, px + 24, ty); ty += 15; }
    if (c.ready) { g.fillStyle = '#2f6a4c'; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.fillText('✓ Đủ rồi, đi giao thôi', px + 24, ty + 4); }
    y += c.h + 8;
  }
  g.textAlign = 'center'; g.fillStyle = 'rgba(29,25,21,.7)'; g.font = '600 11px "Be Vietnam Pro", sans-serif';
  if (pages.length > 1) c11Pager(g, W, py, ph, m, 'vpage', pages.length, btn); else g.fillText(`Đã làm xong ${Q.n || 0} việc`, W / 2, py + ph - 20);
}
function c11DrawPerson(g, px, py, pw, ph, m, btn) {
  const p = C11_PPL.find(q => q.id === m.sel), s = c11PP(p.id), h = c11Hearts(p.id), lx = px + 18;
  const bk = c11Tag(g, px + 12, py + 12, '← Dân làng', { size: 12, h: 28, pad: 18 }); btn.push({ r: bk, f: () => { m.sel = null; c11Sfx.tap(); } });
  g.save(); g.beginPath(); g.roundRect(lx, py + 68, 96, 120, 12); g.clip(); g.fillStyle = 'rgba(111,165,76,.22)'; g.fillRect(lx, py + 68, 96, 120); c11Mouse(g, p, lx + 46, py + 182, 1, 0, false, .62 * (p.sc || 1), null); g.restore();
  g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.roundRect(lx, py + 68, 96, 120, 12); g.stroke();
  const tx = lx + 110, tw = pw - (tx - px) - 16;
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = INK; g.font = '900 20px "Playfair Display", serif'; g.fillText(p.name, tx, py + 82, tw);
  g.font = '600 12px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.8)';
  const rows = [p.trade, `Tính: ${C11_TEMPER_NAME[p.temper] || p.temper}`, `Nhà: ${c11HomeName(p)}`, `Lúc này: ${c11WhereText(p)}`];
  rows.forEach((r, i) => g.fillText(r, tx, py + 106 + i * 18, tw));
  for (let j = 0; j < 10; j++) c11Heart(g, tx + j * 17 + 7, py + 186, 14, j < h);
  const kn = Object.entries(s.kn).filter(([, r]) => r === 'love' || r === 'like').map(([id]) => C11_ITEMS[id] ? C11_ITEMS[id].name : id);
  let y = py + 214; g.fillStyle = INK; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.fillText('Quà ưa thích:', lx, y);
  g.font = '600 12px "Be Vietnam Pro", sans-serif'; g.fillStyle = 'rgba(29,25,21,.8)'; for (const l of c11Wrap(g, kn.length ? kn.join(', ') : 'chưa biết, thử tặng quà xem', pw - 140)) { g.fillText(l, lx + 96, y); y += 17; }
  y += 10; g.fillStyle = INK; g.font = '800 12px "Be Vietnam Pro", sans-serif'; g.fillText('Chuyện đã nghe:', lx, y); y += 20;
  g.font = '600 12px "Be Vietnam Pro", sans-serif';
  p.story.forEach((line, i) => {
    if (y > py + ph - 20) return; const open = i < s.st;
    g.fillStyle = open ? '#2f6a4c' : 'rgba(29,25,21,.45)'; g.fillText(`♥${C11_STORY_AT[i]}`, lx, y);
    g.fillStyle = open ? INK : 'rgba(29,25,21,.45)';
    for (const l of c11Wrap(g, open ? line.replace(/\{Y\}/g, p.y) : '? ? ?', pw - 80)) { if (y > py + ph - 20) break; g.fillText(l, lx + 40, y); y += 17; }
    y += 6;
  });
}

/* ---------- the tea stall in the hamlet ---------- */
function c11OpenTea() {
  const L = [['Bát nước chè xanh', 'nóng, chát mà ngọt hậu', 3, 8], ['Kẹo lạc', 'giòn tan', 5, 10], ['Bánh đa vừng', 'nướng than hoa', 6, 12], ['Chén chè hạt sen', 'mát lành', 10, 18]];
  C11.menu = { title: 'Hàng nước cô Duyên', rows: L.map(([name, sub, price, en]) => ({ name, sub: `${sub} · +${en} sức`, price, f: () => {
    if (SAVE4.money < price) { C11.menu.note = 'Không đủ tiền'; return; }
    if (SAVE11.stamina >= C11_EN) { C11.menu.note = 'Đang no rồi'; return; }
    SAVE4.money -= price; persist4(); SAVE11.stamina = Math.min(C11_EN, SAVE11.stamina + en); c11Sfx.pluck && c11Sfx.pluck(); C11.menu.note = `+${en} sức`; persist11();
  } })) };
}

/* ---------- art: the communal house, tiled houses, a shack, the village gate, things of the đình, a boat and a lift net ---------- */
let C11ART2 = null;
function c11Art2() {
  if (C11ART2) return C11ART2;
  const jit = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  c11Art(); PL.ngoi = ['#a85a3c', [-1, 1]]; PL.ngoi2 = ['#7a3a26', [-1, 1]]; PL.gach = ['#b8673f', [-1, 1]];
  const scales = (a, x0, y0, rows, step, hwAt) => { for (let r = 0; r < rows; r++) { const y = y0 + r * step, hw = hwAt(y); for (let x = -hw + 6; x < hw - 4; x += 11) a.band('ngoi2', smooth([[x - 5.5, y], [x, y + 4.5], [x + 5.5, y]], false), .7); } };
  const dinh = part([-390, -360, 390, 24], a => {
    a.fk('ash', c4Rect(-312, -36, 312, 0), 2); for (let x = -290; x <= 290; x += 40) a.key(lines([[x, -36, x, 0]]), .5); a.key(lines([[-312, -18, 312, -18]]), .6);
    a.fk('ash', c4Rect(-84, -6, 84, 8), 1.6); a.fk('ash', c4Rect(-96, 6, 96, 20), 1.6);
    a.fill('tan', c4Rect(-292, -172, 292, -36));
    const P = [-270, -162, -54, 54, 162, 270];
    for (let i = 0; i < 5; i++) {
      const x0 = P[i] + 10, x1 = P[i + 1] - 10, mid = i === 2;
      for (let j = 0; j < 4; j++) {
        const d0 = x0 + (x1 - x0) * j / 4 + 2, d1 = x0 + (x1 - x0) * (j + 1) / 4 - 2;
        a.fk(mid ? 'red' : 'brown', c4Rect(d0, -162, d1, -42), .8); a.fill(mid ? 'orange' : 'tan', c4Rect(d0 + 4, -154, d1 - 4, -112)); a.fill(mid ? 'orange' : 'tan', c4Rect(d0 + 4, -92, d1 - 4, -50));
        if (!mid) for (let yy = -150; yy < -114; yy += 7) a.band('brown', lines([[d0 + 5, yy, d1 - 5, yy]]), .5); else for (const yy of [-132, -72]) a.fill('yellow', circ((d0 + d1) / 2, yy, 2.2));
      }
    }
    for (const x of P) { a.fk('bark', c4Rect(x - 9, -174, x + 9, -36), 1.4); a.fill('brown', c4Rect(x - 2, -174, x + 4, -36)); a.fk('ash', ell(x, -36, 15, 6), 1.2); }
    for (const x of [-54, 54]) { a.fk('red', c4Rect(x - 6, -150, x + 6, -60), .6); for (let y = -144; y < -64; y += 12) a.fill('yellow', c4Rect(x - 2.5, y, x + 2.5, y + 6)); }
    a.fk('bark', c4Rect(-302, -188, 302, -172), 1.4);
    for (const x of P) a.fk('brown', smooth([[x - 16, -174], [x - 12, -188], [x + 12, -188], [x + 16, -174], [x, -168]]), 1);
    const roof = c4Poly([[-342, -184], [-216, -314], [216, -314], [342, -184]]);
    a.fill('ngoi', roof); scales(a, 0, -308, 10, 13, y => 216 + (y + 314) / 130 * 126);
    for (let i = -18; i <= 18; i++) a.band('ngoi2', lines([[i * 11.6, -312, i * 11.6 * 342 / 216, -186]]), .4);
    a.key(roof, 2.4);
    a.fk('ngoi2', c4Poly([[-346, -188], [346, -188], [340, -176], [-340, -176]]), 1.6);
    for (const sg of [-1, 1]) { a.fk('ngoi2', smooth([[sg * 300, -188], [sg * 352, -192], [sg * 376, -212], [sg * 384, -240], [sg * 370, -236], [sg * 358, -212], [sg * 330, -198]]), 1.6); a.fk('ash', circ(sg * 380, -242, 5), 1); }
    for (const sg of [-1, 1]) { a.band('ash', lines([[sg * 216, -314, sg * 346, -186]]), 7); a.key(lines([[sg * 216, -310, sg * 342, -184]]), .6); }
    a.fk('ash', c4Rect(-228, -330, 228, -312), 1.8); for (let x = -220; x < 222; x += 14) a.key(lines([[x, -330, x, -312]]), .35);
    for (const sg of [-1, 1]) a.fk('ash', smooth([[sg * 222, -314], [sg * 240, -324], [sg * 252, -346], [sg * 242, -352], [sg * 234, -336], [sg * 216, -328]]), 1.4);
    a.fk('red', circ(0, -344, 10), 1.2); for (let i = 0; i < 8; i++) { const an = i * .785; a.band('orange', lines([[Math.cos(an) * 12, -344 + Math.sin(an) * 12, Math.cos(an) * 17, -344 + Math.sin(an) * 17]]), 1.2); }
    for (const sg of [-1, 1]) { const pts = []; for (let i = 0; i <= 12; i++) pts.push([sg * (24 + i * 9), -336 + Math.sin(i * .9) * 5]); a.band('teal', smooth(pts, false), 5); a.key(smooth(pts, false), .5); a.fk('teal', circ(sg * 22, -338, 5), 1); }
    a.fk('red', c4Rect(-94, -170, 94, -140), 1.6); a.key(c4Rect(-88, -166, 88, -144), .6);
  });
  /* a village house with a tiled roof (ngói mũi hài): wall plate, wide or not */
  const nha = (wall, W) => part([-206 * W, -244, 206 * W, 14], a => {
    const X = v => v * W;
    a.fk('ash', c4Rect(X(-140), -6, X(140), 8), 1.6); a.fk('ash', c4Rect(-34, 4, 34, 13), 1.4);
    a.fill(wall, c4Rect(X(-130), -72, X(130), -6));
    if (wall === 'gach') for (let y = -66, i = 0; y < -6; y += 9, i++) { a.key(lines([[X(-130), y, X(130), y]]), .3); for (let x = X(-130) + (i % 2) * 11; x < X(130); x += 22) a.key(lines([[x, y, x, y + 9]]), .25); }
    for (const sx of [-1, 1]) { const cx = X(sx * 92); a.fk('tan', c4Rect(cx - 26, -56, cx + 26, -24), 1.2); for (let x = cx - 20; x <= cx + 20; x += 7) a.band('brown', lines([[x, -56, x, -24]]), 1.6); }
    a.fill('tan', c4Rect(-28, -64, 28, -6)); for (const x of [-14, 14]) { a.key(c4Rect(x - 13, -62, x + 13, -8), 1); for (let y = -56; y < -12; y += 8) a.band('brown', lines([[x - 11, y, x + 11, y]]), .8); }
    for (const x of [X(-130), X(-52), X(52), X(130)]) { a.fk('brown', c4Rect(x - 4, -74, x + 4, -6), 1.2); a.fill('ash', c4Rect(x - 6, -9, x + 6, -4)); }
    a.fill('tan', c4Rect(X(-130), -78, X(130), -68)); a.fk('brown', c4Rect(X(-134), -80, X(134), -72), 1.2);
    const roof = c4Poly([[X(-196), -74], [X(-116), -196], [X(116), -196], [X(196), -74]]);
    a.fill('ngoi', roof); scales(a, 0, -190, 9, 13, y => X(116) + (y + 196) / 122 * X(80));
    a.key(roof, 2.2);
    a.fk('ngoi2', c4Poly([[X(-200), -78], [X(200), -78], [X(194), -68], [X(-194), -68]]), 1.4);
    for (const sg of [-1, 1]) { a.fk('ngoi2', smooth([[sg * X(170), -78], [sg * X(204), -82], [sg * X(216), -98], [sg * X(206), -98], [sg * X(196), -88]]), 1.2); a.band('ash', lines([[sg * X(116), -196, sg * X(198), -78]]), 5); }
    a.fk('ash', c4Rect(X(-124), -210, X(124), -194), 1.6);
    for (const sg of [-1, 1]) a.fk('ash', smooth([[sg * X(118), -196], [sg * X(134), -206], [sg * X(142), -226], [sg * X(132), -228], [sg * X(126), -212], [sg * X(112), -208]]), 1.2);
    a.fk('brown', ell(X(-162), -16, 14, 17), 1.6); a.fk('ash', ell(X(-162), -31, 10, 4), 1.2);
    a.fk('straw', ell(X(166), -24, 16, 16), 1.2); for (let r2 = 5; r2 < 16; r2 += 5) a.key(ell(X(166), -24, r2, r2), .45);
  });
  const leu = part([-96, -136, 96, 12], a => {
    for (const x of [-60, 60]) a.fk('bark', c4Rect(x - 3, -82, x + 3, 2), 1);
    a.fill('tan', c4Rect(-58, -72, 58, 0)); for (let x = -54; x < 56; x += 7) a.band('thatch2', lines([[x, -72, x + 1, 0]]), .8); a.key(c4Rect(-58, -72, 58, 0), 1);
    a.fill('dark', c4Rect(-14, -52, 14, 0)); a.band('bark', lines([[-14, -26, 14, -30]]), 1);
    const roof = c4Poly([[-88, -68], [-52, -116], [58, -108], [90, -64]]); a.fill('thatch3', roof);
    for (let i = 0; i < 42; i++) { const x = -82 + i * 4.1; a.band(jit(i, 3) < .5 ? 'thatch2' : 'thatch', lines([[x, -104 + Math.abs(x) * .3, x + 2, -66]]), .8); }
    a.key(roof, 1.6); a.fk('thatch', ell(-22, -98, 15, 6, .2), .8); a.fk('straw', ell(30, -88, 12, 5, -.2), .7);
    a.fk('brown', ell(74, -12, 10, 12), 1.2); a.key(lines([[68, -20, 76, -6]]), .8);
  });
  const cong = part([-150, -292, 150, 10], a => {
    for (const sg of [-1, 1]) {
      const x = sg * 64; a.fk('gach', c4Rect(x - 18, -200, x + 18, 0), 1.8);
      for (let y = -190, i = 0; y < 0; y += 12, i++) { a.key(lines([[x - 18, y, x + 18, y]]), .4); a.key(lines([[x + (i % 2 ? -6 : 6), y, x + (i % 2 ? -6 : 6), y + 12]]), .3); }
      a.fk('ash', c4Rect(x - 22, -212, x + 22, -200), 1.2); a.fk('ash', c4Rect(x - 22, -6, x + 22, 4), 1.2);
    }
    a.fk('gach', c4Rect(-46, -200, 46, -156), 1.4); a.fk('cream', c4Rect(-40, -194, 40, -162), 1);
    a.text('LÀNG VŨ ĐẠI', 0, -178, 11, null, '"Playfair Display", serif', 'ink', '900');
    const roof = c4Poly([[-118, -212], [-80, -254], [80, -254], [118, -212]]); a.fill('ngoi', roof); scales(a, 0, -250, 3, 12, y => 80 + (y + 254) / 42 * 38); a.key(roof, 1.8);
    a.fk('ngoi2', c4Poly([[-122, -214], [122, -214], [118, -206], [-118, -206]]), 1.2);
    for (const sg of [-1, 1]) a.fk('ngoi2', smooth([[sg * 100, -214], [sg * 126, -218], [sg * 138, -234], [sg * 130, -234], [sg * 120, -222]]), 1.2);
    a.fk('ash', c4Rect(-86, -264, 86, -252), 1.4); for (const sg of [-1, 1]) a.fk('ash', smooth([[sg * 84, -254], [sg * 96, -264], [sg * 100, -278], [sg * 92, -278], [sg * 86, -264]]), 1);
  });
  const tru = part([-28, -214, 28, 8], a => {
    a.fk('ash', c4Rect(-20, -14, 20, 4), 1.4); a.fk('ash', c4Rect(-13, -172, 13, -14), 1.6); a.fill('white', c4Rect(-9, -168, -3, -18)); a.key(lines([[-13, -120, 13, -120], [-13, -60, 13, -60]]), .6);
    a.fk('ash', c4Rect(-18, -182, 18, -172), 1.2); a.fk('ash', smooth([[-14, -182], [-10, -198], [0, -206], [10, -198], [14, -182]]), 1.2); a.fk('red', circ(0, -208, 4), .8);
  });
  const bang = part([-50, -124, 50, 8], a => {
    for (const x of [-34, 34]) a.fk('bark', c4Rect(x - 3, -98, x + 3, 4), 1);
    a.fk('brown', c4Rect(-42, -106, 42, -44), 1.6); a.fill('tan', c4Rect(-37, -100, 37, -50));
    for (const [x, y, w, h] of [[-33, -97, 28, 30], [0, -95, 32, 22], [-8, -68, 22, 15]]) { a.fk('paper', c4Rect(x, y, x + w, y + h), .6); for (let yy = y + 5; yy < y + h - 3; yy += 4) a.key(lines([[x + 3, yy, x + w - 3, yy]]), .3); }
    a.fk('ngoi', c4Poly([[-50, -104], [0, -122], [50, -104], [46, -100], [-46, -100]]), 1.2);
  });
  const trong = part([-60, -112, 70, 8], a => {
    for (const x of [-40, 40]) a.fk('bark', c4Rect(x - 4, -62, x + 4, 4), 1); a.band('bark', lines([[-40, -20, 40, -20]]), 4);
    a.fk('red', c4Rect(-34, -96, 34, -28), 1.6); a.fk('tan', ell(0, -28, 34, 9), 1); a.fk('tan', ell(0, -96, 34, 9), 1.4);
    for (let x = -28; x <= 28; x += 8) a.fill('yellow', circ(x, -91, 1.4)); a.band('bark', lines([[46, -64, 62, -100]]), 3); a.fk('tan', circ(62, -100, 4), .8);
  });
  const lu = part([-40, -100, 40, 8], a => {
    a.fk('ash', c4Rect(-30, -30, 30, 4), 1.4); a.fk('ash', c4Rect(-24, -38, 24, -30), 1);
    a.fk('dark', smooth([[-28, -40], [-32, -62], [-20, -74], [20, -74], [32, -62], [28, -40]]), 1.6); a.fill('teal', smooth([[-20, -44], [-24, -62], [-14, -70], [-6, -70], [-12, -56], [-10, -44]]));
    for (const sg of [-1, 1]) a.fk('dark', smooth([[sg * 20, -74], [sg * 24, -86], [sg * 16, -86], [sg * 14, -74]]), 1);
    a.fk('dark', ell(0, -74, 22, 5), 1); for (const x of [-6, 0, 6]) a.band('red', lines([[x, -76, x + 1, -94]]), 1.4);
  });
  const thuyen = part([-104, -64, 104, 18], a => {
    const hull = smooth([[-100, -18], [-62, 6], [62, 6], [100, -18], [72, -12], [-72, -12]]); a.fk('bark', hull, 1.8); a.fill('brown', smooth([[-82, -14], [-50, 1], [50, 1], [82, -14]]));
    const mui = smooth([[-42, -14], [-36, -46], [0, -54], [36, -46], [42, -14]]); a.fk('thatch3', mui, 1.4); for (let x = -32; x <= 32; x += 8) a.band('thatch2', lines([[x, -50 + Math.abs(x) * .2, x, -15]]), .7);
    a.band('tan', lines([[72, -14, 100, -60]]), 2.4);
  });
  const vo = part([-100, -176, 120, 70], a => {
    a.band('tan', lines([[-60, 0, 30, -160]]), 5); a.key(lines([[-60, 0, 30, -160]]), .6);
    a.fk('bark', c4Rect(-74, -16, -44, 4), 1.2);
    const net = [[20, 30], [100, 20], [110, 60], [30, 66]]; for (const [x, y] of net) a.band('tan', lines([[30, -160, x, y]]), 1.2);
    a.band('tan', smooth([[20, 30], [60, 22], [100, 20]], false), 2); a.band('tan', smooth([[30, 66], [70, 64], [110, 60]], false), 2);
    for (let i = 1; i < 6; i++) { a.key(lines([[20 + i * 13, 30 - i * 1.6, 30 + i * 13, 66 - i]]), .35); a.key(lines([[20 + i * 1.6, 30 + i * 6, 100 + i * 1.6, 20 + i * 6.6]]), .35); }
  });
  return (C11ART2 = { dinh, ngoi: nha('cream', 1), ngoiW: nha('gach', 1.3), leu, cong, tru, bang, trong, lu, thuyen, vo });
}
function c11House2(g, hs, sx, sy, k) {
  const spr = c11Art2()[hs.kind], s = k * (hs.s || 1);
  c11Shade(g, sx(hs.x), sy(hs.y), spr.w * .4 * s, 18 * s, .26); c11Spr(g, spr, sx(hs.x), sy(hs.y), s);
}
const C11_PROP = { I: ['tru', .9], Y: ['bang', .95], Z: ['trong', .95], L: ['lu', .9], O: ['vo', 1] };
/* the area's big things (đình, gate, boat), props on their tiles, incense smoke, and the name of a house when the mouse is at its door */
function c11Extras(E, g, sx, sy, k, T) {
  const A2 = c11Art2(), id = C11_AR.id, t = C11.t;
  c11MarkDraw(E, g, sx, sy, k, T); c11Extras2(E, g, sx, sy, k, T);
  if (id === 'dinh') E.push({ y: 6, d: () => { c11Shade(g, sx(12), sy(6), 330 * k, 26 * k, .28); c11Spr(g, A2.dinh, sx(12), sy(6), k); g.font = `900 ${Math.round(16 * k)}px "Playfair Display", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f2cf5a'; g.fillText('ĐÌNH VŨ ĐẠI', sx(12), sy(6) - 155 * k); } });
  if (id === 'lang') E.push({ y: 18, d: () => { c11Shade(g, sx(15.5), sy(18), 110 * k, 12 * k, .24); c11Spr(g, A2.cong, sx(15.5), sy(18), k); } });
  if (id === 'ben') E.push({ y: 10.95, d: () => { const bob = Math.sin(t * 1.3) * 2 * k; c11Spr(g, A2.thuyen, sx(14.6), sy(10.95) + bob, k * .9); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(sx(14.6), sy(11.05) + bob, 96 * k, 7 * k, 0, 0, 6.283); g.stroke(); } });
  for (let y = 0; y < C11_H; y++) for (let x = 0; x < C11_W; x++) {
    const pr = C11_PROP[C11_MAP[y][x]]; if (!pr) continue;
    const X = sx(x + .5), Y = sy(y + .92); E.push({ y: y + .92, d: () => { c11Shade(g, X, Y, 26 * k, 7 * k); c11Spr(g, A2[pr[0]], X, Y, k * pr[1]); if (pr[0] === 'lu') for (let i = 0; i < 4; i++) { const a = (t * .35 + i / 4) % 1; g.fillStyle = `rgba(236,232,222,${.5 * (1 - a)})`; g.beginPath(); g.arc(X + Math.sin(t * 1.5 + i * 2) * 5 * k + a * 8 * k, Y - 92 * k - a * 70 * k, (3 + a * 8) * k, 0, 6.283); g.fill(); } } });
  }
  for (const hs of C11_AR.houses) if (hs.name && Math.abs(C11.px - hs.x) < 1.6 && C11.py > hs.y - .2 && C11.py < hs.y + 1.6) E.push({ y: 99, d: () => c11TagC(g, sx(hs.x), sy(hs.y) - (hs.kind === 'leu' ? 150 : 250) * k * (hs.s || 1) - 30, hs.name, { size: 11, h: 24, pad: 16, fill: '#fbf4dc' }) });
}
/* the ground of the đình yard (old square bricks, gạch bát) and the river landing's planks, painted with the area's background */
function c11BgYard(g, tiles, at, S, rnd) {
  const q = tiles('q'); if (!q.length) return;
  for (const [x, y] of q) { const [px, py] = at(x, y); g.fillStyle = 'rgba(91,47,31,.8)'; g.fillRect(px - S / 2 - 3, py - S / 2 - 3, S + 6, S + 6); }
  for (const [x, y] of q) { const [px, py] = at(x, y); g.fillStyle = '#d8c49a'; g.fillRect(px - S / 2, py - S / 2, S, S); }
  const n = 3, b = S / n;
  for (const [x, y] of q) { const [px, py] = at(x, y); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = rnd(), bx = px - S / 2 + i * b + 1.2, by = py - S / 2 + j * b + 1.2, bw = b - 2.4; g.fillStyle = v < .33 ? '#c4936a' : v < .66 ? '#b98a62' : '#cb9f76'; g.fillRect(bx, by, bw, bw); g.fillStyle = 'rgba(255,240,210,.12)'; g.fillRect(bx + 1, by + 1, bw - 2, 1.6); if (rnd() < .18) { g.fillStyle = 'rgba(70,110,60,.35)'; g.fillRect(bx - 1.2, by + bw * rnd(), 2.4, 3); } } }
}
function c11BgPlanks(g, tiles, at, S) {
  for (const [x, y] of tiles('b')) { const [px, py] = at(x, y); g.fillStyle = 'rgba(10,36,46,.3)'; g.fillRect(px - S / 2 + 6, py - S / 2 + 8, S + 4, S + 4); }   // the jetty's shadow on the water
  for (const [x, y] of tiles('b')) { const [px, py] = at(x, y); g.fillStyle = 'rgba(29,25,21,.85)'; g.fillRect(px - S / 2 - 2, py - S / 2 - 2, S + 4, S + 4); }
  for (const [x, y] of tiles('b')) { const [px, py] = at(x, y); for (let i = 0; i < 4; i++) { const y0 = py - S / 2 + i * S / 4 + 1, gr = g.createLinearGradient(0, y0, 0, y0 + S / 4 - 2); gr.addColorStop(0, i % 2 ? '#d29a64' : '#deaa72'); gr.addColorStop(1, i % 2 ? '#8a5a32' : '#9a663a'); g.fillStyle = gr; g.fillRect(px - S / 2, y0, S, S / 4 - 2); g.fillStyle = 'rgba(60,34,16,.5)'; g.fillRect(px - S / 2 + 4 + i * 7 % 30, y0 + 3, 2, 2); g.fillRect(px + S / 2 - 8 - i * 5 % 20, y0 + 4, 2, 2); } }
  for (const [x, y] of tiles('b')) if (c11Kind(x, y + 1) === 'w') { const [px, py] = at(x, y); g.fillStyle = '#6a4428'; for (const dx of [-.42, .42]) g.fillRect(px + dx * S - 3, py + S / 2 - 2, 6, 14); }
}
