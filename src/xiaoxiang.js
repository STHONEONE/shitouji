'use strict';
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d',{alpha:false});
ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
const W=960,H=600,images={},keys=new Set();
const heroSprites={};
const courtyardProps=[];
const state={ready:false,x:480,y:368,dir:'down',moving:false,time:0,petals:[false,false,false],dialogue:false};
const flowers=[{x:340,y:350},{x:607,y:307},{x:668,y:391}];
const walkable=[{x:126,y:274,w:708,h:140},{x:260,y:260,w:419,h:35},{x:422,y:207,w:120,h:110},{x:437,y:405,w:104,h:163}];
const solid=[{x:118,y:279,w:132,h:61},{x:764,y:279,w:71,h:57},{x:126,y:361,w:28,h:53},{x:789,y:369,w:46,h:45}];
const landmarks=[
 {key:'door',x:480,y:224,radius:37,label:'在房门前停留',text:'窗里是未收的诗稿，阶前又有几片新落的花瓣。且在院中走走，待竹影移过门槛，再回去读书。'},
 {key:'tea',x:251,y:328,radius:43,label:'在石桌旁歇息',text:'石桌上茶尚温着。隔了这一庭的竹影，人声远了，心也静了些。'},
 {key:'bamboo',x:767,y:348,radius:43,label:'听一听竹声',text:'一阵风过，万竿竹影轻轻相叠。叶声细碎，竟像有人在低声翻书。'},
 {key:'gate',x:480,y:535,radius:32,label:'望一望月洞门外',text:'门外的园路尚远。这一刻，且留在潇湘馆，看一庭春色。'}
];
let previous=0,toastDeadline=0,lastNear='';
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function validFoot(x,y){
 const corners=[[-6,-3],[6,-3],[-6,3],[6,3]];
 return corners.every(([dx,dy])=>walkable.some(r=>x+dx>=r.x&&x+dx<=r.x+r.w&&y+dy>=r.y&&y+dy<=r.y+r.h))&&!solid.some(r=>x+6>r.x&&x-6<r.x+r.w&&y+3>r.y&&y-3<r.y+r.h);
}
function nearest(){
 const found=landmarks.map(p=>({...p,d:Math.hypot(state.x-p.x,state.y-p.y)})).filter(p=>p.d<p.radius).sort((a,b)=>a.d-b.d)[0];
 return found||null;
}
function nearestFlower(){return flowers.findIndex((p,i)=>!state.petals[i]&&Math.hypot(p.x-state.x,p.y-state.y)<30);}
function toast(text){$('toast').textContent=text;$('toast').classList.add('on');toastDeadline=performance.now()+2600;}
function closeDialogue(){state.dialogue=false;$('dialogue').hidden=true;keys.clear();}
function say(text){keys.clear();state.moving=false;state.dialogue=true;$('dialogue-text').textContent=text;$('dialogue').hidden=false;}
function interact(){
 if(!state.ready)return;
 if(state.dialogue){closeDialogue();return;}
 const p=nearest();
 if(p){say(p.text);return;}
 if(nearestFlower()>=0){pickFlower();return;}
 toast('靠近石桌、竹林或房门，按 E 停留。');
}
function pickFlower(){
 if(!state.ready||state.dialogue)return;
 const i=nearestFlower();
 if(i<0){toast(state.petals.every(Boolean)?'三处落花已经收好。':'走近地上的微光，再按 F 拾花。');return;}
 state.petals[i]=true;const count=state.petals.filter(Boolean).length;
 $('petal-count').textContent=`落花 ${count} / 3`;
 toast(count===3?'将落花轻轻收好。今日的春色，也记在心里了。':`拾起一片落花 · ${count} / 3`);
}
function reset(){
 closeDialogue();state.x=480;state.y=368;state.dir='down';state.moving=false;state.petals=[false,false,false];$('petal-count').textContent='落花 0 / 3';toast('黛玉回到了院路中央。');
}
function update(dt){
 state.time+=dt;if(!state.ready||state.dialogue)return;
 let dx=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft'));
 let dy=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));
 state.moving=!!(dx||dy);
 if(state.moving){
  state.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
  const length=Math.hypot(dx,dy);dx/=length;dy/=length;
  const speed=keys.has('ShiftLeft')||keys.has('ShiftRight')?151:103;
  const nx=state.x+dx*speed*dt,ny=state.y+dy*speed*dt;
  if(validFoot(nx,state.y))state.x=nx;
  if(validFoot(state.x,ny))state.y=ny;
 }
 const flower=nearestFlower(),near=nearest(),label=flower>=0?'F · 拾起落花':near?'E · '+near.label:'';
 if(label!==lastNear){$('prompt').textContent=label;$('prompt').style.display=label?'block':'none';lastNear=label;}
}
function drawBase(){ctx.drawImage(images.ground,0,0,W,H);}
function drawArchitecture(front){
 if(front){if(typeof drawMoonWall==='function')drawMoonWall();}
 else ctx.drawImage(images.house,0,0,W,H*560/992);
}
function drawHero(){
 const img=heroSprites[state.dir];
 const x=Math.round(state.x),y=Math.round(state.y),bob=state.moving&&!reduceMotion?Math.round(Math.sin(state.time*15)*1):0;
 ctx.fillStyle='#273b3338';ctx.beginPath();ctx.ellipse(x,y-4,12,4,0,0,Math.PI*2);ctx.fill();
 ctx.drawImage(img,x-Math.floor(img.width/2),y-img.height+bob);
}
function prepareHeroSprites(){
 const atlas=images['daiyu-atlas'],source=document.createElement('canvas');
 source.width=atlas.width;source.height=atlas.height;
 const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(atlas,0,0);
 const data=sc.getImageData(0,0,atlas.width,atlas.height).data;
 const cw=Math.floor(atlas.width/2),ch=Math.floor(atlas.height/2);
 for(const [direction,col,row] of [['down',0,0],['up',1,0],['left',0,1],['right',1,1]]){
  const seen=new Uint8Array(cw*ch),queue=new Int32Array(cw*ch),parts=[];
  const visible=(x,y)=>data[((row*ch+y)*atlas.width+col*cw+x)*4+3]>40;
  for(let startY=0;startY<ch;startY++)for(let startX=0;startX<cw;startX++){
   const start=startY*cw+startX;if(seen[start]||!visible(startX,startY))continue;
   let head=0,tail=1,minX=startX,maxX=startX,minY=startY,maxY=startY;queue[0]=start;seen[start]=1;
   while(head<tail){const p=queue[head++],x=p%cw,y=Math.floor(p/cw);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy,i=ny*cw+nx;if(nx<0||ny<0||nx>=cw||ny>=ch||seen[i]||!visible(nx,ny))continue;seen[i]=1;queue[tail++]=i;}
   }
   parts.push({minX,maxX,minY,maxY,size:tail});
  }
  parts.sort((a,b)=>b.size-a.size);const main=parts[0];if(!main)throw new Error('人物方向素材为空：'+direction);
  let {minX,minY,maxX,maxY}=main;
  for(const p of parts)if(p.size>=20&&p.maxX>=main.minX-16&&p.minX<=main.maxX+16&&p.maxY>=main.minY-16&&p.minY<=main.maxY+16){
   minX=Math.min(minX,p.minX);minY=Math.min(minY,p.minY);maxX=Math.max(maxX,p.maxX);maxY=Math.max(maxY,p.maxY);
  }
  const sw=maxX-minX+1,sh=maxY-minY+1,sprite=document.createElement('canvas');
  sprite.height=84;sprite.width=Math.round(sw/sh*sprite.height);
  const hc=sprite.getContext('2d');hc.imageSmoothingEnabled=true;hc.imageSmoothingQuality='high';
  hc.drawImage(atlas,col*cw+minX,row*ch+minY,sw,sh,0,0,sprite.width,sprite.height);
  heroSprites[direction]=sprite;
 }
}
function drawFlowers(){
 for(let i=0;i<flowers.length;i++)if(!state.petals[i]){
  const p=flowers[i],glow=reduceMotion?1:(Math.sin(state.time*2.5+i)+1)*.5;
  ctx.fillStyle='#f2c596';ctx.globalAlpha=.35+glow*.25;ctx.fillRect(p.x-5,p.y-2,11,5);ctx.globalAlpha=1;
  ctx.fillStyle='#ffd2dc';ctx.fillRect(p.x-3,p.y-2,3,2);ctx.fillRect(p.x,p.y,4,2);ctx.fillStyle='#fff0dc';ctx.fillRect(p.x,p.y-1,2,2);
 }
}
function drawAir(){
 if(reduceMotion)return;
 ctx.globalAlpha=.65;
 for(let i=0;i<9;i++){
  const x=Math.round((state.time*(7+i%3)+i*109)%1030-35),y=Math.round((state.time*(11+i%2)+i*69)%560+20);
  ctx.fillStyle=i%2?'#edb2c3':'#f9d1d0';ctx.fillRect(x,y,3,2);ctx.fillRect(x+2,y-1,2,1);
 }
 ctx.globalAlpha=1;
}
function render(){
 ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);
 drawBase();drawArchitecture(false);drawFlowers();
 const actors=courtyardProps.map(p=>({y:p.y,draw:()=>{ctx.drawImage(p.sprite,Math.round(p.x-p.sprite.width/2),Math.round(p.y-p.sprite.height));if(p.effect)p.effect();}}));
 actors.push({y:state.y,draw:drawHero});actors.sort((a,b)=>a.y-b.y).forEach(p=>p.draw());
 drawArchitecture(true);drawAir();
}
function frame(ts){
 const dt=Math.min((ts-previous)/1000||.016,.035);previous=ts;
 update(dt);render();
 if(toastDeadline&&ts>toastDeadline){$('toast').classList.remove('on');toastDeadline=0;}
 requestAnimationFrame(frame);
}
const movementKeys=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'];
document.addEventListener('keydown',e=>{
 if(movementKeys.includes(e.code)){e.preventDefault();keys.add(e.code);return;}
 if(e.repeat)return;
 if(e.code==='KeyE'){e.preventDefault();interact();}
 if(e.code==='KeyF'){e.preventDefault();pickFlower();}
 if(e.code==='Escape')closeDialogue();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>keys.clear());
document.addEventListener('visibilitychange',()=>{keys.clear();previous=0;});
$('dialogue-close').onclick=closeDialogue;
$('help').onclick=()=>say('你正在操控林黛玉。用 WASD 或方向键行走，按住 Shift 疾走；靠近石桌、竹林或房门，按 E 停留。地上三处微光可按 F 拾取。Esc 收起心语。');
$('reset').onclick=reset;
document.querySelectorAll('[data-key]').forEach(button=>{
 const release=()=>keys.delete(button.dataset.key);
 button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(button.dataset.key);});
 button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
});
$('touch-e').onclick=interact;$('touch-f').onclick=pickFlower;
async function load(){
 let count=0;const entries=Object.entries(ASSET_DATA);
 await Promise.all(entries.map(([key,src])=>new Promise((resolve,reject)=>{
  const img=new Image();img.onload=()=>{images[key]=img;count++;$('load-status').textContent=`正在铺开竹影与庭院…… ${count} / ${entries.length}`;resolve();};img.onerror=()=>reject(new Error('无法读取素材 '+key));img.src=src;
 })));
 prepareHeroSprites();state.ready=true;$('loading').hidden=true;requestAnimationFrame(frame);
}
load().catch(error=>{$('loading').hidden=false;$('load-status').textContent='庭院未能正常打开：'+error.message;$('retry').hidden=false;});
