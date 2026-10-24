-- Đám Cưới Chuột · bảng tổng sắp: bấm tên người để lại nhận xét thì sang nhà người đó (chương IV, js/ch4/xephang.js)
-- Chạy SAU supabase-bang-xep-hang-nhan-xet.sql và -khong-tinh-qua.sql; chạy lại nhiều lần cũng không sao.
-- Danh sách nhận xét trả thêm from_pub = tên công khai (pub) của nhà người viết (null nếu người đó không còn trên bảng).
-- Không trả mã máy. dcc_rank_at_pub mở nhà theo pub, cùng cột với dcc_rank_at.

drop function if exists public.dcc_rank_review_list(text, int);
create or replace function public.dcc_rank_review_list(p_target text, p_limit int default 40)
returns table (from_name text, kind text, amount bigint, note text, created_at timestamptz, from_pub text)
language sql stable security definer set search_path = public as $$
  select v.from_name, v.kind, v.amount, v.note, v.created_at,
         (select r.pub from public.dcc_rank r where r.device = v.from_device and not r.hidden and not r.flag)
  from public.dcc_rank_review v
  where v.target = p_target and not v.hidden
  order by v.id desc
  limit least(greatest(coalesce(p_limit, 40), 1), 100)
$$;

create or replace function public.dcc_rank_at_pub(p_pub text, p_device text default null)
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
  where t.pub = p_pub
$$;

revoke all on function public.dcc_rank_review_list(text, int) from public;
revoke all on function public.dcc_rank_at_pub(text, text) from public;
grant execute on function public.dcc_rank_review_list(text, int) to anon, authenticated;
grant execute on function public.dcc_rank_at_pub(text, text) to anon, authenticated;
