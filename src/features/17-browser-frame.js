// Browser framing only. All original textures, furniture dimensions, character
// dimensions, native world coordinates and movement/collision units are intact.
const browserFrame={auto:true,key:''};
const frameStyle=document.createElement('style');frameStyle.textContent=`html,body{height:100%;min-height:0}body{display:block;padding:12px;overflow:hidden}main{display:flex;flex-direction:column;width:100%;height:100%;min-height:0}#scene{flex:1 1 auto;min-height:0;height:auto!important}.below{flex:0 0 auto;padding:10px 2px}#fit-window{font:12px 'Microsoft YaHei',sans-serif!important;min-height:28px!important}`;
document.head.append(frameStyle);
resizeGameViewport=function(){
 const r=canvas.getBoundingClientRect(),w=Math.max(1,Math.floor(r.width)),h=Math.max(1,Math.floor(r.height));
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.imageSmoothingEnabled=false;}
 viewport.w=w;viewport.h=h;resetView();
};
// Replace the old resize listener so no 600px height cap remains.
// It may still fire first, but flex sizing above ignores its inline height.
addEventListener('resize',()=>{resizeGameViewport();browserFrame.key='';});
function setFrameAuto(value){browserFrame.auto=value;(journey.extensions.view||(journey.extensions.view={})).autoFit=value;}
const frameSetZoom=setZoom;
setZoom=function(z){const automatic=journey.extensions.view?.autoFit??browserFrame.auto;frameSetZoom(z);journey.extensions.view.autoFit=automatic;browserFrame.auto=automatic;};
function fitBrowserFrame(){
 setFrameAuto(true);const b=homeBounds(),ideal=Math.min(viewport.w/b.w,viewport.h/b.h);
 const choice=zoomLevels.reduce((best,z)=>Math.abs(z-ideal)<Math.abs(best-ideal)?z:best,1);
 setZoom(choice);
}
const frameZoomStep=zoomStep;
zoomStep=function(direction){setFrameAuto(false);frameZoomStep(direction);};
$('zoom-value').onclick=()=>{setFrameAuto(false);setZoom(1);};
const fitButton=document.createElement('button');fitButton.id='fit-window';fitButton.textContent='适配';fitButton.title='按浏览器空间选择合适倍率';fitButton.setAttribute('aria-label','适配浏览器画面');fitButton.onclick=()=>{fitBrowserFrame();browserFrame.key='';};$('zoom-minus').after(fitButton);
const frameUpdate=update;
update=function(dt){
 frameUpdate(dt);if(spring.mode!=='play')return;
 browserFrame.auto=journey.extensions.view?.autoFit??true;
 const key=[state.residence,state.scene,viewport.w,viewport.h].join(':');
 if(browserFrame.auto&&key!==browserFrame.key)fitBrowserFrame();browserFrame.key=key;
};
resizeGameViewport();
