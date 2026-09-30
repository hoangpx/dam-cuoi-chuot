/* Main loop: the shared per-frame tick, then the active chapter updates and draws. */

function tick(dt) {
  S.t += dt;
  S.poseT += dt; if (S.poseT > 1 / 12) { S.poseT = 0; S.pose = S.t; }
  AU.update();
  for (const f of S.fx) f.t += dt;
  S.fx = S.fx.filter(f => f.t < (f.life || 1.4));
  activeChapter().update(dt);
}
function draw() { activeChapter().render(); }
coverChapter().boot();
// a brand-new player skips the menus and starts playing; anyone with saved progress gets the title and chapter picker
if (!CHAPTERS.some(c => c.hasProgress && c.hasProgress())) coverChapter().playFirst();
let last = performance.now();
function step(dt) { tick(dt); draw(); }
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  try { step(dt); }
  catch (err) { if (!frame.failed) { frame.failed = true; const el = $('#err'); el.hidden = false; el.textContent = 'Lỗi khi vẽ màn chơi: ' + err.message; } }
}
requestAnimationFrame(t => { last = t; frame(t); });
