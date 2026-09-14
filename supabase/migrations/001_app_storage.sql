-- Construction Pro shared browser-storage bridge.
-- Run this in Supabase Dashboard -> SQL Editor.
--
-- The current application uses its own demo login and does not yet issue
-- Supabase Auth sessions. Therefore this MVP policy allows anon access to
-- this single shared workspace. Do not use this policy for sensitive or
-- multi-company data until Supabase Auth + per-workspace RLS is implemented.

create table if not exists public.app_storage (
  storage_key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.app_storage enable row level security;

grant select, insert, update, delete
  on table public.app_storage
  to anon, authenticated;

drop policy if exists "construction_pro_read_storage" on public.app_storage;
create policy "construction_pro_read_storage"
  on public.app_storage for select
  to anon, authenticated
  using (true);

drop policy if exists "construction_pro_insert_storage" on public.app_storage;
create policy "construction_pro_insert_storage"
  on public.app_storage for insert
  to anon, authenticated
  with check (true);

drop policy if exists "construction_pro_update_storage" on public.app_storage;
create policy "construction_pro_update_storage"
  on public.app_storage for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "construction_pro_delete_storage" on public.app_storage;
create policy "construction_pro_delete_storage"
  on public.app_storage for delete
  to anon, authenticated
  using (true);

create or replace function public.set_app_storage_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists app_storage_updated_at on public.app_storage;
create trigger app_storage_updated_at
before update on public.app_storage
for each row execute function public.set_app_storage_updated_at();
