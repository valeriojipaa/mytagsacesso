const fs=require('node:fs');
fs.mkdirSync('public',{recursive:true});
for(const p of ['index.html','acesso.css','acesso.js','assets']) if(fs.existsSync(p)) fs.cpSync(p,'public/'+p,{recursive:true});
