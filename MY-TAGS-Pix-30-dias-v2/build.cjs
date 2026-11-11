const fs=require('node:fs');
fs.mkdirSync('lib',{recursive:true});
fs.writeFileSync('lib/app-content.json',JSON.stringify(fs.readFileSync('app.html','utf8')));
fs.mkdirSync('public',{recursive:true});
for(const p of ['index.html','acesso.css','acesso.js','assets','admin.html','admin.js']) if(fs.existsSync(p)) fs.cpSync(p,'public/'+p,{recursive:true});

