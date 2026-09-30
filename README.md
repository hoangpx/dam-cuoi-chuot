# Đám Cưới Chuột

Game giải đố phong cách tranh dân gian Đông Hồ, vẽ hoàn toàn bằng Canvas 2D. Mỗi chương là một lối chơi khác.

**Chơi:** https://hoangpx.github.io/dam-cuoi-chuot/ · bản cũ (một file, đoàn 5 chuột): https://hoangpx.github.io/dam-cuoi-chuot/v1/

- 2D thuần, vẽ hoàn toàn bằng Canvas 2D: nét khắc gỗ, màu in lệch và loang, giấy dó quét điệp.
- Không có chữ hướng dẫn: người chơi tự khám phá bằng cách chạm, kéo thả vào đồ vật và nhân vật trong tranh.
- Mỗi chương một bài nhạc riêng.
- Tiến độ lưu trên trình duyệt.

## Các chương

- **Chương I · Đám Cưới Chuột** (cuộn ngang). Dẫn đoàn rước dâu qua làng: đứng im hoặc nấp khi mèo mở mắt; chạm vào lọng để giương lọng, chạm chú chuột đánh trống, thổi kèn để chơi.
  - Tranh 1 · Ải Mèo: bắt con cá khi nó nhảy lên bờ ao, kéo cá dâng cho mèo đói.
  - Tranh 2 · Ngõ Tre: gà trống gáy không ra tiếng, kéo ba chữ ò ó o thả vào gà theo đúng thứ tự.
  - Tranh 3 · Bờ Ao: chọn đúng con chim, xếp đàn vịt thành cầu, gõ trống đúng nhịp đánh thức trâu, mang trầu cau tới cổng nhà gái.
  - Tranh 4–6 đang khắc ván.
- **Chương II · Chữ Là Luật** (8 tranh Nhập môn + 6 tranh Cao thủ): chữ khắc gỗ là luật chơi (kiểu Baba Is You). Đẩy chữ để ghép, phá hay đổi luật (CHUỘT LÀ ĐI, TƯỜNG LÀ CHẶN, MÈO LÀ CÁ, LỬA LÀ CỔNG…). Có hoàn tác (Z), chơi lại (R), vuốt hoặc nút mũi tên trên điện thoại. Mọi màn đều đã được máy giải tự động kiểm chứng.

Điều khiển: ← → hoặc A D để đi, chạm hoặc bấm chuột vào đồ vật trong tranh. Trên điện thoại dùng nút trên màn hình.

## Cấu trúc code

Không cần build, GitHub Pages chạy thẳng các file.

- `index.html`: khung trang và bộ nạp (tải font trước, rồi nạp các file JS theo thứ tự).
- `js/core/`: phần dùng chung cho mọi chương (máy in khắc gỗ, âm thanh, menu, vòng lặp, sổ đăng ký chương).
- `js/art/`: thư viện hình vẽ dùng chung (chuột, mèo, đồ vật, cảnh làng).
- `js/ch1/`: Chương I, mỗi tranh một file (`tranh1-ai-meo.js`, `tranh2-ngo-tre.js`, `tranh3-bo-ao.js`…).
- `js/ch2/`: Chương II (bản đồ, luật chữ, hình, game).
- `css/`: `base.css` dùng chung, `ch1.css`, `ch2.css` cho từng chương.
- `tools/regress/`: bộ kiểm tra tự động, chạy lại mọi tranh và so từng khung hình.

Mỗi chương tự đăng ký bằng `registerChapter(...)`. Thêm chương mới chỉ cần tạo thư mục `js/chN/` và thêm tên file vào danh sách trong `index.html`, không phải sửa các chương khác. Chi tiết xem `CLAUDE.md`.
