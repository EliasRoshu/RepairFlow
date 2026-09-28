-- Ejecuta TODO este archivo en Supabase > SQL Editor > New query
create table if not exists public.repairflow_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.repairflow_data enable row level security;
revoke all on table public.repairflow_data from anon;
grant select, insert, update, delete on table public.repairflow_data to authenticated;
create policy "read own data" on public.repairflow_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own data" on public.repairflow_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own data" on public.repairflow_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "delete own data" on public.repairflow_data for delete to authenticated using ((select auth.uid()) = user_id);
