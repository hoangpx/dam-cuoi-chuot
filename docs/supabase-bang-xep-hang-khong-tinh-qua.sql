-- Đám Cưới Chuột · bảng tổng sắp: TIỀN ĐƯỢC CHO KHÔNG TÍNH VÀO HẠNG (chương IV, js/ch4/xephang.js)
-- Chạy SAU các file: supabase-bang-xep-hang.sql, -chan.sql, -nha.sql, -nhan-xet.sql, -chan-qua.sql, -chan-tang.sql, -khoa.sql, -nhan-qua.sql; chạy lại nhiều lần cũng không sao.
-- (owner, 2026-10-23: "cho tiền thì ko tính vào bảng xếp hạng") Tiền xếp hạng = tiền trong ví của dòng bảng TRỪ phần đã nhận từ quà (cột got).
-- Quà chưa lấy (cột gift) không tính nữa. Người cho thì ví giảm thật (không bù lại: bù lại sẽ cho kẻ gian cách tự cộng điểm bằng quà giả).
-- Người nhận lấy quà vào ví (dcc_rank_claim, -nhan-qua.sql) thì ví tăng nhưng got tăng cùng số đó, nên hạng không nhúc nhích.

alter table public.dcc_rank add column if not exists got bigint not null default 0;

-- những quà đã được trả vào ví từ trước (đã lấy và ≤ 5999 đồng, không bị giấu) tính vào got; chạy lại không cộng thêm vì tính lại từ đầu
update public.dcc_rank r set got = coalesce((select sum(v.amount) from public.dcc_rank_review v
  where v.target = r.pub and v.claimed and not v.hidden and v.amount > 0 and v.amount <= 5999), 0);

create or replace function public.dcc_rank_top(p_limit int default 100)
returns table (pos bigint, name text, money bigint, day int)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by money desc, updated_at asc), name, money, day
  from (select name, money - got as money, day, updated_at from public.dcc_rank where not hidden and not flag) t
  order by money desc, updated_at asc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
$$;

create or replace function public.dcc_rank_me(p_device text)
returns table (pos bigint, total bigint, name text, money bigint, day int, flag boolean)
language sql stable security definer set search_path = public as $$
  select case when r.hidden or r.flag then null else
           (select count(*) + 1 from public.dcc_rank o
            where not o.hidden and not o.flag
              and ((o.money - o.got) > (r.money - r.got)
                   or ((o.money - o.got) = (r.money - r.got) and o.updated_at < r.updated_at))) end,
         (select count(*) from public.dcc_rank where not hidden and not flag),
         r.name, r.money - r.got, r.day, r.flag or r.hidden
  from public.dcc_rank r where r.device = p_device
$$;

drop function if exists public.dcc_rank_at(bigint);
drop function if exists public.dcc_rank_at(bigint, text);
create or replace function public.dcc_rank_at(p_pos bigint, p_device text default null)
returns table (pos bigint, total bigint, name text, money bigint, day int, home text, pub text, mine boolean)
language sql stable security definer set search_path = public as $$
  with t as (
    select row_number() over (order by money desc, updated_at asc) as pos, name, money, day, home, pub, device
    from (select name, money - got as money, day, home, pub, device, updated_at
          from public.dcc_rank where not hidden and not flag) b
  ), n as (
    select count(*) as total from public.dcc_rank where not hidden and not flag
  )
  select t.pos, n.total, t.name, t.money, t.day, t.home, t.pub, coalesce(t.device = p_device, false)
  from t cross join n
  where t.pos = greatest(coalesce(p_pos, 0), 1)
$$;

revoke all on function public.dcc_rank_top(int) from public;
revoke all on function public.dcc_rank_me(text) from public;
revoke all on function public.dcc_rank_at(bigint, text) from public;
grant execute on function public.dcc_rank_top(int) to anon, authenticated;
grant execute on function public.dcc_rank_me(text) to anon, authenticated;
grant execute on function public.dcc_rank_at(bigint, text) to anon, authenticated;
