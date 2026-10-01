/* Chương IV folk: who walks the market, what they say to each other, to the betel seller and her husband.
   Chats are little scripts of [speaker 0|1, line]; {A} and {B} are the two talking, {X} is somebody else at the market.
   Kept here so the lines can grow without touching the game. */
const C4_NAMES = {
  mouse: ['bà Ba', 'cô Tư', 'chú Năm', 'anh Cả', 'chị Hai', 'bác Sáu', 'cụ Lý', 'cô Út', 'bà Cả Mõ', 'chú Tám', 'cô Gái Đầu'],
  old: ['cụ Đồ', 'cụ Bảy', 'bà cụ Tư', 'cụ Lang'], child: ['thằng Tí', 'cái Hến', 'thằng Cu', 'cái Bống', 'thằng Bờm'],
  duck: ['bác Vịt Bầu', 'cô Vịt Cỏ'], rooster: ['ông Gà Trống', 'anh Gà Chọi'], dog: ['chú Mực', 'con Vện'], toad: ['cụ Cóc', 'chú Ếch'],
};
// how often each kind turns up at the market
const C4_KINDS = [['mouse', .64], ['duck', .1], ['rooster', .08], ['dog', .09], ['toad', .09]];
// the neighbours who keep a stall along the lane; they call out their wares now and then
const C4_VENDORS = [
  { x: 1180, name: 'bà hàng cá', M: 'c', ware: 'hangCa', calls: ['Cá rô đồng đây! Cá tươi đây!', 'Cá chép béo lắm, mua đi cô bác ơi!', 'Tươi rói, vừa kéo lưới sáng nay!'] },
  { x: 1560, name: 'cô hàng vải', M: 'd', ware: 'hangVai', calls: ['Vải mới về, mời cô bác xem!', 'Lụa Hà Đông mát lắm đây!', 'May áo cưới thì ghé em nhé!'] },
  { x: 1930, name: 'chị bánh đa', M: 'a', ware: 'hangBanh', calls: ['Bánh đa nóng giòn đây!', 'Bánh đa vừng, bánh đa đỏ đây!', 'Ăn một chiếc là nhớ cả năm!'] },
];
const C4_CHATS = [
  // chào hỏi
  [[0, 'Chào {B}, đi chợ sớm thế!'], [1, 'Chào {A}! Sớm mới có rau tươi chứ.']],
  [[0, '{B} ăn sáng chưa?'], [1, 'Rồi, bát cháo gạo mới thơm lắm!']],
  [[0, 'Ôi lâu lắm mới gặp {B}!'], [1, 'Dạo này bận gặt, chẳng đi đâu được.'], [0, 'Thóc năm nay được không?'], [1, 'Được ba bồ, đủ ăn tới Tết!']],
  [[0, 'Nhà {B} dạo này khoẻ cả chứ?'], [1, 'Nhờ trời, ai cũng khoẻ. Còn nhà {A}?'], [0, 'Thằng út mọc răng, quấy cả đêm!']],
  [[0, 'Trời hôm nay mát nhỉ {B}.'], [1, 'Mát thế này chiều chắc mưa đấy.']],
  [[0, 'Đi đâu mà vội thế {B}?'], [1, 'Đi mua dầu thắp đèn, nhà hết sạch rồi!']],
  [[0, 'Mua gì đấy {B}?'], [1, 'Con cá về kho, nhà tôi thích ăn mặn.'], [0, 'Nhớ bỏ ít riềng cho thơm nhé.']],
  [[0, 'Ơ kìa {B}, đi chợ không đội nón à?'], [1, 'Quên mất! Nắng lên thì về sớm vậy.']],
  [[0, 'Đi đâu đấy {B}?'], [1, 'Ra bến đón con gái đi buôn về.'], [0, 'Đi buôn xa thế, giỏi quá!']],
  [[0, 'Năm nay rét sớm nhỉ.'], [1, 'Ừ, phải đan thêm cái áo len.']],
  // buôn chuyện
  [[0, 'Nghe nói nhà {X} sắp cưới vợ cho con.'], [1, 'Thật à? Cưới ai thế?'], [0, 'Con gái nhà cối xay đầu làng!'], [1, 'Ôi, môn đăng hộ đối quá!']],
  [[0, '{B} biết chưa, {X} vừa mua con trâu mới!'], [1, 'Chắc lại vay nợ chứ gì.'], [0, 'Ấy đừng nói thế, người ta chăm làm mà.']],
  [[0, 'Hôm qua {X} cãi nhau với vợ to lắm.'], [1, 'Lại chuyện rượu chè chứ gì?'], [0, 'Đúng! Say quá ngủ luôn ngoài ngõ!']],
  [[0, 'Này, {X} khoe được ông lý khen đấy.'], [1, 'Khen gì cơ?'], [0, 'Nộp thuế chợ sớm nhất làng!'], [1, 'Thế thì đáng khen thật.']],
  [[0, 'Nghe đồn đêm qua mèo lại về rình kho thóc.'], [1, 'Trời ơi, lại mèo! Phải cài cửa cho chặt.'], [0, 'Nhà {X} mất cả bao nếp đấy.']],
  [[0, 'Con nhà {X} đỗ đầu lớp thầy đồ đấy.'], [1, 'Giỏi thế! Mai kia làm quan cho mà xem.']],
  [[0, 'Giá gạo dạo này lên quá.'], [1, 'Ừ, đầu tháng còn hai đồng một đấu.'], [0, 'Thế này thì ăn cháo mất thôi.']],
  [[0, 'Nghe bảo sắp có hội làng đấy.'], [1, 'Có rối nước không?'], [0, 'Có! Cả kéo co nữa.'], [1, 'Thế thì phải đi xem!']],
  [[0, 'Cụ đồ bảo năm nay được mùa.'], [1, 'Cụ xem sao giỏi lắm, năm ngoái cũng đúng.']],
  [[0, 'Nhà {X} mới làm cái chuồng gà to lắm.'], [1, 'Gà nhiều thế, Tết chắc mổ cả đàn!']],
  [[0, 'Đêm qua nghe ếch kêu inh ỏi.'], [1, 'Ếch kêu là sắp mưa to đấy.']],
  // về vợ chồng bán trầu
  [[0, 'Cô bán trầu ở cổng chợ mới đến hả?'], [1, 'Ừ, vợ chồng mới cưới đấy.'], [0, 'Trông hiền lành, chịu khó.'], [1, 'Trầu nhà ấy tươi lắm.']],
  [[0, 'Chồng cô bán trầu khoẻ ghê, vác cả thúng.'], [1, 'Nghe nói trước định đi ăn trộm đấy!'], [0, 'Thật á? May mà vợ can.']],
  [[0, 'Trầu cô ở cổng chợ têm khéo thật.'], [1, 'Têm cánh phượng hẳn hoi đấy!']],
  // nói xấu (khe khẽ)
  [[0, 'Cái {X} ấy keo lắm, mua mớ rau cũng mặc cả.'], [1, 'Ừ, nhưng được cái chăm.'], [0, 'Chăm mặc cả thì có!']],
  [[0, '{B} thấy cái áo mới của {X} chưa?'], [1, 'Thấy rồi, đỏ chót như quả gấc!'], [0, 'Đi chợ mà như đi hội!']],
  [[0, 'Ông {X} lại khoe bộ ria mới tỉa.'], [1, 'Ria thì đẹp mà túi thì rỗng!'], [0, 'Suỵt, nói bé thôi!']],
  [[0, '{B} ơi, cho tôi vay mấy đồng.'], [1, 'Lần trước vay còn chưa trả đấy!'], [0, 'Thì tôi nhớ mà... mai tôi trả!']],
  [[0, 'Hôm nay {X} lại đi chợ muộn.'], [1, 'Chắc ngủ quên, gà gáy ba lần không dậy.']],
  [[0, 'Thằng {X} trèo cây nhãn nhà tôi hái trộm!'], [1, 'Trẻ con ấy mà, mắng một trận là xong.']],
  [[0, 'Nghe nói {X} thầm thương cô hàng vải.'], [1, 'Ối giời, cả làng biết rồi!'], [0, 'Thế mà cứ tưởng giấu kín lắm!']],
  [[0, 'Đừng mua cá nhà {X}, ươn đấy!'], [1, 'Thế à? May mà {A} bảo.']],
];
// on their own, now and then
const C4_ALONE = ['Ơ, quên mua muối rồi!', 'Chợ hôm nay đông quá!', 'Hôm nay phải mua được con gà.', 'Nắng quá, mua nhanh rồi về thôi.', 'Bánh đa thơm quá đi mất!', 'Không biết giá gạo hôm nay thế nào.'];
// buying betel
const C4_BUY = ['Cho {n} miếng trầu nhé cô!', 'Trầu hôm nay có tươi không cô?', 'Lấy cho tôi {n} miếng, têm cánh phượng nhé!', 'Bà nhà tôi dặn mua {n} miếng trầu.', 'Cô ơi, {n} miếng trầu!', 'Có cau non không cô?'];
const C4_SELL = ['Có ngay ạ!', 'Trầu mới hái sáng nay đấy ạ!', 'Cảm ơn, lần sau lại ghé nhé!', 'Vâng, em têm cẩn thận đây!', 'Cau non, trầu tươi đây ạ!', 'Ăn trầu cho đỏ môi nhé!'];
// buyers at the other stalls ({n} how many), and the helpers serving them
const C4_WANT = {
  che: ['Cho bát chè nóng nào!', 'Chè xanh đặc vào nhé!', '{n} bát chè cho cả nhà!', 'Rét quá, bát chè cho ấm bụng!'],
  xoi: ['Gói cho {n} gói xôi!', 'Xôi gấc còn không?', 'Xôi đỗ một gói mang đi!', 'Cho cháu gói xôi ăn sáng.'],
  xen: ['Có kim chỉ không?', 'Bán cho cái lược bí!', 'Lấy {n} cuộn chỉ đỏ.', 'Gương này bao nhiêu?'],
  bun: ['Bát bún riêu, nhiều riêu nhé!', '{n} bát bún, thêm mắm tôm!', 'Đói quá, bát bún nào!', 'Bún riêu cua đồng phải không?'],
};
const C4_THANKS = ['Có ngay ạ!', 'Của bác đây ạ!', 'Cảm ơn, lần sau lại ghé!', 'Nóng hổi đây ạ!', 'Vâng, có ngay!'];
const C4_GIVEUP = ['Lâu quá, thôi đi chỗ khác!', 'Đông quá, mai mua vậy.', 'Chờ mỏi cả chân!'];
const C4_HUSBAND = ['Hàng về rồi đây mình ơi!', 'Trầu tươi vừa lên đò!', 'Thúng này nặng ghê!'];
const C4_WIFE_GOT = ['Anh để đấy em xếp!', 'Anh vất vả quá!', 'Vừa kịp, sắp hết rồi!'];
const c4Pick = arr => arr[(R() * arr.length) | 0];

/* ---------- news for tomorrow (whispered; the player taps to overhear them, they go into the notebook) ---------- */
const C4_NEWS = {
  hoi: [[[0, 'Này, nghe nói mai làng mở hội đấy!'], [1, 'Thật à? Thế thì chợ đông lắm đây.'], [0, 'Đông lắm, người làng bên cũng sang.']],
        [[0, 'Mai có rước kiệu đình, biết chưa?'], [1, 'Biết rồi, cả làng đi xem, chợ chen không lọt!']]],
  mua:  [[[0, 'Cụ Đồ xem trời, bảo mai mưa to.'], [1, 'Mưa thì ai đi chợ, ở nhà cả thôi.']],
        [[0, 'Kiến tha trứng lên cao kìa.'], [1, 'Thế là mai mưa rồi, chợ vắng hoe.']]],
  meo:  [[[0, 'Suỵt… nghe đâu mai mèo lại về chợ.'], [1, 'Chết! Thế thì phải sắm lễ sẵn.'], [0, 'Không có lễ là nó phá cả gánh.']],
        [[0, 'Đêm qua thấy bóng mèo ở đầu làng.'], [1, 'Mai nó ra chợ cho xem, cẩn thận đấy.']]],
  thue: [[[0, 'Mai cụ Lý đi thu tiền chợ đấy.'], [1, 'Lại thu! Phải để dành ít tiền.']],
        [[0, 'Cụ Lý dặn mai ai cũng phải nộp tiền chợ.'], [1, 'Ai biếu thêm thì ông ấy cho chỗ đẹp.']]],
  cuoi: [[[0, 'Nhà {X} mai cưới con, cần nhiều trầu lắm.'], [1, 'Thế cô bán trầu cổng chợ lại đắt hàng!']],
        [[0, 'Mai có đám hỏi, phải mấy chục miếng trầu.'], [1, 'Nhà gái chắc đặt trầu cánh phượng.']]],
};
// what the wife writes in her notebook when she overhears it
const C4_NOTE = {
  hoi: 'Nghe nói mai làng mở hội, chợ sẽ đông.', mua: 'Nghe nói mai trời mưa to, chợ vắng.', meo: 'Nghe đồn mai mèo về chợ đòi lễ.',
  thue: 'Mai cụ Lý đi thu tiền chợ.', cuoi: 'Mai có nhà cưới con, cần nhiều trầu.',
};

/* ---------- more chats: proverbs, village life, a little teasing ---------- */
C4_CHATS.push(
  [[0, 'Dạo này nhà {B} làm ăn khấm khá nhỉ?'], [1, 'Có công mài sắt có ngày nên kim mà!']],
  [[0, 'Nhà {X} lại sang ăn chực nhà tôi.'], [1, 'Bán anh em xa, mua láng giềng gần, thôi chịu khó!']],
  [[0, 'Thằng út nhà tôi chui vào chum gạo ngủ quên.'], [1, 'Đúng là chuột sa chĩnh gạo!'], [0, 'Sướng nhất nó rồi!']],
  [[0, '{X} khoe con mình học giỏi nhất làng.'], [1, 'Mèo khen mèo dài đuôi ấy mà.']],
  [[0, 'Nhà {X} tham bán đắt, giờ ế cả gánh.'], [1, 'Tham thì thâm, các cụ dạy cấm sai.']],
  [[0, 'Vợ chồng {X} nghèo mà thương nhau lắm.'], [1, 'Thương nhau củ ấu cũng tròn mà.']],
  [[0, 'Hôm qua giỗ cụ nhà {X}, đông vui lắm.'], [1, 'Có bánh chưng không?'], [0, 'Có, cả xôi gấc đỏ au!']],
  [[0, 'Mùa này cấy lúa có kịp không {B}?'], [1, 'Kịp, chỉ lo hạn thôi.'], [0, 'Trời thương thì mưa thuận gió hoà.']],
  [[0, 'Nghe tiếng sáo diều đầu làng chưa?'], [1, 'Nghe rồi, trẻ con thả diều cả chiều.']],
  [[0, 'Này, nồi cám nhà tôi lại bị đổ!'], [1, 'Chắc lại con Vện chứ ai.']],
  [[0, 'Cụ {X} năm nay bao nhiêu tuổi rồi?'], [1, 'Bảy mươi, mà vẫn đi chợ phăm phăm.'], [0, 'Sống lâu lên lão làng!']],
  [[0, 'Trời nóng quá, mua bát chè đỗ đen không?'], [1, 'Thôi, để dành tiền mua muối.']],
  [[0, 'Chồng tôi hứa sắm cho cái nón quai thao.'], [1, 'Hứa từ Tết năm ngoái rồi còn gì!']],
  [[0, '{B} đi chợ một mình à?'], [1, 'Ừ, ông nhà tôi ở nhà trông trẻ.'], [0, 'Thế thì giỏi quá!']],
  [[0, 'Ối, ai dẫm vào chân tôi thế?'], [1, 'Xin lỗi, chợ đông quá!']],
  [[0, 'Đồng tiền đi liền khúc ruột, mua gì cũng phải tính.'], [1, 'Phải, buôn có bạn, bán có phường.']],
  [[0, 'Nhà {X} mới đẻ thằng cu, kháu lắm.'], [1, 'Thế à! Phải sang mừng mới được.']],
  [[0, 'Sáng nay gà nhà tôi đẻ trứng hai lòng đỏ!'], [1, 'Điềm lành đấy, sắp có lộc.']],
  [[0, 'Này, đừng có nói to, {X} đứng ngay đấy!'], [1, 'Ơ chết, thế mà tôi không thấy.']],
  [[0, 'Ăn trầu không {B}?'], [1, 'Có, miếng trầu là đầu câu chuyện mà.'], [0, 'Trầu cô ở cổng chợ đấy, ngon lắm.']],
  [[0, 'Năm nay hội làng có thi nấu cơm không?'], [1, 'Có, cả thi bắt vịt nữa.'], [0, 'Thôi tôi chỉ đi xem thôi.']],
  [[0, 'Sao dạo này ít thấy {X} ra chợ?'], [1, 'Nghe nói ốm, phải uống thuốc nam.']],
  [[0, 'Con gái nhà {X} sắp đi lấy chồng.'], [1, 'Lấy ai thế?'], [0, 'Anh thợ mộc làng bên.'], [1, 'Khéo tay thế thì sướng rồi!']],
  [[0, 'Này, mai đi lễ đình không?'], [1, 'Đi chứ, cầu cho buôn may bán đắt.']],
  [[0, 'Nhà {X} cãi nhau vì con gà sang vườn.'], [1, 'Chuyện bé xé ra to!']],
  [[0, 'Cụ Lý dạo này hay đi tuần đêm.'], [1, 'Chắc sợ mèo về bắt trộm gà.']],
  [[0, 'Thằng Bờm lại đổi quạt mo lấy xôi.'], [1, 'Khôn thế mà người ta bảo nó dại!']],
  [[0, 'Trông kìa, con Vện lại đuổi gà.'], [1, 'Chó cậy gần nhà, gà cậy gần chuồng.']],
  [[0, 'Chợ quê vui nhỉ {B}.'], [1, 'Vui chứ, có nhiều chuyện để nghe!']],
  [[0, 'Bánh đa chị ấy nướng thơm cả chợ.'], [1, 'Ừ, chiều về mua một chiếc cho bọn trẻ.']],
);
C4_ALONE.push('Chết, quên cái nón ở nhà!', 'Phải mua ít vôi về têm trầu.', 'Mua thêm bó rau muống đã.', 'Ơ, con Vện chạy đâu rồi?', 'Ối, nắng to quá!', 'Hôm nay giá cá rẻ thật.');
// more customer lines
C4_BUY.push('Têm cho tôi {n} miếng thật cay nhé!', 'Nhà có khách, lấy {n} miếng cô ơi.', 'Trầu này tươi quá, lấy {n} miếng!');
C4_SELL.push('Trầu cánh phượng đây ạ!', 'Mời bác ăn thử miếng cau non!', 'Ăn trầu là nhớ đến em nhé!');
