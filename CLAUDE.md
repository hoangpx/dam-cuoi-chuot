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
js/ch4/               Chương IV · Vợ Chồng Khởi Nghiệp (village-market trading game): art.js (stalls, rigs,
                      measured speech bubbles), folk.js (names, chat scripts, calls, buy/sell lines), dan.js (the residents,
                      their ties, liking, the book with tabs), chuyen.js (village stories + achievements), cho.js (the game)
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
about under the palm, costs a coconut (hdLose, red "−1"); three in the skirt wins at once (penalties can take you back down first); record = fastest time (SAVE3.best);
its own song (SONGS[3]);
wind (fronds, drifting leaves) pushes falling nuts; the whole palm leans and sways about its foot (hdSway, about -4..8°),
so nuts move and a nut picked mid-swing flies off with the palm's momentum; taps are tested in the palm frame (hdWorld). Three caught → img/ch3/hung-dua.png. Laid out portrait-first; on wide screens it asks the shell for a taller logical
view (`short: p => p ? 460 : 860`) so the palm is as tall as on a phone and centred. The Nôm inscription from the print (img/ch3/hung-dua-chu.png, cropped
by the owner) is printed ink-only into the empty sky beside the palm (hdText strips the paper and crop-edge strays). The
elapsed-time red disc (its ring goes round once a minute) is drawn in the scene on the other side of the palm, level with the inscription (`ownClock: true`
hides the shell's corner #c3Time); the coconut count sits under the green ground strip.

Tranh 3 · Chăn Trâu (chan-trau.js, own art inside): the only chương III game that walks — c3Key feeds ← → into chương I's
`keys`/`touchDir` (read by ctDir). How-to as in chương I: while roping, the clicking-mouse / tapping-finger critter
(ch1 `howtoArt`, drawn by game.overlay) bottom-left until the first throw or after 6 s idle; once roped, `padOn` shows the
◀ ▶ buttons on every screen, split to both sides (#pad.split), pulsing until the boy first walks.

Tranh 4 · Thả Diều (tha-dieu.js): intro (boy on the buffalo — tranh 3's art via tdHerd — holds the kite up, throws it),
then the camera follows the kite up (world y down, TD.camY) so the herd sinks off the bottom. The kite climbs by itself;
hold a finger / the mouse and slide sideways (TD.hold: the kite chases the finger's x) — the only control
(no keys, no ◀ ▶ buttons, owner's choice) steers it through rows of bamboo branches (tdCourse: one long branch
from a side, or both sides with a gap, narrowing higher up) and past crows. Holding on (finger/mouse/key) speeds up the longer it is held (TD.holdT → ×TD_TUNE.hold over TD_TUNE.ramp s), letting go brakes
to ~45%; gusts boost it up to ×2.1; 30 s to the top (TD_TIME; game.clockDown shows a countdown) or the kite falls;
TD_TUNE was set from bot runs (always holding ~2/10 wins, braking well ~5/10); crows come as a flock (one every 1–2 s, sometimes 2–3 at once).
A crow only sends the kite reeling (TD.wobble, knocked aside, slow to answer); a branch (body or a wing tip) →
the kite falls → game.onFail → the shell's fail screen. Clearing TD.top (bamboo height TD_HEIGHT) wins; record = time. Gusts every few s (TD.gust) boost the climb and show as
wind lines. tdOverlay shows a finger (mouse) sliding between two arrows until the player first steers, and later, after 2.5 s without
holding (TD.slowT), a finger (mouse) pressed and held with arrows running up: hold to fly faster.
Wide screens play the same course as a phone: TD.W is capped at 500 and centred (TD.X0), bamboo groves fill the sides
(scenery only), and the logical short side is 940 so branches show as early as on a phone. The kite is the print's arched wing kite with a ribbon from each tip. Song SONGS[5] (inst 'sao' bamboo flute + drone =
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

Chương IV · Vợ Chồng Khởi Nghiệp (js/ch4/cho.js, css/ch4.css, SAVE4 in localStorage `dcc.c4`) — OPEN to everyone since 2026-10-02 (was held back:
`locked()` (C4_LOCAL) kept its card greyed on GitHub Pages; removed). There is no
"Sắp có" next-chapter card any more (the owner dropped it). No album either: `direct: startC4` — its chapter card opens the
market straight away; the HUD name and Esc go back to the chapter picker (a fresh start is only by going bankrupt). a trading game modelled on the
mechanics (not the content) of a street-vending sim, set in an old mouse village. First visit (SAVE4.intro false): the
newly-wed couple talk it over at home (C4_TALK, c4Slip slips with the dots towards the speaker, tap/Space to go on) — he
wants to steal food, she refuses (danger, their future children), "phi thương bất phú", so: a betel stall. The husband
(MICE.groom) is the porter carrying the goods up from the boat; the wife (MICE.b) sells. The lane is seen a little from above: depth z (0 far edge by the houses … 1 near edge), c4Y(z)/c4S(z) give screen y and
size, everything is drawn far-to-near. Folk: mice of 14 sorts (C4_MOUSE_SORTS: colours, conical hats, old ones stooping with a stick, children small and quick,
who do not buy), ducks, cocks (body + rHead), dogs, toads (c4Critter; the pig was dropped — it read as an ugly buffalo),
each named (C4_NAMES by kind / old / child); sways run on a per-walker seed, never on x (that jittered). No river: the
husband waits behind the stall (c4HusbX), walks off out of sight for the goods and comes back carrying them. Folk walk at random depths; two who meet may stop and play a chat script from folk.js ({A}/{B} the two, {X} someone
else present — gossip, greetings, back-biting, some about the betel couple); neighbours (C4_VENDORS) call their wares; buyers
say what they want and the wife answers; the husband announces deliveries. Speech bubbles (c4Bubble, 13 px on the market) are measured
in the real font (iPhone fonts run wider), have no inner frame and stay right over the speaker; one that would cover a
more important bubble (couple, chats, buyers first) waits instead of moving. The day loop (step 2): MORNING sheet (#c4am) shows the weather (SAVE4.plan.mua), a fair (plan.hoi), money lent / credit
coming back (SAVE4.owed), last night's notebook entries, and the player buys betel with a stepper (c4OrderUI; credit up to
C4_DEBT). Unsold betel WILTS at closing (stock → 0, a loss in the tally). More betel mid-day: tap the stall → #c4up, the
husband walks off for it. Each day is rolled a day ahead (c4Roll → SAVE4.plan/next) so gossip can be about tomorrow: ~38%
of chats are WHISPERS (C4_NEWS in folk.js) — bubble "…" + an ear; tapping the pair replays it audibly and on its end writes
C4_NOTE into SAVE4.notes ("Sổ tay" button); ~72% of whispers are true. Events (c4PlanEvents → c4Event, a #c4ev sheet that
pauses): the cat (feed 20 đ or it sits by the stall a double-hour, flow ×.2, then steals betel; drawn with ch1 drawCatAt),
the headman's dues (pay / tip → SAVE4.favor flow ×1.15 for 2 days / ask to defer, maybe fined), a neighbour's loan, a
regular's credit, a wedding order collected at giờ Thân (needs the stock). Besides the rolled ones, two everyday happenings a day from a pool (loan, credit, fortune-teller = pay to
have tomorrow written into the notebook truthfully, thief + husband gives chase, savings club, cheap betel offer, tuần đinh
clears the lane (C4.shut) or a tip, alms (SAVE4.phuc luck), cụ Đồ's scroll (SAVE4.cauDoi, red couplets on the stall, flow
×1.06 for good), minding a neighbour's child (C4.kid)). The headman's dues come every C4_DUES_EVERY = 5 days, announced the
morning before. The cat appears on the roof of the house behind the stall, leaps down (then the decision sheet), and leaves
back over the roof. A wedding procession (C4.parade: drum, kèn, parasol, groom, bride from chương I) crosses the market on
wedding days and sometimes otherwise; children sometimes come as a gang chasing each other. Chats/lines all original (the
reference game's content is not copied — only its public guide was read for mechanics). Customer flow = c4Flow(). Ruin: owing the trader ≥ C4_BROKE (200 đ) on C4_BROKE_DAYS (3) mornings running →
c4Bankrupt (red warnings count down on the morning sheet) → start over from day 1 (intro skipped). Times show the modern
clock too: HUD "giờ Thìn · 7:40" (c4Clock), messages "giờ Thân (15–17 giờ)" (c4Span). Bubbles are fixed to
the speaker's head (never clamped to the screen); once shown a bubble keeps its place.
Step 1 = one stall: the seller sells by
herself — villagers walk the lane (C4_BUSY per double-hour × C4_LV.flow), some queue (patience bar), she serves one at a time
(C4_LV.serve), each pays C4_PRICE a quid; when stock ≤ 30% the husband fetches more (credit up to C4_DEBT, auto-repaid from cash). A day is giờ Mão–Dậu (C4_MPS game min/s, ~3.5 min) then a tally
sheet (#c4day). Tap the stall → #c4up: gánh → sạp lều → gian mái ngói (6 s of scaffolding). Drag sideways to look along the
lane. Money in đồng shown as quan + đồng (600 đồng a quan). Own view c4View() (closer on phones: ~430 units across, lane a
little below the middle, sun + a faded far row of the village above, earth below). Mice drawn with c4Mouse (chương I parts).
Straight-edged art uses c4Poly/c4Rect (smooth() rounds every corner). Song SONGS[6]. APPROACH A (multi-stall, owner's choice): C4_GOODS holds every ware (trau = the betel stall, plus che 990 / xoi 1370 / xen 1750 / bun 2130 on rentable plots: from day 2/4/6/8, rent 100/200/300/500, a hired helper paid C4_GOODS.wage each evening — two unpaid evenings and they quit; helpers are C4_HELPERS mouse sorts in SAVE4.shops[g] {own, stock, staff, sort, unpaid, sick}). Each ware has demand per double-hour (hours) and weather (wx), and how it keeps: day (wasted at closing), noon (xôi goes off at giờ Ngọ), ever (hàng xén). Weather c4Roll().wx: dep / gat (25% of betel wilts at noon) / mua / ret. A spawned buyer picks a stall by c4Want(); each stall has its own queue C4.Q[g] and server C4.SV[g]; buyers coming from the right spawn past their stall. Morning sheet: one stepper per ware (c4Stepper) + total; tapping a stall opens c4OpenUp(g) (restock via the husband, the betel stall's upgrade, a plot's rent, hiring a new helper). Loss events added: cau sâu, a dog knocking over tea/rice/soup, a helper ill or skimming, a rival betel stall (SAVE4.rival / cheap, 3 days), a gale, a straw fire (C4.fire empties the market), the district's levy; dues = 15 × stalls. The cat is big (≈1.9 × the lane scale at the stall). GOAL: C4_GOAL = 1200 đồng (2 quan) shown on the morning sheet, notebook and HUD; at the tally c4GoalReached() (she is with child, a brood is born) sets SAVE4.goal, which un-hides the chương V card (registerChapter id 5, hidden() / lockText "Đang khắc ván" — hub supports both). Play goes on after. RESIDENTS (js/ch4/dan.js): every grown-up walker is a resident of a village built from SAVE4.seed (c4People: 20 mouse households of 1–5 — old couple + son + daughter-in-law, young couple, widow + child, single — plus 4 animal households; ~60 folk), each with a name, a role in the house, a trade, a temper (C4_TRAITS: how many ties, how readily they refer, how much a snub or a deal moves them) and ties (C4_RELS kin in the house; hàng xóm/bạn/bạn nhậu/kết nghĩa/thông gia/không ưa across). Children stay nameless. Saved per person in SAVE4.folk[id] {k day met, a liking, v visits, inv, deal, ref, bad}. From day C4_BOOK_DAY (3) a first purchase makes a buyer "biết mặt" (f.seen, name floats up, listed greyed under Khách quen) and the second makes them known (★ name); liking +4 a visit, −4 for a long wait, −12 when the stall had run out (by temper); liking ≥ 60 may send an unmet kin/friend (ref, C4.expect); gossips who dislike the stall spread it at night (c4Gossip). c4PickResident weights who walks by (regulars, invited ×4), c4Keen how keen to buy (strangers: c4Rep() .35/.5/.62 the first three days — a new stall sells poorly and mostly at a loss — then .85). The book (#c4note) has tabs Tin đồn / Khách quen (cards → a person: temper, liking, visits, ties with unmet ones as ???, actions: invite today (3 a day), half price or free next visit) / Quan hệ (SVG ring of the folk you know, households side by side, names along the radius) / Gia phả (households, unmet members as ?). Portraits: c4Face renders the rig into a round frame once per look. Rumours: news already in the notebook is never whispered again, each kind at most twice a day, 3 whispers a day at most. LOOKS (owner: no toads; buffaloes; skirts, tools, rain gear, drunks): residents get p.look in c4People — skirt (váy đụp colours C4_SKIRTS, women), hat quai (nón quai thao), tool buf (leads a buffalo, at most two on the lane: chương III ctArt() parts via c4Buffalo, drawn 205·s behind on a rope; such walkers only pass through, never buy) / cay (plough) / cuoc (hoe) / dieu (điếu cày: at most two old men in the village; they walk without it, sit on a stool at w.smokeX for a smoke — st sit, C4_SIT folds the legs — then go on) / thung (basket on the hip) / ganh (shoulder pole) / o (umbrella), drinker. Per walk (c4Spawn): w.buf, w.umb (umbrella in the rain, else áo tơi + nón lá), w.drunk (afternoons: reels, zigzags across the lane, red cheeks, gourd, C4_DRUNK mumbles). Drawn by c4DecoBack (behind) / c4Deco (over) in art.js in the mouse frame; C4_TOOL_ARM sets the arm pose. The toad household was removed. LOANS (owner: a player with no cash and maxed credit was stuck): the morning sheet's money box (#c4loan, c4LoanUI) shows what is owed (trader, loans) with pay buttons, and lends: a neighbour (c4Lender: the best-liked known resident) 60 đ at 10% for 3 days, or cụ Lý 300 đ at 35% for 5 days (C4_LOANS); one of each at a time, SAVE4.loans. Due mornings take repayment from the purse; unpaid, a neighbour's loan grows +5 a morning and they like the stall less, cụ Lý's grows 20% a morning and after 3 overdue mornings he seizes everything (c4Bankrupt(why)). The headman is called cụ Lý everywhere. Nothing is repaid automatically during the day (owner): the tally sheet has the same money box (#c4loanN, pay only: Trả 20 / Trả hết to the trader, Trả per loan). The goal counts savings c4Net() = purse − trader debt − loans. STORIES + ACHIEVEMENTS (js/ch4/chuyen.js, book tabs Chuyện / Thành tựu): 8 original mysteries (C4_STORIES), each bound by c4Stories() to an A–B–C chain of tied residents; a line shows once its teller is met; solved when all three are met and C likes the stall ≥ C4_STORY_LIKE (50) → money or SAVE4.perk (+4% folk in c4Flow each), SAVE4.stories[id]. Achievements C4_ACH (Xóm giềng / Buôn bán, 22) ticked by c4AchCheck() on each sale and at the tally (SAVE4.ach[id] = day). Bots: careful play reaches the goal ~day 17–19, careless renting/over-ordering goes broke. Next steps (planned with the owner):
more stalls and dishes made step by step, helpers, weather; acquaintances + resident book + the cat demanding tribute;
village events, market dues, the teacher, take-overs, ending in the mouse wedding.

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
