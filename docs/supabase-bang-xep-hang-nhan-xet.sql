-- Đám Cưới Chuột · bảng tổng sắp: lời nhận xét dưới nhà người khác (chương IV, js/ch4/xephang.js)
-- Chạy SAU ba file supabase-bang-xep-hang.sql, -chan.sql và -nha.sql; chạy lại nhiều lần cũng không sao.
-- Mỗi nhà nhận được lời nhận xét của khách, kèm tiền nếu khách muốn cho: khách nhiều tiền hơn chủ nhà thì gọi là "bố thí",
-- ít tiền hơn thì gọi là "biếu". Tiền ấy rời ví khách và cộng vào dòng của chủ nhà (cột gift), nên bảng tổng sắp tính luôn.
-- Bảng dcc_rank_review không mở cho ai đọc/ghi trực tiếp; chỉ qua hai hàm dưới, và không hàm nào trả mã máy của người chơi.
-- (Bảng dcc_review của hồ sơ người chơi trong docs/supabase-ho-so-khach.sql là chuyện khác — đừng lẫn.)
-- Muốn giấu một lời nhận xét: Table Editor → dcc_rank_review → hidden = true.

-- 1) mỗi dòng thêm một cái tên công khai (pub) để người khác gửi lời nhận xét mà không biết mã máy, và một cột tiền được biếu
alter table public.dcc_rank add column if not exists pub text not null default '';
alter table public.dcc_rank add column if not exists gift bigint not null default 0;
update public.dcc_rank set pub = substr(md5(random()::text || device || clock_timestamp()::text), 1, 12)
  where coalesce(pub, '') = '';
create unique index if not exists dcc_rank_pub on public.dcc_rank (pub);

-- 2) gửi dòng của mình: giữ nguyên như bản -nha.sql, thêm tên công khai khi dòng mới ra đời
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
  insert into public.dcc_rank (device, name, money, day, updated_at, flag, home, pub)
  values (p_device, n, p_money, p_day, now(), p_money > public.dcc_rank_cap(p_day), coalesce(p_home, ''),
          substr(md5(random()::text || p_device || clock_timestamp()::text), 1, 12))
  on conflict (device) do update set name = excluded.name, money = excluded.money, day = excluded.day,
    updated_at = now(), flag = excluded.flag, home = coalesce(p_home, old_home);   -- gọi kiểu cũ (bốn tham số): giữ đồ đã gửi
end $$;

-- 3) bảng xếp hạng tính cả tiền được biếu: dòng của mình, những người giàu nhất, và nhà ở một thứ hạng
-- (tiền dùng để xếp hạng là money + gift; còn cửa chặn flag vẫn chỉ xét money, nên quà tặng không làm ai bị loại khỏi bảng)
create or replace function public.dcc_rank_top(p_limit int default 100)
returns table (pos bigint, name text, money bigint, day int)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by money desc, updated_at asc), name, money, day
  from (select name, money + gift as money, day, updated_at from public.dcc_rank where not hidden and not flag) t
  order by money desc, updated_at asc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
$$;

create or replace function public.dcc_rank_me(p_device text)
returns table (pos bigint, total bigint, name text, money bigint, day int, flag boolean)
language sql stable security definer set search_path = public as $$
  select case when r.hidden or r.flag then null else
           (select count(*) + 1 from public.dcc_rank o
            where not o.hidden and not o.flag
              and ((o.money + o.gift) > (r.money + r.gift)
                   or ((o.money + o.gift) = (r.money + r.gift) and o.updated_at < r.updated_at))) end,
         (select count(*) from public.dcc_rank where not hidden and not flag),
         r.name, r.money + r.gift, r.day, r.flag or r.hidden
  from public.dcc_rank r where r.device = p_device
$$;

drop function if exists public.dcc_rank_at(bigint);
drop function if exists public.dcc_rank_at(bigint, text);
create or replace function public.dcc_rank_at(p_pos bigint, p_device text default null)
returns table (pos bigint, total bigint, name text, money bigint, day int, home text, pub text, mine boolean)
language sql stable security definer set search_path = public as $$
  with t as (
    select row_number() over (order by money desc, updated_at asc) as pos, name, money, day, home, pub, device
    from (select name, money + gift as money, day, home, pub, device, updated_at
          from public.dcc_rank where not hidden and not flag) b
  ), n as (
    select count(*) as total from public.dcc_rank where not hidden and not flag
  )
  select t.pos, n.total, t.name, t.money, t.day, t.home, t.pub, coalesce(t.device = p_device, false)
  from t cross join n
  where t.pos = greatest(coalesce(p_pos, 0), 1)
$$;

-- 4) lời nhận xét (bảng riêng của bảng tổng sắp, khác dcc_review của hồ sơ người chơi)
create table if not exists public.dcc_rank_review (
  id bigserial primary key,
  target text not null,                                   -- dcc_rank.pub của nhà được nhận xét
  from_device text not null,                              -- mã máy người viết (không bao giờ trả ra ngoài)
  from_name text not null,
  kind text not null default 'bieu' check (kind in ('bieu', 'bothi')),
  amount bigint not null default 0,
  note text not null default '',
  created_at timestamptz not null default now(),
  hidden boolean not null default false
);
create index if not exists dcc_rank_review_target on public.dcc_rank_review (target, id desc);
alter table public.dcc_rank_review enable row level security;   -- không policy nào: anon không chạm được bảng

-- để lại một lời nhận xét (kèm tiền nếu có); "bố thí" hay "biếu" do server tự xét theo số tiền hai bên
create or replace function public.dcc_rank_review_put(p_target text, p_device text, p_name text, p_amount bigint, p_note text)
returns table (kind text, amount bigint)
language plpgsql security definer set search_path = public as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        s text := btrim(regexp_replace(coalesce(p_note, ''), '\s+', ' ', 'g'));
        t_device text; t_money bigint; t_gift bigint; g_money bigint; k text; last timestamptz; many bigint;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(n) < 2 or char_length(n) > 22 then raise exception 'bad name'; end if;
  if public.dcc_rank_bad(n) then raise exception 'bad words'; end if;
  if char_length(s) > 140 then raise exception 'bad note'; end if;
  if public.dcc_rank_bad(s) then raise exception 'bad words'; end if;
  if p_amount is null or p_amount < 0 or p_amount > 1000000000 then raise exception 'bad amount'; end if;
  if s = '' and p_amount = 0 then raise exception 'empty review'; end if;
  select r.device, r.money, r.gift into t_device, t_money, t_gift
    from public.dcc_rank r where r.pub = p_target and not r.hidden and not r.flag;
  if t_device is null then raise exception 'no such house'; end if;
  if t_device = p_device then raise exception 'no self'; end if;
  select coalesce(money, 0) into g_money from public.dcc_rank where device = p_device;
  k := case when coalesce(g_money, 0) > t_money + t_gift then 'bothi' else 'bieu' end;   -- nhiều tiền hơn chủ nhà: bố thí; ít hơn: biếu
  select max(created_at) into last from public.dcc_rank_review where from_device = p_device;
  if last is not null and last > now() - interval '20 seconds' then raise exception 'slow down'; end if;
  select count(*) into many from public.dcc_rank_review where from_device = p_device;
  if many >= 500 then raise exception 'slow down'; end if;
  insert into public.dcc_rank_review (target, from_device, from_name, kind, amount, note)
  values (p_target, p_device, n, k, p_amount, s);
  if p_amount > 0 then update public.dcc_rank set gift = gift + p_amount where pub = p_target; end if;
  return query select k, p_amount;
end $$;

-- đọc lời nhận xét của một nhà (mới nhất trước)
create or replace function public.dcc_rank_review_list(p_target text, p_limit int default 40)
returns table (from_name text, kind text, amount bigint, note text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select from_name, kind, amount, note, created_at
  from public.dcc_rank_review
  where target = p_target and not hidden
  order by id desc
  limit least(greatest(coalesce(p_limit, 40), 1), 100)
$$;

revoke all on function public.dcc_rank_put(text, text, bigint, int, text) from public;
revoke all on function public.dcc_rank_top(int) from public;
revoke all on function public.dcc_rank_me(text) from public;
revoke all on function public.dcc_rank_at(bigint, text) from public;
revoke all on function public.dcc_rank_review_put(text, text, text, bigint, text) from public;
revoke all on function public.dcc_rank_review_list(text, int) from public;
grant execute on function public.dcc_rank_put(text, text, bigint, int, text) to anon, authenticated;
grant execute on function public.dcc_rank_top(int) to anon, authenticated;
grant execute on function public.dcc_rank_me(text) to anon, authenticated;
grant execute on function public.dcc_rank_at(bigint, text) to anon, authenticated;
grant execute on function public.dcc_rank_review_put(text, text, text, bigint, text) to anon, authenticated;
grant execute on function public.dcc_rank_review_list(text, int) to anon, authenticated;
