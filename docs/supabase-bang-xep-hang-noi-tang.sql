-- Đám Cưới Chuột · bảng tổng sắp: NỚI mức chặn tiền tăng nhanh (owner, 2026-11-08: "nới lỏng cái mức cộng tiền chống hack xem").
-- Chạy SAU supabase-bang-xep-hang-chan-tang.sql (thay hàm dcc_rank_put của file đó); chạy lại nhiều lần cũng không sao.
-- Vì sao: người chơi lâu (ngày 1455, 73 triệu đồng) kiếm mỗi ngày hơn mức được tăng (trần(ngày) − trần(ngày trước) ≈ 438 000 đồng),
-- lần gửi bị bỏ qua cả, dòng đứng yên mãi (chợ quê và phố huyện giờ bán song song, phố huyện có 19 quán).
-- Hai thay đổi so với -chan-tang.sql:
--   1) Mức được tăng thêm 10% số tiền đang có trên bảng cho mỗi ngày đã qua (người giàu kiếm nhiều thì được tăng nhiều):
--        qua ngày:  tăng ≤ trần(ngày mới) − trần(ngày cũ) + 10% × tiền cũ × số ngày đã qua + 3000
--        cùng ngày: tăng ≤ ít hơn trong hai số (mức một ngày ; 2000 + 20 đồng/giây + 10% tiền cũ cho mỗi 10 phút đã trôi) + 3000
--   2) Tăng quá mức thì KHÔNG bỏ qua nữa: lưu tiền cũ + mức được tăng (dòng vẫn nhích lên và đuổi kịp dần sau vài ngày).
-- Giữ nguyên: ngày qua không nhanh hơn 1 ngày mỗi 3 giây (bỏ qua), khai quá 20 lần trần thì tự khoá máy, dòng mới không giàu hơn trần ngày 120,
-- gửi dày hơn 10 giây thì bỏ qua, cờ flag = tiền > trần(ngày).

create or replace function public.dcc_rank_put(p_device text, p_name text, p_money bigint, p_day int, p_home text default null)
returns void language plpgsql security definer set search_path = public as $$
declare n text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g')); last timestamptz; old_home text; old_money bigint; old_day int;
        secs numeric; inc bigint; grow numeric; m bigint := p_money;
begin
  if p_device !~ '^[a-z0-9]{12,40}$' then raise exception 'bad device'; end if;
  if char_length(n) < 2 or char_length(n) > 22 then raise exception 'bad name'; end if;
  if public.dcc_rank_bad(n) then raise exception 'bad words'; end if;
  if p_money is null or p_money < -10000000 or p_money > 100000000000 then raise exception 'bad money'; end if;
  if p_day is null or p_day < 1 or p_day > 20000 then raise exception 'bad day'; end if;
  if p_home is not null and not public.dcc_rank_home_ok(p_home) then raise exception 'bad home'; end if;
  select updated_at, home, money, day into last, old_home, old_money, old_day from public.dcc_rank where device = p_device;
  if last is not null and last > now() - interval '10 seconds' then return; end if;   -- quá dày: bỏ qua lặng lẽ
  if p_money > 20 * public.dcc_rank_cap(p_day) then   -- vô lý (hơn 20 lần trần): khoá luôn
    perform public.dcc_auto_ban(p_device, 'khai ' || (p_money / 600) || ' quan o ngay ' || p_day); return;
  end if;
  if last is not null then
    secs := extract(epoch from now() - last);
    if p_day > old_day + 3 + floor(secs / 3) then return; end if;   -- ngày qua quá nhanh: bỏ qua
    grow := 0.10 * greatest(old_money, 0);                           -- 10% tiền đang có, cho một ngày
    if p_day > old_day then
      inc := public.dcc_rank_cap(p_day) - public.dcc_rank_cap(old_day) + floor(grow * (p_day - old_day));
    else
      inc := least(public.dcc_rank_cap(p_day) - public.dcc_rank_cap(greatest(p_day - 1, 1)) + floor(grow),
                   2000 + floor(secs * 20) + floor(grow * secs / 600));
    end if;
    m := least(p_money, old_money + inc + 3000);                     -- tăng quá mức: chỉ nhận phần được phép
  elsif p_money > public.dcc_rank_cap(least(p_day, 120)) then
    return;   -- dòng mới không khai giàu hơn trần ngày 120
  end if;
  insert into public.dcc_rank (device, name, money, day, updated_at, flag, home, pub)
  values (p_device, n, m, p_day, now(), m > public.dcc_rank_cap(p_day), coalesce(p_home, ''),
          substr(md5(random()::text || p_device || clock_timestamp()::text), 1, 12))
  on conflict (device) do update set name = excluded.name, money = excluded.money, day = excluded.day,
    updated_at = now(), flag = excluded.flag, home = coalesce(p_home, old_home);
end $$;
revoke all on function public.dcc_rank_put(text, text, bigint, int, text) from public;
grant execute on function public.dcc_rank_put(text, text, bigint, int, text) to anon, authenticated;
