-- Đám Cưới Chuột · bảng tổng sắp: nới trần tiền theo ngày gấp ba (2026-11-16)
-- Một người chơi ngày 131 có 3695 quan (cộng đồ trong nhà) bị báo "số tiền không khớp với số ngày đã chơi": trần cũ
-- 2000 + 1500·ngày + 150·ngày² (ngày 131 ≈ 4 621 quan) đặt từ trước khi phố huyện có 20 cửa hàng chạy được. Trần mới gấp ba:
-- 6000 + 4500·ngày + 450·ngày² (ngày 131 ≈ 13 864 quan, ngày 300 ≈ 69 760 quan). Các cửa khác (tăng quá nhanh trong một
-- ngày, khoá khi hơn 20 lần trần) đều đọc hàm này nên cũng nới theo.
-- Chạy một lần trong Supabase (dự án mamafzllyhbmzyystivo) → SQL Editor → New query → Run.

-- trước khi chạy, xem ai đang bị cờ (tiền theo quan):
--   select name, day, money / 600 as quan, (money + gift) / 600 as tong_quan from public.dcc_rank where flag order by day;

create or replace function public.dcc_rank_cap(p_day int)
returns bigint language sql immutable as $$
  select (6000 + 4500 * greatest(p_day, 1)::bigint + 450 * greatest(p_day, 1)::bigint * greatest(p_day, 1)::bigint)
$$;

-- những dòng đã có: đánh dấu lại theo trần mới (người bị cờ oan hiện lại trên bảng ngay)
update public.dcc_rank set flag = money > public.dcc_rank_cap(day);
