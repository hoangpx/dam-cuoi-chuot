/* Building blocks shared by several tranh: decor, hiding covers, watchers, pickups, secret seals. */
/* ---------- entities ---------- */
function decor(p, x, y, s = 1, f = 1, layer = 'bg') { return { layer, draw(g) { dp(g, p, x, y, 0, s * f, s); } }; }
function cover(x, kind, w) { return { layer: 'fg', cover: [x - w, x + w], draw(g) { dp(g, kind === 'hay' ? PROPS.hay : PROPS.chum, x, GROUND + 4); } }; }
function inCover(x) { return S.ents.some(e => e.cover && x > e.cover[0] && x < e.cover[1]); }
function tickWatcher(e, dt) {
  e.t -= dt;
  if (e.t > 0) return;
  if (e.st === 'sleep') { e.st = 'warn'; e.feint = R() < .35; e.t = e.feint ? .45 + R() * 1.1 : .6 + R() * 1.4; e.onWarn && e.onWarn(); }
  else if (e.st === 'warn' && e.feint) { e.st = 'sleep'; e.t = 1.1 + R() * 1.8; }
  else if (e.st === 'warn') { e.st = 'watch'; e.w0 = S.t; e.t = e.mode === 'above' ? 1.4 + R() * 1.0 : 1.8 + R() * 1.2; AU.tension(); }
  else { e.st = 'sleep'; e.t = 2.2 + R() * 2.2; }
}
function pickup(x, item, msg, art) {
  return {
    layer: 'mid', taken: false,
    update() { if (!this.taken && Math.abs(groom.x - x) < 26) { this.taken = true; S.inv.push(item); AU.pluck(); toast(msg); } },
    draw(g) {
      if (this.taken) return;
      if (art) art(g); else { dp(g, PROPS.leaf, x, GROUND - 4); dp(g, ITEM.fish, x, GROUND - 14 + Math.sin(S.pose * 3) * 1.5, 0, .9, .9); }
    },
  };
}
function secretSpot(x, ab, note) {
  const fx = x + 60;
  const trig = function () { if (this.st !== 'hidden') return false; this.st = 'fall'; this.t = 0; toast(note, 3.6); return true; };
  const e = {
    layer: 'top', st: SAVE.secret[S.lv] ? 'taken' : 'hidden', t: 0, ax: x, range: 280,
    update(dt) {
      this.t += dt;
      if (this.st === 'fall' && this.t > .7) { this.st = 'ground'; AU.thump(); }
      if (this.st === 'ground' && Math.abs(groom.x - fx) < 30) { this.st = 'taken'; SAVE.secret[S.lv] = true; S.gotSecret = true; persist(); AU.pluck(88); setTimeout(() => AU.pluck(93), 120); toast('Nhặt được một mảnh triện Đông Hồ!', 3.4); }
    },
    draw(g) {
      if (this.st === 'hidden') sparkle(g, x, GROUND - 190, 9, .35 + .35 * Math.sin(S.t * 2.4));
      else if (this.st === 'fall' || this.st === 'ground') {
        const k = this.st === 'fall' ? Math.min(1, this.t / .7) : 1, y = GROUND - 190 + (GROUND - 22 - (GROUND - 190)) * k * k;
        dp(g, MP.seal, x + 60 * k, y, k * 5, 1, 1);
        if (this.st === 'ground') sparkle(g, fx, GROUND - 54, 8, .5 + .5 * Math.sin(S.t * 5));
      }
    },
  };
  if (ab === 'drum') e.onDrum = trig; else e.onKen = trig;
  return e;
}
