// A level is a progression milestone, not a fixed set of questions.
// Keep the existing saved ledger and draw only questions not previously assigned.
let questionPoolExhausted=false;
selectBank=function(){
 questionPoolExhausted=false;
 const saved=JSON.parse(localStorage.getItem('throne_seen_v1')||'[]');
 const used=new Set([...seen,...saved]);
 const available=BANK.filter(q=>q.s===currentSeason&&!used.has(q.id));
 const picked=[];
 for(const [difficulty,count] of [['easy',4],['medium',4],['challenging',2]]){
  const pool=shuffle(available.filter(q=>q.d===difficulty));
  if(pool.length<count){questionPoolExhausted=true;return [];}
  picked.push(...pool.slice(0,count));
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
