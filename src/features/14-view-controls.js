const gameView={zoom:1,x:0,y:0,offsetX:0,offsetY:0,visibleW:960,visibleH:600};
const zoomLevels=[1,.75,.5];
function resetView(){
 const b=homeBounds(),z=gameView.zoom;gameView.visibleW=Math.min(b.w,W/z);gameView.visibleH=Math.min(b.h,H/z);
 gameView.x=Math.max(0,Math.min(b.w-gameView.visibleW,state.x-gameView.visibleW/2));
 gameView.y=Math.max(0,Math.min(b.h-gameView.visibleH,state.y-gameView.visibleH/2));
 gameView.offsetX=Math.max(0,(W-b.w*z)/2);gameView.offsetY=Math.max(0,(H-b.h*z)/2);
 southWorld.cameraY=gameView.y;southWorld.viewHeight=gameView.visibleH;
}
function setZoom(z){
 if(!zoomLevels.includes(z))return;gameView.zoom=z;journey.extensions.view={zoom:z};resetView();
 $('zoom-value').textContent=Math.round(z*100)+'%';$('zoom-plus').disabled=z===1;$('zoom-minus').disabled=z===.5;
}
function zoomStep(direction){const i=zoomLevels.indexOf(gameView.zoom);setZoom(zoomLevels[Math.max(0,Math.min(2,i+direction))]);}
function installViewControls(){
 const style=document.createElement('style');style.textContent=`#view-tools{position:absolute;right:12px;top:92px;z-index:8;display:flex;flex-direction:column;gap:5px;width:54px}#view-tools button{font:17px/1.2 'KaiTi','SimSun',serif;min-height:34px;background:#243a2fef;color:#f3e1b6;border:2px solid #b19a66;box-shadow:2px 2px 0 #111e17;cursor:pointer;padding:4px}#view-tools button:focus-visible{outline:2px solid #fff0c1;outline-offset:3px}#view-tools button:disabled{opacity:.42;cursor:default}#view-tools #zoom-value{font:12px 'Microsoft YaHei',sans-serif;min-height:28px}#residence-toggle{margin-top:10px;font-size:14px!important}#view-tools[hidden]{display:none}`;document.head.append(style);
 const tools=document.createElement('aside');tools.id='view-tools';tools.setAttribute('aria-label','视野与住所');tools.innerHTML='<button id="zoom-plus" aria-label="放大视野倍率" title="放大（＋）">＋</button><button id="zoom-value" aria-label="恢复100%" title="回到100%">100%</button><button id="zoom-minus" aria-label="缩小视野倍率" title="缩小（－）">−</button><button id="residence-toggle" aria-label="切换住所">住所</button>';$('scene').append(tools);
 $('zoom-plus').onclick=()=>zoomStep(-1);$('zoom-minus').onclick=()=>zoomStep(1);$('zoom-value').onclick=()=>setZoom(1);$('residence-toggle').onclick=openResidences;
 document.addEventListener('keydown',e=>{if(spring.mode!=='play'||e.repeat)return;if(e.code==='Equal'||e.code==='NumpadAdd'){e.preventDefault();zoomStep(-1);}if(e.code==='Minus'||e.code==='NumpadSubtract'){e.preventDefault();zoomStep(1);}});
}
installViewControls();
const viewUpdate=update;
update=function(dt){
 viewUpdate(dt);
 const saved=journey.extensions.view?.zoom||1;if(zoomLevels.includes(saved)&&saved!==gameView.zoom)setZoom(saved);
 resetView();$('view-tools').hidden=spring.mode!=='play';
 document.querySelector('.controlbar').style.display=state.residence==='xiaoxiang'&&state.scene==='indoor'?'':'none';
};
function drawOriginalIndoorWorld(){
 ctx.drawImage(images['room-shell'],0,0,W,H);
 const layers=roomProps.concat(roomExtras).map(p=>({y:p.y,draw:()=>ctx.drawImage(p.sprite,Math.round(p.x-p.sprite.width/2),Math.round(p.y-p.sprite.height))}));
 layers.push({y:state.pose?.depth??state.y,draw:drawHero});layers.sort((a,b)=>a.y-b.y).forEach(p=>p.draw());
 const slot=journey.clock.slot;if(slot>=9||slot<3){ctx.fillStyle='rgba(20,32,63,.14)';ctx.fillRect(0,0,W,H);}
}
// This stage keeps all residence gates closed. Earlier south-path work remains
// in source for later road connection, but is outside the playable map bounds.
gateLandmark.text='院门合着，墙头的花叶轻轻作声。今日且在这一庭春色里停留。';
function drawCourtyardClosedGate(){closedGate(images.house,[700,165,190,160],[480,510,69,59]);}
render=function(){
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#14251e';ctx.fillRect(0,0,W,H);
 const b=homeBounds(),v=gameView;ctx.save();ctx.translate(Math.round(v.offsetX-v.x*v.zoom),Math.round(v.offsetY-v.y*v.zoom));ctx.scale(v.zoom,v.zoom);ctx.beginPath();ctx.rect(0,0,b.w,b.h);ctx.clip();
 if(state.residence==='xiaoxiang'){
  if(state.scene==='indoor')drawOriginalIndoorWorld();
  else drawXiaoxiangCourtyardWorld();
 }else drawResidenceWorld();ctx.restore();
};
const viewRestore=restoreGame;
restoreGame=function(v){viewRestore(v);setZoom(zoomLevels.includes(journey.extensions.view?.zoom)?journey.extensions.view.zoom:1);};
$('new-spring').onclick=()=>{if(newGame())setZoom(1);};
