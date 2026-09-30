# Đám Cưới Chuột — working notes

Anthology puzzle game in Đông Hồ woodblock style. Every chapter is its own game with different rules; they share
the look (woodblock print engine, paper, art library), audio and menus. No build step: plain scripts served by
GitHub Pages (https://hoangpx.github.io/dam-cuoi-chuot/).

## Layout

```
index.html            page shell, all overlay DOM, and the loader (fonts first, then GAME_FILES in order)
css/base.css          shared UI (sheets, cards, toast, level card)      css/chN.css  one chapter's HUD
js/core/              boot (canvas, constants, resize, toast), woodblock (part()/dp()/paper), audio (SONGS),
                      state (S: app-wide), chapters (registry), hub (menus + input routing), main (loop)
js/art/               shared parts: mice, cat, props, world, market; build.js renders them once
js/ch1/               Chương I · Đám Cưới Chuột: state, entities (shared blocks), tranhN-*.js, game.js (engine)
js/ch2/               Chương II · Chữ Là Luật: levels (maps), engine (pure rules), art, game
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

## Design rules from the owner

- No hint text; players discover by tapping and dragging. Controls: walk (← → / ◀ ▶) and tap/drag only.
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

- GitHub: push only when the owner asks.
- The claude.ai artifact copy must not include the GoatCounter `<script>` in `<head>` (its CSP blocks it).
