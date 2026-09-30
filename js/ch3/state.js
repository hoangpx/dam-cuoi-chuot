/* Chương III · Nhanh Tay Nhanh Mắt 眼疾手快 — quick-hands, quick-eyes games for children, one Đông Hồ print each.
   Each game file (ga-me-con.js, …) fills C3GAMES[i] with:
     { han, name, paper, short(portrait) (optional logical short side), print (image of the real print), isWon(), start(), update(dt), render(ctx, u), printRender(ctx, W, H, t) (drawn fallback),
       down(x, y), move(x, y), up(), resize(W, H), onWin(callback) }
   Games work in logical units: the short side of the screen is 540 units (460 on portrait phones). */
const C3GAMES = [];
const C3_SOON = 2;                                     // "Sắp có" cards shown after the playable games
let SAVE3 = { done: [], best: [] };                 // best: fastest finish per game, in seconds
try { const s = JSON.parse(localStorage.getItem('dcc.c3') || 'null'); if (s && Array.isArray(s.done)) SAVE3 = Object.assign(SAVE3, s); } catch (e) {}
if (!Array.isArray(SAVE3.best)) SAVE3.best = [];
const c3Clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const persist3 = () => { try { localStorage.setItem('dcc.c3', JSON.stringify(SAVE3)); } catch (e) {} };
