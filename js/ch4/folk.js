/* Chương IV folk: who walks the market, what they say to each other, to the betel seller and her husband.
   Chats are little scripts of [speaker 0|1, line]; {A} and {B} are the two talking, {X} is somebody else at the market.
   Kept here so the lines can grow without touching the game. */
const C4_NAMES = {
  mouse: ['bà Ba', 'cô Tư', 'chú Năm', 'anh Cả', 'chị Hai', 'bác Sáu', 'ông Lý', 'cô Út', 'bà Cả Mõ', 'chú Tám', 'cô Gái Đầu'],
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
const C4_GIVEUP = ['Lâu quá, thôi đi chỗ khác!', 'Đông quá, mai mua vậy.', 'Chờ mỏi cả chân!'];
const C4_HUSBAND = ['Hàng về rồi đây mình ơi!', 'Trầu tươi vừa lên đò!', 'Thúng này nặng ghê!'];
const C4_WIFE_GOT = ['Anh để đấy em xếp!', 'Anh vất vả quá!', 'Vừa kịp, sắp hết rồi!'];
const c4Pick = arr => arr[(R() * arr.length) | 0];
