// Ghép Tranh chung: ai đang ghép nhanh bất thường, khoá và mở khoá (cần file .admin-token, không đưa lên git)
//   node jg-admin.mjs                       người đang chơi, sắp theo số lần ghép trong 60 giây gần nhất, và danh sách đang bị khoá
//   node jg-admin.mjs ban dev <mã máy> [số phút]     khoá một máy (mặc định 6 giờ)
//   node jg-admin.mjs ban ip <địa chỉ> [số phút]     khoá một địa chỉ mạng (mặc định 20 phút)
//   node jg-admin.mjs log                            ai ghép bao nhiêu mảnh (từ bản 2026-10-23)
//   node jg-admin.mjs who <tên>                      tìm mã máy theo tên (một phần tên cũng được)
//   node jg-admin.mjs purge <mã máy>                 xoá khỏi bảng xếp hạng (về 0 mảnh) và khoá một năm
//   node jg-admin.mjs hl sus | hl who <tên> | hl ban ip <địa chỉ> [số phút] | hl ban dev <mã máy> [số phút] | hl free <địa chỉ hoặc mã máy>   (Hội Làng)
//   P=dg node jg-admin.mjs revert <mã máy> [dry]       người gian lận: tách lại những nhóm máy đó đã nối (chỉ các lần nối ghi từ 2026-10-24), xoá điểm, khoá 1 năm; 'dry' chỉ đếm
//   node jg-admin.mjs reset <mã tranh>               làm lại tranh đang chơi (giữ điểm mọi người)
//   đặt P=dg để xem tranh Đàn gà mẹ con (mặc định: Vinh quy)
//   node jg-admin.mjs free <mã máy hoặc địa chỉ>     mở khoá
import { readFileSync } from 'node:fs';
const tok = readFileSync(new URL('./.admin-token', import.meta.url), 'utf8').trim();
const P = process.env.P ? '&p=' + process.env.P : '', base = 'https://dcc-phong-choi.dcc-phong-choi.workers.dev', [cmd, kind, key, mins] = process.argv.slice(2);
const get = async p => { const r = await fetch(base + p, { headers: { Authorization: 'Bearer ' + tok } }); if (!r.ok) { console.log('lỗi', r.status); process.exit(1); } return r.json(); };
if (cmd === 'ban') console.log(await get(`/jg-ban?${kind === 'ip' ? 'ip' : 'dev'}=${encodeURIComponent(key)}${mins ? '&mins=' + mins : ''}${P}`));
else if (cmd === 'free') console.log(await get(`/jg-ban?dev=${encodeURIComponent(kind)}&un=1${P}`));
else if (cmd === 'log') { const s = await get('/jg-log?x=1' + P); console.log(`bản ${s.ver} · ${s.rows} lần thả có ghép · ${s.devices} máy · ${s.joins} mảnh`); console.table(s.list.map(d => ({ tên: d.names, mảnh: d.joins, 'cao nhất/phút': d.peakPerMin, 'giữ nhanh nhất ms': d.fastHoldMs, từ: d.first.slice(5, 16), đến: d.last.slice(5, 16), máy: d.dev, ip: d.ips }))); }
else if (cmd === 'who') console.log((await get('/jg-who?name=' + encodeURIComponent(kind) + P)).found);
else if (cmd === 'purge') console.log(await get('/jg-purge?dev=' + encodeURIComponent(kind) + P));
else if (cmd === 'hl') {   // Hội Làng: node jg-admin.mjs hl sus | who <tên> | ban ip|dev <khoá> [số phút] | free <khoá>
  const hl = async p => { const r = await fetch(base + p, { headers: { Authorization: 'Bearer ' + tok } }); if (!r.ok) { console.log('lỗi', r.status); process.exit(1); } return r.json(); };
  if (kind === 'who') console.log((await hl('/hl-who?name=' + encodeURIComponent(key))).found);
  else if (kind === 'ban') console.log(await hl(`/hl-ban?${key === 'ip' ? 'ip' : 'dev'}=${encodeURIComponent(mins || '')}${process.argv[6] ? '&mins=' + process.argv[6] : ''}`));
  else if (kind === 'free') console.log(await hl(`/hl-ban?${/[:.]/.test(key) ? 'ip' : 'dev'}=${encodeURIComponent(key)}&un=1`));
  else { const s = await hl('/hl-sus'); console.table(s.live.map(c => ({ tên: c.name, máy: c.dev, ip: c.ip, giây: c.secs }))); console.log('đang bị khoá:', s.bans.length ? s.bans : 'không ai'); }
}
else if (cmd === 'revert') console.log(await get('/jg-revert?dev=' + encodeURIComponent(kind) + (key === 'dry' ? '&dry=1' : '') + P));   // hoàn tác những gì máy đó đã nối + xoá điểm + khoá 1 năm (thêm 'dry' để chỉ đếm)
else if (cmd === 'reset') console.log(await get('/jg-reset?ok=' + kind + P));
else {
  const s = await get('/jg-sus?x=1' + P);
  console.log(`bản ${s.ver} · tranh số ${s.puzzle} · còn ${s.left} nhóm`);
  console.table(s.live.map(c => ({ tên: c.name, 'ghép/60s': c.last60, 'ghép cả lần vào': c.joins, 'vi phạm': c.strikes, 'giây': c.secs, máy: c.dev, ip: c.ip })));
  console.log('đang bị khoá:', s.bans.length ? s.bans : 'không ai');
  if (s.banlog && s.banlog.length) { console.log('máy chủ tự khoá gần đây:'); console.table(s.banlog.map(b => ({ lúc: b.at.slice(5, 19), tên: b.name, máy: b.dev, ip: b.ip, lý_do: b.why, lần: b.level, phút: b.mins, nối: b.joins }))); }
}
