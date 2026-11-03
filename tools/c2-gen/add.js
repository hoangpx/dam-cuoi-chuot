// append specs from a JSON-ish JS file (argv[2]) into tools/c2-specs.js before the closing "];"
const fs = require('fs'), p = 'tools/c2-specs.js'; let s = fs.readFileSync(p, 'utf8');
const add = fs.readFileSync(process.argv[2], 'utf8').trim();
const i = s.lastIndexOf('\n];'); s = s.slice(0, i) + '\n' + add + s.slice(i);
fs.writeFileSync(p, s); console.log(require('../c2-specs.js').length, 'specs');
