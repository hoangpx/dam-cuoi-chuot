# Đám Cưới Chuột — working notes

Anthology puzzle game in Đông Hồ woodblock style. Every chapter is its own game with different rules; they share
the look (woodblock print engine, paper, art library), audio and menus. No build step: plain scripts served by
GitHub Pages (https://damcuoichuot.com/, custom domain via CNAME; DNS on Cloudflare, DNS-only).

## Layout

```
index.html            page shell (with the home-screen icon links: img/icon-180/192/512.png + manifest.webmanifest), all overlay DOM, and the loader (GAME_FILES are preloaded in parallel at once, then run in order after the fonts; #loading sheet with a progress bar until then)
css/base.css          shared UI (sheets, cards, toast, level card)      css/chN.css  one chapter's HUD
js/core/              boot (canvas, constants, resize, toast), woodblock (part()/dp()/paper), audio (SONGS),
                      state (S: app-wide), chapters (registry), hub (menus + input routing), main (loop)
js/art/               shared parts: mice, cat, props, world, market; build.js renders them once
js/ch1/               Chương I · Đám Cưới Chuột: state, entities (shared blocks), tranhN-*.js, game.js (engine)
js/ch2/               Chương II · Chữ Là Luật: levels (maps), engine (pure rules), art, game
js/ch3/               Chương III · Nhanh Tay Nhanh Mắt (kids' quick games, open from the start): state (C3GAMES, saves),
                      art (hen, chicks, nest, mound), one file per game (ga-me-con.js, hung-dua.js, chan-trau.js, tha-dieu.js), game.js (shell, reward print)
js/ch4/               Chương IV · Vợ Chồng Khởi Nghiệp (village-market trading game): art.js (stalls, rigs,
                      measured speech bubbles), folk.js (names, chat scripts, calls, buy/sell lines), dan.js (the residents,
                      their ties, liking, the book with tabs), chuyen.js (village stories + achievements), cho.js (the game)
js/ch6/               Chương VI · Tìm Chuột (levels like chương II): levels.js (made by tools/gen-mice-levels.js),
                      ruong.js (one field: rules, input, drawing, the practice field), game.js (album, shell, saves)
js/ch7/               Chương VII · Ai Ăn Vụng? (Murdoku-style cases): cases.js (made by tools/gen-anvung.js), vu.js (one case:
                      board, tools, statements, submit), game.js (case list, six Cách chơi pages, saves)
js/ch8/               Chương VIII · Gom Ba Mở Lối (platformer + gather-3 puzzle): levels.js (made by tools/c8-build.js), engine.js (pure rules: also run in node by
                      tools/c8-solve.js), art.js (woodblock sprites), game.js (album, shell, input, drawing, saves)
js/parked/            code kept but not loaded (tam-giac.js: the Kẻ Tam Giác board game from the dropped Cờ Đất chapter)
tools/regress/        deterministic regression run (see below)
v1/                   frozen old single-file version (5-mouse party), kept at /v1/ — do not edit
v2/                   redirect to the root (v2 was promoted to the main version)
```

All files are classic scripts sharing one global scope, so load order in `GAME_FILES` matters: a file may only use
top-level names from files above it while it runs; inside functions anything is fine.

## Ghi chú theo chương (đọc file chương KHI chủ dự án nhắc tên chương đó)

Ghi chú chi tiết từng chương nằm ở docs/chuong/. KHÔNG đọc cả thư mục: chỉ mở file của chương được nhắc. Ghi chú mới viết vào ĐÚNG file chương (thêm cuối file), không thêm vào CLAUDE.md. Không rõ thuộc chương nào thì hỏi.

| Chương | File | Tóm tắt |
|---|---|---|
| I Đám Cưới Chuột | docs/chuong/chuong-1-dam-cuoi-chuot.md | 6 tranh đi bộ + kéo thả (chú rể và 3 người theo sau); tranh 4 Làng Tranh, 5 Tấm Cám, 6 Bắc Kim Thang (đêm, ao ếch, cầu khỉ, bóng chim, đoạn tối có mèo và lục lạc). Đồ họa ván in Đông Hồ. |
| II Chữ Là Luật | docs/chuong/chuong-2-chu-la-luat.md | Đố chữ kiểu Baba Is You: ghép luật bằng thẻ chữ (NOUN LÀ PROP…), 92 màn chia mục (Nhập môn, Biến hoá, Thần thông…); engine js/ch2/engine.js, giải bằng tools/c2-solve.js. |
| III Nhanh Tay Nhanh Mắt | docs/chuong/chuong-3-nhanh-tay.md | 5 trò nhanh cho trẻ (gà mẹ con, hứng dừa, chăn trâu, thả diều, đánh đu), mỗi trò có ảnh tranh thật làm phần thưởng. |
| IV Vợ Chồng Khởi Nghiệp | docs/chuong/chuong-4-khoi-nghiep.md | Game buôn bán ở chợ làng (nhiều gian hàng, người làm, khách quen, sổ tay, sự kiện) + phần 2 Phố Huyện (js/ch4b: nhà phố, hoa đăng, têm trầu), hồ sơ người chơi, bảng tổng sắp, đồng hồ chung hai nơi. Quy tắc: mọi thay đổi luật chương IV áp cho CẢ làng và phố. |
| V Hội Làng | docs/chuong/chuong-5-hoi-lang.md | Một phòng chơi chung realtime (Cloudflare Durable Object): ~21 trò nhỏ, cược 10 đồng, chia hũ khi cùng kết quả, chat, emote, bảng xếp hạng ngày/tuần/tháng/mọi lúc. |
| VI Tìm Chuột | docs/chuong/chuong-6-tim-chuot.md | Meowdoku với chuột: mỗi hàng, cột, ô màu một con, không kề nhau; màn sinh offline bằng tools/gen-mice-levels.js. |
| VII Ai Ăn Vụng? | docs/chuong/chuong-7-ai-an-vung.md | Án kiểu Murdoku: suy ra ai ở cùng phòng với đĩa đồ ăn; vụ sinh offline bằng tools/gen-anvung.js. |
| VIII Gom Ba Mở Lối | docs/chuong/chuong-8-gom-ba.md | Platformer + vuốt gom 3 (lửa, xoáy, chum, băng, nước, đá…); hơn 60 màn; ghi chú rất dài về luật game gốc và cách kiểm tra màn bằng engine thật. |
| IX/X Ghép Tranh | docs/chuong/chuong-9-10-ghep-tranh.md | IX: ghép tranh một người (đang ẩn). X: ghép tranh CHUNG nhiều người, bức tranh giữ trên server (Durable Object), nhiều tranh, bảng xếp hạng từng tranh, chống tự động. |
| Chung | docs/chuong/chung.md | Theo dõi GoatCounter, hosting, cài vào màn hình, bản quyền, lưu đám mây, ngôn ngữ, offline/Android, font, gợi ý trả tiền. |

## Chapters

A chapter plugs in with `registerChapter({...})` (contract documented in `js/core/chapters.js`): `id`, `card`,
`progress()`, `modes` (the `S.mode` values it owns while playing), `album()`, `hide()`, `update(dt)`, `render()`,
`key(e)`, `pointer {down, move, up}`, `next()`, `retry()`; the one with `cover: true` (chương I) is drawn behind
menus and gets `boot()`. The hub and loop only talk to chapters through this object — never add
`if (chapter === N)` branches to core files.

New chapter: create `js/chN/*.js` (+ `css/chN.css` and its DOM in `index.html` if it needs a HUD), keep its state in
its own object (like `C2`), add its files to `GAME_FILES` before `js/core/hub.js`, add its song to `SONGS`, and add
any new Hán characters to `FONT_CHARS` / Vietnamese letters to `VIET_CHARS` in the loader (glyphs not preloaded are
drawn in a fallback font the first time a part is printed).

## Design rules from the owner

- Vietnamese first and large, Hán characters under it and small (cards, sheets, level card, chương II word tiles);
  keep Hán to a minimum.
- No hint text; players discover by tapping and dragging. Exceptions the owner asked for: chương II's "Luật chơi" button
  (#c2help, only when tapped; a move closes it), and bought hints (Gợi ý) in chương II, VI and VII, see docs/chuong/chung.md. Controls: walk (← → / ◀ ▶) and tap/drag only.
- A brand-new player (no saved progress in any chapter: each chapter's `hasProgress()`) skips the menus and starts
  chương I tranh 1 (`playFirst()`); returning players go straight to the chapter picker (the old #title sheet is never shown). AU.init() runs at boot so the audio device opens silently before the first tap (opening it on the tap froze the page ~1 s). The party never starts
  left of x 340 so all four mice are on screen.
- Controls how-to (js/ch1/howto.js): corner ← → keys and a woodblock computer-mouse critter, no panel and no text (finger on touch,
  and the ◀ ▶ pad pulses). Shows only what the player has not done yet (walked 160 px / a tap that hit something),
  remembers it in localStorage 'dcc.how', and reappears after 10 s idle or 2.5 s pushing against a wall.
- Each chapter: its own gameplay and its own song, same art style. Don't rework finished chapters unasked.
- Chương VIII levels we make (owner, PR #7 review 2026-10-12): every solution needs AT LEAST 3 swipes (more is better; a level won
  with 0-1 swipe is rejected), AT MOST 15 objects, VARIED terrain (caves, high steps, wells, pits, overhangs; not one frame for a whole
  set), and clever swipes (order, how many cells, what is left behind, where the mouse stands must be part of the puzzle, nothing
  obvious). Hard to find, not long or crowded (level 4 Crumbly Overhang is the yardstick); a mix of things per level, not every kind.
  Prove the no-cheap-win claim in the real engine (tools/c8-own-check.js: deep no-swipe search, every single first swipe), never by a
  model alone (see "PR #7 REDO" below).
- Check every puzzle on a phone-sized view too. Portrait screens show at least 640 world px with the groom 360 px
  from the left edge so the whole party fits (375×812: x ≈ groom−360 … groom+280); desktop 1100×640 shows
  groom−310 … groom+430 and ~350 px above GROUND. Keep puzzle pieces inside both.

## Verifying changes

- `node tools/regress/make-test-page.js`, serve the folder, open `/_test.html`, run `await __regress()`.
  It clears saves, seeds `Math.random`, freezes rAF, walks every tranh of chương I and solves all 14 chương II
  maps (`ch2-solutions.json`), returning frame hashes. Hashes depend on the browser and font files, so compare
  against a run of the previous commit made in the same browser session (git stash → run → stash pop → run);
  `snapshot.json` is only an example of the output.
- Chương II maps: every map must be solvable: `node --max-old-space-size=8000 tools/c2-solve.js [index…] --out` solves by BFS with the
  game's engine and writes js/ch2/solutions.js (C2_SOL, the hint's road). Rerun it for any map you add or change, and check for
  cheap ways round the idea (a word pushed into water makes a gap; a fixed noun can be the far end of a new rule: W = G, N = 9…).
- Look at real screenshots (desktop and mobile), not just numbers.

## Publishing

- Bump `VERSION` in the loader (index.html) on every deploy so browsers do not mix cached old JS with a new page.

- GitHub: push only when the owner asks.
- The claude.ai artifact copy must not include the GoatCounter `<script>` in `<head>` (its CSP blocks it).

Chương IV, buổi sáng chung và tạm đóng cửa (owner, 2026-10-22; js/ch4b/dongho.js, cho.js, game.js, thue.js): (1) the town's "Sang ngày mới" no longer plays the village's morning by itself: it turns the day (c4DayAdvance, w4BeforeDay sets SAVE4B.morning = the new day) and opens the house sheet in morning mode (buttons "Họp chợ ở phố" = w4TownOpen, "Nhập hàng ở làng" → the village's morning sheet; Esc = Họp chợ). w4TownOpen gives the village's order for the player (w4VillageAutoMorning: "Như hôm qua" then Họp chợ) unless SAVE4.openDay is today; the village's morning sheet has "Nhập hàng ở phố" while SAVE4B.morning is pending; the village's "Họp chợ" clears it (w4VillageOpened) and the town stocks itself as the last day (w4TownAutoBuy). (2) Places left behind sell even with nobody hired (a relative minds them, ~60 % of a hand), the expected sales never fall below 70 % of a stall's capacity (a day of nothing used to keep it at nothing) and the fraction of a sale a half hour gives carries over (C4.bgFrac). (3) TẠM ĐÓNG CỬA for every stall: village SAVE4.shut[g] (c4Shut, c4OpenStalls; a switch under each ware on the morning sheet and c4ShutBlock on the stall sheet; c4Open and c4Want are false/0 for it; queued buyers go home without a snub, c4TurnAway); town SAVE4B.shut (house sheet) and shops[key].shut (shop sheet): no buyers, no boat orders, no background sales. Cụ Lý's tax counts only open stalls and is 0 when all are shut (c4Tax); the loss scale c4LossMult counts open stalls only; with every village stall shut there are no happenings, visitors, procession, flood or lean spell (c4PlanEvents, c4Morning, the event dispatcher). Rent, wages and the town's weekly tax still run. Sheets of the village and the town drop the click of the tap that opened them (a click whose pointerdown came before the sheet opened, or within .45 s: c4GhostClick, cho.js; keyboard and scripted clicks pass). VERSION 2026-10-28l.
