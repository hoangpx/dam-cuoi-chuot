// Writes offline.json: every css, image, sound and font file of the game, for the service worker (sw.js) to keep for offline play.
// Run it whenever such a file is added, renamed or removed:  node tools/offline-list.js
// (The game scripts are not listed here: sw.js reads them from GAME_FILES in index.html.)
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const walk = d => fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(d + '/' + e.name) : [d + '/' + e.name]);
const files = [...walk('css'), ...walk('img'), ...walk('audio'), ...walk('fonts').filter(f => /\.woff2?$/.test(f)), 'manifest.webmanifest']
  .filter(f => !f.startsWith("audio/nhac-nen"))   // the chương X background track is streamed when the chapter opens, not kept for offline play
  .filter(f => /\.(css|png|jpe?g|webp|svg|wav|mp3|ogg|woff2?|webmanifest)$/i.test(f)).sort();
fs.writeFileSync(path.join(root, 'offline.json'), JSON.stringify(files, null, 1) + '\n');
console.log(files.length + ' files, ' + Math.round(files.reduce((a, f) => a + fs.statSync(path.join(root, f)).size, 0) / 1024) + ' KB');
