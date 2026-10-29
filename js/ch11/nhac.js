/* Chương XI · background music (owner 2026-10-28: "cho cái này làm nhạc nền", audio/freeform.mp3, 6.7 MB). The game's own synth songs stay hushed
   here (startC11 / c11NewUpdate call AU.setQuiet(true)); this one track is a plain looping <audio>, started when a frame of the village runs
   (the tap on the card has already unlocked sound), paused when the chapter is left or the page is hidden, and silent while the global
   sound switch is off (AU.isMuted). It is fetched only when chương XI is opened (this file is in C11_FILES). */
const C11_MUSIC = { el: null, vol: .5 };
function c11MusicEl() {
  if (C11_MUSIC.el) return C11_MUSIC.el;
  const a = new Audio('audio/freeform.mp3?v=' + VERSION); a.loop = true; a.preload = 'auto'; a.volume = C11_MUSIC.vol;
  return (C11_MUSIC.el = a);
}
function c11MusicTick() {
  const a = c11MusicEl(); a.muted = AU.isMuted();
  if (document.hidden) { if (!a.paused) a.pause(); return; }
  if (a.paused) a.play().catch(() => {});             // refused until the first tap: tried again on the next frame
}
function c11MusicStop() { const a = C11_MUSIC.el; if (a && !a.paused) a.pause(); }
const c11MNewUpdate0 = c11NewUpdate;
c11NewUpdate = function (dt) { c11MusicTick(); return c11MNewUpdate0(dt); };
const c11MHide0 = chapterById(11).hide;
chapterById(11).hide = function () { c11MusicStop(); return c11MHide0.apply(this, arguments); };
