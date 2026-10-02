/* Play tracking (owner): GoatCounter events, nothing about the player. vao/<where> when a level opens, xong/<where> when
   it is won, thoigian/<where>/<bucket> when the player leaves it (another level, the album, the chapter list, or the
   page hidden), mo/chuong-N when a chapter is picked from the list. GoatCounter only counts on the real site: it skips
   localhost, and the artifact has no GoatCounter at all, so every call here is then a no-op. */
const TRACK = { where: null, t0: 0, paused: null };
function trackSend(path) { try { const gc = window.goatcounter; if (gc && gc.count) gc.count({ path, title: path, event: true }); } catch (e) {} }
function trackLeave() {
  if (!TRACK.where) return;
  const s = (performance.now() - TRACK.t0) / 1000;
  const b = s < 60 ? 'duoi-1-phut' : s < 180 ? '1-3-phut' : s < 300 ? '3-5-phut' : s < 600 ? '5-10-phut' : 'tren-10-phut';
  trackSend(`thoigian/${TRACK.where}/${b}`); TRACK.where = null;
}
function trackEnter(where) { trackLeave(); TRACK.where = where; TRACK.t0 = performance.now(); trackSend('vao/' + where); }
function trackWin(where) { trackSend('xong/' + (where || TRACK.where)); }
// leaving the page (or the phone locking) ends the stay; coming back starts the clock again without a new vao/
addEventListener('visibilitychange', () => {
  if (document.hidden) { const w = TRACK.where; trackLeave(); TRACK.paused = w; }
  else if (TRACK.paused) { TRACK.where = TRACK.paused; TRACK.paused = null; TRACK.t0 = performance.now(); }
});
