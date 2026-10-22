// Số liệu từng ngày (giờ Việt Nam): node stats.mjs   (cần file .admin-token, không đưa lên git)
import { readFileSync } from 'node:fs';
const tok = readFileSync(new URL('./.admin-token', import.meta.url), 'utf8').trim();
const r = await fetch('https://dcc-phong-choi.dcc-phong-choi.workers.dev/stats', { headers: { Authorization: 'Bearer ' + tok } });
if (!r.ok) { console.log('lỗi', r.status); process.exit(1); }
const days = await r.json();
if (!days.length) console.log('chưa có số liệu');
for (const d of days) console.log(`${d.day}: ${d.players} người chơi · đông nhất cùng lúc ${d.peak} người${d.peakAt ? ' (' + new Date(d.peakAt + 7 * 36e5).toISOString().slice(11, 16) + ')' : ''} · ${d.rounds} ván có từ 2 người · ván đông nhất ${d.maxSeat} người`);
