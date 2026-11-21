== lam
if quest:com-moi = done
  cycle lam-sau-le
    * - Mâm xôi cơm mới thơm cả sân đình. Cụ cảm ơn cháu nhiều lắm. #line:48448C8335FD9A4E4EBCAFE3FD024ED2
    * - Đất không phụ người chăm. Sang năm lại được mùa, cháu ạ. #line:D16B5F9E072BA308EB70FF9F3F10C16F
  stop
if item:xoi-moi
  - Ồ, {mâm xôi cơm mới}! Hạt nếp dẻo thơm thế này thì Thành hoàng cũng phải mỉm cười. #line:B543C0E83CC399F7F3170482668EF2CE
  - Đi, ta gọi cả làng ra sân đình làm lễ. #line:4B19315A1CFF13E2E9A17D3601DE5C83
  take xoi-moi
  call le-com-moi
  stop
if quest:com-moi
  cycle lam-nhac
    * - Lúa đầu mùa ở {Đồng lúa chín}, cứ theo đường cái đi mãi về phía đông. #line:C5541CFC533C222B4CA12F4C8FD7529C
    * - Có gạo mới rồi thì nhờ {Chị Hạnh} đồ cho mâm xôi nhé. #line:C229A6D8F78D74162BA5E924478C6031
  stop
- Chào cháu. Làng ta có ba thứ quý: {cây đa}, {giếng nước}, {sân đình}. #line:F0EE940E0CFDE3C95C5888993EF778BF
- Lúa ngoài đồng chín cả rồi. Theo lệ, làng phải dâng {mâm xôi cơm mới} lên Thành hoàng trước khi gặt đại trà. #line:D3DCC794F94E8D6FA5E10C6F245C37DB
choice Cháu giúp cụ một tay được không? #line:2A261414FDC72465851FE6C89666B9FF
  > Dạ, cháu đi ngay ạ #line:EA9BBF4B0DFFF1886FFB2997B94F27BA
    - Ngoan lắm. Ra {Đồng lúa chín} tìm {Cô Lan}, cô ấy chỉ cho cháu gặt mấy bó lúa đầu mùa. #line:03CAE5337562D4E61D030D9830442846
    quest com-moi stage ra-dong
  > Cây đa này bao nhiêu tuổi ạ? #line:B606704661B2AFB0EF9AE475F4B0C776
    - Hơn ba trăm năm rồi. Ông cố của cụ còn ngồi hóng mát dưới gốc nó đấy. #line:A48DA981C84DFDA7515DE1E670C240B0
    - Lúc nào rảnh thì quay lại giúp cụ việc làng nhé. #line:EC43B08411C669DD79756778F8276809

== le-com-moi
cutscene
fade out 0.8
teleport lam 18.6 14.2 up
teleport vien 20.2 14.2 up
teleport mo 16.4 17.2 up
teleport hanh 17.8 17.2 up
teleport sau 20.6 17.2 up
teleport tu 22.0 17.2 up
teleport player 19.3 16.2 up
camera 19.4 14.6
fade in 1
wait 0.6
Cụ Lâm: Kính lạy Thành hoàng làng Vũ Đại. Năm nay mưa thuận gió hòa, lúa chín vàng đồng. #line:A2097AA6E7CAE8609FC44D95BA0B4943
- Dân làng xin dâng {mâm xôi cơm mới}, tạ ơn đất trời, tạ ơn người cày cấy. #line:B5794890935C964FD0E0CBE3CEE497E4
sfx chime
banner Lễ cơm mới | Làng Vũ Đại tạ ơn đất trời #line:494CB085C84BE4E4BC5B2B7D18C0D823
Sư Viên: Mô Phật. Mỗi hạt gạo là mồ hôi của cả làng. #line:4A54BE08CD623BCA2EBDAEBCEB56BABB
emote mo heart 2
Bé Mơ: Xôi thơm quá! Cho em một nắm với! #line:039D852875DF257D34232479A6C874BE
emote hanh note 2
face lam player
Cụ Lâm: Cháu giúp làng một việc lớn. Cầm lấy chút quà này. #line:3ADB2B3196A1D8D5D1904EDC9BDBA014
give gold 30
quest com-moi done
fade out 0.8
teleport lam 18.6 14.0
teleport vien 29.2 6.0
teleport mo 19.6 16.4
teleport hanh 26.4 16.2
teleport sau 5.2 19.4
teleport tu 27.6 26.8 down
camera reset
fade in 0.8

== mo
if quest:den-ong-sao = done
  cycle mo-sau
    * - Tối nay em rước đèn ông sao đi khắp xóm! Anh đi cùng không? #line:973D1757D7669EC0DA6D46DBF138D7C6
    * - Tết Trung thu có bánh nướng, bánh dẻo, có cả cỗ trông trăng nữa. #line:B346BD5485ED352941853C9A03287985
  stop
if item:den-ong-sao
  - Đèn ông sao của em! Anh tìm thấy ở đâu thế? #line:D7F029D413D3423E562D1DD5F9D7E357
  take den-ong-sao
  emote mo heart 2
  - Em cảm ơn anh! Đây, em cho anh mấy đồng tiền mừng tuổi của em. #line:33D70673C7D031367C4313F946959919
  give gold 10
  quest den-ong-sao done
  stop
if quest:den-ong-sao
  - Em làm rơi ở bờ {hồ sen}, chỗ phía đông ấy. Anh tìm giúp em nhé! #line:261979245180952EA9BB95A4CC6686E6
  stop
emote mo sweat
- Anh ơi! Em làm rơi mất {đèn ông sao} rồi, hu hu... #line:C4998B06F9CAFC673D27BF57FBF87546
- Tối nay tụi em rủ nhau rước đèn, không có đèn thì buồn lắm. #line:4CE0E8D3668E21EB234A494A834876FE
choice Anh tìm giúp em được không? #line:5A97E5268A9A99119A2280EFB3A60FAA
  > Để anh tìm cho #line:5621E79816DDA0CE6987B93DC1C2F727
    - Em chơi ở bờ {hồ sen}, phía đông ấy. Chắc rơi ở đó! #line:7B1DBFBCFD5FA4643A6EB625B3D50AAA
    quest den-ong-sao stage tim
  > Lát nữa nhé #line:D305D1759F6654A564C2B2D5511ECDCA
    - Dạ... Anh nhớ quay lại nhé. #line:8A86A79690B2FC12836F7509657D6346

== nhat-den
: Trong đám cỏ ven hồ có ánh giấy bóng kính đỏ. #line:25D0CD7198AE61FF3C70755B3F24E98B
give den-ong-sao
quest den-ong-sao stage tra

== sau
cycle sau-noi
  * - Con trâu là đầu cơ nghiệp đấy cháu ạ. #line:E9AAE756C2D788379FEFDCAA101769E2
  * - Mấy thửa ruộng bên này cấy muộn, mươi hôm nữa mới gặt được. #line:5E02F2CBCEE0BD52ECBAE10934B0D8A8
  * - Nhất nước, nhì phân, tam cần, tứ giống. Ông bà dạy thế cả đấy. #line:2CD2ACB4FE9358B21CCBBCA62D92470C

== hanh
if item:gao-moi
  - Gạo tám mới! Thơm nức thế này mà đồ xôi thì tuyệt. #line:C2EE9F0905FFD161A711BC196AF1A841
  - Em ngồi chờ chị một lát nhé. #line:34BB485764CAD9259F8A2EEE9B864930
  take gao-moi
  fade out 0.6
  wait 0.6
  fade in 0.6
  - Xôi chín rồi đây, dẻo thơm. Em mang lên sân đình cho {Cụ Lâm} nhé. #line:FA4D62EB440433E6B4F4BD25BAA1B1F8
  give xoi-moi
  quest com-moi stage dang-le
  stop
if item:ca-ro
  choice Cá rô đồng béo thế! Em bán cho chị con này nhé? #line:E36E60833BDA25593913061E863128B5
    > Dạ, chị lấy đi #line:F5632D6658D76657EDEF296D816BD916
      take ca-ro
      give gold 15
      - Cá rô kho tộ, ăn với cơm mới thì ngon phải biết. #line:BE1D87362551DA77074436A7FFEF1710
      stop
    > Em giữ lại #line:9CFC32F49F979B1AD94D0D50C28E2876
      - Ừ, tùy em. #line:951B93A3E65CF3CAAC3C17EEB8326DE4
- Bánh chưng mới vớt nồi đây em! Gói bằng lá dong, nhân đỗ thịt mỡ. #line:1D92297259E02EDB6554150BE3D07414
shop

== tu
if quest:moi-cau = done
  cycle tu-sau
    * - Hôm nay cá cắn câu đều tay. Nhờ mồi của cháu đấy. #line:6EDAA22E72B135A8D019D0B191F10075
    * - Hồ sen này tháng sáu nở hồng cả mặt nước. #line:94CAD23CADCA74466739DFDE07B7FB36
  stop
if item:giun
  - Giun béo thế này thì cá rô mê lắm. #line:1920A76F57F1410109FEE55B157490CF
  take giun
  cutscene
  camera tu 0.6
  wait 1.2
  emote tu ! 1.2
  sfx splash
  wait 1.2
  - Dính rồi! Một con rô đồng to bằng bàn tay! #line:150690ACD9EDD77522AE48F359EF6BA4
  - Chú cho cháu con này. Đem bán cho {Chị Hạnh} cũng được giá đấy. #line:08DF2FDAB478F4F2D08430263847A99A
  give ca-ro
  quest moi-cau done
  camera reset 0.6
  stop
if quest:moi-cau
  - Đào dưới gốc {chuối} gần hồ ấy, đất ẩm nhiều giun lắm. #line:56EB0EB4F52DBC21937EBE2F5B84ED7C
  stop
- Suỵt... Cả buổi chẳng con cá nào cắn câu. Hết mồi mất rồi. #line:C94C0BA20E5AFECEDC9FCDB839D11826
choice Cháu kiếm giúp chú ít {mồi giun} nhé? #line:9C3C15F032B893FB8143108C032A23D2
  > Để cháu đi đào #line:5D7028A20C6E056DB7B9EF1F640BEF0C
    - Tốt quá. Dưới gốc {chuối} gần hồ, đất ẩm nhiều giun lắm. #line:587D4C1EAAA7C4BA07393DB4180ED2FC
    quest moi-cau stage dao
  > Thôi ạ #line:1515966C8B7917404CD82E303887C56D
    - Ừ, thế chú ngồi chờ vậy. #line:1A29E9316E5143429A7EF2518A308B47

== dao-giun
: Đất dưới gốc chuối ẩm và tơi. Mấy con giun ngoe nguẩy. #line:DBE22EEC452C41D70D7E209B5798A3B1
give giun
quest moi-cau stage mang

== vien
if quest:nuoc-gieng = done
  cycle vien-sau
    * - Mô Phật. Ngồi nghe tiếng chuông gió một lát cho lòng nhẹ đi. #line:D256D4F14A625E6E75EEC9BC5F4E290D
    * - Trà ngon là nhờ nước. Nước ngon là nhờ người giữ giếng. #line:AD05AAD5E8467BA94C08CB73D2DA03FE
  stop
if item:nuoc-gieng
  - Nước giếng làng trong quá. Thí chủ ngồi đây, bần tăng pha ấm trà. #line:F6619DD05CBD51F9B20A213D679FF333
  take nuoc-gieng
  fade out 0.6
  wait 0.5
  fade in 0.6
  - Trà mạn ướp sen hồ làng. Thí chủ uống cho ấm lòng. #line:973F3B6885B903CA6E9ED97D7A65839B
  : Hương sen thoang thoảng. Tiếng chuông gió ngân nga. #line:4038EB744C82757BAAEE106B91DC0840
  quest nuoc-gieng done
  give gold 10
  stop
if quest:nuoc-gieng
  - Giếng ở sân đình, ngay cạnh cây đa. Thí chủ múc giúp một gáo. #line:54463D4E5D59B6A5F121F8910B21A19B
  stop
- Mô Phật. Thí chủ lên chùa sớm vậy. #line:BE55EB2CB3FE211A502BF6B99039BB7C
- Bần tăng định pha ấm trà, mà nước giếng chùa cạn mất rồi. #line:2161699C8D3CDF2320262B59ABFA8D05
choice Thí chủ xuống làng múc giúp một gáo {nước giếng}? #line:9E37FD38D34AB1151F0C0FAABF8D89FC
  > Dạ, con đi ngay #line:58379387D423D90D5B58D80ECA505888
    - Lành thay. Giếng làng ở sân đình, cạnh cây đa. #line:30E4F0E2C24AC2E23CFB98E62E75E88B
    quest nuoc-gieng stage muc
  > Để lúc khác ạ #line:538CC4BF4F4E17DAB8BEBBF1E0FB0F85
    - Không sao. Lúc nào tiện thì ghé. #line:D032DED53E32E89CAD5B84AC388A4E7D

== muc-nuoc
: Gàu nước kéo lên trong vắt, mát lạnh. #line:827B5B611508DA00F91E012258DCD623
sfx splash
give nuoc-gieng
quest nuoc-gieng stage mang

== lan
if stage:com-moi >= nau-xoi
  if item:gao-moi
    - Gạo mới đấy, mang về làng cho {Chị Hạnh} đồ xôi đi cháu. #line:435CBF1F5CD8DC10893AAE47A1838DD4
    stop
  cycle lan-sau
    * - Năm nay được mùa, lúa trĩu bông cong cả gié. #line:9290B8EEEA8EE525B7522078AC3C7EF3
    * - Mai cả làng ra gặt, cháu ra phụ một tay nhé. #line:7A1EE62D1F9824877D5EA77EE8A0BF17
  stop
if quest:com-moi = active and stage:com-moi = gat-lua
  if item:bo-lua >= 3
    - Ba bó lúa vàng óng! Cháu gặt khéo đấy. #line:105601AE65605969F02EF3F0C59EAFEF
    take bo-lua 3
    - Để cô đập, phơi rồi xay giã một mẻ nhé. #line:E5DA31C47FBD6D61DBC99A9C9579E15B
    fade out 0.6
    wait 0.6
    fade in 0.6
    - Đây, một túi {gạo tám mới}. Mang về cho {Chị Hạnh} đồ xôi dâng lễ nhé. #line:D64408A69720C040632AEEE9D8D70C48
    give gao-moi
    quest com-moi stage nau-xoi
    stop
  - Mới được ${item:bo-lua} bó. Cần ba bó, ở mấy thửa có bông lúa lấp lánh ấy cháu. #line:D27306226B22F974B90AEA5212CAA95D
  stop
if quest:com-moi = active and stage:com-moi = ra-dong
  - Cụ Lâm nhờ cháu ra à? Hay quá, đang thiếu tay gặt. #line:CCE0D233B4003F081084D0C1FFA3A876
  - Cháu gặt cho cô {ba bó lúa} đầu mùa nhé. Thửa nào bông lúa lấp lánh dưới nắng thì gặt. #line:6E017EE315A67053FFB507B09F7D13C5
  quest com-moi stage gat-lua
  stop
- Năm nay được mùa, lúa trĩu bông cong cả gié. #line:87B33EA56D687D37ED623A44A4DDC432
- Mai cả làng ra gặt. Nhớ đội nón kẻo nắng nhé. #line:A2F8143D7FDCD76370C42BBD790D7AA6

== gat-lua
sfx pickup
give bo-lua
if item:bo-lua >= 3
  : Đủ ba bó rồi. Mang về cho Cô Lan. #line:8BB83DA8A2AA004158788E4C8BF148DE

== hai
cycle hai-noi
  * - Nhìn kìa, lúa ngả vàng cả cánh đồng. #line:98C0E02B67033F21B5640358C8C7FA34
  * - Tháng mười gặt xong, cả làng làm cỗ ăn mừng cơm mới. #line:4044399441DC2E2010F50AB5243FE806
  * - Gặt thì cắt cao tay, để gốc rạ lại cho trâu ăn. #line:51EC39D0A280138EC9C9DD94471FE5E0

== tam
cycle tam-noi
  * - Mương này dẫn nước từ thác Sương xuống đấy. #line:C0D06C3DA5D95684270E384F8040CA43
  * - Có nước thì lúa mới thơm, hạt mới mẩy. #line:957CAF726F66FE38CC7485C09B45CAAE

== tan
if quest:com-moi = done
  - Nghe nói làng vừa làm lễ cơm mới. Cụ mừng lắm. #line:3D7A1EED5E475BD5AB693AAFDFA7CE40
  stop
cycle tan-noi
  * - Cụ cấy lúa ở đồng này đã sáu mươi mùa rồi. #line:262CA8AEDF160E50943D124B4866B3A1
  * - Đất không phụ người, cháu ạ. #line:F3E446F0683AA9D5417AA0D0B97340F8

== ti
if quest:dieu = done
  cycle ti-sau
    * - Diều em bay cao nhất đồng! Nghe tiếng sáo vi vu không anh? #line:769A437C41A009E45919E6A2A2D60A09
    * - Con trâu nhà em tên là Mực. Nó hiền lắm. #line:51E3D626454D4BBAE33411FB59A7AEB6
  stop
if item:dieu
  - Diều của em! Anh gỡ được rồi à? #line:FE43771B9B34A925F098B4ED5E64CA6D
  take dieu
  emote ti heart 2
  - Em buộc lại dây rồi thả tiếp đây. Cảm ơn anh nhiều! #line:A86530C2E60F122BAD54F6F5F9E65BAD
  give gold 10
  quest dieu done
  stop
if quest:dieu
  - Diều mắc trên mái {chòi canh} ấy, cạnh đường cái. #line:92BF38B6B3ED59C5839088DAFD32441B
  stop
emote ti sweat
- Anh ơi, gió to quá, diều em đứt dây bay mất rồi! #line:5264E05C980BDD005AE5ACD943B8C676
- Nó mắc trên mái {chòi canh} kia, em trèo không tới. #line:3C25EDE05951699D2914479B37A0983E
choice Anh gỡ giúp em nhé? #line:84475A2644F6F1BA4297E0474E6CA193
  > Để anh gỡ cho #line:EFE9021AA5870D9125A1D96A45D285FD
    - Hay quá! Chòi canh ở ngay cạnh đường cái đấy. #line:FD6ED64B0274BF44F399A4336CCBAE88
    quest dieu stage tim
  > Lát nữa nhé #line:687CF8C41DA4117AB5562587943814FA
    - Dạ... #line:05D70940703FEB0F8E92EADF91F3A4FA

== go-dieu
: Kiễng chân, với tay lên mái rạ... gỡ được rồi! #line:D6EF3DBF374F08CEFA0997A62327DD76
give dieu
quest dieu stage tra
