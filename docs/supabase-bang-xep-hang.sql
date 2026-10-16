-- Đám Cưới Chuột · bảng tổng sắp nhà giàu (chương IV, js/ch4/xephang.js)
-- Mỗi người chơi (theo mã máy dcc.dev, đi theo "Lưu tiến trình" sang máy khác) có một dòng: tên, tiền trong túi (đồng), số ngày.
-- Chạy một lần trong Supabase (dự án mamafzllyhbmzyystivo) → SQL Editor → New query → Run.
-- Bảng không mở cho ai đọc/ghi trực tiếp; chỉ qua ba hàm dưới. Danh sách trả về không bao giờ có mã máy.
-- Chặn: tên 2–22 chữ, chữ bậy (dùng lại dcc_hoa_bad nếu đã chạy file hoa đăng, không thì định nghĩa ở đây), mỗi máy 10 giây một lần gửi,
-- tiền và ngày trong giới hạn hợp lý. Muốn ẩn ai: Table Editor → dcc_rank → hidden = true.

create table if not exists public.dcc_rank (
  device text primary key,
  name text not null,
  money bigint not null default 0,
  day int not null default 1,
  updated_at timestamptz not null default now(),
  hidden boolean not null default false
);
create index if not exists dcc_rank_money on public.dcc_rank (money desc);
alter table public.dcc_rank enable row level security;   -- không có policy nào: anon không chạm được bảng

-- chữ bậy (giống dcc_hoa_bad của file hoa đăng; định nghĩa lại cũng không sao)
create or replace function public.dcc_rank_bad(p text)
returns boolean language sql immutable as $$
  select lower(coalesce(p, '')) ~ '(địt|đụ|lồn|buồi|cặc|đéo|đĩ |đỉ |fuck|shit|bitch|óc chó|chó đẻ|mẹ mày|con mẹ mày|bố mày)'
      or lower(coalesce(p, '')) ~ '\m(đm|dm|đcm|dcm|đmm|dmm|vcl|vkl|vl|clm|cmm|cc|cl)\M'
$$;

-- gửi (hoặc cập nhật) dòng của mình
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
  if last is not null and last > now() - interval '10 seconds' then return; end if;   -- quá dày: bỏ qua lặng lẽ
  insert into public.dcc_rank (device, name, money, day, updated_at) values (p_device, n, p_money, p_day, now())
  on conflict (device) do update set name = excluded.name, money = excluded.money, day = excluded.day, updated_at = now();
end $$;

-- những người giàu nhất
create or replace function public.dcc_rank_top(p_limit int default 100)
returns table (pos bigint, name text, money bigint, day int)
language sql stable security definer set search_path = public as $$
  select row_number() over (order by money desc, updated_at asc), name, money, day
  from public.dcc_rank where not hidden
  order by money desc, updated_at asc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
$$;

-- thứ hạng của mình và tổng số người
create or replace function public.dcc_rank_me(p_device text)
returns table (pos bigint, total bigint, name text, money bigint, day int)
language sql stable security definer set search_path = public as $$
  select (select count(*) + 1 from public.dcc_rank o where not o.hidden and (o.money > r.money or (o.money = r.money and o.updated_at < r.updated_at))),
         (select count(*) from public.dcc_rank where not hidden), r.name, r.money, r.day
  from public.dcc_rank r where r.device = p_device
$$;

revoke all on function public.dcc_rank_put(text, text, bigint, int) from public;
revoke all on function public.dcc_rank_top(int) from public;
revoke all on function public.dcc_rank_me(text) from public;
grant execute on function public.dcc_rank_put(text, text, bigint, int) to anon, authenticated;
grant execute on function public.dcc_rank_top(int) to anon, authenticated;
grant execute on function public.dcc_rank_me(text) to anon, authenticated;
