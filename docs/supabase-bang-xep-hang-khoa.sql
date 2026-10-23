-- Đám Cưới Chuột · bảng tổng sắp: DANH SÁCH KHOÁ máy gian lận (chương IV, js/ch4/xephang.js)
-- Chạy SAU các file: supabase-bang-xep-hang.sql, -chan.sql, -nha.sql, -nhan-xet.sql, -chan-qua.sql, -chan-tang.sql; chạy lại nhiều lần cũng không sao.
-- Một máy trong bảng dcc_ban thì: dòng của nó trên dcc_rank luôn ẩn và đánh dấu (dù gửi lại bao nhiêu lần), và mọi lời nhận xét nó viết đều bị giấu
-- (nên không cho tiền được, không nhận xét được). Bảng không mở cho ai đọc/ghi trực tiếp (anon không chạm được), chỉ chủ dự án qua SQL Editor.
-- Khoá thêm một máy:   insert into dcc_ban (device, note) values ('<mã máy>', 'lý do') on conflict do nothing;  (dòng và lời nhận xét hiện có cũng bị ẩn ngay)
-- Mở khoá:             delete from dcc_ban where device = '<mã máy>';   (rồi: update dcc_rank set hidden = false where device = '<mã máy>';)
-- Xem danh sách:       select * from dcc_ban;
-- Xem những dòng bị đánh dấu gian lận mà chưa khoá:
--   select device, name, money / 600 as quan, day, public.dcc_rank_cap(day) / 600 as tran_quan, hidden from dcc_rank
--   where flag and device not in (select device from dcc_ban) order by money desc;

create table if not exists public.dcc_ban (
  device text primary key,
  note text not null default '',
  created_at timestamptz not null default now()
);
alter table public.dcc_ban enable row level security;   -- không policy nào: anon không chạm được bảng

-- chặn ở tầng bảng: bất kể hàm nào ghi vào, máy bị khoá vẫn bị ẩn
create or replace function public.dcc_rank_ban_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.dcc_ban b where b.device = new.device) then new.hidden := true; new.flag := true; end if;
  return new;
end $$;
drop trigger if exists dcc_rank_ban_guard on public.dcc_rank;
create trigger dcc_rank_ban_guard before insert or update on public.dcc_rank for each row execute function public.dcc_rank_ban_guard();

create or replace function public.dcc_review_ban_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.dcc_ban b where b.device = new.from_device) then new.hidden := true; end if;
  return new;
end $$;
drop trigger if exists dcc_review_ban_guard on public.dcc_rank_review;
create trigger dcc_review_ban_guard before insert on public.dcc_rank_review for each row execute function public.dcc_review_ban_guard();

-- hai máy đã biết (2026-10-23): "Bà chủ Mè Xửng 69" (cũng là "Cụ Lý Sì Tin" ở phòng ghép tranh) và "Chuột Bưởi Đào 93"
insert into public.dcc_ban (device, note) values
  ('llmtkvnjmpa1wfx0o0on', 'Ba chu Me Xung 69 / Cu Ly Si Tin: cho tien gian 987 trieu, ghep tranh nhanh bat thuong'),
  ('t2fns94ywx89utpcdf4a', 'Chuot Buoi Dao 93: 82 lan cho tien gian, ngay 5 khai 78 trieu quan')
on conflict (device) do nothing;

-- máy khai tiền vô lý (quá 20 lần trần của số ngày chơi, tức là sửa tay chứ không phải kiếm được) cũng bị khoá
insert into public.dcc_ban (device, note)
  select device, 'tien khai qua 20 lan tran (' || (money / 600) || ' quan, ngay ' || day || ')' from public.dcc_rank
  where flag and money > 20 * public.dcc_rank_cap(day)
on conflict (device) do nothing;

-- áp ngay cho những gì đã có
update public.dcc_rank set hidden = true, flag = true where device in (select device from public.dcc_ban) and not (hidden and flag);
update public.dcc_rank_review set hidden = true where from_device in (select device from public.dcc_ban) and not hidden;
update public.dcc_rank r set gift = least(coalesce((select sum(v.amount) from public.dcc_rank_review v where v.target = r.pub and not v.hidden and not v.claimed and v.amount > 0), 0), 300000);
