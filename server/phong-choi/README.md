# Phòng chơi chung (Cloudflare Durable Object)

Máy chủ của chương IX · Hội Làng. Một phòng duy nhất (`idFromName('main')`), WebSocket tại `/ws`.
Giao thức và luật vòng chơi nằm ở đầu `src/index.js`.

- Đưa lên: `cd server/phong-choi && npx wrangler deploy` (cần Node và `npx wrangler login` một lần).
- Địa chỉ hiện tại: `wss://dcc-phong-choi.dcc-phong-choi.workers.dev/ws` (khớp `HL_URL` trong `js/hoilang/net.js`).
- Thử: `node test.mjs [địa chỉ ws]` (hai người chơi giả, in các tin chính).
- Chỉ nhận kết nối từ damcuoichuot.com, localhost và mạng LAN (kiểm tra `Origin`).
- Phòng trống thì máy chủ ngừng chạy vòng lặp, không tốn gì.
