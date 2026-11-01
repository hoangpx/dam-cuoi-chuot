/* A joystick for walking on phones (players asked for movement buttons, 2026-11-01): a round pad bottom left, above the bar; drag the
   knob any way and the mouse walks that way (C11.joy, read beside the arrow keys in updateC11), let go and it stops. Only on touch
   screens, only while walking about (no menu open); taps elsewhere still walk to a spot as before. DOM, so it never steals a tap
   meant for the field. */
(() => {
  const R = 58, KN = 24;
  const pad = document.createElement('div'), knob = document.createElement('div');
  pad.style.cssText = `position:fixed;left:calc(14px + env(safe-area-inset-left,0px));bottom:calc(132px + env(safe-area-inset-bottom,0px));width:${R * 2}px;height:${R * 2}px;border-radius:50%;z-index:29;display:none;touch-action:none;user-select:none;-webkit-user-select:none;background:radial-gradient(circle at 40% 35%,rgba(251,244,220,.62),rgba(232,218,180,.5));border:2.6px solid rgba(29,25,21,.75);box-shadow:0 3px 0 rgba(29,25,21,.25)`;
  knob.style.cssText = `position:absolute;left:${R - KN}px;top:${R - KN}px;width:${KN * 2}px;height:${KN * 2}px;border-radius:50%;background:radial-gradient(circle at 38% 32%,#fbf0c8,#e7c86a);border:2.6px solid #1d1915;box-shadow:0 2px 0 rgba(29,25,21,.35);pointer-events:none`;
  /* four little arrows round the edge so it reads as a way to walk */
  for (const [a, x, y] of [['▲', R, 11], ['▼', R, R * 2 - 11], ['◀', 11, R], ['▶', R * 2 - 11, R]]) { const s = document.createElement('span'); s.textContent = a; s.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:translate(-50%,-50%);font:12px sans-serif;color:rgba(29,25,21,.55);pointer-events:none`; pad.appendChild(s); }
  pad.appendChild(knob); document.body.appendChild(pad);
  let id = null;
  const set = e => {
    const r = pad.getBoundingClientRect(), dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R), d = Math.hypot(dx, dy), m = Math.min(d, R - KN * .4), ux = d ? dx / d : 0, uy = d ? dy / d : 0;
    knob.style.transform = `translate(${ux * m}px,${uy * m}px)`;
    C11.joy = d > 10 ? { x: ux, y: uy } : null;                        // a small dead zone in the middle
  };
  const end = e => { if (e.pointerId !== id) return; id = null; C11.joy = null; knob.style.transform = ''; };
  pad.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (id !== null) return; id = e.pointerId; try { pad.setPointerCapture(id); } catch (_) {} C11.go = null; set(e); });
  pad.addEventListener('pointermove', e => { if (e.pointerId === id) { e.preventDefault(); set(e); } });
  pad.addEventListener('pointerup', end); pad.addEventListener('pointercancel', end); pad.addEventListener('lostpointercapture', end);
  for (const ev of ['touchstart', 'touchmove', 'mousedown', 'click']) pad.addEventListener(ev, e => e.stopPropagation(), { passive: true });
  const touch = matchMedia('(pointer: coarse)');
  setInterval(() => {
    const vis = touch.matches && typeof S !== 'undefined' && S.mode === 'c11play' && typeof C11 !== 'undefined' && !C11.menu && !C11.fade && !C11.sleep;
    if (pad.style.display !== (vis ? 'block' : 'none')) pad.style.display = vis ? 'block' : 'none';
    if (!vis && id !== null) { id = null; C11.joy = null; knob.style.transform = ''; }
  }, 150);
})();
