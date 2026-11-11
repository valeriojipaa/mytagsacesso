-- Após conferir o Pix no banco, troque apenas o e-mail abaixo pelo do cliente.
-- Execute no SQL Editor. Confira se o resultado mostra o cliente correto.
-- Renovação acrescenta 30 dias ao prazo ainda válido; acesso vencido começa agora.
insert into public.access_grants (user_id, expires_at)
select id, now() + interval '30 days' from auth.users
where lower(email) = lower('EMAIL_DO_CLIENTE') and email_confirmed_at is not null
on conflict (user_id) do update
set expires_at = greatest(public.access_grants.expires_at,now()) + interval '30 days', updated_at=now()
returning user_id, expires_at;
-- Execute uma única vez por pagamento. Sem resultado: confirme cadastro/e-mail.
