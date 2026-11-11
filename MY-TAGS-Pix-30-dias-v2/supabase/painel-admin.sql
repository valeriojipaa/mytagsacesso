-- Execute uma vez no SQL Editor. Não concede acesso administrativo pelo site.
begin;
create table if not exists public.mytags_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.mytags_admins enable row level security;
revoke all on public.mytags_admins from anon, authenticated;
create table if not exists public.mytags_admin_operations (
 request_id uuid primary key,
 admin_id uuid not null,
 user_id uuid not null,
 action text not null,
 created_at timestamptz not null default now()
);
alter table public.mytags_admin_operations enable row level security;
revoke all on public.mytags_admin_operations from anon, authenticated;

create or replace function public.mytags_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.mytags_admins where user_id=auth.uid());
$$;
revoke all on function public.mytags_is_admin() from public, anon;
grant execute on function public.mytags_is_admin() to authenticated;

create or replace function public.mytags_admin_clients(query text default '')
returns table(user_id uuid,email text,confirmed boolean,expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
 if not public.mytags_is_admin() then raise exception 'Acesso restrito ao administrador' using errcode='42501'; end if;
 return query select u.id,u.email::text,u.email_confirmed_at is not null,g.expires_at
 from auth.users u left join public.access_grants g on g.user_id=u.id
 where u.email is not null and (coalesce(query,'')='' or position(lower(left(query,200)) in lower(u.email))>0)
 order by u.created_at desc limit 50;
end; $$;
revoke all on function public.mytags_admin_clients(text) from public,anon;
grant execute on function public.mytags_admin_clients(text) to authenticated;

create or replace function public.mytags_admin_access(target_user uuid,operation text,request_id uuid)
returns timestamptz language plpgsql security definer set search_path = '' as $$
declare expiry timestamptz; previous public.mytags_admin_operations%rowtype;
begin
 if not public.mytags_is_admin() then raise exception 'Acesso restrito ao administrador' using errcode='42501'; end if;
 if operation not in ('grant','revoke') or operation is null or request_id is null then raise exception 'Operação inválida'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_user::text,0));
 select * into previous from public.mytags_admin_operations o where o.request_id=mytags_admin_access.request_id;
 if found then
  if previous.admin_id<>auth.uid() or previous.user_id<>target_user or previous.action<>operation then raise exception 'Operação inconsistente'; end if;
  select g.expires_at into expiry from public.access_grants g where g.user_id=target_user;
  return expiry;
 end if;
 if not exists(select 1 from auth.users where id=target_user and email_confirmed_at is not null) then raise exception 'Cliente precisa confirmar o e-mail'; end if;
 if operation='grant' then
  insert into public.access_grants(user_id,expires_at) values(target_user,now()+interval '30 days')
  on conflict(user_id) do update set expires_at=greatest(public.access_grants.expires_at,now())+interval '30 days',updated_at=now()
  returning access_grants.expires_at into expiry;
 else
  insert into public.access_grants(user_id,expires_at) values(target_user,now())
  on conflict(user_id) do update set expires_at=now(),updated_at=now()
  returning access_grants.expires_at into expiry;
 end if;
 insert into public.mytags_admin_operations(request_id,admin_id,user_id,action)
 values(request_id,auth.uid(),target_user,operation);
 return expiry;
end; $$;
revoke all on function public.mytags_admin_access(uuid,text,uuid) from public,anon;
grant execute on function public.mytags_admin_access(uuid,text,uuid) to authenticated;

-- Somente esta conta confirmada recebe permissão administrativa.
insert into public.mytags_admins(user_id)
select id from auth.users where lower(email)='crioumarketing@gmail.com' and email_confirmed_at is not null
on conflict do nothing;
commit;
-- Deve retornar uma linha. Se vazio, cadastre/confirme a conta e execute este arquivo novamente.
select u.email from public.mytags_admins a join auth.users u on u.id=a.user_id;

