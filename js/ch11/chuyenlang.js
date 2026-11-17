/* Chương XI · Làng Vũ Đại — một trăm việc mới (owner 2026-11-16: "nghĩ thêm content cho game thú vị đi, làm thêm trăm content và quest").
   Three parts, all on the quest engine of viec.js (steps bring / carry / pay / talk / hunt):
   1. 46 more heart requests for the 23 people of the old stories, at 8 and 10 hearts (C11_HQ lists grow; their stories go on).
   2. CHUYỆN LÀNG: a chain of 34 village stories (C11_CL), offered one at a time as the first row of the đình's board once its day
      has come and the one before it is done; no time limit. They send the player to every place: the forest, the cave, the
      island, the highway, the potters' village, and some need wild things struck down (hunt steps, counted from when taken).
   3. Everyone else gets one request at 9 hearts and one at 10 (C11_HQ9 / C11_HQ10, picked by a hash of the name; children
      have their own two).
   All lines are written anew. Saved in SAVE11.q like every other job (ids '<pid>:<i>' and 'cl:<i>'). */

/* story things used only here: [id, name, description] */
for (const [id, name, desc] of [
  ['thu_con_hac', 'Thư của con lão Hạc', 'Mấy dòng chữ nguệch ngoạc gửi từ đồn điền cao su.'],
  ['thuoc_giai', 'Gói thuốc giải', 'Thầy lang bốc, gói trong lá chuối khô.'],
  ['long_cao', 'Túm lông cáo', 'Lông đỏ hoe, mắc ở hàng rào chuồng gà.'],
  ['ban_do_cu', 'Tấm bản đồ cũ', 'Vẽ bằng mực tàu trên giấy dó: một cái hang, một gốc đa, một dấu chấm đỏ.'],
  ['bai_quan_ho', 'Tờ bài quan họ', 'Lời ca chép tay, mực đã nhoè.'],
  ['goi_thuoc_bac', 'Gói thuốc bắc', 'Mấy vị thuốc đắng, sắc ba bát còn một.'],
  ['chuoi_hat', 'Chuỗi hạt gỗ', 'Một trăm lẻ tám hạt gỗ mít, nhẵn bóng vì tay lần.'],
  ['cuon_so_lang', 'Cuốn sổ làng', 'Sổ đinh của làng, ghi tên từng người.'],
  ['mo_moi', 'Cái mõ mới', 'Mõ tre đục mới, gõ vang ba xóm.'],
  ['gay_truc', 'Gậy trúc', 'Gậy trúc vàng óng, đẽo gọt cẩn thận.'],
  ['vi_thuoc_la', 'Vị thuốc lạ', 'Rễ cây mọc trong hang tối, thầy lang chưa thấy bao giờ.'],
  ['thu_tinh', 'Mảnh sừng chằn tinh', 'Mảnh sừng xanh xám, gõ vào kêu như đá.'],
]) if (!C11_ITEMS[id]) C11_ITEMS[id] = { id, name, cat: 'truyen', price: 0, food: 0, col: '#8a5a3a', desc };

/* ---------- 1. heart requests at 8 and 10 hearts for the story people ---------- */
const C11_HQ_MORE = {
  hac: [
    { at: 8, title: 'Thư từ đồn điền', start: 'Cậu ơi, anh Mõ bảo có thư trên huyện gửi về mà phải trả cước ba mươi đồng. Lão không có tiền...', steps: [
      { t: 'pay', who: 'mo', m: 30, say: 'Thư của con lão Hạc đây. Tôi giữ mấy hôm rồi, sợ lão buồn nên chưa dám đưa.', give: 'thu_con_hac' },
      { t: 'carry', who: 'giao', item: 'thu_con_hac', say: 'Để tôi đọc cho... Nó bảo hết hạn giao kèo sẽ về, nó để dành được ít tiền. Cậu mang thư về cho lão giữ.', give: 'thu_con_hac' },
      { t: 'carry', who: 'hac', item: 'thu_con_hac' }], end: 'Nó sẽ về... Thằng con lão sẽ về. Lão phải giữ mảnh vườn cho nó bằng được.', reward: { f: 300, m: 60, ff: { giao: 100, mo: 80 } } },
    { at: 10, title: 'Mảnh vườn của lão', start: 'Có người lại hỏi mua vườn. Lão muốn gửi cậu ông giáo ba sào vườn này, ông ấy giữ hộ cho con lão. Cậu giúp lão đắp lại bờ rào trước đã.', steps: [
      { t: 'bring', who: 'hac', item: 'tre', n: 8, say: 'Đủ tre rồi. Còn cần ít đá kê chân cột nữa.' },
      { t: 'bring', who: 'hac', item: 'da', n: 10, say: 'Rào chắc rồi. Cậu sang báo ông giáo một tiếng nhé.' },
      { t: 'talk', who: 'giao', say: 'Lão Hạc gửi vườn à? Tôi nhận. Không ai lấy được một tấc đất của lão đâu.' },
      { t: 'talk', who: 'hac' }], end: 'Thế là lão yên lòng rồi. Cái vòng bạc này của bà nhà lão để lại, lão biếu cậu, cậu như con cháu trong nhà.', reward: { f: 400, item: 'vong_bac', ff: { giao: 150 } } }],
  giao: [
    { at: 8, title: 'Lớp học ban đêm', start: 'Tôi muốn mở lớp dạy chữ ban đêm cho người lớn. Cần dầu thắp đèn với giấy dó. Cậu giúp tôi chứ?', steps: [
      { t: 'bring', who: 'giao', item: 'giay_do', n: 5, say: 'Giấy đủ rồi. Giờ cậu đi rủ người đến học: anh Dậu với anh Chí nhé.' },
      { t: 'talk', who: 'dau', say: 'Học chữ à? Biết chữ thì người ta khỏi lừa mình điểm chỉ vào văn tự. Tối mai tôi đến.' },
      { t: 'talk', who: 'chi', say: 'Tao mà học chữ? ... Ừ thì đến. Viết được tên cái Thị cũng được.' },
      { t: 'talk', who: 'giao' }], end: 'Hai người rồi! Một lớp nhỏ thôi, nhưng là cái mầm. Cậu cầm thỏi mực này.', reward: { f: 300, item: 'muc_tau', ff: { dau: 100, chi: 100 } } },
    { at: 10, title: 'Cuốn sách của làng', start: 'Tôi muốn chép lại chuyện làng Vũ Đại vào một cuốn sách, ai cũng có tên. Cậu đi hỏi giúp tôi chuyện của cụ Bá, bà cô Thị và anh Mõ.', steps: [
      { t: 'talk', who: 'ba', say: 'Viết về tôi à? Thì cứ viết: ba đời chánh tổng. Còn những chuyện khác... thôi, để người sau phán xét.' },
      { t: 'talk', who: 'cothi', say: 'Viết rằng tôi nuôi cái Thị từ bé, không để nó đói bữa nào. Thế là đủ.' },
      { t: 'talk', who: 'mo', say: 'Tôi đánh mõ ba mươi năm, đám nào cũng đến, chưa ăn đám nào cho ra bữa. Cứ viết thế cho người ta cười.' },
      { t: 'talk', who: 'giao' }], end: 'Đủ cả rồi. Trang đầu cuốn sách tôi sẽ ghi tên cậu: người đã đi nghe chuyện cả làng.', reward: { f: 400, item: 'sach_nom', m: 100 } }],
  dau: [
    { at: 8, title: 'Con trâu cày chung', start: 'Mấy nhà nghèo bọn tôi muốn góp tiền thuê chung con trâu cày vụ này. Còn thiếu một trăm đồng. Anh góp với chúng tôi nhé?', steps: [
      { t: 'pay', who: 'tugoa', m: 100, say: 'Đủ tiền rồi, con trâu nhà tôi cày cho cả xóm. Nó khoẻ lắm, anh yên tâm.' },
      { t: 'talk', who: 'dau' }], end: 'Vụ này ruộng nhà tôi được cày kỹ. Có thóc, tôi trả anh trước tiên.', reward: { f: 300, ff: { tugoa: 120 }, item: 'gao' } },
    { at: 10, title: 'Mâm cơm đủ đầy', start: 'Từ hồi lấy nhau, nhà tôi chưa có bữa nào đủ đầy. Mai là ngày cưới của tôi với vợ. Anh giúp tôi làm mâm cơm nhé: một con cá chép, ba bát gạo, một bó rau muống.', steps: [
      { t: 'bring', who: 'dau', item: 'ca_chep', n: 1, say: 'Cá to thế! Còn gạo nữa anh ạ.' },
      { t: 'bring', who: 'dau', item: 'gao', n: 3, say: 'Thêm bó rau nữa là đủ.' },
      { t: 'bring', who: 'dau', item: 'muong', n: 1 }], end: 'Đủ rồi. Tối nay cả nhà ngồi quanh mâm, cái Tí với thằng Dần no căng bụng. Anh ngồi ăn với nhà tôi nhé.', reward: { f: 400, ff: { chidau: 200, ti: 200 }, m: 50 } }],
  chidau: [
    { at: 8, title: 'Ổ chó con', start: 'Con chó cái nhà em đẻ lứa mới. Em không muốn bán cho người ta làm thịt. Anh tìm giúp em nhà nào nuôi tử tế: hỏi lão Hạc với ông từ xem.', steps: [
      { t: 'talk', who: 'hac', say: 'Một con à? Cậu Vàng có bạn thì vui lắm. Lão nhận, lão nuôi như con.' },
      { t: 'talk', who: 'tu', say: 'Đình cũng cần con chó canh đêm. Tôi lấy một con.' },
      { t: 'talk', who: 'chidau' }], end: 'Thế là chúng nó có chủ tốt. Lần trước em bán ổ chó mà khóc cả đêm, lần này thì không.', reward: { f: 300, ff: { hac: 100, tu: 100 } } },
    { at: 10, title: 'Gánh khoai không phải bán', start: 'Em gánh khoai ra chợ hai mươi năm rồi. Hôm nay em muốn nấu một nồi khoai mời cả xóm. Anh góp với em mười củ khoai, em lo phần còn lại.', steps: [
      { t: 'bring', who: 'chidau', item: 'khoai', n: 10, say: 'Đủ khoai rồi. Anh mời giúp em bà Tư với bà cô Thị nhé.' },
      { t: 'talk', who: 'tugoa', say: 'Chị Dậu mời à? Tôi đến, mang theo ít dưa muối.' },
      { t: 'talk', who: 'cothi', say: 'Hừ, đi ăn khoai... Ừ thì đi, cho vui.' },
      { t: 'talk', who: 'chidau' }], end: 'Cả xóm ngồi bóc khoai, cười nói rôm rả. Lâu lắm rồi em mới thấy nhà mình đông vui thế.', reward: { f: 400, ff: { tugoa: 150, cothi: 150 }, m: 80 } }],
  ti: [
    { at: 8, title: 'Con diều giấy', start: 'Chú ơi, con muốn làm con diều cho thằng Dần mà không có tre với giấy. Chú giúp con nhé.', steps: [
      { t: 'bring', who: 'ti', item: 'tre', n: 2, say: 'Tre đây rồi! Còn giấy nữa chú.' },
      { t: 'bring', who: 'ti', item: 'giay_do', n: 2 }], end: 'Diều bay cao quá chú ơi! Thằng Dần cười suốt. Con tặng chú hòn sỏi đẹp nhất của con.', reward: { f: 300, item: 'soi' } },
    { at: 10, title: 'Cái Tí đi học', start: 'Chú ơi, con muốn đi học chữ như cậu Quan. Chú hỏi ông giáo giúp con được không?', steps: [
      { t: 'talk', who: 'giao', say: 'Con gái học chữ thì có sao? Bảo nó cứ đến, tôi không lấy tiền. Nhưng phải có bút mực.' },
      { t: 'bring', who: 'ti', item: 'muc_tau', n: 1, say: 'Thỏi mực của con! Con sẽ viết tên chú đầu tiên.' },
      { t: 'talk', who: 'chidau', say: 'Con Tí được đi học à... Anh ơi, em không biết nói gì.' }], end: 'Hôm nay con viết được chữ "Tí" rồi! Chú xem này.', reward: { f: 400, ff: { chidau: 200, giao: 100 } } }],
  chi: [
    { at: 8, title: 'Ngày đầu ở lò rèn', start: 'Tao học nghề ở lò bác Năm được nửa tháng rồi. Bác ấy bảo tao rèn con dao đầu tiên, mà lò hết than. Mày kiếm giúp tao.', steps: [
      { t: 'bring', who: 'tho', item: 'than', n: 6, say: 'Than tốt. Bảo thằng Chí rèn đi, tao đứng xem.' },
      { t: 'talk', who: 'chi' }], end: 'Con dao đầu tiên tao làm bằng tay mình... Không phải để rạch mặt ai. Để chẻ củi. Mày cầm lấy.', reward: { f: 350, item: 'dao_cau', ff: { tho: 100 } } },
    { at: 10, title: 'Lễ hỏi cái Thị', start: 'Bà cô gật đầu rồi. Tao muốn đi hỏi cái Thị cho tử tế: một buồng cau, ít trầu, một chai rượu nếp. Mày làm mối cho tao nhé.', steps: [
      { t: 'bring', who: 'chi', item: 'ruou_nep', n: 1, say: 'Rượu nếp có rồi. Còn trầu cau, mày hỏi bà đồ, bà ấy têm khéo.' },
      { t: 'pay', who: '@bà đồ', m: 40, say: 'Trầu têm cánh phượng đây. Mang cho thằng Chí mà đi hỏi vợ.' },
      { t: 'talk', who: 'cothi', say: 'Lễ tuy mọn mà có lòng. Thôi, tôi gả.' },
      { t: 'talk', who: 'thi' }], end: 'Anh Chí đi hỏi em thật rồi... Em cảm ơn anh. Ngày cưới, anh ngồi mâm trên nhé.', reward: { f: 400, ff: { chi: 300, cothi: 150 }, item: 'nhan_cuoi' } }],
  thi: [
    { at: 8, title: 'Vải cho anh Chí', start: 'Em dệt được tấm vải nâu may áo cho anh Chí, mà còn thiếu sợi. Anh mua giúp em ba cuộn sợi gai nhé.', steps: [
      { t: 'bring', who: 'thi', item: 'soi_gai', n: 3 }], end: 'Đủ sợi rồi. Mặc áo mới, chắc người ta không gọi anh ấy là thằng say nữa.', reward: { f: 300, m: 40 } },
    { at: 10, title: 'Bến sông đêm trăng', start: 'Bọn trẻ vẫn gọi em là ma bến sông. Em muốn đêm rằm này mời chúng nó ra bến ăn chè, để chúng biết em không phải ma.', steps: [
      { t: 'bring', who: 'thi', item: 'che_do_den', n: 3, say: 'Chè có rồi. Anh gọi giúp thằng Cún với cái Nhài.' },
      { t: 'talk', who: '@thằng Cún', say: 'Ăn chè với chị Thị á? Chị ấy có hiền không? ... Thôi được, cháu đi.' },
      { t: 'talk', who: '@cái Nhài', say: 'Cháu đi! Mẹ bảo chị Thị dệt vải đẹp nhất làng.' },
      { t: 'talk', who: 'thi' }], end: 'Chúng nó ngồi quanh em ăn chè, rồi bảo em kể chuyện. Từ nay em có bạn rồi.', reward: { f: 400, m: 60 } }],
  cothi: [
    { at: 8, title: 'Bánh đa cho đám cưới', start: 'Đám cưới cái Thị, tôi muốn tráng một trăm cái bánh đa. Cần gạo với vừng. Anh giúp tôi năm bát gạo.', steps: [
      { t: 'bring', who: 'cothi', item: 'gao', n: 5 }], end: 'Đủ gạo rồi. Bánh đa nhà tôi, cả huyện không ai bằng.', reward: { f: 300, item: 'banh_da' } },
    { at: 10, title: 'Lời xin lỗi muộn', start: 'Tôi nói nặng thằng Chí nhiều quá. Giờ nó tử tế rồi. Anh mang hộ nó gói mứt gừng này, nói là của bà cô.', give: 'mut_gung', steps: [
      { t: 'carry', who: 'chi', item: 'mut_gung', say: 'Bà cô cho tao à? ... Mày về nói, tao gọi bà ấy là cô từ hôm nay.' },
      { t: 'talk', who: 'cothi' }], end: 'Nó gọi tôi là cô à... Thôi, tôi già rồi, mắt kém, gió bụi làm cay mắt.', reward: { f: 400, ff: { chi: 200 }, m: 80 } }],
  ba: [
    { at: 8, title: 'Ruộng tranh chấp', start: 'Hai nhà tá điền cãi nhau vì bờ ruộng. Anh hỏi cả hai xem sao, rồi về tôi phân xử.', steps: [
      { t: 'talk', who: 'dau', say: 'Bờ ruộng là của nhà tôi từ đời ông. Bên kia đắp lấn sang ba thước.' },
      { t: 'talk', who: 'tugoa', say: 'Nước mưa xói lở bờ thôi, tôi đắp lại chứ có lấn ai. Anh đo giúp đi.' },
      { t: 'talk', who: 'ba' }], end: 'Hừm, chia đôi ba thước ấy. Không ai thiệt. Anh xử việc khéo đấy, sau này giúp tôi nữa.', reward: { f: 300, m: 120, ff: { dau: 80, tugoa: 80 } } },
    { at: 10, title: 'Văn tự trả lại', start: 'Tôi già rồi, tháng trước ốm một trận. Cái văn tự ruộng nhà anh Dậu... anh mang trả họ đi. Đừng nói với thằng Cường.', give: 'van_tu_ruong', steps: [
      { t: 'carry', who: 'dau', item: 'van_tu_ruong', say: 'Văn tự ruộng nhà tôi! Cụ Bá trả thật à... Anh thay tôi cảm ơn cụ.' },
      { t: 'talk', who: 'ba' }], end: 'Thế là xong một món nợ. Người ta sống đến già mới biết cái gì nặng, cái gì nhẹ.', reward: { f: 400, ff: { dau: 300, chidau: 300 }, item: 'an_trieu' } }],
  baba: [
    { at: 8, title: 'Bài quan họ ngày xưa', start: 'Ngày xưa có một bài quan họ người ấy hát cho tôi. Tôi quên mất lời rồi. Bà đồ hay thuộc bài cổ, anh hỏi giúp tôi.', steps: [
      { t: 'talk', who: '@bà đồ', say: 'Bài "Người ơi người ở đừng về" à? Tôi chép lại cho, anh cầm về.', give: 'bai_quan_ho' },
      { t: 'carry', who: 'baba', item: 'bai_quan_ho' }], end: 'Đúng là nó... Tôi hát lại một câu thôi nhé, khe khẽ, kẻo bà Cả nghe thấy.', reward: { f: 300, item: 'quat_giay' } },
    { at: 10, title: 'Một buổi về quê mẹ', start: 'Cả đời tôi chưa xin cụ Bá điều gì. Giờ tôi muốn về quê mẹ một hôm. Anh thưa giúp với bà Cả trước, rồi với cụ.', steps: [
      { t: 'talk', who: '@bà Cả', say: 'Cô Ba muốn về quê à? Ừ thì đi, tôi trông nhà cho. Đừng ở lâu.' },
      { t: 'talk', who: 'ba', say: 'Bà Cả đã bằng lòng thì tôi cũng thuận. Anh đưa cô ấy ra đường cái giúp tôi.' },
      { t: 'talk', who: 'baba' }], end: 'Mai tôi được về rồi. Tôi sẽ ra thăm mộ mẹ, rồi đứng nhìn bến sông ngày xưa một lúc. Thế là đủ.', reward: { f: 400, item: 'tram_cai', ff: { ba: 100 } } }],
  cuong: [
    { at: 8, title: 'Học tử tế', start: 'Mày bảo tao chưa ai chơi với tao vì tao cả. Thì tao thử. Mày bảo thằng Cún cho tao chăn trâu cùng một buổi.', steps: [
      { t: 'talk', who: '@thằng Cún', say: 'Cậu Cường đi chăn trâu á? Cậu không đánh cháu chứ? Thế thì được.' },
      { t: 'talk', who: 'cuong' }], end: 'Thằng bé dạy tao thổi sáo lá. Hay đấy. Lần đầu tao thấy vui mà không cần ai sợ mình.', reward: { f: 300, m: 50 } },
    { at: 10, title: 'Xin lỗi anh Chí', start: 'Ngày xưa cha tao đẩy thằng Chí đi tù, tao đứng nhìn. Tao muốn mang chai rượu ngon sang xin lỗi nó... mà nó bỏ rượu rồi. Vậy mang cái gì?', steps: [
      { t: 'talk', who: 'thi', say: 'Anh Chí thích ăn cá nướng. Anh bảo cậu Cường mang hai con cá sang là được.' },
      { t: 'bring', who: 'cuong', item: 'ca_nuong', n: 2, say: 'Cá nướng à. Được, tao mang sang. Mày đi cùng tao nhé.' },
      { t: 'talk', who: 'chi', say: 'Thằng Cường sang xin lỗi tao à? ... Ngồi xuống. Ăn cá đi. Chuyện cũ thôi.' }], end: 'Nó cho tao ngồi cùng mâm. Tao... tao không biết nói gì. Mày là bạn tao.', reward: { f: 400, ff: { chi: 200 }, item: 'ruou_mo' } }],
  tao: [
    { at: 8, title: 'Sổ sưu bị sai', start: 'Sổ sưu năm nay ghi nhầm mấy người đã chết. Anh đối chiếu với anh Mõ xem, anh ta biết đám ma nào cũng đến.', steps: [
      { t: 'talk', who: 'mo', say: 'Năm nay có bốn đám ma: ông Hai xóm Đông, bà Năm xóm Đoài, thằng em anh Dậu, cụ Sáu bến sông. Ghi lại đi.' },
      { t: 'talk', who: 'tao' }], end: 'Bốn người. Thế là năm nay bốn nhà khỏi phải nộp sưu cho người chết. Tôi cũng nhẹ người.', reward: { f: 300, m: 80, ff: { dau: 100 } } },
    { at: 10, title: 'Bỏ nghề thu thuế', start: 'Tôi chán nghề này rồi. Tôi muốn mở quán bán rượu nhỏ ở trạm dừng chân. Anh hỏi giúp chị Thơm có cho thuê góc quán không.', steps: [
      { t: 'talk', who: 'chuc', say: 'Đội Tảo bỏ nghề à? Ha! Thế thì tôi sẽ là khách đầu tiên của hắn.' },
      { t: 'pay', who: 'tao', m: 150, say: 'Anh cho tôi vay trước tiền thuê à... Tôi sẽ trả, lần này trả thật.' },
      { t: 'talk', who: 'tao' }], end: 'Từ mai tôi là chủ quán. Không ai chửi tôi sau lưng nữa. Đây, tôi trả anh trước một nửa, còn bao nhiêu ghi sổ.', reward: { f: 400, m: 220, ff: { chuc: 100 } } }],
  tho: [
    { at: 8, title: 'Lưỡi cày cho làng', start: 'Làng thiếu lưỡi cày. Tôi rèn mười cái, cần năm cục sắt với năm cục than.', steps: [
      { t: 'bring', who: 'tho', item: 'sat', n: 5, say: 'Sắt đây. Than.' },
      { t: 'bring', who: 'tho', item: 'than', n: 5 }], end: 'Mười lưỡi cày. Nhà nào nghèo thì không lấy tiền. Anh cầm một cái chuông đồng.', reward: { f: 300, item: 'chuong_dong', m: 60 } },
    { at: 10, title: 'Nói thật với làng', start: 'Hồi trẻ tôi đi tù thay cụ Bá. Cả làng tưởng tôi là kẻ ác. Tôi muốn ông từ biết sự thật, để trước khi chết khỏi mang tiếng.', steps: [
      { t: 'talk', who: 'tu', say: 'Bác Năm đi tù thay người ta à... Tôi sẽ ghi vào sổ đình. Thần làng biết ai ngay ai gian.' },
      { t: 'talk', who: 'ba', say: 'Hắn nói thật đấy. Tôi nợ hắn. Anh về bảo hắn, tôi sẽ trả lại mảnh vườn nhà hắn.' },
      { t: 'talk', who: 'tho' }], end: 'Cụ Bá nhận rồi à. Hừm. Thế là được. Đây, cái búa đầu tiên tôi rèn hồi ra tù, anh giữ lấy.', reward: { f: 400, item: 'khanh_bac', ff: { tu: 150 } } }],
  chuc: [
    { at: 8, title: 'Huân chương bằng đồng', start: 'Hồi đi lính tôi được cái huân chương, đánh rơi ở bãi sông lâu rồi. Anh có xẻng thì đào giúp ở cồn giữa sông, chỗ đất pha cát. Tìm được đồng thì mang về tôi xem.', steps: [
      { t: 'bring', who: 'chuc', item: 'dong', n: 2 }], end: 'Không phải huân chương của tôi... mà thôi, đồng thì đúc lại được. Tôi kể anh nghe chuyện trận đánh năm ấy nhé. Lần này thật đấy.', reward: { f: 300, m: 70 } },
    { at: 10, title: 'Dạy trẻ đánh võ', start: 'Tôi muốn dạy bọn trẻ trong làng mấy đường côn, để sau này không ai bắt nạt. Anh tìm giúp tôi mấy cây gậy tầm vông.', steps: [
      { t: 'bring', who: 'chuc', item: 'tre', n: 6, say: 'Tre già, tốt đấy. Anh gọi thằng Cún với cậu Quan đến sân đình.' },
      { t: 'talk', who: '@cậu Quan', say: 'Học võ với ông Chức á? Con đi! Đọc sách mãi mỏi lưng lắm.' },
      { t: 'talk', who: 'chuc' }], end: 'Chúng nó múa côn đẹp lắm. Lần đầu tiên có người gọi tôi là thầy. Không phải chuyện khoác lác nữa rồi.', reward: { f: 400, item: 'mui_ten_dong' } }],
  tu: [
    { at: 8, title: 'Cái mõ mới cho làng', start: 'Mõ làng của anh Mõ nứt rồi. Cậu đẽo giúp một cái mõ mới: cần gỗ mít, tôi thay bằng ba khúc gỗ tốt, rồi đưa thợ mộc đục.', steps: [
      { t: 'bring', who: 'tu', item: 'go', n: 3, say: 'Gỗ tốt. Tôi đục xong rồi, cậu mang mõ cho anh Mõ.', give: 'mo_moi' },
      { t: 'carry', who: 'mo', item: 'mo_moi', say: 'Mõ mới! Nghe này... cốc cốc cốc! Vang tận bến sông.' },
      { t: 'talk', who: 'tu' }], end: 'Đêm nay tiếng mõ làng lại vang. Cậu có lòng với làng lắm.', reward: { f: 300, m: 60, ff: { mo: 150 } } },
    { at: 10, title: 'Hát xẩm ở chợ', start: 'Hồi trẻ tôi hát xẩm khắp chợ huyện. Tôi muốn hát một buổi ở chợ làng mình. Cậu ra hỏi cô Duyên cho tôi ngồi đầu quán nước.', steps: [
      { t: 'talk', who: 'duyen', say: 'Ông từ hát xẩm à? Em dọn chỗ đẹp nhất, pha ấm chè ngon nhất.' },
      { t: 'talk', who: 'tu' }], end: '"Thập ân cha mẹ"... Cả chợ đứng nghe, có người khóc. Tôi sống đến từng này tuổi, thế là đủ vui.', reward: { f: 400, item: 'chuoi_hat', ff: { duyen: 100 } } }],
  do: [
    { at: 8, title: 'Câu đối Tết cho nhà nghèo', start: 'Tết sắp đến, tôi muốn viết câu đối cho các nhà nghèo, không lấy tiền. Cậu mua giúp tôi giấy đỏ: năm tờ giấy dó với chút son.', steps: [
      { t: 'bring', who: 'do', item: 'giay_do', n: 5, say: 'Giấy đây. Còn son nữa.' },
      { t: 'bring', who: 'do', item: 'son_ta', n: 1 }], end: 'Năm nay nhà nào cũng có đôi câu đối. Chữ ông đồ không phải chỉ để bán cho nhà giàu.', reward: { f: 300, item: 'cau_doi' } },
    { at: 10, title: 'Truyền nghề viết chữ', start: 'Tôi già rồi, tay run. Tôi muốn dạy cậu Quan viết chữ Hán cho đẹp, để làng còn người viết câu đối. Cậu nói với ông Viên giúp tôi.', steps: [
      { t: 'talk', who: '@ông Viên', say: 'Ông đồ muốn dạy cháu tôi à? Phúc nhà tôi lớn quá. Mai tôi cho nó sang.' },
      { t: 'talk', who: '@cậu Quan', say: 'Con sẽ chăm chỉ ạ. Con sẽ viết đẹp như ông đồ!' },
      { t: 'talk', who: 'do' }], end: 'Thế là nghề không mất. Tôi viết tặng cậu một chữ Phúc, treo ở nhà cho ấm.', reward: { f: 400, item: 'tranh_dong_ho' } }],
  duyen: [
    { at: 8, title: 'Chè sen cho khách quý', start: 'Có khách trên tỉnh về đặt chè ướp sen. Em cần năm bông sen tươi. Ao đình có sen đấy.', steps: [
      { t: 'bring', who: 'duyen', item: 'hoa_sen', n: 5 }], end: 'Thơm quá! Mẻ chè này em bán được giá. Anh cầm một gói chè ngon nhất.', reward: { f: 300, item: 'che_uop_sen' } },
    { at: 10, title: 'Quán nước của em', start: 'Em không đợi ai nữa. Em muốn quán nước này to hơn, có thêm bàn ghế cho khách ngồi lâu. Anh giúp em ít gỗ với tre nhé.', steps: [
      { t: 'bring', who: 'duyen', item: 'go', n: 10, say: 'Gỗ đủ rồi. Thêm tre làm mái hiên nữa.' },
      { t: 'bring', who: 'duyen', item: 'tre', n: 6 }], end: 'Quán nước nhà Duyên giờ đẹp nhất làng! Anh đến lúc nào, chè em pha không lấy tiền.', reward: { f: 400, m: 150 } }],
  lanh: [
    { at: 8, title: 'Đứa con đầu lòng', start: 'Vợ tôi sắp sinh! Bà đỡ dặn phải có trứng gà với gừng để vợ tôi bồi bổ. Anh giúp tôi với.', steps: [
      { t: 'bring', who: 'lanh', item: 'trung_ga', n: 5, say: 'Trứng đây rồi. Gừng nữa anh ơi.' },
      { t: 'bring', who: 'lanh', item: 'gung', n: 3 }], end: 'Thằng cu ra đời rồi! Khóc to lắm. Nhà tôi muốn anh đặt tên cho nó.', reward: { f: 300, m: 80 } },
    { at: 10, title: 'Đầy tháng thằng cu', start: 'Đầy tháng thằng cu, tôi muốn mời cả xóm. Anh giúp tôi xôi gấc với gà.', steps: [
      { t: 'bring', who: 'lanh', item: 'xoi_gac', n: 3, say: 'Xôi đỏ thế này thì may mắn lắm. Còn gà nữa.' },
      { t: 'bring', who: 'lanh', item: 'chao_ga', n: 2 }], end: 'Cả xóm đến chúc mừng. Anh là cha đỡ đầu của thằng cu nhà tôi, nhớ đấy!', reward: { f: 400, item: 'vong_bac' } }],
  kieu: [
    { at: 8, title: 'Tiếng đàn nguyệt', start: 'Đàn của em đứt dây rồi. Người buôn chuyến ngoài chợ có bán dây tơ. Anh mua giúp em nhé.', steps: [
      { t: 'pay', who: 'trade:buôn chuyến', m: 60, say: 'Dây tơ tằm loại tốt đây. Cô Kiều đàn thì phải dây này.' },
      { t: 'talk', who: 'kieu' }], end: 'Anh nghe này... Bài "Bạc mệnh" em tự soạn. Buồn thật, nhưng em không còn sợ nữa.', reward: { f: 300, item: 'to_tam' } },
    { at: 10, title: 'Em ở lại làng', start: 'Có người mối lái gả em đi xa. Em không muốn đi. Anh nói giúp với cha em là ông Viên, và với cô Vân.', steps: [
      { t: 'talk', who: '@cô Vân', say: 'Chị ở lại thật à? Em mừng quá! Anh nói với cha giúp em.' },
      { t: 'talk', who: '@ông Viên', say: 'Con Kiều muốn ở lại... Thôi được. Tiền nợ để tôi tự lo, không bán con.' },
      { t: 'talk', who: 'kieu' }], end: 'Cha bằng lòng rồi. Em sẽ dạy đàn cho trẻ con trong làng. Cảm ơn anh, người duy nhất hỏi em muốn gì.', reward: { f: 400, item: 'ngoc_bich' } }],
  xuan: [
    { at: 8, title: 'Bộ áo trên tỉnh', start: 'Tôi muốn may một bộ áo the cho thật oai mà thợ làng không biết kiểu tỉnh. Anh mua giúp tôi tấm lụa Hà Đông.', steps: [
      { t: 'bring', who: 'xuan', item: 'lua_ha_dong', n: 1 }], end: 'Đẹp! Mặc vào trông như quan. Nhưng mà... anh thấy tôi mặc áo nâu có xấu không?', reward: { f: 300, m: 120 } },
    { at: 10, title: 'Cậu ấm học cày', start: 'Nói thật nhé, tôi chẳng biết làm gì cả. Anh Dậu bảo dạy tôi cày. Anh đi cùng cho tôi đỡ ngại.', steps: [
      { t: 'talk', who: 'dau', say: 'Cậu Xuân đi cày à? Được, nhưng phải xắn quần lên, bùn ngập gối đấy.' },
      { t: 'talk', who: 'xuan' }], end: 'Ngã ba lần, bùn đầy mặt. Mà vui thật! Lần đầu tiên tôi làm ra được một cái gì.', reward: { f: 400, ff: { dau: 150 }, item: 'non_la' } }],
  tugoa: [
    { at: 8, title: 'Họ góp tiền', start: 'Tôi đứng ra lập một bát họ cho mấy nhà goá trong làng. Anh góp một phần đầu, năm mươi đồng, cho người ta tin.', steps: [
      { t: 'pay', who: 'tugoa', m: 50, say: 'Anh góp rồi thì người ta theo. Còn phải báo bà Hàng, bà ấy đi nói cho cả làng.' },
      { t: 'talk', who: '@bà Hàng', say: 'Bát họ của bà Tư à? Tôi nói cho cả làng biết ngay, không sót nhà nào!' },
      { t: 'talk', who: 'tugoa' }], end: 'Mười nhà góp rồi. Nhà nào túng thì hốt trước. Anh góp năm mươi, tôi trả anh một trăm khi đến lượt.', reward: { f: 300, m: 100 } },
    { at: 10, title: 'Con trâu về chuồng', start: 'Con trâu Lý Cường trả lại nay đã già. Tôi muốn nó được nghỉ. Anh giúp tôi cỏ cho nó ăn mùa đông này.', steps: [
      { t: 'bring', who: 'tugoa', item: 'co', n: 20 }], end: 'Đủ cỏ cả mùa đông. Nó cày cho nhà tôi cả đời, giờ nó được nghỉ. Người cũng thế, trâu cũng thế.', reward: { f: 400, item: 'trap_trau', m: 80 } }],
  dong: [
    { at: 8, title: 'Bỏ bùa, học thuốc', start: 'Tôi muốn học nghề thuốc của thầy lang, bỏ nghề bói. Anh hỏi thầy giúp tôi.', steps: [
      { t: 'talk', who: 'trade:thầy lang', say: 'Mụ ấy muốn học thuốc à? Được, nhưng phải biết lá. Bảo mụ hái cho tôi ba nắm ngải cứu.' },
      { t: 'bring', who: 'dong', item: 'ngai_cuu', n: 3, say: 'Đây là ngải cứu đúng không anh? Tôi mang cho thầy.' },
      { t: 'talk', who: 'trade:thầy lang' }], end: 'Đúng lá rồi. Mụ học được. Từ nay làng có thêm người biết thuốc.', reward: { f: 300, item: 'goi_thuoc_bac' } },
    { at: 10, title: 'Đốt đống bùa', start: 'Tôi muốn đốt hết bùa chú đã bán, xin lỗi những người đã tin tôi. Anh mang lời xin lỗi đến bà Hàng, để cả làng biết.', steps: [
      { t: 'talk', who: '@bà Hàng', say: 'Mụ đồng xin lỗi cả làng à? Trời! Chuyện này phải nói ngay!' },
      { t: 'talk', who: 'dong' }], end: 'Cả làng biết rồi. Có người chửi, có người cười, có người mang trả bùa. Tôi nhẹ người. Bùa cuối cùng này, anh giữ làm kỷ niệm thôi nhé.', reward: { f: 400, item: 'bua_chu', m: 100 } }],
  mo: [
    { at: 8, title: 'Đám nào cũng đến', start: 'Đám giỗ nhà cụ Bá tuần sau mà người ta chưa mời tôi ngồi mâm bao giờ. Anh nói giúp với bà Ba.', steps: [
      { t: 'talk', who: 'baba', say: 'Anh Mõ đánh mõ cho làng ba mươi năm. Năm nay tôi sẽ xếp anh ấy ngồi mâm giữa.' },
      { t: 'talk', who: 'mo' }], end: 'Ngồi mâm giữa! Tôi... tôi phải mặc áo mới. Anh cho tôi mượn cái áo the được không? Đùa thôi.', reward: { f: 300, ff: { baba: 100 }, m: 40 } },
    { at: 10, title: 'Truyền mõ', start: 'Tôi già rồi, chân yếu. Tôi muốn tìm người đánh mõ thay. Thằng Cún nhanh nhẹn, anh hỏi nó.', steps: [
      { t: 'talk', who: '@thằng Cún', say: 'Cháu đánh mõ cho làng á? Cháu làm! Cốc cốc cốc, loa loa loa!' },
      { t: 'talk', who: 'tu', say: 'Thằng Cún à? Được, đình sẽ trả công cho nó, không để nó đói như anh Mõ ngày xưa.' },
      { t: 'talk', who: 'mo' }], end: 'Đình trả công cho thằng bé, không phải đi xin ăn đám như tôi. Thế là thế hệ sau đỡ khổ. Anh làm được việc lớn đấy.', reward: { f: 400, m: 120, ff: { tu: 100 } } }],
};
for (const [id, L] of Object.entries(C11_HQ_MORE)) if (C11_HQ[id]) C11_HQ[id].push(...L.filter(q => q.steps.every(s => !s.item || C11_ITEMS[s.item]) && (!q.give || C11_ITEMS[q.give])));

/* ---------- 3. one request at 9 hearts and one at 10 for everyone else ---------- */
const C11_HQ9 = [
  { title: 'Cỗ giỗ ông nội', start: 'Mai là giỗ ông nội. Nhà tôi muốn có con cá chép kho với đĩa xôi. Anh giúp tôi nhé.', steps: [['ca_chep', 1], ['xoi_do', 2]], end: 'Mâm giỗ đủ đầy rồi. Ông nội trên kia chắc vui lắm.', m: 90 },
  { title: 'Sắm nồi mới', start: 'Nồi nhà tôi thủng rồi. Anh có ra làng gốm thì mua hộ tôi cái nồi đất.', steps: [['noi_dat', 1]], end: 'Nồi mới, cơm chín đều. Cảm ơn anh.', m: 50 },
  { title: 'Thuốc cho người ốm', start: 'Mẹ tôi ho mãi không khỏi. Thầy lang bảo cần mật ong rừng với gừng.', steps: [['mat_ong_rung', 1], ['gung', 2]], end: 'Mẹ tôi uống được mấy hôm, đỡ ho rồi. Ơn anh lớn lắm.', m: 140 },
  { title: 'Măng cho bữa cơm', start: 'Nhà tôi thèm canh măng. Anh vào rừng đào giúp tôi bốn cây măng nhé.', steps: [['mang', 4]], end: 'Măng non ngọt quá. Bữa nay nhà tôi có canh ngon.', m: 70 },
  { title: 'Chiếu mới cho nhà', start: 'Chiếu nhà tôi rách cả rồi. Anh có thì để lại cho tôi một đôi chiếu cói.', steps: [['chieu_coi', 1]], end: 'Chiếu thơm mùi cói mới. Đêm nay nằm êm lưng.', m: 80 },
  { title: 'Đèn cho đêm dài', start: 'Đêm nhà tôi tối om, bọn trẻ học không được. Anh kiếm giúp tôi ít dầu đèn.', steps: [['dau_hoa', 3]], end: 'Có đèn rồi, bọn trẻ ngồi học đến khuya. Cảm ơn anh.', m: 60 },
  { title: 'Cá cho bữa tiệc', start: 'Nhà tôi có khách xa. Anh câu giúp tôi hai con cá trắm nhé.', steps: [['ca_tram', 2]], end: 'Cá to thế này thì khách khen hết lời. Anh cầm tiền.', m: 150 },
  { title: 'Gạch xây bếp', start: 'Tôi muốn xây lại cái bếp cho chắc. Anh kiếm giúp tôi tám viên gạch với ít vôi.', steps: [['gach', 8], ['voi', 2]], end: 'Bếp mới, lửa đượm. Vợ tôi khen anh mãi.', m: 120 },
  { title: 'Rượu mừng thọ', start: 'Bố tôi sắp tròn bảy mươi. Tôi muốn có chai rượu nếp ngon để mừng thọ cụ.', steps: [['ruou_nep', 1]], end: 'Cụ uống một chén, khen rượu ngon, khen con cháu có hiếu. Cảm ơn anh.', m: 100 },
];
const C11_HQ10 = [
  { title: 'Hỏi vợ cho con', start: 'Thằng con tôi đến tuổi lấy vợ. Anh làm mối giúp tôi: mang trầu cau sang hỏi {y} xem nhà ấy có con gái nào không.', talk: 1, say: 'Nhà tôi có đứa cháu gái nết na. Bảo nhà ấy cứ mang trầu sang, rồi hai bên nói chuyện.', end: 'Nhà ấy nhận lời rồi! Anh là ông mối, đám cưới phải ngồi mâm trên.', m: 200 },
  { title: 'Làm lại cái giếng', start: 'Giếng nhà tôi cạn, đáy toàn bùn. Anh giúp tôi ít đá với sỏi để kè lại.', steps: [['da', 12], ['soi', 10]], end: 'Giếng trong vắt rồi. Từ nay cả xóm sang gánh nước nhà tôi cũng được.', m: 150 },
  { title: 'Nối lại tình xóm', start: 'Tôi với {y} giận nhau vì con gà sang vườn. Mấy năm rồi chẳng chào nhau. Anh sang nói giúp một câu.', talk: 1, say: 'Nó nhờ anh à? Ừ thì... chuyện con gà có gì đâu. Bảo nó tối sang uống nước.', end: 'Tối qua hai nhà ngồi uống nước với nhau, cười như chưa có chuyện gì. Cảm ơn anh.', m: 120 },
  { title: 'Bàn thờ tổ tiên', start: 'Bàn thờ nhà tôi mối mọt cả rồi. Anh kiếm giúp tôi gỗ tốt và ít sơn ta để đóng lại.', steps: [['go', 12], ['son_ta', 1]], end: 'Bàn thờ mới bóng loáng. Tổ tiên phù hộ anh.', m: 200 },
  { title: 'Ruộng sau mùa lũ', start: 'Lũ năm ngoái cuốn mất bờ ruộng nhà tôi. Anh giúp tôi đất sét đắp lại.', steps: [['dat_set', 15]], end: 'Bờ ruộng cao hơn cả năm xưa. Vụ này ruộng nhà tôi không sợ nước nữa.', m: 160 },
  { title: 'Áo mới ngày Tết', start: 'Cả đời tôi chưa may được áo mới cho vợ. Anh mua giúp tôi tấm vải nâu.', steps: [['vai_nau', 1]], end: 'Vợ tôi mặc áo mới, cứ đứng soi mãi bên chum nước. Tôi không biết cảm ơn anh thế nào.', m: 120 },
  { title: 'Chuồng gà chắc chắn', start: 'Cáo lại bắt mất hai con gà. Tôi muốn rào lại chuồng gà. Anh giúp tôi tre với gỗ.', steps: [['tre', 6], ['go', 6]], end: 'Chuồng chắc rồi, cáo có răng sắt cũng chịu. Mỗi tuần tôi để phần anh mấy quả trứng.', m: 130 },
  { title: 'Bộ ấm chén', start: 'Nhà tôi có khách mà không có bộ ấm chén tử tế. Anh mua giúp tôi cái ấm đất với mấy cái bát sứ.', steps: [['am_dat', 1], ['bat_su', 2]], end: 'Khách đến, nhà tôi rót chè mời ra dáng lắm. Anh là người tốt.', m: 110 },
  { title: 'Lời nhắn gửi', start: 'Có điều tôi giữ trong lòng lâu rồi, muốn gửi cho {y}. Anh đưa lá thư này, rồi về nói tôi nghe người ta đáp sao.', thu: 1, say: 'Thư của người ấy à... Anh về nói, tôi không còn giận. Bao giờ rỗi tôi sang thăm.', end: 'Thế là lòng tôi nhẹ rồi. Anh coi tôi như người nhà, tôi cũng coi anh như con cháu.', m: 150 },
];
const C11_HQ_KID = [
  { at: 9, title: 'Con dế chọi', start: 'Chú ơi, bọn bạn có dế chọi mà cháu không có. Chú cho cháu ít quả rừng để cháu đổi dế nhé.', steps: [['qua', 3]], end: 'Cháu đổi được con dế mèn to nhất xóm! Chú xem nó gáy này.', m: 30 },
  { at: 10, title: 'Bữa sinh nhật', start: 'Mai là ngày cháu ra đời. Mẹ cháu bảo không có tiền làm gì cả. Chú cho cháu một cái bánh nhé?', steps: [['banh_troi', 1]], end: 'Bánh trôi ngọt quá! Năm nay cháu có bánh sinh nhật rồi. Cháu thương chú nhất.', m: 20 },
];
const c11Tpl = (p, T, at) => {
  const y = C11_PPL.find(q => q.name === p.y && !q.stall && q.role !== 'c') || C11_PPL.filter(q => q !== p && !q.stall && q.role !== 'c' && q.home.a !== 'out')[p.n % 40];
  const start = T.start.replace('{y}', y ? y.name : 'người xóm bên');
  if ((T.talk || T.thu) && y) return { at, title: `${T.title} (${p.name})`, start, give: T.thu ? 'thu_tay' : undefined, steps: [T.thu ? { t: 'carry', who: y.id, item: 'thu_tay', say: T.say } : { t: 'talk', who: y.id, say: T.say }, { t: 'talk', who: p.id }], end: T.end, reward: { f: 300, m: T.m, ff: { [y.id]: 120 } } };
  const st = (T.steps || []).filter(([it]) => C11_ITEMS[it]); if (!st.length) return null;
  return { at, title: `${T.title} (${p.name})`, start, steps: st.map(([item, n], i) => ({ t: 'bring', who: p.id, item, n, say: i < st.length - 1 ? 'Được rồi, còn một thứ nữa thôi.' : undefined })), end: T.end, reward: { f: 300, m: T.m } };
};
{
  const old = c11HQOf;
  c11HQOf = function (p) {
    const L = old(p); if (C11_HQ[p.id] || L._more) return L;
    L._more = 1;
    if (p.role === 'c') { for (const T of C11_HQ_KID) { const q = c11Tpl(p, T, T.at); if (q) L.push(q); } return L; }
    const a = c11Tpl(p, C11_HQ9[Math.floor(c11Hash(p.n, 5, 909) * C11_HQ9.length)], 9), b = c11Tpl(p, C11_HQ10[Math.floor(c11Hash(p.n, 6, 910) * C11_HQ10.length)], 10);
    if (a) L.push(a); if (b) L.push(b);
    return L;
  };
}

/* ---------- 2. CHUYỆN LÀNG: 34 stories one after another on the đình's board ---------- */
/* from = earliest day; steps as in viec.js; hunt steps get their starting count when taken */
const C11_CL = [
  // -- Con cáo đêm
  { from: 3, t: 'Chuồng gà nhà ai bị phá', why: 'Sáng nay ba nhà kêu mất gà. Đình nhờ người tìm xem thủ phạm.', steps: [
    { t: 'talk', who: 'mo', say: 'Tôi thấy lông gà vương ở hàng rào nhà bà Tư. Anh qua đó xem.' },
    { t: 'talk', who: 'tugoa', say: 'Túm lông đỏ này mắc ở rào nhà tôi. Không phải lông gà đâu, anh xem.', give: 'long_cao' },
    { t: 'carry', who: 'chuc', item: 'long_cao', say: 'Lông cáo! Đúng như tôi nói mà. Từ nay đừng ai bảo tôi trộm gà nữa.' }], end: 'Đúng lông cáo. Cả làng phải xin lỗi Binh Chức rồi.', m: 60, ff: { chuc: 150 } },
  { from: 4, t: 'Bẫy cáo', why: 'Cáo vẫn về bắt gà. Binh Chức bày cách làm bẫy.', steps: [
    { t: 'talk', who: 'chuc', say: 'Hồi đi lính tôi đặt bẫy giỏi lắm. Anh kiếm cho tôi bốn cây tre với ít dây thừng.' },
    { t: 'bring', who: 'chuc', item: 'tre', n: 4, say: 'Tre có rồi. Còn dây thừng.' },
    { t: 'bring', who: 'chuc', item: 'day_thung', n: 1 }], end: 'Bẫy đặt ở bờ rừng trúc rồi. Đêm nay cáo mà sa vào thì đừng hòng ra.', m: 80, ff: { tugoa: 80 } },
  { from: 5, t: 'Cáo mẹ và bầy con', why: 'Bẫy sập, nhưng trong bẫy là một con cáo mẹ đang nuôi con.', steps: [
    { t: 'talk', who: 'chuc', say: 'Cáo mẹ, đàn con nó chờ trong hang. Giết thì tội. Anh hỏi ông từ xem nên làm sao.' },
    { t: 'talk', who: 'tu', say: 'Thả nó vào rừng rậm, xa làng. Đêm đêm để ít đồ ăn ở bìa rừng, nó khỏi về bắt gà.' },
    { t: 'bring', who: 'chuc', item: 'ca_ro', n: 3 }], end: 'Tôi thả nó ở rừng rậm rồi, để lại mấy con cá. Từ nay làng hết mất gà. Ông từ khôn thật.', m: 100, ff: { tu: 100 } },
  // -- Ma bến sông
  { from: 6, t: 'Ma bến sông', why: 'Trẻ con đồn đêm đêm có bóng trắng ở bến sông, không đứa nào dám ra tắm.', steps: [
    { t: 'talk', who: '@thằng Cún', say: 'Cháu thấy thật! Bóng trắng ngồi trên cầu ván, hát ư ử, rồi biến mất!' },
    { t: 'talk', who: 'thi', say: 'Bóng trắng ấy là em... Đêm em ra giặt vải, đội cái khăn trắng. Em hát cho đỡ sợ.' },
    { t: 'talk', who: '@thằng Cún' }], end: 'Chị Thị à? Chị ấy hát hay thế cơ à... Cháu xin lỗi chị ấy. Mai cháu ra tắm sông!', m: 50, ff: { thi: 150 } },
  { from: 7, t: 'Đèn cho bến sông', why: 'Bến sông tối, người đi đò đêm hay trượt chân. Làng muốn treo một cái đèn.', steps: [
    { t: 'bring', who: 'tu', item: 'den_dau', n: 1, say: 'Đèn có rồi. Cậu mang ra bến, hỏi bác lái đò treo ở đâu.' },
    { t: 'talk', who: 'trade:lái đò', say: 'Treo ở đầu cầu ván là đẹp. Từ nay đêm tôi chở đò không sợ lật nữa.' }], end: 'Đèn bến sông sáng rồi. Đêm nay bến đông người ngồi hóng mát.', m: 80 },
  // -- Hũ bạc của cụ Bá
  { from: 8, t: 'Hũ bạc bị mất', why: 'Nhà cụ Bá kêu mất hũ bạc. Cụ đòi trói người làm. Đình nhờ người tìm rõ thực hư.', steps: [
    { t: 'talk', who: 'ba', say: 'Hũ bạc chôn dưới gốc cau. Sáng nay chỉ còn cái hố. Thằng Sứt trực đêm, chắc là nó.' },
    { t: 'talk', who: '@thằng Sứt', say: 'Con không lấy! Đêm qua con thấy dấu chân bùn đi về phía bến sông. Chân to lắm, không phải chân con.' },
    { t: 'talk', who: 'trade:lái đò', say: 'Đêm qua có người thuê đò sang bên kia sông, xách cái hũ nặng. Đội mũ dạ kiểu tỉnh.' }], end: 'Người đội mũ dạ kiểu tỉnh... Làng mình chỉ có một người như thế.', m: 60, ff: { } },
  { from: 9, t: 'Người đội mũ dạ', why: 'Manh mối dẫn đến cậu Xuân. Phải hỏi cho ra lẽ trước khi cụ Bá làm to chuyện.', steps: [
    { t: 'talk', who: 'xuan', say: 'Tôi... tôi nợ tiền bạc trên tỉnh. Lý Cường bảo tôi lấy hũ bạc, chia đôi. Tôi sợ lắm.' },
    { t: 'talk', who: 'cuong', say: 'Mày biết rồi à? ... Ừ, tao bày ra. Tao muốn có tiền riêng, không phải xin cha.' },
    { t: 'talk', who: 'baba', say: 'Cường mà bị lộ thì cụ đánh chết. Anh khuyên nó mang trả, tôi sẽ nói là tìm thấy dưới gốc cau.' },
    { t: 'talk', who: 'cuong' }], end: 'Tao mang trả rồi. Bà Ba nói đỡ cho tao. Thằng Sứt khỏi bị trói. Mày... đừng kể với ai.', m: 120, ff: { cuong: 150, baba: 100, xuan: 80 } },
  // -- Mùa lũ
  { from: 10, t: 'Nước sông lên', why: 'Mưa liền mấy hôm, nước sông lên to. Đình gọi trai làng đi chèn đê.', steps: [
    { t: 'bring', who: 'tao', item: 'dat_set', n: 10, say: 'Đất có rồi. Còn đá kè chân đê nữa.' },
    { t: 'bring', who: 'tao', item: 'da', n: 10 }], end: 'Đê giữ được rồi. Năm nay làng khỏi mất trắng. Tôi sẽ báo lên huyện tên anh.', m: 150, ff: { dau: 80 } },
  { from: 11, t: 'Cứu đồ nhà bến', why: 'Mấy nhà ở bến sông bị nước vào nhà, đồ đạc ướt hết. Họ cần thóc và củi khô.', steps: [
    { t: 'bring', who: 'thi', item: 'cui_kho', n: 6, say: 'Củi khô đây rồi, nhà em nhóm được bếp. Anh mang gạo cho bà cô nữa.' },
    { t: 'bring', who: 'cothi', item: 'gao', n: 3 }], end: 'Nước rút rồi, nhà còn nguyên. Hừ... cảm ơn anh. Tôi ít khi nói câu này đâu.', m: 100, ff: { thi: 100, cothi: 150 } },
  // -- Bệnh trong làng
  { from: 12, t: 'Cơn sốt mùa nước', why: 'Sau lũ, mấy nhà trẻ con lên cơn sốt. Thầy lang cần thuốc gấp.', steps: [
    { t: 'talk', who: 'trade:thầy lang', say: 'Sốt rét mùa nước. Cần ngải cứu, gừng và mật ong. Đi ngay đi, trẻ con không đợi được.' },
    { t: 'bring', who: 'trade:thầy lang', item: 'ngai_cuu', n: 3, say: 'Ngải cứu được rồi. Gừng.' },
    { t: 'bring', who: 'trade:thầy lang', item: 'gung', n: 3, say: 'Gừng. Còn mật ong rừng.' },
    { t: 'bring', who: 'trade:thầy lang', item: 'mat_ong_rung', n: 1 }], end: 'Thuốc sắc xong rồi. Bọn trẻ hạ sốt cả. Anh cứu được mấy mạng người đấy.', m: 220, ff: { chidau: 100 } },
  { from: 13, t: 'Thuốc giải cho mụ đồng', why: 'Mụ đồng ăn phải nấm độc trong rừng, nằm mê man.', steps: [
    { t: 'talk', who: 'trade:thầy lang', say: 'Phải có mật rắn mới giải được. Rắn ở rừng rậm, anh cẩn thận.' },
    { t: 'bring', who: 'trade:thầy lang', item: 'mat_ran', n: 1, say: 'Mật rắn đây. Tôi bốc thuốc rồi, anh mang sang nhà mụ.', give: 'thuoc_giai' },
    { t: 'carry', who: 'dong', item: 'thuoc_giai' }], end: 'Tôi sống lại rồi... Bùa chú tôi bán chẳng cứu được tôi. Thuốc của thầy lang cứu tôi.', m: 180, ff: { dong: 200 } },
  // -- Rừng rậm
  { from: 14, t: 'Lợn rừng phá nương', why: 'Đàn lợn rừng kéo ra phá nương ngô xóm Đông. Đình tìm người dám vào rừng rậm.', steps: [
    { t: 'hunt', who: 'dau', kind: 'lon', n: 2, say: 'Hạ được hai con à? Anh dũng thật. Nương ngô yên rồi.' }], end: 'Thịt lợn rừng chia cho cả xóm. Ai cũng nhắc tên anh.', m: 200, ff: { dau: 120 } },
  { from: 15, t: 'Người đi rừng mất tích', why: 'Anh tiều phu xóm Đoài vào rừng rậm hai hôm chưa về.', steps: [
    { t: 'talk', who: 'mo', say: 'Anh ấy đi lấy mật ong rừng. Hay đi về phía hang động. Anh đi tìm đi, tôi đánh mõ báo cả làng.' },
    { t: 'bring', who: 'mo', item: 'mat_ong_rung', n: 1, say: 'Mật ong của anh ấy đây à? Anh tìm thấy anh ấy ngồi ở cửa hang, què chân, mang về được rồi!' }], end: 'Anh tiều phu về rồi, chỉ trẹo chân. Nhà anh ấy lạy anh mấy lạy.', m: 160 },
  { from: 16, t: 'Tổ ong khổng lồ', why: 'Người đi rừng thấy một tổ ong to bằng cái nong. Ông giáo muốn mật về làm thuốc cho trẻ.', steps: [
    { t: 'bring', who: 'giao', item: 'mat_ong_rung', n: 2 }], end: 'Hai hũ mật vàng óng. Bọn trẻ trong lớp ho thì có thuốc rồi.', m: 140, item: 'sap_ong' },
  // -- Hang động
  { from: 17, t: 'Dơi trong hang than', why: 'Người lấy than trong hang bị dơi tấn công. Đình nhờ người dẹp.', steps: [
    { t: 'hunt', who: 'tu', kind: 'doi', n: 5, say: 'Dơi bớt rồi, người làng lại dám vào hang lấy than.' }], end: 'Hang than yên rồi. Mùa đông này nhà nào cũng có lửa.', m: 140 },
  { from: 18, t: 'Than cho mùa đông', why: 'Mùa đông sắp đến, mấy nhà già không có than sưởi.', steps: [
    { t: 'bring', who: 'hac', item: 'than', n: 4, say: 'Lão có than sưởi rồi. Cậu mang nốt cho bà cụ Dậu.' },
    { t: 'bring', who: '@bà cụ Dậu', item: 'than', n: 4 }], end: 'Ấm quá... Cả đời bà chưa đắp đủ ấm mùa đông nào. Cháu là người tốt.', m: 120, ff: { hac: 100 } },
  { from: 19, t: 'Vị thuốc trong hang tối', why: 'Thầy lang nghe đồn trong hang có loại rễ chữa được bệnh phổi.', steps: [
    { t: 'bring', who: 'trade:thầy lang', item: 'ca_hang', n: 1, say: 'Cá hang mù! Chỗ có loài cá này thì có rễ thuốc. Anh đào thử đất hang mang về.' },
    { t: 'bring', who: 'trade:thầy lang', item: 'dat_set', n: 3, say: 'Rễ đây rồi, lẫn trong đất. Tôi phải thử thuốc đã.', give: 'vi_thuoc_la' },
    { t: 'carry', who: 'giao', item: 'vi_thuoc_la' }], end: 'Thầy lang gửi tôi xem à? Sách cổ có ghi: rễ "ngân tuyết", chữa ho lao. Làng mình có thuốc quý rồi.', m: 200, item: 'sach_nom' },
  // -- Cồn giữa sông
  { from: 20, t: 'Ngọc trai cho cô dâu', why: 'Anh Lành muốn tặng vợ một viên ngọc trai. Người ta nói cồn giữa sông có trai ngọc.', steps: [
    { t: 'bring', who: 'lanh', item: 'trai', n: 5, say: 'Năm con trai! Để tôi tách xem... không có ngọc. Anh kiếm thêm được ngọc thì tốt quá.' },
    { t: 'bring', who: 'lanh', item: 'ngoc_trai', n: 1 }], end: 'Ngọc trai thật! Vợ tôi đeo vào, đẹp như tiên. Tôi biết lấy gì trả anh.', m: 400 },
  { from: 21, t: 'Đò ngang mất lái', why: 'Bác lái đò ốm, làng không ai chở đò. Người bên cồn mắc kẹt.', steps: [
    { t: 'talk', who: 'trade:lái đò', say: 'Tôi sốt quá không chèo được. Anh có thuyền thì sang cồn đón giúp, họ chờ từ sáng.' },
    { t: 'bring', who: 'trade:lái đò', item: 'hen', n: 4, say: 'Họ gửi anh mấy con hến làm quà à? Tốt. Họ về nhà cả rồi chứ?' }], end: 'Người bên cồn về được nhà rồi. Anh chèo đò giỏi đấy, tôi khỏi thì truyền nghề cho anh.', m: 120 },
  // -- Đường cái quan
  { from: 22, t: 'Lái buôn bị cướp', why: 'Người buôn chuyến bị cướp chặn đường cái quan, mất hết hàng.', steps: [
    { t: 'talk', who: 'trade:buôn chuyến', say: 'Năm thằng bịt mặt, có một thằng to cầm gậy sắt. Tôi chỉ còn cái mạng.' },
    { t: 'hunt', who: 'trade:buôn chuyến', kind: 'cuop', n: 3, say: 'Anh dẹp được ba đứa rồi à! Đường cái quan đi được rồi.' }], end: 'Tôi lại đi buôn được rồi. Lần sau lên tỉnh, anh muốn gì tôi mua giùm, không lấy công.', m: 260 },
  { from: 23, t: 'Tướng cướp đường cái', why: 'Tên tướng cướp vẫn chặn đường. Đội Tảo treo thưởng.', steps: [
    { t: 'hunt', who: 'tao', kind: 'tuong', n: 1, say: 'Hạ được tên tướng cướp à! Anh làm được điều mà tuần đinh cả huyện không làm được.' }], end: 'Huyện thưởng cho làng ta. Phần lớn là của anh.', m: 500, ff: { tao: 150 } },
  { from: 24, t: 'Trả lại đồ bị cướp', why: 'Đồ cướp giấu ở đường cái có nhiều thứ của người làng.', steps: [
    { t: 'talk', who: 'tao', say: 'Trong đồ cướp có cái vòng bạc của bà Hàng. Anh mang trả bà ấy.', give: 'vong_bac' },
    { t: 'carry', who: '@bà Hàng', item: 'vong_bac', say: 'Vòng của mẹ tôi để lại! Ối giời ơi, tôi tưởng mất rồi! Để tôi kể cho cả làng anh là người tốt!' }], end: 'Cả làng biết chuyện rồi, bà Hàng kể đến khản cổ.', m: 100 },
  // -- Làng gốm
  { from: 25, t: 'Chum cho đình làng', why: 'Đình làng cần một cái chum to đựng nước cúng.', steps: [
    { t: 'bring', who: 'tu', item: 'chum', n: 1 }], end: 'Chum men đẹp quá. Nước cúng trong chum này, thần làng chắc vui.', m: 120 },
  { from: 26, t: 'Trâu gốm cho trẻ', why: 'Ông giáo muốn thưởng cho trò học giỏi một con trâu gốm.', steps: [
    { t: 'bring', who: 'giao', item: 'tuong_gom', n: 1, say: 'Đẹp quá! Cậu đưa giúp cậu Quan, trò giỏi nhất lớp.', give: 'tuong_gom' },
    { t: 'carry', who: '@cậu Quan', item: 'tuong_gom' }], end: 'Con trâu gốm của con! Con sẽ học giỏi hơn nữa!', m: 160, ff: { giao: 100 } },
  // -- Chằn tinh
  { from: 27, t: 'Truyền thuyết chằn tinh', why: 'Người già trong làng kể về con chằn tinh ở hang sâu. Ông từ có tấm bản đồ cũ.', steps: [
    { t: 'talk', who: 'tu', say: 'Bản đồ này truyền từ đời ông tôi. Hang chằn tinh ở cuối hang động. Anh hỏi thêm bác Năm Thọ, bác ấy từng vào đó.', give: 'ban_do_cu' },
    { t: 'talk', who: 'tho', say: 'Tôi vào đến cửa hang năm hai mươi tuổi. Nó to gấp ba người. Muốn đánh nó phải có giáo dài.' },
    { t: 'carry', who: 'tu', item: 'ban_do_cu' }], end: 'Cậu định đi thật à? Thần làng phù hộ cậu. Nhớ mang đèn dầu.', m: 80 },
  { from: 28, t: 'Diệt chằn tinh', why: 'Chằn tinh lại ra bắt trâu của làng. Cả làng trông vào anh.', steps: [
    { t: 'hunt', who: 'tu', kind: 'tinh', n: 1, say: 'Anh diệt được chằn tinh rồi! Trời ơi, anh như Thạch Sanh vậy!' }], end: 'Đình làm lễ tạ thần ba ngày. Tên anh sẽ được khắc vào bia đình.', m: 800, ff: { ba: 200, chuc: 200 }, item: 'trong_dong_nho' },
  // -- Hội làng
  { from: 30, t: 'Chuẩn bị hội làng', why: 'Năm nay làng mở hội lớn. Đình cần nhiều thứ.', steps: [
    { t: 'bring', who: 'tu', item: 'lua', n: 10, say: 'Lúa đủ rồi. Còn bí với cá.' },
    { t: 'bring', who: 'tu', item: 'bi', n: 5, say: 'Bí. Còn cá nữa.' },
    { t: 'bring', who: 'tu', item: 'ca_chep', n: 3 }], end: 'Đủ lễ vật rồi. Hội làng năm nay to nhất từ trước đến giờ.', m: 300 },
  { from: 31, t: 'Đánh đu ngày hội', why: 'Hội phải có cây đu. Bọn trai làng cần tre già.', steps: [
    { t: 'bring', who: 'chuc', item: 'tre', n: 8, say: 'Tre tốt. Còn dây thừng nữa.' },
    { t: 'bring', who: 'chuc', item: 'day_thung', n: 2 }], end: 'Cây đu dựng xong rồi! Trai gái làng đánh đu cao vút. Năm sau anh phải lên đánh đấy.', m: 150 },
  { from: 32, t: 'Thi nấu cơm', why: 'Hội làng có trò thi nấu cơm. Cô Duyên muốn anh vào đội của cô.', steps: [
    { t: 'bring', who: 'duyen', item: 'gao', n: 3, say: 'Gạo có rồi. Củi khô nữa anh.' },
    { t: 'bring', who: 'duyen', item: 'cui_kho', n: 3 }], end: 'Nồi cơm chín đều, không cháy không khê! Đội mình được giải nhất!', m: 200, ff: { duyen: 150 } },
  { from: 33, t: 'Cờ người ở sân đình', why: 'Ông Viên tổ chức đánh cờ người. Cần người đi mời các tay cờ.', steps: [
    { t: 'talk', who: '@ông Viên', say: 'Mời giúp tôi ông giáo với cụ Bá. Hai người ấy đánh cờ giỏi nhất làng.' },
    { t: 'talk', who: 'giao', say: 'Cờ người à? Được, tôi sẽ đến. Nhưng cụ Bá đánh cờ hay gian lắm đấy.' },
    { t: 'talk', who: 'ba', say: 'Ông giáo dám đấu với tôi à? Được, bảo ông ấy chuẩn bị mà thua.' },
    { t: 'talk', who: '@ông Viên' }], end: 'Ông giáo thắng cụ Bá một ván! Cả làng vỗ tay. Năm nay hội vui nhất.', m: 150, ff: { giao: 100 } },
  // -- Kết
  { from: 35, t: 'Mâm cỗ tạ ơn', why: 'Làng muốn làm mâm cỗ tạ ơn người đã giúp làng suốt bao lâu nay.', steps: [
    { t: 'talk', who: 'tu', say: 'Mâm cỗ này là để mời anh. Anh mời ai ngồi cùng thì mời. Đầu tiên, anh mời lão Hạc nhé.' },
    { t: 'talk', who: 'hac', say: 'Lão được ngồi cỗ đình à? Cả đời lão chưa được. Lão đến.' },
    { t: 'talk', who: 'chi', say: 'Tao với cái Thị cùng đến. Lần này tao không say.' },
    { t: 'talk', who: 'chidau', say: 'Cả nhà em sẽ đến. Cái Tí đòi đọc bài chúc mừng anh.' },
    { t: 'talk', who: 'tu' }], end: 'Cỗ dọn ra, cả làng ngồi kín sân đình. Không có cụ Bá ngồi trên, không có anh Mõ đứng dưới. Ai cũng ngồi một mâm.', m: 500, item: 'kieng_vang' },
  { from: 36, t: 'Sổ đinh của làng', why: 'Đình muốn ghi tên anh vào sổ đinh, anh chính thức là người làng Vũ Đại.', steps: [
    { t: 'talk', who: 'tao', say: 'Tôi giữ sổ đinh. Anh trả lệ phí năm mươi đồng, theo lệ làng.' },
    { t: 'pay', who: 'tao', m: 50, say: 'Đây, tên anh trong sổ. Từ nay anh là dân làng Vũ Đại.', give: 'cuon_so_lang' },
    { t: 'carry', who: 'tu', item: 'cuon_so_lang' }], end: 'Tên anh nằm cạnh tên các cụ khai làng. Chào mừng anh về làng.', m: 100, item: 'tram_cai' },
  { from: 38, t: 'Người làng về', why: 'Có người từ đồn điền cao su trở về. Cả làng xôn xao.', steps: [
    { t: 'talk', who: 'mo', say: 'Con trai lão Hạc về rồi! Đang đứng ở cổng làng, chưa dám vào. Anh dẫn nó về nhà đi.' },
    { t: 'talk', who: 'hac', say: 'Nó về rồi à... Nó về rồi! Cậu ơi, lão chờ đến ngày này...' },
    { t: 'talk', who: 'giao', say: 'Mảnh vườn tôi giữ hộ, giờ trả lại cho cha con nhà lão. Cảm ơn cậu, cậu giữ lời giúp mọi người.' }], end: 'Lão Hạc ôm con khóc. Cậu Vàng sủa vang. Vườn của lão có người giữ rồi.', m: 300, ff: { hac: 300 }, item: 'tien_dong' },
  { from: 40, t: 'Gốc đa đình làng', why: 'Gốc đa trăm tuổi ở đình bị sâu đục. Ông từ lo lắm.', steps: [
    { t: 'talk', who: 'tu', say: 'Cây đa này cả làng ngồi dưới bóng bao đời. Thầy lang có cách chữa cây không?' },
    { t: 'talk', who: 'trade:thầy lang', say: 'Cây cũng như người. Lấy vôi quét gốc, phân chuồng bón rễ.' },
    { t: 'bring', who: 'tu', item: 'voi', n: 4, say: 'Vôi. Còn phân chuồng.' },
    { t: 'bring', who: 'tu', item: 'phan_chuong', n: 6 }], end: 'Đa đâm chồi non rồi. Cây đa còn, làng còn. Cảm ơn cậu.', m: 250, item: 'chuoi_hat' },
];
const c11ClAt = () => { const Q = c11Q(); let i = 0; while (i < C11_CL.length && Q.done['cl:' + i]) i++; return i; };
const c11ClRunning = () => c11Q().act.some(q => q.src === 'chuyen');
function c11ClTake(i) {
  const C = C11_CL[i], Q = c11Q();
  const firstGive = C.give;
  if (firstGive && SAVE11.bag.every(Boolean)) { C11.menu.note = 'Túi đầy, cất bớt đồ rồi nhận việc'; return; }
  if (firstGive) c11Add(firstGive, 1);
  const by = ((SAVE11.san || {}).by || {}), who = w => c11Who(w) || w;
  const steps = C.steps.map(s => ({ ...s, who: who(s.who), h0: s.t === 'hunt' ? (by[s.kind] || 0) : undefined }));
  const ff = {}; for (const [k, v] of Object.entries(C.ff || {})) { const id = c11Who(k); if (id && v) ff[id] = v; }
  Q.act.push({ id: 'cl:' + i, title: 'Chuyện làng: ' + C.t, giver: 'lang', steps, si: 0, end: C.end, reward: { m: C.m, item: C.item, ff }, src: 'chuyen' });
  c11Sfx.tap(); persist11(); C11.menu = null;
  c11Msg('Nhận việc: ' + C.t + ' · ' + c11StepText(steps[0]), '#2f6a4c');
}
{
  const old = c11OpenBoard;
  c11OpenBoard = function () {
    old();
    const i = c11ClAt(), C = C11_CL[i], M = C11.menu; if (!M || !M.rows) return;
    if (!C) { M.rows.unshift({ name: 'Chuyện làng: đã nghe hết', sub: 'Anh đã làm hết những chuyện của làng. Cả làng nhớ ơn anh.', tag: ' ', ok: false, f: () => {} }); return; }
    if (c11ClRunning()) return;
    if (SAVE11.day < C.from) return;
    const ok = C.steps.every(s => !s.item || C11_ITEMS[s.item]) && C.steps.every(s => s.t !== 'hunt' || (typeof C11_WILD !== 'undefined' && C11_WILD[s.kind]));
    if (!ok) return;
    M.rows.unshift({ name: `Chuyện làng (${i + 1}/${C11_CL.length}): ${C.t}`, sub: C.why, tag: `Nhận việc · thưởng ${c4Money(C.m)}`, ok: true, f: () => c11ClTake(i) });
  };
}
