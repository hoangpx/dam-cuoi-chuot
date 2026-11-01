/* Banana tree drawn in code after the owner's picture (thin green outline, bright leaves with a pale midrib and torn edges, yellow
   bunch, pink flower, trunk in tan sheaths). Every leaf is its own sprite turned about the spot where the stalks meet, so each
   one swings on its own beat; the trunk stays still. Plugs into c11Trees3 (the banana entry) and c11Sway (crowns with .mesh). */
const C11_BANANA = (() => {
  const R = 2, OUT = '#1f6a22', B = { x: 0, y: -112 }, DY = B.y + 84;   // the crown sits on a trunk 112 tall (owner: taller); bunch numbers were drawn for 84
  const mk = (b, draw) => { const [x0, y0, x1, y1] = b, c = document.createElement('canvas'); c.width = Math.ceil((x1 - x0) * R); c.height = Math.ceil((y1 - y0) * R); const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, -x0 * R, -y0 * R); g.lineCap = g.lineJoin = 'round'; draw(g); return { c, x0, y0, w: x1 - x0, h: y1 - y0 }; };
  const q = (a, b, c, t) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * b + t * t * c;
  /* one leaf: deg = direction of the stalk (0 = right, -90 = up), len, droop of the tip, tone (-1 back/dark .. 1 front/bright) */
  /* A broad paddle on an arched midrib (rises, then bends down). Each half is torn by a few slits running in from the edge toward the
     midrib, slanted back toward the stalk, so the edge breaks into strips with square ends pointing to the tip. The half facing up is
     sunlit, the other one shaded; a dark green outline goes round the blade and into every slit. */
  const leaf = ([deg, len, droop, tone], li) => {
    const a = deg * Math.PI / 180, dx0 = Math.cos(a), dy0 = Math.sin(a), up = len * .2, Wm = len * .25, n = 90;
    const C = [[B.x, B.y], [B.x + dx0 * len * .35, B.y + dy0 * len * .35 - up], [B.x + dx0 * len * .75, B.y + dy0 * len * .75 - up * .55], [B.x + dx0 * len, B.y + dy0 * len + droop]];
    const cub = t => { const u = 1 - t; return [0, 1].map(k => u * u * u * C[0][k] + 3 * u * u * t * C[1][k] + 3 * u * t * t * C[2][k] + t * t * t * C[3][k]); };
    const width = t => t < .12 ? Wm * (.08 + .92 * Math.pow(t / .12, 1.6) * .55) : t < .3 ? Wm * (.59 + .41 * (t - .12) / .18) : t < .7 ? Wm : Wm * Math.sqrt(Math.max(0, 1 - Math.pow((t - .7) / .3, 2)));
    let sd = (li + 1) * 9301; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    /* slits on each side: [t at the edge, depth as a share of the width] */
    const slits = [0, 1].map(() => { const out = []; let t = .3 + rnd() * .08; while (t < .9) { out.push([t, .4 + rnd() * .38]); t += .1 + rnd() * .1; } return out; });
    const P = [], N = [];
    for (let i = 0; i <= n; i++) { const t = i / n, p = cub(t), q2 = cub(Math.min(1, t + .002)), q1 = cub(Math.max(0, t - .002)), ddx = q2[0] - q1[0], ddy = q2[1] - q1[1], d = Math.hypot(ddx, ddy) || 1; P.push(p); N.push([-ddy / d, ddx / d]); }
    const at = t => { const i = Math.min(n, Math.max(0, Math.round(t * n))); return [P[i], N[i]]; };
    /* the edge of one half, with its slits cut in (s = +1 / -1 picks the side) */
    const edge = s => {
      const out = [], cuts = slits[s > 0 ? 0 : 1], gap = .013;
      for (let i = 0; i <= n; i++) {
        const t = i / n, [p, nn] = at(t), w = width(t);
        const c = cuts.find(([ct]) => Math.abs(t - ct) < 1 / n * .5);
        if (c && w > 3) {
          const [ct, dep] = c, [pa, na] = at(ct - gap), [pi, ni] = at(ct - .045), [pb, nb] = at(ct + gap), wi = width(ct - .045) * (1 - dep);
          out.push([pa[0] + na[0] * width(ct - gap) * s, pa[1] + na[1] * width(ct - gap) * s]);
          out.push([pi[0] + ni[0] * wi * s, pi[1] + ni[1] * wi * s]);
          out.push([pb[0] + nb[0] * width(ct + gap) * s * .97, pb[1] + nb[1] * width(ct + gap) * s * .97]);
        } else out.push([p[0] + nn[0] * w * s, p[1] + nn[1] * w * s]);
      }
      return { out, cuts };
    };
    const EU = edge(1), EL = edge(-1), all = [...EU.out, ...EL.out], xs = all.map(p => p[0]), ys = all.map(p => p[1]);
    /* which half faces up: the one whose normal points up (negative y) along the middle of the leaf */
    const litU = N[Math.round(n * .5)][1] < 0;
    return mk([Math.min(...xs) - 4, Math.min(...ys) - 4, Math.max(...xs) + 4, Math.max(...ys) + 4], g => {
      const hue = 96 - tone * 5, sat = 60 + tone * 6, lt = l => `hsl(${hue},${sat}%,${l + tone * 5}%)`, end = C[3];
      const half = (E, lit) => {
        g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = E.out.length - 1; i >= 0; i--) g.lineTo(E.out[i][0], E.out[i][1]); g.closePath();
        const gr = g.createLinearGradient(B.x, B.y, end[0], end[1]); gr.addColorStop(0, lt(lit ? 40 : 28)); gr.addColorStop(.5, lt(lit ? 50 : 34)); gr.addColorStop(1, lt(lit ? 56 : 38)); g.fillStyle = gr; g.fill();
        /* a pale sheen in the sunlit half, a soft shadow along the midrib in the shaded half */
        g.save(); g.clip();
        if (lit) { g.strokeStyle = lt(64); g.globalAlpha = .55; g.lineWidth = Wm * .55; g.beginPath(); for (let i = Math.round(n * .15); i <= Math.round(n * .85); i++) { const [p, nn] = [P[i], N[i]], s = E === EU ? 1 : -1, w = width(i / n) * .45; i === Math.round(n * .15) ? g.moveTo(p[0] + nn[0] * w * s, p[1] + nn[1] * w * s) : g.lineTo(p[0] + nn[0] * w * s, p[1] + nn[1] * w * s); } g.stroke(); }
        else { g.strokeStyle = lt(22); g.globalAlpha = .5; g.lineWidth = Wm * .35; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.stroke(); }
        g.globalAlpha = 1;
        /* side veins: thin lines from the midrib out to the edge, slanted toward the tip, like the slits */
        g.strokeStyle = lt(lit ? 36 : 22); g.lineWidth = .7; g.globalAlpha = .35;
        const s = E === EU ? 1 : -1;
        for (let t = .22; t < .9; t += .075) { const [p] = at(t), [pe, ne] = at(Math.min(1, t + .06)), w = width(t + .06) * .92; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(pe[0] + ne[0] * w * s, pe[1] + ne[1] * w * s); g.stroke(); }
        g.globalAlpha = 1; g.restore();
      };
      half(EU, litU); half(EL, !litU);
      g.beginPath(); EU.out.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); for (let i = EL.out.length - 1; i >= 0; i--) g.lineTo(EL.out[i][0], EL.out[i][1]); g.closePath();
      g.strokeStyle = OUT; g.lineWidth = 1.6; g.stroke();
      /* the midrib: a thick pale stalk that thins toward the tip */
      for (let i = 0; i < n; i++) { const t = i / n; g.strokeStyle = 'hsl(74,72%,64%)'; g.lineWidth = 3.4 * (1 - t * .8); g.beginPath(); g.moveTo(P[i][0], P[i][1]); g.lineTo(P[i + 1][0], P[i + 1][1]); g.stroke(); }
      g.strokeStyle = 'rgba(40,110,30,.45)'; g.lineWidth = .7; g.beginPath(); P.forEach((p, i) => { const w = 1.6 * (1 - i / n * .8), q3 = [p[0] - N[i][0] * w, p[1] - N[i][1] * w]; i ? g.lineTo(q3[0], q3[1]) : g.moveTo(q3[0], q3[1]); }); g.stroke();
    });
  };
  /* the bunch hanging on its stalk beside the trunk, with the purple flower at the end. kind: 'nho' a small young green bunch (two
     hands, the flower still big), 'xanh' a full green bunch, 'chin' a full ripe yellow one */
  const BUNCH_INK = { nho: ['#93cc45', '#4c8a22', 'rgba(220,250,160,.65)'], xanh: ['#7fbf3a', '#3f7a1e', 'rgba(210,245,150,.6)'], chin: ['#f7d83c', '#a9861a', 'rgba(255,245,170,.7)'] };
  const FINGERS = [[8, -70, .1], [14, -72, 0], [20, -70, -.1], [26, -68, -.2], [9, -60, .05], [15, -61, 0], [21, -60, -.1], [27, -59, -.15], [12, -50, 0], [19, -50, -.05]];
  const bunch = kind => mk([-8, -100 + DY, 40, -30 + DY], g => {
    g.translate(0, DY);
    const small = kind === 'nho', [fill, edge, shine] = BUNCH_INK[kind], fs = small ? .72 : 1;
    g.strokeStyle = OUT; g.lineWidth = 6; g.beginPath(); g.moveTo(B.x, -82); g.quadraticCurveTo(B.x + 14, -92, B.x + 14, -74); g.stroke();
    g.strokeStyle = '#6fbd3c'; g.lineWidth = 3.6; g.stroke();
    /* a small bunch has only its top two hands, drawn smaller and closer to the stalk; the flower then hangs higher */
    const list = small ? FINGERS.slice(0, 7) : FINGERS;
    for (const [x0, y0, r] of list) {
      const x = 14 + (x0 - 14) * fs, y = -74 + (y0 + 74) * fs;
      g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.ellipse(0, 0, 4.2 * fs, 10 * fs, 0, 0, 7); g.fillStyle = fill; g.fill(); g.strokeStyle = edge; g.lineWidth = 1; g.stroke();
      g.fillStyle = shine; g.beginPath(); g.ellipse(-1.2 * fs, -1.8 * fs, 1.3 * fs, 5.6 * fs, 0, 0, 7); g.fill();
      if (kind !== 'chin') { g.fillStyle = '#3d5a1c'; g.beginPath(); g.arc(0, 9.4 * fs, .9 * fs, 0, 7); g.fill(); }
      g.restore();
    }
    const fy = small ? -12 : 0, fk = small ? 1.12 : 1;
    g.save(); g.translate(22, -46 + fy); g.scale(fk, fk); g.translate(-22, 46);
    g.strokeStyle = '#5b8f2e'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(19, small ? -60 : -54); g.lineTo(22, -51); g.stroke();
    g.beginPath(); g.moveTo(22, -52); g.quadraticCurveTo(30, -50, 27, -40); g.quadraticCurveTo(22, -36, 18, -44); g.quadraticCurveTo(17, -50, 22, -52); g.fillStyle = '#c63f66'; g.fill(); g.strokeStyle = '#7c1f3c'; g.lineWidth = 1.2; g.stroke();
    g.strokeStyle = 'rgba(255,170,190,.7)'; g.lineWidth = .9; g.beginPath(); g.moveTo(21, -50); g.quadraticCurveTo(23, -45, 22, -41); g.stroke();
    g.restore();
  });
  const trunk = () => mk([-22, B.y - 8, 22, 8], g => {
    const grad = g.createLinearGradient(-12, 0, 12, 0); grad.addColorStop(0, '#9bd25a'); grad.addColorStop(.5, '#6fb440'); grad.addColorStop(1, '#4a9136');
    g.beginPath(); g.moveTo(-12, 2); g.quadraticCurveTo(-9, B.y * .48, -7, B.y - 4); g.lineTo(7, B.y - 4); g.quadraticCurveTo(9, B.y * .48, 12, 2); g.closePath(); g.fillStyle = grad; g.fill(); g.strokeStyle = OUT; g.lineWidth = 1.8; g.stroke();
    g.strokeStyle = 'rgba(190,235,110,.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-5, -4); g.quadraticCurveTo(-4, B.y * .48, -3, B.y); g.stroke();
    for (const [x, h, w, c1, c2] of [[-5, 30, 9, '#e0bb62', '#b98d36'], [5, 34, 9, '#d6ad52', '#a77c2c'], [0, 24, 8, '#e8c872', '#c29a40']]) {
      g.beginPath(); g.moveTo(x - w, 1); g.quadraticCurveTo(x - w * .9, -h * .6, x, -h); g.quadraticCurveTo(x + w * .9, -h * .6, x + w, 1); g.closePath();
      const gg = g.createLinearGradient(x - w, 0, x + w, 0); gg.addColorStop(0, c1); gg.addColorStop(1, c2); g.fillStyle = gg; g.fill(); g.strokeStyle = '#7a5a1e'; g.lineWidth = 1.3; g.stroke();
    }
    g.fillStyle = '#4fa83a'; g.strokeStyle = OUT; g.lineWidth = 1;
    for (const [x, ang, l] of [[-16, -2.4, 11], [-10, -1.9, 9], [10, -1.2, 9], [16, -.8, 11], [-4, -1.6, 7], [4, -1.5, 7]]) { g.save(); g.translate(x, 3); g.rotate(ang + 1.57); g.beginPath(); g.moveTo(-2, 0); g.quadraticCurveTo(0, -l * .7, 0, -l); g.quadraticCurveTo(0, -l * .5, 2, 0); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  });
  /* back leaves first, the bunch in the middle, the two low front leaves last */
  const SPEC = [[-128, 84, 6, -1], [-52, 86, 8, -1], [-82, 108, 0, 0], [-164, 116, 18, 0], [-16, 118, 22, 0], [158, 96, 38, 1], [22, 96, 36, 1]];
  let built = null;
  const build = () => {
    if (built) return built;
    const leaves = SPEC.map(leaf), bunches = { nho: bunch('nho'), xanh: bunch('xanh'), chin: bunch('chin') }, tr = trunk(), cw = 270, chh = 280, c = document.createElement('canvas'); c.width = cw * R; c.height = chh * R;
    const g = c.getContext('2d'); g.setTransform(R, 0, 0, R, 135 * R, 250 * R);
    leaves.forEach(l => g.drawImage(l.c, l.x0, l.y0, l.w, l.h));
    return (built = { leaves, bunches, trunk: tr, still: { c, x0: -135, y0: -250, w: cw, h: chh } });
  };
  /* the bunch a tree carries comes from how many days ago it was last cut (SAVE11.chuoi[key] = that day): none for 3 days, a small
     green bunch, a full green one, then ripe from day 7 on until someone cuts it. A tree never cut counts from a made-up day spread
     by its key, so every few days some more trees ripen (owner 2026-10-31) */
  const RIPE = 7;
  const seedDay = key => { let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) | 0; return -(Math.abs(h) % 10) - 1; };
  const since = key => (typeof SAVE11 !== 'undefined' ? SAVE11.day : 1) - ((typeof SAVE11 !== 'undefined' && SAVE11.chuoi && SAVE11.chuoi[key] != null) ? SAVE11.chuoi[key] : seedDay(key));
  const stage = key => { const d = since(key); return d < 3 ? null : d < 5 ? 'nho' : d < RIPE ? 'xanh' : 'chin'; };
  const kindAt = (wx, wy) => stage(((typeof C11_AR !== 'undefined' && C11_AR) ? c11Pre() : '') + Math.floor(wx) + ',' + (Math.round(wy) - 1));
  /* wx, wy = where the tree stands in the world (tiles), a = the wind's push (about ±.05); kind: the bunch, or undefined to look it up */
  const show = (g, x, y, k, wx, wy, a, kind) => {
    const D = build(), t = (typeof C11 !== 'undefined' ? C11.t : 0) + wx * .7; if (kind === undefined) kind = kindAt(wx, wy);
    D.leaves.forEach((l, i) => {
      const wt = [.6, .6, .8, 1.1, 1.2, 1, 1][i], th = wt * ((a || 0) * 1.6 + .05 * Math.sin(t * 1.3 + i * 1.9) + .025 * Math.sin(t * 2.7 + i * 3.1));
      g.save(); g.translate(x + B.x * k, y + B.y * k); g.rotate(th); g.drawImage(l.c, (l.x0 - B.x) * k, (l.y0 - B.y) * k, l.w * k, l.h * k); g.restore();
    });
    if (kind) { const b = D.bunches[kind]; g.drawImage(b.c, x + b.x0 * k, y + b.y0 * k, b.w * k, b.h * k); }
  };
  return { build, show, kindAt, stage };
})();
(() => {
  const old = c11Trees3, hold = c11Sway;
  c11Trees3 = function () {
    const T = old();
    if (!T.trees.banana.mesh) { const D = C11_BANANA.build(); T.trees.banana = { sc: .5, py: 0, amp: .05, trunk: D.trunk, crown: Object.assign({}, D.still, { mesh: C11_BANANA.show }) }; }
    return T;
  };
  /* the screen spot is turned back into world tiles (C11.v from c11Layout) so the bunch and the beat stay with the tree when the
     camera moves (the screen x used before made the leaves jump while walking) */
  c11Sway = function (g, p, x, y, k, a, py) {
    if (!p.mesh) return hold(g, p, x, y, k, a, py);
    const V = (typeof C11 !== 'undefined' && C11.v) || { T: 64, cx: 0, cy: 0 };
    p.mesh(g, x, y, k, (x + V.cx) / V.T, (y + V.cy) / V.T, a);
  };
  c11Trees3();
  /* a clump of bananas at a back corner of most house yards (owner 2026-10-31: "cho nhiều cây chuối lên"): two or three stems
     standing on the corner post of the bamboo fence, which already blocks walking, so the clump needs no collision of its own */
  const clumps = () => {
    const a = C11_AR && C11_AR.id, out = []; if (!a) return out;
    for (const hs of Object.values(C11_HOUSES)) {
      if (hs.a !== a || hs.kind === 'leu') continue;
      const h = c11Hash(Math.round(hs.x * 10), Math.round(hs.y * 10), 61); if (h > .9) continue;
      const xs = Math.round(hs.x - hs.w / 2), y0 = hs.y - hs.h - 1, corners = h < .35 ? [xs - 1, xs + hs.w] : [h < .62 ? xs - 1 : xs + hs.w];
      for (const cx of corners) {
        if (c11Kind(cx, y0) !== 'R') continue;                         // only on a fence post, never on the lane
        const n = 2 + (c11Hash(cx, y0, 62) < .45 ? 1 : 0), stems = [];
        for (let i = 0; i < n; i++) { const ox = [0, .42, -.36][i] * (cx < xs ? -1 : 1), oy = [0, .12, .2][i]; stems.push({ wx: cx + .5 + ox, wy: y0 + 1 + oy, sc: [1, .78, .66][i], key: c11Pre() + 'b' + cx + ',' + y0 + ':' + i }); }
        out.push({ tx: cx, ty: y0, stems });
      }
    }
    return out;
  };
  const oldDraw = c11NewDraw;
  c11NewDraw = function (E, g, sx, sy, k, T) {
    oldDraw(E, g, sx, sy, k, T);
    const tr = c11Art().trees.banana; if (!tr) return;
    for (const cl of clumps()) cl.stems.forEach((st, i) => E.push({ y: st.wy - .05 * i, d: () => {
      const X = sx(st.wx), Y = sy(st.wy), s = k * tr.sc * st.sc; c11Shade(g, X, Y, 50 * s, 13 * s); c11Spr(g, tr.trunk, X, Y, s);
      C11_BANANA.show(g, X, Y, s, st.wx, st.wy, c11Wind(st.wx, st.wy) * tr.amp, C11_BANANA.stage(st.key));
    } }));
  };
  /* cutting a ripe bunch (owner 2026-10-31): tap a banana tree or a yard clump holding the sickle; only a ripe (yellow) bunch comes
     off, it drops as a 'Buồng chuối' to pick up and sell; that stem starts again from no bunch */
  if (!C11_ITEMS.buong_chuoi) C11_ITEMS.buong_chuoi = { id: 'buong_chuoi', name: 'Buồng chuối', cat: 'nong', price: 45, food: 24, col: '#f2d03a', desc: 'Buồng chuối tiêu chín vàng, chợ nào cũng mua.' };
  const ripeHere = (tx, ty, k, key) => {
    if (k === 't' && c11TreeType(tx, ty) === 'banana' && !SAVE11.cut[key] && !SAVE11.gone[key]) return C11_BANANA.stage(key) === 'chin' ? [key] : [];
    if (k === 'R') { const cl = clumps().find(c => c.tx === tx && c.ty === ty); if (cl) return cl.stems.filter(st => C11_BANANA.stage(st.key) === 'chin').map(st => st.key); }
    return null;                                                       // not a banana at all
  };
  /* its picture in the bag, the shop and on the ground: the ripe bunch itself */
  const oldIcon = c11ItemIcon;
  c11ItemIcon = function (g, id, cx, cy, sz, n) {
    if (id !== 'buong_chuoi') return oldIcon(g, id, cx, cy, sz, n);
    const b = C11_BANANA.build().bunches.chin, s = sz / 62;
    g.drawImage(b.c, cx - (b.x0 + b.w / 2) * s, cy - (b.y0 + b.h / 2) * s, b.w * s, b.h * s);
    if (n > 1) { g.font = `800 ${Math.max(9, Math.round(sz * .28))}px "Be Vietnam Pro", sans-serif`; g.textAlign = 'right'; g.textBaseline = 'alphabetic'; g.lineWidth = 3; g.strokeStyle = '#fbf4dc'; g.strokeText(n, cx + sz * .56, cy + sz * .58); g.fillStyle = INK; g.fillText(n, cx + sz * .56, cy + sz * .58); }
  };
  const visiting = () => typeof C11O !== 'undefined' && C11O.visit;
  const oldAct = c11ActNew, oldCan = c11CanNew;
  c11ActNew = function (tx, ty, tool, k, key) {
    if (!visiting()) {
      const ripe = ripeHere(tx, ty, k, key);
      if (ripe && ripe.length) {
        if (tool !== 'sickle') { c11Pop(tx, ty - 1.5, 'Cầm liềm để cắt buồng chuối', '#5b2f1f'); return true; }
        if (!SAVE11.chuoi) SAVE11.chuoi = {};
        for (const kk of ripe) SAVE11.chuoi[kk] = SAVE11.day;
        c11Spend(C11_COST.sickle); c11Drop('buong_chuoi', ripe.length, tx, ty); c11Chips(tx, ty - .8, tx + .5 < C11.px ? -1 : 1, 8, true); c11Sfx.pluck && c11Sfx.pluck();
        c11Pop(tx, ty - 1.5, ripe.length > 1 ? `Cắt được ${ripe.length} buồng chuối` : 'Cắt được buồng chuối', '#8a6a1a'); persist11(); return true;
      }
    }
    return oldAct(tx, ty, tool, k, key);
  };
  c11CanNew = function (tx, ty, tool, k, key) {
    if (!visiting()) { const ripe = ripeHere(tx, ty, k, key || c11Pre() + tx + ',' + ty); if (ripe && ripe.length && tool === 'sickle') return true; }
    return oldCan(tx, ty, tool, k, key);
  };
})();
