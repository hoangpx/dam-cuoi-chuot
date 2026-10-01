/* Chương III · Nhanh Tay Nhanh Mắt 眼疾手快 — quick-hands, quick-eyes games for children, one Đông Hồ print each.
   Each game file (ga-me-con.js, …) fills C3GAMES[i] with:
     { han, name, paper, short(portrait) (optional logical short side), timeLimit + scoring:'count' + score() + passed() + failText() (optional timed round), onFail(callback) (optional: the game can lose by itself), handCursor (a big hand pointer on computers), clockDown (show a countdown; the game ends the round itself), ownClock, pad (◀ ▶ on phones all game) or padOn() + padPulse() (◀ ▶ at both sides only while padOn), overlay(ctx, W, H) (screen px), song, print (image of the real print), isWon(), start(), update(dt), render(ctx, u), printRender(ctx, W, H, t) (drawn fallback),
       down(x, y), move(x, y), up(), resize(W, H), onWin(callback) }
   Games work in logical units: the short side of the screen is 540 units (460 on portrait phones). */
const C3GAMES = [];
const C3_SOON = 1;                                     // "Sắp có" cards shown after the playable games
let SAVE3 = { done: [], best: [], most: [] };         // most: biggest count for games scored by count                 // best: fastest finish per game, in seconds
try { const s = JSON.parse(localStorage.getItem('dcc.c3') || 'null'); if (s && Array.isArray(s.done)) SAVE3 = Object.assign(SAVE3, s); } catch (e) {}
if (!Array.isArray(SAVE3.best)) SAVE3.best = [];
if (!Array.isArray(SAVE3.most)) SAVE3.most = [];
const c3Clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const persist3 = () => { try { localStorage.setItem('dcc.c3', JSON.stringify(SAVE3)); } catch (e) {} };
