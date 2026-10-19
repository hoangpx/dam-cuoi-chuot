/* Chương IX · Hội Làng — the connection to the shared room (server/phong-choi, a Cloudflare Durable Object).
   One WebSocket; the browser only draws and says "I pressed at this moment". Keeps a clock synced to the server (HL_NET.now()
   = the server's clock, from the lowest-latency of the last few ping samples), reconnects by itself, and hands every message
   to HL_NET.on(msg). Nothing here touches the game's saves. */

// ?hlws=ws://localhost:8787/ws points a local page at a local test server (never anywhere else)
const HL_URL = (new URLSearchParams(location.search).get('hlws') || '').replace(/^(?!ws:\/\/localhost:\d+\/ws$).*$/, '') || 'wss://dcc-phong-choi.dcc-phong-choi.workers.dev/ws';
const HL_ONLINE_URL = 'https://dcc-phong-choi.dcc-phong-choi.workers.dev/online';
const HL_NET = {
  ws: null, up: false, tries: 0, off: 0, rtt: 1e9, samples: [], id: null, on: () => {}, status: () => {}, hello: null, wantOn: false, timer: 0,
  // the server's clock now (ms since 1970), as best we can tell
  now() { return performance.now() + this.off; },
  send(o) { if (this.up) try { this.ws.send(JSON.stringify(o)); } catch (e) {} },
  open(hello, on, status) {
    this.hello = hello; this.on = on; this.status = status; this.wantOn = true; this.connect();
  },
  close() { this.wantOn = false; clearInterval(this.timer); clearTimeout(this.retry); this.up = false; const w = this.ws; this.ws = null; if (w) { w.onclose = w.onmessage = w.onerror = null; try { w.close(); } catch (e) {} } },
  connect() {
    if (!this.wantOn || this.ws) return;
    this.status('connecting');
    let ws; try { ws = new WebSocket(HL_URL); } catch (e) { this.lost(); return; }
    this.ws = ws; this.samples = []; this.rtt = 1e9;
    ws.onopen = () => {
      this.up = true; this.tries = 0; this.send(this.hello);
      for (let i = 0; i < 6; i++) setTimeout(() => this.sync(), i * 250);
      clearInterval(this.timer); this.timer = setInterval(() => this.sync(), 12000);
    };
    ws.onmessage = e => {
      let m; try { m = JSON.parse(e.data); } catch (x) { return; }
      if (m.t === 'sync') { const t = performance.now(), rtt = t - m.c; this.samples.push({ rtt, off: m.s + rtt / 2 - t }); if (this.samples.length > 8) this.samples.shift(); const b = this.samples.reduce((a, s) => s.rtt < a.rtt ? s : a); this.off = b.off; this.rtt = b.rtt; return; }
      if (m.t === 'ping') { this.send({ t: 'pong', s: m.s }); return; }
      if (m.t === 'welcome') { this.id = m.id; this.status('up'); }
      this.on(m);
    };
    ws.onclose = ws.onerror = () => { if (this.ws === ws) this.lost(); };
  },
  sync() { this.send({ t: 'sync', c: performance.now() }); },
  lost() {
    clearInterval(this.timer); this.up = false; const w = this.ws; this.ws = null; if (w) { w.onclose = w.onerror = w.onmessage = null; try { w.close(); } catch (e) {} }
    if (!this.wantOn) return;
    this.status('down'); this.tries++;
    clearTimeout(this.retry); this.retry = setTimeout(() => this.connect(), Math.min(8000, 800 * this.tries));
  },
};
