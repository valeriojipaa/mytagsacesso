const {test}=require('node:test');const assert=require('node:assert/strict');const {authorized}=require('../lib/access.cjs');
const response=(ok,data)=>({ok,json:async()=>data});
const mock=rows=>async url=>url.includes('/auth/')?response(true,{id:'u',email_confirmed_at:'2026-01-01'}):response(true,rows);
test('sem token bloqueado',async()=>assert.equal(await authorized(''),false));
test('token inválido bloqueado',async()=>assert.equal(await authorized('bad',async()=>response(false,{})),false));
test('sem liberação e vencido bloqueados',async()=>{for(const rows of [[],[{expires_at:'2020-01-01'}]])assert.equal(await authorized('token',mock(rows)),false);});
test('acesso válido liberado',async()=>assert.equal(await authorized('token',mock([{expires_at:'2099-01-01'}])),true));
test('falha da consulta bloqueada',async()=>assert.equal(await authorized('token',async u=>u.includes('/auth/')?response(true,{id:'u',email_confirmed_at:'2026-01-01'}):response(false,{})),false));
test('email não confirmado bloqueado',async()=>assert.equal(await authorized('token',async()=>response(true,{id:'u'})),false));
