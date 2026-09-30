/* Tranh 4–6 (still being carved, opened only by 5 taps in the album): colour plates, pads and doors, vendors, the pig, the dogs. */
/* Màn 4+: bản màu, bàn đạp, cổng then, bà cóc, lợn mẹ, chó canh */
function plateBridge(g0, g1, plate, note) {
  const img = MP.bridgeFor(plate, g1 - g0), mid = (g0 + g1) / 2;
  return {
    layer: 'bg', plate, gap: [g0, g1], pv: 0, ax: mid,
    wall() { return S.plate === plate ? null : g0 - 10; },
    occupied() { return members().some(m => m.x > g0 - 16 && m.x < g1 + 16); },
    hint: () => note || `${plate === 'green' ? 'Ao' : 'Suối'} rộng quá, chuột không bơi được. Chỗ này có nét khắc cây cầu chưa in màu ${PLN[plate].toLowerCase()}: bấm phím ${PKEY[plate]} để in bản ${PLN[plate].toLowerCase()}.`,
    update(dt) { this.pv += ((S.plate === plate ? 1 : 0) - this.pv) * Math.min(1, dt * 6); },
    draw(g) {
      g.globalAlpha = .34 * (1 - this.pv); dp(g, img, g0, GROUND); g.globalAlpha = 1;
      if (img.k) { g.globalAlpha = .55 * (1 - this.pv); g.drawImage(img.k, img.x0 + g0, img.y0 + GROUND, img.w, img.h); g.globalAlpha = 1; }
      if (this.pv > .02) { g.globalAlpha = this.pv; dp(g, img, g0, GROUND); g.globalAlpha = 1; }
      if (this.pv < .6) { g.globalAlpha = (1 - this.pv / .6); dp(g, MP.tag[plate], mid, GROUND - 74 + Math.sin(S.t * 3) * 3); g.globalAlpha = 1; }
    },
  };
}
function pad(x, id) {
  return { layer: 'bg', padX: x, id, pressed: false, ax: x, draw(g) { dp(g, MP.pad, x, GROUND + 4 + (this.pressed ? 4 : 0)); } };
}
function door(x, ids) {
  return {
    layer: 'bg', doorX: x, ids, open: 0, tgt: false, told: false, ax: x,
    wall() { return this.tgt ? null : x; },
    hint: () => 'Cổng then đóng chặt. Cổng chỉ mở khi có ai đứng trên bàn đạp.',
    update(dt) {
      const t = ids.some(i => S.pads[i]);
      if (t !== this.tgt) { this.tgt = t; t ? AU.creak() : AU.click(); }
      this.open += ((t ? 1 : 0) - this.open) * Math.min(1, dt * 5);
      if (!this.told && !t && groom.x > x - 460) { this.told = true;  }
    },
    draw(g) { dp(g, MP.doorFrame, x, GROUND + 4); },
    drawFg(g) { g.save(); g.beginPath(); g.rect(x - 80, GROUND - 222, 160, 232); g.clip(); dp(g, MP.slat, x, GROUND + 4 - this.open * 224); g.restore(); },
  };
}
function vendor(x, cfg) {
  return {
    layer: 'mid', spent: false, ax: x, told: false, bounce: 0, bubbleT: 0,
    offer: { always: true, label: cfg.label, wants: cfg.wants, missing: cfg.missing, near: () => Math.abs(groom.x - x) < 190 },
    update(dt) {
      this.bounce = Math.max(0, this.bounce - dt);
      if (!this.told && Math.abs(groom.x - x) < 340) { this.told = true; AU.ribbit(); }
    },
    give() { this.spent = true; this.bounce = .7; if (cfg.gives) S.inv.push(cfg.gives); AU.ribbit(); AU.pluck(84); toast(cfg.ok, 3.6); },
    draw(g) {
      const b = this.bounce > 0 ? Math.abs(Math.sin(this.bounce * 14)) * 8 : Math.sin(S.pose * 2 + x) * 1.2;
      dp(g, MP.toad, x - 24, GROUND - 68 - b, 0, .8, .8);
      dp(g, MP.stall, x, GROUND + 4);
      if (!this.spent && Math.abs(groom.x - x) < 520) drawBubble(g, x, GROUND - 262, cfg.wants);
    },
  };
}
function pigGuard(x) {
  const e = {
    layer: 'mid', spent: false, t: 0, told: false, ax: x,
    wall() { return this.spent ? null : x - 170; },
    hint: () => 'Lợn mẹ nằm chắn đường, không chịu nhúc nhích. Chắc nó đòi món gì đó…',
    offer: { always: true, label: 'Cho lợn ăn', wants: ['banh'], missing: 'Lợn mẹ ngoảnh mặt đi, chỉ chịu bánh chưng thôi.', near: () => !e.spent && groom.x > x - 340 },
    give() { this.spent = true; this.t = 0; AU.oink(); toast('Lợn mẹ ăn bánh chưng, ủn ỉn nhường đường!', 3.4); },
    update(dt) {
      this.t += dt;
      if (!this.told && groom.x > x - 560) { this.told = true;  AU.oink(); }
    },
    draw(g) {
      const px = this.spent ? x + Math.min(1, this.t / 2.6) * 270 : x, bob = Math.sin(S.pose * 2) * 1.2;
      dp(g, MP.pig, px, GROUND + 4 + bob, 0, this.spent ? -1.25 : 1.25, 1.25);
      if (!this.spent && groom.x > x - 600) drawBubble(g, x - 70, GROUND - 204, ['banh']);
    },
  };
  return e;
}
function dog(x0, x1, o = {}) {
  const spd = o.speed || 85, sight = o.sight || 270;
  const e = {
    layer: 'top', watcher: true, kind: 'dog', mode: 'dog', z0: x0 - 300, z1: x1 + 300, sound: 'bark',
    x: x0, dir: 1, st: 'patrol', pause: 0, lureX: 0, lureT: 0, alert: 0, sleepT: 0, moving: false, range: 1050,
    get ax() { return this.x; },
    hud() {
      if (this.st === 'sleep') return { text: 'Chó đang ngủ (kèn ru)', cls: 'warn' };
      if (this.st === 'lure') return { text: 'Chó chạy đi xem trống', cls: 'warn' };
      if (this.alert > 0) return { text: 'CHÓ THẤY RỒI! nấp mau!', cls: 'on' };
      return { text: 'Chó canh đang đi tuần', cls: '' };
    },
    catchMsg: () => 'Chó thấy đoàn rước, sủa ầm lên!',
    onKen() { if (this.st === 'sleep') return false; this.st = 'sleep'; this.sleepT = 7.5; this.alert = 0; AU.snore(); toast('Chó ngủ khì khì.', 1.8); return true; },
    onDrum(origin) { this.st = 'lure'; this.lureX = origin; this.lureT = 5; this.alert = 0; AU.bark(); toast('Tiếng trống làm chó chạy tới xem!', 2.8); return true; },
    update(dt) {
      if (S.caught) return;
      if (this.st === 'sleep') { this.sleepT -= dt; this.moving = false; if (this.sleepT <= 0) { this.st = 'patrol'; AU.bark(); } return; }
      let move = 0;
      if (this.st === 'lure') {
        const d = this.lureX - this.x;
        if (Math.abs(d) > 50) { this.dir = d > 0 ? 1 : -1; move = this.dir * 200; }
        this.lureT -= dt; if (this.lureT <= 0) this.st = 'patrol';
      } else if (this.pause > 0) this.pause -= dt;
      else {
        if (this.x >= x1 && this.dir > 0) { this.dir = -1; this.pause = 1.1; }
        else if (this.x <= x0 && this.dir < 0) { this.dir = 1; this.pause = 1.1; }
        else move = this.dir * spd;
      }
      this.x += move * dt; this.moving = Math.abs(move) > 1;
      const dx = groom.x - this.x, seen = dx * this.dir > 0 && Math.abs(dx) < sight && !inCover(groom.x);
      if (seen) { this.alert += dt * (Math.abs(dx) < 150 ? 3.5 : 1); if (this.alert > .45) { this.alert = 0; caught(this); } } else this.alert = Math.max(0, this.alert - dt * 1.5);
    },
    draw(g) {
      const sl = this.st === 'sleep';
      let x = this.x;
      if (S.catcher === this) { const p = S.caught, k = Math.min(1, p / .45), back = p > .45 ? Math.max(0, 1 - (p - .45) / .6) : 1; x += (this.from0 - this.x) * .85 * Math.sin(k * Math.PI / 2) * back; }
      g.save(); g.translate(x, GROUND + 4); g.scale(this.dir, 1);
      const w = this.moving ? Math.sin(S.pose * 14) : 0, bob = sl ? 0 : this.moving ? -Math.abs(Math.sin(S.pose * 14)) * 2 : 0;
      if (sl) {
        dp(g, MP.dogBody, 0, 8, 0, 1, .82);
        dp(g, MP.dogHead, 38, -18, .55);
        dp(g, MP.dogTail, -50, -18, .5);
      } else {
        dp(g, MP.dogTail, -50, -42 + bob, Math.sin(S.pose * 8) * .3 - (this.alert > 0 ? .3 : 0));
        dp(g, MP.dogLeg, -28, -44 + bob, w * .6); dp(g, MP.dogLeg, 36, -44 + bob, -w * .6);
        dp(g, MP.dogBody, 0, bob);
        dp(g, MP.dogLeg, -18, -44 + bob, -w * .6); dp(g, MP.dogLeg, 46, -44 + bob, w * .6);
        dp(g, MP.dogHead, 44, -50 + bob, this.alert > 0 ? -.25 : Math.sin(S.pose * 3) * .05);
      }
      g.restore();
      if (sl) for (let i = 0; i < 3; i++) { const k = (S.pose * .5 + i / 3) % 1; g.globalAlpha = Math.sin(k * Math.PI); dp(g, PROPS.zz, x - 10 + this.dir * 20 - k * 20 + i * 4, GROUND - 60 - k * 50, 0, .7 + k * .5, .7 + k * .5); g.globalAlpha = 1; }
      if (this.alert > 0 || S.catcher === this) dp(g, MP.excl, x + this.dir * 40, GROUND - 100 + Math.sin(S.t * 30) * 2);
    },
  };
  return e;
}


/* ---------- tranh 4 ---------- */
LEVELS[3] = {
  han: '市集', name: 'Chợ Tết', paper: 'white', width: 4100, key: -2, abil: ['drum', 'ken', 'parasol', 'plates', 'hold'], cps: [160, 1500, 2650, 3050],
  intro: 'Bản màu (phím 4, 5, 6): mỗi lần chỉ in được một bản, cầu chỉ hiện khi bản của nó đang in. Bấm G để đoàn đứng chờ khi chú rể đi một mình.',
  endTitle: 'Qua Chợ Tết', endText: 'Lợn mẹ no bụng, chợ Tết mở lối. Đoàn rước dâu tới sân đình.',
  build: () => [
    decor(MP.lanterns, 400, GROUND - 262), decor(MP.lanterns, 1250, GROUND - 262), decor(MP.lanterns, 2250, GROUND - 262), decor(MP.lanterns, 3300, GROUND - 262),
    decor(MP.stall, 640, GROUND + 4, .9), decor(PROPS.bamboo, 250, GROUND + 4, .8), decor(PROPS.bamboo, 3700, GROUND + 4, 1),
    pickup(440, 'gao', 'Nhặt được bao gạo nếp.', g => dp(g, MP.gao, 440, GROUND + 2 + Math.sin(S.pose * 3) * 1.5)),
    plateBridge(770, 990, 'red'),
    vendor(1400, { label: 'Đổi với bà cóc', wants: ['gao', 'ladong'], gives: 'banh', tell: 'Bà Cóc bán bánh chưng: "Muốn có bánh phải mang đủ gạo nếp và lá dong."', missing: 'Bà Cóc lắc đầu: cần đủ gạo nếp và lá dong mới gói được bánh.', ok: 'Bà Cóc gói xong chiếc bánh chưng vuông vức, xanh mướt.' }),
    plateBridge(1820, 2060, 'green'),
    hawk(2140, 2860),
    pickup(2540, 'ladong', 'Nhặt được bó lá dong.', g => dp(g, MP.ladong, 2540, GROUND - 6 + Math.sin(S.pose * 3) * 1.5, .1, 1.3, 1.3)),
    secretSpot(2340, 'ken', 'Tò te… từ gánh hàng rơi ra một mảnh triện đỏ!'),
    pigGuard(3330), gate(4000),
  ],
};

/* ---------- tranh 5 ---------- */
LEVELS[4] = {
  han: '院亭', name: 'Sân Đình', paper: 'sage', width: 4300, key: 0, abil: ['drum', 'ken', 'parasol', 'hold'], cps: [160, 1700, 2950, 3900],
  intro: 'Chó canh sân đình: kèn (phím 2) ru chó ngủ, trống (phím 1) dụ chó chạy tới. Cổng then mở nhờ bàn đạp: để một người ở lại giữ bàn đạp.',
  endTitle: 'Qua Sân Đình', endText: 'Hai con chó canh đã bị qua mặt, cổng then đã mở. Cổng làng nhà gái ngay phía trước.',
  build: () => [
    decor(MP.lanterns, 500, GROUND - 262), decor(MP.lanterns, 2000, GROUND - 262), decor(MP.lanterns, 3200, GROUND - 262),
    decor(PROPS.bamboo, 300, GROUND + 4, .9), decor(PROPS.bamboo, 1700, GROUND + 4, .85, -1), decor(PROPS.bamboo, 4000, GROUND + 4, .95),
    secretSpot(560, 'drum', 'Tùng! Trên mái đình rơi xuống một mảnh triện đỏ!'),
    dog(900, 1520), cover(1060, 'chum', 40), cover(1340, 'hay', 70),
    pad(1800, 'a'), door(2400, ['a', 'b']), pad(2800, 'b'),
    dog(3040, 3700), cover(3200, 'chum', 40), cover(3420, 'hay', 70), cover(3620, 'chum', 40),
    gate(4200),
  ],
};

/* ---------- tranh 6 ---------- */
LEVELS[5] = {
  han: '迎親', name: 'Rước Dâu', paper: 'lilac', width: 5500, key: -1, abil: ['drum', 'ken', 'parasol', 'plates', 'hold'], cps: [160, 1320, 2320, 2820, 3950, 4250],
  intro: 'Màn cuối, gộp mọi tài nghệ: bản màu, bàn đạp, giữ đoàn, trống, kèn, lọng. Cổng nhà gái có mèo lớn canh, cần lễ cá.',
  endTitle: 'Đón dâu về', endText: 'Cả đoàn rước qua đủ sáu chặng tranh. Đám cưới chuột thành rồi, cả làng cùng vui!',
  build: () => [
    decor(MP.lanterns, 450, GROUND - 262), decor(MP.lanterns, 1350, GROUND - 262), decor(MP.lanterns, 2500, GROUND - 262), decor(MP.lanterns, 4100, GROUND - 262),
    decor(PROPS.bamboo, 300, GROUND + 4, .85), decor(PROPS.bamboo, 5150, GROUND + 4, 1, -1),
    plateBridge(720, 920, 'red'), secretSpot(1150, 'drum', 'Tùng! Trên bụi tre giữa bãi rơi xuống một mảnh triện đỏ!'), decor(PROPS.bamboo, 1180, GROUND + 4, .8),
    plateBridge(1520, 1720, 'green'),
    hawk(1800, 2700),
    pickup(2300, 'fish', 'Nhặt được con cá: lễ vật cho mèo lớn giữ cổng.'),
    pad(2700, 'a'), plateBridge(3000, 3200, 'yellow', 'Vực rộng, chỉ có bè tre in bản vàng (phím 6) mới qua được. Cổng then bên kia mở nhờ bàn đạp: để một người ở lại giữ (phím G) rồi mới qua.'),
    door(3500, ['a', 'b']), pad(3850, 'b'),
    groundCat(4900, 4150), cover(4300, 'chum', 40), cover(4470, 'hay', 70),
    gate(5350),
  ],
};
