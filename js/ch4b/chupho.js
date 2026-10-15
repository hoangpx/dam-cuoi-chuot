/* Chương IV phần 2 · Phố Huyện: the street's master collects (owner, 2026-10-15: "không còn là cụ Lý nữa, mà là chủ phố huyện đi thu
   thuế, thu tiền bảo kê, không thì bị sách nhiễu phá phách, ít khách"). Bá hộ Kha comes with two henchmen on day 3 and every 7 days
   after, mid-morning, to the couple's house: tax = P4_BOSS.tax of the week's takings (every shop of ours), protection = P4_BOSS.guard
   (at least one quan). Pay both → left in peace. Pay only the tax → P4_BOSS.days days of trouble: two henchmen loiter at the door,
   P4_BOSS.slow fewer customers at all our shops, and now and then they smash things (P4_BOSS.smash of the day's takings). Ask for time
   → next week ×1.5, and lighter trouble meanwhile. Part 2's own code. */
const P4_BOSS = { name: 'Bá hộ Kha', title: 'chủ phố', first: 3, every: 7, at: 10 * 60, tax: .03, guard: .02, guardMin: 600, days: 3, slow: .6, slowLight: .8, smash: .1, smashP: .45 };
const p4BossDay = d => d >= P4_BOSS.first && (d - P4_BOSS.first) % P4_BOSS.every === 0;
const p4Harass = () => { const H = SAVE4B.harass; return H && H.until >= SAVE4B.day ? (H.light ? P4_BOSS.slowLight : P4_BOSS.slow) : 1; };   // the customers' share left
const P4_BOSS_LOOK = { silk: '#1f1a17', pat: 1, tool: 'quat' }, P4_THUG_LOOK = { silk: '#4a2a1a', pat: 2 };
const P4_THUG_LINES = ['Muốn yên ổn làm ăn thì biết điều!', 'Hàng quán gì mà vắng thế?', 'Đi chỗ khác mà mua!', 'Nộp tiền chưa hả?', 'Ai cho bán ở đây?'];
function p4BossUpdate(dt) {
  if (!SAVE4B.house || P4.phase !== 'open') return;
  const B = P4.boss, day = SAVE4B.day;
  // the visit: they walk in from the gate and stop at the house's door; then the sheet
  if (!B && p4BossDay(day) && (SAVE4B.bossSeen || 0) < day && P4.mins >= P4_BOSS.at) {
    const V = p4View(), from = P4.camX - 140;
    P4.boss = { st: 'come', x: Math.min(from, P4_HOME - V.vw * .6), t: 0, men: [0, 1, 2].map(i => p4BossMan(i)) };
    p4Say(P4.boss.men[0], 'Tránh ra! Bá hộ đi thu tiền!');
  }
  if (B) {
    const lead = B.men[0];
    for (const [i, m] of B.men.entries()) { if (m.say) { m.say.t += dt; if (m.say.t > m.say.life) m.say = null; } }
    if (B.st === 'come') {
      B.x += 70 * dt; B.men.forEach((m, i) => { m.x = B.x - i * 46; m.ph += dt * 7; m.st = 'walk'; m.face = 1; });
      if (B.x >= P4_HOME - 70) { B.st = 'ask'; B.men.forEach(m => { m.st = 'stand'; }); SAVE4B.bossSeen = day; p4Persist(); p4BossSheet(); }
    } else if (B.st === 'go') {
      B.x -= 80 * dt; B.men.forEach((m, i) => { m.x = B.x + i * 46; m.ph += dt * 7; m.st = 'walk'; m.face = -1; });
      if (B.x < P4.camX - 400) P4.boss = null;
    }
  }
  // trouble: two henchmen loitering at the door, grumbling at passers-by; now and then they smash something
  const H = SAVE4B.harass;
  if (H && H.until >= day) {
    if (!P4.thugs) P4.thugs = [0, 1].map(i => Object.assign(p4BossMan(i + 1), { x: P4_HOME + (i ? 70 : -110), z: .34 + i * .06, st: 'stand', face: i ? -1 : 1 }));
    for (const m of P4.thugs) { if (m.say) { m.say.t += dt; if (m.say.t > m.say.life) m.say = null; } if (!m.say && Math.random() < dt * .08) p4Say(m, p4Pick(P4_THUG_LINES)); }
    if (H.smashDay !== day && P4.mins > 13 * 60 && P4.mins < 13 * 60 + 5) {
      H.smashDay = day;
      if (Math.random() < (H.light ? P4_BOSS.smashP * .5 : P4_BOSS.smashP)) {
        const lost = Math.min(Math.max(0, SAVE4.money), Math.round(P4.today.take * P4_BOSS.smash));
        if (lost > 0) { SAVE4.money -= lost; P4.today.spent += lost; P4.today.smash = (P4.today.smash || 0) + lost; persist4(); p4Say(P4.thugs[0], 'Đập!'); toast(`Tay chân bá hộ đạp đổ hàng, thiệt mất ${c4Money(lost)}.`, 3); P4.fx.push({ x: P4_HOME, y: p4Y(.12) - 120, s: '-' + lost, t: 0 }); }
      }
      p4Persist();
    }
  } else P4.thugs = null;
}
function p4BossMan(i) {
  const sort = i ? 7 : 6, w = { sort, M: c4MouseRig(sort), seed: i * 2.1, look: { ...(i ? P4_THUG_LOOK : P4_BOSS_LOOK) }, umb: false, x: 0, z: .32 + i * .04, face: 1, dir: 1, ph: i, st: 'walk', say: null };
  return w;
}
// the visit's sheet: what is asked, and three answers
function p4BossSheet() {
  const base = SAVE4B.weekTake || 0, owe = SAVE4B.bossOwe || 0, tax = Math.round(base * P4_BOSS.tax) + owe, guard = Math.max(P4_BOSS.guardMin, Math.round(base * P4_BOSS.guard)), m = c4Money;
  P4.bossAsk = { tax, guard };
  $('#p4bossB').innerHTML = `<p><b>${P4_BOSS.name}</b>, ${P4_BOSS.title}, phe phẩy quạt trước cửa hiệu, hai tay chân đứng sau.</p>`
    + `<p>"Tuần này các người bán được ${m(base)}. Thuế phố ${m(tax)}${owe ? ' (cả khoản khất tuần trước)' : ''}, tiền bảo kê ${m(guard)}. Nộp đủ thì yên ổn mà làm ăn."</p><p>Trong túi: ${m(Math.round(p4Purse()))}</p>`;
  $('#p4bossAll').textContent = `Nộp đủ · ${m(tax + guard)}`; $('#p4bossAll').disabled = p4Purse() < tax + guard;
  $('#p4bossTax').textContent = `Chỉ nộp thuế · ${m(tax)}`; $('#p4bossTax').disabled = p4Purse() < tax;
  p4Sheets('p4boss');
}
function p4BossAnswer(how) {
  const A = P4.bossAsk, day = SAVE4B.day, lead = P4.boss && P4.boss.men[0];
  if (how === 'all') { p4Spend(A.tax + A.guard); SAVE4B.bossOwe = 0; SAVE4B.harass = null; if (lead) p4Say(lead, 'Biết điều đấy. Cứ yên tâm buôn bán!'); }
  else if (how === 'tax') { p4Spend(A.tax); SAVE4B.bossOwe = 0; SAVE4B.harass = { until: day + P4_BOSS.days - 1 }; if (lead) p4Say(lead, 'Không nộp bảo kê à? Rồi xem!'); toast(`Không nộp bảo kê: ${P4_BOSS.days} ngày tới tay chân bá hộ sẽ đến quấy, khách ngại ghé.`, 3.4); }
  else { SAVE4B.bossOwe = Math.round((A.tax + A.guard) * 1.5); SAVE4B.harass = { until: day + P4_BOSS.days - 1, light: true }; if (lead) p4Say(lead, 'Khất à? Tuần sau gấp rưỡi!'); toast(`Xin khất: tuần sau nộp ${c4Money(SAVE4B.bossOwe)}. Mấy hôm tới vẫn bị quấy nhẹ.`, 3.4); }
  SAVE4B.weekTake = 0; p4Persist(); p4Hud(); p4Sheets(null);
  if (P4.boss) P4.boss.st = 'go';
}
{
  const d = document.createElement('div'); d.id = 'p4boss'; d.className = 'c4sheet p4sheet'; d.hidden = true;
  d.innerHTML = '<div class="card4"><h3>Chủ phố đến thu tiền</h3><div id="p4bossB"></div><div class="row col"><button class="btn" id="p4bossAll"></button><button class="btn alt" id="p4bossTax"></button><button class="btn alt" id="p4bossLater">Xin khất sang tuần</button></div></div>';
  document.body.appendChild(d);
  $('#p4bossAll').addEventListener('click', () => p4BossAnswer('all'));
  $('#p4bossTax').addEventListener('click', () => p4BossAnswer('tax'));
  $('#p4bossLater').addEventListener('click', () => p4BossAnswer('later'));
}
