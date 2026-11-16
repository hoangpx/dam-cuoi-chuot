-- Đám Cưới Chuột · nâng giới hạn bản lưu trên mạng từ 64 KB lên 1 MB (2026-11-16)
-- Người chơi lâu (chương IV hơn 1000 ngày, chương XI, đánh giá quán…) có bản lưu vượt 64 KB kể cả khi đã nén:
-- máy chủ từ chối, tiến trình đứng lại ở lần lưu được cuối cùng, rồi một máy khác kéo bản cũ về.
-- Chạy một lần trong Supabase (dự án mamafzllyhbmzyystivo) → SQL Editor → New query → Run. Chỉ thay hàm dcc_save.

create or replace function public.dcc_save(p_code text, p_data jsonb)
returns timestamptz language plpgsql security definer set search_path = public as $$
begin
  if p_code !~ '^[A-Z2-9]{8}$' or jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 1048576 then
    raise exception 'bad save';
  end if;
  insert into dcc_saves (code, data, updated_at) values (p_code, p_data, now())
  on conflict (code) do update set data = excluded.data, updated_at = now();
  return now();
end $$;

revoke all on function public.dcc_save(text, jsonb) from public;
grant execute on function public.dcc_save(text, jsonb) to anon, authenticated;

-- Xem bản lưu nào đang lớn nhất:
--   select code, pg_column_size(data) as bytes, updated_at from dcc_saves order by 2 desc limit 20;
