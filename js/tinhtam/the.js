/* Góc Tĩnh Tâm (owner 2026-10-29: "không gọi là chương, chỉ gọi là nơi tu tập, một góc tĩnh tâm"): a quiet place where players sit
   together in front of a great Buddha. Like Làng Vũ Đại it loads only when its card is tapped: this small file is all that runs at
   start-up. It puts the card in the picker (id 12 — 10 and 11 are taken on main —, no chapter number: the card says "Nơi tu tập"), polls how many are sitting now
   and, on the first tap, adds TT_FILES as scripts in order; the last of them registers the real place in this one's stead. */
const TT_FILES = ['js/tinhtam/art.js', 'js/tinhtam/suoi.js', 'js/tinhtam/nhang.js', 'js/tinhtam/tinhtam.js'];
const TT_BASE = 'https://dcc-lang.dcc-phong-choi.workers.dev';                // the same Worker as the village; /tt/ws and /tt/count are its own room
const TT_CARD = { num: lg('Nơi tu tập', 'A place to practise'), han: '禪', name: lg('Góc Tĩnh Tâm', 'A Quiet Corner'), desc: lg('Giữa cuộc sống vội vã bộn bề, hãy dành một chút thời gian để tĩnh tâm.', 'Amid the rush and bustle of life, take a little time to find stillness.'), bg: '#cfdccb' };
let ttLoading = null;
function ttLoadFiles() {
  if (ttLoading) return ttLoading;
  return (ttLoading = new Promise((ok, bad) => {
    let left = TT_FILES.length;
    for (const f of TT_FILES) {
      const s = document.createElement('script'); s.src = f + '?v=' + VERSION; s.async = false;
      s.onload = () => { if (--left === 0) ok(); }; s.onerror = () => { ttLoading = null; bad(new Error(f)); };
      document.body.appendChild(s);
    }
  }));
}
function ttOpen() {
  toast(lg('Đang vào góc tĩnh tâm…', 'Entering the quiet corner…'), 30);
  ttLoadFiles().then(() => { toast(lg('Hít thở sâu…', 'Breathe in…'), .8); const ch = chapterById(12); if (ch && ch.direct !== ttOpen) ch.direct(); })
    .catch(() => toast(lg('Không tải được, thử lại nhé', 'Could not load, please try again'), 3));
}
let ttOnlineN = null;
const ttOnlineText = () => ttOnlineN == null ? '' : ttOnlineN > 0 ? '● ' + lgf('{n} người đang tĩnh tâm', '{n} sitting quietly', { n: ttOnlineN }) : lg('Đang vắng, vào ngồi trước nhé', 'Quiet now, come and sit');
function ttPoll() {
  fetch(TT_BASE + '/tt/count', { cache: 'no-store' }).then(r => r.json()).then(j => {
    if (typeof j.count !== 'number') return;
    ttOnlineN = j.count; const ch = chapterById(12), st = document.querySelector('#chapCards .card[data-ch="12"] .st'); if (st && ch) st.textContent = ch.progress();
  }).catch(() => {});
}
ttPoll(); setInterval(() => { if (!document.hidden) ttPoll(); }, 20000);
registerChapter({
  id: 12, modes: [], direct: ttOpen, card: TT_CARD,
  progress: () => ttOnlineText() || lg('Yên tĩnh', 'Peaceful'),
  hasProgress: () => false,
  hide() {}, update() {}, render() {}, key() {}, pointer: { down() {}, move() {}, up() {} }, next: ttOpen, retry: ttOpen,
});
// Straight in (owner, for testing): the claude.ai copy sets window.TT_AUTOOPEN, and ?tt in the address does the same on any host; once
// the game has finished loading (main.js defines tick), Góc Tĩnh Tâm opens with no tap through the chapter list.
if (window.TT_AUTOOPEN || /[?&]tt\b/.test(location.search)) { const go = setInterval(() => { if (typeof tick === 'function' && typeof showChapters === 'function') { clearInterval(go); ttOpen(); } }, 200); }
