// Permanent local theme ownership; previews never spend coins.
(()=>{
 const KEY='throne_theme_ownership_v1';
 const prices=Object.freeze({'royal-castle':0,winterfell:750,'kings-landing':1000,dragonstone:1250,'casterly-rock':1500,highgarden:1750,'the-wall':2000,dorne:2250,'the-vale':2500,'iron-islands':2750,'storms-end':3000});
 function load(){let state;const raw=localStorage.getItem(KEY);if(raw){state=JSON.parse(raw);if(state.version!==1||!state.owned)throw Error('Invalid saved theme ownership');}else{state={version:1,owned:{'royal-castle':true}};const legacy=localStorage.getItem('throne_theme_v2');if(Object.hasOwn(prices,legacy))state.owned[legacy]=true;localStorage.setItem(KEY,JSON.stringify(state));}
  if(state.pendingBalance!==undefined){localStorage.setItem('throne_coins_v1',String(state.pendingBalance));delete state.pendingBalance;localStorage.setItem(KEY,JSON.stringify(state));}return state;}
 function owned(id){return !!load().owned[id];}
 function purchase(id){if(!Object.hasOwn(prices,id))throw Error('Unknown kingdom theme');const state=load();if(state.owned[id])return {purchased:false,cost:0};const coins=Number(localStorage.getItem('throne_coins_v1')||0),cost=prices[id];if(!Number.isSafeInteger(coins)||coins<cost)throw Error('Not enough coins');state.owned[id]=true;state.pendingBalance=coins-cost;localStorage.setItem(KEY,JSON.stringify(state));localStorage.setItem('throne_coins_v1',String(state.pendingBalance));delete state.pendingBalance;localStorage.setItem(KEY,JSON.stringify(state));return {purchased:true,cost};}
 window.ThroneThemes=Object.freeze({prices,owned,purchase});
 try{load();}catch(error){console.warn('Theme ownership unavailable; purchases paused.');}
})();
