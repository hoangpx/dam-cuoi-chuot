/* Chương XI · pick up a wild hen or duck (owner 2026-10-31: tap a chicken and it is lifted onto the mouse's head, tap again and it is thrown;
   only the wild hens and ducks, not the animals kept in the player's pens). The tapped bird (C11.carry) rides on the player's head and
   follows it; the next tap throws it in an arc to that spot (a tap on the player puts it down). A thrown bird lands on the nearest free
   place, then wanders as before. A bird beats grass, crops and trees under the tap (owner: the hen first, then the tool); for every other animal a held tool still wins (nongtrai.js c11ToolWins). */
const C11_BIRD = { reach: 1.8, throwMax: 6.5, dur: .7 };
const c11Wild = b => b && !b.herd && (b.kind === 'ga' || b.kind === 'trong' || b.kind === 'vit');
const c11BirdAt = (wx, wy) => (C11.beasts || []).find(b => c11Wild(b) && b !== C11.carry && !b.fly && Math.abs(wx - b.x) < .7 && wy > b.y - 1.1 && wy < b.y + .3);
function c11LandSpot(x, y) {
  for (let r = 0; r <= 3; r += .5) for (let a = 0; a < (r ? 8 : 1); a++) { const nx = x + Math.cos(a * .785) * r, ny = y + Math.sin(a * .785) * r; if (c11Free(nx, ny)) return [nx, ny]; }
  return [C11.px, C11.py];
}
const c11TapBase = c11Tap;
c11Tap = function (tx, ty, wx, wy) {
  if (C11.sleep || C11.menu) return c11TapBase(tx, ty, wx, wy);
  const b = C11.carry;
  if (b) {                                                              // already carrying: throw it where the tap is, or set it down at the feet
    if (Math.hypot(wx - C11.px, wy - C11.py) < .8) { const [x, y] = c11LandSpot(C11.px + C11.face * .6, C11.py); b.x = x; b.y = y; b.wait = 1; b.to = null; C11.carry = null; c11Pop(Math.floor(x), Math.floor(y) - 1, b.kind === 'vit' ? 'Cạp cạp' : 'Cục ta cục tác', '#5b2f1f'); return; }
    let dx = wx - C11.px, dy = wy - C11.py; const L = Math.hypot(dx, dy); if (L > C11_BIRD.throwMax) { dx *= C11_BIRD.throwMax / L; dy *= C11_BIRD.throwMax / L; }
    const [x1, y1] = c11LandSpot(C11.px + dx, C11.py + dy);
    b.fly = { x0: C11.px, y0: C11.py, x1, y1, t: 0 }; b.face = x1 >= C11.px ? 1 : -1; C11.carry = null; C11.face = b.face; C11.swing = C11.swing || 0;
    c11Pop(Math.floor(C11.px), Math.floor(C11.py) - 2, b.kind === 'vit' ? 'Quạc!' : 'Cục tác!', '#5b2f1f'); return;
  }
  const g = c11BirdAt(wx, wy);
  if (g && !['item', 'seed'].includes(c11HandTool()) && Math.hypot(g.x - C11.px, g.y - C11.py) < C11_BIRD.reach) {
    C11.carry = g; g.to = null; g.fly = null; c11Pop(Math.floor(g.x), Math.floor(g.y) - 1, g.kind === 'vit' ? 'Cạp cạp!' : 'Cục ta cục tác!', '#5b2f1f'); return;
  }
  return c11TapBase(tx, ty, wx, wy);
};
const c11CarryUpdate0 = c11NewUpdate;
c11NewUpdate = function (dt) {
  const G = C11, b = G.carry;
  if (b && !(G.beasts || []).includes(b)) G.carry = null;
  else if (b) { b.x = G.px; b.y = G.py + .03; b.moving = true; b.ph += dt * 12; b.face = G.face; }
  for (const q of G.beasts || []) if (q.fly) { const f = q.fly; f.t += dt / C11_BIRD.dur; q.moving = true; q.ph += dt * 22;
    if (f.t >= 1) { q.x = f.x1; q.y = f.y1; q.fly = null; q.wait = 1.2; q.to = null; q.moving = false; } else { q.x = f.x0 + (f.x1 - f.x0) * f.t; q.y = f.y0 + (f.y1 - f.y0) * f.t; } }
  return c11CarryUpdate0(dt);
};
const c11BeastCarry0 = c11Beast;
c11Beast = function (g, b, X, Y, u) {
  if (b === C11.carry) Y -= u * 64 * .92;                               // on top of the head
  else if (b.fly) Y -= Math.sin(Math.PI * b.fly.t) * u * 64 * 1.8;      // the arc of the throw
  return c11BeastCarry0(g, b, X, Y, u);
};
const c11EnterCarry0 = c11Enter;
c11Enter = function () { C11.carry = null; return c11EnterCarry0.apply(this, arguments); };
