/* Chơi không cần mạng (owner, 2026-10-14: the Android app must play offline and update itself when online).
   A service worker keeps the whole game (~4 MB) in the phone:
   - the page (index.html): network first (4 s), else the kept copy, so a new VERSION is picked up whenever there is a connection;
   - game scripts (loaded as file?v=VERSION): kept for good once fetched; whenever a page with a new VERSION comes in, every script
     of its GAME_FILES is fetched in the background, so the whole new version is there before the next time offline, and scripts of
     older versions are dropped;
   - everything else of ours (css, images, sounds, fonts: listed in offline.json, made by tools/offline-list.js) and Google Fonts:
     the kept copy at once, refreshed in the background.
   Bump CACHE only to throw everything away. */
const CACHE = 'dcc-1';
const ROOT = new URL('./', self.location).href;

const isPage = req => req.mode === 'navigate' || req.url === ROOT || req.url === ROOT + 'index.html';

async function keepVersion(html) {
  const v = (html.match(/const VERSION = '([^']+)'/) || [])[1], files = (html.match(/const GAME_FILES = \[([\s\S]*?)\]/) || [])[1];
  if (!v || !files) return;
  const c = await caches.open(CACHE), want = files.match(/'[^']+'/g).map(s => ROOT + s.slice(1, -1) + '?v=' + v);
  await Promise.all(want.map(async u => { if (!(await c.match(u))) { try { const r = await fetch(u); if (r.ok) await c.put(u, r); } catch (e) {} } }));
  for (const req of await c.keys()) { const m = req.url.match(/\?v=(.+)$/); if (m && decodeURIComponent(m[1]) !== v && req.url.startsWith(ROOT + 'js/')) await c.delete(req); }
}
async function keepStatic() {
  try {
    const list = await (await fetch(ROOT + 'offline.json', { cache: 'no-store' })).json(), c = await caches.open(CACHE);
    await Promise.all(list.map(async f => { const u = ROOT + f; if (!(await c.match(u))) { try { const r = await fetch(u); if (r.ok) await c.put(u, r); } catch (e) {} } }));
  } catch (e) {}
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    try { const r = await fetch(ROOT, { cache: 'no-store' }); if (r.ok) { const c = await caches.open(CACHE); await c.put(ROOT, r.clone()); await keepVersion(await r.text()); } } catch (e) {}
    await keepStatic();
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const ours = req.url.startsWith(ROOT), fonts = url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com';
  if (!ours && !fonts) return;                                                 // the cloud save, counters…: straight to the network
  if (ours && isPage(req)) { e.respondWith(page(e)); return; }
  if (ours && url.search.startsWith('?v=')) { e.respondWith(keptFirst(req)); return; }
  if (ours && !/\.(js|css|png|jpe?g|webp|svg|wav|mp3|ogg|woff2?|json|webmanifest|ico)$/i.test(url.pathname)) return;   // (anything else, e.g. v1/, as usual)
  e.respondWith(keptThenRefresh(e));
});

async function page(e) {
  const c = await caches.open(CACHE);
  const net = fetch(e.request.url === ROOT + 'index.html' ? e.request : ROOT, { cache: 'no-store' }).then(async r => {
    if (r.ok) { await c.put(ROOT, r.clone()); const t = await r.clone().text(); e.waitUntil(keepVersion(t).then(keepStatic)); }
    return r;
  });
  const kept = await c.match(ROOT);
  if (!kept) return net.catch(() => new Response('Cần có mạng để mở game lần đầu.', { headers: { 'content-type': 'text/plain; charset=utf-8' } }));
  const late = new Promise(res => setTimeout(() => res(kept), 4000));      // a slow network: play the kept copy, the new one is kept for next time
  return Promise.race([net.catch(() => kept), late]);
}
async function keptFirst(req) {
  const c = await caches.open(CACHE), hit = await c.match(req); if (hit) return hit;
  const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r;
}
async function keptThenRefresh(e) {
  const req = e.request, c = await caches.open(CACHE), hit = await c.match(req, { ignoreSearch: req.url.startsWith(ROOT) });
  const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; });
  if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
  return net;
}
