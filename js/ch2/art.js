/* Woodblock word tiles and things for chương II. */
/* ---------- art: woodblock tiles ---------- */
function buildC2Parts() {
  const T = { tiles: {} };
  const pg = pts => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; };
  const display = '"Playfair Display", serif';
  T.mouse = part([-48, -52, 50, 46], a => {
    a.key(smooth([[-20, 18], [-32, 30], [-44, 26]], false), 3);
    a.fk('green', ell(-6, 10, 24, 26), 2.6); a.fill('lilac', ell(2, 12, 11, 16));
    a.fk('ltred', smooth([[-14, -10], [-12, -26], [6, -34], [26, -24], [36, -14], [30, -6], [8, -2], [-8, -4]]), 2.4);
    a.fk('lilac', circ(-6, -30, 11), 2); a.fill('red', circ(-6, -30, 5.5));
    a.fk('dark', smooth([[-14, -30], [-10, -42], [8, -44], [14, -32]]), 1.8); a.fk('red', circ(0, -46, 3.4), 1.2);
    a.fk('yellow', circ(12, -18, 6.5), 1.6); a.ink(circ(13.5, -18, 3));
    a.ink(circ(36, -14, 3)); a.key(lines([[28, -12, 47, -18], [28, -9, 47, -8]]), 1.1);
  });
  T.cat = part([-46, -48, 46, 44], a => {
    a.fk('catY', smooth([[-28, -6], [-32, -40], [-6, -24]]), 2.2); a.fk('catY', smooth([[28, -6], [32, -40], [6, -24]]), 2.2);
    a.fill('red', smooth([[-25, -14], [-27, -33], [-12, -22]])); a.fill('red', smooth([[25, -14], [27, -33], [12, -22]]));
    a.fk('catY', circ(0, 8, 31), 2.8);
    a.fill('catY2', ell(0, -12, 10, 5)); a.fill('catY2', ell(-20, 8, 6, 12, .2)); a.fill('catY2', ell(20, 8, 6, 12, -.2));
    for (const x of [-13, 13]) { a.fk('yellow', ell(x, 2, 7.5, 6), 1.8); a.ink(ell(x, 2, 2, 5.2)); }
    a.fk('red', smooth([[-4, 12], [4, 12], [0, 17]]), 1.2);
    a.key(smooth([[-10, 22], [0, 19], [10, 22]], false), 1.5);
    a.key(lines([[-22, 14, -44, 10], [-22, 18, -44, 22], [22, 14, 44, 10], [22, 18, 44, 22]]), 1);
  });
  T.wall = part([-42, -42, 42, 42], a => {
    a.fk('brown', rect(-38, -38, 76, 76), 2.8);
    for (let r = 0; r < 4; r++) {
      const y = -38 + r * 19; a.key(lines([[-38, y, 38, y]]), 1.6);
      const off = r % 2 ? 0 : 19; for (let x = -38 + off; x < 38; x += 38) a.key(lines([[x, y, x, y + 19]]), 1.4);
    }
    a.fill('straw', rect(-38, -38, 76, 7));
    a.key(lines([[-38, -31, 38, -31]]), 1);
  });
  T.water = part([-42, -42, 42, 42], a => {
    a.fk('dark', rect(-38, -38, 76, 76), 2.6);
    for (const y of [-22, 0, 22]) a.band('white', smooth([[-30, y], [-20, y - 6], [-10, y], [0, y - 6], [10, y], [20, y - 6], [30, y]], false), 3);
    a.fill('lilac', circ(-24, 26, 3)); a.fill('lilac', circ(22, -30, 3));
  });
  T.fire = part([-42, -48, 42, 42], a => {
    a.fk('red', smooth([[0, -46], [16, -18], [30, 2], [26, 28], [0, 38], [-26, 28], [-30, 2], [-14, -16]]), 2.6);
    a.fk('yellow', smooth([[0, -18], [10, 0], [15, 20], [0, 31], [-15, 20], [-10, 0]]), 2);
    a.fk('white', smooth([[0, 4], [5, 14], [0, 23], [-5, 14]]), 1.4);
  });
  T.fish = ITEM.fish;
  T.gate = part([-42, -50, 42, 42], a => {
    for (const x of [-30, 30]) a.fk('red', rect(x - 6, -20, 12, 60), 2.4);
    a.fill('yellow', rect(-24, -18, 48, 58)); a.text('囍', 0, 12, 34, 'red');
    a.fk('dark', rect(-40, -30, 80, 11), 2.2);
    a.fk('green', smooth([[-42, -30], [-30, -40], [0, -48], [30, -40], [42, -30], [0, -34]]), 2.4);
  });
  T.hay = part([-42, -40, 42, 42], a => {
    a.fk('straw', smooth([[-38, 36], [-36, 4], [-14, -26], [0, -34], [14, -26], [36, 4], [38, 36]]), 2.6);
    a.fill('yellow', smooth([[-26, 0], [-8, -24], [-2, -10], [-14, 12]]));
    a.key(lines([[-14, -4, -10, 8], [6, -14, 10, 0], [16, 4, 20, 16], [-24, 12, -20, 24], [0, 6, 4, 22]]), 1.3);
  });
  T.jar = part([-38, -46, 38, 42], a => {
    a.fk('brown', smooth([[-22, 36], [-32, 4], [-26, -22], [-14, -32], [14, -32], [26, -22], [32, 4], [22, 36]]), 2.6);
    a.fk('green', rect(-30, -12, 60, 10), 1.6);
    a.fk('dark', ell(0, -33, 15, 5), 1.8); a.fill('yellow', ell(-16, 12, 4, 12));
  });
  // the Baba-style things (owner): a bronze key, a red-lacquer door, a grey rock, a cloud
  T.key = part([-42, -30, 42, 30], a => {
    a.fk('yellow', circ(-20, 0, 15), 2.6); a.fill('paper', circ(-24, -4, 6)); a.fk('white', circ(-20, 0, 6), 1.8);
    a.fk('yellow', rect(-6, -5, 42, 10), 2.4); a.fk('yellow', rect(22, 4, 7, 12), 2); a.fk('yellow', rect(31, 4, 6, 9), 2);
    a.key(lines([[-14, 10, -26, 10]]), 1);
  });
  T.door = part([-40, -46, 40, 44], a => {
    a.fk('red', rect(-32, -40, 64, 80), 2.8); a.fk('brown', rect(-36, -44, 72, 8), 2.2);
    a.key(lines([[0, -36, 0, 40]]), 1.8);
    for (const x of [-16, 16]) for (const y of [-22, -2, 18]) a.fk('yellow', circ(x, y, 3.2), 1.2);
    a.fk('yellow', rect(-9, 2, 18, 14), 2); a.ink(circ(0, 8, 2.4)); a.key(lines([[0, 9, 0, 13]]), 1.6);
  });
  T.rock = part([-42, -40, 42, 40], a => {
    a.fk('ash', smooth([[-36, 26], [-34, -4], [-18, -30], [8, -34], [30, -16], [38, 14], [26, 32], [-12, 34]]), 2.8);
    a.fill('grey', smooth([[-10, 30], [16, 26], [30, 12], [22, 28]])); a.fill('white', ell(-12, -16, 9, 5, -.5));
    a.key(smooth([[-18, -2], [-6, 6], [4, 2], [12, 12]], false), 1.4); a.key(smooth([[10, -18], [16, -8]], false), 1.2);
  });
  T.cloud = part([-46, -34, 46, 30], a => {
    a.fk('white', smooth([[-40, 16], [-42, -2], [-26, -12], [-18, -28], [2, -30], [14, -18], [30, -22], [42, -6], [40, 14], [24, 22], [-20, 22]]), 2.6);
    a.band('blue', smooth([[-26, 4], [-16, -8], [-4, -2], [-10, 8], [-20, 6]], false), 2.4); a.band('blue', smooth([[8, 2], [18, -10], [30, -4], [24, 8]], false), 2.4);
  });
  const tile = (han, vi, kind, fixed) => part([-42, -42, 42, 42], a => {
    a.fk(kind === 'noun' ? 'white' : kind === 'is' ? 'yellow' : 'green', rect(-36, -36, 72, 72), 2.8);
    if (kind === 'noun') a.fill('red', rect(-36, -36, 72, 9)); else if (kind === 'prop') a.fill('white', rect(-36, -36, 72, 9));
    a.key(rect(-31, -31, 62, 62), 1.2);
    const n = [...vi].length, size = n <= 2 ? 28 : n === 3 ? 23 : n === 4 ? 20 : 16.5;
    a.text(vi, 0, -4, size, 'dark', display, 'ink', 900);
    a.text(han, 0, 22, 17, 'dark', undefined, 'ink');
    if (fixed) for (const [x, y] of [[-29, -29], [29, -29], [-29, 29], [29, 29]]) a.ink(circ(x, y, 3.2));
  });
  for (const k in C2K) { T.tiles['n:' + k] = tile(C2K[k].han, C2K[k].vi, 'noun', false); T.tiles['n:' + k + ':f'] = tile(C2K[k].han, C2K[k].vi, 'noun', true); }
  for (const k in C2OPS) { T.tiles[k] = tile(C2OPS[k].han, C2OPS[k].vi, 'is', false); T.tiles[k + ':f'] = tile(C2OPS[k].han, C2OPS[k].vi, 'is', true); }
  for (const p in C2P) { T.tiles['p:' + p] = tile(C2P[p].han, C2P[p].vi, 'prop', false); T.tiles['p:' + p + ':f'] = tile(C2P[p].han, C2P[p].vi, 'prop', true); }
  return T;
}
const C2T = buildC2Parts();
