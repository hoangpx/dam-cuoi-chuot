-- Đám Cưới Chuột · đèn hoa đăng chung (chương IV phần 2 · Phố Huyện, js/ch4b/hoadang-net.js)
-- Mỗi lời chúc người chơi thả xuống sông được lưu ở đây; ai vào phố huyện cũng thấy và đọc được.
-- Chạy một lần trong Supabase (dự án mamafzllyhbmzyystivo) → SQL Editor → New query → Run.
-- Bảng không mở cho ai đọc/ghi trực tiếp; chỉ qua ba hàm dưới.
-- Chặn: tối đa 90 chữ, chữ bậy (danh sách trong dcc_hoa_bad), mỗi máy 20 giây một lời, cả hệ thống 60 lời mỗi phút;
-- lời bị 3 người báo xấu thì tự ẩn. Muốn xoá tay: Table Editor → dcc_hoadang → đặt hidden = true (hoặc xoá dòng).

create table if not exists public.dcc_hoadang (
  id bigint generated always as identity primary key,
  wish text not null,
  shop text not null default '',
  device text not null,
  created_at timestamptz not null default now(),
  reports int not null default 0,
  hidden boolean not null default false
);
create index if not exists dcc_hoadang_created on public.dcc_hoadang (created_at desc);
create index if not exists dcc_hoadang_device on public.dcc_hoadang (device, created_at desc);
alter table public.dcc_hoadang enable row level security;   -- không có policy nào: anon không chạm được bảng

-- chữ bậy: true nếu có
create or replace function public.dcc_hoa_bad(p text)
returns boolean language sql immutable as $$
  select lower(coalesce(p, '')) ~ '(địt|đụ|lồn|buồi|cặc|đéo|đĩ |đỉ |fuck|shit|bitch|óc chó|chó đẻ|mẹ mày|con mẹ mày|bố mày)'
      or lower(coalesce(p, '')) ~ '\m(đm|dm|đcm|dcm|đmm|dmm|vcl|vkl|vl|clm|cmm|cc|cl)\M'
$$;

create or replace function public.dcc_hoa_add(p_wish text, p_shop text, p_device text)
returns bigint language plpgsql security definer set search_path = public as $$
declare w text := btrim(regexp_replace(coalesce(p_wish, ''), '\s+', ' ', 'g'));
        s text := left(btrim(regexp_replace(coalesce(p_shop, ''), '\s+', ' ', 'g')), 16);
        new_id bigint;
begin
  if char_length(w) < 1 or char_length(w) > 90 then raise exception 'bad length'; end if;
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if dcc_hoa_bad(w) or dcc_hoa_bad(s) then raise exception 'bad words'; end if;
  if exists (select 1 from dcc_hoadang where device = p_device and created_at > now() - interval '20 seconds') then raise exception 'too soon'; end if;
  if (select count(*) from dcc_hoadang where created_at > now() - interval '1 minute') >= 60 then raise exception 'busy'; end if;
  insert into dcc_hoadang (wish, shop, device) values (w, s, p_device) returning id into new_id;
  return new_id;
end $$;

-- những lời chúc mới nhất (không trả máy của người gửi)
create or replace function public.dcc_hoa_list(p_limit int)
returns table (id bigint, wish text, shop text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select id, wish, shop, created_at from dcc_hoadang where not hidden order by created_at desc limit least(greatest(coalesce(p_limit, 60), 1), 100)
$$;

-- báo xấu: mỗi lần +1, đủ 3 thì ẩn
create or replace function public.dcc_hoa_report(p_id bigint)
returns void language sql security definer set search_path = public as $$
  update dcc_hoadang set reports = reports + 1, hidden = hidden or reports + 1 >= 3 where id = p_id
$$;

revoke all on function public.dcc_hoa_add(text, text, text) from public;
revoke all on function public.dcc_hoa_list(int) from public;
revoke all on function public.dcc_hoa_report(bigint) from public;
grant execute on function public.dcc_hoa_add(text, text, text) to anon, authenticated;
grant execute on function public.dcc_hoa_list(int) to anon, authenticated;
grant execute on function public.dcc_hoa_report(bigint) to anon, authenticated;
