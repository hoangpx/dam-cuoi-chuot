/* Village props: bamboo, hay, jars, gate, seal, text panels… */
/* ---------- props ---------- */
function buildProps() {
  const P = {};
  P.chum = part([-58, -136, 58, 8], a => {
    const j = smooth([[-38, 0], [-52, -42], [-48, -86], [-30, -108], [-27, -124], [27, -124], [30, -108], [48, -86], [52, -42], [38, 0]]);
    a.fill('brown', j);
    a.fill('green', smooth([[-50, -80], [50, -80], [51, -64], [-51, -64]]));
    a.fill('yellow', ell(-26, -46, 7, 20, .1));
    a.key(j, 2.8);
    a.key(lines([[-50, -80, 50, -80], [-51, -64, 51, -64]]), 1.6);
    for (let i = 0; i < 7; i++) a.key(smooth([[-42 + i * 14, -78], [-38 + i * 14, -72], [-42 + i * 14, -66]], false), 1.2);
    a.fk('dark', ell(0, -124, 27, 6), 2);
  });
  P.hay = part([-92, -160, 92, 8], a => {
    const d = smooth([[-82, 0], [-76, -52], [-46, -94], [0, -110], [46, -94], [76, -52], [82, 0]]);
    a.fill('straw', d);
    a.fill('yellow', smooth([[-60, -40], [-40, -80], [-6, -98], [-10, -60], [-40, -28]]));
    const r = mulberry(9);
    for (let i = 0; i < 70; i++) {
      const x = rr(-70, 70), y = rr(-100, -8), s = 1 - Math.abs(x) / 90;
      if (y < -100 * s - 4) continue;
      a.key(smooth([[x, y], [x + rr(-4, 4), y + 8], [x + rr(-6, 6), y + 16]], false), 1.2);
    }
    a.key(d, 2.6);
    a.key(lines([[0, -108, 0, -150]]), 3.4);
    a.fk('red', smooth([[-10, -120], [10, -120], [8, -112], [-8, -112]]), 1.6);
    a.fk('green', smooth([[-72, -30], [72, -30], [74, -18], [-74, -18]]), 1.6);
  });
  P.bamboo = part([-130, -440, 130, 8], a => {
    const r = mulberry(21);
    for (let k = 0; k < 5; k++) {
      const x = -80 + k * 38 + rr(-8, 8), top = -300 - rr(0, 120), lean = rr(-18, 18);
      const c = tube([[x, 0], [x + lean * .5, top / 2], [x + lean, top]], 12, 8);
      a.fk('green', c, 2);
      for (let y = -40; y > top; y -= 44) { const t = y / top; a.key(lines([[x + lean * t - 6, y, x + lean * t + 6, y - 2]]), 2); }
      for (let q = 0; q < 6; q++) {
        const t = .35 + q * .12, lx = x + lean * t, ly = top * t, ang = (q % 2 ? 1 : -1) * rr(.5, 1.1) - Math.PI / 2, L = rr(40, 64);
        for (let f = -1; f <= 1; f++) {
          const an = ang + f * .35, tx = lx + Math.cos(an) * L, ty = ly + Math.sin(an) * L, nx = -Math.sin(an) * 7, ny = Math.cos(an) * 7;
          const leaf = smooth([[lx, ly], [(lx + tx) / 2 + nx, (ly + ty) / 2 + ny], [tx, ty], [(lx + tx) / 2 - nx, (ly + ty) / 2 - ny]]);
          a.fk(f === 0 ? 'green' : 'dark', leaf, 1.4);
        }
      }
    }
  });
  P.tufts = [0, 1, 2].map(k => part([-44, -56, 44, 4], a => {
    const r = mulberry(40 + k);
    for (let i = 0; i < 7; i++) {
      const bx = rr(-26, 26), h = rr(22, 48), ln = rr(-18, 18), w = rr(4, 7);
      const b = smooth([[bx - w / 2, 0], [bx + ln * .4 - w * .3, -h * .6], [bx + ln, -h], [bx + ln * .4 + w * .3, -h * .6], [bx + w / 2, 0]]);
      a.fk(i % 3 ? 'green' : 'dark', b, 1.4);
    }
    if (k === 2) for (let i = 0; i < 3; i++) { const x = rr(-20, 20), y = rr(-44, -26); a.fk('red', circ(x, y, 4.5), 1.4); a.fk('white', circ(x, y, 1.8), 1); }
  }));
  P.ground = part([0, -14, 620, 34], a => {
    const top = [], r = mulberry(33);
    for (let x = 0; x <= 620; x += 20) top.push([x, -4 + Math.sin(x * .02) * 5 + rr(-2, 2)]);
    const g = smooth([[0, 34], ...top, [620, 34]]);
    a.fill('dark', g);
    for (let i = 0; i < 16; i++) {
      const x = rr(10, 580), y = rr(6, 22), w = rr(24, 50);
      a.band('white', smooth([[x, y], [x + w * .25, y - 3], [x + w * .5, y], [x + w * .75, y - 3], [x + w, y]], false), 1.8);
    }
  });
  P.leaf = part([-50, -18, 50, 10], a => {
    const l = smooth([[-46, 0], [-20, -14], [22, -14], [46, -2], [20, 8], [-24, 8]]);
    a.fk('green', l, 2); a.key(lines([[-40, -1, 40, -3], [-20, -2, -12, -10], [0, -2, 8, -11], [20, -3, 26, -9]]), 1.2);
  });
  P.gate = part([-120, -330, 120, 8], a => {
    for (const x of [-86, 86]) { const p = smooth([[x - 12, 0], [x - 10, -250], [x + 10, -250], [x + 12, 0]]); a.fk('red', p, 2.6); a.key(lines([[x - 11, -40, x + 11, -40], [x - 11, -210, x + 11, -210]]), 1.6); }
    a.fk('dark', smooth([[-100, -232], [100, -232], [100, -222], [-100, -222]]), 2);
    const roof = smooth([[-120, -250], [-108, -262], [-70, -292], [0, -306], [70, -292], [108, -262], [120, -250], [100, -254], [0, -262], [-100, -254]]);
    a.fk('green', roof, 2.6);
    const sc = [];
    for (let i = 0; i <= 12; i++) { const x = -100 + i * 16.6; sc.push([x, -254], [x + 8.3, -240]); }
    const scal = smooth([[-104, -256], ...sc, [104, -256], [0, -260]]);
    a.fk('white', scal, 1.8);
    for (let i = 0; i < 8; i++) a.key(lines([[-60 + i * 17, -292 + Math.abs(i - 3.5) * 3, -64 + i * 17, -266]]), 1.4);
    a.fk('red', circ(0, -312, 8), 1.6);
    const banner = smooth([[-30, -222], [30, -222], [28, -160], [0, -150], [-28, -160]]);
    a.fk('red', banner, 2.2);
    a.text('囍', 0, -188, 44, 'yellow');
  });
  P.seal = part([-34, -34, 34, 34], a => {
    a.fill('red', smooth([[-30, -29], [30, -31], [31, 30], [-29, 30]]));
    a.text('東', 0, -12, 26, 'paper'); a.text('湖', 0, 14, 26, 'paper');
  });
  P.txt1 = part([-30, -168, 30, 168], a => { Array.from('鼠輩遞魚智智智').forEach((ch, i) => a.text(ch, 0, -138 + i * 46, 42, 'dark', undefined, 'ink')); });   // the couplet from the Chuột vinh quy print: seven characters (owner's friend)
  P.txt2 = part([-30, -168, 30, 168], a => { Array.from('貓兒取禮謀謀謀').forEach((ch, i) => a.text(ch, 0, -138 + i * 46, 42, 'dark', undefined, 'ink')); });
  P.zz = part([-10, -14, 10, 14], a => a.text('z', 0, 0, 26, 'dark', 'Playfair Display, serif', 'ink'));
  return P;
}
