# Chương V · Hội Làng — trò mới (2026-10-22)

Notes for the games added after Đếm chuột / Kéo co. When this branch is merged into main, move this text to the end of
`docs/chuong/chuong-5-hoi-lang.md` (that is where chapter notes live) and delete this file. Server code is in
`server/phong-choi/src/index.js` (setupNew / actNew / gameTick / rows / winnersOf, a game id is listed in `GAMES` and `NEWG`),
drawing in `js/hoilang/tro2.js` (`HL_G.<id>`), ids also in `HL_GAMES` (js/hoilang/game.js). `server/phong-choi/test.mjs` has a bot for each.

**Before a deploy:** `cd server/phong-choi && npx wrangler deploy`, and bump the Room name (the `idFromName` places) because the
protocol changed (new messages `mzp`, `mzv`, `onv`; `act` of Đếm chuột now carries the turn as `tn`, not `t`: a field `t` replaced the message type `act`,
which is why nobody's guess ever arrived before). Bump `VERSION` in index.html (it is 2026-10-28u). Run `node tools/offline-list.js` after adding images.

- **Đếm chuột (`dem`)**: 5 turns of 2–3 / 3–6 / 3–8 (2–3 white) / 3–8 (the cat may cross) / 3–8 (two herds from opposite sides, the cat may cross) mice, never the same count twice running.
  The number on the dial is a running total, sent by itself 450 ms before the turn's input ends (`tick` hook in `updateHL`, no button). Only an exact total wins (equal totals share the pot); nobody exact = nobody paid. Mice are drawn in code (`demDrawSil`, black or white with an ink edge), the cat `demDrawCat`.
- **Đếm chuột trong hang (`dhang`)**: three upright two-legged mice (`demDrawUp`) are covered by a burrow, then mice go in / out in four steps (1 s apart); count what is left inside. Exact only, as above.
- **Nhớ tranh Đông Hồ (`nhotranh`)**: 10 turns, tap a Start button (auto-start at 12 s), 30 s from Start. Turn t shows a print on top and 2 / 4 / 6 prints below, one of them the print of turn t−1. Only all-correct players win, quickest takes the pot. 12 prints in `HL_NT_PICS` (js/hoilang/tro2.js) — keep `NP` in the server equal to its length. The player's own prints live in `img/hoilang/`.
- **Ngoáy tai mèo (`ngoay`)**: hold to push the stick along an ear canal, let go to pull it out with the pellets it passed; the eardrum is at depth 1, the last pellet at 0.955. 6–8 pellets and a random stick speed each game. The inside is shown for 4.5 s, then the face covers it once the stick passes the first pellet (memory game). Most pellets wins, equal numbers share; pierced = 0. 15 s to start. The cry is the sample `meovo` of chương I tranh 6 (`MEOW_B64`). The server tells the others nothing but "done" (a depth would give the eardrum away).
- **Mê cung (`mecung`)**: a perfect 17×17 maze, everyone starts in the middle, one gap in the outer wall at one of the three farthest border cells. The server sends each player only the 13×13 cells around them (`mzv`), never the whole maze; the page shows 9×9 cells on every screen. Arrow keys work. First out wins, 60 s, nobody out = nobody paid. Tested with a depth-first bot (`test.mjs`), 23–44 s.
- **Thái hành tây (`thaihanh`)**: each tap is a slice of 40–60; a tap after the onion is gone cuts the hand and loses (the cry grows and shakes). First done and unhurt wins; the round ends 1.5 s after the first unhurt finisher, 2.5 s after everybody is cut, or at 30 s. The face cries only after the first slice.

Local testing: `npx wrangler dev --port 8788 --var ONLY_GAME:<id>` in `server/phong-choi`, serve the repo folder, open `/index.html?hlws=ws://localhost:8788/ws`;
`DEVPFX=realp node test.mjs <players> <rounds> ws://127.0.0.1:8788/ws` plays bots. A local `wrangler dev` sometimes hangs after being restarted: kill every `workerd` and `node` process first.
