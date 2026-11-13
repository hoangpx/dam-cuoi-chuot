// Shop reviews of chương IV (js/ch4/danhgia.js; owner 2026-11-13: "dùng Haiku mà gen ra cho đa dạng, hóm hỉnh, hài hước, kiểu xì tin bây giờ,
// đừng nói dài dòng quê mùa; đánh giá sao tương đương với nhận xét"). The game decides who writes, the stars and what happened; the model only
// writes the words. POST /review { dev, items: [{ k, s, shop, ware, who, why }] } → { texts: [...] } (same order, same count).
import { MODEL, isBad } from './chat.js';

export const RV_MAX = 6;                 // reviews in one request
export const RV_PER_DEVICE = 20;         // requests a device a Vietnam day
export const RV_PER_IP = 60;
export const RV_PER_DAY = 6000;          // the whole game a day

const clip = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
// what happened, in words, for the prompt (the game sends only these keys)
export const WHY = {
  nhanh: 'được phục vụ nhanh, hài lòng', ngon: 'ăn/mua xong thấy ưng, hợp giá', re: 'thấy giá hời', cham: 'phải chờ lâu quá nên bỏ về không mua',
  het: 'đến nơi thì quán hết hàng, về tay không', dat: 'thấy giá đắt', duoi: 'người làm vừa bị chủ đuổi việc', bo: 'người làm tự bỏ việc vì chán chủ',
  om: 'người làm bỏ trốn sau khi bị chủ chửi mắng nhiều', no: 'người làm nghỉ vì chủ nợ công',
  vu_vo: 'chấm theo cảm hứng, lý do vu vơ, chẳng dính gì tới quán (tâm trạng, thời tiết, con mèo nhà bên…)'
};
export function cleanItems(a) {
  if (!Array.isArray(a)) return [];
  return a.slice(0, RV_MAX).map(x => ({
    k: x && x.k === 'nv' ? 'nv' : 'kh', s: Math.max(1, Math.min(5, Number.isFinite(+(x && x.s)) ? Math.round(+x.s) : 3)), shop: clip(x && x.shop, 40) || 'quán', ware: clip(x && x.ware, 40),
    who: clip(x && x.who, 30) || 'một người', why: WHY[x && x.why] ? x.why : (x && x.k === 'nv' ? 'bo' : 'ngon')
  }));
}
export function reviewSystem() {
  return [
    'Bạn viết nhận xét đánh giá ngắn cho các quán trong một trò chơi về chợ quê và phố huyện, nhân vật đều là chuột.',
    'Giọng văn: tiếng Việt kiểu giới trẻ bây giờ, xì tin, hóm hỉnh, hài hước, lém lỉnh, có thể chêm từ lóng nhẹ (kiểu "chill", "xịn xò", "toang", "mãi mận", "ét o ét", "keo kiệt bủn xỉn", "u là trời"), có thể dùng 1 emoji. TUYỆT ĐỐI không dài dòng, không văn vẻ quê mùa, không "kính thưa".',
    'Mỗi nhận xét 1 đến 2 câu, KHÔNG quá 25 chữ. Mỗi cái một kiểu khác nhau, không lặp ý, không lặp mở đầu.',
    'Người viết tự viết bằng giọng của mình (xưng tui, tôi, mình, em…), KHÔNG nhắc tên chính mình, KHÔNG nhắc số sao. Bám đúng chuyện đã xảy ra, không bịa thêm chuyện trái với nó (ví dụ khách bỏ về thì chưa được ăn).',
    'Giọng điệu phải khớp số sao: 5 sao khen nức nở, 4 sao khen có chút góp ý, 3 sao lưng chừng, 2 sao chê, 1 sao chê thậm tệ (nhưng không tục).',
    'Loại "kh" là khách viết về quán và món. Loại "nv" là người làm cũ viết về CHỦ quán: nói xấu chủ, kể khổ, rồi khuyên người đến làm sau phải cẩn thận.',
    'Không nói tục, không chửi bậy, không nhắc chính trị, tôn giáo, tên người thật hay thương hiệu thật. Không nhắc con số, luật hay chuyện trò chơi.',
    'Trả về JSON {"texts": [...]}: đúng số lượng và đúng thứ tự các mục được đưa.'
  ].join('\n');
}
export const RV_SCHEMA = { type: 'object', properties: { texts: { type: 'array', items: { type: 'string' } } }, required: ['texts'], additionalProperties: false };
export function buildReview(items) {
  const lines = items.map((x, i) => `${i + 1}. loại ${x.k}, ${x.s} sao, quán "${x.shop}"${x.ware ? `, món ${x.ware}` : ''}, người viết ${x.who}: ${WHY[x.why]}.`);
  return { model: MODEL, max_tokens: 900, thinking: { type: 'disabled' }, output_config: { effort: 'low', format: { type: 'json_schema', schema: RV_SCHEMA } },
    system: reviewSystem(), messages: [{ role: 'user', content: `Viết ${items.length} nhận xét:\n${lines.join('\n')}` }] };
}
// the answer → exactly n texts ('' where the model gave nothing usable; the game then writes its own)
export function readReview(msg, n) {
  let o = null; const text = msg && msg.stop_reason !== 'refusal' ? (msg.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim() : '';
  try { o = JSON.parse(text); } catch (e) {}
  const T = o && Array.isArray(o.texts) ? o.texts : [];
  return Array.from({ length: n }, (_, i) => { const t = clip(T[i], 220); return t && !isBad(t) ? t : ''; });
}
