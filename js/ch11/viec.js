/* Chương XI · Làng Vũ Đại — việc làng: the notice board at the đình (bảng yết thị: two or three small jobs a day, after Stardew
   Valley's Help Wanted: bring some goods to someone, or carry a letter, due by the end of the next day) and the villagers' own
   requests, which open as the player becomes their friend (heart quests). The 23 people of the old stories have their requests
   written by hand and tied to their stories; everyone else asks for something to eat at 3 hearts and to carry a letter to the
   neighbour they know at 6 hearts. A quest is a list of steps: bring (goods to someone), carry (a thing given at the start, to
   someone), pay (money to someone), talk (go and see someone). Saved in SAVE11.q. */

const C11_DELIVER = ['ca', 'bi', 'ngo', 'lua', 'muong', 'cai', 'khoai', 'dau', 'muop', 'ot', 'go', 'co', 'nam', 'rau', 'qua'].filter(id => C11_ITEMS[id]);
/* the requests of the story people: at = hearts needed, steps, start (what the giver says, give = put in the bag), end (said when done), reward */
const C11_HQ = {
  hac: [
    { at: 3, title: 'Củ khoai cho lão Hạc', start: 'Cậu ơi, nhà lão hết gạo mấy hôm rồi. Có khoai thì cho lão xin ba củ, lão với cậu Vàng ăn tạm.', steps: [{ t: 'bring', who: 'hac', item: 'khoai', n: 3 }], end: 'Lão với cậu Vàng no được mấy bữa. Cái đồng tiền cổ này lão giữ mãi, cậu cầm lấy.', reward: { f: 150, item: 'tien_dong' } },
    { at: 6, title: 'Lá thư gửi con', start: 'Lão muốn gửi thư cho thằng con mà không biết chữ. Cậu nhờ ông giáo viết giúp, rồi đưa anh Mõ mang lên huyện nhé.', steps: [
      { t: 'talk', who: 'giao', say: 'Lão Hạc nhờ à? Được, tôi viết ngay. Cậu cầm thư mà đưa anh Mõ.', give: 'thu_tay' },
      { t: 'carry', who: 'mo', item: 'thu_tay', say: 'Thư lên đồn điền à? Mai tôi lên huyện, gửi theo xe thư cho.' },
      { t: 'talk', who: 'hac', say: 'Thư đi rồi à? Thế là thằng con lão sẽ biết lão còn sống... Cảm ơn cậu.' }], reward: { f: 250, ff: { giao: 80 } } }],
  giao: [{ at: 4, title: 'Cuốn sách chữ Nôm', start: 'Cuốn sách chữ Nôm của cha tôi, tôi bán cho một người buôn chuyến ngoài chợ. Cậu hỏi giúp xem người ta còn giữ không.', steps: [
    { t: 'talk', who: 'trade:buôn chuyến', say: 'Sách ấy à? Tôi chưa bán đâu. Trả tôi một trăm năm mươi đồng thì cầm về.' },
    { t: 'pay', who: 'trade:buôn chuyến', m: 150, say: 'Đây, sách đây. Giữ cẩn thận, giấy dó mủn lắm.', give: 'sach_nom' },
    { t: 'carry', who: 'giao', item: 'sach_nom' }], end: 'Đúng nó rồi! Nét chữ của cha tôi đây... Tôi sẽ dạy bọn trẻ đọc cuốn này.', reward: { f: 300, item: 'muc_tau' } }],
  dau: [{ at: 3, title: 'Suất sưu nhà anh Dậu', start: 'Nhà tôi còn thiếu suất sưu của thằng em đã chết. Anh có đồng nào thì nộp giúp cho Đội Tảo, tôi xin trả dần.', steps: [
    { t: 'pay', who: 'tao', m: 200, say: 'Đủ rồi. Nhà anh Dậu xong sưu năm nay, từ giờ tôi không đến đòi nữa.' },
    { t: 'talk', who: 'dau' }], end: 'Thật à? Anh nộp cho nhà tôi thật à... Tôi không biết lấy gì trả ơn anh.', reward: { f: 300, ff: { chidau: 200, ti: 150 } } }],
  chidau: [{ at: 5, title: 'Đừng bán cái Tí', start: 'Nhà cụ Bá đòi cái Tí sang ở để trừ nợ năm bó lúa. Anh có lúa thì giúp em, rồi bảo cụ Bá là nhà em trả đủ.', steps: [
    { t: 'bring', who: 'chidau', item: 'lua', n: 5, say: 'Đủ năm bó rồi. Anh sang nói với cụ Bá giúp em.' },
    { t: 'talk', who: 'ba', say: 'Hừm, trả đủ thì thôi. Con bé ở nhà mà trông em.' },
    { t: 'talk', who: 'chidau' }], end: 'Cái Tí được ở nhà rồi! Anh là ân nhân của nhà em.', reward: { f: 350, ff: { ti: 250, dau: 150 } } }],
  ti: [{ at: 2, title: 'Ngô nướng cho em Dần', start: 'Chú ơi, thằng Dần đói khóc mãi. Chú có ngô thì cho con xin hai bắp nướng cho em nhé.', steps: [{ t: 'bring', who: 'ti', item: 'ngo', n: 2 }], end: 'Em con hết khóc rồi! Con cho chú gói kẹo lạc này.', reward: { f: 150, item: 'keo_lac' } }],
  chi: [
    { at: 3, title: 'Bát cháo hành', start: 'Tao ốm... nằm mấy hôm rồi chẳng ai đoái hoài. Mà thôi, mày đi đi.', steps: [
      { t: 'talk', who: 'thi', say: 'Anh Chí ốm à? Để em nấu bát cháo hành, anh mang sang hộ em nhé.', give: 'bat_chao_thi' },
      { t: 'carry', who: 'chi', item: 'bat_chao_thi' }], end: 'Cháo... của cái Thị à? Thơm quá. Lâu lắm rồi tao mới được ai nấu cho ăn.', reward: { f: 300, ff: { thi: 150 } } },
    { at: 6, title: 'Giữ lấy chai rượu', start: 'Mày cầm cái chai này đi. Để nó ở đây tao lại uống. Đưa cho bác Năm Thọ giữ hộ.', give: 'chai_ruou_chi', steps: [
      { t: 'carry', who: 'tho', item: 'chai_ruou_chi', say: 'Thằng Chí gửi à? Được. Bảo nó mai sang lò, tao dạy nó cầm búa.' },
      { t: 'talk', who: 'chi' }], end: 'Bác Năm cho tao học nghề à? Tao... tao sẽ sang. Không uống nữa.', reward: { f: 350, ff: { tho: 150 } } }],
  thi: [{ at: 3, title: 'Rau cho nồi cháo', start: 'Anh ơi, em muốn nấu nồi cháo rau mà vườn hết rau rồi. Anh hái giúp em ba nắm rau dại trong rừng nhé.', steps: [{ t: 'bring', who: 'thi', item: 'rau', n: 3 }], end: 'Rau non quá! Hôm nào anh ra bến, em mời anh bát cháo.', reward: { f: 200, m: 20 } }],
  cothi: [
    { at: 4, title: 'Củi cho lò bánh đa', start: 'Lò bánh đa hết củi rồi. Anh mà chặt được tám khúc gỗ thì tôi trả công.', steps: [{ t: 'bring', who: 'cothi', item: 'go', n: 8 }], end: 'Được, anh cũng chịu khó đấy. Tiền công đây, không thiếu một đồng.', reward: { f: 200, m: 70 } },
    { at: 7, title: 'Lời xin cho Thị', start: 'Thằng Chí nó bảo muốn hỏi cái Thị. Anh đến hỏi xem nó có thật lòng không, rồi về nói tôi nghe.', steps: [
      { t: 'talk', who: 'chi', say: 'Tao thề với đất trời, tao bỏ rượu thật. Tao chỉ muốn có cái Thị.' },
      { t: 'talk', who: 'cothi' }], end: 'Nó nói thế thật à... Thôi được. Tôi già rồi, cũng mong cái Thị có chỗ dựa.', reward: { f: 300, ff: { thi: 250, chi: 250 } } }],
  ba: [
    { at: 3, title: 'Phong thư lên huyện', start: 'Anh mang giùm tôi phong thư này cho Đội Tảo. Nhớ đừng bóc, chuyện của người lớn.', give: 'thu_tay', steps: [
      { t: 'carry', who: 'tao', item: 'thu_tay', say: 'Thư của cụ Bá à? Ừm... văn tự ruộng nhà anh Dậu. Anh không thấy gì nhé.' },
      { t: 'talk', who: 'ba' }], end: 'Tốt. Anh biết điều đấy. Cầm lấy mà tiêu.', reward: { f: 200, m: 80 } },
    { at: 6, title: 'Đòi nợ hộ cụ', start: 'Mụ goá Tư còn nợ tôi mấy thúng thóc. Anh sang nhắc mụ một tiếng.', steps: [
      { t: 'talk', who: 'tugoa', say: 'Tôi không vay cụ bao giờ... Mà thôi, anh về thưa cụ, tôi chỉ còn con lợn nái.' },
      { t: 'talk', who: 'ba' }], end: 'Mụ ấy nói thế à... Thôi, khất cho mụ. Già rồi, tôi cũng mệt.', reward: { f: 250, m: 60, ff: { tugoa: 150 } } }],
  baba: [{ at: 4, title: 'Tin người làng bên', start: 'Anh hỏi giúp cô Duyên hàng nước xem người làng bên năm xưa còn không. Đưa cô ấy lá thư này, cô ấy biết.', give: 'la_thu_cu', steps: [
    { t: 'carry', who: 'duyen', item: 'la_thu_cu', say: 'Người ấy à? Đi lính về rồi, còn sống, vẫn chưa vợ. Anh về nói với bà Ba nhé.' },
    { t: 'talk', who: 'baba' }], end: 'Người ấy còn sống... chưa vợ... Thế là đủ rồi. Cảm ơn anh, đừng nói với ai nhé.', reward: { f: 300, item: 'khan_tay_theu' } }],
  cuong: [{ at: 4, title: 'Con trâu của bà Tư', start: 'Mày bảo tao đi xin lỗi bà goá à? Thì mày sang hỏi bà ấy cần gì trước đã.', steps: [
    { t: 'talk', who: 'tugoa', say: 'Tôi chỉ cần con trâu. Không có nó, ruộng nhà tôi bỏ hoang.' },
    { t: 'talk', who: 'cuong' }], end: 'Ừ thì... tao trả. Mai tao dắt trâu sang. Đừng có kể với cha tao.', reward: { f: 300, ff: { tugoa: 250 } } }],
  tao: [{ at: 5, title: 'Nộp thay nhà nghèo', start: 'Trên huyện đòi đủ thóc sưu. Anh có năm bó lúa thì nộp thay mấy nhà nghèo, tôi ghi tên anh vào sổ làng.', steps: [{ t: 'bring', who: 'tao', item: 'lua', n: 5 }], end: 'Năm nay mấy nhà ấy khỏi bị trói ở đình. Tôi nhớ ơn anh.', reward: { f: 250, ff: { dau: 100, tugoa: 100 } } }],
  tho: [{ at: 3, title: 'Gỗ cho lò rèn', start: 'Lò thiếu củi đốt than. Mười khúc gỗ.', steps: [{ t: 'bring', who: 'tho', item: 'go', n: 10 }], end: 'Được. Đây, ít sắt vụn với tiền công.', reward: { f: 200, m: 60, item: 'sat' } }],
  chuc: [{ at: 4, title: 'Minh oan cho Binh Chức', start: 'Cả làng bảo tôi trộm gà. Anh hỏi anh Mõ với bà Tư xem họ thấy gì, giúp tôi với.', steps: [
    { t: 'talk', who: 'mo', say: 'Đêm mất gà, tôi đánh mõ qua bờ rừng trúc, thấy đôi mắt sáng xanh, thấp lè tè. Không phải người.' },
    { t: 'talk', who: 'tugoa', say: 'Lông gà rơi tận bờ rừng... Chắc là con cáo thật. Tôi trách oan ông Chức rồi.' },
    { t: 'talk', who: 'chuc' }], end: 'Con cáo à! Ha, tôi biết mà. Anh là người duy nhất tin tôi.', reward: { f: 300 } }],
  tu: [
    { at: 3, title: 'Cỏ lót chiếu đình', start: 'Sắp có lễ, chiếu đình rách cả. Cậu mang giúp mười bó cỏ khô lót chiếu.', steps: [{ t: 'bring', who: 'tu', item: 'co', n: 10 }], end: 'Đình sạch sẽ hẳn ra. Thần làng sẽ phù hộ cậu.', reward: { f: 200, m: 40 } },
    { at: 6, title: 'Mảnh trầm hương', start: 'Mảnh trầm của đình mất đã lâu. Anh Mõ có lần ấp úng với tôi chuyện ấy, cậu hỏi thử.', steps: [
      { t: 'talk', who: 'mo', say: 'Tôi... thôi được. Đêm ấy tôi thấy người nhà cụ Bá. Bà Ba biết chuyện, cậu hỏi bà ấy.' },
      { t: 'talk', who: 'baba', say: 'Tôi giấu mảnh trầm đi để khỏi bị đem bán. Cậu mang trả đình giúp tôi.', give: 'dot_tran' },
      { t: 'carry', who: 'tu', item: 'dot_tran' }], end: 'Trầm về rồi! Đêm rằm này đình lại thơm như xưa.', reward: { f: 350, ff: { baba: 150, mo: 100 } } }],
  do: [{ at: 3, title: 'Câu đối cho cụ Bá', start: 'Cụ Bá đặt đôi câu đối mà tôi không muốn sang nhà cụ. Cậu mang hộ, cụ trả tiền thì cậu cầm về giùm.', give: 'cau_doi', steps: [
    { t: 'carry', who: 'ba', item: 'cau_doi', say: 'Chữ ông đồ vẫn đẹp. Cầm về đưa ông ấy chỗ tiền này.' },
    { t: 'talk', who: 'do' }], end: 'Cụ trả đủ à? Cậu cầm lấy một nửa, coi như tiền công.', reward: { f: 200, m: 50 } }],
  duyen: [
    { at: 3, title: 'Quả rừng làm mứt', start: 'Anh hái giúp em bốn nắm quả rừng nhé, em làm mứt bán kèm chè.', steps: [{ t: 'bring', who: 'duyen', item: 'qua', n: 4 }], end: 'Chua chua ngọt ngọt, khách mê lắm đây. Bát chè hôm nay em mời.', reward: { f: 200, m: 30 } },
    { at: 6, title: 'Thư anh học trò', start: 'Cậu Xuân trên tỉnh về, chắc biết tin anh học trò. Anh đưa cậu ấy lá thư này, hỏi giúp em.', give: 'thu_tay', steps: [
      { t: 'carry', who: 'xuan', item: 'thu_tay', say: 'Gã ấy à? Lấy con gái quan huyện rồi, đi xe kéo, chẳng nhớ ai đâu.' },
      { t: 'talk', who: 'duyen' }], end: 'Thế à... Em biết mà. Thôi, từ nay em không đợi ai nữa.', reward: { f: 300, ff: { xuan: 100 } } }],
  lanh: [{ at: 3, title: 'Lễ cưới cô Mận', start: 'Nhà gái thách cưới nặng quá. Anh giúp tôi bốn quả bí và ba bó lúa cho đủ mâm lễ nhé.', steps: [
    { t: 'bring', who: 'lanh', item: 'bi', n: 4, say: 'Đủ bí rồi, còn lúa nữa thôi.' }, { t: 'bring', who: 'lanh', item: 'lua', n: 3 }], end: 'Đủ lễ rồi! Tháng sau rước dâu, anh nhớ đến uống rượu mừng.', reward: { f: 300, m: 50 } }],
  kieu: [{ at: 4, title: 'Chiếc khăn tay', start: 'Anh đưa chiếc khăn này cho cô Vân em gái em. Nếu em phải đi, nó sẽ hiểu.', give: 'khan_tay_theu', steps: [
    { t: 'carry', who: '@cô Vân', item: 'khan_tay_theu', say: 'Khăn của chị Kiều... Chị định đi đâu? Anh bảo chị đừng đi, nhà còn em mà.' },
    { t: 'talk', who: 'kieu' }], end: 'Vân nói thế à... Em sẽ ở lại, chưa đi đâu cả. Cảm ơn anh.', reward: { f: 300 } }],
  xuan: [{ at: 3, title: 'Khán giả cho cậu ấm', start: 'Tôi có chuyện quần vợt hay lắm mà chẳng ai nghe. Anh hỏi cô Duyên với Binh Chức xem họ có muốn nghe không.', steps: [
    { t: 'talk', who: 'duyen', say: 'Quần vợt là cái gì? Thôi được, bảo cậu ấy ra quán, em nghe.' },
    { t: 'talk', who: 'chuc', say: 'Nghe thằng ấy kể à? Nó kể thì tôi cũng kể chuyện đánh trận!' },
    { t: 'talk', who: 'xuan' }], end: 'Có người nghe rồi! Mẹc-xi, mẹc-xi! Tặng anh cái quạt giấy kiểu tỉnh này.', reward: { f: 250, item: 'quat_giay' } }],
  tugoa: [{ at: 4, title: 'Cám cho đàn lợn', start: 'Lợn nái sắp đẻ mà nhà hết cám. Anh có bốn củ khoai với hai bắp ngô thì giúp tôi.', steps: [
    { t: 'bring', who: 'tugoa', item: 'khoai', n: 4, say: 'Còn ngô nữa anh nhé.' }, { t: 'bring', who: 'tugoa', item: 'ngo', n: 2 }], end: 'Lợn đẻ được lứa nào, tôi để phần anh một con.', reward: { f: 250, m: 40 } }],
  dong: [{ at: 4, title: 'Nấm trong rừng', start: 'Con dâu nhà bên ốm... Anh hái hai cái nấm trong rừng, đưa thầy lang xem có phải nấm độc không. Đừng nói là tôi nhờ.', steps: [
    { t: 'bring', who: 'trade:thầy lang', item: 'nam', n: 2, say: 'Đúng loại này rồi, ăn vào nôn mửa mê man. Phải uống thuốc giải, cúng bái vô ích.' },
    { t: 'talk', who: 'dong' }], end: 'Thế là cô ấy sẽ khỏi... Tôi sẽ không bán bùa cho nhà ấy nữa.', reward: { f: 300 } }],
  mo: [{ at: 3, title: 'Bữa cơm cho anh Mõ', start: 'Đám giỗ hôm qua người ta không cho tôi ăn. Anh có hai củ khoai không?', steps: [{ t: 'bring', who: 'mo', item: 'khoai', n: 2 }], end: 'Ngon quá. Từ nay làng có tin gì, tôi báo anh trước.', reward: { f: 250 } }],
};
const C11_ASK_FOOD = ['Nhà tôi sắp có giỗ, anh kiếm giúp {n} {i} được không?', 'Mẹ tôi ốm, thèm {i}. Anh có thì mang giúp {n} nhé.', 'Nhà đông miệng ăn quá. Anh cho tôi xin {n} {i}, tôi trả công.', 'Tôi cần {n} {i} mà chợ hết hàng rồi. Anh giúp tôi với.'];
const C11_ASK_KID = ['Chú ơi, cháu thèm {i} quá. Chú cho cháu {n} nhé?', 'Mẹ bảo cháu đi kiếm {n} {i} mà cháu không biết tìm đâu.'];
/* the requests of everyone else: food at 3 hearts, a letter to the neighbour they know at 6 */
function c11HQOf(p) {
  if (C11_HQ[p.id]) return C11_HQ[p.id];
  if (p._hq) return p._hq;
  const h = c11Hash(p.n, 9, 77), it = C11_DELIVER[Math.floor(h * C11_DELIVER.length)], n = p.role === 'c' ? 1 : 2 + Math.floor(c11Hash(p.n, 3, 7) * 3), I = C11_ITEMS[it];
  const A = p.role === 'c' ? C11_ASK_KID : C11_ASK_FOOD, ask = A[p.n % A.length].replace('{n}', n).replace('{i}', I.name.toLowerCase());
  const list = [{ at: p.role === 'c' ? 2 : 3, title: `${I.name} cho ${p.name}`, start: ask, steps: [{ t: 'bring', who: p.id, item: it, n }], end: 'Đúng thứ tôi cần! Cảm ơn anh nhiều lắm.', reward: { f: 150, m: Math.round(I.price * n * 1.5) + 15 } }];
  const y = C11_PPL.find(q => q.name === p.y);
  if (p.role !== 'c' && y && !y.stall && y.role !== 'c') list.push({ at: 6, title: `Thư gửi ${y.name}`, start: `Anh đưa giúp lá thư này cho ${y.name} nhé. Có những chuyện tôi không nói được trước mặt.`, give: 'thu_tay', steps: [
    { t: 'carry', who: y.id, item: 'thu_tay', say: `Thư của ${p.name} à? ... Anh về bảo là tôi đọc rồi, tôi không giận nữa.` }, { t: 'talk', who: p.id }],
    end: 'Thật à? Thế thì tốt quá. Gánh nặng trong lòng tôi nhẹ hẳn.', reward: { f: 250, ff: { [y.id]: 100 } } });
  if (p.role !== 'c') list.push({ at: 8, title: `Sửa mái nhà cho ${p.name}`, start: 'Mái nhà tôi dột mấy chỗ, mưa xuống là ướt hết. Anh kiếm giúp sáu khúc gỗ với sáu bó cỏ khô để tôi lợp lại nhé.', steps: [{ t: 'bring', who: p.id, item: 'go', n: 6, say: 'Gỗ đủ rồi, còn cỏ nữa thôi.' }, { t: 'bring', who: p.id, item: 'co', n: 6 }], end: 'Nhà lại khô ráo rồi! Đêm nay ngủ ngon. Chút quà này tôi biếu anh.', reward: { f: 300, m: 80 } });
  return (p._hq = list);
}

/* ---------- state ---------- */
const c11Q = () => SAVE11.q || (SAVE11.q = { act: [], done: {}, board: null, n: 0 });
const c11PersonById = {};
function c11Who(w) {
  if (c11PersonById[w] !== undefined) return c11PersonById[w];
  let p = null;
  if (w[0] === '@') p = C11_PPL.find(q => q.name === w.slice(1));
  else if (w.startsWith('trade:')) p = C11_PPL.find(q => q.trade === w.slice(6) && !q.stall) || C11_PPL.find(q => q.work === 'cho' && !q.stall && q.role === 'a');
  else p = C11_PPL.find(q => q.id === w);
  return (c11PersonById[w] = p ? p.id : null);
}
const c11P = id => C11_PPL.find(q => q.id === id);
const c11IName = id => C11_ITEMS[id] ? C11_ITEMS[id].name.toLowerCase() : id;
function c11StepText(s) {
  const p = c11P(c11Who(s.who)), nm = p ? p.name : '?';
  if (s.t === 'bring') return `Mang ${s.n} ${c11IName(s.item)} cho ${nm} (có ${Math.min(c11Count(s.item), s.n)}/${s.n})`;
  if (s.t === 'carry') return `Đưa ${c11IName(s.item)} cho ${nm}`;
  if (s.t === 'pay') return `Trả ${c4Money(s.m)} cho ${nm}`;
  return `Gặp ${nm}`;
}
const c11StepReady = s => s.t === 'talk' || (s.t === 'bring' && c11Count(s.item) >= s.n) || (s.t === 'carry' && c11Count(s.item) >= 1) || (s.t === 'pay' && SAVE4.money >= s.m);
/* the next request a person can make: enough hearts, not done, nothing of theirs running */
function c11Offer(p) {
  const Q = c11Q(); if (Q.act.some(q => q.giver === p.id)) return null;
  const h = c11Hearts(p.id), L = c11HQOf(p);
  for (let i = 0; i < L.length; i++) { const id = p.id + ':' + i; if (Q.done[id]) continue; return h >= L[i].at ? { ...L[i], id, i } : null; }
  return null;
}
function c11StepFor(pid) { for (const q of c11Q().act) { const s = q.steps[q.si]; if (s && c11Who(s.who) === pid) return { q, s }; } return null; }
const c11Mark = p => { const f = c11StepFor(p.id); if (f && c11StepReady(f.s)) return '?'; return c11Offer(p) ? '!' : f ? '…' : null; };

/* ---------- talking: hand in a step, or take on a request; returns true when the talk was about a quest ---------- */
function c11QuestTalk(v) {
  const p = v.p, s = c11PP(p.id), day = SAVE11.day, Q = c11Q();
  const daily = () => { if (s.td !== day) { s.td = day; s.met = 1; s.f += 20; c11Pop(Math.floor(v.x), Math.floor(v.y) - 2, '♥ +20', '#c8402f'); } };
  const f = c11StepFor(p.id);
  if (f && c11StepReady(f.s)) {
    const { q, s: st } = f;
    if (st.t === 'bring') c11Take(st.item, st.n); else if (st.t === 'carry') c11Take(st.item, 1); else if (st.t === 'pay') { SAVE4.money -= st.m; persist4(); }
    if (st.give && c11Add(st.give, 1)) { c11Put(SAVE11.chest, st.give, 1); c11Msg('Túi đầy, vật được cất vào rương ở nhà', '#a3332a'); }
    daily(); q.si++; c11Sfx.pluck && c11Sfx.pluck();
    if (q.si >= q.steps.length) { c11QuestDone(q, v); return true; }
    c11Say(v, st.say || 'Được rồi, anh làm tiếp đi.'); c11Msg(c11StepText(q.steps[q.si]), '#2f6a4c'); persist11(); return true;
  }
  const o = c11Offer(p);
  if (o) {
    if (o.give && SAVE11.bag.every(Boolean)) { c11Say(v, 'Tôi có việc muốn nhờ, mà túi anh đầy quá. Cất bớt đồ rồi quay lại nhé.'); return true; }
    if (o.give) c11Add(o.give, 1);
    Q.act.push({ id: o.id, title: o.title, giver: p.id, steps: o.steps, si: 0, end: o.end, reward: o.reward, src: 'tim' });
    daily(); c11Say(v, o.start); c11Msg(`Nhận việc: ${o.title}`, '#2f6a4c'); c11Sfx.tap(); persist11(); return true;
  }
  return false;
}
function c11QuestDone(q, v) {
  const Q = c11Q(), R = q.reward || {}, gp = q.giver && c11P(q.giver) ? q.giver : c11Who(q.steps[q.steps.length - 1].who);
  Q.act = Q.act.filter(x => x !== q); Q.done[q.id] = SAVE11.day; Q.n = (Q.n || 0) + 1;
  if (R.m) { SAVE4.money += R.m; persist4(); }
  if (R.f && gp) c11PP(gp).f = Math.min(2500, c11PP(gp).f + R.f);
  for (const [id, pts] of Object.entries(R.ff || {})) { const s = c11PP(id); s.f = Math.min(2500, s.f + pts); s.met = 1; }
  let where = '';
  if (R.item && c11Add(R.item, 1)) { c11Put(SAVE11.chest, R.item, 1); where = ' (túi đầy, đã cất vào rương)'; }
  const bits = [R.m ? '+' + c4Money(R.m) : '', R.f ? `♥ +${R.f}` : '', R.item ? c11IName(R.item) : ''].filter(Boolean).join(' · ');
  c11Say(v, q.end || (q.steps[q.steps.length - 1].say) || 'Cảm ơn anh nhiều lắm!');
  c11Msg(`Xong việc: ${q.title}${bits ? ' · ' + bits : ''}${where}`, '#2f6a4c'); c11Sfx.pluck && c11Sfx.pluck(); persist11();
}

/* ---------- the notice board: a few small jobs a day, due by the end of the next day ---------- */
function c11Board() {
  const Q = c11Q(); if (Q.board && Q.board.day === SAVE11.day) return Q.board;
  const day = SAVE11.day, r = j => c11Hash(day, j, 501), pool = C11_PPL.filter(p => !p.stall && p.role !== 'c' && p.home.a !== 'out'), posts = [];
  const nPost = 2 + (r(0) < .4 ? 1 : 0);
  for (let j = 0; j < nPost; j++) {
    const p = pool[Math.floor(r(j + 1) * pool.length)], id = `b${day}_${j}`;
    if (r(j + 11) >= .45 && r(j + 11) < .75) {                        // something lost somewhere in the village: find it and take it back
      const L = ['non_la', 'quat_mo', 'guoc_moc', 'ro', 'thung', 'bat_su', 'am_dat', 'dua_tre'].filter(i => C11_ITEMS[i]), it = L[Math.floor(r(j + 41) * L.length)], A = ['lang', 'dong', 'ben', 'dinh', 'cho', 'dongx', 'doai', 'bai'].filter(a => C11_AREAS[a]), a = A[Math.floor(r(j + 51) * A.length)];
      posts.push({ id, title: `${p.name} đánh rơi ${C11_ITEMS[it].name.toLowerCase()} ở ${C11_AREAS[a].name.replace(' làng Vũ Đại', '').replace(/^X/, 'x').replace(/^C/, 'c').replace(/^Đ/, 'đ').replace(/^B/, 'b')}`, giver: 'lang', lost: { it, a }, steps: [{ t: 'bring', who: p.id, item: it, n: 1, say: 'Đúng cái của tôi rồi! Tìm mãi không thấy, cảm ơn anh nhiều.' }], reward: { m: 40 + Math.round(C11_ITEMS[it].price * .5), ff: { [p.id]: 150 } } });
    } else if (r(j + 11) < .45) {
      const it = C11_DELIVER[Math.floor(r(j + 21) * C11_DELIVER.length)], n = 2 + Math.floor(r(j + 31) * 4), I = C11_ITEMS[it];
      posts.push({ id, title: `${p.name} cần ${n} ${I.name.toLowerCase()}`, giver: 'lang', steps: [{ t: 'bring', who: p.id, item: it, n, say: 'Ơ, anh nhận việc trên bảng đình à? Cảm ơn anh, đúng lúc nhà tôi cần.' }], reward: { m: Math.round(I.price * n * 3) + 20, ff: { [p.id]: 150 } } });
    } else {
      posts.push({ id, title: `Đưa thư của đình cho ${p.name}`, giver: 'lang', give: 'thu_tay', steps: [{ t: 'carry', who: p.id, item: 'thu_tay', say: 'Thư của đình à? Lại việc làng đây. Cảm ơn anh đã đưa đến tận tay.' }], reward: { m: 30, ff: { [p.id]: 120 } } });
    }
  }
  return (Q.board = { day, posts });
}
function c11OpenBoard() {
  const Q = c11Q(), B = c11Board(), mine = Q.act.filter(q => q.src === 'bang').length;
  const rows = B.posts.map(b => ({ name: b.title, sub: `Hạn: hết ngày mai · ${c11StepText(b.steps[0]).replace(/ \(có.*\)/, '')}`, tag: `Nhận việc · thưởng ${c4Money(b.reward.m)}`, ok: true, f: () => {
    if (Q.act.filter(q => q.src === 'bang').length >= 3) { C11.menu.note = 'Đang nhận ba việc của đình rồi, làm xong đã'; return; }
    if (b.give && SAVE11.bag.every(Boolean)) { C11.menu.note = 'Túi đầy, không cầm thư được'; return; }
    if (b.give) c11Add(b.give, 1);
    if (b.lost) { const M = C11_AREAS[b.lost.a].map, cand = []; for (let y = 2; y < M.length - 2; y++) for (let x = 2; x < M[0].length - 2; x++) if (M[y][x] === 'g') cand.push([x, y]); const [lx, ly] = cand[Math.floor(c11Hash(SAVE11.day, b.id.length + cand.length, 7) * cand.length)]; SAVE11.drops.push({ k: b.lost.it, a: b.lost.a, q: b.id, x: lx + .5, y: ly + .7, x0: lx + .5, y0: ly + .7, t: .01, dur: .01, h: 0 }); }
    Q.act.push({ id: b.id, title: b.title, giver: 'lang', steps: b.steps, si: 0, reward: b.reward, due: SAVE11.day + 1, src: 'bang' });
    B.posts = B.posts.filter(x => x !== b); c11Sfx.tap(); persist11(); c11OpenBoard(); C11.menu.note = `Đã nhận: ${b.title}`;
  } }));
  C11.menu = { title: 'Bảng yết thị', cols: 1, note: rows.length ? `Việc của đình đang làm: ${mine}/3` : 'Hôm nay đình hết việc rồi, mai xem lại', rows };
}
/* at night (before the day turns): the board's jobs due today are dropped (heart requests never run out) */
function c11QuestNewDay() {
  const Q = c11Q(), late = Q.act.filter(q => q.due && SAVE11.day >= q.due);
  for (const q of late) for (const st of q.steps) if (st.t === 'carry' && st.item === 'thu_tay' && q.src === 'bang') c11Take('thu_tay', 1);
  Q.act = Q.act.filter(q => !late.includes(q)); SAVE11.drops = SAVE11.drops.filter(d => !d.q || !late.some(q => q.id === d.q));
  return late.length;
}
/* the list of jobs running, with where each person is now */
function c11OpenLog() { c11OpenBook('viec'); }
/* "!" over someone who has a request, "?" over someone a job can be handed to now, "…" when it cannot yet */
function c11MarkDraw(E, g, sx, sy, k, T) {
  for (const v of C11.vill) {
    const m = c11Mark(v.p); if (!m) continue;
    E.push({ y: v.y + .003, d: () => {
      const X = sx(v.x), Y = sy(v.y) - T * 1.78 * (v.p.sc || 1) + Math.sin(C11.t * 3 + v.p.n) * 3, r = 11;   // above the name
      g.fillStyle = m === '?' ? '#f2cf5a' : m === '!' ? '#fbf4dc' : 'rgba(251,244,220,.75)'; g.strokeStyle = INK; g.lineWidth = 2;
      g.beginPath(); g.arc(X, Y, r, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = m === '!' ? '#a3332a' : INK; g.font = '900 15px "Be Vietnam Pro", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(m, X, Y + 1);
    } });
  }
}
