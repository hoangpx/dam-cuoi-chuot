-- Đám Cưới Chuột · chủ nhà xóa được lời nhận xét của khách trong nhà mình (chương IV, js/ch4/xephang.js)
-- Chạy SAU supabase-bang-xep-hang-xem-nguoi-viet.sql; chạy lại nhiều lần cũng không sao.
-- Danh sách nhận xét trả thêm id. dcc_rank_review_del chỉ ẩn (hidden) lời nhận xét, và chỉ khi mã máy gửi lên
-- là chủ nhà đó (dcc_rank.device của dòng có pub = target). Tiền khách đã cho vẫn ở lại với chủ nhà.

drop function if exists public.dcc_rank_review_list(text, int);
create or replace function public.dcc_rank_review_list(p_target text, p_limit int default 40)
returns table (from_name text, kind text, amount bigint, note text, created_at timestamptz, from_pub text, id bigint)
language sql stable security definer set search_path = public as $$
  select v.from_name, v.kind, v.amount, v.note, v.created_at,
         (select r.pub from public.dcc_rank r where r.device = v.from_device and not r.hidden and not r.flag),
         v.id
  from public.dcc_rank_review v
  where v.target = p_target and not v.hidden
  order by v.id desc
  limit least(greatest(coalesce(p_limit, 40), 1), 100)
$$;

create or replace function public.dcc_rank_review_del(p_id bigint, p_device text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.dcc_rank_review v set hidden = true
  where v.id = p_id
    and exists (select 1 from public.dcc_rank r
                where r.pub = v.target and r.device = p_device and p_device is not null and p_device <> '');
  if not found then raise exception 'not your house'; end if;
end
$$;

revoke all on function public.dcc_rank_review_list(text, int) from public;
revoke all on function public.dcc_rank_review_del(bigint, text) from public;
grant execute on function public.dcc_rank_review_list(text, int) to anon, authenticated;
grant execute on function public.dcc_rank_review_del(bigint, text) to anon, authenticated;
