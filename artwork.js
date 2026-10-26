// Reconstructed artwork approved for the October 22 visual pass.
// Live questions, scores, portraits and controls remain real DOM elements.
const KINGDOM_THEMES = [
 ['royal-castle','Royal Castle'],['winterfell','Winterfell'],['the-wall','The Wall'],
 ['kings-landing',"King’s Landing"],['dragonstone','Dragonstone'],['casterly-rock','Casterly Rock'],
 ['highgarden','Highgarden'],['iron-islands','The Iron Islands'],['dorne','Dorne'],
 ['the-vale','The Vale'],['storms-end',"Storm’s End"]
];
let activeKingdomTheme=localStorage.getItem('throne_theme_v2')||'royal-castle';
if(!KINGDOM_THEMES.some(t=>t[0]===activeKingdomTheme))activeKingdomTheme='royal-castle';
let themePage=0;
const SCREEN_ART_IDS=['invite','characters','lobby','countdown','quiz','feedback','summary','victory','leaderboard','rewards','settings','seasons','levels'];
function kingdomArt(screen,theme=activeKingdomTheme){
 if(matchMedia('(orientation: landscape)').matches && window.THRONE_LANDSCAPE_SETS?.[theme]?.[screen])return window.THRONE_LANDSCAPE_SETS[theme][screen].src;
 return window.THRONE_THEME_SETS?.[theme]?.[screen]?.src || (screen==='splash'?'approved-splash.png':screen==='menu'?'menu-approved.webp':'screen-'+screen+'.webp');
}
for(const id of SCREEN_ART_IDS){
 const page=$(id),art=document.createElement('img');art.className='screen-art';art.alt='';art.loading='lazy';art.setAttribute('aria-hidden','true');art.src=kingdomArt(id);page.prepend(art);
}
const onlineArt=document.createElement('img');onlineArt.className='screen-art';onlineArt.alt='';onlineArt.loading='lazy';onlineArt.src=kingdomArt('quiz');$('ttOnline').prepend(onlineArt);
const menu=$('menu');menu.querySelector('.menuart').remove();
const composition=document.createElement('div');composition.className='menu-composition';
const menuImage=document.createElement('img');menuImage.id='kingdomMenuArt';menuImage.alt='';menuImage.src=kingdomArt('menu');composition.append(menuImage);
const themeTitle=document.createElement('div');themeTitle.className='theme-title';themeTitle.innerHTML='<span>THRONE</span><span>TRIVIA</span>';composition.append(themeTitle);
const menuLabels=[['PLAY','Start a match'],['PLAY A FRIEND','Challenge someone you know'],['LEADERBOARDS','See top players'],['REWARDS','Coins & unlocks'],['SETTINGS','Customize your experience']];
menu.querySelectorAll('.hit').forEach((button,i)=>{
 button.innerHTML=`<i class="menu-icon icon-${i}" aria-hidden="true"></i><span><b>${menuLabels[i][0]}</b><small>${menuLabels[i][1]}</small></span>`;
 button.setAttribute('aria-label',menuLabels[i][0]);composition.append(button);
});menu.append(composition);
function sizeMenuArtwork(){const app=document.querySelector('.app'),landscape=app.clientWidth>app.clientHeight;const h=landscape?app.clientHeight:Math.min(Math.max(200,app.clientHeight-64),app.clientWidth*7/4);composition.style.width=(landscape?app.clientWidth:h*4/7)+'px';composition.style.height=h+'px';composition.style.bottom=landscape?'0':'64px';const source=kingdomArt('menu');if(menuImage.getAttribute('src')!==source)menuImage.src=source;menuImage.dataset.artScreen='menu';const centered=landscape&&!!window.THRONE_LANDSCAPE_SETS?.[activeKingdomTheme]?.menu;composition.classList.toggle('approved-landscape',centered);if(centered){const entry=window.THRONE_LANDSCAPE_SETS[activeKingdomTheme].menu,ratio=entry.width/entry.height;const w=app.clientWidth;composition.style.width=w+'px';composition.style.height=(w/ratio)+'px';}composition.classList.toggle('painted-actions',activeKingdomTheme==='royal-castle');window.dispatchEvent(new Event('artworkchange'));}
new ResizeObserver(()=>{sizeMenuArtwork();applyActiveKingdomArtwork();}).observe(document.querySelector('.app'));sizeMenuArtwork();
function setKingdomTheme(id){
 if(!KINGDOM_THEMES.some(t=>t[0]===id))return;
 activeKingdomTheme=id;localStorage.setItem('throne_theme_v2',id);
 document.querySelector('.app').dataset.kingdom=id;
 composition.classList.toggle('themed',id!=='royal-castle');
 applyActiveKingdomArtwork();
 sizeMenuArtwork();
 window.dispatchEvent(new Event('artworkchange'));
}
function showThemeChoices(){
 const box=$('rewardBox');box.replaceChildren();box.classList.add('theme-browser');
 const title=document.createElement('h3');title.textContent='Choose your kingdom';
 const note=document.createElement('p');note.className='small';note.textContent='15 screens per kingdom · Your choice is saved';
 const grid=document.createElement('div');grid.className='theme-grid';
 KINGDOM_THEMES.slice(themePage*4,themePage*4+4).forEach(([id,name])=>{
  const button=document.createElement('button');button.className='theme-card';button.setAttribute('aria-pressed',String(activeKingdomTheme===id));
  button.disabled=!window.THRONE_THEME_SETS?.[id];
  const img=document.createElement('img');img.src=kingdomArt('menu',id);img.alt='';
  const label=document.createElement('span');label.textContent=name+(id===activeKingdomTheme?' ✓':'');button.append(img,label);
  button.onclick=()=>{setKingdomTheme(id);showThemeChoices();};grid.append(button);
 });
 const pager=document.createElement('div');pager.className='theme-pager';
 const prev=document.createElement('button'),next=document.createElement('button'),page=document.createElement('span');
 prev.textContent='‹';next.textContent='›';prev.setAttribute('aria-label','Previous themes');next.setAttribute('aria-label','Next themes');
 prev.disabled=themePage===0;next.disabled=themePage===2;page.textContent=`${themePage+1} / 3`;
 prev.onclick=()=>{themePage--;showThemeChoices();};next.onclick=()=>{themePage++;showThemeChoices();};pager.append(prev,page,next);
 const preview=document.createElement('button');preview.className='btn gold';preview.textContent='VIEW MY MENU';preview.onclick=()=>go('menu');
 box.append(title,note,grid,pager,preview);
}
const rewardBeforeArtwork=reward;
reward=function(type){$('rewardBox').classList.remove('theme-browser');if(type==='Themes'){themePage=Math.floor(KINGDOM_THEMES.findIndex(t=>t[0]===activeKingdomTheme)/4);showThemeChoices();}else rewardBeforeArtwork(type);};
// Present all existing friend controls in compact, explicit steps.
const onlineControls=$('onlineControls');
const inviteSteps=document.createElement('div');inviteSteps.className='invite-steps';
const inviteGroups=[document.createElement('div'),document.createElement('div'),document.createElement('div')];
inviteGroups.forEach((g,i)=>{g.className='invite-step';g.dataset.step=i;});
const stepLabels=['ACCOUNT','ROOM','INVITE'];
function showInviteStep(index){inviteGroups.forEach((g,i)=>g.hidden=i!==index);inviteSteps.querySelectorAll('button').forEach((b,i)=>b.setAttribute('aria-selected',String(i===index)));}
stepLabels.forEach((label,i)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>showInviteStep(i);inviteSteps.append(b);});
for(const id of ['ttEmail','ttPassword'])inviteGroups[0].append($(id));
for(const b of [...onlineControls.querySelectorAll('button')]){const action=b.getAttribute('onclick')||'';inviteGroups[/signUp|signIn/.test(action)?0:1].append(b);}
inviteGroups[1].insertBefore($('ttCode'),inviteGroups[1].querySelector('[onclick*="joinRoom"]'));
const oldInvitePanel=document.querySelector('#invite .content > .panel');
if(oldInvitePanel){for(const b of [...oldInvitePanel.querySelectorAll('button')])inviteGroups[2].append(b);oldInvitePanel.remove();}
onlineControls.insertBefore(inviteSteps,$('ttStatus'));inviteGroups.forEach(g=>onlineControls.insertBefore(g,$('ttStatus')));
showInviteStep(1);
document.querySelectorAll('#invite .content > .small').forEach(e=>e.remove());
const themeShortcut=document.createElement('button');themeShortcut.className='btn';themeShortcut.textContent='CHANGE KINGDOM THEME';themeShortcut.onclick=()=>{go('rewards');reward('Themes');};document.querySelector('#settings .content').append(themeShortcut);
function applyActiveKingdomArtwork(){
 const page=document.querySelector('.page.active');if(!page)return;
 const screen=page.id==='ttOnline'?'quiz':page.id;
 const img=screen==='splash'?page.querySelector('.splashOriginal'):page.querySelector('.screen-art');
 if(img){const src=kingdomArt(screen);if(img.getAttribute('src')!==src)img.src=src;img.dataset.artScreen=screen;img.dataset.kingdom=activeKingdomTheme;}
 if(screen==='splash'){
  const themed=activeKingdomTheme!=='royal-castle';
  page.classList.toggle('themed-splash',themed);
  page.querySelector('.splashOriginal').alt=KINGDOM_THEMES.find(t=>t[0]===activeKingdomTheme)[1]+' — Throne Trivia';
 }
 window.dispatchEvent(new Event('artworkchange'));
}
new MutationObserver(applyActiveKingdomArtwork).observe(document.querySelector('.app'),{subtree:true,attributes:true,attributeFilter:['class']});
if(!window.THRONE_THEME_SETS?.[activeKingdomTheme])activeKingdomTheme='royal-castle';
setKingdomTheme(activeKingdomTheme);
