const fs=require('node:fs');
const path=require('node:path');
const {authorized}=require('../lib/access.cjs');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  if(req.method!=='POST'){res.statusCode=302;res.setHeader('Location','/');return res.end();}
  try {
    const body=typeof req.body==='string'?new URLSearchParams(req.body):req.body;
    const token=body instanceof URLSearchParams?body.get('token'):body?.token;
    if(typeof token!=='string'||token.length>8192||!await authorized(token)){
      res.statusCode=403;return res.end('Acesso indisponível. Volte à página inicial para entrar e verificar sua liberação.');
    }
    res.setHeader('Content-Type','text/html; charset=utf-8');
    const subject=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).sub;
    if(!/^[a-f0-9-]{36}$/i.test(subject)) throw Error('Invalid subject');
    const html=fs.readFileSync(path.join(process.cwd(),'app.html'),'utf8')
      .replace('<head>','<head><base href="/">')
      .replaceAll('my-tags-business-v1','my-tags-business-v1-'+subject);
    res.end(html);
  }catch {res.statusCode=503;res.end('Não foi possível verificar seu acesso. Tente novamente pela página inicial.');}
};
