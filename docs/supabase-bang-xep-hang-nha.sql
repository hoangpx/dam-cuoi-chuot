-- Đám Cưới Chuột · bảng tổng sắp: xem nhà của người khác (chương IV, js/ch4/xephang.js)
-- Chạy SAU hai file supabase-bang-xep-hang.sql và supabase-bang-xep-hang-chan.sql; chạy lại nhiều lần cũng không sao.
-- Mỗi dòng thêm một cột home: danh sách mã món đã sắm sanh, cách nhau bằng dấu phẩy ("chieu,denlong"). Dòng cũ chưa có thì để trống.
-- Bảng vẫn không mở cho ai đọc/ghi trực tiếp; chỉ qua các hàm dưới, và không hàm nào trả mã máy của người chơi.
-- Muốn xem nhà ai: vào game → sổ tay → Tổng sắp → nút Nhà ở dòng đó, hoặc nhập số hạng.

alter table public.dcc_rank add column if not exists home text not null default '';

-- chỉ nhận đúng mười ba món của gian nhà (giống C4_SHOP_ITEMS bên js/ch4/kinhdoanh.js), không trùng, không mã lạ
create or replace function public.dcc_rank_home_ok(p_home text)
returns boolean language sql immutable as $$
  select case
    when coalesce(p_home, '') = '' then true
    when char_length(p_home) > 200 then false
    else not exists (
           select 1 from regexp_split_to_table(p_home, ',') h
           where h <> all (array['chieu', 'denlong', 'tranh', 'channen', 'caudoi', 'cuavong', 'hoanhphi',
                                 'luhuong', 'anthờ', 'tuche', 'sap', 'lucbinh', 'hac'])
         )
         and (select count(*) from regexp_split_to_table(p_home, ',') h)
           = (select count(distinct h) from regexp_split_to_table(p_home, ',') h)
  end
$$;

-- gửi (hoặc cập nhật) dòng của mình, kèm đồ trong nhà; gọi kiểu cũ bốn tham số thì giữ nguyên đồ đã gửi trước đó
drop function if exists public.dcc_rank_put(text, text, bigint, int);
create or replace function public.dcc_rank_put(p_device text, p_name text, p_money bigint, p_day int, p_home text default null)
returns void language plpgsql security definer set search_path = public as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')); last timestamptz; old_home text;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(n) < 2 or char_length(n) > 22 then raise exception 'bad name'; end if;
  if public.dcc_rank_bad(n) then raise exception 'bad words'; end if;
  if p_money is null or p_money < -10000000 or p_money > 100000000000 then raise exception 'bad money'; end if;
  if p_day is null or p_day < 1 or p_day > 100000 then raise exception 'bad day'; end if;
  if p_home is not null and not public.dcc_rank_home_ok(p_home) then raise exception 'bad home'; end if;
  select updated_at, home into last, old_home from public.dcc_rank where device = p_device;
  if last is not null and last > now() - interval '10 seconds' then return; end if;   -- quá dày: bỏ qua lặng lẽ
  insert into public.dcc_rank (device, name, money, day, updated_at, flag, home)
  values (p_device, n, p_money, p_day, now(), p_money > public.dcc_rank_cap(p_day), coalesce(p_home, ''))
  on conflict (device) do update set name = excluded.name, money = excluded.money, day = excluded.day,
    updated_at = now(), flag = excluded.flag, home = coalesce(p_home, old_home);   -- gọi kiểu cũ (bốn tham số): giữ đồ đã gửi
end $$;

-- nhà của người đứng thứ p_pos trên bảng: tên, tiền, ngày, tổng số người và đồ trong nhà
drop function if exists public.dcc_rank_at(bigint);
create or replace function public.dcc_rank_at(p_pos bigint)
returns table (pos bigint, total bigint, name text, money bigint, day int, home text)
language sql stable security definer set search_path = public as $$
  with t as (
    select row_number() over (order by money desc, updated_at asc) as pos, name, money, day, home
    from public.dcc_rank where not hidden and not flag
  ), n as (
    select count(*) as total from public.dcc_rank where not hidden and not flag
  )
  select t.pos, n.total, t.name, t.money, t.day, t.home
  from t cross join n
  where t.pos = greatest(coalesce(p_pos, 0), 1)
$$;

revoke all on function public.dcc_rank_home_ok(text) from public;
revoke all on function public.dcc_rank_put(text, text, bigint, int, text) from public;
revoke all on function public.dcc_rank_at(bigint) from public;
grant execute on function public.dcc_rank_put(text, text, bigint, int, text) to anon, authenticated;
grant execute on function public.dcc_rank_at(bigint) to anon, authenticated;
