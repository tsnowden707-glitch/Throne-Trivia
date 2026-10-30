/* Opt-in private test save. Normal installed-game progress is never erased. */
(()=>{
 const params=new URL(location.href).searchParams,normal=window.localStorage;
 if(params.get('save')==='normal'){normal.removeItem('throne_active_test_v1');return;}
 const id=params.get('fresh')||normal.getItem('throne_active_test_v1');
 if(!id||!/^20261029-test[0-9]+$/.test(id))return;
 normal.setItem('throne_active_test_v1',id);
 const prefix='throne_test_'+id+':';
 for(const name of ['localStorage','sessionStorage']){
  const original=window[name],keys=()=>Array.from({length:original.length},(_,i)=>original.key(i)).filter(k=>k?.startsWith(prefix));
  const scoped={getItem:k=>original.getItem(prefix+String(k)),setItem:(k,v)=>original.setItem(prefix+String(k),String(v)),removeItem:k=>original.removeItem(prefix+String(k)),clear:()=>keys().forEach(k=>original.removeItem(k)),key:i=>keys()[i]?.slice(prefix.length)??null};
  Object.defineProperty(scoped,'length',{get:()=>keys().length});
  Object.defineProperty(window,name,{configurable:true,value:scoped});
 }
 window.THRONE_FRESH_TEST=id;
})();
