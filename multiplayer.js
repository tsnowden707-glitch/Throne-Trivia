window.TT = (()=>{
 const url='https://htdupeikjohbwnjvevrd.supabase.co', key='sb_publishable_91txBMAJNP8szu3b_0V7ng_ewX65IV9';
 let sb=null,room=null,poll=null,currentRound=0,shown=false,speaking=false,live=false,ended=false,roomDetails=null,refreshing=false,submitting=false,connecting=false,myId=null,arrivalPlayed=false,needsNarration=false,navigationPaused=false,backBusy=false,rematchBusy=false,rewardPending=Promise.resolve();
 const el=id=>document.getElementById(id);
 const status=s=>{el('ttStatus').dataset.roomHint=String(/^(Room |ROOM |Ready\.|Both players|Joined Season)/.test(s));el('ttStatus').textContent=s;el('onlineStatus').textContent=s;};
 function client(){if(!window.supabase){status('Internet required: could not load the multiplayer library.');throw Error('Supabase SDK unavailable');}const id=window.ThroneTestId;const options=id?{auth:{storage:{getItem:k=>localStorage.getItem(id+':'+k),setItem:(k,v)=>localStorage.setItem(id+':'+k,v),removeItem:k=>localStorage.removeItem(id+':'+k)}}}:undefined;return sb ||= window.supabase.createClient(url,key,options);}
 async function exec(name,args={}){const {data,error}=await client().rpc(name,args);if(error)throw error;return data;}
 async function auth(method){try{let email=el('ttEmail').value.trim(),password=el('ttPassword').value;let {data,error}=await client().auth[method]({email,password});if(error)throw error;status(data.session?'Signed in. Create or join a room.':'Check your email if confirmation is required.');}catch(e){status(e.message)}}
 async function requireLogin(){const {data}=await client().auth.getUser();if(data.user){myId=data.user.id;return data.user;}const guest=await client().auth.signInAnonymously();if(guest.error)throw Error('Guest play is unavailable right now. Please try again shortly.');myId=guest.data.user.id;return guest.data.user;}
 async function createRoom(){if(connecting)return;connecting=true;try{await requireLogin();let x=await exec('tt_create_room');room=x.room_id;currentRound=0;ended=false;arrivalPlayed=false;roomDetails=await exec('tt_configure_room',{p_room:room,p_character:CHARACTER_ROSTER[selected].id,p_season:currentSeason});el('ttCode').value=x.code;status('ROOM '+x.code+' · Share this code with your friend, then press READY.');if(!navigationPaused)begin();return x;}catch(e){status(e.message)}finally{connecting=false}}
 async function joinRoom(){if(connecting)return;connecting=true;try{await requireLogin();room=await exec('tt_join_room',{p_code:el('ttCode').value.trim()});currentRound=0;ended=false;arrivalPlayed=false;roomDetails=await exec('tt_room_details',{p_room:room});currentSeason=roomDetails.season;validateCharacter();const joinedState=await exec('tt_state',{p_room:room});if(joinedState.state!=='waiting'){status('Rejoining your match...');begin();return;}roomDetails=await exec('tt_configure_room',{p_room:room,p_character:CHARACTER_ROSTER[selected].id});updateFriendLabel();status('Joined Season '+currentSeason+' as '+names[selected]+'. Press READY.');if(!navigationPaused)begin()}catch(e){status(e.message)}finally{connecting=false}}
 async function ready(){try{if(!room)throw Error('Invite your friend first, or open the invite they sent you.');const target=room;roomDetails=await exec('tt_room_details',{p_room:target});if(room!==target||navigationPaused)return;currentSeason=roomDetails.season;validateCharacter();await exec('tt_configure_room',{p_room:target,p_character:CHARACTER_ROSTER[selected].id});if(room!==target||navigationPaused)return;await exec('tt_ready',{p_room:target});if(room!==target||navigationPaused){await exec('tt_unready',{p_room:target});return;}status('Ready. Waiting for both players.');begin()}catch(e){status(e.message)}}
 function begin(){navigationPaused=false;if(poll)clearInterval(poll);poll=setInterval(refresh,950);refresh()}
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&room){needsNarration=true;refresh()}});
 function escapeHtml(s){return String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]))}
 async function refresh(){if(!room||refreshing||navigationPaused)return;refreshing=true;const requestedRoom=room;try{const s=await exec('tt_state',{p_room:room});if(room!==requestedRoom||navigationPaused)return;if(s.state==='waiting'){roomDetails=await exec('tt_room_details',{p_room:room});if(room!==requestedRoom||navigationPaused)return;window.dispatchEvent(new CustomEvent('throne-online-presentation',{detail:{state:s,details:roomDetails,myId}}));if(s.guest&&!arrivalPlayed){arrivalPlayed=true;window.ThroneVoice?.announce('arrival');}status(s.guest?'Both players connected · waiting for READY':'Room '+s.code+' · Waiting for friend to join');return;}
 if(s.state==='finished'){if(ended){if(current==='victory')await rematch(false);return;}roomDetails=await exec('tt_room_details',{p_room:room});const {data}=await client().auth.getUser();if(room!==requestedRoom||navigationPaused)return;ended=true;showOnlineVictory(s,roomDetails,data.user.id);rewardPending=Promise.resolve(window.ThroneVault?.ready).then(()=>window.ThroneCards?.reward("online:"+requestedRoom));return;}
 if(current!=='ttOnline')go('ttOnline');const reveal=new Date(s.reveal_at).getTime(),close=new Date(s.closes_at).getTime(),now=s.server_now?new Date(s.server_now).getTime():Date.now();
 if(s.round!==currentRound){currentRound=s.round;shown=false;el('onlineLiveOptions').innerHTML='';el('onlinePrompt').textContent=s.prompt;const counter=el('onlineQuestionNumber');if(counter)counter.textContent='QUESTION '+s.round+' OF 10';el('onlineStatus').textContent='';needsNarration=true;}
 if(needsNarration){needsNarration=false;window.ThroneVoice?.stop();if(now<reveal&&!document.hidden&&el('narrate').checked&&window.ThroneVoice){const offset=s.narration_started_at?Math.max(0,(now-new Date(s.narration_started_at).getTime())/1000):0;ThroneVoice.questionByText(s.prompt,()=>{},offset)}}
 const mineScore=s.owner===myId?'owner':'guest',rivalScore=mineScore==='owner'?'guest':'owner';
 el('onlineScore').innerHTML='<span class="online-you">You<strong>'+Number(s.scores[mineScore]||0)+'</strong></span><span class="online-rival">Rival<strong>'+Number(s.scores[rivalScore]||0)+'</strong></span>';el('onlineCountdown').textContent=now<reveal?'READY':String(Math.max(0,Math.ceil((close-now)/1000)));
 if(s.options&&!shown){shown=true;el('onlineLiveOptions').innerHTML='';s.options.forEach((option,i)=>{const b=document.createElement('button');b.className='answer';b.textContent='ABCD'[i]+'.  '+option;b.onclick=()=>answer(i);el('onlineLiveOptions').appendChild(b)});el('onlineStatus').textContent='Select your answer before time expires.'}
 const mine=s.answers?.some(a=>a.player_id===myId);if(mine){el('onlineLiveOptions').querySelectorAll('button').forEach(b=>b.disabled=true);el('onlineStatus').textContent='Your answer is locked.'}else if(s.answers?.length){el('onlineStatus').textContent='Your friend has answered. Choose your answer.'}
 }catch(e){if(room===requestedRoom)status('Online sync: '+e.message)}finally{refreshing=false}}
 async function answer(index){
  if(!room||submitting)return;
  const requestedRoom=room,round=currentRound;
  submitting=true;el('onlineLiveOptions').querySelectorAll('button').forEach(b=>b.disabled=true);
  try{const r=await exec('tt_answer_round',{p_room:requestedRoom,p_index:index,p_round:round});if(room!==requestedRoom||round!==currentRound)return;el('onlineStatus').textContent='Answer locked. Points: '+r.points;window.ThroneEffects?.play(Number(r.points)>0?'correct':'wrong');}
  catch(e){if(room===requestedRoom&&round===currentRound){el('onlineStatus').textContent=e.message;el('onlineLiveOptions').querySelectorAll('button').forEach(b=>b.disabled=false);}}
  finally{submitting=false;if(room===requestedRoom)refresh();}
 }


 async function rematch(accept=true){
  if(!room||!ended||rematchBusy)return;rematchBusy=true;const previous=room,button=document.querySelector('#victory .btn.gold');
  try{const result=await exec('tt_rematch',{p_room:previous,p_accept:accept});if(room!==previous){if(accept)await exec('tt_rematch',{p_room:previous,p_accept:null});return;}
   if(result.room_id){await rewardPending;if(room!==previous||current!=='victory')return;room=result.room_id;el('ttCode').value=result.code;currentRound=0;ended=false;shown=false;needsNarration=true;arrivalPlayed=true;window.ThroneVoice?.stop();go('ttOnline');}
   else if(button){button.disabled=!!result.accepted;button.textContent=result.accepted?'WAITING FOR FRIEND':result.friend_accepted?'ACCEPT REMATCH':'REMATCH';}
  }catch(e){if(room===previous&&button){button.disabled=false;button.textContent='RETRY REMATCH';button.title=e.message;el('victoryStats').textContent=e.message;}}
  finally{rematchBusy=false;}
 }
 async function backToCharacter(){
  if(backBusy)return;backBusy=true;navigationPaused=true;if(poll)clearInterval(poll);poll=null;
  const requestedRoom=room,button=el('invite').querySelector('.back');if(button)button.disabled=true;
  try{if(requestedRoom){const result=await exec('tt_unready',{p_room:requestedRoom});if(room!==requestedRoom)return;if(result.state!=='waiting'){navigationPaused=false;begin();return;}}window.ThroneVoice?.stop();playMode='friend';go('characters');}
  catch(e){navigationPaused=false;status('Could not return yet: '+e.message);if(room)begin();}
  finally{backBusy=false;if(button)button.disabled=false;}
 }
 async function resumeWaiting(){navigationPaused=false;if(!room)return;const requestedRoom=room;try{await exec('tt_configure_room',{p_room:room,p_character:CHARACTER_ROSTER[selected].id});}catch(e){status(e.message);}if(room===requestedRoom&&!navigationPaused&&current==='invite')begin();}
 function leave(){if(room&&ended)exec('tt_rematch',{p_room:room,p_accept:null}).catch(()=>{});navigationPaused=false;if(poll)clearInterval(poll);poll=null;room=null;roomDetails=null;currentRound=0;ended=false;go('menu')}
 return {rankings:async(scope)=>{await requireLogin();return exec('tt_leaderboard',{p_scope:scope});},signUp:()=>auth('signUp'),signIn:()=>auth('signInWithPassword'),createRoom,joinRoom,ready,leave,rematch,backToCharacter,resumeWaiting,getRoomCode:()=>room?el('ttCode').value.trim():null,cardCommand:async(action,args={})=>{await requireLogin();return exec('tt_cards',{action,args});}};
})();
