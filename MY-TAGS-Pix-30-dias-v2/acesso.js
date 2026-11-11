import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.8';
const db=createClient('https://soeszztfgqabzkapkkdj.supabase.co','sb_publishable_lfa2oHIGOWuy3wByOyi5TQ_SINaazrl');
const $=id=>document.getElementById(id);let recovery=false;
const message=text=>{$('accessStatus').textContent=text;};
async function checkAccess(){
 const {data:{session}}=await db.auth.getSession();$('logout').hidden=!session;$('payment').hidden=!session;if(!session)return;
 const {data,error}=await db.from('access_grants').select('expires_at').eq('user_id',session.user.id).maybeSingle();
 if(error){message('Não foi possível consultar a liberação. Tente novamente em instantes.');return;}
 if(data&&Date.parse(data.expires_at)>Date.now()){
  message('Acesso liberado. Abrindo…');const f=document.createElement('form');f.method='POST';f.action='/api/app';
  const i=document.createElement('input');i.type='hidden';i.name='token';i.value=session.access_token;f.append(i);document.body.append(f);f.submit();return;
 }
 $('buyerEmail').textContent=session.user.email;
 $('proof').href='https://wa.me/5548988116400?text='+encodeURIComponent('Olá! Fiz o Pix de R$ 39,99 para 30 dias de MY TAGS. Meu e-mail: '+session.user.email+'. Vou enviar o comprovante.');
 message(data?'Seu acesso venceu. Envie o comprovante do novo Pix para renovar.':'Conta criada. Faça o Pix e envie o comprovante para solicitar a liberação.');
}
async function run(fn){const buttons=[...document.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await fn();}catch{message('Não foi possível conectar. Tente novamente.');}finally{buttons.forEach(b=>b.disabled=false);}}
$('togglePassword').onclick=()=>{const p=$('password');p.type=p.type==='password'?'text':'password';$('togglePassword').textContent=p.type==='password'?'Mostrar':'Ocultar';};
$('accessForm').onsubmit=e=>{e.preventDefault();run(async()=>{
 if(recovery){const {error}=await db.auth.updateUser({password:$('password').value});if(error){message('Não foi possível salvar. Solicite novo link ou tente senha mais forte.');return;}recovery=false;$('submitLabel').textContent='Entrar na minha conta';message('Senha atualizada.');await checkAccess();return;}
 const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});$('password').value='';if(error){message('Confira o e-mail, a senha e a confirmação do e-mail.');return;}await checkAccess();
});};
$('activateAccount').onclick=()=>{if(!$('accessForm').reportValidity())return;run(async()=>{const {error}=await db.auth.signUp({email:$('email').value.trim(),password:$('password').value,options:{emailRedirectTo:location.origin+'/'}});$('password').value='';if(error){message('Não foi possível cadastrar. Se já tem conta, recupere sua senha.');return;}message('Confira seu e-mail e confirme o cadastro. Depois entre para ver os dados do Pix.');const {data:{session}}=await db.auth.getSession();if(session)await checkAccess();});};
$('recoverPassword').onclick=()=>{if(!$('email').reportValidity())return;run(async()=>{const {error}=await db.auth.resetPasswordForEmail($('email').value.trim(),{redirectTo:location.origin+'/?recuperar=1'});message(error?'Não foi possível solicitar. Tente novamente.':'Se houver conta para esse e-mail, enviaremos um link para criar nova senha.');});};
$('logout').onclick=()=>run(async()=>{await db.auth.signOut();location.replace('/');});
$('verifyAccess').onclick=()=>run(checkAccess);
$('copyPix').onclick=()=>run(async()=>{await navigator.clipboard.writeText('crioumarketing@gmail.com');message('Chave Pix copiada. Confira Valerio Alves dos Santos no banco.');});
db.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY'){recovery=true;$('email').required=false;$('submitLabel').textContent='Salvar nova senha';message('Digite sua nova senha.');}});
if(!new URLSearchParams(location.search).has('recuperar'))run(checkAccess);
