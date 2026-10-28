// node worker/test.js — plays the hub with fake sockets
import { Hub } from './src/hub.js';
import assert from 'node:assert/strict';
const h = new Hub(), mk = () => { const s = { out: [], send(x) { this.out.push(JSON.parse(x)); }, close() { this.closed = true; } }; h.add(s); return s; };
const last = (s, t) => [...s.out].reverse().find(m => m.t === t);
const J = JSON.stringify;
const a = mk(), b = mk(), c = mk();
h.message(a, J({ t: 'hello', id: 'aaaaaaaa', name: 'An', friends: ['bbbbbbbb'] }));
h.message(b, J({ t: 'hello', id: 'bbbbbbbb', name: 'Bình', friends: ['aaaaaaaa'] }));
assert.equal(last(a, 'on').id, 'bbbbbbbb');                                   // a's friend came online
assert.deepEqual(last(b, 'welcome').online, ['aaaaaaaa']);
h.message(a, J({ t: 'room', room: 'lang', x: 3, y: 4 }));
h.message(b, J({ t: 'room', room: 'lang', x: 5, y: 6 }));
assert.equal(last(b, 'room').peers[0].id, 'aaaaaaaa'); assert.equal(last(a, 'came').p.name, 'Bình');
h.message(a, J({ t: 'move', x: 9, y: 9, face: -1, mv: 1 })); assert.equal(last(b, 'move').x, 9);
h.message(c, J({ t: 'hello', id: 'cccccccc', name: 'Chi' })); h.message(c, J({ t: 'room', room: 'cho', x: 1, y: 1 }));
h.message(a, J({ t: 'move', x: 10, y: 9, face: 1, mv: 0 })); assert.equal(last(c, 'move'), undefined);   // another room hears nothing
h.message(b, J({ t: 'chat', text: 'xin chào <b>' })); assert.equal(last(a, 'chat').text, 'xin chào b');
h.message(a, J({ t: 'fr', to: 'bbbbbbbb', op: 'ask' })); assert.equal(last(b, 'fr').from, 'aaaaaaaa');
h.message(b, J({ t: 'snapreq', to: 'zzzzzzzz' })); assert.equal(last(b, 'nobody').for, 'snapreq');
h.message(b, J({ t: 'snap', to: 'aaaaaaaa', data: { tiles: { '1,1': 1 } } })); assert.equal(last(a, 'snap').data.tiles['1,1'], 1);
h.message(a, J({ t: 'room', room: 'ruong:bbbbbbbb', x: 4, y: 6 })); assert.equal(last(a, 'room').peers.length, 0);
h.message(b, J({ t: 'room', room: 'ruong:bbbbbbbb', x: 4, y: 6 })); assert.equal(last(b, 'room').peers[0].id, 'aaaaaaaa');
const a2 = mk(); h.message(a2, J({ t: 'hello', id: 'aaaaaaaa', name: 'An' }));
assert.equal(last(a, 'bye').t, 'bye'); assert.ok(a.closed);                   // the same id elsewhere kicks the old socket
h.close(b); h.message(a2, J({ t: 'who' })); assert.equal(last(a2, 'who').list.some(x => x.id === 'bbbbbbbb'), false);
console.log('hub ok');
