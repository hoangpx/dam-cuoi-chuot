/* Chương IV phần 2 · Phố Huyện (owner, 2026-10-15): after the start-up years the couple spend 500 quan on a house in the district
   town and sell betel there. Its own code and its own rules (js/ch4b/*): nothing in part 1 (js/ch4/*) is changed by it. Part 1 only has
   the button "Lên Phố Huyện" (shown from 500 quan) that calls p4Enter(). The purse is the couple's one purse (SAVE4.money, in đồng). */
const P4 = { t: 0, camX: 0, mins: 6 * 60, phase: 'open', walkers: [], Q: [], fx: [], sheet: null, scene: null, glows: [], paused: false,
  spawnT: 1, chatT: 4, today: { sold: 0, take: 0, spent: 0, lost: 0 }, wife: { say: null, serving: null, t: 0 }, husband: { x: 0, say: null, t: 0 } };
const P4_W = 3600, P4_HOME = 720, P4_GATE = 390, P4_Y0 = 300, P4_D = 190;   // the street's length, the couple's house, the gate; the street's far edge and depth
const P4_OPEN = 6 * 60, P4_CLOSE = 21 * 60, P4_MPS = 4;                     // the day: from 6:00 to 21:00, game minutes per second (slower after 18:00)
const P4_HOUSE_PRICE = 500 * 600;                                         // 500 quan (600 đồng a quan)
const P4_CROWD = .86;                                                       // folk drawn a little smaller than the houses' scale
const p4Y = z => P4_Y0 + z * P4_D, p4S = z => .52 + .34 * z;              // where depth z stands on screen, and how big
function p4View() {
  const w = innerWidth || 430, h = innerHeight || 800, portrait = h > w, s = portrait ? w / 470 : Math.min(h / 600, w / 760), vh = h / s;
  return { s, vh, vw: w / s, oy: vh * (portrait ? .72 : .81) - (P4_Y0 + P4_D) };
}
// part 2's own save: the house, the day, the betel in stock, the price
const P4_SAVE_KEY = 'dcc.c4b';
let SAVE4B = (() => { try { return JSON.parse(localStorage.getItem(P4_SAVE_KEY)) || null; } catch (e) { return null; } })() || { house: false, day: 1, stock: 0, price: 8, sold: 0 };
const P4_SAVE = () => SAVE4B;
const p4Persist = () => { try { localStorage.setItem(P4_SAVE_KEY, JSON.stringify(SAVE4B)); } catch (e) {} };
// the couple's purse (shared with part 1)
const p4Purse = () => SAVE4.money;
const p4Spend = d => { SAVE4.money -= d; P4.today.spent += d; persist4(); };
const p4Earn = d => { SAVE4.money += d; P4.today.take += d; persist4(); };
const P4_NAME_MAX = 16;                                                   // the shop's name on its board: at most 16 letters (owner)
