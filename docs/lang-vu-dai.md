# Làng Vũ Đại — bản thiết kế (chương IX)

Đây là bản thiết kế làm dần, chưa phải bản cuối. Trò chơi lấy cách chơi của Stardew Valley và đặt nó vào một làng quê Bắc Bộ thời xưa, khoảng những năm 1930–1940. Dân làng là chuột, vẽ theo lối tranh Đông Hồ.

Làng Vũ Đại và một số dân làng lấy cảm hứng từ truyện của Nam Cao (*Chí Phèo*, *Lão Hạc*, *Đời thừa*…). Thêm vào đó là các mảnh đời trong *Tắt đèn* (Ngô Tất Tố), *Số đỏ* (Vũ Trọng Phụng), *Truyện Kiều* (Nguyễn Du), và nhiều truyện cổ tích, ca dao.

Về bản quyền: tất cả lời thoại, sự kiện và nhiệm vụ đều viết mới. Không chép câu chữ của các tác phẩm. Chỉ lấy tên, nghề và số phận làm cảm hứng. Kết của nhiều câu chuyện cũng được đổi: người chơi có thể cứu được người mà trong truyện gốc không ai cứu.

## 1. Những gì đã có (lượt này)

- **Ba nơi:** Nhà mình, Chợ làng Vũ Đại và Rừng trúc. Bước ra mép bản đồ là sang nơi khác.
- **Nhà mình:** là khu riêng. Không có hàng quán và không có người lạ đi qua. Ở đây có ruộng, giếng, ao, đống rơm, thùng bán hàng và **rương đồ**.
- **Túi đồ 10 ô:** mỗi ô chứa tối đa 99 món cùng loại. Túi đầy thì không nhặt hay mua thêm được loại mới.
- **Rương 30 ô:** chạm vào rương thì mở cả túi lẫn rương, chạm một ô để chuyển cả chồng sang bên kia.
- **Thanh công cụ:** gồm 5 dụng cụ là liềm, cuốc, rìu, bình tưới và giàn, sau đó là 10 ô túi đồ. Cầm hạt giống thì gieo được. Chạm lần nữa vào món ăn đang cầm thì ăn.
- **Thùng bán ở nhà và quầy Thu mua ở chợ:** chọn từng chồng hoặc bán hết. Quầy Thu mua trả cao hơn một phần tư.
- **Kho 265 món đồ:** nằm ở `js/ch9/items.js`, chia 11 loại: hạt giống, nông sản, hái lượm, cá, sản phẩm con vật, vật liệu, đồ làm ở nhà, món ăn, đồ dùng, của quý và vật trong truyện.

## 2. Những gì sẽ làm, theo Stardew Valley

| Stardew Valley | Làng Vũ Đại |
|---|---|
| 4 mùa, mỗi mùa 28 ngày | **Xuân, Hạ, Thu, Đông**. Mỗi mùa trồng được cây khác nhau. Mùa đông thì ruộng nghỉ, chỉ trồng rau vụ đông. |
| Lễ hội | Tết Nguyên đán, Rằm tháng Giêng, hội làng, Hàn thực (bánh trôi), Đoan Ngọ (giết sâu bọ), Vu Lan, Trung thu (rước đèn), cúng cơm mới |
| Trung tâm cộng đồng | **Đình làng Vũ Đại** đã đổ nát. Góp đủ từng "lễ" (bộ vật phẩm) thì tu sửa được từng gian, mỗi gian mở ra một thứ mới: cầu qua sông, lò rèn, bến đò… |
| Bảo tàng | **Nhà thờ họ:** nộp của quý đào được (đồng tiền cổ, mũi tên đồng, trống đồng nhỏ…) để nhận thưởng |
| Hầm mỏ | **Hang đá sau núi** và **bãi sông**: đào đá, sắt, đồng, vàng cám, của quý. Càng xuống sâu càng nguy hiểm (rắn, rết, dơi). Máu dùng ở đây. |
| Câu cá | Câu ở ao nhà, ao làng, sông và đầm, mỗi nơi có loài cá riêng. Ngoài ra có vó, đơm, đó để đặt bẫy. |
| Nâng cấp dụng cụ | **Lò rèn của bác Năm Thọ:** nâng liềm, cuốc, rìu, bình tưới lên các bậc sắt, đồng, bạc, vàng |
| Kỹ năng | Làm ruộng, Hái lượm, Câu cá, Chăn nuôi, Nấu ăn: mỗi kỹ năng 10 bậc, có phần thưởng ở bậc 5 và bậc 10 |
| Nấu ăn và chế đồ | Bếp trong nhà nấu theo **công thức** học từ dân làng. Ngoài ra có chum ủ rượu, vại muối dưa, cối xay, khung cửi, đõ ong. |
| Chuồng trại | Chuồng gà, chuồng vịt, chuồng lợn, chuồng trâu. Cho ăn và vuốt ve mỗi ngày. |
| Kết bạn | Mỗi người có 10 bậc tình cảm, tặng quà 2 lần một tuần, quà thích hay ghét khác nhau. Mỗi bậc mở một **chuyện** (cảnh đặc biệt). |
| Hẹn hò, cưới hỏi | Một số người có thể làm bạn đời. Đám cưới làng: kiệu, tráp, rước dâu giống chương I! |
| Bảng việc | **Bảng yết thị ở đình:** việc vặt hằng ngày (giao cá, tìm vịt lạc…) |
| Mục tiêu dài | **Sổ lý lịch làng:** đủ 100 việc thì làng Vũ Đại thành "làng văn vật" |

## 3. Dân làng (bản nháp, mỗi người là một con chuột)

Mỗi người có các thông tin sau:

- **Tính cách**
- **Thích / ghét:** món đồ thích nhận và món ghét, ghi theo id trong `items.js`
- **Chuyện 10 bậc:** từ bậc 2, 4, 6, 8, 10 mỗi bậc mở một cảnh
- **Nhiệm vụ mở ra**
- **Kết:** người chơi có thể đổi được kết cục

### Nhà cụ Bá và những người quanh quyền thế

1. **Cụ Bá Kiến:** cựu lý trưởng, nay là chánh tổng. Khôn lỏi, nói ngọt, mềm nắn rắn buông.
   - **Thích:** `ruou_thuoc`, `che_uop_sen`, `an_trieu`. **Ghét:** `rac`, `ruou_trang`.
   - **Chuyện:** cụ muốn người chơi bán ruộng cho mình (bậc 2). Cụ nhờ đưa thư lên huyện, thư có điều mờ ám (bậc 4). Người chơi phát hiện **sổ ghi nợ** của cả làng (bậc 6).
   - **Vụ án lớn "Văn tự giả":** chứng minh tờ văn tự bán ruộng của nhà anh Dậu là giả.
   - **Kết:** người chơi chọn tố cáo hoặc giữ im lặng để đổi lấy lợi.
2. **Bà Ba:** vợ ba cụ Bá, trẻ, buồn, đầy mưu mẹo.
   - **Thích:** `lua_ha_dong`, `tram_cai`, `khan_tay_theu`.
   - **Chuyện:** bức thư tình gửi mối cũ chưa bao giờ đi được (`la_thu_cu`).
3. **Lý Cường:** con trai cụ Bá, nóng nảy, ức hiếp người nghèo.
   - **Chuyện:** gây sự ở chợ. Người chơi có thể hoà giải hoặc làm chứng.
   - **Nhiệm vụ:** đòi lại con trâu của bà goá Tư.
4. **Đội Tảo:** người đứng thu thuế.
   - **Vụ:** sưu thuế thân (nhiệm vụ theo mùa: góp thuế cho các nhà nghèo).

### Những phận nghèo

5. **Anh Chí:** từng đi tù về, rượu chè, mặt đầy sẹo, chửi cả làng.
   - **Thích:** `chao_hanh`, `ruou_nep`, `ca_nuong`. **Ghét:** mọi lời khinh rẻ.
   - **Chuyện:** bậc 2 anh chửi người chơi. Bậc 4 anh say ngủ bên bờ ao, người chơi đắp áo cho anh. Bậc 6 anh kể ngày xưa mình cũng hiền, từng mơ có một gia đình nhỏ. Bậc 8 là chuyện bát cháo hành của Thị.
   - **Kết mới:** nếu đủ tình với cả anh Chí và Thị, và thuyết phục được bà cô Thị, anh bỏ rượu. Hai người được làm lễ cưới ở đình.
   - **Nhiệm vụ "Giữ lấy chai rượu":** nhặt mảnh chai cho anh, khuyên anh bỏ dao.
6. **Thị:** xấu người nhưng tốt bụng, ở với bà cô bên bờ sông.
   - **Thích:** `chao_hanh`, `hoa_bi`, `keo_lac`.
   - **Chuyện:** đêm trăng ra bờ sông, gặp anh Chí ốm, nấu cháo (`bat_chao_thi`).
7. **Bà cô Thị:** khó tính, sợ thiên hạ cười.
   - **Chuyện:** phải tặng đủ quà để bà mở lòng.
8. **Lão Hạc:** goá vợ, con trai đi phu đồn điền cao su. Lão chỉ còn con chó vàng.
   - **Thích:** `khoai_luoc`, `nuoc_che_xanh`, `ruou_trang` (ít thôi).
   - **Chuyện:** giữ mảnh vườn cho con, không bán dù đói.
   - **Kết mới:** người chơi giúp lão nuôi chó, góp gạo, viết thư cho con trai. Thư hồi âm đến ở bậc 10.
   - **Nhiệm vụ:** mua cho lão đôi gà giống để lão sống được.
9. **Ông giáo:** hàng xóm lão Hạc, hiểu chữ, nghèo, giữ sách.
   - **Thích:** `sach_nom`, `giay_do`, `muc_tau`.
   - **Chuyện:** bán dần sách để sống.
   - **Nhiệm vụ:** tìm lại cuốn sách quý ông đã bán.
10. **Vợ chồng anh Dậu, chị Dậu:** nghèo không đủ tiền nộp sưu, anh Dậu bị trói ở đình.
    - **Thích:** `gao`, `khoai`, `canh_cua`.
    - **Chuyện:** chị Dậu bán con chó và gánh khoai để chuộc chồng.
    - **Vụ lớn "Đêm ở đình":** người chơi góp đủ tiền sưu hoặc tìm bằng chứng tờ văn tự giả (liên kết với cụ Bá).
11. **Cái Tí:** con gái chị Dậu, bảy tuổi, có thể bị bán đi ở cho nhà quan.
    - **Nhiệm vụ cứu:** mang đủ tiền chuộc trước ngày thứ 20 của mùa.

### Người làng, người chợ

12. **Bác Năm Thọ:** thợ rèn, khoẻ, ít nói, từng là tay anh chị.
    - **Chuyện:** món nợ cũ với cụ Bá.
    - **Nhiệm vụ:** nâng cấp dụng cụ.
13. **Binh Chức:** lính về hưu, nghiện, hay kể chuyện chiến trận bịa.
    - **Vụ trộm gà:** ai đó trộm gà khắp làng, mọi người nghi Binh Chức, thật ra là con cáo trong rừng trúc.
14. **Tự Lãng:** ông từ giữ đình, hát xẩm, kể chuyện ma.
    - **Chuyện:** mảnh trầm hương của nhà chùa bị mất (`dot_tran`).
    - **Nhiệm vụ:** khôi phục đình làng.
15. **Thầy đồ Nho:** viết câu đối Tết bên đường, thời thế đổi thay không ai mua.
    - **Thích:** `giay_do`, `muc_tau`, `che_kho`.
    - **Kết:** nếu đủ tình, ông mở lớp dạy chữ cho trẻ con trong làng.
16. **Cô hàng nước đầu làng:** trẻ, nhanh mồm, biết mọi tin đồn. Có thể làm bạn đời.
    - **Chuyện:** mối tình với một anh học trò lên tỉnh rồi biệt tăm.
17. **Anh xe tơ:** sắp lấy vợ nhưng nhà gái thách cưới quá cao. Người chơi giúp đủ lễ.
18. **Cô Kiều làng:** cô gái đẹp, tài đàn hát, vì món nợ của cha mà phải lên tỉnh làm thuê cho mụ chủ chứa. Cảm hứng từ *Truyện Kiều*. Có thể làm bạn đời.
    - **Chuyện:** chuỗi 10 bậc buồn nhất game.
    - **Vụ:** lật mặt mụ Tú Bà ở tỉnh và gã lừa đảo. Liên kết với vùng mới là thị trấn huyện.
19. **Cậu ấm Xuân Tóc Đỏ:** nhặt bóng ở sân quần vợt trên tỉnh, rồi nhờ may mắn mà "đổi đời". Hài hước, thời thượng, nói chữ Tây. Cảm hứng từ *Số đỏ*. Nhiệm vụ của cậu toàn trò khôi hài.
20. **Bà goá Tư:** nuôi lợn, góp họ.
    - **Vụ lừa góp họ:** chủ họ ôm tiền chạy.
21. **Mụ đồng bóng:** xem bói, lên đồng, bán bùa (`bua_chu`).
    - **Vụ "Ma nhập":** cô con dâu nhà bên ốm, mụ bảo là ma. Người chơi tìm ra là ngộ độc nấm.
22. **Anh mõ:** đánh mõ báo tin, bị cả làng coi thường. Ai thân với anh thì anh báo trước những sự kiện sắp tới.

## 4. Các vụ án (bản nháp)

Mỗi vụ có manh mối, tức vật trong truyện, rải khắp các nơi. Người chơi phải hỏi chuyện đúng người. Trả lời sai thì có hậu quả: người bị oan ghét người chơi, mất tiền.

| Vụ | Mở khi | Manh mối |
|---|---|---|
| Trộm gà | Năm 1, Xuân | lông gà ở rừng trúc, dấu chân cáo |
| Mất vòng bạc | Thị lên bậc 4 | `vong_co_mat`, `dau_chan_bun` |
| Văn tự giả | cụ Bá lên bậc 6 | `van_tu_ruong`, `so_ghi_no`, lời ông giáo |
| Ma nhập | mụ đồng lên bậc 3 | `bua_chu`, nấm độc ở rừng |
| Góp họ | bà Tư lên bậc 5 | `giay_no` |
| Trầm hương nhà chùa | Tự Lãng lên bậc 4 | `dot_tran`, `chia_khoa_dong` |
| Đêm ở đình | mùa Hạ năm 1 | tiền sưu, văn tự |
| Mụ Tú Bà | cô Kiều lên bậc 8 | `khan_tay_theu`, `nhan_cuoi` |
| Bài vị bỏ làng | ông từ lên bậc 6 | `bai_vi` |

## 5. Thời lượng dự kiến

- **Năm 1** (4 mùa × 28 ngày, khoảng 6 phút một ngày, chừng 11 giờ chơi): mở đình làng, kết thân 6–8 người, giải 4 vụ án.
- **Năm 2–3:** hang đá, thị trấn huyện, các chuyện 10 bậc, cưới hỏi, đủ 100 việc trong sổ lý lịch.
- **Tổng cộng:** khoảng 40–60 giờ cho người chơi vài buổi một tuần, tức vài tháng mới hết.

## 6. Thứ tự làm tiếp (mỗi bước làm xong cho chủ xem)

1. Bốn mùa và lịch, cây theo mùa.
2. Dân làng có nhà, đi lại theo giờ, nói chuyện, tặng quà, tình cảm 10 bậc. Làm anh Chí, Thị, lão Hạc, cụ Bá trước.
3. Bảng việc ở đình và sổ nhiệm vụ.
4. Bếp nấu ăn và công thức. Chum, vại, cối xay.
5. Câu cá.
6. Chuồng trại.
7. Đình làng và các "lễ".
8. Lò rèn nâng cấp dụng cụ.
9. Hang đá (máu, quái vật nhẹ).
10. Các vụ án.
11. Lễ hội.
12. Cưới hỏi.
