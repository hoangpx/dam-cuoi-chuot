/* Bamboo redrawn in the style of the owner's picture (thin dark green outline, bright culms with a lit side and dark node rings, fans
   of narrow pointed leaves with a pale midrib at the end of each twig). Same three sprites (culm heights 330 / 410 / 270, owner: taller; foot at the
   origin) that c11Trees3 hands to the renderer as A.bamboo, so drawing, swaying about the foot, fading and felling are unchanged. */
const C11_TRE = (() => {
  const R = 2, OUT = '#1f6a22';
  const mk = (b, draw) => { const [x0, y0, x1, y1] = b, c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * R); c.height = Math.ceil((y1 - y0) * R); const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R); g.lineCap = g.lineJoin = 'round'; draw(g); return { c, x0, y0, w: x1 - x0, h: y1 - y0 }; };
  /* one leaf: a long narrow blade with a fine point, from (x, y) toward angle a; lit = 0..1 */
  const leaf = (g, x, y, a, len, wid, lit) => {
    const ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, P = t => [x + ca * len * t, y + sa * len * t + len * .12 * t * t];
    const W = t => wid * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * .35), pts = 16, up = [], dn = [];
    for (let i = 0; i <= pts; i++) { const t = i / pts, [px, py] = P(t), w = W(t); up.push([px + nx * w, py + ny * w]); dn.push([px - nx * w, py - ny * w]); }
    const [ex, ey] = P(1);
    const path = () => { g.beginPath(); up.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.lineTo(ex, ey); for (let i = dn.length - 1; i >= 0; i--) g.lineTo(dn[i][0], dn[i][1]); g.closePath(); };
    path(); const gr = g.createLinearGradient(x, y, ex, ey); gr.addColorStop(0, `hsl(102,55%,${30 + lit * 10}%)`); gr.addColorStop(1, `hsl(90,62%,${44 + lit * 14}%)`); g.fillStyle = gr; g.fill();
    g.save(); g.clip(); g.fillStyle = `hsla(84,70%,${66 + lit * 10}%,.55)`; g.beginPath(); up.forEach((p, i) => { const q = [P(i / pts)[0] * .5 + p[0] * .5, P(i / pts)[1] * .5 + p[1] * .5]; i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); for (let i = pts; i >= 0; i--) { const q = P(i / pts); g.lineTo(q[0], q[1]); } g.closePath(); g.fill(); g.restore();
    path(); g.strokeStyle = OUT; g.lineWidth = 1.1; g.stroke();
    g.strokeStyle = 'hsla(76,70%,70%,.8)'; g.lineWidth = .7; g.beginPath(); g.moveTo(x, y); for (let i = 1; i <= pts * .85; i++) { const q = P(i / pts); g.lineTo(q[0], q[1]); } g.stroke();
  };
  /* a fan of leaves hanging from the end of a twig, opening around dir (side = -1 left, 1 right) */
  const fan = (g, x, y, side, n, len, lit, rnd) => {
    for (let i = 0; i < n; i++) { const a = (side > 0 ? -.35 : Math.PI + .35) + side * (i - (n - 1) / 2) * .32 + (rnd() - .5) * .2; leaf(g, x, y, a + side * .45, len * (.82 + rnd() * .3), len * .13, lit); }
  };
  const culm = (g, h, seed) => {
    let sd = seed; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const lean = (rnd() - .5) * 14, X = t => lean * t * t, w0 = 6.4, w1 = 4, wd = t => w0 + (w1 - w0) * t;
    /* twigs and leaves behind the culm first (the far side), then the culm, then the near side */
    const nodes = []; for (let y = 0, i = 0; y < h; i++) { y += 22 + i * 1.6 + rnd() * 4; if (y < h) nodes.push(y); }
    const twigs = nodes.filter(y => y > h * .3).flatMap((y, i) => [{ y, side: i % 2 ? 1 : -1, back: rnd() < .45 }].concat(y > h * .6 ? [{ y: y + 6, side: i % 2 ? -1 : 1, back: rnd() < .5 }] : []));
    const drawTwig = tw => {
      const t = tw.y / h, x = X(t), len = 16 + rnd() * 12, ex = x + tw.side * len, ey = -tw.y - 10 - rnd() * 8;
      g.strokeStyle = OUT; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, -tw.y); g.quadraticCurveTo(x + tw.side * len * .5, -tw.y - 2, ex, ey); g.stroke();
      g.strokeStyle = '#8cc24a'; g.lineWidth = 1.2; g.stroke();
      fan(g, ex, ey, tw.side, 5 + Math.floor(rnd() * 3), 30 + rnd() * 10, tw.back ? .1 : .3 + t * .6, rnd);
    };
    twigs.filter(t => t.back).forEach(drawTwig);
    /* the culm: a slightly bent tube, lit on the left, with a ring at every node */
    const n = 40, L = [], Rr = [];
    for (let i = 0; i <= n; i++) { const t = i / n, x = X(t), y = -h * t; L.push([x - wd(t), y]); Rr.push([x + wd(t), y]); }
    g.beginPath(); L.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = n; i >= 0; i--) g.lineTo(Rr[i][0], Rr[i][1]); g.closePath();
    const gr = g.createLinearGradient(-w0, 0, w0, 0); gr.addColorStop(0, '#b6dc62'); gr.addColorStop(.45, '#84c240'); gr.addColorStop(1, '#4f9a30'); g.fillStyle = gr; g.fill();
    g.strokeStyle = OUT; g.lineWidth = 1.5; g.stroke();
    g.strokeStyle = 'rgba(230,250,170,.7)'; g.lineWidth = 1.4; g.beginPath(); for (let i = 0; i <= n; i++) { const t = i / n, x = X(t) - wd(t) * .45, y = -h * t; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (const y of nodes) {
      const t = y / h, x = X(t), w = wd(t);
      g.fillStyle = 'rgba(60,110,30,.55)'; g.beginPath(); g.ellipse(x, -y + 1.6, w + .3, 1.6, 0, 0, 7); g.fill();
      g.strokeStyle = OUT; g.lineWidth = 1.3; g.beginPath(); g.moveTo(x - w - .6, -y); g.lineTo(x + w + .6, -y); g.stroke();
      g.strokeStyle = 'rgba(220,245,160,.75)'; g.lineWidth = .9; g.beginPath(); g.moveTo(x - w + .8, -y - 1.4); g.lineTo(x + w - .8, -y - 1.4); g.stroke();
    }
    /* a tuft at the top and the near twigs */
    const tx = X(1); fan(g, tx, -h, -1, 4, 32, .9, rnd); fan(g, tx, -h, 1, 4, 32, .9, rnd);
    leaf(g, tx, -h, -Math.PI / 2 - .1, 28, 3.8, 1);
    twigs.filter(t => !t.back).forEach(drawTwig);
    /* a sheath and a few blades of grass at the foot */
    g.fillStyle = '#d8b45c'; g.beginPath(); g.moveTo(-w0 - 1, 1); g.quadraticCurveTo(-w0, -10, 0, -16); g.quadraticCurveTo(w0 * .6, -8, w0 + 1, 1); g.closePath(); g.fill(); g.strokeStyle = '#7a5a1e'; g.lineWidth = 1; g.stroke();
  };
  /* each of the three sprites is a little clump: a tall culm with one or two shorter ones beside it, so a bamboo tile shows 7-8 culms */
  const clump = (h, seed) => mk([-92, -h - 56, 92, 8], g => {
    /* tall and short stems side by side (owner: "có cây cao cây thấp"): the side ones are a half to four fifths of the middle one */
    let sd = seed; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const subs = [[-16, .45 + rnd() * .3, 3], [17, .55 + rnd() * .3, 5], [-4, .3 + rnd() * .2, 9], [0, 1, 7]].slice(seed % 2 ? 0 : 1);
    for (const [dx, f, s] of subs) { g.save(); g.translate(dx, s * .3); culm(g, h * f, seed * 31 + s); g.restore(); }
  });
  let built = null;
  const build = () => built || (built = [330, 410, 270].map((h, i) => clump(h, 4111 + i * 977)));
  return { build };
})();
(() => {
  const old = c11Trees3;
  c11Trees3 = function () { const T = old(); if (!T.bamboo.tre) { const B = C11_TRE.build(); T.bamboo.length = 0; T.bamboo.push(...B); T.bamboo.tre = true; } return T; };
  c11Trees3();
})();
