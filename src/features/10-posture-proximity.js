// Reach is measured from object footprints, shared by prompts and E interaction.
const reachMargin=36;
function propRect(p){const [dx,dy,w,h]=p.body;return {x:p.x+dx,y:p.y+dy,w,h};}
function rectDistance(x,y,r){return Math.hypot(Math.max(r.x-x,0,x-r.x-r.w),Math.max(r.y-y,0,y-r.y-r.h));}
function interactionRects(n){
 if(state.scene==='indoor'){
  const p=roomProps.find(p=>p.id===(n.key==='vase'?'bamboo-vase':n.key));
  if(p)return n.key==='tea'?[propRect(p),...teaStools.map(s=>s.body)]:[propRect(p)];
  if(n.key==='narcissus')return [propRect(springProps.find(p=>p.id==='narcissus'))];
  const areas={exit:[452,540,56,20],window:[416,169,30,18],scroll:[750,151,38,20],rug:[458,396,24,18]};
  const a=areas[n.key];if(a)return [{x:a[0],y:a[1],w:a[2],h:a[3]}];
 }else{
  const areas={tea:[118,279,132,61],bamboo:[764,279,71,57],door:[450,215,60,12],gate:[453,530,54,18],
   'stone-lamp':[126,340,17,20],rockery:[789,330,42,32],peach:[260,262,18,18]};
  const id={lotus:'lotus-pond',flowerbed:'flower-bed'}[n.key];
  if(id)return [propRect(springProps.find(p=>p.id===id))];
  const a=areas[n.key];if(a)return [{x:a[0],y:a[1],w:a[2],h:a[3]}];
 }
 return [{x:n.x-8,y:n.y-8,w:16,h:16}];
}
nearest=function(){
 const list=state.scene==='indoor'?roomLandmarks:landmarks;
 return list.map(n=>({...n,label:n.key==='door'?'进入潇湘馆内室':n.key==='chair'?'坐到书椅上':n.label,
  d:Math.min(...interactionRects(n).map(r=>rectDistance(state.x,state.y,r)))}))
  .filter(n=>n.d<=reachMargin).sort((a,b)=>a.d-b.d)[0]||null;
};
const poseSprites={};
const posturePrepare=prepareHeroSprites;
prepareHeroSprites=function(){
 posturePrepare();
 for(const [kind,key,height]of [['lying','daiyu-lying',100],['seated','daiyu-seated',84]]){
  const img=images[key],c=document.createElement('canvas');c.width=img.width;c.height=img.height;
  const g=c.getContext('2d');g.drawImage(img,0,0);const a=g.getImageData(0,0,c.width,c.height).data;
  let l=c.width,t=c.height,r=0,b=0;
  for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(a[(y*c.width+x)*4+3]>32){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  const s=document.createElement('canvas');s.height=height;s.width=Math.round((r-l+1)*height/(b-t+1));
  const sg=s.getContext('2d');sg.imageSmoothingEnabled=false;sg.drawImage(c,l,t,r-l+1,b-t+1,0,0,s.width,s.height);poseSprites[kind]=s;
 }
};
function safeStandingPoint(x,y){
 if(validFoot(x,y))return {x,y};
 for(let r=8;r<=192;r+=4)for(let i=0;i<32;i++){const a=i*Math.PI/16,nx=Math.round(x+Math.cos(a)*r),ny=Math.round(y+Math.sin(a)*r);if(validFoot(nx,ny))return {x:nx,y:ny};}
 return {x:480,y:500};
}
function standUp(){
 if(!state.pose)return;
 const p=state.pose;state.pose=null;const out=safeStandingPoint(p.returnX,p.returnY);
 state.x=out.x;state.y=out.y;state.moving=false;keys.clear();lastNear='';saveProgress(true);
}
function takePose(kind,id,x,y,depth){
 const out=safeStandingPoint(state.x,state.y);
 closeDialogue();state.pose={kind,id,returnX:out.x,returnY:out.y,depth};
 state.x=x;state.y=y;state.moving=false;keys.clear();saveProgress(true);
}
function seatedMenu(){
 const chair=state.pose?.id==='chair';
 showPanel(chair?'坐在书椅上':'坐在茶桌旁',chair?'案上的诗笺就在手边。':'茶香轻轻浮起，坐一会儿也好。',[
  ...(chair?[choice('写一页诗',writePoem),choice('翻读诗笺',openLibrary)]:[choice('品一盏茶',()=>drinkTea())]),
  choice('起身',()=>{closeDialogue();standUp();})
 ],{portrait:false,onE:()=>{closeDialogue();standUp();}});
}
function sitDown(chair=false){
 if(chair)takePose('seated','chair',590,284,284);
 else{const seat=[...teaStools].sort((a,b)=>Math.hypot(state.x-a.x,state.y-a.y)-Math.hypot(state.x-b.x,state.y-b.y))[0];takePose('seated',seat.id,seat.x,seat.y,seat.y+.1);}
 seatedMenu();
}
function lieDown(){takePose('lying','bed',226,266,278.1);restMenu();spring.onClose=standUp;spring.onE=()=>{closeDialogue();};}
objectOption('bed','躺下',lieDown);
objectOptions.bed=objectOptions.bed.filter(o=>o.label!=='小憩一阵');
objectOption('tea','坐下',()=>sitDown(false));
objectOptions.tea[objectOptions.tea.length-1].scene='indoor';
const postureHero=drawHero;
drawHero=function(){if(state.pose&&spring.mode==='play'){const img=poseSprites[state.pose.kind];if(img)ctx.drawImage(img,Math.round(state.x-img.width/2),Math.round(state.y-img.height));return;}postureHero();};
const postureUpdate=update;
update=function(dt){
 if(spring.mode!=='play'){postureUpdate(dt);return;}
 if(state.pose){state.time+=dt;state.moving=false;
  if(spring.mode==='play'&&!state.dialogue&&state.pose.kind==='seated'&&[...keys].some(k=>['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)))standUp();
  if(state.pose){spring.updateHooks.forEach(h=>h(dt));$('prompt').textContent=state.pose.kind==='lying'?'E · 起身':'E / 移动键 · 起身';$('prompt').style.display='block';return;}
 }postureUpdate(dt);
};
const postureInteract=interact;
interact=function(){
 if(state.pose){if(state.dialogue&&spring.onE){spring.onE();return;}closeDialogue();standUp();return;}
 if(spring.mode==='play'&&!state.dialogue&&state.scene==='indoor'&&nearest()?.key==='chair'){sitDown(true);return;}
 postureInteract();
};
// Movement stands from a seat even while its action menu is open. Lying stays locked.
addEventListener('keydown',e=>{if(state.pose?.kind==='seated'&&['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())){closeDialogue();standUp();}});
const postureSave=saveProgress;
saveProgress=function(quiet=false){
 if(!state.pose)return postureSave(quiet);
 const x=state.x,y=state.y;state.x=state.pose.returnX;state.y=state.pose.returnY;
 try{return postureSave(quiet);}finally{state.x=x;state.y=y;}
};
const postureRestore=restoreGame;
restoreGame=function(v){state.pose=null;postureRestore(v);};
const postureScene=changeRoomScene;
changeRoomScene=function(scene){standUp();postureScene(scene);};
