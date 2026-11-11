const url='https://soeszztfgqabzkapkkdj.supabase.co';
const key='sb_publishable_lfa2oHIGOWuy3wByOyi5TQ_SINaazrl';
async function authorized(token,request=fetch){
  if(!token) return false;
  const headers={apikey:key,Authorization:'Bearer '+token};
  const user=await request(url+'/auth/v1/user',{headers});
  if(!user.ok) return false;
  const data=await user.json();
  if(!data.id || !data.email_confirmed_at) return false;
  const response=await request(url+'/rest/v1/access_grants?user_id=eq.'+encodeURIComponent(data.id)+'&select=expires_at',{headers});
  if(!response.ok) return false;
  const rows=await response.json();
  return Array.isArray(rows)&&rows.some(row=>Date.parse(row.expires_at)>Date.now());
}
module.exports={authorized};
