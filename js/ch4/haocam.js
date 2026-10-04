/* ---------- Hảo cảm (owner): a book tab to read for fun, not an event. One or two a day a buyer who has been here
   leaves a backhanded verdict with stars (praise and one star, a complaint that makes no sense…), and the wife or the
   husband answers back đốp chát: sharp-tongued but funny. Nothing in play changes. Drawn from the pool without repeats
   until it runs out; all lines are our own. Saved: SAVE4.hao (last 40), SAVE4.haoSeen (pool indices used). ---------- */
// [ware ('*' any), stars, the buyer's verdict, a gentle answer (kept, not shown), the sharp answer shown in the book]
const C4_HAO = [
  ['trau', 1, 'Trầu ngon quá, nhai xong quên cả đường về. Một sao vì vợ ở nhà chửi.', 'Lần sau bác mua thêm một miếng mang về, vợ bác nhai xong cũng quên chửi ạ.', 'Bác quên đường về thì nhà em chỉ đường, chứ quên trả tiền thì nhà em nhớ hộ!'],
  ['trau', 1, 'Trầu cay quá, vợ tưởng tôi giận cả buổi.', 'Thế mai bác lấy cau non, ngọt như lời xin lỗi ạ.', 'Cay thế mà bác còn đứng đây chê được, chắc vợ bác cay hơn!'],
  ['trau', 2, 'Cau to quá, há miệng mỏi cả hàm.', 'Để em bổ tư cho bác, nhai nhẹ như ru.', 'Hàm bác mỏi vì nói nhiều chứ cau nhà em vô tội!'],
  ['trau', 1, 'Têm trầu đẹp như cánh phượng, không nỡ ăn, đành cho một sao.', 'Bác cứ ăn đi, nhà em têm cái khác đẹp hơn.', 'Không nỡ ăn thì bác treo lên bàn thờ, nhà em vẫn tính tiền đủ ạ!'],
  ['trau', 3, 'Ăn trầu xong môi đỏ quá, ra đường ai cũng tưởng đi ăn cưới.', 'Thế là trầu nhà em mang lộc cưới cho bác rồi.', 'Môi đỏ thế mà chưa ai mời cưới thì tại bác chứ đâu tại trầu!'],
  ['trau', 1, 'Vôi hơi nồng, tôi khóc giữa chợ, người ta tưởng tôi thất tình.', 'Em xin lỗi bác, mai em quệt vôi mỏng tay hơn.', 'Khóc giữa chợ mà có người hỏi han là phúc của bác đấy!'],
  ['che', 1, 'Chè ngon quá, uống xong hết tiền đi đò về.', 'Lần sau bác cứ uống, nhà em cho chịu tiền đò.', 'Lần sau bác mang dư tiền, nhà em bán thêm cả con đò!'],
  ['che', 1, 'Bát chè xanh đậm quá, uống xong thức trắng đếm sao.', 'Mai em pha nhạt tay cho bác ngủ ngon ạ.', 'Đếm sao xong bác cho nhà em năm sao luôn cho đủ bộ!'],
  ['che', 2, 'Nước chè nóng quá, thổi mãi mỏi cả mồm.', 'Bác ngồi nghỉ ghế này, em rót ra bát cho chóng nguội.', 'Mồm bác thổi chè thì mỏi, chứ chê thì chẳng thấy mỏi tí nào!'],
  ['che', 1, 'Chè ngon nhưng bát nhỏ, uống ba bát vẫn khát.', 'Bác uống bát thứ tư em mời, không lấy tiền.', 'Bát nhà em nhỏ để bác còn có cớ ghé lại chứ!'],
  ['che', 3, 'Uống chè ở đây vui, chỉ tiếc bà chủ không cười với tôi.', 'Em cười với bác đây, hôm nay em đãi bác một bát.', 'Em cười với khách trả tiền trước, bác trả rồi em cười ngay!'],
  ['che', 1, 'Ngồi uống chè lâu quá, về nhà vợ hỏi đi đâu từ sáng.', 'Lần sau bác rủ cả bác gái ra, em pha chè mời hai bác.', 'Bác cứ khai đi uống chè, nhà em làm chứng, chứ đừng khai đi đánh bạc!'],
  ['xoi', 1, 'Xôi dẻo quá, dính răng, nói không ra hơi.', 'Thế là xôi nhà em giữ lời cho bác, khỏi lỡ mồm.', 'Thế là xôi nhà em đã giúp bác bớt cãi vợ một buổi!'],
  ['xoi', 1, 'Gói xôi to quá, ăn xong không đi nổi về nhà.', 'Mai em gói nhỏ hơn cho bác đi nhẹ người.', 'Không đi nổi thì bác lăn về, đường làng phẳng lắm!'],
  ['xoi', 2, 'Xôi gấc đỏ quá, tưởng nhà ai có hỷ.', 'Thế là bác ăn lộc hỷ nhà em rồi.', 'Đỏ thế mới hợp bác, mặt bác chê cũng đỏ y như gấc!'],
  ['xoi', 1, 'Ăn xôi xong buồn ngủ, ngủ quên giữa chợ, mất cả dép.', 'Em xin lỗi bác, mai em trông dép cho bác ngủ.', 'Mất dép thì bác đi chân đất về, xôi vẫn nằm trong bụng không ai lấy được!'],
  ['xoi', 1, 'Xôi ngon nhưng không có ai bón cho.', 'Bác ngồi đây, em đưa thìa cho bác ạ.', 'Bác muốn bón thì về nhà nhờ vợ, ở chợ chỉ có bán thôi!'],
  ['xoi', 3, 'Xôi thơm, đỗ bùi, giá cũng vừa. Ba sao vì hôm nay tôi không vui.', 'Mong mai bác vui, nhà em nhận thêm hai sao.', 'Thế mai bác vui thì nhớ quay lại chấm cho đủ, nhà em ghi sổ!'],
  ['xen', 1, 'Hàng xén có đủ thứ, nhìn hoa cả mắt, chẳng mua được gì.', 'Để em chọn giúp bác vài món cần nhất ạ.', 'Hoa mắt thì nhà em có bán cả kính, bác mua luôn một cái!'],
  ['xen', 2, 'Gương soi rõ quá, về nhà thấy mình già đi mười tuổi.', 'Gương nhà em soi ra cái duyên, bác nhìn kỹ lại xem.', 'Gương nhà em thật thà, bác muốn trẻ thì mua cái gương mờ!'],
  ['xen', 1, 'Mua cái lược xong, tóc rụng hết, không còn gì để chải.', 'Bác cứ giữ lược, tóc sẽ mọc lại cho bác chải.', 'Tóc bác rụng vì lo chê hàng người ta đấy, lược vô can!'],
  ['xen', 1, 'Kim sắc quá, khâu một mũi chảy máu ba ngày.', 'Em gửi bác cái đê đeo tay, khâu cho an toàn.', 'Kim nhà em sắc như lưỡi bác, khâu lỗ nào cũng thủng!'],
  ['xen', 5, 'Chẳng có gì cần mua, vẫn năm sao vì cô bán hàng hay cười.', 'Em cảm ơn bác, mai bác ghé em lại cười.', 'Cười thì không mất tiền, nhưng ngắm thì mua một cây kim đi bác!'],
  ['xen', 1, 'Mua cái gương, về nhà vợ soi xong bắt tôi mua thêm cái nữa.', 'Thế là nhà em có thêm một mối, em cảm ơn bác gái.', 'Thế là cả nhà bác đều đẹp, chỉ có ví bác là gầy!'],
  ['bun', 1, 'Bún riêu nhiều riêu quá, không thấy bún đâu.', 'Mai em thêm bún cho bác, riêu vẫn đầy.', 'Bún đi xem hội rồi, riêu ở lại tiếp bác!'],
  ['bun', 1, 'Bát bún nóng quá, ăn xong toát mồ hôi như đi cày.', 'Bác ngồi chỗ quạt này, em lấy cốc trà đá.', 'Đổ mồ hôi mà không phải cày là lời to rồi bác ạ!'],
  ['bun', 2, 'Riêu cua ngon, nhưng con cua không chào tôi.', 'Con cua ngại khách, mai em dặn nó chào bác.', 'Cua nó chào rồi, tại bác mải chê nên không nghe thấy!'],
  ['bun', 1, 'Bún ngon quá, ăn hai bát, bây giờ hối hận vì không ăn ba.', 'Mai bác ghé, bát thứ ba em bớt tiền.', 'Ăn hai bát chê một sao, ăn ba bát chắc bác cho âm sao!'],
  ['bun', 1, 'Mắm tôm thơm quá, cả xóm biết tôi vừa ăn bún.', 'Em gửi bác cái tăm với lá kinh giới, thơm miệng ngay.', 'Thế là cả xóm biết bác có tiền ăn bún, oai quá còn gì!'],
  ['bun', 3, 'Bún ngon, chỉ tiếc ăn xong phải trả tiền.', 'Lần sau em mời bác bát trà miễn phí cho đỡ tiếc.', 'Tiếc thì bác ăn chậm thôi, trả tiền nhanh là được!'],
  ['*', 1, 'Chờ lâu quá, đứng mọc rễ, suýt nở hoa.', 'Em xin lỗi bác, mai em thuê thêm người cho nhanh.', 'Nở hoa thì bác ra đứng cạnh gánh hoa, nhà em bán chung luôn!'],
  ['*', 1, 'Hàng ngon nhưng chủ hàng đẹp quá, nhìn không dám trả giá.', 'Bác cứ trả giá, em bớt cho bác một đồng.', 'Không dám trả giá là đúng rồi, vì nhà em không bớt!'],
  ['*', 2, 'Giá rẻ quá, tôi nghi ngờ.', 'Giá rẻ vì nhà em muốn bác quay lại ạ.', 'Bác nghi thì để nhà em tăng giá cho bác yên tâm!'],
  ['*', 1, 'Đông khách quá, chen mãi rách cả áo.', 'Em gửi bác cây kim sợi chỉ khâu lại ạ.', 'Áo rách thì bác ghé hàng xén nhà em, có kim có chỉ!'],
  ['*', 1, 'Ông chồng gánh hàng nhanh quá, tôi chưa kịp chào đã đi mất.', 'Mai em bảo nhà em đứng lại chào bác.', 'Chồng em gánh nhanh để còn về nghe vợ, bác thông cảm!'],
  ['*', 1, 'Ăn ngon, chủ vui, giá phải chăng. Một sao vì tôi không thích khen.', 'Một sao của bác em quý như năm sao.', 'Thế mai bác cứ chê, nhà em đông khách là được!'],
  ['*', 2, 'Ghế ngồi êm quá, ngồi lâu quên cả trả tiền.', 'Em mời bác ngồi thêm, tiền lúc nào trả cũng được.', 'Bác quên thì nhà em nhớ, ghế êm chứ sổ nợ không êm đâu!'],
  ['*', 1, 'Con chó nhà ai cứ nhìn tôi ăn, mất cả ngon.', 'Để em đuổi nó đi cho bác ăn ngon.', 'Nó nhìn vì nó thèm, chứ bác ăn thì có ai thèm nhìn!'],
  ['*', 1, 'Mưa to quá, hàng không có mái che, tôi ăn bát nước mưa.', 'Mai em căng thêm tấm bạt che cho bác.', 'Nước mưa nhà em không tính tiền đâu, bác cứ uống!'],
  ['*', 3, 'Mọi thứ đều tốt, chỉ có tôi là không tốt vì hết tiền.', 'Bác cứ ăn, nhà em ghi sổ cho bác.', 'Hết tiền thì bác ghé thường xuyên vào, nhà em cho bác rửa bát trừ nợ!'],
  ['*', 1, 'Bà chủ nói nhiều quá, tôi chưa kịp chê đã hết giờ.', 'Em xin lỗi bác, mai em im cho bác chê.', 'Em nói nhiều để bác bớt chê, mà bác vẫn chê được, giỏi thật!'],
  ['*', 1, 'Tôi đến mua thì hết hàng, đi về thì lại có. Một sao cho số phận.', 'Mai em để phần bác trước ạ.', 'Số bác là số đến muộn, mai bác dậy sớm hơn con gà là có!'],
  ['*', 2, 'Hàng ngon nhưng nhìn sang hàng bên cạnh thấy rẻ hơn.', 'Bác thấy rẻ hơn thì nhà em bớt cho bằng.', 'Rẻ hơn thì bác sang đấy ăn, rồi lại quay sang đây khen!'],
  ['*', 1, 'Thằng cu nhà tôi ăn xong đòi ở lại làm con nhà này.', 'Cháu ngoan quá, bác cứ dẫn cháu ra chơi.', 'Nhà em nhận, nhưng cháu phải gánh hàng đỡ chồng em!'],
  ['*', 1, 'Mèo nhà hàng bên cứ lượn qua, tôi sợ không dám ăn.', 'Để em cho mèo con cá, nó đi chỗ khác ngay.', 'Chuột mà sợ mèo thì ở nhà, ra chợ là phải gan chứ bác!'],
  ['*', 2, 'Ăn xong được cụ Lý chào, chắc tại hàng này.', 'Thế là hàng em mang may cho bác.', 'Cụ Lý chào để bác nộp thuế đấy, đừng mừng vội!'],
];
const C4_HAO_STAR = n => '★'.repeat(n) + '☆'.repeat(5 - n);
// a buyer who has been here: one we have met if possible, else one we know by sight, else someone in the crowd
function c4HaoWho() {
  const L = c4People().list.filter(p => p.kind === 'mouse' && SAVE4.folk[p.id] && SAVE4.folk[p.id].v > 0);
  const met = L.filter(p => c4Known(p.id));
  const p = c4Pick(met.length && R() < .7 ? met : L);
  return p ? { p, name: p.name } : { p: null, name: c4Someone() };
}
// a line for one of our wares (or any), never the same one twice until the pool is used up
function c4HaoPick() {
  const own = c4Owned(), B = C4.today.by || {}, sold = own.filter(g => B[g] && B[g].n > 0);
  const seen = SAVE4.haoSeen || (SAVE4.haoSeen = []);
  let idx = C4_HAO.map((r, i) => i).filter(i => !seen.includes(i) && (C4_HAO[i][0] === '*' || (sold.length ? sold : own).includes(C4_HAO[i][0])));
  if (!idx.length) { SAVE4.haoSeen = seen.filter(i => !(C4_HAO[i][0] === '*' || own.includes(C4_HAO[i][0]))); idx = C4_HAO.map((r, i) => i).filter(i => C4_HAO[i][0] === '*' || own.includes(C4_HAO[i][0])); }
  const i = c4Pick(idx); SAVE4.haoSeen.push(i); return i;
}
// not an event (owner): at its hour a verdict and the couple's sharp answer are just written into the book, to read for fun
C4_EXTRA_EV.hao = () => {
  const i = c4HaoPick(); if (i == null) return false;
  const [g, star, say, , dop] = C4_HAO[i], W = c4HaoWho();
  (SAVE4.hao = SAVE4.hao || []).push({ day: SAVE4.day, name: W.name, g, star, say, who: g === 'trau' || /chồng em|em cười/i.test(dop) || R() < .6 ? 'v' : 'c', reply: dop });
  SAVE4.hao = SAVE4.hao.slice(-40); C4.noteNew = true; persist4();
  return false;                                                             // no sheet, the market goes on
};
// the book's Hảo cảm tab: the answered verdicts, newest first
function c4HaoHtml() {
  const H = (SAVE4.hao || []).slice().reverse();
  if (!H.length) return '<p>Chưa có ai chấm hảo cảm. Bán đắt hàng thì thế nào cũng có người chấm, khen chê đủ kiểu!</p>';
  return '<div class="haolist">' + H.map(h => `<div class="haoc"><p><b>${c4Cap1(h.name)}</b>${h.g && h.g !== '*' ? ' · ' + C4_GOODS[h.g].name : ''} · ngày ${h.day} · <span class="stars">${C4_HAO_STAR(h.star)}</span></p><p>“${h.say}”</p><p class="rep">${h.who === 'c' ? 'Chồng' : 'Vợ'} đốp: “${h.reply}”</p></div>`).join('') + '</div>';
}
