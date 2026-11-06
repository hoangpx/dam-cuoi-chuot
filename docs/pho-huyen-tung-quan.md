# Phố Huyện: từng quán một (bản đề xuất, 2026-11-06)

Mục tiêu (owner): mỗi quán trên phố đều đứng bán được như hiệu trầu, càng nhiều thứ để tuỳ chỉnh càng tốt.

## Hiện trạng

| Loại | Quán | Bây giờ |
|---|---|---|
| Nhà mình | Hiệu trầu (x 720) | Nhập trầu, đặt giá, đổi tên, biển đẹp, tạm đóng, thuê 1 người, giảm giá, mời khách, têm trầu (mini game), thuyền đặt hàng |
| Quán ăn (9) | Bún chả, Bánh bao, Cơm gà, Hủ tiếu, Cơm tấm, Chè, Cao lầu, Phở bò, Bánh vạc | Thuê 50 quan/tuần hoặc mua 500 quan. Đầu bếp tự nấu, tự mua nguyên liệu (24 đ một bát, bán 60 đ). Đổi tên, biển đẹp, giá, giảm giá, mời khách, tạm đóng. Một món duy nhất. |
| Cửa hiệu (6) | Gạo muối, Thuốc bắc, Giấy bút, Hàng xén, Trà sen, May áo dài | Chỉ là cảnh, không thuê được |
| Hàng đèn (4) | Đèn lồng, Lồng đèn Phúc, Đèn hoa sen, Đèn lồng Tài Lộc | Chỉ là cảnh |
| Hội quán | | Cảnh |

## Khung chung cho mọi quán (giống hiệu trầu)

1. **Có quán**: thuê theo tuần hoặc mua đứt (như quán ăn bây giờ), giá thuê theo loại quán.
2. **Hàng và giá**: mỗi quán có 3 đến 4 mặt hàng. Mỗi mặt hàng: nhập (vốn), giá bán do người chơi đặt (luật cung cầu của gia.js), còn bao nhiêu, hỏng hay để được.
3. **Thực đơn**: chọn bày bán những món nào hôm nay (bày ít món thì khách ít nhưng nhập ít).
4. **Người bán**: mỗi quán thuê 1 đến 2 người (nhanh nhẹn, nhiệt tình, trung thực như bây giờ). Không thuê ai thì quán không có người đứng (vợ ở hiệu trầu). Quán ăn giữ đầu bếp tự nấu.
5. **Khách**: giờ đông riêng của từng quán, thời tiết riêng, khách quen riêng, mời khách, giảm giá.
6. **Trang trí** (như chợ làng): biển (kiểu, màu, tên), mái hiên, cửa, cửa sổ, màu tường, đèn lồng, chậu cây, bàn ghế ngoài hiên.
7. **Nâng cấp**: tủ hàng to hơn (chứa nhiều hơn), quầy thứ hai (2 người bán cùng lúc), bàn ăn (quán ăn: khách ngồi lâu, ăn nhiều).
8. **Đơn đặt** (như thuyền ở hiệu trầu): mỗi loại quán có kiểu khách đặt riêng.

## Từng quán

### Quán ăn (giữ đầu bếp tự nấu, thêm thực đơn và bàn ghế)

| Quán | Món (vốn → giá gợi ý) | Giờ đông | Thời tiết | Riêng |
|---|---|---|---|---|
| Bún chả | Bún chả (24 → 60), Nem rán (12 → 30), Trà đá (2 → 5) | trưa | nắng đông | than hoa: khói bay, mùi kéo khách đi ngang |
| Bánh bao | Bánh bao nhân thịt (10 → 25), Bánh bao chay (6 → 15), Xíu mại (14 → 35) | sáng, tối | rét đông | xửng hấp bốc hơi; khách mua mang đi nhiều |
| Cơm gà | Cơm gà (26 → 65), Gà luộc nửa con (60 → 150), Canh (4 → 10) | trưa, tối | | đơn đặt gà luộc cho đám cỗ |
| Hủ tiếu | Hủ tiếu (22 → 55), Hoành thánh (16 → 40) | sáng, đêm | mưa đông | gánh hủ tiếu gõ đi rao (người làm đi quanh phố) |
| Cơm tấm | Cơm tấm sườn (24 → 60), Trứng ốp (6 → 15), Bì chả (10 → 25) | sáng | | |
| Chè | Chè đậu (8 → 20), Chè thập cẩm (12 → 30), Chè nóng (8 → 20) | chiều | nắng: chè đá, rét: chè nóng | đổi thực đơn theo trời |
| Cao lầu | Cao lầu (26 → 65), Mì Quảng (24 → 60) | trưa | | khách phương xa thích |
| Phở bò | Phở tái (26 → 65), Phở chín (24 → 60), Quẩy (3 → 8) | sáng sớm | rét đông | nồi nước dùng ninh từ đêm: mở sớm bán được nhiều |
| Bánh vạc | Bánh vạc (16 → 40), Hoành thánh chiên (18 → 45) | chiều | | |

### Cửa hiệu (đứng bán như hiệu trầu: nhập hàng, người bán)

| Quán | Hàng (vốn → giá) | Để được | Ai mua, khi nào | Riêng |
|---|---|---|---|---|
| Gạo muối | Gạo tám (7 → 10/đấu), Gạo nếp (9 → 13), Muối (1 → 2) | lâu | sáng, ngày phiên chợ; mưa thì ít | bán nhiều, lãi mỏng; khách mua sỉ (quán ăn đặt) |
| Thuốc bắc | Thang cảm (9 → 16), Thuốc bổ (20 → 40), Cao (40 → 80) | lâu | trời rét, mưa đông | khách ốm hỏi thuốc; thang đặt sẵn |
| Giấy bút | Giấy dó (3 → 6), Bút lông (8 → 15), Mực tàu (10 → 20) | lâu | gần kỳ thi, Tết | thầy đồ đặt nhiều |
| Hàng xén | Kim chỉ (2 → 4), Gương lược (8 → 15), Khăn (10 → 18) | lâu | chiều | nhiều món nhỏ, khách đàn bà |
| Trà sen | Trà sen (30 → 55), Trà mạn (12 → 22), Ấm chén (40 → 70) | lâu | sáng sớm, mùa sen | khách sang, mua ít mà giá cao |
| May áo dài | Áo dài (may: nhận đơn, giao hôm sau) (120 → 220), Sửa áo (5 → 15) | | trước ngày cưới, Tết | đơn may: nhận tiền cọc, giao sau một ngày |

### Hàng đèn (bán ban đêm)

| Quán | Hàng | Riêng |
|---|---|---|
| Đèn lồng, Lồng đèn Phúc, Đèn hoa sen, Đèn lồng Tài Lộc | Đèn lồng tròn (8 → 18), đèn hoa sen (12 → 28), đèn kéo quân (25 → 55), hoa đăng thả sông (5 → 12) | bán đông từ 18 giờ; mùa hội đông gấp đôi; hoa đăng nối với hoa đăng thả sông có sẵn |

## Owner đã chọn (2026-11-06)

1. Làm cả 19 quán một lượt.
2. Quán ăn cũng nhập nguyên liệu như hiệu trầu (đồ không để qua đêm bị bỏ đi, mỗi sáng tự nhập theo số đã đặt).
3. Mỗi quán có trò tự tay bán (một khung chung, món và cách làm riêng từng loại quán: js/ch4b/tiemnho.js).
