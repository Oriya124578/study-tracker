-- 0001_user_data_rls.sql
-- Enable Row Level Security on public.user_data so each authenticated user
-- can only access their own row (id = auth.uid()).
-- Safe to re-run (idempotent): policies are dropped first.

alter table public.user_data enable row level security;

-- SELECT own row
drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own" on public.user_data
  for select
  using ( auth.uid() = id );

-- INSERT own row only
drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own" on public.user_data
  for insert
  with check ( auth.uid() = id );

-- UPDATE own row only
drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own" on public.user_data
  for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- DELETE own row only
drop policy if exists "user_data_delete_own" on public.user_data;
create policy "user_data_delete_own" on public.user_data
  for delete
  using ( auth.uid() = id );
