/* Market, courtyard and wedding pieces (tranh 4–6). */
/* ---------- art for the market, courtyard and wedding levels ---------- */
function buildMoreParts() {
  const M = {};
  const pg = pts => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; };
  const hc = (x, y, r) => { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI); p.closePath(); return p; };
  const display = '"Playfair Display", serif';

  M.stall = part([-146, -246, 146, 8], a => {
    for (const x of [-116, 116]) a.fk('brown', rect(x - 6, -196, 12, 196), 2);
    a.fk('brown', rect(-124, -72, 248, 72), 2.4);
    a.fk('yellow', rect(-124, -78, 248, 12), 2);
    for (let i = 0; i < 6; i++) a.key(lines([[-104 + i * 41.5, -64, -104 + i * 41.5, -6]]), 1.2);
    [[-80, 'red'], [-40, 'green'], [0, 'yellow'], [40, 'white'], [80, 'red']].forEach(([x, c]) => a.fk(c, ell(x, -91, 17, 11), 1.6));
    const top = u => -126 + 252 * u, bot = u => -142 + 284 * u;
    for (let i = 0; i < 6; i++) {
      const u0 = i / 6, u1 = (i + 1) / 6, c = i % 2 ? 'white' : 'red';
      a.fk(c, pg([[top(u0), -240], [top(u1), -240], [bot(u1), -198], [bot(u0), -198]]), 1.6);
      a.fk(c, hc((bot(u0) + bot(u1)) / 2, -198, (bot(u1) - bot(u0)) / 2), 1.6);
    }
    a.key(lines([[top(0), -240, top(1), -240]]), 2.6);
  });
  M.lanterns = part([-232, -62, 232, 72], a => {
    a.key(smooth([[-226, -42], [-110, -8], [0, 0], [110, -8], [226, -42]], false), 2);
    for (let i = 0; i < 5; i++) {
      const u = (i + .5) / 5, x = -226 + 452 * u, y = -42 + 42 * Math.sin(u * Math.PI) - 2;
      a.key(lines([[x, y, x, y + 8]]), 1.6);
      a.fk('yellow', rect(x - 7, y + 8, 14, 5), 1.4);
      a.fk('red', ell(x, y + 27, 15, 17), 2);
      a.key(lines([[x - 7, y + 14, x - 8, y + 40], [x + 7, y + 14, x + 8, y + 40]]), 1);
      a.fk('yellow', rect(x - 7, y + 42, 14, 4), 1.4);
      a.key(lines([[x, y + 46, x, y + 56]]), 1.4);
    }
  });
  /* lợn mẹ, facing left (after the print of Lợn Đàn) */
  M.pig = part([-136, -140, 136, 8], a => {
    for (const x of [-64, -34, 50, 80]) { a.fk('grey', tube([[x, -24], [x, -4]], 20, 18), 2); a.fk('dark', ell(x, -3, 11, 5), 1.4); }
    const body = smooth([[-74, -18], [-98, -52], [-94, -96], [-50, -122], [20, -124], [92, -106], [114, -60], [98, -18], [40, -2], [-20, 0]]);
    a.fk('grey', body, 2.8);
    a.fk('yellow', circ(12, -66, 27), 2);
    const sw = new Path2D(); sw.arc(12, -66, 27, -Math.PI / 2, Math.PI / 2); sw.arc(12, -66 + 13.5, 13.5, Math.PI / 2, -Math.PI / 2, true); sw.arc(12, -66 - 13.5, 13.5, Math.PI / 2, -Math.PI / 2); sw.closePath();
    a.fill('red', sw); a.key(circ(12, -66, 27), 2);
    const cr = new Path2D(); cr.arc(-42, -66, 22, 1.9, 5.2); cr.arc(-35, -66, 16, 5.0, 2.1, true); cr.closePath(); a.fk('yellow', cr, 1.6);
    a.key(smooth([[-20, -118], [10, -108], [50, -118], [86, -104]], false), 1.6);
    a.fk('grey', ell(-102, -60, 34, 30), 2.6);
    a.fk('yellow', smooth([[-94, -88], [-80, -114], [-68, -88]]), 1.8);
    a.fk('red', ell(-128, -50, 13, 12), 2); a.ink(circ(-132, -50, 2.2)); a.ink(circ(-124, -49, 2.2));
    a.fk('white', ell(-104, -68, 8, 5.5), 1.6); a.ink(circ(-105, -68, 2.6));
    a.key(smooth([[-124, -34], [-112, -28], [-98, -32]], false), 1.4);
    a.key(smooth([[108, -72], [124, -82], [128, -66], [118, -62]], false), 2);
  });
  /* bà cóc bán hàng, with a nón lá */
  M.toad = part([-62, -132, 62, 8], a => {
    a.fk('green', ell(-26, -4, 20, 8), 1.8); a.fk('green', ell(26, -4, 20, 8), 1.8);
    const b = smooth([[-42, -2], [-50, -32], [-38, -64], [0, -74], [38, -64], [50, -32], [42, -2]]);
    a.fk('green', b, 2.6); a.fill('lilac', ell(0, -30, 27, 31));
    a.key(lines([[-14, -46, -8, -44], [10, -38, 16, -40], [-12, -22, -6, -20], [8, -16, 14, -18]]), 1.2);
    a.fk('green', circ(-22, -78, 16), 2.2); a.fk('green', circ(22, -78, 16), 2.2);
    a.fk('yellow', circ(-22, -80, 11), 1.8); a.ink(ell(-22, -80, 2.4, 7));
    a.fk('yellow', circ(22, -80, 11), 1.8); a.ink(ell(22, -80, 2.4, 7));
    a.key(smooth([[-26, -60], [0, -52], [26, -60]], false), 2);
    const hat = smooth([[-60, -92], [-40, -100], [0, -134], [40, -100], [60, -92], [0, -98]]);
    a.fk('straw', hat, 2.6);
    for (let i = 0; i < 6; i++) a.key(lines([[0, -132, -50 + i * 20, -94]]), 1.1);
    a.key(smooth([[-50, -94], [0, -86], [50, -94]], false), 1.6);
  });
  /* chó canh, facing right */
  M.dogBody = part([-64, -84, 66, 6], a => {
    const b = smooth([[-46, -24], [-52, -50], [-34, -68], [16, -72], [46, -60], [52, -36], [30, -22], [-18, -20]]);
    a.fk('yellow', b, 2.6);
    a.fill('brown', ell(-18, -52, 15, 10, .2)); a.fill('brown', ell(28, -42, 11, 8, -.3));
    a.fill('straw', smooth([[-40, -30], [-8, -24], [30, -26], [10, -38], [-30, -40]]));
    a.key(smooth([[-30, -62], [-22, -54]], false), 1.2); a.key(smooth([[-4, -66], [4, -58]], false), 1.2);
    a.key(b, 2.6);
  });
  M.dogLeg = part([-10, -6, 16, 50], a => { a.fk('yellow', tube([[0, 0], [1, 38]], 13, 10), 1.8); a.fk('dark', ell(6, 42, 11, 5), 1.6); });
  M.dogHead = part([-34, -46, 56, 28], a => {
    const h = smooth([[-20, -20], [-14, -38], [10, -40], [30, -26], [48, -16], [50, -4], [26, 4], [-8, 2]]);
    a.fk('yellow', h, 2.4);
    a.fk('brown', smooth([[-10, -36], [-32, -20], [-24, 0], [-4, -22]]), 2);
    a.fk('white', circ(14, -20, 6.5), 1.6); a.ink(circ(15.5, -20, 3));
    a.ink(ell(50, -12, 5, 4));
    a.key(smooth([[46, -2], [34, 3], [26, 0]], false), 1.4);
  });
  M.dogTail = part([-6, -54, 36, 8], a => { a.fk('yellow', tube([[0, 0], [16, -20], [30, -44]], 10, 6), 1.8); });
  M.excl = part([-14, -46, 14, 6], a => { a.text('!', 3, -20, 46, 'red', display, 'color', 900); a.text('!', 0, -22, 46, 'dark', display, 'ink', 900); });
  /* bàn đạp và cổng then */
  M.pad = part([-50, -16, 50, 8], a => {
    a.fk('grey', pg([[-46, 2], [-40, -10], [40, -10], [46, 2]]), 2.4);
    a.fk('red', ell(0, -9, 27, 4.6), 1.6); a.fk('yellow', ell(-8, -9, 10, 2.8), 1.2);
    a.key(lines([[-40, -4, -46, 2], [40, -4, 46, 2]]), 1);
  });
  M.doorFrame = part([-90, -290, 90, 8], a => {
    for (const x of [-66, 66]) a.fk('red', rect(x - 11, -228, 22, 228), 2.6);
    a.fk('dark', rect(-82, -238, 164, 15), 2.2);
    a.fk('green', smooth([[-90, -238], [-72, -250], [-44, -268], [0, -276], [44, -268], [72, -250], [90, -238], [0, -242]]), 2.6);
    for (let i = 0; i < 7; i++) a.key(lines([[-54 + i * 18, -268 + Math.abs(i - 3) * 4, -56 + i * 18, -246]]), 1.2);
    a.fk('yellow', circ(0, -280, 6), 1.5);
  });
  M.slat = part([-58, -232, 58, 8], a => {
    for (let x = -46; x <= 46; x += 13) a.fk('green', tube([[x, 4], [x, -226]], 10, 9), 1.6);
    for (const y of [-40, -120, -200]) a.fk('yellow', rect(-54, y - 6, 108, 12), 1.8);
    for (let x = -46; x <= 46; x += 13) a.key(lines([[x - 4, -84, x + 4, -80]]), 1);
  });
  /* items */
  M.gao = part([-24, -36, 24, 6], a => {
    a.fk('white', smooth([[-18, 0], [-22, -18], [-14, -28], [14, -28], [22, -18], [18, 0]]), 2.2);
    a.fill('lilac', ell(6, -12, 10, 12)); a.fk('red', rect(-12, -32, 24, 6), 1.6); a.key(lines([[-8, -8, 8, -8]]), 1.2);
  });
  M.ladong = part([-36, -14, 36, 14], a => {
    a.fk('green', smooth([[-30, 0], [-12, -9], [22, -8], [32, 0], [22, 8], [-12, 8]]), 2); a.key(lines([[-28, 0, 30, 0]]), 1.2);
    for (let i = 0; i < 4; i++) a.key(lines([[-14 + i * 12, 0, -8 + i * 12, -6], [-14 + i * 12, 0, -8 + i * 12, 6]]), 1);
  });
  M.banh = part([-24, -28, 24, 6], a => {
    a.fk('green', pg([[-20, 0], [-20, -22], [20, -22], [20, 0]]), 2.4);
    a.fk('red', rect(-3, -22, 6, 22), 1.4); a.fk('red', rect(-20, -14, 40, 6), 1.4);
  });
  M.seal = part([-20, -20, 20, 20], a => {
    a.fk('red', pg([[-15, -15], [15, -15], [15, 4], [4, 15], [-15, 15]]), 2);
    a.text('東', 0, 0, 22, 'paper');
  });
  const tag = (n, pl) => part([-18, -18, 18, 18], a => { a.fk(pl, circ(0, 0, 15), 2.2); a.text(n, 0, 1, 20, 'dark', display, 'ink', 900); });
  M.tag = { red: tag('4', 'red'), green: tag('5', 'green'), yellow: tag('6', 'yellow') };
  /* cầu in theo bản màu: keep the ink-only plate so it can be shown unprinted */
  M.bridgeFor = (style, w) => part([-12, -50, w + 12, 44], a => {
    if (style === 'red') {
      for (const x of [0, w]) a.fk('brown', rect(x - 6, -44, 12, 54), 2);
      a.fk('yellow', rect(-6, -44, w + 12, 7), 1.8);
      a.fk('red', rect(-4, -4, w + 8, 16), 2.6);
      for (let x = 14; x < w; x += 22) a.key(lines([[x, -4, x, 12]]), 1.3);
      for (let x = w / 4; x < w - 4; x += w / 4) a.fk('brown', rect(x - 4, -36, 8, 38), 1.6);
    } else if (style === 'green') {
      const n = Math.ceil(w / 54);
      for (let i = 0; i < n; i++) {
        const x = 27 + i * ((w - 54) / Math.max(1, n - 1));
        a.fk('green', smooth([[x - 30, 6], [x - 22, -4], [x + 22, -4], [x + 30, 6], [x + 20, 14], [x - 20, 14]]), 2.2);
        a.key(lines([[x - 22, 5, x + 22, 5], [x, -3, x, 13]]), 1.2);
        if (i % 2 === 1) { a.fk('red', ell(x, -9, 9, 5), 1.4); a.fk('yellow', circ(x, -10, 3), 1); }
      }
    } else {
      for (let i = 0; i < 4; i++) a.fk('yellow', tube([[-4, -2 + i * 9], [w + 4, -2 + i * 9]], 11, 11), 1.8);
      for (const x of [w * .25, w * .75]) a.fk('dark', rect(x - 4, -6, 8, 42), 1.6);
      for (let i = 0; i < 4; i++) for (let x = 20; x < w - 10; x += 34) a.key(lines([[x, -6 + i * 9, x + 6, -1 + i * 9]]), 1);
    }
  }, true);
  return M;
}
