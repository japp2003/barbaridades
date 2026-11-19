/* uso: node tq.js q_xx.js [mostrar] — prueba los generadores y preguntas fijas que añade ese archivo */
const FS=require('fs');
const base=FS.readFileSync(__dirname+'/qlib.js','utf8')+'\n'+FS.readFileSync(__dirname+'/q_00topics.js','utf8');
const file=process.argv[2], show=+(process.argv[3]||0);
const code=base+'\nvar __G0=GENS.length,__S0=STATIC.length;\n'+FS.readFileSync(file,'utf8')+'\n;globalThis.X={GENS,STATIC,R,TOPICS,finish,__G0,__S0};';
(0,eval)(code);
const X=globalThis.X;let bad=0;const distinct={};
function chk(q,src){
  const all=[q.a].concat(q.w);
  const why=[];
  if(!X.TOPICS[q.t]) why.push('tema desconocido '+q.t);
  if(q.w.length!==3) why.push('no hay 3 incorrectas');
  if(new Set(all.map(String)).size!==4) why.push('opciones repetidas');
  if(all.concat([q.q,q.e]).some(s=>s===undefined||/undefined|NaN|Infinity|null|\[object/.test(String(s)))) why.push('undefined/NaN');
  if(!q.e) why.push('sin explicación');
  all.concat([q.q,q.e]).forEach(s=>{const h=X.R(String(s)).replace(/<[^>]*>/g,'');if(/[⟨⟩⟦⟧]|\^\{|_\{|√\{|√\[/.test(h)) why.push('marcado sin cerrar: '+s);});
  if(/(^|[\s(=])-\d/.test(all.join(' ')+' '+q.q)) why.push('guion ASCII como signo menos');
  if(why.length){bad++; if(bad<25) console.log('MAL',src,q.t,'|',q.q,'=>',all.join(' ; '),'|',why.join(', '));}
}
const S=X.STATIC.slice(X.__S0), G=X.GENS.slice(X.__G0);
S.forEach((q,i)=>chk(q,'fija'+i));
G.forEach((g,i)=>{for(let k=0;k<400;k++){let q;try{q=g.f()}catch(e){bad++;console.log('ERROR gen',i,e.message);break} chk(q,'gen'+i); distinct[q.t+'|'+q.q]=1;}});
const per={};S.forEach(q=>{per[q.t]=per[q.t]||[0,0];per[q.t][0]++});G.forEach(g=>{per[g.t]=per[g.t]||[0,0];per[g.t][1]++});
console.log('fijas',S.length,'generadores',G.length,'por tema [fijas,gens]',JSON.stringify(per),'distintas',Object.keys(distinct).length,'MAL',bad);
if(show){G.forEach((g,i)=>{for(let k=0;k<show;k++){const q=g.f();console.log('G'+i,q.t,'|',q.q,'=>',q.a,'|',q.w.join(' ; '),'||',q.e)}});S.forEach(q=>console.log('S',q.t,'|',q.q,'=>',q.a,'|',q.w.join(' ; ')));}
