-- Đám Cưới Chuột · bảng tổng sắp: THU HỒI quà bị gian lận và chặn cho tiền quá tay (chương IV, js/ch4/xephang.js)
-- Chạy SAU năm file: supabase-bang-xep-hang.sql, -chan.sql, -nha.sql, -nhan-xet.sql; chạy lại nhiều lần cũng không sao.
-- Chuyện xảy ra (2026-10-23): "Chuột Bưởi Đào 93" gửi 82 lần cho tiền (65 lần đúng 999.999.600 đồng, phần còn lại đủ mọi số tới 1 tỷ) cho 75 nhà,
-- chiếm các hạng 1–78; trước đó "Bà chủ Mè Xửng 69" cho 987.789.987 và 123.654.789 đồng. Hàm dcc_rank_review_put cũ chỉ kiểm p_amount ≤ 1 tỷ,
-- không hề xét người cho có đủ tiền hay không, nên gọi thẳng hàm (khoá công khai của trang nằm trong mã nguồn) là cho được bao nhiêu cũng được.
--
-- File làm ba việc:
--   A) xem trước ai bị thu hồi (câu select đầu tiên), rồi giấu mọi lời nhận xét của các máy đó, giấu dòng của chính họ trên bảng,
--      và tính lại cột gift của mọi nhà từ những lời nhận xét còn lại (nên quà gian biến mất khỏi thứ hạng; tiền riêng của mọi người giữ nguyên);
--   B) hàm dcc_rank_review_put mới: mỗi lần cho DƯỚI 10 quan (tối đa 5999 đồng), người cho phải có dòng thật trên bảng (không bị chặn/ẩn,
--      đã chơi từ ngày 3, đủ tiền), một máy cho tối đa 5 lần và 12000 đồng trong 24 giờ, mỗi nhà chỉ một lần từ một máy mỗi 24 giờ,
--      một nhà nhận tối đa 30000 đồng một ngày và 300000 đồng cả đời, một địa chỉ mạng tối đa 8 lần cho một ngày
--      (địa chỉ được ghi vào cột from_ip để lần sau còn truy ra: select from_ip, count(*), sum(amount) from dcc_rank_review group by 1);
--   C) cột gift của một nhà không bao giờ vượt 300000 đồng (khoá cứng ngay trong bảng).
-- Muốn xem ai bị thu hồi:  select name, money / 600 as quan, day, hidden from dcc_rank where hidden;
-- Muốn mở lại một người: update dcc_rank set hidden = false where device = '<mã máy>';  (và update dcc_rank_review set hidden = false where from_device = '<mã máy>')

alter table public.dcc_rank_review add column if not exists from_ip text not null default '';
alter table public.dcc_rank_review add column if not exists claimed boolean not null default false;   -- quà đã được người nhận lấy vào ví (docs/supabase-bang-xep-hang-nhan-qua.sql)

-- A1) xem trước: những máy bị thu hồi (cho từ 100 triệu đồng trở lên, hoặc hai tên đã biết mà cho từ 100000 đồng)
-- select v.from_device, v.from_name, count(*) as lan, sum(v.amount) as dong, min(v.created_at) as tu, max(v.created_at) as den
--   from public.dcc_rank_review v
--   where v.amount >= 100000000 or (v.from_name in ('Chuột Bưởi Đào 93', 'Bà chủ Mè Xửng 69') and v.amount >= 100000)
--   group by 1, 2 order by dong desc;

-- A2) giấu lời nhận xét và dòng bảng của các máy đó, rồi tính lại gift
create temp table dcc_bad_dev on commit drop as
  select distinct from_device as device from public.dcc_rank_review
  where amount >= 100000000 or (from_name in ('Chuột Bưởi Đào 93', 'Bà chủ Mè Xửng 69') and amount >= 100000);
update public.dcc_rank_review set hidden = true where from_device in (select device from dcc_bad_dev) and not hidden;
update public.dcc_rank set hidden = true where device in (select device from dcc_bad_dev) and not hidden;
alter table public.dcc_rank drop constraint if exists dcc_rank_gift_cap;   -- (lần chạy trước đã thêm nó; bỏ ra trước khi tính lại, thêm lại ở dưới)
update public.dcc_rank r set gift = least(coalesce((select sum(v.amount) from public.dcc_rank_review v where v.target = r.pub and not v.hidden and not v.claimed and v.amount > 0), 0), 300000);

-- C) gift của một nhà không quá 300000 đồng
update public.dcc_rank set gift = 300000 where gift > 300000;
alter table public.dcc_rank add constraint dcc_rank_gift_cap check (gift >= 0 and gift <= 300000);

-- B) cho tiền có luật
create or replace function public.dcc_rank_review_put(p_target text, p_device text, p_name text, p_amount bigint, p_note text)
returns table (kind text, amount bigint)
language plpgsql security definer set search_path = public as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
        s text := btrim(regexp_replace(coalesce(p_note, ''), '\s+', ' ', 'g'));
        t_device text; t_money bigint; t_gift bigint; g_money bigint; g_day int; g_flag boolean; g_hidden boolean; k text; last timestamptz; many bigint;
        hd json; ip text := ''; c_cnt bigint; c_sum bigint; c_same bigint; t_day bigint; t_all bigint; c_ip bigint;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(n) < 2 or char_length(n) > 22 then raise exception 'bad name'; end if;
  if public.dcc_rank_bad(n) then raise exception 'bad words'; end if;
  if char_length(s) > 140 then raise exception 'bad note'; end if;
  if public.dcc_rank_bad(s) then raise exception 'bad words'; end if;
  if p_amount is null or p_amount < 0 then raise exception 'bad amount'; end if;
  if p_amount > 5999 then raise exception 'too much'; end if;                      -- dưới 10 quan một lần
  if s = '' and p_amount = 0 then raise exception 'empty review'; end if;
  select r.device, r.money, r.gift into t_device, t_money, t_gift
    from public.dcc_rank r where r.pub = p_target and not r.hidden and not r.flag;
  if t_device is null then raise exception 'no such house'; end if;
  if t_device = p_device then raise exception 'no self'; end if;
  begin
    hd := current_setting('request.headers', true)::json;
    ip := coalesce(split_part(coalesce(hd ->> 'cf-connecting-ip', hd ->> 'x-forwarded-for', ''), ',', 1), '');
  exception when others then ip := '';
  end;
  select max(created_at) into last from public.dcc_rank_review where from_device = p_device;
  if last is not null and last > now() - interval '20 seconds' then raise exception 'slow down'; end if;
  select count(*) into many from public.dcc_rank_review where from_device = p_device;
  if many >= 500 then raise exception 'slow down'; end if;
  if p_amount > 0 then
    select r.money, r.day, r.flag, r.hidden into g_money, g_day, g_flag, g_hidden from public.dcc_rank r where r.device = p_device;
    if g_money is null or g_hidden or g_flag or g_day < 3 then raise exception 'no purse'; end if;   -- người cho phải có dòng thật, đã chơi từ ngày 3
    if g_money < p_amount then raise exception 'no purse'; end if;
    select count(*), coalesce(sum(v.amount), 0), count(*) filter (where v.target = p_target) into c_cnt, c_sum, c_same
      from public.dcc_rank_review v where v.from_device = p_device and v.amount > 0 and v.created_at > now() - interval '24 hours';
    if c_cnt >= 5 or c_sum + p_amount > 12000 or c_same >= 1 then raise exception 'giver limit'; end if;
    select coalesce(sum(v.amount), 0) into t_day from public.dcc_rank_review v where v.target = p_target and not v.hidden and v.amount > 0 and v.created_at > now() - interval '24 hours';
    select coalesce(sum(v.amount), 0) into t_all from public.dcc_rank_review v where v.target = p_target and not v.hidden and v.amount > 0;   -- cả đời, kể cả quà đã được lấy
    if t_day + p_amount > 30000 or t_all + p_amount > 300000 then raise exception 'house full'; end if;
    if ip <> '' then
      select count(*) into c_ip from public.dcc_rank_review v where v.from_ip = ip and v.amount > 0 and v.created_at > now() - interval '24 hours';
      if c_ip >= 8 then raise exception 'giver limit'; end if;
    end if;
  end if;
  k := case when coalesce(g_money, (select r.money from public.dcc_rank r where r.device = p_device), 0) > t_money + t_gift then 'bothi' else 'bieu' end;   -- nhiều tiền hơn chủ nhà: bố thí; ít hơn: biếu
  insert into public.dcc_rank_review (target, from_device, from_name, kind, amount, note, from_ip)
  values (p_target, p_device, n, k, p_amount, s, ip);
  if p_amount > 0 then update public.dcc_rank set gift = gift + p_amount where pub = p_target; end if;
  return query select k, p_amount;
end $$;
revoke all on function public.dcc_rank_review_put(text, text, text, bigint, text) from public;
grant execute on function public.dcc_rank_review_put(text, text, text, bigint, text) to anon, authenticated;
