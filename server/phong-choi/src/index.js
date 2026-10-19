/* Phòng chơi chung của Đám Cưới Chuột (chương X · Hội Làng), chạy trên Cloudflare Durable Objects.
   MỘT phòng cho tất cả (idFromName('main')). Máy chủ giữ giờ chung, lịch các ván, người máy và kết quả; trình duyệt chỉ vẽ
   và gửi "tôi bấm lúc này". Mọi thưởng ở đây là tiền trong game (vào túi chương IV), không phải tiền thật.

   Vòng chơi (lặp mãi khi còn người trong phòng): thông báo ván (4 s, chốt danh sách người chơi) → chơi → kết quả (9 s) → ván sau.
   Hai ván xen kẽ:
     'ten'    đồng hồ chạy 0,1,2,3 giây rồi bị che; ai bấm gần mốc 10,000 s nhất thắng (thưởng 10 × số người chơi).
     'pomelo' mỗi người một quả bưởi treo dây rơi xuống đầu (nhanh dần); ai bấm dừng gần đầu mình nhất mà chưa trúng thì thắng.
   Người vào giữa ván chỉ xem, ván sau được xếp chỗ. Ít hơn MINP người thì có người máy chơi cùng (hiện rõ là máy).

   Giao thức JSON qua WebSocket (client → server): hello {name, sort}, sync {c}, pong {s}, press {n, at}.
   server → client: welcome, players, round, press, result, sync, ping. */
import { DurableObject } from 'cloudflare:workers';

const ORIGIN_OK = /^(https:\/\/(www\.)?damcuoichuot\.com|http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?|null)$/;
const BAD = /(địt|đụ|lồn|buồi|cặc|đéo|đĩ |đỉ |fuck|shit|bitch|óc chó|chó đẻ|mẹ mày|con mẹ mày|bố mày)/i;
const BOT_NAMES = ['Tí', 'Tèo', 'Mít', 'Bơ', 'Nhím', 'Sóc', 'Cốm', 'Bống', 'Tũn', 'Xíu', 'Na', 'Bin', 'Đậu', 'Lạc', 'Gạo', 'Nếp', 'Ngô', 'Khoai'];

const T = {
  MINP: 6,            // fewer players than this and bots fill the seats
  MAXP: 30,           // seats per round; more people than that watch and take turns
  ANNOUNCE: 4000, RESULT: 9000, FIRST: 3000,
  TEN_TARGET: 10000, TEN_SHOW: 3000, TEN_GRACE: 3200,
  POM_MIN: 2000, POM_SPAN: 1500, POM_GRACE: 700,
  PAY: 10,            // đồng per player in the round, to the winner
  MAXMSG: 25,         // messages a second from one connection
};
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

export default {
  async fetch(req, env) {
    const u = new URL(req.url);
    if (u.pathname === '/ws') {
      if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
      const o = req.headers.get('Origin') || 'null';
      if (!ORIGIN_OK.test(o)) return new Response('forbidden', { status: 403 });
      return env.ROOM.get(env.ROOM.idFromName('main')).fetch(req);
    }
    return new Response('Đám Cưới Chuột · phòng chơi chung', { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  },
};

export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.conns = new Map();    // id → connection
    this.round = null;
    this.n = 0;
    this.last = 'pomelo';       // the game before, so the first round is 'ten'
    this.timer = null;
    this.nextId = 1;
  }

  async fetch() {
    const pair = new WebSocketPair(), [client, server] = Object.values(pair);
    server.accept();
    const c = { ws: server, id: 'p' + (this.nextId++), name: '', sort: 0, joined: false, rtt: 150, score: 0, won: 0, seen: Date.now(), win: 0, cnt: 0 };
    this.conns.set(c.id, c);
    server.addEventListener('message', e => this.onMsg(c, e.data));
    server.addEventListener('close', () => this.onClose(c));
    server.addEventListener('error', () => this.onClose(c));
    return new Response(null, { status: 101, webSocket: client });
  }

  send(c, o) { try { c.ws.send(JSON.stringify(o)); } catch (e) {} }
  all(o) { const s = JSON.stringify(o); for (const c of this.conns.values()) if (c.joined) { try { c.ws.send(s); } catch (e) {} } }
  humans() { return [...this.conns.values()].filter(c => c.joined); }

  onMsg(c, raw) {
    const now = Date.now();
    if (now - c.win > 1000) { c.win = now; c.cnt = 0; } if (++c.cnt > T.MAXMSG) return;
    c.seen = now;
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    if (!m || typeof m.t !== 'string') return;
    if (m.t === 'hello' && !c.joined) {
      let name = String(m.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
      if (!name || BAD.test(name)) name = 'Chuột ' + c.id.slice(1);
      c.name = name; c.sort = Math.max(0, Math.min(40, m.sort | 0)); c.joined = true;
      this.send(c, { t: 'welcome', id: c.id, now: Date.now(), round: this.pubRound(), players: this.playerList() });
      this.all({ t: 'players', players: this.playerList() });
      this.wake();
    } else if (m.t === 'sync') this.send(c, { t: 'sync', c: m.c, s: Date.now() });
    else if (m.t === 'pong') { const r = Date.now() - (+m.s || 0); if (r >= 0 && r < 5000) c.rtt = c.rtt * .6 + r * .4; }
    else if (m.t === 'press' && c.joined) this.onPress(c, m);
  }
  onClose(c) {
    if (!this.conns.delete(c.id)) return;
    if (c.joined) this.all({ t: 'players', players: this.playerList() });
    if (!this.humans().length) this.stop();
  }
  playerList() {
    const r = this.round, seated = r ? r.seated : null;
    return [...this.humans().map(c => ({ id: c.id, name: c.name, sort: c.sort, bot: false, seat: !!(seated && seated.has(c.id)), score: c.score, won: c.won })),
      ...(r ? [...r.bots.values()].map(b => ({ id: b.id, name: b.name, sort: b.sort, bot: true, seat: true, score: 0, won: 0 })) : [])];
  }
  pubRound() {
    const r = this.round; if (!r) return null;
    return { n: r.n, game: r.game, announce: r.announce, t0: r.t0, state: r.state, seated: [...r.seated.keys()], tf: r.tf, presses: [...r.press.entries()].map(([id, p]) => ({ id, p: r.game === 'pomelo' ? p.p : undefined, hit: p.hit })), result: r.state === 'result' ? r.result : undefined };
  }

  /* ---- the schedule ---- */
  wake() { if (!this.timer) { this.timer = setInterval(() => this.tick(), 100); if (!this.round) this.startRound(Date.now() + T.FIRST); } }
  stop() { clearInterval(this.timer); this.timer = null; this.round = null; }
  tick() {
    const now = Date.now();
    for (const c of [...this.conns.values()]) {   // drop dead connections; ping the rest
      if (now - c.seen > 20000) { try { c.ws.close(1001, 'idle'); } catch (e) {} this.onClose(c); }
    }
    if (!this.timer) return;
    if (now - (this.pingAt || 0) > 4000) { this.pingAt = now; for (const c of this.conns.values()) this.send(c, { t: 'ping', s: now }); }
    const r = this.round; if (!r) return;
    if (r.state === 'announce' && now >= r.t0) r.state = 'run';
    if (r.state === 'run') {
      for (const b of r.bots.values()) if (!r.press.has(b.id) && now >= r.t0 + b.p) this.record(r, b.id, b.p, b.hit);
      if (r.state === 'run' && this.finished(r, now)) this.finish(r);
    } else if (r.state === 'result' && now >= r.next) this.startRound(now + 200);
  }
  startRound(at) {
    const hs = this.humans(); if (!hs.length) { this.stop(); return; }
    const game = this.last === 'ten' ? 'pomelo' : 'ten'; this.last = game;
    const seated = new Map(); for (const c of hs.slice(0, T.MAXP)) seated.set(c.id, c);
    const bots = new Map(); for (let i = seated.size, k = 0; i < T.MINP; i++, k++) { const id = 'b' + (k + 1); bots.set(id, { id, name: BOT_NAMES[(this.n * 3 + k * 5) % BOT_NAMES.length], sort: (this.n + k * 7) % 27, sigma: rnd(70, 300), aim: rnd(.02, .3), risky: Math.random() < .12 }); }
    const r = { n: ++this.n, game, announce: at, t0: at + T.ANNOUNCE, state: 'announce', seated, bots, tf: {}, press: new Map() };
    const ids = [...seated.keys(), ...bots.keys()];
    if (game === 'pomelo') for (const id of ids) r.tf[id] = Math.round(rnd(T.POM_MIN, T.POM_MIN + T.POM_SPAN));
    for (const b of bots.values()) {   // the bots decide now when they will press (ms after t0)
      if (game === 'ten') { b.p = Math.round(T.TEN_TARGET + gauss() * b.sigma); b.hit = false; }
      else { b.hit = b.risky; b.p = Math.round(b.hit ? r.tf[b.id] + 50 : r.tf[b.id] * Math.sqrt(1 - b.aim)); }
    }
    r.deadline = game === 'ten' ? r.t0 + T.TEN_TARGET + T.TEN_GRACE : r.t0 + Math.max(...Object.values(r.tf)) + T.POM_GRACE;
    this.round = r;
    this.all({ t: 'players', players: this.playerList() });
    this.all({ t: 'round', ...this.pubRound(), seatInfo: [...seated.values()].map(c => ({ id: c.id, name: c.name, sort: c.sort })), bots: [...bots.values()].map(b => ({ id: b.id, name: b.name, sort: b.sort })) });
  }
  onPress(c, m) {
    const r = this.round, now = Date.now();
    if (!r || r.state !== 'run' || m.n !== r.n || !r.seated.has(c.id) || r.press.has(c.id)) return;
    const lat = Math.max(0, Math.min(1500, c.rtt / 2));
    let at = +m.at;   // the browser's estimate of the server clock at the moment of the press; trusted only within what the measured latency allows
    if (!isFinite(at) || at > now + 30 || now - at > lat + 150) at = now - lat;
    const p = Math.round(at - r.t0); if (p < 0) return;
    this.record(r, c.id, p, r.game === 'pomelo' && p >= r.tf[c.id]);
    if (r.state === 'run' && this.finished(r, now)) this.finish(r);
  }
  record(r, id, p, hit) {
    r.press.set(id, { p, hit: !!hit });
    this.all({ t: 'press', n: r.n, id, p: r.game === 'pomelo' ? p : undefined, hit: r.game === 'pomelo' ? !!hit : undefined });
  }
  finished(r, now) {
    if (now >= r.deadline) return true;
    for (const id of r.seated.keys()) if (!r.press.has(id)) return false;
    for (const id of r.bots.keys()) if (!r.press.has(id)) return false;
    return true;
  }
  finish(r) {
    const rows = [];
    for (const id of [...r.seated.keys(), ...r.bots.keys()]) {
      const pr = r.press.get(id);
      if (r.game === 'ten') rows.push({ id, v: pr ? pr.p - T.TEN_TARGET : null, hit: false });
      else if (!pr || pr.hit) rows.push({ id, v: null, hit: true });
      else rows.push({ id, v: 1 - (pr.p / r.tf[id]) ** 2, hit: false, p: pr.p });
    }
    const ok = rows.filter(x => x.v !== null).sort((a, b) => (r.game === 'ten' ? Math.abs(a.v) - Math.abs(b.v) : a.v - b.v));
    ok.forEach((x, i) => { x.rank = i + 1; });
    const N = r.seated.size + r.bots.size, winner = ok.length ? ok[0].id : null, prize = T.PAY * N;
    const w = winner && r.seated.get(winner);
    if (w) { w.score += prize; w.won++; }
    r.state = 'result'; r.next = Date.now() + T.RESULT;
    r.result = { rows: [...ok, ...rows.filter(x => x.v === null)], winner, prize: w ? prize : 0, N };
    this.all({ t: 'result', n: r.n, game: r.game, ...r.result, next: r.next });
    this.all({ t: 'players', players: this.playerList() });
  }
}
