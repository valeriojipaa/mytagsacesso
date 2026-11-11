-- Execute uma vez no SQL Editor do seu projeto Supabase.
create table if not exists public.access_grants (
  user_id uuid primary key references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.access_grants enable row level security;
revoke all on public.access_grants from anon, authenticated;
grant select on public.access_grants to authenticated;
drop policy if exists "Cliente consulta apenas seu acesso" on public.access_grants;
create policy "Cliente consulta apenas seu acesso" on public.access_grants
for select to authenticated using ((select auth.uid()) = user_id);
-- Clientes não têm permissão para criar, alterar ou liberar acessos.
