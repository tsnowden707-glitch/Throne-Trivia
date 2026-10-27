// First TV-season appearances. Once introduced, characters remain eligible in later seasons.
const CHARACTER_ROSTER = [
  {
    "id": "jon-snow",
    "name": "Jon Snow",
    "season": 1
  },
  {
    "id": "daenerys",
    "name": "Daenerys Targaryen",
    "season": 1
  },
  {
    "id": "arya",
    "name": "Arya Stark",
    "season": 1
  },
  {
    "id": "tyrion",
    "name": "Tyrion Lannister",
    "season": 1
  },
  {
    "id": "cersei",
    "name": "Cersei Lannister",
    "season": 1
  },
  {
    "id": "melisandre",
    "name": "Melisandre",
    "season": 2
  },
  {
    "id": "brienne",
    "name": "Brienne of Tarth",
    "season": 2
  },
  {
    "id": "oberyn",
    "name": "Oberyn Martell",
    "season": 4
  },
  {
    "id": "ned",
    "name": "Ned Stark",
    "season": 1
  },
  {
    "id": "alliser-thorne",
    "name": "Alliser Thorne",
    "season": 1
  },
  {
    "id": "barristan-selmy",
    "name": "Barristan Selmy",
    "season": 1
  },
  {
    "id": "benjen-stark",
    "name": "Benjen Stark",
    "season": 1
  },
  {
    "id": "beric-dondarrion",
    "name": "Beric Dondarrion",
    "season": 1
  },
  {
    "id": "biter",
    "name": "Biter",
    "season": 1
  },
  {
    "id": "bran-stark",
    "name": "Bran Stark",
    "season": 1
  },
  {
    "id": "bronn",
    "name": "Bronn",
    "season": 1
  },
  {
    "id": "catelyn-stark",
    "name": "Catelyn Stark",
    "season": 1
  },
  {
    "id": "doreah",
    "name": "Doreah",
    "season": 1
  },
  {
    "id": "gendry",
    "name": "Gendry",
    "season": 1
  },
  {
    "id": "grand-maester-pycelle",
    "name": "Grand Maester Pycelle",
    "season": 1
  },
  {
    "id": "greatjon-umber",
    "name": "Greatjon Umber",
    "season": 1
  },
  {
    "id": "gregor-the-mountain-clegane",
    "name": "Gregor \"The Mountain\" Clegane",
    "season": 1
  },
  {
    "id": "grenn",
    "name": "Grenn",
    "season": 1
  },
  {
    "id": "hodor",
    "name": "Hodor",
    "season": 1
  },
  {
    "id": "hot-pie",
    "name": "Hot Pie",
    "season": 1
  },
  {
    "id": "ilyn-payne",
    "name": "Ilyn Payne",
    "season": 1
  },
  {
    "id": "irri",
    "name": "Irri",
    "season": 1
  },
  {
    "id": "jaime-lannister",
    "name": "Jaime Lannister",
    "season": 1
  },
  {
    "id": "janos-slynt",
    "name": "Janos Slynt",
    "season": 1
  },
  {
    "id": "jaqen-h-ghar",
    "name": "Jaqen H'ghar",
    "season": 1
  },
  {
    "id": "jeor-mormont",
    "name": "Jeor Mormont",
    "season": 1
  },
  {
    "id": "joffrey-baratheon",
    "name": "Joffrey Baratheon",
    "season": 1
  },
  {
    "id": "jorah-mormont",
    "name": "Jorah Mormont",
    "season": 1
  },
  {
    "id": "jory-cassel",
    "name": "Jory Cassel",
    "season": 1
  },
  {
    "id": "kevan-lannister",
    "name": "Kevan Lannister",
    "season": 1
  },
  {
    "id": "khal-drogo",
    "name": "Khal Drogo",
    "season": 1
  },
  {
    "id": "lancel-lannister",
    "name": "Lancel Lannister",
    "season": 1
  },
  {
    "id": "lommy-greenhands",
    "name": "Lommy Greenhands",
    "season": 1
  },
  {
    "id": "loras-tyrell",
    "name": "Loras Tyrell",
    "season": 1
  },
  {
    "id": "lysa-arryn",
    "name": "Lysa Arryn",
    "season": 1
  },
  {
    "id": "maester-aemon",
    "name": "Maester Aemon",
    "season": 1
  },
  {
    "id": "maester-luwin",
    "name": "Maester Luwin",
    "season": 1
  },
  {
    "id": "marillion",
    "name": "Marillion",
    "season": 1
  },
  {
    "id": "meryn-trant",
    "name": "Meryn Trant",
    "season": 1
  },
  {
    "id": "mirri-maz-duur",
    "name": "Mirri Maz Duur",
    "season": 1
  },
  {
    "id": "myrcella-baratheon",
    "name": "Myrcella Baratheon",
    "season": 1
  },
  {
    "id": "osha",
    "name": "Osha",
    "season": 1
  },
  {
    "id": "othell-yarwyck",
    "name": "Othell Yarwyck",
    "season": 1
  },
  {
    "id": "petyr-littlefinger-baelish",
    "name": "Petyr \"Littlefinger\" Baelish",
    "season": 1
  },
  {
    "id": "pypar",
    "name": "Pypar",
    "season": 1
  },
  {
    "id": "qotho",
    "name": "Qotho",
    "season": 1
  },
  {
    "id": "rakharo",
    "name": "Rakharo",
    "season": 1
  },
  {
    "id": "rast",
    "name": "Rast",
    "season": 1
  },
  {
    "id": "renly-baratheon",
    "name": "Renly Baratheon",
    "season": 1
  },
  {
    "id": "rickard-karstark",
    "name": "Rickard Karstark",
    "season": 1
  },
  {
    "id": "rickon-stark",
    "name": "Rickon Stark",
    "season": 1
  },
  {
    "id": "robb-stark",
    "name": "Robb Stark",
    "season": 1
  },
  {
    "id": "robert-baratheon",
    "name": "Robert Baratheon",
    "season": 1
  },
  {
    "id": "robin-arryn",
    "name": "Robin Arryn",
    "season": 1
  },
  {
    "id": "rodrik-cassel",
    "name": "Rodrik Cassel",
    "season": 1
  },
  {
    "id": "rorge",
    "name": "Rorge",
    "season": 1
  },
  {
    "id": "ros",
    "name": "Ros",
    "season": 1
  },
  {
    "id": "samwell-tarly",
    "name": "Samwell Tarly",
    "season": 1
  },
  {
    "id": "sandor-the-hound-clegane",
    "name": "Sandor \"The Hound\" Clegane",
    "season": 1
  },
  {
    "id": "sansa-stark",
    "name": "Sansa Stark",
    "season": 1
  },
  {
    "id": "septa-mordane",
    "name": "Septa Mordane",
    "season": 1
  },
  {
    "id": "shae",
    "name": "Shae",
    "season": 1
  },
  {
    "id": "syrio-forel",
    "name": "Syrio Forel",
    "season": 1
  },
  {
    "id": "theon-greyjoy",
    "name": "Theon Greyjoy",
    "season": 1
  },
  {
    "id": "tommen-baratheon",
    "name": "Tommen Baratheon",
    "season": 1
  },
  {
    "id": "tywin-lannister",
    "name": "Tywin Lannister",
    "season": 1
  },
  {
    "id": "varys",
    "name": "Varys",
    "season": 1
  },
  {
    "id": "viserys-targaryen",
    "name": "Viserys Targaryen",
    "season": 1
  },
  {
    "id": "walder-frey",
    "name": "Walder Frey",
    "season": 1
  },
  {
    "id": "yoren",
    "name": "Yoren",
    "season": 1
  },
  {
    "id": "alton-lannister",
    "name": "Alton Lannister",
    "season": 2
  },
  {
    "id": "amory-lorch",
    "name": "Amory Lorch",
    "season": 2
  },
  {
    "id": "balon-greyjoy",
    "name": "Balon Greyjoy",
    "season": 2
  },
  {
    "id": "black-lorren",
    "name": "Black Lorren",
    "season": 2
  },
  {
    "id": "craster",
    "name": "Craster",
    "season": 2
  },
  {
    "id": "dagmer-cleftjaw",
    "name": "Dagmer Cleftjaw",
    "season": 2
  },
  {
    "id": "daisy",
    "name": "Daisy",
    "season": 2
  },
  {
    "id": "davos-seaworth",
    "name": "Davos Seaworth",
    "season": 2
  },
  {
    "id": "dontos-hollard",
    "name": "Dontos Hollard",
    "season": 2
  },
  {
    "id": "eddison-tollett",
    "name": "Eddison Tollett",
    "season": 2
  },
  {
    "id": "gilly",
    "name": "Gilly",
    "season": 2
  },
  {
    "id": "kovarro",
    "name": "Kovarro",
    "season": 2
  },
  {
    "id": "margaery-tyrell",
    "name": "Margaery Tyrell",
    "season": 2
  },
  {
    "id": "matthos-seaworth",
    "name": "Matthos Seaworth",
    "season": 2
  },
  {
    "id": "podrick-payne",
    "name": "Podrick Payne",
    "season": 2
  },
  {
    "id": "pyat-pree",
    "name": "Pyat Pree",
    "season": 2
  },
  {
    "id": "qhorin-halfhand",
    "name": "Qhorin Halfhand",
    "season": 2
  },
  {
    "id": "roose-bolton",
    "name": "Roose Bolton",
    "season": 2
  },
  {
    "id": "selyse-florent",
    "name": "Selyse Florent",
    "season": 2
  },
  {
    "id": "silk-king",
    "name": "Silk King",
    "season": 2
  },
  {
    "id": "stannis-baratheon",
    "name": "Stannis Baratheon",
    "season": 2
  },
  {
    "id": "talisa-maegyr",
    "name": "Talisa Maegyr",
    "season": 2
  },
  {
    "id": "the-high-septon",
    "name": "The High Septon",
    "season": 2
  },
  {
    "id": "the-spice-king",
    "name": "The Spice King",
    "season": 2
  },
  {
    "id": "xaro-xhoan-daxos",
    "name": "Xaro Xhoan Daxos",
    "season": 2
  },
  {
    "id": "yara-greyjoy",
    "name": "Yara Greyjoy",
    "season": 2
  },
  {
    "id": "ygritte",
    "name": "Ygritte",
    "season": 2
  },
  {
    "id": "anguy",
    "name": "Anguy",
    "season": 3
  },
  {
    "id": "black-walder-rivers",
    "name": "Black Walder Rivers",
    "season": 3
  },
  {
    "id": "brynden-tully",
    "name": "Brynden Tully",
    "season": 3
  },
  {
    "id": "daario-naharis",
    "name": "Daario Naharis",
    "season": 3
  },
  {
    "id": "edmure-tully",
    "name": "Edmure Tully",
    "season": 3
  },
  {
    "id": "grey-worm",
    "name": "Grey Worm",
    "season": 3
  },
  {
    "id": "jojen-reed",
    "name": "Jojen Reed",
    "season": 3
  },
  {
    "id": "kraznys-mo-nakloz",
    "name": "Kraznys mo Nakloz",
    "season": 3
  },
  {
    "id": "little-sam",
    "name": "Little Sam",
    "season": 3
  },
  {
    "id": "locke",
    "name": "Locke",
    "season": 3
  },
  {
    "id": "lothar-frey",
    "name": "Lothar Frey",
    "season": 3
  },
  {
    "id": "mance-rayder",
    "name": "Mance Rayder",
    "season": 3
  },
  {
    "id": "meera-reed",
    "name": "Meera Reed",
    "season": 3
  },
  {
    "id": "missandei",
    "name": "Missandei",
    "season": 3
  },
  {
    "id": "myranda",
    "name": "Myranda",
    "season": 3
  },
  {
    "id": "olenna-tyrell",
    "name": "Olenna Tyrell",
    "season": 3
  },
  {
    "id": "olyvar",
    "name": "Olyvar",
    "season": 3
  },
  {
    "id": "orell",
    "name": "Orell",
    "season": 3
  },
  {
    "id": "qyburn",
    "name": "Qyburn",
    "season": 3
  },
  {
    "id": "ramsay-bolton",
    "name": "Ramsay Bolton",
    "season": 3
  },
  {
    "id": "shireen-baratheon",
    "name": "Shireen Baratheon",
    "season": 3
  },
  {
    "id": "steelshanks-walton",
    "name": "Steelshanks Walton",
    "season": 3
  },
  {
    "id": "thoros-of-myr",
    "name": "Thoros of Myr",
    "season": 3
  },
  {
    "id": "tormund-giantsbane",
    "name": "Tormund Giantsbane",
    "season": 3
  },
  {
    "id": "ellaria-sand",
    "name": "Ellaria Sand",
    "season": 4
  },
  {
    "id": "hizdahr-zo-loraq",
    "name": "Hizdahr zo Loraq",
    "season": 4
  },
  {
    "id": "leaf",
    "name": "Leaf",
    "season": 4
  },
  {
    "id": "mace-tyrell",
    "name": "Mace Tyrell",
    "season": 4
  },
  {
    "id": "night-king",
    "name": "Night King",
    "season": 4
  },
  {
    "id": "olly",
    "name": "Olly",
    "season": 4
  },
  {
    "id": "styr",
    "name": "Styr",
    "season": 4
  },
  {
    "id": "thenn-warg",
    "name": "Thenn Warg",
    "season": 4
  },
  {
    "id": "three-eyed-raven",
    "name": "Three-Eyed Raven",
    "season": 4
  },
  {
    "id": "walda-bolton",
    "name": "Walda Bolton",
    "season": 4
  },
  {
    "id": "yohn-royce",
    "name": "Yohn Royce",
    "season": 4
  },
  {
    "id": "areo-hotah",
    "name": "Areo Hotah",
    "season": 5
  },
  {
    "id": "bowen-marsh",
    "name": "Bowen Marsh",
    "season": 5
  },
  {
    "id": "doran-martell",
    "name": "Doran Martell",
    "season": 5
  },
  {
    "id": "nymeria-sand",
    "name": "Nymeria Sand",
    "season": 5
  },
  {
    "id": "obara-sand",
    "name": "Obara Sand",
    "season": 5
  },
  {
    "id": "septa-unella",
    "name": "Septa Unella",
    "season": 5
  },
  {
    "id": "the-high-sparrow",
    "name": "The High Sparrow",
    "season": 5
  },
  {
    "id": "the-waif",
    "name": "The Waif",
    "season": 5
  },
  {
    "id": "trystane-martell",
    "name": "Trystane Martell",
    "season": 5
  },
  {
    "id": "tyene-sand",
    "name": "Tyene Sand",
    "season": 5
  },
  {
    "id": "wun-weg-wun-dar-wun",
    "name": "Wun Weg Wun Dar Wun",
    "season": 5
  },
  {
    "id": "bobono",
    "name": "Bobono",
    "season": 6
  },
  {
    "id": "clarenzo",
    "name": "Clarenzo",
    "season": 6
  },
  {
    "id": "dickon-tarly",
    "name": "Dickon Tarly",
    "season": 6
  },
  {
    "id": "euron-greyjoy",
    "name": "Euron Greyjoy",
    "season": 6
  },
  {
    "id": "harald-karstark",
    "name": "Harald Karstark",
    "season": 6
  },
  {
    "id": "izembaro",
    "name": "Izembaro",
    "season": 6
  },
  {
    "id": "khal-moro",
    "name": "Khal Moro",
    "season": 6
  },
  {
    "id": "lady-crane",
    "name": "Lady Crane",
    "season": 6
  },
  {
    "id": "lyanna-mormont",
    "name": "Lyanna Mormont",
    "season": 6
  },
  {
    "id": "maester-wolkan",
    "name": "Maester Wolkan",
    "season": 6
  },
  {
    "id": "qhono",
    "name": "Qhono",
    "season": 6
  },
  {
    "id": "randyll-tarly",
    "name": "Randyll Tarly",
    "season": 6
  },
  {
    "id": "robett-glover",
    "name": "Robett Glover",
    "season": 6
  },
  {
    "id": "alys-karstark",
    "name": "Alys Karstark",
    "season": 7
  },
  {
    "id": "archmaester-ebrose",
    "name": "Archmaester Ebrose",
    "season": 7
  },
  {
    "id": "harrag",
    "name": "Harrag",
    "season": 7
  }
];
names.splice(0,names.length,...CHARACTER_ROSTER.map(c=>c.name));
P.splice(0,P.length,...CHARACTER_ROSTER.map(c=>'portrait-'+c.id+'.webp'));
const CHARACTER_STARTERS=['jon-snow','daenerys','arya'];
const CHARACTER_STORY_ORDER=['ned','bran-stark','catelyn-stark','sansa-stark','robb-stark','theon-greyjoy','tyrion','cersei','jaime-lannister','robert-baratheon','joffrey-baratheon','petyr-baelish','varys','grand-maester-pycelle','barristan-selmy','benjen-stark','samwell-tarly','jeor-mormont','alliser-thorne','khal-drogo','jorah-mormont','viserys-targaryen','doreah'];
function characterMilestone(c){
 if(CHARACTER_STARTERS.includes(c.id))return 0;
 const group=CHARACTER_ROSTER.filter(x=>x.season===c.season&&!CHARACTER_STARTERS.includes(x.id));
 const order=x=>{const i=CHARACTER_STORY_ORDER.indexOf(x.id);return i<0?1000+CHARACTER_ROSTER.indexOf(x):i;};group.sort((a,b)=>order(a)-order(b));
 const position=group.findIndex(x=>x.id===c.id);
 return position===0?1:2+Math.floor((position-1)*43/Math.max(1,group.length-2));
}
function eligibleCharacters(){return CHARACTER_ROSTER.map((c,i)=>({...c,index:i})).filter(c=>c.season<=currentSeason&&(CHARACTER_STARTERS.includes(c.id)||(typeof completedLevels==='function'?completedLevels(c.season):0)>=characterMilestone(c)));}
function validateCharacter(){
  const eligible=eligibleCharacters();
  if(!eligible.some(c=>c.index===selected))selected=eligible[0].index;
  return eligible;
}
function rememberCharacter(){localStorage.setItem('throne_character_v2',CHARACTER_ROSTER[selected].id);}
const savedCharacter=localStorage.getItem('throne_character_v2');
selected=Math.max(0,CHARACTER_ROSTER.findIndex(c=>c.id===savedCharacter));
let characterPage=0;
let characterQuery='';
const CHARACTER_PAGE_SIZE=6;
drawPortraits=function(){
  const eligible=validateCharacter(),holder=$('portraits');holder.replaceChildren();
  $('characterSearch')?.remove();
  const visible=eligible;
  const pageCount=Math.max(1,Math.ceil(visible.length/CHARACTER_PAGE_SIZE));
  characterPage=Math.max(0,Math.min(characterPage,pageCount-1));
  let pager=$('characterPager');
  if(!pager){pager=document.createElement('div');pager.id='characterPager';holder.after(pager);}
  pager.replaceChildren();
  for(const c of visible.slice(characterPage*CHARACTER_PAGE_SIZE,(characterPage+1)*CHARACTER_PAGE_SIZE)){
    const button=document.createElement('button');button.type='button';
    button.className='portrait'+(selected===c.index?' sel':'');
    button.setAttribute('aria-label',c.name);button.setAttribute('aria-pressed',String(selected===c.index));
    const img=document.createElement('img');img.src=P[c.index];img.alt=c.name;img.width=256;img.height=256;img.decoding='async';
    const label=document.createElement('span');label.textContent=c.name;
    button.append(img,label);button.onclick=()=>{selected=c.index;rememberCharacter();drawPortraits();};holder.append(button);
  }
  const previous=document.createElement('button'),next=document.createElement('button'),position=document.createElement('span');
  previous.type=next.type='button';previous.textContent='◀';next.textContent='▶';
  previous.setAttribute('aria-label','Previous characters');next.setAttribute('aria-label','Next characters');
  previous.disabled=characterPage===0;next.disabled=characterPage===pageCount-1;
  previous.onclick=()=>{characterPage--;drawPortraits();};next.onclick=()=>{characterPage++;drawPortraits();};
  position.textContent=visible.length?`${characterPage+1} / ${pageCount}`:'No matching characters';
  pager.append(previous,position,next);pager.hidden=pageCount<=1&&visible.length>0;
  $('selected').textContent=`Season ${currentSeason} · Level ${chosenLevel} · ${names[selected]} selected`;
};
const goBeforeCharacters=go;
go=function(page){
  if(page==='characters'){
    characterQuery='';if($('characterSearch'))$('characterSearch').value='';
    const saved=CHARACTER_ROSTER.findIndex(c=>c.id===localStorage.getItem('throne_character_v2'));
    if(saved>=0&&CHARACTER_ROSTER[saved].season<=currentSeason)selected=saved;
    const eligible=validateCharacter();characterPage=Math.floor(eligible.findIndex(c=>c.index===selected)/CHARACTER_PAGE_SIZE);
  }
  const eligible=validateCharacter();goBeforeCharacters(page);
  if(page==='lobby'){
    const next=eligible[(eligible.findIndex(c=>c.index===selected)+1)%eligible.length];
    $('rivalFace').src=P[next.index];$('rivalFace').alt=next.name;$('youFace').alt=names[selected];
  }
};
const startBeforeCharacters=start;
start=function(){validateCharacter();startBeforeCharacters();};
const rewardsBeforeCharacters=reward;
reward=function(type){
  if(type!=='Characters'){rewardsBeforeCharacters(type);return;}
  const box=$('rewardBox');box.replaceChildren();
  const title=document.createElement('h3');title.textContent=`Characters · Season ${currentSeason}`;
  const detail=document.createElement('p');detail.textContent=`${eligibleCharacters().length} characters available. Earn more by completing story milestones and trivia levels. Unlocked characters remain yours.`;
  const browse=document.createElement('button');browse.className='btn';browse.textContent='CHOOSE YOUR CHARACTER';browse.onclick=()=>go('characters');
  box.append(title,detail,browse);
};
drawPortraits();
window.ThroneCharacterUnlock=async function(){
 const earned=CHARACTER_ROSTER.filter(c=>c.season===currentSeason&&!CHARACTER_STARTERS.includes(c.id)&&characterMilestone(c)===completedLevels(currentSeason));
 for(const c of earned){const key='throne_character_reveal_'+c.id;if(localStorage.getItem(key))continue;
  await new Promise(resolve=>{const d=document.createElement('dialog');d.className='character-unlock';const title=document.createElement('h2'),img=document.createElement('img'),name=document.createElement('p'),close=document.createElement('button');title.textContent='Character unlocked';img.src='portrait-'+c.id+'.webp';img.alt=c.name;name.textContent=c.name;close.textContent='Continue';const finish=()=>{localStorage.setItem(key,'1');d.close();d.remove();resolve();};close.onclick=finish;d.addEventListener('cancel',e=>{e.preventDefault();finish();});d.append(title,img,name,close);document.body.append(d);d.showModal();close.focus();window.ThroneEffects?.play('reward');});
 }
};
