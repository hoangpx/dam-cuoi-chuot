/* Chương X · Ghép Chung — the connection to the shared jigsaw (server/phong-choi, class Jigsaw). One WebSocket, reconnects by itself,
   hands every message to JG_NET.on(msg). No clock sync is needed: nothing here is timed against the server. */

// ?jgws=ws://localhost:8787/jg points a local page at a local test server (never anywhere else)
const JG_URL = (new URLSearchParams(location.search).get('jgws') || '').replace(/^(?!ws:\/\/localhost:\d+\/jg$).*$/, '') || 'wss://dcc-phong-choi.dcc-phong-choi.workers.dev/jg';
const JG_LIST_URL = (JG_URL.startsWith('ws://localhost') ? JG_URL.replace(/^ws:/, 'http:').replace(/\/jg$/, '') : 'https://dcc-phong-choi.dcc-phong-choi.workers.dev') + '/jg-list';   // every print's numbers in one request
const JG_NET = {
  ws: null, pz: 'vq', up: false, tries: 0, on: () => {}, status: () => {}, hello: null, wantOn: false, retry: 0,
  send(o) { if (this.up) try { this.ws.send(JSON.stringify(o)); } catch (e) {} },
  open(hello, on, status, pz) { this.pz = pz || 'vq'; this.hello = hello; this.on = on; this.status = status; this.wantOn = true; this.connect(); },
  close() { this.wantOn = false; clearTimeout(this.retry); this.up = false; const w = this.ws; this.ws = null; if (w) { w.onclose = w.onmessage = w.onerror = null; try { w.close(); } catch (e) {} } },
  connect() {
    if (!this.wantOn || this.ws) return;
    this.status('connecting');
    let ws; try { ws = new WebSocket(JG_URL + '?p=' + encodeURIComponent(this.pz)); } catch (e) { this.lost(); return; }
    this.ws = ws;
    ws.onopen = () => { this.up = true; this.tries = 0; this.send(this.hello); };
    ws.onmessage = e => { let m; try { m = JSON.parse(e.data); } catch (x) { return; } if (m.t === 'welcome') this.status('up'); this.on(m); };
    ws.onerror = () => { if (this.ws === ws) this.lost(); };
    ws.onclose = ev => {
      if (this.ws !== ws) return;
      if (ev && (ev.code === 4003 || ev.code === 4001 || ev.code === 4005)) { this.up = false; this.wantOn = false; clearTimeout(this.retry); this.ws = null; this.status(ev.code === 4003 ? 'blocked' : ev.code === 4005 ? 'crowded' : 'replaced'); return; }   // told to go away: no retrying
      this.lost();
    };
  },
  lost() {
    this.up = false; const w = this.ws; this.ws = null; if (w) { w.onclose = w.onerror = w.onmessage = null; try { w.close(); } catch (e) {} }
    if (!this.wantOn) return;
    this.status('down'); this.tries++;
    clearTimeout(this.retry); this.retry = setTimeout(() => this.connect(), Math.min(8000, 800 * this.tries));
  },
};
