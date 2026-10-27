(() => {
 let request=0,resizeHandler=null;
 ranking=async function(scope){
  if(resizeHandler)removeEventListener('resize',resizeHandler);resizeHandler=null;
  const token=++request,box=document.getElementById('rankBox');box.replaceChildren();
  const title=document.createElement('h3');title.textContent=scope.toUpperCase();const note=document.createElement('p');note.className='small';note.textContent='Loading rankings…';box.append(title,note);
  try{
   const rows=await TT.rankings(scope);if(token!==request)return;
   let page=0;const list=document.createElement('div');list.className='ranking-list';const pager=document.createElement('div');pager.className='ranking-pager';box.append(list,pager);
   note.textContent=scope==='Friends'?'Completed matches · Friends you have played':scope==='Monthly'?'Completed matches started this month':'Completed online matches · Ranked by points';
   if(!rows.length){note.textContent=scope==='Friends'?'Finish a match with a friend to begin your rankings.':'No completed online matches yet. Finish a duel to enter the rankings.';return;}
   function render(){const pageSize=innerHeight<500?2:5;page=Math.min(page,Math.max(0,Math.ceil(rows.length/pageSize)-1));list.replaceChildren();pager.replaceChildren();for(const row of rows.slice(page*pageSize,page*pageSize+pageSize)){const line=document.createElement('div');line.className='ranking-row'+(row.mine?' ranking-you':'');const label=document.createElement('span'),points=document.createElement('b');label.textContent=row.place+'. '+row.name;points.textContent=row.points+' pts · '+row.wins+' wins';line.append(label,points);list.append(line);}const total=Math.ceil(rows.length/pageSize);if(total>1){const previous=document.createElement('button'),next=document.createElement('button'),position=document.createElement('span');previous.textContent='Previous';next.textContent='Next';previous.disabled=page===0;next.disabled=page===total-1;previous.onclick=()=>{page--;render();};next.onclick=()=>{page++;render();};position.textContent=(page+1)+' / '+total;pager.append(previous,position,next);}}
   render();resizeHandler=()=>{if(token===request)render();};addEventListener('resize',resizeHandler);
  }catch(error){if(token!==request)return;note.textContent='Rankings could not load. Check your connection and try again.';const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>ranking(scope);box.append(retry);}
 };
})();
