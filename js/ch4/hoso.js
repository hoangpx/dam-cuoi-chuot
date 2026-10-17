/* Chương IV · hồ sơ người chơi và khách phương xa (owner, 2026-10-17; cả chợ làng lẫn phố huyện).
   1. Hồ sơ (localStorage dcc.hoso): vai chuột chồng / chuột vợ, tên (≤ HS_NAME_MAX), tuổi, trang phục (màu lông, đội đầu, màu áo,
      màu quần / váy), những món thích ăn ở làng và trên phố (tick), mô tả bản thân (≤ HS_DESC_MAX), các câu chuyện (≤ HS_STORIES, mỗi
      chuyện ≤ HS_STORY_MAX) và các chỉ số: ngày buôn bán, người quen, danh tiếng (hsFame: chơi càng nhiều ngày càng cao), số chợ coi
      mình là khách quen, sao đánh giá. Lưu lên Supabase (rpc dcc_prof_put, docs/supabase-ho-so-khach.sql, owner phải chạy một lần)
      khi bấm Lưu và mỗi lần sang ngày (c4DayAdvance).
   2. Khách phương xa: hồ sơ của người chơi khác (rpc dcc_prof_pick: ngẫu nhiên; dcc_prof_get: những người đã quen) đi chợ trong game
      này. Mỗi ngày (SAVE4.day) mỗi chợ có tối đa HS_PER_DAY khách phương xa, mỗi người chỉ đi chợ một lần một ngày (dcc.hsPlan), đến
      vào một giờ ngẫu nhiên; người đã quen được chọn nhiều hơn. Họ mặc đúng trang phục của hồ sơ, kể các câu chuyện của mình trong bong
      bóng, mua món họ thích nếu nhà mình có bán. Mua lần đầu thì biết mặt, lần hai thành khách quen (★, rpc dcc_regular_add), từ đó có
      trong danh sách khách (sổ tay › Khách quen ở làng; nút Hồ sơ ở phố) với hồ sơ, chỉ số, món thích, và được đánh giá một lần (sao +
      lời, rpc dcc_review_put). Chủ hồ sơ đọc mọi đánh giá trong sổ tay › Hồ sơ (rpc dcc_review_mine).
   Ghi nhớ từng khách phương xa (dùng chung cho làng và phố) ở localStorage dcc.hsKhach[id] = { v, seen, k, a, rev, last, p }.
   Máy chủ chưa dựng thì mọi rpc lặng lẽ hỏng: không có khách phương xa, hồ sơ chỉ lưu trên máy. */
const HS_NAME_MAX = 12, HS_DESC_MAX = 200, HS_STORY_MAX = 120, HS_STORIES = 8, HS_REVIEW_MAX = 200;
const HS_PER_DAY = 2;                                                      // far-away guests a day at each market (owner: "đừng để chợ quá đông")
const HS_POOL_EVERY = 60 * 60 * 1000;                                      // fetch other players' profiles again every hour (was 10 min; owner 2026-10-17: fewer requests)
const HS_ROLES = [['chong', 'Chuột chồng'], ['vo', 'Chuột vợ']];
const HS_AGES = [['tre', 'Trẻ'], ['trung', 'Trung niên'], ['gia', 'Già']];
const HS_FURS = [['brown', 'Nâu'], ['dark', 'Đen'], ['grey', 'Xám'], ['tan', 'Vàng đất'], ['ash', 'Tro'], ['cream', 'Kem'], ['white', 'Trắng']];
const HS_ROBES = [['red', 'Đỏ son'], ['blue', 'Chàm'], ['green', 'Lục'], ['yellow', 'Vàng'], ['white', 'Trắng'], ['brown', 'Nâu'], ['lilac', 'Tím nhạt'], ['pink', 'Hồng'], ['orange', 'Cam'], ['teal', 'Lam'], ['cream', 'Kem'], ['straw', 'Rơm']];
const HS_TRIM = { red: 'yellow', blue: 'yellow', green: 'red', yellow: 'red', white: 'blue', brown: 'yellow', lilac: 'green', pink: 'white', orange: 'blue', teal: 'yellow', cream: 'red', straw: 'brown' };
// a wife and a husband dress apart (owner, 2026-10-17: "chọn vợ cho chồng phải có hình thức khác nhau"): she wears a skirt (váy đụp,
// drawn over the legs) and a woman's headwear, he wears trousers (the rig's legs in that colour, buildMouse o.leg) and a man's
const HS_SKIRTS = [['dark', 'Đen'], ['brown', 'Nâu'], ['blue', 'Chàm'], ['red', 'Đỏ son'], ['green', 'Xanh rêu'], ['teal', 'Lam'], ['pink', 'Hồng'], ['cream', 'Ngà']];   // plates: the skirt is part of the rig (buildMouse o.skirt)
const HS_PANTS = [['dark', 'Đen'], ['brown', 'Nâu'], ['blue', 'Chàm'], ['white', 'Trắng'], ['cream', 'Ngà'], ['grey', 'Xám'], ['straw', 'Vàng rơm']];
const HS_TOPS = [['tran', 'Để trần'], ['van', 'Khăn vấn'], ['xep', 'Khăn xếp'], ['quai', 'Nón quai thao'], ['mu', 'Mũ'], ['hoa', 'Cài hoa']];
const HS_TOPS_OF = { vo: ['tran', 'van', 'quai', 'hoa'], chong: ['tran', 'xep', 'mu'] };
const hsTops = role => HS_TOPS.filter(([k]) => HS_TOPS_OF[role].includes(k));
// the build (owner: "béo gầy hay là cao hoặc bình thường"): béo is the rig's own fat body; gầy and cao stretch the figure (w.sx / w.sy)
const HS_BODIES = [['vua', 'Bình thường'], ['beo', 'Béo'], ['gay', 'Gầy'], ['cao', 'Cao']];
const HS_SHAPE = { vua: null, beo: { sx: 1.04, sy: .97 }, gay: { sx: .82, sy: 1.03 }, cao: { sx: .95, sy: 1.15 } };
// where they live (picked, never typed, so nothing needs checking)
const HS_LANGS = ['làng Đông Hồ', 'làng Kim Liên', 'làng Đình Bảng', 'làng Thổ Hà', 'làng Bát Tràng', 'làng Vạn Phúc', 'làng Phù Lưu', 'làng Đường Lâm', 'làng Mông Phụ', 'làng Hữu Bằng'];
// what can be ticked as liked: the village's dishes (C4_GOODS keys, so a guest who likes one buys it) and the town's eating houses
const HS_FOOD_LANG = [['trau', 'Trầu cau'], ['che', 'Chè xanh'], ['xoi', 'Xôi'], ['bun', 'Bún riêu'], ['banhcuon', 'Bánh cuốn'], ['ruou', 'Rượu nếp']];
const HS_FOOD_PHO = P4_FOOD_NAMES.map(n => ['pho:' + n, c4Cap1(n.toLowerCase())]);
const HS_FOOD_NAME = Object.fromEntries([...HS_FOOD_LANG, ...HS_FOOD_PHO]);
const HS_ADDR_MAX = 40;                                                    // "Ở đâu", typed freely (owner, 2026-10-17)
const HS_DEF = { name: '', role: 'vo', age: 'tre', body: 'vua', fur: 'brown', robe: 'red', skirt: 'blue', pants: 'dark', top: 'van', addr: '', likes: [], desc: '', stories: [] };
// a profile is there from the start, every field drawn at random (owner, 2026-10-17: "hồ sơ có sẵn ... đều được random, câu chuyện cũng
// được gắn sẵn 1 câu chuyện random"); the player changes what they like. All lines original.
const HS_RAND_DESC = ['Hiền lành, chăm chỉ, sáng nào cũng dậy từ gà gáy.', 'Tính hay cười, ai nhờ gì cũng giúp.', 'Mê hát chèo, tối nào cũng ra đình nghe hát.',
  'Tiết kiệm từng đồng, mơ có ngày mua được nhà ngói.', 'Nói nhiều nhưng thật bụng.', 'Khéo tay, đan rổ đan rá đẹp nhất xóm.', 'Thích đi chợ phiên, chợ nào cũng biết.',
  'Ít nói, nhưng đã hứa là làm.', 'Nấu ăn ngon có tiếng, giỗ chạp nhà nào cũng mời.', 'Mới lập nghiệp, còn nhiều bỡ ngỡ.'];
const HS_RAND_STORY = ['Hôm qua tôi đánh rơi chiếc nón xuống ao, may có con vịt bơi ra đẩy vào bờ hộ!', 'Nhà tôi có con mèo mướp, đêm nào cũng ngủ trên đống thóc mà chẳng bắt con chuột nào.',
  'Ngày cưới, đoàn rước dâu nhà tôi đi lạc sang làng bên, phải hỏi đường mãi mới tới.', 'Năm ngoái lụt to, cả nhà tôi ngồi trên nóc bếp ăn khoai luộc ba ngày.',
  'Tôi từng gánh trầu đi bộ lên phố huyện, về đến nhà thì trời đã tối mịt.', 'Cụ nhà tôi bảo: buôn có bạn, bán có phường. Tôi nhớ mãi câu ấy.',
  'Có lần tôi mặc cả mua con gà, về nhà mới biết là gà của nhà mình xổng ra.', 'Đêm rằm tôi thả đèn hoa đăng, ước nhà mình làm ăn khấm khá.',
  'Tôi trồng một cây bưởi trước ngõ, năm nay ra quả đầu tiên ngọt lịm.', 'Hôm nọ đi chợ quên tiền, bà hàng xóm cho chịu, mai tôi phải mang trả.',
  'Thằng cu nhà hàng xóm thả diều mắc lên cây gạo, cả xóm xúm vào gỡ.', 'Tôi học têm trầu cánh phượng ba hôm mới được một miếng ra hồn.'];
function hsRandom() {
  const r = a => a[(Math.random() * a.length) | 0], role = Math.random() < .5 ? 'vo' : 'chong', g = role === 'vo' ? 'f' : 'm';
  const names = [...(C4_GIVEN[g] || []), ...(C4_GIVEN2[g] || [])].filter(n => n.length <= HS_NAME_MAX);
  const foods = [...HS_FOOD_LANG, ...HS_FOOD_PHO].map(o => o[0]).sort(() => Math.random() - .5);
  return { name: r(names), role, age: r(['tre', 'tre', 'tre', 'trung', 'trung', 'gia']), body: r(['vua', 'vua', 'beo', 'gay', 'cao']), fur: r(HS_FURS)[0], robe: r(HS_ROBES)[0],
    skirt: r(HS_SKIRTS)[0], pants: r(HS_PANTS)[0], top: r(HS_TOPS_OF[role]), addr: `${r(C4_XOM)}, ${r(HS_LANGS)}`, likes: foods.slice(0, 2 + ((Math.random() * 3) | 0)),
    desc: r(HS_RAND_DESC), stories: [r(HS_RAND_STORY)] };
}
const HS = { pool: new Map(), poolAt: 0, loading: false, me: null, revs: null, back: null, tab: 'ho', edit: null };

const hsGet = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v === null ? d : v; } catch (e) { return d; } };
const hsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
// my profile; the first time it is drawn at random and kept (and goes up with the next push)
const hsMine = () => { let p = hsGet('dcc.hoso', null); if (!p || !p.name) { p = hsRandom(); hsSet('dcc.hoso', p); } return hsClean({ ...HS_DEF, ...p }); };
const hsKhach = () => { if (!HS.k) HS.k = hsGet('dcc.hsKhach', {}) || {}; return HS.k; };
const hsK = id => hsKhach()[id] || (hsKhach()[id] = { v: 0, a: 0 });
function hsSaveK() {
  const K = hsKhach(), ids = Object.keys(K);
  if (ids.length > 200) ids.filter(i => !K[i].k).sort((a, b) => (K[a].last || 0) - (K[b].last || 0)).slice(0, ids.length - 200).forEach(i => delete K[i]);
  hsSet('dcc.hsKhach', K);
}
const hsShow = id => (S.mode === 'c4bplay' ? p4Sheets : c4Sheets)(id);
const hsCol = k => (PL[k] || PL.red)[0];
const hsOpt = (L, k) => (L.find(o => o[0] === k) || L[0])[1];
const hsStars = n => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));
const hsAgo = t => { const d = Math.floor((Date.now() - new Date(t)) / 864e5); return d <= 0 ? 'hôm nay' : d === 1 ? 'hôm qua' : d + ' ngày trước'; };

// whatever comes from the server (or an old save) is cut back to the shapes the game knows
function hsClean(d) {
  d = d && typeof d === 'object' ? d : {}; const one = (L, v) => (L.some(o => o[0] === v) ? v : L[0][0]), str = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n);
  const st = d.stats && typeof d.stats === 'object' ? d.stats : {};
  const role = one(HS_ROLES, d.role), tops = HS_TOPS_OF[role];
  return { name: str(d.name, HS_NAME_MAX), role, age: one(HS_AGES, d.age), body: one(HS_BODIES, d.body), fur: one(HS_FURS, d.fur), robe: one(HS_ROBES, d.robe), skirt: one(HS_SKIRTS, d.skirt),
    pants: one(HS_PANTS, d.pants), top: tops.includes(d.top) ? d.top : tops[1], addr: str(d.addr, HS_ADDR_MAX) || [C4_XOM.includes(d.xom) ? d.xom : '', HS_LANGS.includes(d.lang) ? d.lang : ''].filter(Boolean).join(', '),   // older profiles had two picks
    likes: (Array.isArray(d.likes) ? d.likes : []).filter(k => HS_FOOD_NAME[k]).slice(0, 40), desc: str(d.desc, HS_DESC_MAX),
    stories: (Array.isArray(d.stories) ? d.stories : []).map(s => str(s, HS_STORY_MAX)).filter(Boolean).slice(0, HS_STORIES),
    shop: str(d.shop, 24), stats: { day: Math.max(1, +st.day || 1), known: Math.max(0, +st.known || 0), fame: Math.max(0, Math.min(100, +st.fame || 0)) } };
}
// the name exactly as the player wrote it, nothing added (owner, 2026-10-17: "ko thêm cô hay cái j cả")
const hsName = d => (d && d.name ? d.name : 'khách phương xa');
const hsAddr = d => d.addr || '';

/* ---------- looks: a rig of their own colours, a portrait ---------- */
const HS_RIGS = new Map();
function hsRig(d) {
  const man = d.role === 'chong', key = [d.fur, d.robe, d.top === 'mu' ? 1 : 0, man ? d.pants : '', man ? '' : d.skirt, d.body === 'beo' ? 1 : 0].join('|');
  if (!HS_RIGS.has(key)) HS_RIGS.set(key, buildMouse({ robe: d.robe, trim: HS_TRIM[d.robe] || 'yellow', head: d.fur, hat: d.top === 'mu' ? 'dark' : undefined, leg: man ? d.pants : undefined, skirt: man ? undefined : d.skirt, fat: d.body === 'beo' }));
  return HS_RIGS.get(key);
}
const hsSort = d => (d.age === 'gia' ? 9 : 0);                             // a base sort for the walk (old ones stoop with a stick); colours come from hsRig
const hsLook = d => ({ skirt: null, hat: d.top === 'quai' ? 'quai' : null, umbCol: hsCol(d.robe) });
// what sits on the head besides the rig's own cap (mũ): c4FaceExtras' parts (a turban, a flower, glasses, a beard); the quai thao hat
// is the lane's own (look.hat), so only the portrait asks for it here
function hsExtras(d, face) {
  const X = {};
  if (face && d.top === 'quai') X.quai = true;
  if (d.top === 'van' || d.top === 'xep') { X.wrap = d.top; X.wrapCol = d.role === 'vo' ? '#3a2a5a' : '#2a2320'; }
  if (d.top === 'hoa') X.flower = '#c0567a';
  if (d.age === 'gia') { X.glasses = true; if (d.role === 'chong' && face) X.beard = true; }   // the beard only in the round portrait: on a whole figure it read as a white fang (owner)
  return X;
}
// w.sx / w.sy (the build) and w.hx (the head's things) for c4Critter and p4Folk, which hand w.hx back to hsHeadOn
const hsShape = d => { const X = hsExtras(d); return { ...(HS_SHAPE[d.body] || {}), hx: Object.keys(X).length ? X : null }; };
// the head's things on a whole figure: c4FaceExtras draws in the portrait's space (the mouse at 44,150, size 1.05, facing right), so map
// that onto this figure (its feet at x,y, size s, facing w.face), bobbing with the walk and lowered on a stool as c4Mouse does
function hsHeadOn(g, w, x, y, s) {
  if (!w.hx) return;
  const k = s * .92, moving = ['walk', 'leave', 'go'].includes(w.st) || (['queue', 'toseat', 'fgo', 'fq'].includes(w.st) && w.moving);
  const bob = moving ? -Math.abs(Math.sin(w.ph)) * 3.5 : 0, sit = w.st === 'sit' || w.st === 'eat' ? -8 : 0;
  const old = (C4_MOUSE_SORTS[w.sort] || {}).role === 'old' && !sit;   // the old stoop forward about the feet (c4Critter, p4Folk)
  g.save(); g.translate(x, y); if (old) g.rotate((w.face || 1) * .1); g.scale(w.face || 1, 1); g.translate(0, (bob + sit) * k); g.scale(s / 1.05, s / 1.05); g.translate(-44, -150);
  try { c4FaceExtras(g, w.hx); } catch (e) {}
  g.restore();
}
const HS_FACE = new Map();
function hsFace(d, id) {
  const key = id + '|' + [d.fur, d.robe, d.top, d.age, d.role, d.body].join('|'); if (HS_FACE.has(key)) return HS_FACE.get(key);
  const c = mk(96, 96), g = c.getContext('2d');
  g.fillStyle = C4_FACE_BG[(Number.isFinite(+id) ? Math.abs(+id) : 3) % C4_FACE_BG.length]; g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.fill();
  g.save(); g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.clip();
  const t = C4.t; C4.t = 0;
  try { c4NoWx(() => c4Critter(g, { kind: 'mouse', sort: hsSort(d), M: hsRig(d), seed: 0, ph: 0, st: 'idle', face: 1 }, 44, 150, 1.05)); } catch (e) {}
  C4.t = t;
  const X = hsExtras(d, true);
  if (d.age === 'gia') { g.translate(44, 150); g.rotate(.1); g.translate(-44, -150); }   // with the old one's stoop, as hsHeadOn
  try { c4FaceExtras(g, X); } catch (e) {}
  g.restore(); g.strokeStyle = '#b39a6a'; g.lineWidth = 5; g.beginPath(); g.arc(48, 48, 44, 0, 6.283); g.stroke();
  const url = c.toDataURL(); HS_FACE.set(key, url); return url;
}
// the whole figure for the editor's preview (the market's own drawing)
function hsFigure(d) {
  const c = mk(180, 250), g = c.getContext('2d'), t = C4.t; C4.t = 0;
  try { c4NoWx(() => c4Critter(g, { kind: 'mouse', sort: hsSort(d), M: hsRig(d), seed: 0, ph: 0, st: 'idle', face: 1, look: hsLook(d), ...hsShape(d) }, 80, 242, 1)); } catch (e) {}
  C4.t = t; return c.toDataURL();
}

/* ---------- my numbers ---------- */
function hsKnownCount() {
  let n = 0;
  try { n += c4People().list.filter(p => c4Known(p.id)).length; } catch (e) {}
  try { n += p4People().filter(p => p4Known(p.id)).length; } catch (e) {}
  n += Object.values(hsKhach()).filter(f => f.k).length;
  return n;
}
// how much one counts for in the world: grows with the days played, then the folk you know, the markets that count you a regular, the reviews
function hsFame() {
  const me = HS.me || {}, day = Math.max(1, SAVE4.day || 1);
  return Math.min(100, Math.round(6 * Math.sqrt(day) + .35 * hsKnownCount() + 3 * (me.nreg || 0) + 1.5 * (me.nrev || 0) + .5 * (me.ngift || 0)));
}
const HS_FAME = [[10, 'Mới ra chợ'], [25, 'Có người biết mặt'], [45, 'Có tiếng trong xóm'], [65, 'Có tiếng cả làng'], [85, 'Nổi tiếng phố huyện'], [101, 'Danh gia vọng tộc']];
const hsFameWord = f => HS_FAME.find(([n]) => f < n)[1];
const hsShopName = () => (typeof SAVE4B !== 'undefined' && SAVE4B.house && SAVE4B.name) || 'TRẦU CAU';

/* ---------- the server ---------- */
// send my profile with today's numbers (when saved, and each time a day turns); quiet when there is no profile or no server
function hsPush() {
  const p = hsMine(); if (!p || !SAVE4.started) return Promise.resolve(null);
  const data = { ...p, shop: hsShopName(), stats: { day: Math.max(1, SAVE4.day || 1), known: hsKnownCount(), fame: hsFame() } };
  return p4Rpc('dcc_prof_put', { p_device: p4Device(), p_data: data, p_pub: true }).then(id => { if (id) { const q = hsGet('dcc.hoso', {}); if (q.id !== id) { q.id = id; hsSet('dcc.hoso', q); } } return id; });
}
// other players' profiles: a random handful, plus every one already met here (so regulars keep coming)
function hsPoolEnsure() {
  if (HS.loading || document.hidden || Date.now() - HS.poolAt < HS_POOL_EVERY) return;
  HS.loading = true; HS.poolAt = Date.now();
  const K = hsKhach(), mine = (hsGet('dcc.hoso', {}) || {}).id, full = Date.now() - (+localStorage.getItem('hsGetAt') || 0) > 6 * 3600e3,   // the guests met: their profiles are kept here (K[i].p); fetched again in full every 6 hours, else only those missing
    met = Object.keys(K).filter(i => (K[i].seen || K[i].k) && (full || !K[i].p)).map(Number).slice(0, 200);
  if (full) try { localStorage.setItem('hsGetAt', String(Date.now())); } catch (e) {}
  const put = list => { if (Array.isArray(list)) for (const r of list) if (r && r.id && r.id !== mine && r.data) { const d = hsClean(r.data); if (!d.name) continue; HS.pool.set(+r.id, { id: +r.id, d, stars: r.stars === null ? null : +r.stars, nrev: +r.nrev || 0, nreg: +r.nreg || 0 }); if (K[r.id]) K[r.id].p = d; } };
  Promise.all([p4Rpc('dcc_prof_pick', { p_device: p4Device(), p_limit: 12 }).then(put).catch(() => {}), met.length ? p4Rpc('dcc_prof_get', { p_ids: met }).then(put).catch(() => {}) : null, hsMeLoad()])
    .finally(() => { HS.loading = false; hsSaveK(); });
}
// my own numbers on the server, and a word when new reviews have come in
function hsMeLoad() {
  return p4Rpc('dcc_prof_me', { p_device: p4Device() }).then(r => {
    const me = Array.isArray(r) && r[0]; if (!me) return; HS.me = { id: +me.id, stars: me.stars === null ? null : +me.stars, nrev: +me.nrev || 0, nreg: +me.nreg || 0, hidden: !!me.hidden };
    const seen = +hsGet('dcc.hsRevSeen', 0) || 0;
    if (HS.me.nrev > seen && !HS.told) { HS.told = true; toast(`Có ${HS.me.nrev - seen} đánh giá mới về bạn từ người chơi khác. Xem trong Sổ tay › Hồ sơ.`, 3.6); if (typeof C4 !== 'undefined') C4.noteNew = true; }
    return p4Rpc('dcc_gift_count', { p_device: p4Device() }).then(c => {
      const n = Array.isArray(c) && c[0]; if (!n) return; HS.me.ngift = +n.ngift || 0;
      const g = HS.me.ngift - (+hsGet('dcc.hsGiftSeen', 0) || 0), t = (+n.nthank || 0) - (+hsGet('dcc.hsThankSeen', 0) || 0);
      if ((g > 0 || t > 0) && !HS.toldGift) { HS.toldGift = true; toast([g > 0 ? `${g} lời mời ăn thử mới` : '', t > 0 ? `${t} lời cảm ơn mới` : ''].filter(Boolean).join(' và ') + ' từ người chơi khác. Xem trong Sổ tay › Hồ sơ.', 3.6); if (typeof C4 !== 'undefined') C4.noteNew = true; }
    }).catch(() => {});
  }).catch(() => {});
}
const hsProf = id => { const P = HS.pool.get(+id); if (P) return P; const f = hsKhach()[id]; return f && f.p ? { id: +id, d: hsClean(f.p), stars: null, nrev: 0, nreg: 0 } : null; };

/* ---------- who comes today ---------- */
// one plan a day for both markets: up to HS_PER_DAY each, nobody twice in a day, at a random hour; those met before are likelier
function hsPlan() {
  let P = hsGet('dcc.hsPlan', null);
  const pool = [...HS.pool.values()];
  if (P && P.day === SAVE4.day && (P.lang.length + P.pho.length > 0 || !pool.length)) return P;
  if (!HS.poolAt || HS.loading) return null;                                 // the pool is not here yet: plan later
  const K = hsKhach(), left = pool.map(p => [p, 1 + (K[p.id] && K[p.id].k ? 3 : K[p.id] && K[p.id].seen ? 1.5 : 0)]);
  const take = () => { let tot = left.reduce((a, [, w]) => a + w, 0), r = Math.random() * tot; for (let i = 0; i < left.length; i++) if ((r -= left[i][1]) <= 0) return left.splice(i, 1)[0][0].id; return null; };
  P = { day: SAVE4.day, lang: [], pho: [] };
  for (let i = 0; i < HS_PER_DAY && left.length; i++) P.lang.push({ id: take(), at: (7 + Math.random() * 9) * 60 });
  for (let i = 0; i < HS_PER_DAY && left.length; i++) P.pho.push({ id: take(), at: (8 + Math.random() * 12) * 60 });
  hsSet('dcc.hsPlan', P); return P;
}
function hsDue(place, mins) {
  hsPoolEnsure(); const P = hsPlan(); if (!P) return null;
  const g = P[place].find(g => !g.done && mins >= g.at); if (!g) return null;
  g.done = true; hsSet('dcc.hsPlan', P); return hsProf(g.id);
}
// on the lane: now and then they tell one of their stories (one after another), else what they are like
function hsTalk(list, say, dt) {
  for (const w of list) {
    if (w.net === undefined || w.st === 'leave') continue;
    if ((w.hsT -= dt) > 0 || w.say) continue;
    const P = hsProf(w.net), d = P && P.d; w.hsT = 9 + Math.random() * 7; if (!d) continue;
    const lines = d.stories.length ? d.stories : d.desc ? [d.desc] : []; if (!lines.length) continue;
    say(w, lines[(w.hsI = ((w.hsI ?? -1) + 1)) % lines.length], 3.2 + lines[w.hsI % lines.length].length * .05);
  }
}

/* ---------- the village (js/ch4) ---------- */
function hsVillageTick(dt) {
  if (C4.phase !== 'open') return;
  const P = hsDue('lang', C4.mins); if (P) hsSpawnLang(P);
  hsInvTick('lang', dt); hsTalk(C4.walkers, c4Say, dt);
}
function hsSpawnLang(P) {
  const d = P.d, V = c4View(), fromRight = Math.random() < .6;
  const mine = c4Owned().filter(g => c4Stock(g) > 0), liked = mine.filter(g => d.likes.includes(g));
  const shop = liked.length ? liked[(Math.random() * liked.length) | 0] : mine.length && Math.random() < .35 ? mine[(Math.random() * mine.length) | 0] : null;
  let x = fromRight ? C4.camX + V.vw + 120 + Math.random() * 200 : C4_GATE - 40;
  if (shop && fromRight) x = Math.max(x, C4_GOODS[shop].x + 260);
  const old = d.age === 'gia', sp = old ? 36 + Math.random() * 8 : 58 + Math.random() * 20;
  C4.walkers.push({ kind: 'mouse', sort: hsSort(d), M: hsRig(d), seed: Math.random() * 6, name: hsName(d), pid: undefined, net: P.id, look: hsLook(d), buf: false, smokeX: undefined, drunk: false, umb: Math.random() < .4,
    x, z: .38 + Math.random() * .6, face: fromRight ? -1 : 1, dir: fromRight ? -1 : 1, guest: false, sp, ph: Math.random() * 6, buy: !!shop, shop, st: 'walk', n: 1 + ((Math.random() * 3) | 0), treat: false, carry: null, cd: 4 + Math.random() * 6, say: null, hsT: 2 + Math.random() * 2, ...hsShape(d) });
}

/* ---------- the town (js/ch4b) ---------- */
function hsTownTick(dt) {
  if (P4.phase !== 'open' || P4.paused) return;
  const P = hsDue('pho', P4.mins); if (P) hsSpawnPho(P);
  hsInvTick('pho', dt); hsTalk(P4.walkers, p4Say, dt);
}
function hsSpawnPho(P) {
  const d = P.d, who = { id: undefined, name: hsName(d), sort: hsSort(d), seed: Math.random() * 6, old: d.age === 'gia', g: d.role === 'chong' ? 'm' : 'f', look: { skirt: d.role === 'vo', hat: d.top === 'quai' ? 'quai' : null } };
  const S2 = SAVE4B.house ? p4Shops() : {}, eat = Object.keys(S2).filter(k => d.likes.includes('pho:' + S2[k].food));
  const before = P4.walkers.length;
  if (eat.length && Math.random() < .6) { const k = eat[(Math.random() * eat.length) | 0]; p4FoodCustomer(+k, k, who); }
  else p4Spawn(undefined, who, { buy: d.likes.includes('trau') || Math.random() < .4 });
  const w = P4.walkers[before]; if (!w) return;
  Object.assign(w, { M: hsRig(d), net: P.id, hsT: 2 + Math.random() * 2, ...hsShape(d) }); w.look = { ...w.look, silk: hsCol(d.robe), hat: d.top === 'quai' ? 'quai' : null };
}

/* ---------- inviting a far-away guest to try a dish (owner, 2026-10-17: "mời món ... người được mời nhận lời cảm ơn hoặc món quà
   trong sổ tay"): on a stall's / an eating house's "Mời khách" tab, as for the village folk: word is sent (once a guest a day), they may
   not come (.15 a regular, .3 a face), else 8–30 s later they eat one portion free and like it more if it is among their liked dishes.
   Once eaten, a gift is written on the server (rpc dcc_gift_add, docs/supabase-qua-moi.sql); its owner reads it in the book and can send
   one thank-you back (dcc_gift_thank), which the inviter reads in theirs (dcc_gift_sent). ---------- */
const HS_THANKS = ['Cảm ơn nhé, ngon lắm!', 'Đúng món tôi thích, quý hoá quá!', 'Lần sau tôi lại ghé ủng hộ!', 'Hôm nào sang chợ tôi, tôi mời lại!'];
// the dish a sheet offers: the village ware's key, 'trau' at the town's house, 'pho:NAME' at an eating house we run
const hsDish = (place, kind) => (place === 'pho' ? (kind === 'trau' ? 'trau' : 'pho:' + p4Shops()[kind].food) : kind);
const hsDishWord = k => (k.startsWith('pho:') ? 'bát ' + HS_FOOD_NAME[k].toLowerCase() : k === 'trau' ? 'miếng trầu' : C4_FAV_WORD[k] || C4_GOODS[k].name.toLowerCase());
// the rows for the far-away guests under the "Mời khách" list (null when there are none); redraw() draws the sheet again
function hsTreatRows(place, kind, has, redraw) {
  const ids = hsGuests(); if (!ids.length) return null;
  const K = hsKhach(), day = SAVE4.day, dish = hsDish(place, kind), d = document.createElement('div');
  d.innerHTML = `<h5 class="hsTrH">Khách phương xa</h5><div class="trl">${ids.map(i => { const p = hsProf(i).d, f = K[i], done = f.treat === day, fav = p.likes.includes(dish);
    return `<div class="tr${f.k ? '' : ' unk2'}"><img src="${hsFace(p, i)}" alt=""><b>${p4Esc(hsName(p))}${fav ? ' <i class="fav">♥</i>' : ''}</b>${c4Bar(f.a || 0)}<button data-hst="${i}" ${!has || done ? 'disabled' : ''}>${done ? '✓ đã nhắn' : 'Mời'}</button></div>`; }).join('')}</div>`;
  d.querySelectorAll('[data-hst]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); hsInvite(+b.dataset.hst, place, kind); redraw(); }));
  return d;
}
function hsInvite(id, place, kind) {
  const f = hsK(id), P = hsProf(id); if (!P || f.treat === SAVE4.day) return;
  f.treat = SAVE4.day; hsSaveK();
  (HS.invQ = HS.invQ || []).push({ id, place, kind, left: 8 + Math.random() * 22, no: Math.random() < (f.k ? .15 : .3), late: Math.random() < .4 });
  toast(`Đã nhắn ${hsName(P.d)} ra ${place === 'pho' && kind !== 'trau' ? 'quán' : 'hàng'} ăn thử ${hsDishWord(hsDish(place, kind))}. Người ta có đến không thì chưa biết.`, 3.4); AU.tap();
}
// every frame of that market: the invited come (or send word they cannot)
function hsInvTick(place, dt) {
  const Q = HS.invQ; if (!Q || !Q.length) return;
  for (const e of Q.filter(e => e.place === place)) {
    if ((e.left -= dt) > 0) continue;
    Q.splice(Q.indexOf(e), 1);
    const P = hsProf(e.id); if (!P) continue; const d = P.d, nm = hsName(d);
    if (e.no) { toast(c4Pick([`Chờ mãi chẳng thấy ${hsName(d)} đâu. Đường xa quá chăng?`, `${nm} nhắn ra: "Hôm nay bận quá, hẹn dịp khác nhé!"`]), 3); continue; }
    const say = w => setTimeout(() => { if (!w.say) (place === 'pho' ? p4Say : c4Say)(w, c4Pick(e.late ? ['Đường xa, giờ tôi mới tới!', 'Xin lỗi, tôi đến muộn!'] : ['Được mời là tôi đến ngay!', 'Nghe mời là tôi sang liền!'])); }, 900);
    if (place === 'lang') {
      if (c4Stock(e.kind) < 1 || !c4Open(e.kind)) { toast(`${nm} ra đến nơi thì quán hết hàng, đành về.`, 3); continue; }
      c4Spawn(undefined, { p: { id: undefined, kind: 'mouse', sort: hsSort(d), role: d.age === 'gia' ? 'old' : 'adult', name: hsName(d), look: hsLook(d), nope: [] }, shop: e.kind, treat: true });
      const w = C4.walkers[C4.walkers.length - 1]; if (!w) continue; Object.assign(w, { M: hsRig(d), net: e.id, hsT: 6, ...hsShape(d) }); say(w);
    } else {
      const who = { id: undefined, sort: hsSort(d), seed: Math.random() * 6, old: d.age === 'gia', look: { skirt: d.role === 'vo', hat: d.top === 'quai' ? 'quai' : null } }, before = P4.walkers.length;
      if (e.kind === 'trau') { if (SAVE4B.stock < 1) { toast(`${nm} tới nơi thì hiệu hết trầu, đành về.`, 3); continue; } p4Spawn(undefined, who, { buy: true, treat: true, n: 1 }); }
      else if (p4Shops()[e.kind]) p4FoodCustomer(+e.kind, e.kind, who, { treat: true, n: 1 }); else continue;
      const w = P4.walkers[before]; if (!w) continue; Object.assign(w, { M: hsRig(d), net: e.id, hsT: 6, ...hsShape(d) }); w.look = { ...w.look, silk: hsCol(d.robe) }; say(w);
    }
  }
}
// they have eaten the free portion: pleased or polite, and a gift for the profile's owner
function hsTreatDone(w, place) {
  const id = w.net, P = hsProf(id); if (!P) return; const d = P.d, f = hsK(id), day = SAVE4.day, nm = hsName(d);
  const dish = place === 'pho' ? (w.food ? 'pho:' + ((p4Shops()[w.food] || {}).food || '') : 'trau') : w.shop, liked = d.likes.includes(dish);
  f.p = d; f.last = Date.now(); const was = !!f.k; let line;
  if (liked) {
    if (f.k) f.a = Math.min(100, (f.a || 0) + 16);
    else { f.seen = f.seen || day; f.v = (f.v || 0) + 2; if (f.v >= 2) { f.k = day; f.a = 50; p4Rpc('dcc_regular_add', { p_device: p4Device(), p_target: +id }).catch(() => {}); } }
    line = `${nm} sáng mắt lên: "Đúng món tôi thích! Cảm ơn nhà mình nhé."${!was && f.k ? ' Từ nay đã thành khách quen.' : ''}`;
  } else {
    if (f.k) f.a = Math.min(100, (f.a || 0) + 4); else { f.seen = f.seen || day; f.v = (f.v || 0) + 1; }
    line = `${nm} ăn xong cảm ơn, vui vẻ ra về.`;
  }
  hsSaveK(); toast(line + ' Người ấy sẽ thấy lời mời này trong sổ tay.', 3.8);
  const mine = hsMine();
  p4Rpc('dcc_gift_add', { p_device: p4Device(), p_target: +id, p_what: hsDishWord(dish), p_liked: liked, p_from: mine ? hsName(mine) : c4RankName(), p_shop: place === 'pho' ? hsShopName() : 'chợ quê' }).catch(() => {});
}

/* ---------- served or let down (both markets) ---------- */
function hsServed(w, place) {
  if (w.treat) { hsTreatDone(w, place); return; }                          // an invited guest: the free portion (above)
  const id = w.net, P = hsProf(id), d = P && P.d, f = hsK(id), day = SAVE4.day, nm = hsName(d);
  if (d) f.p = d; f.last = Date.now(); f.v = (f.v || 0) + 1;
  const fx = s => (place === 'pho' ? P4.fx.push({ x: w.x, y: p4Y(w.z) - 200, s, t: 0 }) : C4.fx.push({ x: w.x, y: c4Y(w.z) - 200, t: 0, s }));
  if (!f.seen) { f.seen = day; fx(nm); }
  else if (!f.k) {
    f.k = day; f.a = 45; fx('★ ' + nm);
    toast(`${nm} (người chơi phương xa) đã thành khách quen. Xem trong Sổ tay › Khách quen.`, 3.6);
    if (place !== 'pho') C4.noteNew = true;
    p4Rpc('dcc_regular_add', { p_device: p4Device(), p_target: +id }).catch(() => {});
  } else f.a = Math.min(100, (f.a || 0) + 5);
  hsSaveK();
  if (Math.random() < .35) (place === 'pho' ? p4Say : c4Say)(w, c4Pick(['Hàng nhà này khéo thật!', 'Lần sau tôi lại ghé!', 'Đi xa thế này cũng đáng!', 'Ngon, đúng vị tôi thích!']));
}
function hsSnubbed(w, empty) {
  const f = hsKhach()[w.net]; if (!f || !f.k) return;
  f.a = Math.max(0, (f.a || 0) - (empty ? 10 : 4)); hsSaveK();
}

/* ---------- the list of far-away guests and one guest's card ---------- */
function hsGuests() { const K = hsKhach(); return Object.keys(K).filter(i => (K[i].k || K[i].seen) && hsProf(i)).sort((a, b) => (!!K[b].k - !!K[a].k) || (K[b].a || 0) - (K[a].a || 0)); }
function hsBookHtml() {
  const ids = hsGuests(), K = hsKhach(); if (!ids.length) return '';
  return `<h4>Khách phương xa <small>(người chơi khác)</small></h4><div class="folk">${ids.map(i => { const d = hsProf(i).d, f = K[i];
    return `<button class="fk${f.k ? '' : ' unk2'}" data-net="${i}"><img src="${hsFace(d, i)}" alt=""><b>${p4Esc(hsName(d))}</b>${f.k ? c4Bar(f.a || 0) : ''}<span>${f.k ? `ghé ${f.v} lần${f.rev ? ' · đã đánh giá' : ''}` : 'mới ghé 1 lần'}</span></button>`; }).join('')}</div>`;
}
function hsBookWire(root, back) { root.querySelectorAll('[data-net]').forEach(b => b.addEventListener('click', () => { AU.tap(); hsWhoOpen(+b.dataset.net, back); })); }
function hsWhoOpen(id, back) {
  const P = hsProf(id); if (!P) return; const d = P.d, f = hsK(id), sell = hsSellsNow();
  HS.back = back || null; HS.star = 0;
  const likes = d.likes.length ? d.likes.map(k => `<span class="hsChip${sell.has(k) ? ' on' : ''}">${sell.has(k) ? '♥ ' : ''}${p4Esc(HS_FOOD_NAME[k])}</span>`).join('') : '<span class="sm">chưa kể</span>';
  const rev = f.rev ? `<p class="hsDone">Bạn đã đánh giá: <b class="hsSt">${hsStars(f.rev.stars)}</b>${f.rev.body ? `<br><i>“${p4Esc(f.rev.body)}”</i>` : ''}</p>`
    : f.k ? `<div class="hsRev"><p class="sm">Đánh giá vị khách này (chỉ được một lần, người ấy sẽ đọc được trong sổ tay):</p><div class="hsStars">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-st="${n}">☆</button>`).join('')}</div>`
      + `<textarea class="hsRevT" maxlength="${HS_REVIEW_MAX}" rows="3" placeholder="Vài lời về vị khách này…"></textarea><p class="hsCnt sm"><span>0</span>/${HS_REVIEW_MAX}</p><button class="btn hsRevGo" disabled>Gửi đánh giá</button></div>`
    : '<p class="sm">Ghé mua thêm lần nữa, thành khách quen rồi mới đánh giá được.</p>';
  $('#hsWhoB').innerHTML = `<div class="hsHead"><img src="${hsFace(d, id)}" alt=""><div><h3>${p4Esc(hsName(d))}</h3><p class="sm">${hsOpt(HS_ROLES, d.role)} · ${hsOpt(HS_AGES, d.age).toLowerCase()} · ${hsOpt(HS_BODIES, d.body).toLowerCase()} · người chơi phương xa</p>${hsAddr(d) ? `<p class="sm">Ở ${p4Esc(hsAddr(d))}</p>` : ''}`
    + (d.shop ? `<p class="sm">Chủ hiệu <b>${p4Esc(d.shop)}</b></p>` : '') + `</div></div>`
    + `<div class="hsStats"><div><b>${d.stats.day}</b><span>ngày buôn</span></div><div><b>${d.stats.known}</b><span>người quen</span></div><div><b>${P.nreg || 0}</b><span>chợ coi là khách quen</span></div><div><b>${P.stars ? P.stars + '★' : '–'}</b><span>${P.nrev || 0} đánh giá</span></div></div>`
    + `<p class="hsFame">Danh tiếng: <b>${hsFameWord(d.stats.fame)}</b> ${c4Bar(d.stats.fame)}</p>`
    + (d.desc ? `<p class="hsDesc">“${p4Esc(d.desc)}”</p>` : '')
    + `<h4>Thích ăn</h4><p class="hsChips">${likes}</p>`
    + (d.stories.length ? `<h4>Chuyện kể</h4>${d.stories.map(s => `<p class="hsStory">${p4Esc(s)}</p>`).join('')}` : '')
    + `<h4>Ở chợ nhà mình</h4><p class="sm">${f.k ? `Khách quen từ ngày ${f.k}, ghé ${f.v} lần. Mức thân: ${c4LikeWord(f.a || 0).toLowerCase()}.` : `Mới ghé ${f.v || 0} lần.`}</p>${f.k ? c4Bar(f.a || 0) : ''}`
    + rev + `<p><button class="link hsRep">Báo hồ sơ xấu</button></p>`;
  const B = $('#hsWhoB');
  B.querySelectorAll('[data-st]').forEach(b => b.addEventListener('click', () => { AU.tap(); HS.star = +b.dataset.st; B.querySelectorAll('[data-st]').forEach(x => { x.textContent = +x.dataset.st <= HS.star ? '★' : '☆'; x.classList.toggle('on', +x.dataset.st <= HS.star); }); B.querySelector('.hsRevGo').disabled = false; }));
  const ta = B.querySelector('.hsRevT'); if (ta) ta.addEventListener('input', () => { B.querySelector('.hsCnt span').textContent = ta.value.length; });
  const go = B.querySelector('.hsRevGo'); if (go) go.addEventListener('click', () => hsReview(id, go));
  B.querySelector('.hsRep').addEventListener('click', () => { if (!confirm('Báo hồ sơ này có lời lẽ xấu? Hồ sơ bị nhiều người báo sẽ bị ẩn.')) return; p4Rpc('dcc_prof_report', { p_id: +id }).catch(() => {}); HS.pool.delete(+id); delete hsKhach()[id]; hsSaveK(); toast('Đã báo. Cảm ơn bạn.', 2); hsWhoClose(); });
  $('#hsWhoBack').textContent = back ? 'Quay lại' : 'Đóng';
  hsShow('hsWho'); $('#hsWho .card4').scrollTop = 0;
}
function hsWhoClose() { const b = HS.back; HS.back = null; if (b) b(); else hsShow(null); }
// what our markets sell right now (to mark the guest's liked dishes we have)
function hsSellsNow() {
  const out = new Set();
  try { for (const g of c4Owned()) out.add(g); } catch (e) {}
  try { if (SAVE4B.house) { out.add('trau'); for (const R of Object.values(p4Shops())) out.add('pho:' + R.food); } } catch (e) {}
  return out;
}
function hsReview(id, btn) {
  const body = ($('#hsWhoB .hsRevT').value || '').replace(/\s+/g, ' ').trim().slice(0, HS_REVIEW_MAX), stars = HS.star;
  if (!stars) { toast('Chọn số sao trước đã.', 2); return; }
  if (p4HoaBad(body)) { toast('Lời đánh giá có chữ không đẹp, sửa lại nhé.', 2.6); return; }
  const mine = hsMine(), from = mine ? hsName(mine) : c4RankName();
  btn.disabled = true; btn.textContent = 'Đang gửi…';
  p4Rpc('dcc_review_put', { p_device: p4Device(), p_target: +id, p_stars: stars, p_body: body, p_from: from })
    .then(() => { hsK(id).rev = { stars, body, day: SAVE4.day }; hsSaveK(); AU.tap(); toast('Đã gửi đánh giá. Người ấy sẽ đọc được trong sổ tay.', 3); hsWhoOpen(id, HS.back); })
    .catch(e => {
      const m = e.message || '';
      if (/already/.test(m)) { hsK(id).rev = { stars, body, day: SAVE4.day }; hsSaveK(); toast('Bạn đã đánh giá người này rồi.', 2.6); hsWhoOpen(id, HS.back); return; }
      btn.disabled = false; btn.textContent = 'Gửi đánh giá';
      toast(/bad words/.test(m) ? 'Lời đánh giá có chữ không đẹp, sửa lại nhé.' : /too soon/.test(m) ? 'Chậm lại một chút rồi gửi nhé.' : 'Chưa gửi được (mất kết nối?). Thử lại sau nhé.', 3);
    });
}

/* ---------- my profile: the summary with my numbers and the reviews I got ---------- */
async function hsProfileInto(box, back) {
  box.classList.add('hsBox');
  const p = hsMine(), fame = hsFame(), me = HS.me || {};
  box.innerHTML = `<div class="hsHead"><img src="${hsFace(p, me.id || 0)}" alt=""><div><h3>${p4Esc(hsName(p))}</h3><p class="sm">${hsOpt(HS_ROLES, p.role)} · ${hsOpt(HS_AGES, p.age).toLowerCase()} · ${hsOpt(HS_BODIES, p.body).toLowerCase()}</p>`
    + `<p class="sm">${p4Esc(hsAddr(p))}</p></div></div>`
    + `<div class="hsStats"><div><b>${Math.max(1, SAVE4.day || 1)}</b><span>ngày buôn</span></div><div><b>${hsKnownCount()}</b><span>người quen</span></div><div><b class="hsReg">${me.nreg ?? '–'}</b><span>chợ coi là khách quen</span></div><div><b class="hsAvg">${me.stars ? me.stars + '★' : '–'}</b><span><i class="hsN">${me.nrev || 0}</i> đánh giá</span></div></div>`
    + `<p class="hsFame">Danh tiếng: <b>${hsFameWord(fame)}</b> ${c4Bar(fame)}</p>`
    + (p.desc ? `<p class="hsDesc">“${p4Esc(p.desc)}”</p>` : '')
    + `<p class="hsChips">${p.likes.map(k => `<span class="hsChip">${p4Esc(HS_FOOD_NAME[k])}</span>`).join('')}</p>`
    + `<p class="sm">${p.stories.length} câu chuyện</p><button class="btn alt hsEditB">Sửa hồ sơ</button>`
    + `<h4>Đánh giá từ khách hàng</h4><div class="hsRevs"><p class="sm">Đang tải…</p></div>`
    + `<h4>Quà mời nhận được</h4><div class="hsGifts"><p class="sm">Đang tải…</p></div>`
    + `<h4>Lời cảm ơn nhận được</h4><div class="hsThx"><p class="sm">Đang tải…</p></div>`;
  hsGiftsInto(box);
  box.querySelector('.hsEditB').addEventListener('click', () => { AU.tap(); hsEditOpen(back); });
  const R = box.querySelector('.hsRevs');
  try {
    await hsPush().catch(() => {}); await hsMeLoad();
    const list = await p4Rpc('dcc_review_mine', { p_device: p4Device() }), L = Array.isArray(list) ? list : [];
    const m = HS.me || {}; box.querySelector('.hsReg').textContent = m.nreg ?? 0; box.querySelector('.hsAvg').textContent = m.stars ? m.stars + '★' : '–'; box.querySelector('.hsN').textContent = m.nrev || 0;
    hsSet('dcc.hsRevSeen', L.length); HS.told = true;
    R.innerHTML = m.hidden ? '<p class="bad">Hồ sơ của bạn bị nhiều người báo nên đang bị ẩn.</p>' : '';
    R.innerHTML += L.length ? `<p class="sm">Trung bình <b class="hsSt">${hsStars(m.stars || 0)}</b> ${m.stars || ''} · ${L.length} lượt</p><div class="hsRl">${L.map(r => `<div class="hsR"><b class="hsSt">${hsStars(r.stars)}</b> <small>${p4Esc(r.from_name || 'một nhà buôn')} · ${hsAgo(r.created_at)}</small>${r.body ? `<p>${p4Esc(r.body)}</p>` : ''}<button class="link" data-rr="${r.id}">Báo xấu</button></div>`).join('')}</div>`
      : '<p class="sm">Chưa ai đánh giá. Khi hồ sơ của bạn thành khách quen ở chợ nhà người khác, họ có thể để lại vài lời.</p>';
    R.querySelectorAll('[data-rr]').forEach(b => b.addEventListener('click', () => { p4Rpc('dcc_review_report', { p_id: +b.dataset.rr }).catch(() => {}); b.closest('.hsR').remove(); toast('Đã báo. Cảm ơn bạn.', 2); }));
  } catch (e) { R.innerHTML = '<p class="sm">Chưa kết nối được máy chủ. Hồ sơ vẫn lưu trên máy này; lát nữa thử lại nhé.</p>'; }
}

// the gifts others sent me (each can be thanked once) and the thanks I got for mine
async function hsGiftsInto(box) {
  const G = box.querySelector('.hsGifts'), T = box.querySelector('.hsThx');
  try {
    const [mine, sent] = await Promise.all([p4Rpc('dcc_gift_mine', { p_device: p4Device() }), p4Rpc('dcc_gift_sent', { p_device: p4Device() })]);
    const L = Array.isArray(mine) ? mine : [], S2 = (Array.isArray(sent) ? sent : []).filter(g => g.thanks);
    hsSet('dcc.hsGiftSeen', L.length); hsSet('dcc.hsThankSeen', S2.length);
    G.innerHTML = L.length ? `<div class="hsRl">${L.map(g => `<div class="hsR" data-g="${g.id}"><p><b>${p4Esc(g.from_name || 'một nhà buôn')}</b>${g.shop ? ` (${p4Esc(g.shop)})` : ''} mời bạn ăn thử ${p4Esc(g.what)}${g.liked ? ' <i class="fav">♥ đúng món bạn thích</i>' : ''} <small>· ${hsAgo(g.created_at)}</small></p>`
      + (g.thanks ? `<p class="sm">Bạn đã cảm ơn: “${p4Esc(g.thanks)}”</p>`
        : `<div class="hsTk"><p class="hsChips">${HS_THANKS.map(t => `<button type="button" class="hsChip" data-tk="${p4Esc(t)}">${p4Esc(t)}</button>`).join('')}</p><input class="hsIn" maxlength="80" placeholder="Hoặc tự viết lời cảm ơn…"><button class="btn alt hsTkGo">Gửi lời cảm ơn</button></div>`) + '</div>').join('')}</div>`
      : '<p class="sm">Chưa ai mời. Khi hồ sơ của bạn đi chợ nhà người khác, chủ hàng có thể mời bạn ăn thử; lời mời sẽ hiện ở đây.</p>';
    G.querySelectorAll('.hsR[data-g]').forEach(r => {
      const tk = r.querySelector('.hsTk'); if (!tk) return; const inp = tk.querySelector('input');
      tk.querySelectorAll('[data-tk]').forEach(c => c.addEventListener('click', () => { AU.tap(); inp.value = c.dataset.tk; }));
      tk.querySelector('.hsTkGo').addEventListener('click', e => {
        const t = inp.value.replace(/\s+/g, ' ').trim().slice(0, 80); if (!t) { toast('Chọn hoặc viết một lời cảm ơn đã.', 2); return; }
        if (p4HoaBad(t)) { toast('Lời cảm ơn có chữ không đẹp, sửa lại nhé.', 2.6); return; }
        e.target.disabled = true;
        p4Rpc('dcc_gift_thank', { p_device: p4Device(), p_id: +r.dataset.g, p_text: t }).then(() => { AU.tap(); tk.outerHTML = `<p class="sm">Bạn đã cảm ơn: “${p4Esc(t)}”</p>`; toast('Đã gửi lời cảm ơn.', 2); })
          .catch(() => { e.target.disabled = false; toast('Chưa gửi được (mất kết nối?). Thử lại sau nhé.', 3); });
      });
    });
    T.innerHTML = S2.length ? `<div class="hsRl">${S2.map(g => { const who = hsClean(g.who || {}); return `<div class="hsR"><p><b>${p4Esc(hsName(who))}</b> cảm ơn bạn vì ${p4Esc(g.what)}:</p><p><i>“${p4Esc(g.thanks)}”</i> <small>· ${hsAgo(g.thanked_at || g.created_at)}</small></p></div>`; }).join('')}</div>`
      : '<p class="sm">Mời khách phương xa ăn thử ở tab "Mời khách" của từng hàng; họ cảm ơn thì lời cảm ơn hiện ở đây.</p>';
  } catch (e) { G.innerHTML = T.innerHTML = '<p class="sm">Chưa kết nối được máy chủ. Lát nữa thử lại nhé.</p>'; }
}

/* ---------- the editor ---------- */
function hsEditOpen(back) {
  const p = hsMine(); HS.edit = { ...p, likes: [...p.likes], stories: [...p.stories] }; HS.editBack = back || null;
  if (!HS.edit.stories.length) HS.edit.stories = [''];
  hsEditDraw(); hsShow('hsEdit'); $('#hsEdit .card4').scrollTop = 0;
}
function hsEditDraw() {
  const E = HS.edit, B = $('#hsEditB');
  const pills = (key, L) => `<div class="hsPills">${L.map(([k, n]) => `<button type="button" class="${E[key] === k ? 'on' : ''}" data-k="${key}" data-v="${k}">${n}</button>`).join('')}</div>`;
  const sw = (key, L, col) => `<div class="hsSw">${L.map(([k, n]) => `<button type="button" title="${n}" class="${E[key] === k ? 'on' : ''}" data-k="${key}" data-v="${k}" style="background:${col(k)}"></button>`).join('')}</div>`;
  const ticks = L => `<div class="hsTicks">${L.map(([k, n]) => `<label><input type="checkbox" data-like="${k}" ${E.likes.includes(k) ? 'checked' : ''}> ${n}</label>`).join('')}</div>`;
  const wife = E.role === 'vo';
  B.innerHTML = `<div class="hsPrev"><img class="hsFig" alt=""></div><p><button type="button" class="btn alt hsRnd">🎲 Đổi ngẫu nhiên</button></p>`
    + `<h4>Là</h4>${pills('role', HS_ROLES)}`
    + `<h4>Tên <small>(tối đa ${HS_NAME_MAX} chữ)</small></h4><input class="hsIn hsName" maxlength="${HS_NAME_MAX}" autocomplete="off" value="${p4Esc(E.name)}" placeholder="Ví dụ: Mận">`
    + `<h4>Tuổi</h4>${pills('age', HS_AGES)}`
    + `<h4>Dáng người</h4>${pills('body', HS_BODIES)}`
    + `<h4>Ở đâu <small>(tối đa ${HS_ADDR_MAX} chữ)</small></h4><input class="hsIn hsAddrI" maxlength="${HS_ADDR_MAX}" autocomplete="off" value="${p4Esc(E.addr)}" placeholder="Ví dụ: xóm Chùa, làng Đông Hồ">`
    + `<h4>Màu lông</h4>${sw('fur', HS_FURS, hsCol)}`
    + `<h4>Tóc, đội đầu</h4>${pills('top', hsTops(E.role))}`
    + `<h4>Màu áo</h4>${sw('robe', HS_ROBES, hsCol)}`
    + (wife ? `<h4>Màu váy</h4>${sw('skirt', HS_SKIRTS, hsCol)}` : `<h4>Màu quần</h4>${sw('pants', HS_PANTS, hsCol)}`)
    + `<h4>Thích ăn <small>(tick các món)</small></h4><p class="sm">Ở làng</p>${ticks(HS_FOOD_LANG)}<p class="sm">Trên phố huyện</p>${ticks(HS_FOOD_PHO)}`
    + `<h4>Mô tả bản thân</h4><textarea class="hsIn hsDescT" maxlength="${HS_DESC_MAX}" rows="3" placeholder="Tính tình, nghề ngỗng, chuyện nhà…">${p4Esc(E.desc)}</textarea><p class="sm hsCnt"><span>${E.desc.length}</span>/${HS_DESC_MAX}</p>`
    + `<h4>Câu chuyện <small>(hiện trong bong bóng khi bạn đi chợ nhà người khác)</small></h4><div class="hsSts">${E.stories.map((s, i) => `<div class="hsStI"><textarea class="hsIn" data-story="${i}" maxlength="${HS_STORY_MAX}" rows="2" placeholder="Một chuyện muốn kể…">${p4Esc(s)}</textarea><button type="button" class="link" data-del="${i}">Xoá</button></div>`).join('')}</div>`
    + (E.stories.length < HS_STORIES ? `<button type="button" class="btn alt hsAdd">+ Thêm chuyện</button>` : '');
  const prev = () => { const d = hsClean(E); B.querySelector('.hsFig').src = hsFigure(d); };
  B.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => {
    AU.tap(); E[b.dataset.k] = b.dataset.v;
    if (b.dataset.k === 'role') { E.top = hsClean(E).top; hsEditKeep(); return; }   // a wife and a husband have their own headwear and clothes
    B.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach(x => x.classList.toggle('on', x === b)); prev();
  }));
  B.querySelector('.hsRnd').addEventListener('click', () => { AU.tap(); Object.assign(E, hsRandom()); hsEditKeep(); });
  B.querySelectorAll('[data-like]').forEach(c => c.addEventListener('change', () => { const k = c.dataset.like; E.likes = c.checked ? [...new Set([...E.likes, k])] : E.likes.filter(x => x !== k); }));
  B.querySelector('.hsName').addEventListener('input', e => { E.name = e.target.value; prev(); });
  B.querySelector('.hsAddrI').addEventListener('input', e => { E.addr = e.target.value; });
  B.querySelector('.hsDescT').addEventListener('input', e => { E.desc = e.target.value; B.querySelector('.hsCnt span').textContent = e.target.value.length; });
  B.querySelectorAll('[data-story]').forEach(t => t.addEventListener('input', () => { E.stories[+t.dataset.story] = t.value; }));
  B.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => { E.stories.splice(+b.dataset.del, 1); if (!E.stories.length) E.stories.push(''); hsEditKeep(); }));
  const add = B.querySelector('.hsAdd'); if (add) add.addEventListener('click', () => { E.stories.push(''); hsEditKeep(); const t = B.querySelectorAll('[data-story]'); if (t.length) t[t.length - 1].focus(); });
  prev();
}
const hsEditKeep = () => { const c = $('#hsEdit .card4'), y = c.scrollTop; hsEditDraw(); c.scrollTop = y; };
function hsEditSave() {
  const E = HS.edit, d = hsClean(E), old = hsGet('dcc.hoso', {}) || {};
  if (!d.name) { toast('Đặt một cái tên đã.', 2.2); return; }
  if ([d.name, d.addr, d.desc, ...d.stories].some(p4HoaBad)) { toast('Có chữ không đẹp trong tên, nơi ở, mô tả hay chuyện kể. Sửa lại nhé.', 3); return; }
  hsSet('dcc.hoso', { ...d, id: old.id, shop: undefined, stats: undefined }); HS_FACE.clear();
  AU.tap(); toast('Đã lưu hồ sơ.', 2);
  hsPush().catch(e => { if (/bad words/.test(e.message || '')) toast('Máy chủ không nhận vì có chữ không đẹp.', 3); });
  hsEditClose();
}
function hsEditClose() { const b = HS.editBack; HS.editBack = null; HS.edit = null; if (b) b(); else hsShow(null); }

/* ---------- the town's book (owner, 2026-10-17: the town's controls as the village's): the HUD's 📖 opens it with the village book's
   tabs that the town has: Khách quen (the townsfolk you know or have seen, then the far-away guests), Hồ sơ, Tổng sắp ---------- */
function hsOpen(tab) {
  HS.tab = ['quen', 'ho', 'rank'].includes(tab) ? tab : ['quen', 'ho', 'rank'].includes(HS.tab) ? HS.tab : 'quen';
  const B = $('#hsB'), tabs = [['quen', 'Khách quen'], ['ho', 'Hồ sơ'], ['rank', 'Tổng sắp']];
  B.innerHTML = `<h3>Sổ tay</h3><div class="c4tabs">${tabs.map(([k, n]) => `<button class="${HS.tab === k ? 'on' : ''}" data-hs="${k}">${n}</button>`).join('')}</div><div class="hsTab"></div>`;
  B.querySelectorAll('[data-hs]').forEach(b => b.addEventListener('click', () => { AU.tap(); hsOpen(b.dataset.hs); }));
  const T = B.querySelector('.hsTab'), back = () => hsOpen(HS.tab);
  if (HS.tab === 'ho') hsProfileInto(T, back);
  else if (HS.tab === 'rank') { T.innerHTML = '<h4>Bảng tổng sắp nhà giàu</h4><div class="hsRank"></div>'; c4RankInto(T.querySelector('.hsRank')); }
  else {
    const F = id => SAVE4B.folk[id], seen = p4People().filter(p => p4Seen(p.id)), known = seen.filter(p => p4Known(p.id)).sort((a, b) => (F(b.id).a || 0) - (F(a.id).a || 0)), face = seen.filter(p => !p4Known(p.id));
    T.innerHTML = `<p class="cnt">${seen.length} khách</p>`
      + (seen.length ? `<div class="folk">${known.map(p => `<div class="fk"><img src="${p4Face(p)}" alt=""><b>${p.name}</b>${c4Bar(F(p.id).a || 0)}<span>ghé ${F(p.id).v || 0} lần</span></div>`).join('')}${face.map(p => `<div class="fk unk2"><img src="${p4Face(p)}" alt=""><b>${p.name}</b><span>ghé ${F(p.id).v || 1} lần</span></div>`).join('')}</div>` : '<p>Chưa có khách nào trên phố.</p>')
      + hsBookHtml();
    hsBookWire(T, back);
  }
  hsShow('hs');
}

// the three sheets (shared by the village and the town; c4Sheets / p4Sheets list them)
{
  const sheet = (id, html) => { const d = document.createElement('div'); d.id = id; d.className = 'c4sheet p4sheet'; d.hidden = true; d.innerHTML = html; document.body.appendChild(d);
    d.addEventListener('keydown', e => { if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) e.stopPropagation(); });   // typing must not walk the street or close sheets
    return d; };
  sheet('hs', '<div class="card4 hsCard"><div id="hsB"></div><div class="row"><button class="btn alt" id="hsX">Đóng</button></div></div>');
  sheet('hsWho', '<div class="card4 hsCard"><div id="hsWhoB"></div><div class="row"><button class="btn alt" id="hsWhoBack">Đóng</button></div></div>');
  sheet('hsEdit', '<div class="card4 hsCard"><h3>Hồ sơ của tôi</h3><div id="hsEditB"></div><div class="row"><button class="btn go" id="hsEditOk">Lưu hồ sơ</button><button class="btn alt" id="hsEditNo">Thôi</button></div></div>');
  $('#hsX').addEventListener('click', () => hsShow(null));
  $('#hsWhoBack').addEventListener('click', () => { AU.tap(); hsWhoClose(); });
  $('#hsEditOk').addEventListener('click', hsEditSave);
  $('#hsEditNo').addEventListener('click', () => { AU.tap(); hsEditClose(); });
}
