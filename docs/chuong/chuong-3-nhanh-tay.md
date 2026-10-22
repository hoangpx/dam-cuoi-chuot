# Chương III · Nhanh Tay Nhanh Mắt (5 trò nhanh, js/ch3)

Ghi chú theo thứ tự thời gian (cũ trước, mới sau; mục sau có thể sửa mục trước). Tách từ CLAUDE.md ngày 2026-10-22.

## Chương III games

Each game fills `C3GAMES[i]` (contract in js/ch3/state.js) and works in logical units (short side 540, 460 on
portrait phones). Winning shows a photo of the real print (`print`, e.g. img/ch3/dan-ga-me-con.jpg; the drawn `printRender` is only a
fallback), a clock times each game (`SAVE3.best[i]`, shown on the reward and the album card), and marks
`SAVE3.done[i]`. Tranh 1 · Đàn Gà Mẹ Con: 10 chicks, alone in the nest they stay 3 s (drop zone is wider than the nest, g3DropIn); drag the hen in first and she
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

Chương III tranh 5 · Đánh Đu (js/ch3/danh-du.js, owner design, print img/ch3/danh-du.jpg from the owner): a couple on a bamboo swing (prize line, kids with parasol, red railing). Dial below (wide: right): a needle goes round, orange/yellow bands appear at random and shrink; tap inside one = a pump (man on the right first, then the woman, in turn), needle reverses; a miss stops the needle dead for .55 s like a crash (taps ignored), shakes the dial, the swing loses .09 of reach, and DD.calm = 1: the needle restarts at the start speed and works back to its old speed over DD_CALM 3.5 s, and the bands drop to one (as at the start), coming back as it recovers. Reach A (0..DD_TOP 1.5 rad ≈ the bar) bleeds ∝ A²; higher = more bands (up to 4) that shrink faster. 3 minutes (timeLimit 180, time left in the dial hub, ownClock); record = fastest time. Needle speed and band size follow the swing height % (owner), not the hits: speed DD_SP0 2.3 → DD_SPMAX 5.2 rad/s with ddFast() = height × (1 − calm); band = .42 × random .7–1.3 × (1 − .45·ddFast()). Each pump's lift is × a pace factor (owner): ×1.2 when it comes within .7 s of the last hit, falling to ×.4 when 3 s or more have passed (DD_QUICK/DD_SLOW/DD_KMAX/DD_KMIN). From 90% a pump adds only 2%, from 95% 1% at the very most even when quick (owner); above 95% the bleed is ×.02 (DD_TOPBLEED2) and a miss costs 1.5% so the last stretch stays winnable (bots: sharp all win, average about half); above 90% the bleed is ×DD_TOPBLEED .15 and a miss costs only 3% (DD_TOPMISS; owner: 6% too harsh, 1.5% too easy). Tuning by bot runs: DD_GAIN .1, DD_BLEED .026 (owner: drops faster; was .02: ~30 s, good mostly win ~1 min, average about half). Space/Enter tap too. Its own festival song SONGS[10] (owner).

Chương III tranh 1: alone in the nest a chick stays 3 s (G3_ALONE, owner).
