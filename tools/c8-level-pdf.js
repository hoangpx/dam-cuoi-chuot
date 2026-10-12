/* Chương VIII: a PDF guide to one of our own levels (tools/c8-own-levels.js), for the owner to review: the level as it looks in the
   game, how hard it is (tools/c8-hardness.js), the answer one swipe at a time with real screenshots (the chain drawn as the player sees
   it, then the board after it settles), the mouse's road to the chest (from the real engine, tools/c8-engine-test.js) and the trap.
   Texts come from the level's `guide` { idea, steps[], route, trap } (Vietnamese); without one, plain lines are written from the plan.
   Serves the repo on a local port, drives the game with Playwright (global install; Google Fonts through the corporate proxy), prints with Chromium.
   The PDF holds the solution, so it goes to huong-dan-c8/ (excluded from git: the site is public).
   node tools/c8-level-pdf.js "<en name>" [out.pdf] */
const fs = require('fs'), path = require('path'), http = require('http'), { execSync } = require('child_process');
const { run } = require('./c8-engine-test.js'), { hardness } = require('./c8-hardness.js');
const ROOT = path.join(__dirname, '..'), en = process.argv[2], L = require('./c8-own-levels.js').find(l => l.en === en);
if (!L) { console.log('no own level named ' + JSON.stringify(en)); process.exit(1); }
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const KIND = { a: 'lửa', b: 'xoáy vàng', c: 'lá', d: 'chum nước', i: 'băng', v: 'nước', r: 'đá', o: 'xoáy nét đứt' };
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
if (!L.plan) { console.log('this level has rock pushes (level.moves): the picture guide only knows swipe-only levels so far; its answer is in tools/c8-own-levels.js'); process.exit(1); }
const swipes = L.plan.map(s => s.swipe), traps = L.traps || (L.trap ? [L.trap] : []);

function serve() {
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
  const srv = http.createServer((q, s) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s); });
  return new Promise(ok => srv.listen(0, '127.0.0.1', () => ok(srv)));
}

(async () => {
  const idx = (() => { const vm = require('vm'), ctx = {}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(path.join(ROOT, 'js/ch8/levels.js'), 'utf8').replace('const C8_LEVELS', 'C8_LEVELS'), ctx);
    return ctx.C8_LEVELS.findIndex(l => l.en === en && l.map.join() === L.map.join()); })();
  if (idx < 0) { console.log('level not in js/ch8/levels.js (or its map differs): run node tools/c8-ref-levels.js --nocheck --write'); process.exit(1); }
  const h = hardness(L.map, { mp: 8, strict: true, maxDepth: 6, cap: 400000 });
  const road = run(L.map, swipes, { cap: 40000, depth: 150, human: true, handicap: true });
  if (!road.won) { console.log('the plan does not win in the engine: check the level first (tools/c8-own-check.js)'); process.exit(1); }

  const srv = await serve(), port = srv.address().port, proxy = process.env.https_proxy || 'http://corpgate.labcorp.com:8080';
  const browser = await chromium.launch({ proxy: { server: proxy, bypass: '127.0.0.1,localhost' } });
  const page = await browser.newPage({ viewport: { width: 1100, height: 640 }, deviceScaleFactor: 2 });
  await page.goto(`http://127.0.0.1:${port}/?c8all`); await page.waitForFunction(() => typeof startC8 === 'function' && typeof C8_LEVELS !== 'undefined', null, { timeout: 60000 });
  await page.waitForTimeout(2500); await page.evaluate(i => { localStorage.clear(); startC8(i); }, idx); await page.waitForTimeout(1500);
  const shot = async () => 'data:image/png;base64,' + (await page.screenshot({ type: 'png' })).toString('base64');
  const settle = () => page.evaluate(async () => { for (let k = 0; k < 300 && c8Moving(C8.G); k++) await new Promise(r => setTimeout(r, 30)); for (let k = 0; k < 80 && C8.fx && C8.fx.length; k++) await new Promise(r => setTimeout(r, 30)); await new Promise(r => setTimeout(r, 300)); });   // settled and the swipe's dust gone
  const shots = { start: await shot(), steps: [] };
  for (const s of swipes) {
    await page.evaluate(s => { const G = C8.G; G.sel = []; for (const [x, y] of s) c8Reach(G, y * G.W + x); }, s); await page.waitForTimeout(250);
    const drag = await shot(); await page.evaluate(() => c8Let(C8.G)); await settle(); shots.steps.push({ drag, after: await shot() });
  }
  // the road: the engine's trail (cells, the mouse's feet) drawn over the last board
  const view = await page.evaluate(() => ({ cs: C8.view.cs, cx: C8.cam.x, cy: C8.cam.y, gx: C8.G.goal.x, gy: C8.G.goal.y }));
  // the trail is sampled every 6 frames: end it on the chest, where the win fires
  const pts = road.trail.concat([[view.gx + .5, view.gy + 1]]).map(([x, y]) => [((x * view.cs - view.cx)).toFixed(1), ((y - .4) * view.cs - view.cy).toFixed(1)].join(',')).join(' ');
  let trapShot = null, trapDrag = null;
  if (traps.length) { await page.evaluate(i => startC8(i), idx); await page.waitForTimeout(1200);
    await page.evaluate(s => { const G = C8.G; G.sel = []; for (const [x, y] of s) c8Reach(G, y * G.W + x); }, traps[0]); await page.waitForTimeout(250);
    trapDrag = await shot(); await page.evaluate(() => c8Let(C8.G)); await settle(); trapShot = await shot(); }
  await browser.close(); srv.close();

  const G0 = L.map.join(''), count = {}; for (const ch of G0) if (KIND[ch]) count[ch] = (count[ch] || 0) + 1;
  const kindOf = s => KIND[L.map[s[0][1]][s[0][0]]] || '?';
  const stepText = (s, i) => (L.guide && L.guide.steps && L.guide.steps[i]) || `Gom ${s.length} ô ${kindOf(s)}.`;
  const cells = s => s.map(([x, y]) => `(${x},${y})`).join(' → ');
  const g = L.guide || {}, W = 1100, Hh = 640;
  const img = (src, overlay) => `<div class="pic"><img src="${src}">${overlay ? `<svg viewBox="0 0 ${W} ${Hh}"><polyline points="${pts}" /></svg>` : ''}</div>`;
  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Be+Vietnam+Pro:wght@400;600&display=swap">
<style>
@page { size: A4; margin: 14mm 13mm; }
body { font-family: 'Be Vietnam Pro', sans-serif; color: #2a1d14; font-size: 10.5pt; line-height: 1.5; }
h1, h2 { font-family: 'Playfair Display', serif; margin: 0 0 4px; } h1 { font-size: 22pt; color: #8f2a1f; } h2 { font-size: 13.5pt; margin-top: 14px; color: #5b2f1f; }
.sub { color: #7a6553; margin-bottom: 10px; } .box { background: #f6efe0; border: 1px solid #d8c7a6; border-radius: 6px; padding: 8px 12px; margin: 8px 0; }
table { border-collapse: collapse; font-size: 9.5pt; } td { padding: 2px 10px 2px 0; } td:first-child { color: #7a6553; }
.pic { position: relative; margin: 6px 0 4px; } .pic img { width: 100%; border: 1px solid #c9b48e; border-radius: 4px; display: block; }
.pic svg { position: absolute; inset: 0; width: 100%; height: 100%; } .pic polyline { fill: none; stroke: #c0392b; stroke-width: 5; stroke-dasharray: 10 7; stroke-linecap: round; stroke-linejoin: round; }
.step { page-break-inside: avoid; } .two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; } .cap { font-size: 8.5pt; color: #7a6553; }
.cells { font-family: monospace; font-size: 8.5pt; color: #5b2f1f; } .warn { background: #f9e3dc; border-color: #e0a796; } .page { page-break-before: always; }
</style></head><body>
<h1>Màn ${idx + 1} · ${esc(L.name)}</h1><div class="sub">${esc(L.en)} · Chương VIII · Gom Ba Mở Lối · hướng dẫn cho chủ game (có lời giải, không đưa vào game)</div>
${img(shots.start)}<div class="cap">Màn chơi lúc bắt đầu.</div>
<h2>Ý tưởng</h2><div class="box">${esc(g.idea || 'Màn tự làm cho chương VIII.')}</div>
<h2>Thông số</h2><table>
<tr><td>Kích thước</td><td>${L.map[0].length} × ${L.map.length} ô</td></tr>
<tr><td>Vật</td><td>${Object.entries(count).map(([k, n]) => `${n} ${KIND[k]}`).join(', ')} (tổng ${Object.values(count).reduce((a, b) => a + b, 0)})</td></tr>
<tr><td>Số lần gom</td><td>${swipes.length}</td></tr>
<tr><td>Nước đi đúng</td><td>${h.steps ? h.steps.split(' ').map((s, i) => `lần ${i + 1}: ${s.replace('/', ' trên ')}`).join(' · ') : '?'}</td></tr>
<tr><td>Số đường thắng</td><td>${h.roads}</td></tr>
<tr><td>Nước mở đầu "chết"</td><td>${Math.round(h.deadFirst * 100)} % (sau đó không thể thắng)</td></tr>
<tr><td>Chơi bừa mà thắng</td><td>${(h.pRandom * 100).toFixed(3)} %</td></tr>
</table>
<h2 class="page">Lời giải</h2>
${swipes.map((s, i) => `<div class="step"><h2>Bước ${i + 1}: gom ${s.length} ô ${kindOf(s)}</h2><div class="box">${esc(stepText(s, i))}</div>
<div class="two"><div>${img(shots.steps[i].drag)}<div class="cap">Kéo theo đường vàng, thả tay.</div></div><div>${img(shots.steps[i].after)}<div class="cap">Sau khi rơi xong.</div></div></div>
<div class="cells">Ô (x, y), theo thứ tự kéo: ${cells(s)}</div></div>`).join('\n')}
<div class="step"><h2>Đường của chuột tới rương</h2><div class="box">${esc(g.route || 'Đi theo đường chấm đỏ tới rương.')}</div>${img(shots.steps[shots.steps.length - 1].after, true)}<div class="cap">Đường chấm đỏ: đường chuột đi trong engine thật (người chơi vụng cũng đi được: không cần bấm đúng từng khung hình).</div></div>
${trapShot ? `<div class="step"><h2>Bẫy</h2><div class="box warn">${esc(g.trap || 'Nước đi dễ thấy nhưng sai.')}</div><div class="two"><div>${img(trapDrag)}<div class="cap">Nước đi sai, dễ thấy.</div></div><div>${img(trapShot)}<div class="cap">Sau đó không còn đường lên.</div></div></div><div class="cells">Ô (x, y): ${cells(traps[0])}</div></div>` : ''}
</body></html>`;

  const out = process.argv[3] || path.join(ROOT, 'huong-dan-c8', `man-${idx + 1}-${slug(L.name)}.pdf`); fs.mkdirSync(path.dirname(out), { recursive: true });
  const b2 = await chromium.launch({ proxy: { server: proxy, bypass: '127.0.0.1,localhost' } }), p2 = await b2.newPage();
  if (process.env.HTML) fs.writeFileSync(out.replace(/\.pdf$/, '.html'), html);   // HTML=1 also keeps the page, to look at it in a browser
  await p2.setContent(html, { waitUntil: 'networkidle' }); await p2.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true }); await b2.close();
  console.log('wrote ' + out);
})().catch(e => { console.error(e); process.exit(1); });
