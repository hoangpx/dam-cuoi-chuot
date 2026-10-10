/* Báo có bản mới (owner, 2026-10-10): a game left open, or saved to the home screen with no refresh button, never fetches the new page by itself.
   So now and then (coming back to it, and every 15 minutes) the page asks the server for index.html and reads the VERSION from the loader
   there. If it differs from the one running, a small card offers two choices: "Cập nhật" (reloads; progress is saved as it is played, and the cloud
   code, if any, brings the rest) or "Để sau" (not asked again for that version until the game is opened afresh).
   The fetch uses cache: 'reload', which also refreshes the browser's own copy, so the reload really gets the new page. */
(function () {
  if (typeof VERSION === 'undefined') return;
  const card = document.createElement('div'); card.id = 'upd'; card.hidden = true;
  card.innerHTML = '<p></p><div class="row"><button class="btn" data-a="go"></button><button class="btn alt" data-a="skip"></button></div>';
  document.body.appendChild(card);
  const say = (vi, en) => (typeof lg === 'function' ? lg(vi, en) : vi);
  let busy = false, last = 0, offered = null;
  const skipped = () => { try { return sessionStorage.getItem('dcc.updSkip'); } catch (e) { return null; } };
  function show(v) {
    offered = v;
    card.querySelector('p').textContent = say('Có bản mới của game. Cập nhật bây giờ nhé? Tiến trình đã lưu vẫn còn.', 'A new version of the game is out. Update now? Your saved progress stays.');
    card.querySelector('[data-a=go]').textContent = say('Cập nhật', 'Update'); card.querySelector('[data-a=skip]').textContent = say('Để sau', 'Later');
    card.hidden = false;
  }
  card.addEventListener('click', e => {
    const a = e.target && e.target.dataset && e.target.dataset.a; if (!a) return;
    if (a === 'skip') { try { sessionStorage.setItem('dcc.updSkip', offered); } catch (err) {} card.hidden = true; return; }
    try { if (typeof cloudPush === 'function' && typeof cloudCode === 'function' && cloudCode()) cloudPush(true); } catch (err) {}   // whatever is still waiting goes up first
    setTimeout(() => location.reload(), 200);
  });
  async function check() {
    if (busy || !card.hidden || Date.now() - last < 60000) return; last = Date.now(); busy = true;
    try {
      const r = await fetch(location.pathname, { cache: 'reload' }), t = await r.text(), m = t.match(/const VERSION = '([^']+)'/);
      if (m && m[1] !== VERSION && m[1] !== skipped()) show(m[1]);
    } catch (e) {}
    busy = false;
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  setInterval(() => { if (!document.hidden) check(); }, 15 * 60 * 1000);
  setTimeout(check, 20000);                                                    // a page opened from a stale copy learns of it soon
  window.updCheck = () => { last = 0; return check(); };                      // (tests)
})();
