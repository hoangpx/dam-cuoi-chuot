/* Canvas, device constants and the view scale shared by every chapter.
   All game files are plain scripts that share one global scope; index.html loads them in order. */
const $ = s => document.querySelector(s);
const cv = $('#cv'), ctx = cv.getContext('2d');
const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch');
const DPR = Math.min(devicePixelRatio || 1, isTouch ? 1.5 : 2);
const RES = isTouch ? 1.25 : 2;                        // part pre-render resolution
const VIEW_H = 430, GROUND = 352;
const INK = '#1d1915';
// where the iPhone's notch / status bar ends (CSS safe area): canvas-drawn top bars (chương VI, VII) start below it (owner: the
// top buttons beside the notch could not be tapped)
const safeTop = (() => { const p = document.createElement('div'); p.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none'; document.body.appendChild(p); return () => p.offsetHeight; })();


let scale = 1, viewH = VIEW_H, offY = 0, ZOOM = 1, ZOOMW = 1;            // a tranh may come closer on a portrait phone (ZOOM) or stand back on a wide screen to show its tall things (ZOOMW; tranh 4)
function resize() {
  const w = innerWidth, h = innerHeight;
  cv.width = Math.max(1, Math.round(w * DPR)); cv.height = Math.max(1, Math.round(h * DPR));
  // portrait phones: show at least 760 world px across so the whole wedding party (~330 px) fits with room ahead
  const z = w < h ? ZOOM : ZOOMW;
  scale = Math.max(.05, Math.min(h / VIEW_H, w / (w < h ? 640 : 560)) * z);
  viewH = h / scale; offY = (viewH - VIEW_H) * (z < 1 ? .85 : .5);            // standing back: the extra height goes to the sky, the ground stays low
}
addEventListener('resize', resize); resize();
function setZoom(z, zw = 1) { if (z !== ZOOM || zw !== ZOOMW) { ZOOM = z; ZOOMW = zw; resize(); } }

let toastTimer;
// a toast may carry chương IV's coin icon (our own markup)
function toast(s, d = 2.8) { toast.n = (toast.n || 0) + 1; if (/<(i|br|b)[ >]/.test(String(s))) $('#toastTx').innerHTML = s; else $('#toastTx').textContent = s; $('#toast').classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('on'), d * 1000); }
function capturePointer(e, el = cv) { try { el.setPointerCapture(e.pointerId); } catch (err) {} }
