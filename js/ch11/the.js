/* Chương XI · Làng Vũ Đại is loaded only when its card is tapped (owner 2026-10-27: "mọi thứ chỉ load khi click vào chương Làng Vũ
   Đại chứ không load trước"). This small file is all that runs at start-up: it puts the chapter's card in the picker (reading the
   day from the save itself) and, on the first tap, adds C11_FILES as scripts in order; the last of them registers the real chapter,
   which takes this one's place (registerChapter replaces a chapter with the same id), and then starts it. */
const C11_FILES = ['js/ch11/items.js', 'js/ch11/nongtrai.js', 'js/ch11/langxa.js', 'js/ch11/viec.js', 'js/ch11/viecngay.js', 'js/ch11/dinhba.js', 'js/ch11/nghe.js', 'js/ch11/online.js', 'js/ch11/nhac.js', 'js/ch11/bong.js', 'js/ch11/rao.js', 'js/ch11/co.js', 'js/ch11/cay.js', 'js/ch11/nen.js'];
/* Open as a trial since 2026-10-28 (a notice says so at the start). Set C11_DEV false to hide the card again. */
const C11_DEV = true;
let c11Loading = null;
function c11LoadFiles() {
  if (c11Loading) return c11Loading;
  return (c11Loading = new Promise((ok, bad) => {
    let left = C11_FILES.length;
    for (const f of C11_FILES) {
      const s = document.createElement('script'); s.src = f + '?v=' + VERSION; s.async = false;       // async = false: they run in list order
      s.onload = () => { if (--left === 0) ok(); }; s.onerror = () => { c11Loading = null; bad(new Error(f)); };
      document.body.appendChild(s);
    }
  }));
}
function c11Open() {
  toast(lg('Đang tải Làng Vũ Đại…', 'Loading Vu Dai Village…'), 30);
  c11LoadFiles().then(() => { toast(lg('Vào làng thôi!', 'Here we go!'), .8); const ch = chapterById(11); if (ch && ch.direct !== c11Open) ch.direct(); })
    .catch(() => toast(lg('Không tải được Làng Vũ Đại, thử lại nhé', 'Could not load Vu Dai Village, please try again'), 3));
}
/* How many are in the village now, shown on the card (owner: like Hội Làng). The Worker's /count answers {count}; asked at start-up and every 20 s. */
let c11OnlineN = null;
const c11OnlineText = () => c11OnlineN == null ? '' : '● ' + lgf('{n} người online', '{n} online', { n: c11OnlineN });
function c11OnlinePoll() {
  fetch('https://dcc-lang.dcc-phong-choi.workers.dev/count', { cache: 'no-store' }).then(r => r.json()).then(j => {
    if (typeof j.count !== 'number') return;
    c11OnlineN = j.count; const ch = chapterById(11), st = document.querySelector('#chapCards .card[data-ch="11"] .st'); if (st && ch) st.textContent = ch.progress();
  }).catch(() => {});
}
c11OnlinePoll(); setInterval(() => { if (!document.hidden) c11OnlinePoll(); }, 20000);
const c11SavedDay = () => { try { const s = JSON.parse(localStorage.getItem('dcc.c11') || 'null'); return s && (s.day > 1 || Object.keys(s.tiles || {}).length) ? s.day : 0; } catch (e) { return 0; } };
registerChapter({
  id: 11, modes: [], direct: c11Open, hidden: () => !C11_DEV,
  card: { num: lg('Chương XI', 'Chapter XI'), han: '田', name: lg('Làng Vũ Đại', 'Vu Dai Village'), desc: lg('Về làng Vũ Đại làm ruộng: cuốc đất, gieo hạt, chặt cây, hái lượm, nuôi gà lợn, ra chợ bán hàng, làm quen dân làng và nghe chuyện từng người. (Bản thử)', 'Farm in Vu Dai village: hoe, sow, chop, forage, keep animals, sell at the market, and get to know the villagers and their stories. (Demo)'), bg: '#d3e0b4' },
  progress: () => { const d = c11SavedDay(), o = c11OnlineText(); return (d ? lgf('Ngày {d}', 'Day {d}', { d }) : lg('Bản thử', 'Demo')) + (o ? ' · ' + o : ''); },
  hasProgress: () => false,
  hide() {}, update() {}, render() {}, key() {}, pointer: { down() {}, move() {}, up() {} }, next: c11Open, retry: c11Open,
});
