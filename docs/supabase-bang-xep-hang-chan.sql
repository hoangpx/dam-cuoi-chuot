-- Đám Cưới Chuột · bảng tổng sắp: chặn số tiền sửa tay (chạy SAU file supabase-bang-xep-hang.sql; chạy lại nhiều lần cũng không sao)
-- Một người chơi thật không thể giàu nhanh hơn một mức theo số ngày đã chơi. Trần (đồng) = 2000 + 1500 × ngày + 150 × ngày²
-- (ngày 2 ≈ 6 quan, ngày 17 ≈ 115 quan, ngày 60 ≈ 1050 quan, ngày 100 ≈ 2750 quan; người chơi giỏi còn xa mới tới).
-- Dòng vượt trần vẫn được lưu nhưng đánh dấu flag = true và không hiện trên bảng; khi số tiền về lại dưới trần thì tự hết dấu.
-- Muốn xem ai bị chặn: select name, money / 600 as quan, day from dcc_rank where flag order by money desc;

alter table public.dcc_rank add column if not exists flag boolean not null default false;

create or replace function public.dcc_rank_cap(p_day int)
returns bigint language sql immutable as $$
  select (2000 + 1500 * greatest(p_day, 1)::bigint + 150 * greatest(p_day, 1)::bigint * greatest(p_day, 1)::bigint)
$$;

-- những dòng đã có: đánh dấu lại theo trần
update public.dcc_rank set flag = money > public.dcc_rank_cap(day);

create or replace function public.dcc_rank_put(p_device text, p_name text, p_money bigint, p_day int)
returns void language plpgsql security definer set search_path = public as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')); last timestamptz;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(n) < 2 or char_length(n) > 22 then raise exception 'bad name'; end if;
  if public.dcc_rank_bad(n) then raise exception 'bad words'; end if;
  if p_money is null or p_money < -10000000 or p_money > 100000000000 then raise exception 'bad money'; end if;
  if p_day is null or p_day < 1 or p_day > 100000 then raise exception 'bad day'; end if;
  select updated_at into last from public.dcc_rank where device = p_device;
  if last is not null and last > now() - interval '10 seconds' then return; end if;
  insert into public.dcc_rank (device, name, money, day, updated_at, flag) values (p_device, n, p_money, p_day, now(), p_money > public.dcc_rank_cap(p_day))
  on conflict (device) do update set name = excluded.name, money = excluded.money, day = excluded.day, updated_at = now(), flag = excluded.flag;
end $$;

create or replace function public.dcc_rank_top(p_limit int default 100)
returns table (pos bigint, name text, money bigint, day int)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by money desc, updated_at asc), name, money, day
  from public.dcc_rank where not hidden and not flag
  order by money desc, updated_at asc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
$$;

-- thứ hạng của mình; pos = null khi dòng của mình đang bị chặn (flag) hay bị ẩn
drop function if exists public.dcc_rank_me(text);
create or replace function public.dcc_rank_me(p_device text)
returns table (pos bigint, total bigint, name text, money bigint, day int, flag boolean)
language sql stable security definer set search_path = public as $$
  select case when r.hidden or r.flag then null else
           (select count(*) + 1 from public.dcc_rank o where not o.hidden and not o.flag and (o.money > r.money or (o.money = r.money and o.updated_at < r.updated_at))) end,
         (select count(*) from public.dcc_rank where not hidden and not flag), r.name, r.money, r.day, r.flag or r.hidden
  from public.dcc_rank r where r.device = p_device
$$;

revoke all on function public.dcc_rank_put(text, text, bigint, int) from public;
revoke all on function public.dcc_rank_top(int) from public;
revoke all on function public.dcc_rank_me(text) from public;
grant execute on function public.dcc_rank_put(text, text, bigint, int) to anon, authenticated;
grant execute on function public.dcc_rank_top(int) to anon, authenticated;
grant execute on function public.dcc_rank_me(text) to anon, authenticated;
