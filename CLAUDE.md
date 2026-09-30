# Đám Cưới Chuột — working notes

Anthology puzzle game in Đông Hồ woodblock style. Every chapter is its own game with different rules; they share
the look (woodblock print engine, paper, art library), audio and menus. No build step: plain scripts served by
GitHub Pages (https://hoangpx.github.io/dam-cuoi-chuot/).

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
tools/regress/        deterministic regression run (see below)
v1/                   frozen old single-file version (5-mouse party), kept at /v1/ — do not edit
v2/                   redirect to the root (v2 was promoted to the main version)
```

All files are classic scripts sharing one global scope, so load order in `GAME_FILES` matters: a file may only use
top-level names from files above it while it runs; inside functions anything is fine.

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

Chương I tranh: each `tranhN-*.js` holds that tranh's entities and sets `LEVELS[N-1] = {...}`; entities are plain
objects with optional `layer`, `update`, `draw/drawMid/drawFg/drawHud`, `wall()`, `onClick`, `grab/drop`,
`onDrum/onKen`, `offer`, `watcher`. The party is the groom + 3 followers (lọng, trống, kèn, ~330 px);
every gift rides in the groom's hand (`leadItem()`, dragged from `handPos()`). `C1_READY` (game.js) = how many tranh are open; later ones open after 5 taps.

## Chương III games

Each game fills `C3GAMES[i]` (contract in js/ch3/state.js) and works in logical units (short side 540, 460 on
portrait phones). Winning shows a photo of the real print (`print`, e.g. img/ch3/dan-ga-me-con.jpg; the drawn `printRender` is only a
fallback), a clock times each game (`SAVE3.best[i]`, shown on the reward and the album card), and marks
`SAVE3.done[i]`. Tranh 1 · Đàn Gà Mẹ Con: 10 chicks, alone in the nest they stay 4.5 s (drop zone is wider than the nest, g3DropIn); drag the hen in first and she
sits 10 s (they stay while she sits; a small red disc above her head unwinds backwards); all ten home → win. Tapping the nest shows the hint slip "HÃY GIÚP GÀ MẸ ĐƯA CÁC CON VỀ TỔ"; the praise
says "Bạn thật thông minh!" when the hen was sitting at the win, else "Tuyệt vời! Bạn có một đôi tay siêu nhanh!". Art follows the reference print: red/green/yellow plates
on white paper, hen tail printed separately so its key lines stay behind the body (`c3Hen`).

Tranh 2 · Hứng Dừa (hung-dua.js, own art inside): the player does not move the catcher — tap a ripe (brown) coconut and
the boy twists it off; the girl strolls/turns/pauses on her own, so the skill is timing. Only a nut landing in the
mouth of her lifted skirt counts (±22·HD_GIRL); catching a green one, or a nut hitting one of the two children running
about under the palm, costs a coconut (hdLose, red "−1"); a round is 3 minutes (timeLimit 180, countdown clock) — at the whistle ≥ 3 is a pass
(penalties can drop you under), the count is the record (SAVE3.most), else a fail screen; its own song (SONGS[3]);
wind (fronds, drifting leaves) pushes falling nuts; the whole palm leans and sways about its foot (hdSway, about -4..8°),
so nuts move and a nut picked mid-swing flies off with the palm's momentum; taps are tested in the palm frame (hdWorld). Ten caught → img/ch3/hung-dua.png. Laid out portrait-first; on wide screens it asks the shell for a taller logical
view (`short: p => p ? 460 : 860`) so the palm is as tall as on a phone and centred. The Nôm inscription from the print (img/ch3/hung-dua-chu.png, cropped
by the owner) is printed ink-only into the empty sky beside the palm (hdText strips the paper and crop-edge strays). The
round's red countdown disc is drawn in the scene on the other side of the palm, level with the inscription (`ownClock: true`
hides the shell's corner #c3Time); the coconut count sits under the green ground strip.

Tranh 3 · Chăn Trâu (chan-trau.js, own art inside): the only chương III game that walks — c3Key feeds ← → into chương I's
`keys`/`touchDir` (read by ctDir). How-to as in chương I: while roping, the clicking-mouse / tapping-finger critter
(ch1 `howtoArt`, drawn by game.overlay) bottom-left until the first throw or after 6 s idle; once roped, `padOn` shows the
◀ ▶ buttons on every screen, split to both sides (#pad.split), pulsing until the boy first walks.

Tranh 4 · Thả Diều (tha-dieu.js): intro (boy on the buffalo — tranh 3's art via tdHerd — holds the kite up, throws it),
then the camera follows the kite up (world y down, TD.camY) so the herd sinks off the bottom. The kite climbs by itself;
hold a finger / the mouse and slide sideways (TD.hold: the kite chases the finger's x); on computers also
← → / ◀ ▶ (padOn while flying on computers only, split) steer it through rows of bamboo branches (tdCourse: one long branch
from a side, or both sides with a gap, narrowing higher up) and past crows; a branch (body or a wing tip) or a crow →
the kite falls → game.onFail → the shell's fail screen. Clearing TD.top (bamboo height TD_HEIGHT) wins; record = time. Gusts every few s (TD.gust) boost the climb and show as
wind lines. tdOverlay shows a finger (mouse) sliding between two arrows until the player first steers.
The kite is the print's arched wing kite with a ribbon from each tip. Song SONGS[5] (inst 'sao' bamboo flute + drone =
the hum of the kite flute). Reward img/ch3/tha-dieu.jpg (the owner's print, yellow mat cropped off; falls back to tdPrint if the file is missing),
whose Nôm inscription (top left, cut at run time) sits in the open sky beside the red sun above the bamboo.
Chương III games may set `handCursor` (Đàn Gà Mẹ Con does): on computers the pointer is a big woodblock hand (c3DrawHand),
a fist while dragging. Chase: the buffalo wanders/dashes/
shies from the boy; a tap lobs the lasso high onto that point (flight .7 s + d/1100, a shadow marks the spot), holding only if it
lands within ~44·scale of the neck (32 of the head) — so it has to be thrown ahead of the running buffalo. The print's inscription is cut
from img/ch3/chan-trau.png at run time (ctText, ink-only) into the sky top right. Roped: it is dragged to CT.C and turns its head (stamps, then swings; faster as the ring closes);
the boy walks the ring (→ = anticlockwise, i.e. right along the near side); within CT_ALIGN of the head direction the ring
draws in (CT_IN/s), else it opens (CT_OUT/s); the ring is red with a green arc of ±CT_ALIGN at the head direction that follows it round; rMin → tamed (boy hops on, flute, win after 1.4 s); rMax (dashed
ring) → breaks loose, back to chasing. Ground is a front-seen plane squashed by CT_K; the buffalo fakes turning by
foreshortening the body and swapping side/front/back heads. Roped, it bucks like a rodeo bull (ctBuck: rears on the hind feet / kicks the hind legs out, wilder as the ring closes; ctBuckPt moves the rope end with it). Record = fastest time; SONGS[4] (tense, 150 bpm).

## Design rules from the owner

- Vietnamese first and large, Hán characters under it and small (cards, sheets, level card, chương II word tiles);
  keep Hán to a minimum.
- No hint text; players discover by tapping and dragging. Exception the owner asked for: chương II has two HUD buttons,
  "Luật chơi" (how the game works) and "Gợi ý" (the map's hint, only on the first C2_TIPS = 3 maps), each opening #c2help
  only when tapped; a move closes it. Controls: walk (← → / ◀ ▶) and tap/drag only.
- A brand-new player (no saved progress in any chapter: each chapter's `hasProgress()`) skips the menus and starts
  chương I tranh 1 (`playFirst()`); returning players go straight to the chapter picker (the old #title sheet is never shown). AU.init() runs at boot so the audio device opens silently before the first tap (opening it on the tap froze the page ~1 s). The party never starts
  left of x 340 so all four mice are on screen.
- Controls how-to (js/ch1/howto.js): corner ← → keys and a woodblock computer-mouse critter, no panel and no text (finger on touch,
  and the ◀ ▶ pad pulses). Shows only what the player has not done yet (walked 160 px / a tap that hit something),
  remembers it in localStorage 'dcc.how', and reappears after 10 s idle or 2.5 s pushing against a wall.
- Each chapter: its own gameplay and its own song, same art style. Don't rework finished chapters unasked.
- Check every puzzle on a phone-sized view too. Portrait screens show at least 640 world px with the groom 360 px
  from the left edge so the whole party fits (375×812: x ≈ groom−360 … groom+280); desktop 1100×640 shows
  groom−310 … groom+430 and ~350 px above GROUND. Keep puzzle pieces inside both.

## Verifying changes

- `node tools/regress/make-test-page.js`, serve the folder, open `/_test.html`, run `await __regress()`.
  It clears saves, seeds `Math.random`, freezes rAF, walks every tranh of chương I and solves all 14 chương II
  maps (`ch2-solutions.json`), returning frame hashes. Hashes depend on the browser and font files, so compare
  against a run of the previous commit made in the same browser session (git stash → run → stash pop → run);
  `snapshot.json` is only an example of the output.
- Chương II maps: verify solvability by replaying solutions through `c2Parse/c2Settle/c2Step`.
- Look at real screenshots (desktop and mobile), not just numbers.

## Publishing

- Bump `VERSION` in the loader (index.html) on every deploy so browsers do not mix cached old JS with a new page.

- GitHub: push only when the owner asks.
- The claude.ai artifact copy must not include the GoatCounter `<script>` in `<head>` (its CSP blocks it).
