/* Chương X · Ghép Tranh chung, stopped until the new print is ready (owner, 2026-10-20). The Worker itself answers /jg while FREEZE_JG is on:
   whoever joins gets the finished print (one group, the whole picture in the middle of the table, done: true, freeze: true) and the all-time
   board as it stood when the puzzle was stopped (frozen-board.json). Nothing reaches the Durable Object, so players still connected to it
   (an object a deploy does not restart while sockets are open) cannot bring a new visitor into a puzzle. The object keeps the puzzle in its storage. */
import board from './frozen-board.json';

const COLS = 40, ROWS = 25, N = COLS * ROWS, PW = 3200, PH = 2204, CW = 44;
const ASP = PW / PH, CH = CW / (ASP * ROWS / COLS), BW = CW * COLS, BH = CH * ROWS, WW = BW * 1.5, WH = BH * 1.5;
const WELCOME = JSON.stringify({ t: 'welcome', id: 'j1', n: 3, seed: 1, cols: COLS, rows: ROWS, groups: [[0, (WW - BW) / 2, (WH - BH) / 2, 0, [...Array(N).keys()].join(',')]], holds: [], done: true, freeze: true, players: [], me: { m: 0 } });
const BOARD = JSON.stringify({ t: 'board', total: board.total, top: board.top.map(x => ({ n: x.n, m: x.m, me: false })), me: { pos: null, m: 0 } });
export const FROZEN_COUNT = JSON.stringify({ ver: 'frozen', freeze: true, n: 0, joined: N - 1, left: 0, puzzle: 3, total: 0 });

export function frozenJg() {
  const pair = new WebSocketPair(), [client, server] = Object.values(pair); server.accept(); let joined = false;
  server.addEventListener('message', e => {
    let m; try { m = JSON.parse(e.data); } catch (er) { return; } if (!m || typeof m.t !== 'string') return;
    if (m.t === 'hello' && !joined) { joined = true; server.send(WELCOME); }
    else if (m.t === 'board' && joined) server.send(BOARD);
    else if (m.t === 'lift' && joined) server.send(JSON.stringify({ t: 'deny', g: m.g | 0 }));
  });
  return new Response(null, { status: 101, webSocket: client });
}
