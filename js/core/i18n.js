/* Languages (owner): Vietnamese, English, German, French, Spanish, Chinese (simplified), Japanese. LANG comes from the
   player's choice (localStorage 'dcc.lang') else Vietnamese (owner). Code says lg('tiếng Việt', 'English') wherever text is
   shown; the other languages look the English up in LANG_TR (i18n-tr.js), falling back to English. lgf() is lg() with
   {name} slots, so each language puts the number where its grammar wants it. The page's own HTML is translated below
   (I18N_DOM). Changing language saves it and reloads, so every text is made again in the new language.
   Chapters translated so far: LANG_READY; the others still open in Vietnamese, with a note. */
const LANGS = ['vi', 'en', 'de', 'fr', 'es', 'zh', 'ja'];
const LANG_NAME = { vi: 'Tiếng Việt', en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español', zh: '中文', ja: '日本語' };
const LANG = (() => {
  try { const s = localStorage.getItem('dcc.lang'); if (LANGS.includes(s)) return s; } catch (e) {}
  return 'vi';                                                                 // owner: Vietnamese unless the player picks another
})();
const IS_EN = LANG !== 'vi';                                                   // "not Vietnamese": English or a language made from it
const LANG_LOCALE = { vi: 'vi-VN', en: 'en-GB', de: 'de-DE', fr: 'fr-FR', es: 'es-ES', zh: 'zh-CN', ja: 'ja-JP' }[LANG];
const tr = en => Array.isArray(en) ? en.map(tr) : LANG === 'en' || LANG === 'vi' ? en : ((LANG_TR[LANG] || {})[en] ?? en);
const lg = (vi, en) => (IS_EN && en != null ? tr(en) : vi);
const lgf = (vi, en, v) => lg(vi, en).replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m);
const LANG_READY = new Set([3, 6]);
function setLang(l) { try { localStorage.setItem('dcc.lang', l); } catch (e) {} location.reload(); }
document.documentElement.lang = LANG;
// the page's HTML in English: [selector, inner HTML, attribute (optional: set that attribute instead)]
const I18N_DOM = [
  ['#cv', 'The Mouse Wedding', 'aria-label'],
  ['#bL', 'Walk left', 'aria-label'], ['#bR', 'Walk right', 'aria-label'],
  ['#chapters .sheet > p:not(.how)', 'Each chapter is a different game, all in the style of Đông Hồ woodblock prints and Vietnamese folk tales.'],
  ['#bCloud span', 'Save progress'], ['#bInstall', 'Add to home screen'],
  ['#aGroup span', 'Đám Cưới Chuột Facebook group: feedback, bugs, ideas for new stories'],
  ['#chapters .sheet > p.how', '© 2026 Đám Cưới Chuột · The Mouse Wedding · damcuoichuot.com · all rights reserved'],
  ['#cloud h2', 'Save progress'],
  ['#cloudIntro', 'Make a save code to keep your progress online. New phone, another computer, or a cleared browser: just type the code and play on. No account needed.'],
  ['#bCloudMake', 'Make a save code'], ['#cloudHave > p:first-child', 'Your save code:'], ['#bCloudCopy', 'Copy code'],
  ['#cloudHave .how', 'Write this code down. The game saves online after every picture or level you finish. <span id="cloudSt"></span>'],
  ['#cloud .sub', 'Have a save code from another device?'], ['#bCloudLoad', 'Load'], ['#bCloudClose', 'Close'],
  ['#instTitle', 'Add to home screen'], ['#install .sheet > p', 'Put the game on your home screen to open it like an app: full screen, no address bar.'],
  ['#bInstNow', 'Install now'], ['#bInstClose', 'Got it'],
  ['#bChapTop', 'Back to chapters', 'aria-label'], ['#bChapTop', 'Back to chapters', 'title'],
  ['#albumTitle', 'Picture album'], ['#bChap', '← Chapters'],
  ['#bNext', 'Next picture'], ['#bAlbum', 'Back to album'], ['#bRetry', 'Play again'],
];
if (IS_EN) for (const [sel, html, attr] of I18N_DOM) { const el = document.querySelector(sel); if (!el) continue; if (attr) el.setAttribute(attr, tr(html)); else el.innerHTML = tr(html); }
// the language switch (owner): the current flag in the top corner of the chapter list; tapping it opens every flag
const LANG_FLAG = {
  vi: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#da251d"/><path d="M15 4.2l1.35 4.15h4.37l-3.53 2.57 1.35 4.15L15 12.5l-3.54 2.57 1.35-4.15-3.53-2.57h4.37z" fill="#ffde00"/></svg>',
  en: '<svg viewBox="0 0 60 40"><clipPath id="ukc"><rect width="60" height="40"/></clipPath><g clip-path="url(#ukc)"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#c8102e" stroke-width="3"/><path d="M30 0v40M0 20h60" stroke="#fff" stroke-width="12"/><path d="M30 0v40M0 20h60" stroke="#c8102e" stroke-width="7"/></g></svg>',
  de: '<svg viewBox="0 0 30 20"><rect width="30" height="7" fill="#000"/><rect y="6.67" width="30" height="6.67" fill="#dd0000"/><rect y="13.33" width="30" height="6.67" fill="#ffce00"/></svg>',
  fr: '<svg viewBox="0 0 30 20"><rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ef4135"/></svg>',
  es: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#aa151b"/><rect y="5" width="30" height="10" fill="#f1bf00"/></svg>',
  zh: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#de2910"/><g fill="#ffde00"><path d="M5 2.2l.9 2.7h2.8l-2.3 1.7.9 2.7L5 7.6 2.7 9.3l.9-2.7-2.3-1.7h2.8z"/><circle cx="10" cy="2" r=".8"/><circle cx="12" cy="4" r=".8"/><circle cx="12" cy="7" r=".8"/><circle cx="10" cy="9" r=".8"/></g></svg>',
  ja: '<svg viewBox="0 0 30 20"><rect width="30" height="20" fill="#fff"/><circle cx="15" cy="10" r="6" fill="#bc002d"/></svg>',
};
{
  const sheet = document.querySelector('#chapters .sheet');
  if (sheet) {
    const box = document.createElement('div'); box.id = 'langFlags';
    const cur = document.createElement('button'); cur.className = 'flag'; cur.innerHTML = LANG_FLAG[LANG]; cur.title = cur.ariaLabel = LANG_NAME[LANG];
    const menu = document.createElement('div'); menu.className = 'langMenu'; menu.hidden = true;
    for (const l of LANGS) {
      const b = document.createElement('button'); b.className = 'lang' + (l === LANG ? ' here' : ''); b.innerHTML = `<i class="flag">${LANG_FLAG[l]}</i><span>${LANG_NAME[l]}</span>`;
      b.addEventListener('click', e => { e.stopPropagation(); menu.hidden = true; if (l !== LANG) setLang(l); });
      menu.appendChild(b);
    }
    cur.addEventListener('click', e => { e.stopPropagation(); menu.hidden = !menu.hidden; });
    document.addEventListener('click', () => { menu.hidden = true; });
    box.append(cur, menu); sheet.appendChild(box);
  }
}
