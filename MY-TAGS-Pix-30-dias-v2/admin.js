import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.49.8';
const db=createClient('https://soeszztfgqabzkapkkdj.supabase.co','sb_publishable_lfa2oHIGOWuy3wByOyi5TQ_SINaazrl');
const $=id=>document.getElementById(id);let pending=null,busy=false;
const date=value=>new Date(value).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'});
function status(text){$('status').textContent=text;}
async function list(){
 const {data,error}=await db.rpc('mytags_admin_clients',{query:$('query').value.trim()});
 if(error){$('clients').replaceChildren();status('Não foi possível consultar clientes. Confira sua permissão e a configuração do painel no Supabase.');return;}
 $('clients').replaceChildren();
 for(const client of data){
  const row=document.createElement('div');row.className='row';const detail=document.createElement('div');const email=document.createElement('strong');email.textContent=client.email;
  const info=document.createElement('small');info.textContent=!client.confirmed?'E-mail ainda não confirmado':!client.expires_at?'Aguardando liberação':(Date.parse(client.expires_at)>Date.now()?'Ativo até ':'Vencido em ')+date(client.expires_at);detail.append(email,info);
  const actions=document.createElement('div');actions.className='actions';
  for(const [op,label] of [['grant',client.expires_at?'Renovar 30 dias':'Liberar 30 dias'],['revoke','Bloquear']]){
   const button=document.createElement('button');button.textContent=label;button.disabled=!client.confirmed;if(op==='revoke')button.className='secondary';button.onclick=()=>confirmAction(client,op);actions.append(button);
  }
  row.append(detail,actions);$('clients').append(row);
 }
 status(data.length?'Clientes encontrados: '+data.length: 'Nenhum cliente encontrado.');
}
async function enter(){
 const {data:{session}}=await db.auth.getSession();if(!session)return;
 const {data,error}=await db.rpc('mytags_is_admin');
 if(error||data!==true){$('panel').hidden=true;$('logout').hidden=false;status('Esta conta não tem permissão administrativa.');return;}
 $('signin').hidden=true;$('panel').hidden=false;$('logout').hidden=false;await list();
}
function confirmAction(client,operation){
 pending={client,operation,requestId:crypto.randomUUID()};$('paid').checked=false;$('paidLabel').hidden=operation!=='grant';$('apply').disabled=operation==='grant';$('actionStatus').textContent='';
 $('confirmTitle').textContent=operation==='grant'?'Confirmar 30 dias de acesso':'Bloquear acesso';$('confirmClient').textContent=client.email;
 $('confirmInfo').textContent=operation==='grant'?'O cliente receberá 30 dias a partir da liberação, ou mais 30 dias se ainda tiver prazo válido.':'O acesso será bloqueado na próxima abertura. Uma página já aberta pode continuar funcionando.';$('confirm').showModal();
}
$('paid').onchange=()=>{$('apply').disabled=busy||!$('paid').checked;};
$('cancel').onclick=()=>{if(!busy){$('confirm').close();pending=null;}};
$('confirm').addEventListener('cancel',e=>{if(busy)e.preventDefault();});
$('apply').onclick=async()=>{
 if(busy||!pending||(pending.operation==='grant'&&!$('paid').checked))return;
 busy=true;$('apply').disabled=true;$('cancel').disabled=true;$('actionStatus').textContent='Salvando…';
 try{
  const {data,error}=await db.rpc('mytags_admin_access',{target_user:pending.client.user_id,operation:pending.operation,request_id:pending.requestId});
  if(error)throw error;
  const success=pending.operation==='grant'?'Acesso liberado até '+date(data):'Acesso bloqueado.';
  $('confirm').close();pending=null;await list();status(success);
 }catch{$('actionStatus').textContent='Não foi possível confirmar. Tente novamente por este mesmo botão; a operação não será duplicada.';}
 finally{busy=false;$('cancel').disabled=false;$('apply').disabled=pending?.operation==='grant'&&!$('paid').checked;}
};
$('search').onsubmit=async e=>{e.preventDefault();try{await list();}catch{status('Não foi possível conectar. Tente novamente.');}};
$('login').onsubmit=async e=>{e.preventDefault();const button=$('login').querySelector('button');button.disabled=true;try{const {error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});$('password').value='';if(error){status('Confira e-mail, senha e confirmação do cadastro.');return;}await enter();}catch{status('Não foi possível conectar.');}finally{button.disabled=false;}};
$('logout').onclick=async()=>{await db.auth.signOut();location.reload();};
enter().catch(()=>status('Não foi possível conectar. Tente novamente.'));

