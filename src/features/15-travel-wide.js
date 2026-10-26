// The backing canvas matches its desktop CSS size 1:1. Wider windows reveal
// more world pixels; zoom levels retain their exact nearest-neighbour ratios.
const viewport={w:960,h:600};
function resizeGameViewport(){
 const scene=$('scene');scene.style.height=Math.max(360,Math.min(600,innerHeight-190))+'px';
 const r=canvas.getBoundingClientRect(),w=Math.max(1,Math.floor(r.width)),h=Math.max(1,Math.floor(r.height));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;}
 viewport.w=w;viewport.h=h;resetView();
}
resetView=function(){
 const b=homeBounds(),z=gameView.zoom;gameView.visibleW=Math.min(b.w,viewport.w/z);gameView.visibleH=Math.min(b.h,viewport.h/z);
 gameView.x=Math.max(0,Math.min(b.w-gameView.visibleW,state.x-gameView.visibleW/2));gameView.y=Math.max(0,Math.min(b.h-gameView.visibleH,state.y-gameView.visibleH/2));
 gameView.offsetX=Math.max(0,(viewport.w-b.w*z)/2);gameView.offsetY=Math.max(0,(viewport.h-b.h*z)/2);
 southWorld.cameraY=gameView.y;southWorld.viewHeight=gameView.visibleH;
};
const wideStyle=document.createElement('style');wideStyle.textContent=`body{background:#17261f;padding:18px}main{width:100%;max-width:none}#scene{width:100%;aspect-ratio:auto;box-sizing:border-box;overflow:hidden}#canvas{display:block;width:100%;height:100%;image-rendering:pixelated}#home-shortcuts{position:absolute;right:64px;bottom:0;display:flex;gap:5px}#home-shortcuts button{width:34px;min-width:34px;font-size:19px}#home-shortcuts button[aria-pressed=true]{background:#6b6141;color:#fff3c7;border-color:#e2c78a}#travel-veil{position:absolute;inset:0;z-index:12;background:#17261f;opacity:0;pointer-events:none;transition:opacity 140ms linear}#arrival-name{position:absolute;inset:40% 0 auto;z-index:11;text-align:center;font:32px 'KaiTi','SimSun',serif;letter-spacing:9px;color:#ffefc9;text-shadow:0 2px 6px #101d17;opacity:0;pointer-events:none;transition:opacity 250ms}#arrival-name.on{opacity:1}@media(prefers-reduced-motion:reduce){#travel-veil,#arrival-name{transition:none}}`;
document.head.append(wideStyle);
const shortcutGroup=document.createElement('div');shortcutGroup.id='home-shortcuts';shortcutGroup.setAttribute('aria-label','一键切换住所');$('view-tools').append(shortcutGroup);
const travel={active:false,target:null,timer:null,nameTimer:null};
const veil=document.createElement('div');veil.id='travel-veil';veil.setAttribute('aria-hidden','true');$('scene').append(veil);
const arrival=document.createElement('div');arrival.id='arrival-name';arrival.setAttribute('role','status');$('scene').append(arrival);
function travelTo(id){
 if(spring.mode!=='play'||!residences[id]||travel.active)return;
 if(state.residence===id){arrival.textContent=residences[id].name;arrival.classList.add('on');clearTimeout(travel.nameTimer);travel.nameTimer=setTimeout(()=>arrival.classList.remove('on'),1000);return;}
 closeDialogue();keys.clear();state.moving=false;travel.active=true;travel.target=id;veil.style.pointerEvents='auto';veil.style.opacity='1';
 travel.timer=setTimeout(()=>{
  switchResidence(id);arrival.textContent=residences[id].name;arrival.classList.add('on');veil.style.opacity='0';
  travel.timer=setTimeout(()=>{travel.active=false;travel.target=null;veil.style.pointerEvents='none';},160);
  clearTimeout(travel.nameTimer);travel.nameTimer=setTimeout(()=>arrival.classList.remove('on'),1100);
 },150);
}
for(const[id,glyph,key]of [['xiaoxiang','潇','1'],['yihong','怡','2'],['hengwu','蘅','3']]){
 const b=document.createElement('button');b.textContent=glyph;b.dataset.home=id;b.title=key+' · '+residences[id].name;b.setAttribute('aria-label','直达'+residences[id].name);b.setAttribute('aria-keyshortcuts',key);b.onclick=()=>travelTo(id);shortcutGroup.append(b);
}
openResidences=function(){showPanel('园中住所','择一处停留。来时的脚步与春日随记都会记着。',Object.entries(residences).map(([id,h])=>choice(h.name,()=>travelTo(id))).concat(choice('留在此处',closeDialogue)),{kind:'menu',portrait:false});};
$('residence-toggle').onclick=openResidences;
const travelImmediateSwitch=switchResidence;
switchResidence=function(id){travelImmediateSwitch(id);if(arrival.classList.contains('on'))arrival.textContent=activeHome().name;};
document.addEventListener('keydown',e=>{if(e.repeat||spring.mode!=='play'||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;const id={Digit1:'xiaoxiang',Digit2:'yihong',Digit3:'hengwu',Numpad1:'xiaoxiang',Numpad2:'yihong',Numpad3:'hengwu'}[e.code];if(id){e.preventDefault();travelTo(id);}});
addEventListener('resize',resizeGameViewport);
const travelUpdate=update;
update=function(dt){if(travel.active)keys.clear();travelUpdate(dt);for(const b of shortcutGroup.children)b.setAttribute('aria-pressed',String(b.dataset.home===state.residence));};
render=function(){
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
 const palette=state.residence==='yihong'?['#30281f','#1a2922']:state.residence==='hengwu'?['#2b332b','#1a2924']:['#233b31','#172820'];
 const bg=ctx.createRadialGradient(viewport.w/2,viewport.h/2,10,viewport.w/2,viewport.h/2,Math.max(viewport.w,viewport.h));bg.addColorStop(0,palette[0]);bg.addColorStop(1,palette[1]);ctx.fillStyle=bg;ctx.fillRect(0,0,viewport.w,viewport.h);
 const b=homeBounds(),v=gameView;ctx.save();ctx.translate(Math.round(v.offsetX-v.x*v.zoom),Math.round(v.offsetY-v.y*v.zoom));ctx.scale(v.zoom,v.zoom);ctx.beginPath();ctx.rect(0,0,b.w,b.h);ctx.clip();
 if(state.residence==='xiaoxiang'){if(state.scene==='indoor')drawOriginalIndoorWorld();else drawXiaoxiangCourtyardWorld();}else drawResidenceWorld();ctx.restore();
};
resizeGameViewport();
