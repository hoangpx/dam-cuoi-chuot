/* Chương XI · Làng Vũ Đại — the hundred jobs of VÙNG XA (owner 2026-11-17: "thêm 100 nhiệm vụ mới", with the 33 new places of
   vungxa.js). Three parts:
   1. ĐI XA (33): ông giáo is writing a book of the land around the village and sends the player to every new place, one after
      another, as a row of the đình's board ("Đi xa (n/33)") from day 2; no time limit. Each starts with a new kind of step,
      { t: 'go', a: place }, that is done by itself on stepping into that place, then something to bring back or someone to see.
   2. The 45 residents of the nine new villages each have a request of their own, one after another once the village is known (C11_FV, see 'opening slowly' at the end), tied to their trade.
   3. 22 runs between the far villages (C11_FRUN), asked at 5 hearts; 4. each village's long story in three parts (C11_FCHAIN), late: something to carry from one village to another.
   Names in the lines: {i} = resident i of the same village, {vil:i} = resident i of another village. */

/* ---------- the 'go' step ---------- */
{
  const oldText = c11StepText;
  c11StepText = s => s.t === 'go' ? `Đi đến ${C11_AREAS[s.a] ? C11_AREAS[s.a].name : '?'}${C11_FAR_BY[s.a] ? ' (' + C11_REGIONS[C11_FAR_BY[s.a].reg].name.toLowerCase() + ')' : ''}` : oldText(s);
  const goCheck = () => {
    for (const q of [...c11Q().act]) {
      let moved = false;
      while (q.steps[q.si] && q.steps[q.si].t === 'go' && q.steps[q.si].a === C11_AR.id) { q.si++; moved = true; }
      if (!moved) continue;
      const s = q.steps[q.si];
      if (s) c11Msg(`${q.title}: đã tới nơi · ${c11StepText(s)}`, '#2f6a4c');
      persist11();
    }
  };
  const oldEnter = c11Enter;
  c11Enter = function (id, x, y, quiet) { oldEnter(id, x, y, quiet); goCheck(); };
  const oldTalk = c11QuestTalk;
  c11QuestTalk = function (v) { const r = oldTalk(v); goCheck(); return r; };
}
const c11FvId = (vil, i) => `v_${vil}_${i}`;
const c11FvName = (vil, i) => { const p = c11P(c11FvId(vil, i)); return p ? p.name : '?'; };
const c11FvText = (t, vil) => t.replace(/\{([a-z]+):(\d)\}/g, (_, v, i) => c11FvName(v, +i)).replace(/\{(\d)\}/g, (_, i) => c11FvName(vil, +i));
const c11FvWho = (w, vil) => typeof w === 'number' ? c11FvId(vil, w) : /^[a-z]+:\d$/.test(w) ? c11FvId(...w.split(':')) : w;

/* ---------- 1. ĐI XA: ông giáo's book of the land ---------- */
/* [place, title, what ông giáo says, steps after the 'go' (who: number = resident of that place), end line, money] */
const C11_DX = [
  ['dongchiem', 'Đồng chiêm phía bắc', 'Qua cánh đồng làng đi tiếp lên phía bắc là Đồng Chiêm, ruộng trũng cấy vụ chiêm. Cậu ra xem, mang về cho tôi một nắm rau sam bờ ruộng làm tin.', [{ t: 'bring', who: 'giao', item: 'rau_sam', n: 1 }], 'Rau sam bò kín bờ à? Đất ấy trũng mà tốt. Tôi ghi vào sổ rồi.', 60],
  ['xomthuong', 'Người Xóm Thượng', 'Trên Đồng Chiêm có Xóm Thượng. Cậu lên làm quen với cụ già trong xóm, hỏi xem xóm lập từ bao giờ.', [{ t: 'talk', who: 0, say: 'Xóm này ông cha tôi lập từ năm lụt to, người làng dưới chạy lên đây. Cậu về nói với ông giáo thế.' }, { t: 'talk', who: 'giao' }], 'Chạy lụt mà lập xóm... Hoá ra Xóm Thượng với làng mình vốn một gốc.', 80],
  ['damsen', 'Sen Đầm Sen', 'Nghe nói phía tây Xóm Thượng có cái đầm sen rộng lắm. Cậu hái giúp tôi một bông sen về ướp chè.', [{ t: 'bring', who: 'giao', item: 'hoa_sen', n: 1 }], 'Thơm quá. Sen đầm ấy cánh dày hơn sen ao đình.', 80],
  ['vuondao', 'Vườn Đào xứ Bắc', 'Phía đông Xóm Thượng là Vườn Đào. Cậu xin một cành về, Tết này tôi cắm ở lớp học.', [{ t: 'bring', who: 'giao', item: 'hoa_dao', n: 1 }], 'Đào phai thắm thật. Bọn trẻ sẽ thích lắm.', 90],
  ['doiche', 'Chè Đồi Chè', 'Cậu lên Đồi Chè sau Xóm Thượng hái giúp tôi ba nắm búp chè. Tôi muốn biết chè ấy có hơn chè làng không.', [{ t: 'bring', who: 'giao', item: 'che_bup', n: 3 }], 'Nước xanh, chát trước ngọt sau. Chè đồi hơn hẳn.', 110],
  ['rungtre', 'Rừng Tre Già', 'Qua Đầm Sen lên phía bắc có Rừng Tre Già. Cậu đào giúp tôi hai cây măng, xem tre già có còn măng non không.', [{ t: 'bring', who: 'giao', item: 'mang', n: 2 }], '"Tre già măng mọc" là đây. Câu tục ngữ có gốc của nó.', 110],
  ['langnon', 'Làng Nón', 'Qua Vườn Đào là Làng Nón, nhà nào cũng chằm nón. Cậu sang hỏi bà cụ cả làng xem một cái nón mấy lớp lá.', [{ t: 'talk', who: 0, say: 'Mười sáu vòng nan, ba lớp lá, khâu bằng sợi móc. Cậu về nói ông giáo, sai một mũi là nón dột.' }, { t: 'talk', who: 'giao' }], 'Ba lớp lá, mười sáu vòng nan. Tôi chép đủ cả rồi.', 120],
  ['deomay', 'Đèo Mây', 'Đi hết Đồi Chè lên nữa là Đèo Mây. Đứng trên đèo nhìn được cả vùng. Cậu lên đó, mang về cho tôi một hòn đá đỉnh đèo.', [{ t: 'bring', who: 'giao', item: 'da', n: 1 }], 'Đá đèo xanh xám, mài làm nghiên mực được. Cậu đi xa thật.', 150],
  ['thacbac', 'Thác Bạc', 'Sau Làng Nón có Thác Bạc, nước trắng như bạc. Cậu lấy giúp tôi một bầu nước thác pha chè.', [{ t: 'bring', who: 'giao', item: 'nuoc_thac', n: 1 }], 'Nước thác pha chè đồi... Đời người đọc sách, mong mỗi chén chè này.', 160],
  ['baitrau', 'Bãi Chăn Trâu', 'Qua Xóm Đoài sang tây là Bãi Chăn Trâu. Cậu ra xem bãi có bao nhiêu trâu bò, về kể tôi nghe.', [{ t: 'talk', who: 'giao' }], 'Trâu bò đông thế à? Bãi ấy cỏ tốt quanh năm.', 60],
  ['xomngoai', 'Xóm Ngoại', 'Bên kia Bãi Chăn Trâu là Xóm Ngoại. Ông cụ trong xóm đánh cờ giỏi nhất vùng. Cậu sang chào ông ấy giúp tôi.', [{ t: 'talk', who: 0, say: 'Ông giáo gửi lời à? Bảo ông ấy sang đây đánh một ván, tôi chấp xe.' }, { t: 'talk', who: 'giao' }], 'Chấp xe à? Ông ta coi thường tôi quá. Hôm nào tôi phải sang.', 80],
  ['ruonggo', 'Ruộng Gò', 'Phía bắc Bãi Chăn Trâu là Ruộng Gò, ruộng cao phải tát nước lên. Cậu mang về một bó lúa gò cho tôi xem.', [{ t: 'bring', who: 'giao', item: 'lua', n: 1 }], 'Hạt nhỏ mà chắc. Ruộng khô thì lúa cứng cây.', 90],
  ['damlay', 'Đầm Lầy', 'Nam Bãi Chăn Trâu là Đầm Lầy, rắn nhiều lắm. Cậu cẩn thận, bắt cho tôi con ếch về làm mẫu vẽ.', [{ t: 'bring', who: 'giao', item: 'ech', n: 1 }], 'Ếch đầm to thật. Tôi vẽ xong sẽ thả nó ra ao.', 100],
  ['langdet', 'Làng Dệt', 'Đi qua Xóm Ngoại sang tây là Làng Dệt. Cậu hỏi bà cụ trong làng xem vải nâu nhuộm bằng gì.', [{ t: 'talk', who: 0, say: 'Củ nâu giã nhỏ, ngâm ba đêm, phơi ba nắng. Vải nâu mặc mười năm không phai.' }, { t: 'talk', who: 'giao' }], 'Ba đêm, ba nắng. Nghề nào cũng có cái kiên nhẫn của nó.', 110],
  ['runggia', 'Rừng Già', 'Bắc Xóm Ngoại là Rừng Già, có cây lim trăm năm. Cậu nhặt giúp tôi một khúc gỗ lim rơi.', [{ t: 'bring', who: 'giao', item: 'go_lim', n: 1 }], 'Nặng chìm nước! Đình làng mình cột cũng bằng lim này.', 160],
  ['xomren', 'Xóm Rèn', 'Nam Xóm Ngoại có Xóm Rèn. Cậu sang nghe tiếng búa, hỏi cụ thợ cả xem xóm rèn cái gì nhiều nhất.', [{ t: 'talk', who: 0, say: 'Lưỡi cày với lưỡi liềm. Dao kéo bán chợ huyện, còn cày liềm là để nuôi người.' }, { t: 'talk', who: 'giao' }], 'Cày liềm nuôi người. Câu ấy tôi phải viết trang đầu.', 110],
  ['nuida', 'Núi Đá', 'Qua Rừng Già lên tây bắc là Núi Đá. Cậu leo lên, đào giúp tôi một cục than đá xem có không.', [{ t: 'bring', who: 'giao', item: 'than', n: 1 }], 'Than thật! Núi ấy có của. Phải giữ kín kẻo người huyện đến đào hết.', 170],
  ['dongma', 'Đồng Mạ', 'Qua Xóm Đông sang đông là Đồng Mạ, nơi gieo mạ cho cả vùng. Cậu ra xem, về nói cho tôi biết mạ đã lên chưa.', [{ t: 'talk', who: 'giao' }], 'Mạ lên xanh rồi à? Thế là sắp vào vụ cấy.', 60],
  ['langchai', 'Làng Chài', 'Đông Đồng Mạ có Làng Chài sống bằng nghề cá. Cậu mua giúp tôi hai con cá chép về làm gỏi đãi khách.', [{ t: 'bring', who: 'giao', item: 'ca_chep', n: 2 }], 'Cá chép Làng Chài béo thật. Khách tôi sẽ khen.', 120],
  ['vuonxoai', 'Vườn Xoài', 'Bắc Đồng Mạ có Vườn Xoài. Cậu hái giúp tôi ba quả, tôi chia cho học trò.', [{ t: 'bring', who: 'giao', item: 'qua_xoai', n: 3 }], 'Ngọt lịm. Bọn trẻ hôm nay học chăm phải biết.', 90],
  ['xommoi', 'Xóm Mới', 'Nam Đồng Mạ mới lập Xóm Mới, toàn người nơi khác đến. Cậu sang hỏi họ từ đâu tới.', [{ t: 'talk', who: 0, say: 'Chúng tôi dưới biển lên, bão cuốn mất nhà. Ở đây đất lành, chim đậu.' }, { t: 'talk', who: 'giao' }], 'Đất lành chim đậu... Làng mình phải đối xử tử tế với họ.', 90],
  ['baiboi', 'Bãi Bồi', 'Qua Làng Chài là Bãi Bồi ven sông. Cậu nhặt giúp tôi mấy con hến về nấu canh.', [{ t: 'bring', who: 'giao', item: 'hen', n: 3 }], 'Canh hến ăn với cơm nguội, ngon nhất mùa hè.', 100],
  ['doisim', 'Đồi Sim', 'Bắc Làng Chài là Đồi Sim, mùa này sim chín tím đồi. Cậu hái giúp tôi một nắm.', [{ t: 'bring', who: 'giao', item: 'sim', n: 2 }], 'Sim chín ngọt chát. Hồi nhỏ tôi hay trốn học đi hái sim.', 100],
  ['rungdua', 'Rừng Dừa Nước', 'Nam Làng Chài có Rừng Dừa Nước. Cậu mang về cho tôi một quả dừa nước xem nó thế nào.', [{ t: 'bring', who: 'giao', item: 'dua_nuoc', n: 1 }], 'Cùi trong như thạch. Lạ thật, cây gì mọc dưới nước mà ra quả.', 130],
  ['cuasong', 'Cửa Sông', 'Qua Bãi Bồi đi lên là Cửa Sông, chỗ sông đổ ra biển, có người phơi muối. Cậu mang về giúp tôi một gói muối hột.', [{ t: 'bring', who: 'giao', item: 'muoi_hat', n: 1 }], 'Muối mặn mà sạch. Vậy là sông làng mình chảy ra tận biển.', 170],
  ['bode', 'Bờ Đê', 'Qua Xóm Bãi sang đông là Bờ Đê dài. Cậu ra xem đê có chỗ nào sạt lở không, về báo tôi.', [{ t: 'talk', who: 'giao' }], 'Đê còn chắc à? Tốt. Năm nay đỡ lo lũ.', 60],
  ['xomdo', 'Xóm Bến Đò', 'Nam Bờ Đê là Xóm Bến Đò. Cậu hỏi ông lái đò già xem ông chở đò bao nhiêu năm rồi.', [{ t: 'talk', who: 0, say: 'Bốn mươi năm, đưa không biết bao nhiêu người sang sông. Có người đi không về.' }, { t: 'talk', who: 'giao' }], 'Bốn mươi năm một con đò... Ông ấy biết chuyện cả vùng hơn tôi.', 90],
  ['dongkhoai', 'Đồng Khoai', 'Đông Bờ Đê là Đồng Khoai. Cậu xin giúp tôi ba củ khoai về luộc.', [{ t: 'bring', who: 'giao', item: 'khoai', n: 3 }], 'Khoai bở tơi. Đất bãi trồng khoai là nhất.', 80],
  ['damcoi', 'Đầm Cói', 'Tây Xóm Bến Đò có Đầm Cói, cói mọc cao quá đầu. Cậu cắt giúp tôi ba bó cói đan chiếu.', [{ t: 'bring', who: 'giao', item: 'coi', n: 3 }], 'Cói dài đều. Chiếu này tôi trải lớp học cho bọn trẻ ngồi.', 100],
  ['langruou', 'Làng Rượu', 'Đông Xóm Bến Đò là Làng Rượu. Cậu hỏi cụ nấu rượu già nhất xem men làm bằng gì. Đừng uống nhiều đấy.', [{ t: 'talk', who: 0, say: 'Men lá, bốn mươi vị lá rừng, bí truyền. Cậu về nói thế thôi, đừng hỏi thêm.' }, { t: 'talk', who: 'giao' }], 'Bí truyền thì để họ giữ. Mỗi làng một cái quý riêng.', 110],
  ['rungphuong', 'Rừng Phượng', 'Nam Xóm Bến Đò là Rừng Phượng. Mùa hè đỏ rực. Cậu vào xem, nhặt giúp tôi ít củi khô.', [{ t: 'bring', who: 'giao', item: 'cui_kho', n: 3 }], 'Củi phượng cháy đượm. Cậu đi đến đâu cũng có quà về.', 110],
  ['godo', 'Gò Đất Đỏ', 'Qua Rừng Phượng sang tây là Gò Đất Đỏ. Cậu đào giúp tôi hai viên đá ong.', [{ t: 'bring', who: 'giao', item: 'da_ong', n: 2 }], 'Đá ong xây tường thì mát. Làng cổ ngày xưa đều xây bằng đá này.', 150],
  ['baicat', 'Bãi Cát Trắng', 'Đông Rừng Phượng là Bãi Cát Trắng. Đi hết vùng rồi đấy. Cậu mang về cho tôi một nắm cát trắng, tôi rắc lên trang cuối sổ.', [{ t: 'bring', who: 'giao', item: 'cat_trang', n: 1 }], 'Xong rồi! Cuốn địa chí vùng Vũ Đại đã đủ ba mươi ba nơi. Tên cậu đứng cạnh tên tôi trên bìa.', 400],
];
const c11DxAt = () => { const Q = c11Q(); let i = 0; while (i < C11_DX.length && Q.done['dx:' + i]) i++; return i; };
function c11DxTake(i) {
  const [a, t, , steps, end, m] = C11_DX[i], Q = c11Q();
  const S = [{ t: 'go', a, who: '-' }, ...steps.map(s => ({ ...s, who: c11FvWho(s.who, a) }))];
  Q.act.push({ id: 'dx:' + i, title: 'Đi xa: ' + t, giver: 'giao', steps: S, si: 0, end, reward: { m, f: 60, item: i === C11_DX.length - 1 ? 'sach_nom' : undefined }, src: 'dixa' });
  c11Sfx.tap(); persist11(); C11.menu = null; c11Msg('Nhận việc: ' + t + ' · ' + c11StepText(S[0]), '#2f6a4c');
}
{
  const old = c11OpenBoard;
  c11OpenBoard = function () {
    old();
    const M = C11.menu; if (!M || !M.rows || SAVE11.day < 2) return;
    if (c11Q().act.some(q => q.src === 'dixa')) return;
    const i = c11DxAt(), D = C11_DX[i]; if (!D) return;
    if (!c11DxOpen(i)) return;                                        // not yet: the land opens up slowly (c11DxOpen)
    const [a, t, why, steps] = D;
    if (steps.some(s => s.item && !C11_ITEMS[s.item])) return;
    M.rows.splice(1, 0, { name: `Đi xa (${i + 1}/${C11_DX.length}): ${t}`, sub: 'Ông giáo nhờ: ' + why, tag: `Nhận việc · thưởng ${c4Money(D[5])}`, ok: true, f: () => c11DxTake(i) });
  };
}

/* ---------- 2. the residents' own requests (from the first meeting) ---------- */
/* per village, one per resident: [title, start, steps ([item, n] = bring to them, {..} = a step), end, money] */
const C11_FV = {
  xomthuong: [
    ['Hạt giống cho vụ mới', 'Lụt năm ngoái cuốn mất thóc giống nhà tôi. Anh có thì để cho tôi năm bó lúa làm giống.', [['lua', 5]], 'Có giống rồi, vụ này Xóm Thượng lại xanh đồng.', 150],
    ['Bữa trưa ngoài đồng', 'Chồng tôi cày từ sáng chưa ăn gì. Anh mang giúp hai củ khoai luộc ra đồng cho anh ấy.', [['khoai_luoc', 2]], 'Anh ấy ăn ngon lành, cày được thêm hai sào.', 80],
    ['Dây buộc củi', 'Tôi đi kiếm củi mà đứt hết dây. Anh cho tôi xin một cuộn dây thừng.', [['day_thung', 1]], 'Buộc chặt rồi. Gánh củi này đủ đun cả tuần.', 60],
    ['Nếp nấu rượu', 'Nhà tôi nấu ít rượu cho ngày giỗ mà thiếu nếp. Anh có ba bát gạo nếp không?', [['gao_nep', 3]], 'Đủ nếp rồi. Nấu xong tôi để phần anh một chai.', 120],
    ['Con trâu đi lạc', 'Chú ơi, con trâu nhà cháu chạy sang Đồng Chiêm rồi. Chú ra xem giúp cháu nó có ở đấy không.', [{ t: 'go', a: 'dongchiem' }, { t: 'talk', who: 4 }], 'Nó đang gặm cỏ ở bờ ruộng ạ? Cháu ra dắt về ngay. Cháu cảm ơn chú!', 40],
  ],
  langnon: [
    ['Lá nón Rừng Tre', 'Lá cọ hết rồi, mấy hôm nay không có lá chằm. Anh vào Rừng Tre Già nhặt giúp tôi bốn tàu lá nón.', [['la_non', 4]], 'Lá trắng đẹp. Tôi chằm được hai cái nón.', 120],
    ['Nón cho cô dâu', 'Có đám cưới đặt nón bài thơ. Tôi cần sợi tơ để khâu chữ vào nón. Anh tìm giúp tôi một cuộn tơ tằm.', [['to_tam', 1]], 'Khâu chữ vào nón rồi. Cô dâu soi lên trời là thấy thơ.', 150],
    ['Nan tre cho vành nón', 'Chuốt vành nón phải tre bánh tẻ. Anh mang giúp tôi ba cây tre.', [['tre', 3]], 'Tre dẻo, chuốt nan mỏng mà không gãy.', 90],
    ['Phơi lá dưới nắng', 'Lá phải phơi trên cát trắng mới trắng. Anh mang giúp tôi hai nắm cát ở Bãi Cát Trắng.', [['cat_trang', 2]], 'Cát trắng thật, lá phơi lên trắng như giấy.', 140],
    ['Cái nón đầu tiên', 'Chú ơi, cháu chằm được cái nón đầu tiên! Chú mang sang cho bà cháu xem hộ cháu nhé.', [{ t: 'talk', who: 0, say: 'Con bé chằm đấy à? Méo một tí nhưng mũi khâu đều. Giỏi hơn bà ngày bé.' }, { t: 'talk', who: 4 }], 'Bà khen cháu ạ? Cháu sẽ chằm cái thứ hai tặng chú!', 50],
  ],
  xomngoai: [
    ['Bàn cờ mới', 'Bàn cờ của tôi mối ăn mất góc. Anh tìm giúp tôi khúc gỗ lim, gỗ ấy trăm năm không mọt.', [['go_lim', 1]], 'Bàn cờ lim! Giờ thì ông giáo đến đây mà thua.', 200],
    ['Mạ cho ruộng gò', 'Ruộng gò nhà tôi thiếu nước, mạ chết cả. Anh lên Đồng Mạ hỏi xem người ta có mạ thừa không.', [{ t: 'go', a: 'dongma' }, { t: 'talk', who: 1 }], 'Có mạ rồi à? Tôi đi gánh về cấy ngay.', 120],
    ['Rau ra chợ', 'Rau nhà tôi chưa kịp lớn mà mai phiên chợ. Anh để cho tôi ba bó rau muống mang ra chợ.', [['muong', 3]], 'Đủ rồi, mai tôi có hàng bán.', 70],
    ['Bồ kết gội đầu', 'Khách giặt thuê đòi gội bằng bồ kết. Anh kiếm cho tôi hai quả bồ kết.', [['bo_ket', 2]], 'Thơm cả xóm. Khách lại đến đông.', 70],
    ['Con diều sáo', 'Chú ơi, cháu muốn làm con diều sáo kêu vù vù. Chú cho cháu ít tre với giấy dó.', [['tre', 1], ['giay_do', 1]], 'Diều cháu bay cao nhất Bãi Chăn Trâu! Nghe sáo kêu không chú?', 50],
  ],
  langdet: [
    ['Củ nâu nhuộm vải', 'Mẻ vải mới cần nhuộm nâu. Anh mang giúp tôi bốn củ nâu.', [['cu_nau', 4]], 'Ngâm ba đêm là được màu nâu đẹp.', 110],
    ['Sợi cho khung cửi', 'Khung cửi hết sợi, cả nhà ngồi không. Anh tìm giúp tôi ba cuộn sợi gai.', [['soi_gai', 3]], 'Khung cửi lại kêu lách cách rồi.', 120],
    ['Nghệ nhuộm vàng', 'Có khách đặt vải vàng. Anh kiếm giúp tôi ba củ nghệ.', [['nghe', 3]], 'Vàng như hoa mướp. Khách sẽ ưng.', 90],
    ['Lá dâu cho tằm', 'Tằm nhà tôi đói, lá dâu vườn hết. Anh mang giúp tôi ba nong kén tằm cũ để tôi ươm lứa mới.', [['ken_tam', 2]], 'Kén vàng óng. Lứa này ra tơ tốt.', 140],
    ['Vải may áo búp bê', 'Chú ơi, bà cho cháu mảnh vải, cháu muốn may áo cho búp bê rơm. Chú cho cháu ít rơm làm búp bê.', [['rom', 3]], 'Búp bê rơm mặc áo vải nâu! Đẹp không chú?', 40],
  ],
  xomren: [
    ['Than cho lò', 'Lò hết than. Núi Đá phía bắc có than, anh đào giúp tôi năm cục.', [['than', 5]], 'Lửa lò đỏ rực. Hôm nay rèn được mười lưỡi liềm.', 150],
    ['Sắt cho mẻ cày', 'Làng bên đặt hai mươi lưỡi cày. Tôi thiếu sắt, anh tìm giúp bốn cục.', [['sat', 4]], 'Đủ sắt. Cày làng bên năm nay khỏi phải dùng cày gỗ.', 160],
    ['Da làm bễ', 'Bễ thổi lò thủng rồi. Anh kiếm giúp tôi tấm da rắn mà vá.', [['da_ran', 1]], 'Vá xong, bễ thổi phì phò như cũ.', 130],
    ['Dao ra chợ huyện', 'Tôi rèn được mẻ dao mà chưa ai mua. Anh mang giúp con dao phay này sang chị bán cá Làng Chài, chị ấy cần.', [{ t: 'carry', who: 'langchai:3', item: 'dao_phay', say: 'Dao Xóm Rèn à? Sắc thật. Gửi chị ấy tiền đây.' }, { t: 'talk', who: 3 }], 'Bán được rồi à? Làng Chài mà dùng thì cả vùng biết tiếng.', 120, 'dao_phay'],
    ['Mực cho bài học', 'Chú ơi, thầy bắt cháu chép bài mà cháu hết mực. Chú cho cháu một thỏi mực tàu.', [['muc_tau', 1]], 'Cháu chép xong bài rồi, thầy khen chữ đẹp!', 50],
  ],
  langchai: [
    ['Lưới bị rách', 'Lưới nhà tôi rách to quá. Anh tìm giúp tôi hai cuộn dây thừng để vá.', [['day_thung', 2]], 'Vá xong, mai ra khơi.', 100],
    ['Mồi câu cá lớn', 'Cá to ở đầm chỉ ăn mồi tép. Anh mang giúp tôi năm con tép.', [['tep', 5]], 'Đêm nay tôi câu được con cá trắm mười cân cho anh xem.', 90],
    ['Phao cho lưới', 'Phao lưới mục hết. Anh mang giúp ba cây tre làm phao.', [['tre', 3]], 'Phao nổi đều, lưới căng thẳng.', 80],
    ['Muối ướp cá', 'Cá nhiều mà không có muối ướp, để lâu ươn mất. Anh xuống Cửa Sông mua giúp tôi hai gói muối hột.', [['muoi_hat', 2]], 'Ướp xong rồi. Mắm cá năm nay ngon lắm.', 120],
    ['Con cua càng đỏ', 'Chú ơi, cháu thách thằng bạn bắt được cua to nhất. Chú bắt giúp cháu ba con cua đồng.', [['cua_dong', 3]], 'Con này càng to nhất! Cháu thắng rồi!', 40],
  ],
  xommoi: [
    ['Gỗ dựng nhà', 'Xóm mới chưa có nhà tử tế. Tôi dựng nhà cho một gia đình mới đến, thiếu tám khúc gỗ.', [['go', 8]], 'Khung nhà dựng xong. Đêm nay họ có mái che rồi.', 140],
    ['Hạt giống vườn mới', 'Vườn mới vỡ đất mà chưa có gì trồng. Anh cho tôi xin ít hạt cải với hạt mướp.', [['h_cai', 3], ['h_muop', 1]], 'Vài hôm nữa vườn xanh. Ở đâu có rau, ở đó là nhà.', 100],
    ['Đá kè ruộng', 'Ruộng mới khai hoang toàn sỏi. Anh giúp tôi sáu hòn đá kè bờ.', [['da', 6]], 'Bờ ruộng chắc rồi. Vụ đầu ở đất mới.', 90],
    ['Thăm quê cũ', 'Tôi già rồi, chỉ mong nghe tin quê cũ dưới biển. Anh xuống Cửa Sông hỏi giúp người ta xem bão đã tan chưa.', [{ t: 'go', a: 'cuasong' }, { t: 'talk', who: 3 }], 'Bão tan rồi, người ta lại ra khơi... Thế thì tôi yên lòng nằm xuống ở đây.', 120],
    ['Cành hoa cho mẹ', 'Chú ơi, mẹ cháu ở quê cũ thích hoa đào lắm. Chú cho cháu một cành đào cắm nhà mới.', [['hoa_dao', 1]], 'Nhà cháu có hoa đào rồi, giống ở quê! Mẹ cháu cười.', 50],
  ],
  xomdo: [
    ['Mái chèo gãy', 'Mái chèo của tôi gãy hôm qua. Anh tìm giúp tôi khúc gỗ lim mà đẽo, gỗ khác không bền.', [['go_lim', 1]], 'Chèo lim, chèo đến đời cháu không gãy.', 200],
    ['Vá thuyền', 'Thuyền tôi rò nước. Anh mang giúp tôi một cuộn sơn ta với ít cỏ khô trét.', [['son_ta', 1], ['co', 4]], 'Thuyền khô ráo rồi. Anh qua sông tôi không lấy tiền.', 150],
    ['Chè cho quán nước', 'Quán nước bến đò hết chè. Anh lên Đồi Chè hái giúp tôi bốn nắm búp chè.', [['che_bup', 4]], 'Khách qua sông ngồi uống chè, khen mãi.', 130],
    ['Bồ kết giặt thuê', 'Mùa nước đục, giặt mãi không sạch. Anh cho tôi xin ba quả bồ kết.', [['bo_ket', 3]], 'Áo trắng tinh. Người ta lại mang đồ đến giặt.', 80],
    ['Hến cho bữa tối', 'Chú ơi, mẹ bảo cháu đi nhặt hến mà cháu nhặt mãi không được. Chú cho cháu bốn con hến.', [['hen', 4]], 'Tối nay nhà cháu có canh hến! Cháu cảm ơn chú.', 40],
  ],
  langruou: [
    ['Lá làm men', 'Men rượu làng này làm từ lá rừng. Anh vào Rừng Phượng nhặt giúp tôi bốn nắm lá dong.', [['la_dong', 4]], 'Đủ lá rồi. Mẻ men này ủ được cả tháng rượu.', 130],
    ['Củi nấu rượu', 'Nấu rượu phải đun liu riu cả đêm. Anh kiếm giúp tôi sáu bó củi khô.', [['cui_kho', 6]], 'Lửa đượm cả đêm. Rượu ra thơm lắm.', 100],
    ['Nước thác cho rượu ngon', 'Rượu ngon phải nước ngon. Người ta đồn nước Thác Bạc nấu rượu là nhất. Anh mang giúp tôi hai bầu.', [['nuoc_thac', 2]], 'Nước trong lạnh. Mẻ này là rượu tiến vua.', 180],
    ['Nếp cho mùa sau', 'Ruộng nếp nhà tôi bị chuột phá. Anh để cho tôi năm bát gạo nếp.', [['gao_nep', 5]], 'Có nếp rồi. Năm nay làng vẫn có rượu.', 140],
    ['Đàn vịt đi lạc', 'Chú ơi, đàn vịt nhà cháu bơi sang Đầm Cói mất rồi. Chú sang xem chúng có ở đấy không.', [{ t: 'go', a: 'damcoi' }, { t: 'talk', who: 4 }], 'Chúng ở đấy ạ? Cháu sang lùa về ngay. Chú tốt quá!', 40],
  ],
};
const c11FvQuest = (vil, i) => {
  const R = C11_FV[vil] && C11_FV[vil][i]; if (!R) return null;
  const [title, start, steps, end, m, give] = R;
  const S = steps.map((s, k) => Array.isArray(s) ? { t: 'bring', who: c11FvId(vil, i), item: s[0], n: s[1], say: k < steps.length - 1 ? 'Được rồi, còn một thứ nữa thôi.' : undefined }
    : { ...s, who: s.t === 'go' ? '-' : c11FvWho(s.who, vil), say: s.say ? c11FvText(s.say, vil) : undefined });
  if (S.some(s => s.item && !C11_ITEMS[s.item]) || (give && !C11_ITEMS[give])) return null;
  const prev = i > 0 && C11_FV[vil][i - 1] ? c11FvId(vil, i - 1) : null;
  return { at: c11P(c11FvId(vil, i)).role === 'c' ? 1 : 2, title, start: c11FvText(start, vil), give, steps: S, end: c11FvText(end, vil), reward: { f: 200, m },
    gate: () => c11FarKnown(vil) && (!prev || c11DoneAgo(c11OwnId(prev), 1)) };   // the village must be known, and the one before in it helped first
};

/* ---------- 3. runs between the far villages (4 hearts) ---------- */
/* [from vil, resident, to vil, resident, item carried, title, start, said on arrival, end, money] */
const C11_FRUN = [
  ['langnon', 0, 'xomthuong', 1, 'non_la', 'Nón cho Xóm Thượng', 'Chị ấy ở Xóm Thượng đặt cái nón mới. Anh mang sang giúp tôi.', 'Nón Làng Nón đây rồi! Đi đồng nắng mấy cũng không sợ.', 'Chị ấy ưng à? Thế thì mai tôi chằm thêm.', 90],
  ['langnon', 1, 'xomdo', 2, 'non_la', 'Nón ra bến đò', 'Quán nước bến đò cần nón cho khách mượn đi nắng. Anh mang giúp cái này.', 'Khách qua sông có nón che rồi. Cảm ơn Làng Nón nhé.', 'Bán được nón ra tận bến đò. Làng tôi mở mang rồi.', 120],
  ['langdet', 1, 'xommoi', 3, 'vai_nau', 'Vải cho người mới đến', 'Bà cụ Xóm Mới chưa có áo ấm mùa đông. Anh mang tấm vải nâu này sang biếu bà.', 'Vải nâu... Ở quê cũ tôi cũng mặc áo nâu. Cảm ơn người Làng Dệt.', 'Bà ấy nhận rồi à? Làng mình dệt vải là để người ta ấm.', 120],
  ['langdet', 0, 'langnon', 0, 'to_tam', 'Tơ cho nón bài thơ', 'Bà cụ Làng Nón hỏi mua tơ khâu chữ. Anh mang cuộn tơ này sang.', 'Tơ Làng Dệt mịn quá. Khâu chữ lên nón không ai bằng.', 'Hai làng giúp nhau, ai cũng có lợi.', 130],
  ['xomren', 0, 'xomthuong', 0, 'dao_phay', 'Dao cho người làm ruộng', 'Cụ ở Xóm Thượng đặt con dao phát bờ. Anh mang sang giúp tôi.', 'Dao Xóm Rèn sắc ngọt. Phát bờ nhanh gấp đôi.', 'Cụ ấy khen à? Hừm. Thế là được.', 120],
  ['xomren', 1, 'langchai', 1, 'sat', 'Sắt làm neo', 'Anh chài Làng Chài cần cục sắt làm neo thuyền. Anh mang sang hộ tôi.', 'Neo sắt thì thuyền không trôi. Gửi Xóm Rèn lời cảm ơn.', 'Neo được thuyền là được người.', 100],
  ['langchai', 0, 'langruou', 0, 'ca_chep', 'Cá cho làng rượu', 'Cụ Làng Rượu có giỗ, đặt con cá chép. Anh mang sang hộ tôi.', 'Cá tươi rói. Rượu ngon phải có cá ngon.', 'Bán cá cho làng rượu, họ gửi rượu sang đổi. Đôi bên cùng vui.', 110],
  ['langchai', 3, 'xomngoai', 2, 'ca_ro', 'Cá rô cho chợ Xóm Ngoại', 'Chị bán rau Xóm Ngoại muốn bán thêm cá. Anh mang sang giúp tôi mẻ cá rô.', 'Cá rô đồng béo thế. Phiên chợ mai tôi bán hết.', 'Chợ Xóm Ngoại có cá Làng Chài, người ta biết đến làng mình.', 100],
  ['langruou', 1, 'xomren', 0, 'ruou_nep', 'Rượu cho thợ rèn', 'Cụ thợ rèn mừng thọ. Anh mang chai rượu nếp này sang biếu cụ.', 'Rượu Làng Rượu à? Uống một chén đứng cạnh lò, ấm cả người.', 'Cụ ấy nhận à? Năm sau tôi lại gửi.', 130],
  ['langruou', 2, 'xomdo', 0, 'ruou_nep', 'Rượu cho ông lái đò', 'Ông lái đò đưa người làng tôi sang sông mấy chục năm không lấy tiền. Anh mang biếu ông chai rượu.', 'Rượu ngon... Bốn mươi năm chèo đò, giờ mới có người nhớ ơn.', 'Ông ấy vui là được. Người tử tế phải được nhớ.', 120],
  ['xomthuong', 3, 'xomngoai', 0, 'ruou_nep', 'Rượu cho ván cờ', 'Ông cụ Xóm Ngoại đánh cờ hay rủ người ta uống. Anh mang chai rượu nhà tôi nấu sang.', 'Rượu Xóm Thượng à? Ngon. Đánh một ván với tôi không?', 'Ông ấy thích à? Rượu nhà tôi có tiếng rồi.', 100],
  ['xomthuong', 0, 'langdet', 2, 'lua', 'Lúa đổi vải', 'Xóm tôi nhiều thóc mà thiếu vải. Anh mang bó lúa này sang Làng Dệt đổi.', 'Lúa mẩy thế. Gửi lại tấm vải, coi như đổi công.', 'Có vải may áo cho cả nhà rồi.', 90],
  ['xomngoai', 1, 'xomren', 2, 'thoc', 'Thóc trả công rèn', 'Tôi nợ Xóm Rèn tiền rèn lưỡi cày. Anh mang thúng thóc này sang trả.', 'Thóc trả công à? Được, sòng phẳng.', 'Hết nợ rồi, nhẹ cả người.', 90],
  ['xomngoai', 3, 'langdet', 3, 'bo_ket', 'Bồ kết sang Làng Dệt', 'Chị ươm tơ Làng Dệt cần bồ kết giặt kén. Anh mang sang hộ.', 'Bồ kết thơm. Tơ giặt bằng cái này mới óng.', 'Chị ấy dùng được thì tôi để dành thêm.', 80],
  ['xommoi', 0, 'xomren', 1, 'go', 'Gỗ đổi đinh', 'Xóm Mới cần đinh dựng nhà. Anh mang khúc gỗ này sang Xóm Rèn đổi một túi đinh.', 'Gỗ tốt, đổi được. Đây, đinh đây.', 'Có đinh rồi, mái nhà mới không sợ gió.', 100],
  ['xommoi', 1, 'langchai', 2, 'muong', 'Rau cho Làng Chài', 'Làng Chài toàn ăn cá, thèm rau. Anh mang bó rau muống vườn tôi sang biếu.', 'Rau muống xanh mướt. Luộc lên chấm mắm cá là nhất.', 'Người mới đến mà biết biếu, Làng Chài sẽ nhớ.', 80],
  ['xomdo', 1, 'langruou', 1, 'che_bup', 'Chè sang Làng Rượu', 'Người Làng Rượu uống rượu nhiều, cần chè giải. Anh mang gói chè này sang.', 'Chè đồi à? Uống rượu xong một chén chè, tỉnh hẳn.', 'Họ thích à? Mai tôi lại hái.', 90],
  ['xomdo', 2, 'langnon', 3, 'nuoc_thac', 'Nước thác cho người phơi lá', 'Anh phơi lá Làng Nón khát cả ngày ngoài nắng. Anh mang bầu nước này sang cho anh ấy.', 'Nước mát quá! Cả ngày phơi lá, giờ mới được ngụm nước ngon.', 'Người khát được nước, mình cũng mát lòng.', 70],
  ['langnon', 3, 'langdet', 1, 'la_non', 'Lá nón đổi sợi', 'Làng Dệt cần lá làm bìa sách vải. Anh mang mấy tàu lá này sang đổi sợi.', 'Lá trắng thật. Đây, ba cuộn sợi.', 'Đổi được sợi rồi, chằm nón không lo thiếu chỉ.', 80],
  ['langdet', 2, 'langruou', 3, 'vai_nau', 'Vải lọc rượu', 'Làng Rượu cần vải thưa lọc rượu. Anh mang tấm vải này sang.', 'Vải lọc mịn, rượu trong vắt.', 'Họ dùng được thì mình mừng.', 100],
  ['langruou', 3, 'xomthuong', 1, 'gao_nep', 'Nếp giống cho Xóm Thượng', 'Xóm Thượng muốn trồng nếp như làng tôi. Anh mang bát nếp giống này sang.', 'Nếp giống Làng Rượu à? Vụ sau xóm tôi cũng có nếp thơm.', 'Lúa nếp lan ra cả vùng, tốt chứ sao.', 90],
  ['langchai', 2, 'xomthuong', 2, 'day_thung', 'Dây gai buộc củi', 'Anh kiếm củi Xóm Thượng hỏi xin dây bện lưới thừa. Anh mang cuộn này lên cho anh ấy.', 'Dây bện lưới chắc thật, buộc củi không bao giờ tuột.', 'Dây thừa của mình thành của quý của người. Tốt quá.', 80],
];
const c11FrunQuests = {};   // by giver id
for (const [fv, fi, tv, ti, item, title, start, say, end, m] of C11_FRUN) {
  if (ti < 0 || !C11_ITEMS[item]) continue;
  const giver = c11FvId(fv, fi);
  (c11FrunQuests[giver] = c11FrunQuests[giver] || []).push(() => ({ at: 5, title, start: c11FvText(start, fv), give: item,
    gate: () => c11FarKnown(fv) && c11FarKnown(tv) && c11DoneAgo(c11OwnId(giver), 2) && c11DoneAgo(c11OwnId(c11FvId(tv, ti)), 0),
    steps: [{ t: 'carry', who: c11FvId(tv, ti), item, say: c11FvText(say, tv) }, { t: 'talk', who: giver }], end: c11FvText(end, fv), reward: { f: 250, m, ff: { [c11FvId(tv, ti)]: 120 } } }));
}

/* the far residents' list: own request (1♥), the runs (4♥), then the ones every villager has (3, 6, 8, 9, 10) */
{
  const old = c11HQOf;
  c11HQOf = function (p) {
    const L = old(p); if (!p.far || L._fv) return L;
    L._fv = 1;
    const i = +p.id.split('_').pop(), own = c11FvQuest(p.far, i), runs = (c11FrunQuests[p.id] || []).map(f => f());
    const chain = i === 0 ? c11FchainOf(p.far) : [];
    const all = [...(own ? [own] : []), ...runs, ...L, ...chain].sort((a, b) => a.at - b.at);
    L.length = 0; L.push(...all); return L;
  };
}

/* ---------- the far villages sell their crafts (5 at a time, like feed), so every thing a job asks for can be had ---------- */
if (typeof C11_SHOPS !== 'undefined') for (const [who, title, feed, say] of [
  ['v_langdet_0', 'Hàng Làng Dệt', ['soi_gai', 'to_tam', 'ken_tam', 'cu_nau', 'vai_nau', 'lua_ha_dong'], 'Sợi, tơ, vải, cái gì Làng Dệt cũng có.'],
  ['v_xomren_3', 'Dao kéo, sắt than Xóm Rèn', ['sat', 'than', 'dao_phay'], 'Sắt Núi Đá, rèn bằng than Núi Đá. Dao chặt xương không mẻ.'],
  ['v_langnon_3', 'Nón và lá Làng Nón', ['non_la', 'la_non', 'la_co'], 'Nón ba lớp lá, đội mười năm không dột.'],
  ['v_langchai_3', 'Hàng cá Làng Chài', ['ca_chep', 'ca_ro', 'tep', 'day_thung'], 'Cá mới kéo lưới sáng nay, còn giãy đành đạch.'],
  ['v_langruou_2', 'Rượu và nếp Làng Rượu', ['ruou_nep', 'gao_nep'], 'Rượu nếp cái hoa vàng, uống một chén nhớ cả đời.'],
  ['v_xomthuong_1', 'Thóc gạo Xóm Thượng', ['lua', 'thoc', 'gao'], 'Thóc phơi ba nắng, gạo trắng thơm.'],
  ['v_xomdo_2', 'Quán nước bến đò', ['nuoc_che_xanh', 'khoai_luoc', 'bo_ket'], 'Ngồi đợi đò thì uống bát nước chè đã.'],
  ['v_xomngoai_0', 'Giấy mực của ông cụ Xóm Ngoại', ['giay_do', 'muc_tau', 'son_ta'], 'Giấy dó, mực tàu, sơn ta. Chữ đẹp phải có đồ tốt.'],
]) C11_SHOPS.push({ who, title, feed: feed.filter(id => C11_ITEMS[id]), say });

/* ---------- opening slowly (owner 2026-11-17: "làm cho nhiệm vụ phức tạp hơn, càng về sau mới mở ra chứ ko phải cứ gặp là mở ra") ----------
   A request may carry gate(): it is offered only when that says yes, however many hearts there are; until then the person asks
   nothing new of their own (only the small repeat requests of viecthem.js). The rules:
   - Đi xa i opens on day 2 + 2i and at level 1 + i/4 (the last ones near day 66 and level 9).
   - A far villager asks nothing until ông giáo's Đi xa job for that village is done (c11FarKnown); then the residents ask one
     after another, each a day after the one before was helped (adults at 2 hearts, children at 1).
   - A run between two far villages needs both known, the giver helped two days before, the receiver helped too, and 5 hearts.
   - The three parts of each village's long story (C11_FCHAIN, given by its eldest): part 1 at 6 hearts once all five residents were
     helped, part 2 at 8 hearts three days after part 1 and at level 5, part 3 at 10 hearts five days after part 2 and at level 8.
   Hunt steps of these are counted from when the job is offered (h0 set on each offer). */
const c11DxOpen = i => SAVE11.day >= 2 + 2 * i && c11Lv() >= 1 + Math.floor(i / 4);
const c11FarKnown = vil => { const k = C11_DX.findIndex(r => r[0] === vil); return k >= 0 && !!c11Q().done['dx:' + k]; };
const c11DoneAgo = (id, d) => { const v = c11Q().done[id]; return v !== undefined && SAVE11.day >= v + d; };
const c11OwnId = pid => pid + ':0';                                   // a far resident's own request is first on their list
{
  const old = c11Offer;
  c11Offer = function (p) {
    const o = old(p); if (!o || !o.gate) return o;
    if (!o.gate()) return c11Again(p);
    const by = ((SAVE11.san || {}).by || {});
    return { ...o, steps: o.steps.map(s => s.t === 'hunt' ? { ...s, h0: by[s.kind] || 0 } : s) };
  };
}

/* ---------- each village's long story: three parts, the eldest asks ---------- */
/* steps: [item, n] = bring to the eldest; {..} = a step (who: number = resident of this village, 'vil:i' another far village, else an id) */
const C11_FCHAIN = {
  xomthuong: [
    ['Mộ tổ dưới làng', 'Ông cha tôi chạy lụt lên đây, mộ tổ còn nằm dưới làng Vũ Đại. Anh hỏi ông từ xem mộ ở đâu, rồi thắp hương giúp tôi.', [
      { t: 'talk', who: 'tu', say: 'Mộ người Xóm Thượng à? Sau đình có mấy ngôi mộ cổ không ai thắp hương. Mang sen ra cúng, tôi chỉ chỗ.' },
      { t: 'bring', who: 'tu', item: 'hoa_sen', n: 3, say: 'Hương khói rồi. Anh về nói với cụ, tổ tiên nhà cụ yên rồi.' }, { t: 'talk', who: 0 }],
      'Cả đời tôi mong ngày này. Hai làng vốn là một nhà, anh là người nối lại.', 300],
    ['Đắp đường xuống làng', 'Đường từ Xóm Thượng xuống làng toàn đất lở. Muốn đắp lại phải có đá, gỗ lim làm cầu, và quan làng cho phép.', [
      { t: 'bring', who: 0, item: 'da', n: 20, say: 'Đá đủ rồi. Gỗ lim nữa, Rừng Già bên tây mới có.' }, { t: 'bring', who: 0, item: 'go_lim', n: 2, say: 'Còn phải xin phép Đội Tảo bên làng.' },
      { t: 'pay', who: 'tao', m: 150, say: 'Lệ phí đắp đường đây. Từ nay đường ấy là đường làng, tôi ghi vào sổ.' }, { t: 'talk', who: 0 }],
      'Đường thông rồi! Sáng mai người Xóm Thượng gánh lúa xuống chợ làng chỉ mất nửa canh giờ.', 500],
    ['Hội hai làng', 'Đường thông, mộ tổ yên. Tôi muốn mở hội chung hai làng. Anh mời giúp cụ Bá với ông giáo, rồi lo cá cho mâm cỗ.', [
      { t: 'talk', who: 'ba', say: 'Hội chung à? Được. Tôi ngồi chiếu trên, nhưng mâm cỗ thì để dân lo.' }, { t: 'talk', who: 'giao', say: 'Tôi sẽ đọc bài văn tế, kể chuyện hai làng một gốc.' },
      { t: 'bring', who: 0, item: 'ca_chep', n: 4, say: 'Cá đủ rồi. Mời thêm bà con Làng Rượu mang rượu sang nữa.' }, { t: 'talk', who: 'langruou:0', say: 'Hội hai làng thì Làng Rượu góp mười vò. Bảo cụ đừng lo.' }, { t: 'talk', who: 0 }],
      'Trống hội vang cả hai làng. Từ nay Xóm Thượng có nhà của anh, lúc nào lên cũng có cơm.', 900],
  ],
  langnon: [
    ['Nón quai thao cho hội', 'Hội làng bên đặt mười cái nón quai thao. Phải có tơ khâu quai, lá non, sơn ta quét vành.', [['to_tam', 2], ['la_non', 6], ['son_ta', 1]], 'Mười cái nón quai thao, quai tơ đỏ. Các cô đội đi hội đẹp như tranh.', 300],
    ['Lá cọ trên Đèo Mây', 'Lá cọ quý nhất mọc trên Đèo Mây, nhưng rắn nhiều lắm. Anh dẹp bớt rắn rồi hái lá giúp tôi.', [
      { t: 'go', a: 'deomay' }, { t: 'hunt', who: 0, kind: 'ran', n: 3, say: 'Rắn bớt rồi à? Thế thì mai các chị lên hái lá.' }, ['la_co', 8]],
      'Lá cọ đèo dày và trắng. Nón chằm bằng lá này nắng mấy cũng không giòn.', 500],
    ['Nón dâng đình', 'Làng Nón muốn dâng đình làng Vũ Đại một cái nón quai thao đẹp nhất. Anh mua một cái, đem dâng, xin ông từ ghi tên làng tôi.', [
      { t: 'carry', who: 'tu', item: 'non_quai_thao', say: 'Nón đẹp quá. Tôi treo ở gian giữa, ghi tên Làng Nón lên xà.' }, { t: 'talk', who: 'kieu', say: 'Nón Làng Nón à? Em sẽ đội nó đi hát ngày hội.' }, { t: 'talk', who: 0 }],
      'Tên làng tôi trên xà đình! Đời bà, đời mẹ chằm nón, chưa bao giờ được thế.', 900],
  ],
  langdet: [
    ['Khung cửi mới', 'Khung cửi của làng mục cả rồi. Muốn đóng khung mới cho bền phải có gỗ lim với tre già.', [['go_lim', 2], ['tre', 6]], 'Khung cửi lim kêu giòn tan. Vải dệt ra căng đều.', 300],
    ['Nồi nhuộm', 'Muốn nhuộm màu bền phải có nồi nhuộm bằng sắt. Anh lo nghệ, củ nâu, rồi sang Xóm Rèn đặt nồi.', [
      ['nghe', 5], ['cu_nau', 5], { t: 'pay', who: 'xomren:0', m: 200, say: 'Nồi nhuộm à? Ba ngày nữa xong. Bảo Làng Dệt cứ yên tâm.' }, { t: 'talk', who: 0 }],
      'Nồi về rồi. Vải nâu, vải vàng, màu nào cũng bền. Làng tôi nhận được đơn trên huyện.', 500],
    ['Tấm lụa thêu ngọc', 'Tôi muốn dệt một tấm lụa thêu ngọc trai, chữ do ông đồ viết, để đời sau biết Làng Dệt.', [
      ['to_tam', 6], ['ngoc_trai', 1], { t: 'talk', who: 'do', say: 'Thêu chữ "Phúc" lên lụa à? Tôi viết mẫu, thêu theo nét là đẹp.' }, { t: 'talk', who: 0 }],
      'Tấm lụa xong rồi, ngọc trai giữa chữ Phúc. Làng tôi giữ nó như giữ tên làng.', 900],
  ],
  xomren: [
    ['Quặng Núi Đá', 'Than sắt mua mãi tốn tiền. Núi Đá có quặng, anh lên đào giúp tôi, xem có đủ cho lò không.', [{ t: 'go', a: 'nuida' }, ['sat', 6], ['than', 6]], 'Quặng tốt. Từ nay Xóm Rèn tự lo được sắt.', 300],
    ['Lò cao', 'Muốn rèn được nhiều phải xây lò cao bằng đá ong, trét đất sét. Đá ong chỉ có ở Gò Đất Đỏ vùng nam.', [['da_ong', 10], ['dat_set', 10]], 'Lò cao xây xong, lửa trắng xanh. Rèn một ngày bằng ba ngày trước.', 500],
    ['Lưỡi cày cho cả vùng', 'Lò cao rèn được một trăm lưỡi cày. Tôi muốn biếu các xóm nghèo. Anh góp tiền than rồi đi báo giúp.', [
      { t: 'pay', who: 0, m: 300, say: 'Đủ tiền than rồi. Anh đi báo Xóm Thượng, Xóm Mới và anh Dậu bên làng.' },
      { t: 'talk', who: 'xomthuong:0', say: 'Cày sắt cho cả xóm à? Năm nay ruộng gò cũng cày được.' }, { t: 'talk', who: 'xommoi:2', say: 'Người mới đến mà được biếu cày... Chúng tôi không biết nói gì.' },
      { t: 'talk', who: 'dau', say: 'Cày sắt! Có nó, tôi cày nhanh gấp đôi, không phải thuê trâu cả ngày.' }, { t: 'talk', who: 0 }],
      'Cả vùng có cày sắt. Từ nay ai gọi Xóm Rèn là xóm rèn dao chém người nữa, tôi cãi lại được.', 900],
  ],
  langchai: [
    ['Tôm Cửa Sông', 'Người buôn trên huyện đặt tôm càng Cửa Sông. Anh xuống đó bắt giúp.', [{ t: 'go', a: 'cuasong' }, ['tom_song', 5]], 'Tôm càng xanh, con nào cũng to bằng ngón tay. Bán được giá.', 300],
    ['Thuyền mới', 'Thuyền của làng mục cả. Đóng thuyền mới cần gỗ lim, sơn ta và dây thừng.', [['go_lim', 3], ['son_ta', 2], ['day_thung', 4]], 'Thuyền mới hạ thuỷ, nổi êm như lá. Ra khơi không sợ sóng.', 500],
    ['Lễ cầu ngư', 'Làm lễ cầu ngư phải có cá chép đỏ dâng thần sông. Cá ấy hiếm lắm, chỉ đầm sâu mới có. Rồi báo ông lái đò và ông từ.', [
      ['ca_chep_do', 1], { t: 'talk', who: 'xomdo:0', say: 'Cầu ngư à? Tôi chèo đò dẫn đầu đoàn thuyền.' }, { t: 'talk', who: 'tu', say: 'Tôi sẽ đọc văn khấn thần sông giúp Làng Chài.' }, { t: 'talk', who: 0 }],
      'Thả cá chép đỏ xuống sông, cả đoàn thuyền giương buồm. Năm nay làng tôi được mùa cá.', 900],
  ],
  xommoi: [
    ['Giếng cho xóm mới', 'Xóm mới chưa có giếng, phải xuống sông gánh nước. Anh giúp tôi đá và sỏi kè giếng.', [['da', 12], ['soi', 10]], 'Giếng trong vắt! Lần đầu tiên xóm mới có nước sạch.', 300],
    ['Giấy nhập làng', 'Xóm tôi chưa có tên trong sổ làng. Phải nhờ ông giáo viết đơn, nộp lệ cho Đội Tảo, rồi xin cụ Bá ký.', [
      { t: 'talk', who: 'giao', say: 'Đơn xin nhập làng à? Tôi viết cho, chữ phải thật đẹp. Anh mang đến Đội Tảo.' }, { t: 'pay', who: 'tao', m: 150, say: 'Lệ đủ rồi. Còn chữ ký của cụ Bá nữa.' },
      { t: 'talk', who: 'ba', say: 'Người mới đến chịu làm ăn thì ở. Tôi ký. Bảo họ đừng gây chuyện.' }, { t: 'talk', who: 0 }],
      'Xóm Mới có tên trong sổ làng rồi! Từ nay chúng tôi không phải người lạ nữa.', 500],
    ['Đình nhỏ cho xóm mới', 'Có tên rồi thì phải có chỗ thờ. Tôi muốn dựng một ngôi đình nhỏ bằng gỗ lim, lợp ngói.', [['go_lim', 4], ['ngoi', 20], ['gach', 20]], 'Đình nhỏ dựng xong. Người già khóc, bảo cuối cùng cũng có chỗ thắp hương.', 900],
  ],
  xomdo: [
    ['Bến đò sạt lở', 'Lũ năm nay làm sạt bến đò. Anh giúp tôi đá kè và tre làm cầu ván.', [['da', 10], ['tre', 8]], 'Bến chắc rồi. Khách lên xuống đò không sợ trượt chân.', 300],
    ['Người qua sông không về', 'Năm xưa tôi chở một cô gái sang sông, cô ấy đánh rơi viên ngọc ở Bãi Cát Trắng rồi không bao giờ về. Anh tìm giúp, hỏi người Làng Rượu xem họ có nhớ cô ấy không.', [
      { t: 'go', a: 'baicat' }, ['ngoc_trai', 1], { t: 'talk', who: 'langruou:0', say: 'Cô gái ấy à? Là con gái làng tôi, đi lấy chồng xa. Nay có cháu nội rồi, vẫn gửi thư về.' }, { t: 'talk', who: 0 }],
      'Cô ấy còn sống, có cháu rồi... Bốn mươi năm tôi canh cánh. Giờ tôi yên lòng.', 500],
    ['Cầu tre qua sông', 'Tôi già rồi, không chèo được mãi. Tôi muốn bắc một cây cầu tre, người qua sông không phải chờ đò nữa.', [['tre', 20], ['day_thung', 6], { t: 'pay', who: 0, m: 200, say: 'Đủ cả rồi. Mai trai làng bắc cầu.' }],
      'Cầu tre bắc xong. Tôi đứng trên cầu nhìn con đò của mình, buồn mà vui.', 900],
  ],
  langruou: [
    ['Men bí truyền', 'Men rượu làng tôi làm từ lá rừng. Anh hái giúp tôi lá dong, gừng, ngải cứu với sả.', [['la_dong', 6], ['gung', 4], ['ngai_cuu', 4], ['sa', 3]], 'Đủ bốn vị chính rồi. Ba mươi sáu vị kia, tôi tự đi hái.', 300],
    ['Rượu thuốc', 'Thầy lang đặt rượu thuốc ngâm mật ong rừng. Anh vào rừng lấy mật, nhớ dẹp bớt lợn rừng phá ở đó.', [{ t: 'hunt', who: 0, kind: 'lon', n: 2, say: 'Dẹp được lợn rừng rồi à? Người đi rừng đỡ sợ.' }, ['mat_ong_rung', 2], { t: 'talk', who: 'trade:thầy lang', say: 'Rượu thuốc Làng Rượu à? Ngâm trăm ngày mới uống được, người già đau lưng mà dùng thì tốt.' }, { t: 'talk', who: 0 }],
      'Thầy lang đặt cả trăm vò. Làng tôi không chỉ có rượu uống say nữa.', 500],
    ['Rượu tiến vua', 'Tôi muốn nấu một mẻ rượu ngon nhất đời: nước Thác Bạc, nếp cái hoa vàng. Nấu xong biếu cụ Bá, cho cả vùng biết.', [['nuoc_thac', 4], ['gao_nep', 10], { t: 'talk', who: 'ba', say: 'Rượu Làng Rượu à? Thơm thật. Tôi sẽ mang lên huyện mời quan, nói là rượu làng mình.' }, { t: 'talk', who: 0 }],
      'Quan huyện uống khen! Rượu làng tôi có tên trên huyện rồi.', 900],
  ],
  xomngoai: [
    ['Ván cờ với ông giáo', 'Ông giáo hẹn sang đánh cờ mãi không thấy. Anh sang mời ông ấy, xem ông ấy có dám không.', [
      { t: 'talk', who: 'giao', say: 'Ông ta chấp xe à? Được, tôi sang, nhưng không cần chấp.' }, { t: 'talk', who: 0, say: 'Ông giáo dám đến à? Tốt. Anh báo ông ấy tôi bày bàn dưới gốc cây đầu xóm.' }, { t: 'talk', who: 'giao' }],
      'Hoà! Ba ván, mỗi người một ván, một ván hoà. Hai ông già cười cả buổi.', 300],
    ['Chợ phiên Xóm Ngoại', 'Tôi muốn mở phiên chợ cho Xóm Ngoại. Phiên đầu phải có hàng: rau, khoai, cá.', [['muong', 10], ['khoai', 10], ['ca_ro', 6]], 'Phiên chợ đầu đông nghịt. Người Làng Dệt, Xóm Rèn đều sang mua.', 500],
    ['Nước lên ruộng gò', 'Ruộng gò thiếu nước. Tôi muốn bắc máng tre dẫn nước từ suối Rừng Già, nhưng lợn rừng hay phá máng.', [
      ['tre', 12], { t: 'go', a: 'runggia' }, { t: 'hunt', who: 0, kind: 'lon', n: 2, say: 'Lợn rừng bớt rồi, máng tre không bị phá nữa.' }, { t: 'talk', who: 1, say: 'Nước về ruộng gò rồi! Lúa năm nay không chết khô nữa.' }, { t: 'talk', who: 0 }],
      'Nước chảy róc rách xuống ruộng gò. Già rồi mới thấy cảnh này, tôi mãn nguyện.', 900],
  ],
};
const C11_FCHAIN_AT = [[6, 0, 0], [8, 3, 5], [10, 5, 8]];   // hearts, days after the part before, level
function c11FchainOf(vil) {
  const L = C11_FCHAIN[vil]; if (!L) return [];
  const eld = c11FvId(vil, 0);
  return L.map(([title, start, steps, end, m], k) => {
    const S = steps.map((s, j) => Array.isArray(s) ? { t: 'bring', who: eld, item: s[0], n: s[1], say: j < steps.length - 1 ? 'Được, còn mấy thứ nữa.' : undefined }
      : { ...s, who: s.t === 'go' ? '-' : c11FvWho(s.who, vil), say: s.say ? c11FvText(s.say, vil) : undefined });
    if (S.some(s => s.item && !C11_ITEMS[s.item])) return null;
    const [at, gap, lv] = C11_FCHAIN_AT[k];
    return { at, title: `${C11_FAR_BY[vil].name}: ${title}`, start: c11FvText(start, vil), steps: S, end: c11FvText(end, vil), reward: { f: 300, m }, chain: [vil, k],
      gate: () => c11FarKnown(vil) && c11Lv() >= lv && (k === 0 ? C11_FV[vil].every((_, i) => c11DoneAgo(c11OwnId(c11FvId(vil, i)), 0)) : c11ChainDone(vil, k - 1, gap)) };
  }).filter(Boolean);
}
/* a part's id is <eldest>:<its index in the eldest's list> */
function c11ChainDone(vil, k, gap) {
  const eld = c11P(c11FvId(vil, 0)), L = c11HQOf(eld), i = L.findIndex(q => q.chain && q.chain[0] === vil && q.chain[1] === k);
  return i >= 0 && c11DoneAgo(eld.id + ':' + i, gap);
}
