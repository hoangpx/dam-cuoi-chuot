/* Tranh 4 · Chợ Quê (being carved; open to try locally and in the artifact, game.js C1_TRY) — the party crosses a
   village market the way tranh 1–3 play: walk, tap, drag, hide. Each stall keeper wants something (a bubble shows it)
   and gives something back, a chain of trades: a sack of rice found by the rice cart → the hen trades it for a basket of
   eggs → past the market dog (hide behind the jars and the hay, the horn lulls it to sleep, the drum lures it away) →
   bundle of dong leaves → the old woman wraps a bánh chưng for the eggs and the leaves → cụ Lý at the market gate lets
   the party through for the bánh chưng. No words: bubbles of the things wanted. */

// a basket of good eggs, carried by the groom
const T4_EGGBASKET = part([-30, -34, 30, 10], a => {
  for (const [x, y] of [[-12, -18], [2, -22], [14, -16], [-4, -12]]) a.fk('white', ell(x, y, 8, 10, -.2), 1.8);
  a.fk('straw', smooth([[-26, -12], [26, -12], [20, 6], [-20, 6]]), 2.2);
  a.key(lines([[-14, -8, -12, 4], [0, -8, 0, 5], [14, -8, 12, 4]]), 1);
});
ITEMS.trung = { name: 'giỏ trứng', part: T4_EGGBASKET, s: .9, cy: -12 };

// a stall keeper behind a counter who trades: wants → gives. who: { sort } a mouse of chương IV's sorts, or 'hen'
function trader(x, cfg) {
  const e = {
    layer: 'mid', ax: x, spent: false, bounce: 0, got: [],
    offer: { always: true, label: cfg.label, wants: cfg.wants, missing: cfg.missing, near: () => !e.spent && Math.abs(groom.x - x) < 190 },
    update(dt) {
      this.bounce = Math.max(0, this.bounce - dt);
      // walking up with everything in hand is enough
      if (!this.spent && Math.abs(groom.x - x) < 130 && hasAll(cfg.wants.filter(w => !this.got.includes(w)))) { takeItems(cfg.wants); this.give(); updateHud(); }
    },
    give() {
      this.spent = true; this.bounce = .8; if (cfg.gives) S.inv.push(cfg.gives);
      if (cfg.who === 'hen') AU.cluck(); AU.pluck(84); setTimeout(() => AU.pluck(91), 140); toast(cfg.ok, 3.4);
    },
    draw(g) {
      const b = this.bounce > 0 ? Math.abs(Math.sin(this.bounce * 14)) * 8 : 0;
      if (cfg.who === 'hen') {
        g.save(); g.translate(x - 18, GROUND - 64 - b); g.scale(.27, .27); c3Hen(g, c3Art().hen, 0, 0, 0, Math.sin(S.t * 2) * .1); g.restore();
      } else c4Mouse(g, c4MouseRig(cfg.who.sort), x - 30, 1, S.pose * 2, false, this.bounce > 0 ? -1.2 : null, null, 1, GROUND - b, x);
      dp(g, MP.stall, x, GROUND + 4);
      if (cfg.wares) cfg.wares(g, x);
      const want = cfg.wants.filter(w => !this.got.includes(w));
      if (!this.spent && want.length && Math.abs(groom.x - x) < 520) drawBubble(g, x - 10, GROUND - (cfg.who === 'hen' ? 168 : 214), want);
    },
  };
  return e;
}

// the market's far gate, kept by cụ Lý: he wants a gift before the party may leave
function marketGate(x, wants) {
  return {
    layer: 'bg', gateX: x, ax: x, opened: false, got: [], bounce: 0,
    get spent() { return this.opened; },
    wall() { return this.opened ? null : x - 120; },
    offer: { wants, label: 'Biếu cụ Lý', near: () => groom.x > x - 260, missing: '' },
    give() { this.opened = true; this.bounce = 1; AU.pluck(81); setTimeout(() => AU.pluck(88), 140); toast('Cụ Lý nhận bánh chưng, vuốt râu mở cổng chợ!', 3); },
    update(dt) {
      this.bounce = Math.max(0, this.bounce - dt);
      if (!this.opened && groom.x > x - 260 && hasAll(wants)) { takeItems(wants); this.give(); updateHud(); }
    },
    draw(g) {
      dp(g, PROPS.gate, x, GROUND + 4);
      const b = this.bounce > 0 ? Math.abs(Math.sin(this.bounce * 12)) * 6 : 0;
      c4Mouse(g, c4MouseRig(10), this.opened ? x + 150 : x - 70, -1, S.pose * 2, false, this.bounce > 0 ? -1.3 : null, null, 1, GROUND - b, 3);
      if (!this.opened && Math.abs(groom.x - x) < 560) drawBubble(g, x - 80, GROUND - 214, wants);
    },
  };
}

/* ---------- tranh 4 ---------- */
LEVELS[3] = {
  han: '市集', name: 'Chợ Quê', paper: 'white', width: 3700, key: -2, abil: ['drum', 'ken', 'parasol'], cps: [160, 1250, 2500],
  intro: '', endTitle: 'Qua Chợ Quê', endText: 'Đổi gạo lấy trứng, đổi trứng lấy bánh chưng, qua mặt chó canh chợ. Cụ Lý mở cổng, đoàn rước ra khỏi chợ quê.',
  build: () => [
    decor(MP.lanterns, 420, GROUND - 262), decor(MP.lanterns, 1350, GROUND - 262), decor(MP.lanterns, 2650, GROUND - 262), decor(MP.lanterns, 3250, GROUND - 262),
    decor(PROPS.bamboo, 250, GROUND + 4, .8), decor(PROPS.bamboo, 3600, GROUND + 4, 1),
    // the rice cart: a sack fallen in the lane
    decor(MP.stall, 600, GROUND + 4, .9), decor(MP.gao, 570, GROUND - 70, .9), decor(MP.gao, 630, GROUND - 74, .9),
    pickup(720, 'gao', 'Nhặt được bao gạo rơi bên xe gạo.', g => dp(g, MP.gao, 720, GROUND + 2 + Math.sin(S.pose * 3) * 1.5)),
    // the hen trades eggs for rice
    trader(1050, { who: 'hen', label: 'Đổi với gà mái', wants: ['gao'], gives: 'trung', missing: 'Gà mái muốn gạo.', ok: 'Gà mái mổ gạo ngon lành, đổi cho chú rể một giỏ trứng!' }),
    secretSpot(1300, 'drum', 'Tùng! Từ mái sạp rơi xuống một mảnh triện đỏ!'),
    // the market dog
    dog(1650, 2250), cover(1720, 'chum', 40), cover(1960, 'hay', 70), cover(2200, 'chum', 40),
    pickup(2420, 'ladong', 'Nhặt được bó lá dong.', g => dp(g, MP.ladong, 2420, GROUND - 6 + Math.sin(S.pose * 3) * 1.5, .1, 1.3, 1.3)),
    // the old woman wraps bánh chưng
    trader(2900, { who: { sort: 9 }, label: 'Đổi với bà bán bánh', wants: ['trung', 'ladong'], gives: 'banh', missing: 'Bà cụ cần trứng và lá dong.', ok: 'Bà cụ gói chiếc bánh chưng vuông vức, xanh mướt!',
      wares: (g, x) => { dp(g, MP.banh, x + 30, GROUND - 74, 0, .9, .9); dp(g, MP.banh, x + 62, GROUND - 72, .1, .8, .8); } }),
    marketGate(3450, ['banh']),
  ],
};
