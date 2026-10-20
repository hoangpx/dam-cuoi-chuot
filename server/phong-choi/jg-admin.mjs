// Ghép Tranh chung: ai đang ghép nhanh bất thường, khoá và mở khoá (cần file .admin-token, không đưa lên git)
//   node jg-admin.mjs                       người đang chơi, sắp theo số lần ghép trong 60 giây gần nhất, và danh sách đang bị khoá
//   node jg-admin.mjs ban dev <mã máy> [số phút]     khoá một máy (mặc định 6 giờ)
//   node jg-admin.mjs ban ip <địa chỉ> [số phút]     khoá một địa chỉ mạng (mặc định 20 phút)
//   node jg-admin.mjs free <mã máy hoặc địa chỉ>     mở khoá
import { readFileSync } from 'node:fs';
const tok = readFileSync(new URL('./.admin-token', import.meta.url), 'utf8').trim();
const base = 'https://dcc-phong-choi.dcc-phong-choi.workers.dev', [cmd, kind, key, mins] = process.argv.slice(2);
const get = async p => { const r = await fetch(base + p, { headers: { Authorization: 'Bearer ' + tok } }); if (!r.ok) { console.log('lỗi', r.status); process.exit(1); } return r.json(); };
if (cmd === 'ban') console.log(await get(`/jg-ban?${kind === 'ip' ? 'ip' : 'dev'}=${encodeURIComponent(key)}${mins ? '&mins=' + mins : ''}`));
else if (cmd === 'free') console.log(await get(`/jg-ban?dev=${encodeURIComponent(kind)}&un=1`));
else {
  const s = await get('/jg-sus');
  console.log(`bản ${s.ver} · tranh số ${s.puzzle} · còn ${s.left} nhóm`);
  console.table(s.live.map(c => ({ tên: c.name, 'ghép/60s': c.last60, 'ghép cả lần vào': c.joins, 'vi phạm': c.strikes, 'giây': c.secs, máy: c.dev, ip: c.ip })));
  console.log('đang bị khoá:', s.bans.length ? s.bans : 'không ai');
}
