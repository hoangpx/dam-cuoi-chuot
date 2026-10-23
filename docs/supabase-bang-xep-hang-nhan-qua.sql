-- Đám Cưới Chuột · bảng tổng sắp: NHẬN QUÀ THẬT vào ví (chương IV, js/ch4/xephang.js c4RankClaim)
-- Chạy SAU các file: supabase-bang-xep-hang.sql, -chan.sql, -nha.sql, -nhan-xet.sql, -chan-qua.sql, -chan-tang.sql, -khoa.sql; chạy lại nhiều lần cũng không sao.
-- (Chạy lại -chan-qua.sql và -khoa.sql một lần nữa TRƯỚC file này nếu chúng được sửa sau lần chạy trước: chúng giờ có cột claimed và tính gift chỉ trên quà chưa lấy.)
-- Trước đây quà (bố thí / biếu) chỉ cộng vào cột gift của chủ nhà để hạng lên; ví của chủ nhà trong game không đổi. Giờ chủ nhà LẤY quà vào ví:
-- mỗi lần máy chủ nhà gửi dòng lên bảng (qua ngày, mở bảng) nó hỏi dcc_rank_claim; máy chủ đánh dấu các lời nhận xét có quà là đã lấy (claimed) và
-- trả tổng một lần duy nhất (một quà không bao giờ trả hai lần), đồng thời chuyển số đó từ cột gift sang cột money của dòng bảng (hạng không đổi,
-- không tính hai lần, và lần gửi tiền kế tiếp của máy khách không bị luật chặn tiền tăng nhanh bắt vì mốc cũ đã gồm quà).
-- Chỉ quà dưới 10 quan (≤ 5999 đồng) được trả; quà cũ lớn hơn (trước khi có giới hạn) bị đánh dấu đã lấy mà không trả, và không tính vào hạng nữa.
-- Dòng bị ẩn / bị đánh dấu gian lận / bị khoá không lấy được quà (hàm trả 0), quà của máy bị khoá (lời nhận xét bị giấu) không bao giờ trả.

alter table public.dcc_rank_review add column if not exists claimed boolean not null default false;
alter table public.dcc_rank add column if not exists got bigint not null default 0;   -- phần ví là quà đã nhận: hạng tính money − got (docs/supabase-bang-xep-hang-khong-tinh-qua.sql)

-- quà cũ lớn hơn giới hạn: không trả, không tính nữa
update public.dcc_rank_review set claimed = true where amount > 5999 and not claimed;
update public.dcc_rank r set gift = least(coalesce((select sum(v.amount) from public.dcc_rank_review v where v.target = r.pub and not v.hidden and not v.claimed and v.amount > 0), 0), 300000);

create or replace function public.dcc_rank_claim(p_device text)
returns table (total bigint, n int)
language plpgsql security definer set search_path = public as $$
declare pubv text; t bigint; k int;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if public.dcc_ip_banned(public.dcc_req_ip()) then return query select 0::bigint, 0; return; end if;   -- địa chỉ đang bị chặn
  select r.pub into pubv from public.dcc_rank r where r.device = p_device and not r.hidden and not r.flag;
  if pubv is null then return query select 0::bigint, 0; return; end if;
  with u as (
    update public.dcc_rank_review v set claimed = true
    where v.target = pubv and not v.claimed and not v.hidden and v.amount > 0 and v.amount <= 5999
    returning v.amount
  ) select coalesce(sum(u.amount), 0), count(*)::int into t, k from u;
  if t > 0 then
    update public.dcc_rank set gift = greatest(gift - t, 0), money = money + t, got = got + t where device = p_device;
  end if;
  return query select t, k;
end $$;
revoke all on function public.dcc_rank_claim(text) from public;
grant execute on function public.dcc_rank_claim(text) to anon, authenticated;
