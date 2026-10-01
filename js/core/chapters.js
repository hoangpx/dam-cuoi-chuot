/* Chapter registry. Every chapter is a separate game that plugs in here:
     registerChapter({
       id, card: { num, han, name, desc, bg }, progress() → text on its card,
       modes: [...S.mode values it owns while playing],   cover: true for the one drawn behind menus,
       boot(), playFirst() → where a brand-new player starts (cover chapter only), hasProgress() → any saved progress,
       album() → fill #cards and the album titles, hide() → tear down its own HUD,
       update(dt), render(), key(e), pointer: { down(e), move(e), up(e) },
       next(), retry()  → end-screen buttons, locked() → true to show its card greyed and closed (optional),
       direct() → start it straight from its chapter card, no album (optional),
       hidden() → true to leave its card out of the picker (optional), lockText → the greyed card's note (default "Sắp mở"),
     })
   Menus, the loop and input only ever talk to chapters through this object. */

const CHAPTERS = [];
function registerChapter(c) { CHAPTERS.push(c); CHAPTERS.sort((a, b) => a.id - b.id); }
const chapterById = id => CHAPTERS.find(c => c.id === id);
const coverChapter = () => CHAPTERS.find(c => c.cover) || CHAPTERS[0];
const activeChapter = () => CHAPTERS.find(c => c.modes.includes(S.mode)) || coverChapter();
function hideChapterHuds() { for (const c of CHAPTERS) if (c.hide) c.hide(); }
