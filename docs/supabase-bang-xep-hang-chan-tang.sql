-- Đám Cưới Chuột · bảng tổng sắp: chặn tiền TỰ NHIÊN TĂNG QUÁ NHANH (chương IV, js/ch4/xephang.js)
-- Chạy SAU các file: supabase-bang-xep-hang.sql, -chan.sql, -nha.sql, -nhan-xet.sql, -chan-qua.sql; chạy lại nhiều lần cũng không sao.
-- Lỗ hổng cũ: cửa -chan.sql chỉ xét "tiền ≤ trần theo SỐ NGÀY", mà số ngày do máy khách tự khai (tới 100000 ngày = trần hàng nghìn tỷ),
-- nên ai gọi thẳng dcc_rank_put với ngày lớn là tiền bao nhiêu cũng qua; và tiền có thể nhảy vọt giữa hai lần gửi.
-- Ba luật mới trong dcc_rank_put (so với dòng đã lưu của chính máy đó và với đồng hồ của máy chủ):
--   1) NGÀY qua không nhanh hơn 1 ngày mỗi 3 giây: ngày mới ≤ ngày cũ + 3 + số giây đã trôi / 3 (người chơi bấm qua ngày liên tục, nhiều ngày dồn vào một lần gửi là bình thường). Ngày khai cao vọt bị bỏ qua (dòng giữ nguyên).
--   2) TIỀN tăng không quá mức một người chơi thật kiếm được trong số ngày vừa qua: tiền mới ≤ tiền cũ + (trần(ngày mới) − trần(ngày cũ)) + 3000;
--      gửi lại trong CÙNG ngày thì chỉ thêm tối đa 2000 + 20 đồng mỗi giây đã trôi (kẻo gửi dồn mỗi 10 giây mà mỗi lần lại được thêm lãi cả ngày). Tiền nhảy vọt giữa hai lần gửi bị bỏ qua (dòng giữ nguyên, đồng hồ không chạy lại, nên chờ đủ lâu thì lại qua).
--   3) DÒNG MỚI (máy chưa từng gửi) không được khai giàu hơn trần của ngày thứ 120 (2.34 triệu đồng ≈ 3900 quan): quá thì KHÔNG lưu gì (lưu rồi đánh dấu thì lần gửi sau
--      sẽ so với chính con số khai khống). Người chơi cũ giàu hơn thế mà mới vào bảng sẽ chưa có dòng; muốn cho họ vào, chèn tay một dòng bằng SQL Editor.
-- Ngày tối đa khai được hạ từ 100000 xuống 20000. Tiền được cho (gift) vẫn tách riêng, đã có trần trong -chan-qua.sql.
-- Xem ai bị bỏ qua: không ghi lại (dòng đứng yên); nghi ai thì xem  select name, money, day, updated_at from dcc_rank order by updated_at desc;

create or replace function public.dcc_rank_put(p_device text, p_name text, p_money bigint, p_day int, p_home text default null)
returns void language plpgsql security definer set search_path = public as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')); last timestamptz; old_home text; old_money bigint; old_day int; secs numeric; inc bigint; bad boolean := false;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(n) < 2 or char_length(n) > 22 then raise exception 'bad name'; end if;
  if public.dcc_rank_bad(n) then raise exception 'bad words'; end if;
  if p_money is null or p_money < -10000000 or p_money > 100000000000 then raise exception 'bad money'; end if;
  if p_day is null or p_day < 1 or p_day > 20000 then raise exception 'bad day'; end if;
  if p_home is not null and not public.dcc_rank_home_ok(p_home) then raise exception 'bad home'; end if;
  select updated_at, home, money, day into last, old_home, old_money, old_day from public.dcc_rank where device = p_device;
  if last is not null and last > now() - interval '10 seconds' then return; end if;   -- quá dày: bỏ qua lặng lẽ
  if last is not null then
    secs := extract(epoch from now() - last);
    if p_day > old_day + 3 + floor(secs / 3) then bad := true; end if;   -- luật 1: ngày qua quá nhanh (nhanh nhất 1 ngày mỗi 3 giây)
    -- qua ngày: được thêm đúng phần trần tăng giữa hai ngày (luật 1 đã giới hạn tốc độ qua ngày, nên khai ngày vọt cũng không mở thêm hạn mức); cùng ngày: chỉ lãi theo thời gian trôi, 2000 + 20 đồng mỗi giây
    if p_day > old_day then inc := public.dcc_rank_cap(p_day) - public.dcc_rank_cap(old_day);
    else inc := least(public.dcc_rank_cap(p_day) - public.dcc_rank_cap(greatest(p_day - 1, 1)), 2000 + floor(secs * 20)); end if;
    if p_money > old_money + inc + 3000 then bad := true; end if;   -- luật 2: tiền tăng quá nhanh
    if bad then return; end if;   -- giữ nguyên dòng cũ (và updated_at cũ, để chờ đủ lâu thì lại qua)
  elsif p_money > public.dcc_rank_cap(least(p_day, 120)) then return;   -- luật 3: dòng mới không khai giàu hơn trần ngày 120 (không lưu gì; nếu lưu rồi đánh dấu thì lần gửi sau sẽ tự hết dấu)
  end if;
  insert into public.dcc_rank (device, name, money, day, updated_at, flag, home, pub)
  values (p_device, n, p_money, p_day, now(), p_money > public.dcc_rank_cap(p_day), coalesce(p_home, ''),
          substr(md5(random()::text || p_device || clock_timestamp()::text), 1, 12))
  on conflict (device) do update set name = excluded.name, money = excluded.money, day = excluded.day,
    updated_at = now(), flag = p_money > public.dcc_rank_cap(p_day), home = coalesce(p_home, old_home);
end $$;
revoke all on function public.dcc_rank_put(text, text, bigint, int, text) from public;
grant execute on function public.dcc_rank_put(text, text, bigint, int, text) to anon, authenticated;
