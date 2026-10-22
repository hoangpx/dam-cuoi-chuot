/* The chat filter shared by the rooms: at most 40 letters, links cut, rude words starred out. */
// chat (owner, 2026-10-19: free chat, bad words filtered): at most 40 letters, links cut, rude words starred out
export const CHAT_MAX = 40, CHAT_GAP = 2500;
const stripV = ch => { const d = ch.normalize('NFD')[0] || ch; return d === 'đ' ? 'd' : d; };
const NB = '(?<![\\p{L}\\p{N}])', NA = '(?![\\p{L}\\p{N}])';
const sep = w => Array.from(w).join('[\\s.\\-_*,]*');
const RAW_BAD = ['địt', 'đụ', 'lồn', 'buồi', 'cặc', 'đéo', 'đĩ', 'đỉ', 'cứt', 'khốn nạn', 'chó đẻ', 'óc chó', 'mẹ mày', 'bố mày', 'thằng chó', 'đồ chó', 'ngu', 'đần', 'fuck', 'shit', 'bitch', 'dick', 'pussy', 'cunt', 'asshole', 'nigg', 'fag'];
const STR_BAD = ['dit', 'dit me', 'dit con', 'du ma', 'du me', 'dmm', 'dm', 'dcm', 'dkm', 'vcl', 'vkl', 'vl', 'clgt', 'cmm', 'cl', 'loz'];
const RAW_RE = new RegExp(NB + '(' + RAW_BAD.map(sep).join('|') + ')' + NA, 'giu');
const STR_RE = new RegExp(NB + '(' + STR_BAD.map(sep).join('|') + ')' + NA, 'giu');
export function cleanChat(raw) {
  let t = String(raw || '').normalize('NFC').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/(https?:\/\/|www\.)\S+/gi, '***').replace(/\S+@\S+\.\S+/g, '***').replace(/\b[\w-]+\.(com|net|org|vn|io|me|xyz|info|co)\b\S*/gi, '***');
  t = Array.from(t).slice(0, CHAT_MAX).join('').trim();
  if (!t) return '';
  const low = t.toLowerCase(), st = Array.from(low).map(stripV).join(''), mask = new Array(t.length).fill(false);
  if (st.length === t.length) { for (const re of [RAW_RE, STR_RE]) { const src = re === RAW_RE ? low : st; re.lastIndex = 0; let m; while ((m = re.exec(src))) { for (let i = m.index; i < m.index + m[0].length; i++) mask[i] = true; if (m.index === re.lastIndex) re.lastIndex++; } } }
  return Array.from(t).map((ch, i) => mask[i] && ch !== ' ' ? '*' : ch).join('');
}
