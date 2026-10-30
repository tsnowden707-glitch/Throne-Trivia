// A level is a progression milestone, not a fixed set of questions.
// Keep the existing saved ledger and draw only questions not previously assigned.
let questionPoolExhausted=false;
function questionCharacters(q){
 const text=q.q+' '+q.o[q.a];
 return [...new Set((text.match(/\b(Tyrion|Jon|Daenerys|Arya|Sansa|Ned|Eddard|Cersei|Jaime|Bran|Robb|Theon|Samwell|Sam|Jorah|Davos|Stannis|Melisandre|Brienne|Joffrey|Tywin|Catelyn|Varys|Littlefinger|Petyr|Ramsay|Ygritte|Margaery|Oberyn|Hound|Sandor)\b/gi)||[]).map(n=>({eddard:'ned',samwell:'sam',petyr:'littlefinger',sandor:'hound'}[n.toLowerCase()]||n.toLowerCase())))];
}
selectBank=function(){
 questionPoolExhausted=false;
 const saved=JSON.parse(localStorage.getItem('throne_seen_v1')||'[]');
 const used=new Set([...seen,...saved]);
 // Another open tab may have reserved questions since this tab loaded.
 // Base start() persists `seen`, so keep its in-memory ledger in sync too.
 // Include saved unfinished rounds: resuming one must not make its IDs fresh.
 for(let season=1;season<=8;season++){
  try{const pending=JSON.parse(localStorage.getItem('throne_pending_'+season)||'null');
   if(pending?.season===season&&Array.isArray(pending.match))
    pending.match.forEach(q=>{if(typeof q.id==='string')used.add(q.id);});
  }catch{}
 }
 seen.splice(0,seen.length,...used);
 const available=BANK.filter(q=>q.s===currentSeason&&!used.has(q.id));
 const previousRuns=new Set(JSON.parse(localStorage.getItem('tt_question_history_v1')||'[]'));
 const picked=[],characterCounts={};
 for(const [difficulty,count] of [['challenging',2],['medium',4],['easy',4]]){
  const pool=shuffle(available.filter(q=>(q.d==='hard'?'challenging':q.d)===difficulty));
  if(pool.length<count){questionPoolExhausted=true;return [];}
  for(let n=0;n<count;n++){
   const penalty=q=>questionCharacters(q).reduce((total,name)=>total+(characterCounts[name]||0)**2+((characterCounts[name]||0)>=2?1000:0),0);
   pool.sort((a,b)=>Number(previousRuns.has(a.id))-Number(previousRuns.has(b.id))||penalty(a)-penalty(b));
   const q=pool.shift();picked.push(q);questionCharacters(q).forEach(name=>characterCounts[name]=(characterCounts[name]||0)+1);
  }
 }
 // Every position appears two or three times, with no fixed answer pattern.
 const extra=shuffle([0,1,2,3]).slice(0,2);
 const positions=shuffle([0,0,1,1,2,2,3,3,...extra]);
 return shuffle(picked).map((q,i)=>{
  const answer=positions[i],opts=shuffle(q.o.filter((_,n)=>n!==q.a));
  opts.splice(answer,0,q.o[q.a]);
  return {id:q.id,q:q.q,opts,answer};
 });
};
