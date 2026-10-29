// Decode the approved music once; AudioBuffer looping avoids media-element seek gaps.
// The existing music element remains the settings, pause and narration-ducking API.
(() => {
 const media=document.getElementById('music'),AudioContext=window.AudioContext||window.webkitAudioContext;
 if(!media||!AudioContext)return;
 const nativePlay=media.play.bind(media),nativePause=media.pause.bind(media);
 const descriptor=name=>Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,name);
 const nativeTime=descriptor('currentTime'),nativePaused=descriptor('paused');
 let context,gain,buffer,loading,source,offset=0,started=0,wanted=false,revision=0,fallback=false;
 function position(){return buffer?(offset+(source?context.currentTime-started:0))%buffer.duration:offset;}
 function volume(){if(gain)gain.gain.setTargetAtTime(media.muted?0:media.volume,context.currentTime,.025);}
 function stop(){offset=position();if(source){source.stop();source.disconnect();source=null;}}
 function prepare(){
  if(!context){context=new AudioContext();gain=context.createGain();gain.connect(context.destination);volume();}
  if(!loading)loading=fetch(media.currentSrc||media.src).then(r=>{if(!r.ok)throw Error('Music unavailable');return r.arrayBuffer()}).then(bytes=>context.decodeAudioData(bytes)).then(decoded=>buffer=decoded);
  return loading;
 }
 media.play=async function(){
  if(fallback)return nativePlay();
  if(wanted&&source)return;
  wanted=true;const own=++revision;
  try{const ready=prepare();await context.resume();await ready;if(!wanted||own!==revision)return;nativePause();source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(gain);started=context.currentTime;source.start(0,offset%buffer.duration);media.dispatchEvent(new Event('playing'));}
  catch(error){if(!wanted||own!==revision)return;fallback=true;nativeTime.set.call(media,offset);return nativePlay();}
 };
 media.pause=function(){if(fallback)return nativePause();wanted=false;revision++;stop();media.dispatchEvent(new Event('pause'));};
 Object.defineProperty(media,'paused',{configurable:true,get:()=>fallback?nativePaused.get.call(media):!source});
 Object.defineProperty(media,'currentTime',{configurable:true,get:()=>fallback?nativeTime.get.call(media):position(),set:value=>{if(fallback){nativeTime.set.call(media,value);return;}const resume=wanted;media.pause();offset=Math.max(0,Number(value)||0);if(resume)media.play().catch(()=>{});}});
 media.addEventListener('volumechange',volume);
})();
