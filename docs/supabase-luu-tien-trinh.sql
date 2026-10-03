-- Đám Cưới Chuột · lưu tiến trình trên mạng bằng mã lưu (js/core/cloud.js)
-- Chạy một lần trong Supabase (dự án mamafzllyhbmzyystivo) → SQL Editor → New query → Run.
-- Bảng không mở cho ai đọc/ghi trực tiếp; chỉ qua hai hàm dưới, và phải biết đúng mã (8 ký tự, ~850 tỉ khả năng).

create table if not exists public.dcc_saves (
  code text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.dcc_saves enable row level security;   -- không có policy nào: anon không chạm được bảng

create or replace function public.dcc_save(p_code text, p_data jsonb)
returns timestamptz language plpgsql security definer set search_path = public as $$
begin
  if p_code !~ '^[A-Z2-9]{8}$' or jsonb_typeof(p_data) <> 'object' or pg_column_size(p_data) > 65536 then
    raise exception 'bad save';
  end if;
  insert into dcc_saves (code, data, updated_at) values (p_code, p_data, now())
  on conflict (code) do update set data = excluded.data, updated_at = now();
  return now();
end $$;

create or replace function public.dcc_load(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('data', data, 't', updated_at) from dcc_saves where code = p_code
$$;

revoke all on function public.dcc_save(text, jsonb) from public;
revoke all on function public.dcc_load(text) from public;
grant execute on function public.dcc_save(text, jsonb) to anon, authenticated;
grant execute on function public.dcc_load(text) to anon, authenticated;
