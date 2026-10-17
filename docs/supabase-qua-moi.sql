-- Đám Cưới Chuột · quà mời và lời cảm ơn giữa người chơi (chương IV, js/ch4/hoso.js)
-- Khi một người chơi mời khách phương xa (hồ sơ của người chơi khác) ăn thử ở quán nhà mình và khách đến ăn, một "quà mời" được
-- ghi ở đây. Chủ hồ sơ đọc các quà mời trong sổ tay › Hồ sơ và gửi lại một lời cảm ơn; người mời đọc lời cảm ơn trong sổ tay của mình.
-- CẦN CHẠY SAU docs/supabase-ho-so-khach.sql (dùng bảng dcc_prof và hàm dcc_prof_bad của file đó).
-- Chạy một lần trong Supabase → SQL Editor → New query → Run. Chạy lại cũng được (create or replace).
-- Bảng không mở cho ai đọc/ghi trực tiếp; chỉ qua các hàm dưới. Không hàm nào trả máy (device) của ai.

create table if not exists public.dcc_gift (
  id bigint generated always as identity primary key,
  target bigint not null references public.dcc_prof (id) on delete cascade,
  device text not null,
  from_name text not null default '',
  shop text not null default '',
  what text not null,
  liked boolean not null default false,
  created_at timestamptz not null default now(),
  thanks text,
  thanked_at timestamptz,
  hidden boolean not null default false
);
create index if not exists dcc_gift_target on public.dcc_gift (target, created_at desc);
create index if not exists dcc_gift_device on public.dcc_gift (device, created_at desc);
alter table public.dcc_gift enable row level security;

-- một khách phương xa vừa ăn món mình mời: ghi quà cho chủ hồ sơ ấy
-- (mỗi máy mời một hồ sơ cách nhau ít nhất 20 phút, tối đa 40 lời mời một giờ)
create or replace function public.dcc_gift_add(p_device text, p_target bigint, p_what text, p_liked boolean, p_from text, p_shop text)
returns bigint language plpgsql security definer set search_path = public as $$
declare w text := left(btrim(regexp_replace(coalesce(p_what, ''), '\s+', ' ', 'g')), 40);
        f text := left(btrim(regexp_replace(coalesce(p_from, ''), '\s+', ' ', 'g')), 24);
        s text := left(btrim(regexp_replace(coalesce(p_shop, ''), '\s+', ' ', 'g')), 24);
        new_id bigint;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(w) < 1 then raise exception 'bad what'; end if;
  if dcc_prof_bad(w) or dcc_prof_bad(f) or dcc_prof_bad(s) then raise exception 'bad words'; end if;
  if not exists (select 1 from dcc_prof where id = p_target and pub and not hidden) then raise exception 'no target'; end if;
  if exists (select 1 from dcc_prof where id = p_target and device = p_device) then raise exception 'self'; end if;
  if exists (select 1 from dcc_gift where target = p_target and device = p_device and created_at > now() - interval '20 minutes') then raise exception 'too soon'; end if;
  if (select count(*) from dcc_gift where device = p_device and created_at > now() - interval '1 hour') >= 40 then raise exception 'busy'; end if;
  insert into dcc_gift (target, device, from_name, shop, what, liked) values (p_target, p_device, f, s, w, coalesce(p_liked, false)) returning id into new_id;
  return new_id;
end $$;

-- quà mời người khác gửi cho hồ sơ của máy này
create or replace function public.dcc_gift_mine(p_device text)
returns table (id bigint, from_name text, shop text, what text, liked boolean, created_at timestamptz, thanks text)
language sql stable security definer set search_path = public as $$
  select g.id, g.from_name, g.shop, g.what, g.liked, g.created_at, g.thanks
  from dcc_gift g join dcc_prof p on p.id = g.target
  where p.device = p_device and not g.hidden order by g.created_at desc limit 60
$$;

-- chủ hồ sơ gửi lời cảm ơn cho một quà (một lần, tối đa 80 chữ)
create or replace function public.dcc_gift_thank(p_device text, p_id bigint, p_text text)
returns void language plpgsql security definer set search_path = public as $$
declare t text := left(btrim(regexp_replace(coalesce(p_text, ''), '\s+', ' ', 'g')), 80);
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(t) < 1 then raise exception 'bad length'; end if;
  if dcc_prof_bad(t) then raise exception 'bad words'; end if;
  update dcc_gift g set thanks = t, thanked_at = now()
  from dcc_prof p where g.id = p_id and p.id = g.target and p.device = p_device and g.thanks is null;
end $$;

-- những quà máy này đã mời, với tên người được mời và lời cảm ơn (nếu có)
create or replace function public.dcc_gift_sent(p_device text)
returns table (id bigint, target bigint, who jsonb, what text, liked boolean, created_at timestamptz, thanks text, thanked_at timestamptz)
language sql stable security definer set search_path = public as $$
  select g.id, g.target, jsonb_build_object('name', p.data->>'name', 'role', p.data->>'role', 'age', p.data->>'age'), g.what, g.liked, g.created_at, g.thanks, g.thanked_at
  from dcc_gift g join dcc_prof p on p.id = g.target
  where g.device = p_device order by coalesce(g.thanked_at, g.created_at) desc limit 60
$$;

-- đếm: quà nhận được, lời cảm ơn nhận được (để báo khi có cái mới)
create or replace function public.dcc_gift_count(p_device text)
returns table (ngift int, nthank int)
language sql stable security definer set search_path = public as $$
  select (select count(*)::int from dcc_gift g join dcc_prof p on p.id = g.target where p.device = p_device and not g.hidden),
         (select count(*)::int from dcc_gift g where g.device = p_device and g.thanks is not null)
$$;

revoke all on function public.dcc_gift_add(text, bigint, text, boolean, text, text) from public;
revoke all on function public.dcc_gift_mine(text) from public;
revoke all on function public.dcc_gift_thank(text, bigint, text) from public;
revoke all on function public.dcc_gift_sent(text) from public;
revoke all on function public.dcc_gift_count(text) from public;
grant execute on function public.dcc_gift_add(text, bigint, text, boolean, text, text) to anon, authenticated;
grant execute on function public.dcc_gift_mine(text) to anon, authenticated;
grant execute on function public.dcc_gift_thank(text, bigint, text) to anon, authenticated;
grant execute on function public.dcc_gift_sent(text) to anon, authenticated;
grant execute on function public.dcc_gift_count(text) to anon, authenticated;
