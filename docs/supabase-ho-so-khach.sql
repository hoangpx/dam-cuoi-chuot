-- Đám Cưới Chuột · hồ sơ người chơi, khách phương xa và đánh giá (chương IV, cả chợ làng lẫn phố huyện; js/ch4/hoso.js)
-- Mỗi người chơi có một hồ sơ (tên, vai vợ/chồng, tuổi, trang phục, món thích, mô tả, các câu chuyện, chỉ số). Hồ sơ đó đi chợ
-- trong game của người chơi khác như một "khách phương xa"; thành khách quen thì được đánh giá (mỗi người một lần), và chủ hồ sơ
-- đọc được các đánh giá đó trong sổ tay.
-- Chạy một lần trong Supabase (dự án mamafzllyhbmzyystivo) → SQL Editor → New query → Run. Chạy lại cũng được (create or replace).
-- Ba bảng không mở cho ai đọc/ghi trực tiếp (RLS bật, không có policy); chỉ qua các hàm dưới. Máy của người chơi (device, dcc.dev)
-- là khoá bí mật: không hàm nào trả nó ra ngoài; người khác chỉ thấy id số của hồ sơ.
-- Muốn ẩn tay: Table Editor → dcc_prof / dcc_review → đặt hidden = true.

create table if not exists public.dcc_prof (
  id bigint generated always as identity primary key,
  device text not null unique,
  name text not null,
  data jsonb not null,
  pub boolean not null default true,
  day int not null default 1,
  updated_at timestamptz not null default now(),
  reports int not null default 0,
  hidden boolean not null default false
);
create index if not exists dcc_prof_updated on public.dcc_prof (updated_at desc);
alter table public.dcc_prof enable row level security;

create table if not exists public.dcc_review (
  id bigint generated always as identity primary key,
  target bigint not null references public.dcc_prof (id) on delete cascade,
  device text not null,
  from_name text not null default '',
  stars int not null check (stars between 1 and 5),
  body text not null default '',
  created_at timestamptz not null default now(),
  reports int not null default 0,
  hidden boolean not null default false,
  unique (target, device)
);
create index if not exists dcc_review_target on public.dcc_review (target, created_at desc);
create index if not exists dcc_review_device on public.dcc_review (device, created_at desc);
alter table public.dcc_review enable row level security;

-- ai đã coi hồ sơ này là khách quen ở chợ nhà mình (mỗi máy một lần)
create table if not exists public.dcc_regular (
  target bigint not null references public.dcc_prof (id) on delete cascade,
  device text not null,
  created_at timestamptz not null default now(),
  primary key (target, device)
);
alter table public.dcc_regular enable row level security;

-- chữ bậy: cùng danh sách với dcc_hoa_bad (docs/supabase-hoa-dang.sql) và p4HoaBad trong game; giữ ba chỗ giống nhau
create or replace function public.dcc_prof_bad(p text)
returns boolean language sql immutable as $$
  select lower(coalesce(p, '')) ~ '(địt|đụ|lồn|buồi|cặc|đéo|đĩ |đỉ |fuck|shit|bitch|óc chó|chó đẻ|mẹ mày|con mẹ mày|bố mày)'
      or lower(coalesce(p, '')) ~ '\m(đm|dm|đcm|dcm|đmm|dmm|vcl|vkl|vl|clm|cmm|cc|cl)\M'
$$;

-- lưu (hoặc sửa) hồ sơ của máy này; trả id số của hồ sơ
create or replace function public.dcc_prof_put(p_device text, p_data jsonb, p_pub boolean)
returns bigint language plpgsql security definer set search_path = public as $$
declare n text := btrim(regexp_replace(coalesce(p_data->>'name', ''), '\s+', ' ', 'g'));
        d text := coalesce(p_data->>'desc', '');
        st jsonb := coalesce(p_data->'stories', '[]'::jsonb);
        lk jsonb := coalesce(p_data->'likes', '[]'::jsonb);
        all_text text;
        dy int;
        new_id bigint;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if jsonb_typeof(p_data) <> 'object' or octet_length(p_data::text) > 8000 then raise exception 'bad data'; end if;
  if char_length(n) < 1 or char_length(n) > 12 then raise exception 'bad name'; end if;
  if char_length(d) > 200 then raise exception 'bad desc'; end if;
  if jsonb_typeof(st) <> 'array' or jsonb_array_length(st) > 8 then raise exception 'bad stories'; end if;
  if exists (select 1 from jsonb_array_elements(st) e where jsonb_typeof(e) <> 'string' or char_length(e #>> '{}') > 120) then raise exception 'bad stories'; end if;
  if jsonb_typeof(lk) <> 'array' or jsonb_array_length(lk) > 40 then raise exception 'bad likes'; end if;
  select n || ' ' || d || ' ' || coalesce(string_agg(e #>> '{}', ' '), '') into all_text from jsonb_array_elements(st) e;
  if dcc_prof_bad(all_text) then raise exception 'bad words'; end if;
  if exists (select 1 from dcc_prof where device = p_device and updated_at > now() - interval '5 seconds') then raise exception 'too soon'; end if;
  dy := least(greatest(coalesce((p_data #>> '{stats,day}')::int, 1), 1), 100000);
  insert into dcc_prof (device, name, data, pub, day) values (p_device, n, p_data, coalesce(p_pub, true), dy)
    on conflict (device) do update set name = excluded.name, data = excluded.data, pub = excluded.pub, day = excluded.day, updated_at = now()
    returning id into new_id;
  return new_id;
end $$;

-- vài hồ sơ ngẫu nhiên của người khác, còn chơi trong 45 ngày qua (không bao giờ trả máy của ai)
create or replace function public.dcc_prof_pick(p_device text, p_limit int)
returns table (id bigint, data jsonb, stars numeric, nrev int, nreg int, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.data,
         (select round(avg(r.stars)::numeric, 1) from dcc_review r where r.target = p.id and not r.hidden),
         (select count(*)::int from dcc_review r where r.target = p.id and not r.hidden),
         (select count(*)::int from dcc_regular g where g.target = p.id),
         p.updated_at
  from dcc_prof p
  where p.pub and not p.hidden and p.device <> coalesce(p_device, '') and p.updated_at > now() - interval '45 days'
  order by random() limit least(greatest(coalesce(p_limit, 30), 1), 60)
$$;

-- hồ sơ mới nhất của những người đã quen (để khách quen vẫn ghé dù không trúng lượt ngẫu nhiên)
create or replace function public.dcc_prof_get(p_ids bigint[])
returns table (id bigint, data jsonb, stars numeric, nrev int, nreg int, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.id, p.data,
         (select round(avg(r.stars)::numeric, 1) from dcc_review r where r.target = p.id and not r.hidden),
         (select count(*)::int from dcc_review r where r.target = p.id and not r.hidden),
         (select count(*)::int from dcc_regular g where g.target = p.id),
         p.updated_at
  from dcc_prof p
  where p.id = any (coalesce(p_ids, '{}')[1:200]) and p.pub and not p.hidden
$$;

-- số liệu của chính mình: id hồ sơ, sao trung bình, số đánh giá, số chợ coi mình là khách quen
create or replace function public.dcc_prof_me(p_device text)
returns table (id bigint, stars numeric, nrev int, nreg int, hidden boolean)
language sql stable security definer set search_path = public as $$
  select p.id,
         (select round(avg(r.stars)::numeric, 1) from dcc_review r where r.target = p.id and not r.hidden),
         (select count(*)::int from dcc_review r where r.target = p.id and not r.hidden),
         (select count(*)::int from dcc_regular g where g.target = p.id),
         p.hidden
  from dcc_prof p where p.device = p_device
$$;

-- một chợ vừa nhận hồ sơ này làm khách quen
create or replace function public.dcc_regular_add(p_device text, p_target bigint)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if exists (select 1 from dcc_prof where id = p_target and device = p_device) then return; end if;
  insert into dcc_regular (target, device) select p_target, p_device where exists (select 1 from dcc_prof where id = p_target)
    on conflict do nothing;
end $$;

-- đánh giá một khách quen: mỗi máy chỉ một lần cho mỗi hồ sơ
create or replace function public.dcc_review_put(p_device text, p_target bigint, p_stars int, p_body text, p_from text)
returns bigint language plpgsql security definer set search_path = public as $$
declare b text := btrim(regexp_replace(coalesce(p_body, ''), '\s+', ' ', 'g'));
        f text := left(btrim(regexp_replace(coalesce(p_from, ''), '\s+', ' ', 'g')), 24);
        new_id bigint;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if p_stars is null or p_stars < 1 or p_stars > 5 then raise exception 'bad stars'; end if;
  if char_length(b) > 200 then raise exception 'bad length'; end if;
  if dcc_prof_bad(b) or dcc_prof_bad(f) then raise exception 'bad words'; end if;
  if not exists (select 1 from dcc_prof where id = p_target) then raise exception 'no target'; end if;
  if exists (select 1 from dcc_prof where id = p_target and device = p_device) then raise exception 'self'; end if;
  if exists (select 1 from dcc_review where target = p_target and device = p_device) then raise exception 'already'; end if;
  if exists (select 1 from dcc_review where device = p_device and created_at > now() - interval '10 seconds') then raise exception 'too soon'; end if;
  if (select count(*) from dcc_review where created_at > now() - interval '1 minute') >= 60 then raise exception 'busy'; end if;
  insert into dcc_review (target, device, from_name, stars, body) values (p_target, p_device, f, p_stars, b) returning id into new_id;
  return new_id;
end $$;

-- các đánh giá người khác để lại cho hồ sơ của máy này
create or replace function public.dcc_review_mine(p_device text)
returns table (id bigint, stars int, body text, from_name text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select r.id, r.stars, r.body, r.from_name, r.created_at
  from dcc_review r join dcc_prof p on p.id = r.target
  where p.device = p_device and not r.hidden order by r.created_at desc limit 100
$$;

-- báo xấu: đánh giá 3 lần bị báo thì ẩn, hồ sơ 5 lần thì ẩn
create or replace function public.dcc_review_report(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update dcc_review set reports = reports + 1, hidden = hidden or reports + 1 >= 3 where id = p_id
$$;
create or replace function public.dcc_prof_report(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update dcc_prof set reports = reports + 1, hidden = hidden or reports + 1 >= 5 where id = p_id
$$;

revoke all on function public.dcc_prof_put(text, jsonb, boolean) from public;
revoke all on function public.dcc_prof_pick(text, int) from public;
revoke all on function public.dcc_prof_get(bigint[]) from public;
revoke all on function public.dcc_prof_me(text) from public;
revoke all on function public.dcc_regular_add(text, bigint) from public;
revoke all on function public.dcc_review_put(text, bigint, int, text, text) from public;
revoke all on function public.dcc_review_mine(text) from public;
revoke all on function public.dcc_review_report(bigint) from public;
revoke all on function public.dcc_prof_report(bigint) from public;
grant execute on function public.dcc_prof_put(text, jsonb, boolean) to anon, authenticated;
grant execute on function public.dcc_prof_pick(text, int) to anon, authenticated;
grant execute on function public.dcc_prof_get(bigint[]) to anon, authenticated;
grant execute on function public.dcc_prof_me(text) to anon, authenticated;
grant execute on function public.dcc_regular_add(text, bigint) to anon, authenticated;
grant execute on function public.dcc_review_put(text, bigint, int, text, text) to anon, authenticated;
grant execute on function public.dcc_review_mine(text) to anon, authenticated;
grant execute on function public.dcc_review_report(bigint) to anon, authenticated;
grant execute on function public.dcc_prof_report(bigint) to anon, authenticated;
