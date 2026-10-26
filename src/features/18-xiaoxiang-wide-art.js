// User-supplied finished wide scenes. Native pixels, no texture stretching,
// no duplicate furniture; previous paintings remain source references only.
const xiaoWideVersion=1;
const xiaoWide={
 courtyard:{
  floors:[[240,429,1235,262],[747,365,175,330],[1125,348,245,100]],
  solids:[[374,535,82,48],[330,548,28,24],[466,551,29,26],[352,591,28,22],[446,593,27,22],
   [627,550,115,83],[937,550,105,83],[1197,588,232,76],[1445,596,105,66],
   [687,459,22,26],[960,459,22,26],[1280,480,63,48],[190,495,34,28]],
  rects:{door:[764,365,147,17],gate:[736,688,199,28],tea:[374,535,82,48],bamboo:[1132,388,43,36],well:[1445,596,105,66],
   flowerbed:[627,550,115,83],lotus:[1197,588,232,76],'stone-lamp':[687,459,22,26],rockery:[1280,480,63,48],peach:[263,459,24,20]},
  layers:[
   {poly:[[92,294],[368,282],[470,428],[413,516],[241,563],[102,499]],depth:528},
   {poly:[[1130,120],[1440,120],[1425,360],[1310,423],[1130,408]],depth:426},
   {poly:[[367,507],[461,507],[461,584],[367,584]],depth:584},
   {poly:[[322,537],[363,537],[363,574],[322,574]],depth:575},
   {poly:[[463,538],[501,538],[501,579],[463,579]],depth:580},
   {poly:[[347,581],[383,581],[383,615],[347,615]],depth:616},
   {poly:[[440,583],[478,583],[478,618],[440,618]],depth:619},
   {poly:[[0,656],[1672,656],[1672,941],[0,941]],depth:854}
  ],
  seats:[{x:344,y:571,drawY:575,depth:575,variant:'east'},{x:480,y:574,drawY:575,depth:580,variant:'west'},
   {x:366,y:612,drawY:616,depth:616,variant:'back'},{x:461,y:614,drawY:618,depth:619,variant:'back'}]
 },
 indoor:{
  floors:[[62,213,1545,490],[729,691,214,199]],
  solids:[[184,213,348,164],[184,286,19,92],[505,286,24,92],[540,330,37,40],
   [762,286,242,42],[913,337,33,23],[1077,213,204,76],[1283,254,40,34],[686,270,35,19],
   [906,526,303,62],[1020,426,51,22],[275,527,169,64],
   [210,565,46,25],[458,565,46,25],[321,630,47,29],[324,462,54,18],
   [1342,485,53,32],[1418,517,51,29],[1481,544,62,32],[1548,670,52,31],
   [560,677,44,27],[80,667,48,34],[83,391,50,29],[1528,337,35,32]],
  rects:{exit:[746,817,184,54],bed:[184,302,348,75],desk:[906,526,303,62],chair:[1020,426,51,22],
   shelf:[1077,252,204,37],tea:[275,527,169,64],qin:[762,286,242,42],window:[760,213,200,14],screen:[1418,517,51,29],
   vase:[1548,670,52,31],scroll:[1376,269,66,17],narcissus:[686,270,35,19],rug:[835,630,30,20],
   'lamp-east':[1528,337,35,32],'lamp-entry':[560,677,44,27]},
  layers:[
   {poly:[[178,90],[530,90],[530,379],[178,379]],depth:379},
   {poly:[[535,207],[581,207],[581,377],[535,377]],depth:378},
   {poly:[[756,238],[1008,238],[1008,332],[756,332]],depth:333},
   {poly:[[902,296],[958,296],[958,365],[902,365]],depth:366},
   {poly:[[1068,87],[1286,87],[1286,294],[1068,294]],depth:295},
   {poly:[[1016,350],[1078,350],[1078,453],[1016,453]],depth:454},
   {poly:[[905,417],[1213,417],[1213,599],[905,599]],depth:599},
   {poly:[[270,462],[448,462],[448,602],[270,602]],depth:602},
   {poly:[[323,437],[380,437],[380,484],[323,484]],depth:485},
   {poly:[[208,520],[258,520],[258,595],[208,595]],depth:596},
   {poly:[[455,522],[508,522],[508,597],[455,597]],depth:598},
   {poly:[[318,588],[373,588],[373,665],[318,665]],depth:666},
   {poly:[[1343,326],[1593,381],[1593,578],[1343,519]],depth:579},
   {poly:[[548,555],[618,555],[618,707],[548,707]],depth:708},
   {poly:[[11,704],[661,704],[661,844],[11,844]],depth:845},
   {poly:[[1011,705],[1660,705],[1660,844],[1011,844]],depth:845},
   {poly:[[659,673],[725,673],[725,842],[659,842]],depth:843},
   {poly:[[947,673],[1014,673],[1014,842],[947,842]],depth:843}
  ],
  seats:[{x:234,y:587,drawY:566,depth:597,variant:'east'},
   {x:481,y:587,drawY:566,depth:599,variant:'west'},
   {x:345,y:653,drawY:638,depth:667,variant:'back'},
   {x:353,y:478,drawY:492,depth:486,variant:'front'}],
  study:{x:1047,y:446,drawY:462,depth:455,variant:'study'},
  bed:{x:356,y:341,depth:379.1}
 }
};
landmarks.push({key:'well',label:'看看井栏',text:'井栏静静守在池边，辘轳垂着一线水声。竹影掠过石沿，清凉也留在这一角。'});
residences.xiaoxiang.entry={scene:'courtyard',x:836,y:656,dir:'up'};
const oldXiaoBounds=homeBounds;
homeBounds=function(){return state.residence==='xiaoxiang'?{w:images['xiaoxiang-'+(state.scene==='indoor'?'indoor':'courtyard')+'-wide']?.width||1672,h:941}:oldXiaoBounds();};
function xiaoRect(a){return{x:a[0],y:a[1],w:a[2],h:a[3]};}
function wideFoot(scene,x,y){
 const d=xiaoWide[scene];
 return [[-6,-3],[6,-3],[-6,3],[6,3]].every(([dx,dy])=>d.floors.some(([rx,ry,w,h])=>x+dx>=rx&&x+dx<=rx+w&&y+dy>=ry&&y+dy<=ry+h))&&!d.solids.some(r=>blockedBy(r,x,y));
}
const preWideFoot=validFoot;
validFoot=function(x,y){return state.residence==='xiaoxiang'?wideFoot(state.scene,x,y):preWideFoot(x,y);};
const preWideNearest=nearest;
nearest=function(){
 if(state.residence!=='xiaoxiang')return preWideNearest();
 const d=xiaoWide[state.scene],list=state.scene==='indoor'?roomLandmarks:landmarks;
 const extras=state.scene==='indoor'?d.seats:[];
 return list.filter(n=>d.rects[n.key]).map(n=>({...n,label:n.key==='door'?'进入潇湘馆内室':n.key==='chair'?'坐到书椅上':n.label,
  d:Math.min(rectDistance(state.x,state.y,xiaoRect(d.rects[n.key])),...(n.key==='tea'?extras.map(s=>rectDistance(state.x,state.y,{x:s.x-20,y:s.y-15,w:40,h:22})):[]))}))
  .filter(n=>n.d<=36).sort((a,b)=>a.d-b.d)[0]||null;
};
flowers.splice(0,flowers.length,{x:808,y:486},{x:608,y:511},{x:1049,y:651});
const wideFlower=nearestFlower;
nearestFlower=function(){if(state.residence!=='xiaoxiang')return wideFlower();return state.scene==='indoor'?-1:flowers.findIndex((p,i)=>!state.petals[i]&&Math.hypot(p.x-state.x,p.y-state.y)<30);};
function wideSceneArt(scene){
 const img=images['xiaoxiang-'+scene+'-wide'];ctx.drawImage(img,0,0);
 // Replay only native foreground pixels, with neither crop rescaling nor copies
 // of the old furnishing atlas. The full original image is the base layer.
 const layers=xiaoWide[scene].layers.map(o=>({y:o.depth,draw:()=>{ctx.save();clipScenePolygon(ctx,o.poly);ctx.drawImage(img,0,0);ctx.restore();}}));
 layers.push(...sceneActorLayers(),{y:state.pose?.depth??state.y,draw:drawHero});layers.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 if(scene==='courtyard'){
  drawFlowers();const d=journey.burial.days[dayId()];if(d?.dug){ctx.fillStyle='#76583f';ctx.fillRect(722,635,20,5);ctx.fillStyle='#ac8764';ctx.fillRect(725,635,10,2);}
 }
 const night=journey.clock.slot>=9||journey.clock.slot<3;
 if(night){ctx.fillStyle='rgba(20,32,63,.16)';ctx.fillRect(0,0,img.width,img.height);
  const lamps=scene==='indoor'?[[584,601],[1543,294]]:[[697,456],[970,456]];
  for(const[x,y]of lamps){const g=ctx.createRadialGradient(x,y,1,x,y,55);g.addColorStop(0,'#ffd07b45');g.addColorStop(1,'#ffd07b00');ctx.fillStyle=g;ctx.fillRect(x-55,y-55,110,110);}
 }
}
drawOriginalIndoorWorld=function(){wideSceneArt('indoor');};
drawXiaoxiangCourtyardWorld=function(){wideSceneArt('courtyard');};
const preWideSit=sitDown;
sitDown=function(chair=false){
 if(state.residence!=='xiaoxiang'){preWideSit(chair);return;}
 const d=xiaoWide.indoor,seat=chair?d.study:[...d.seats].sort((a,b)=>Math.hypot(state.x-a.x,state.y-a.y)-Math.hypot(state.x-b.x,state.y-b.y))[0];
 occupySeat(seat,chair?'chair':'wide-tea');seatedMenu();
};
lieDown=function(){const p=xiaoWide.indoor.bed;takePose('lying','bed',p.x,p.y,p.depth);restMenu();spring.onClose=standUp;spring.onE=closeDialogue;};
for(const o of objectOptions.bed||[])if(o.label==='躺下')o.run=lieDown;
for(const o of objectOptions.tea||[])if(o.scene==='courtyard'&&o.label==='坐下')o.run=()=>{
 const s=[...xiaoWide.courtyard.seats].sort((a,b)=>Math.hypot(state.x-a.x,state.y-a.y)-Math.hypot(state.x-b.x,state.y-b.y))[0];
 occupySeat(s,'courtyard-stool');showPanel('石桌旁','坐一坐，且听这一庭竹声。',[choice('品一盏茶',()=>drinkTea()),choice('起身',()=>{closeDialogue();standUp();})],{portrait:false,onE:()=>{closeDialogue();standUp();}});
};
const preWideScene=changeRoomScene;
changeRoomScene=function(scene){
 if(state.residence!=='xiaoxiang'){preWideScene(scene);return;}
 closeDialogue();standUp();const data=homeState();
 if(scene==='indoor'){data.doors.xiaoxiang=homeSpot();state.scene='indoor';state.x=836;state.y=807;state.dir='up';}
 else{const p=data.doors.xiaoxiang||{x:836,y:400,dir:'down'};state.scene='courtyard';state.x=p.x;state.y=p.y;state.dir=p.dir;if(!validFoot(state.x,state.y)){state.x=836;state.y=400;}}
 keys.clear();state.moving=false;roomUI();resetView();saveProgress(true);
};
// Upgrade only coordinates in old saves; all collections, time and memories stay.
function wideSavedSpot(p){
 if(!p)return p;const indoor=p.scene==='indoor';
 const landmarks=indoor?[[226,278,356,393],[592,394,1056,615],[666,190,1180,308],[224,435,356,625],[590,283,1047,475],[555,236,890,350],[480,552,836,807]]:
  [[480,224,836,400],[251,328,410,616],[767,348,1120,443],[340,350,725,650],[480,500,836,656],[695,390,1175,650]];
 const near=[...landmarks].sort((a,b)=>Math.hypot(p.x-a[0],p.y-a[1])-Math.hypot(p.x-b[0],p.y-b[1]))[0];
 let x=near[2],y=near[3];if(!wideFoot(p.scene,x,y)){
  search:for(let r=8;r<180;r+=4)for(let i=0;i<32;i++){const xx=x+Math.cos(i*Math.PI/16)*r,yy=y+Math.sin(i*Math.PI/16)*r;if(wideFoot(p.scene,xx,yy)){x=xx;y=yy;break search;}}
 }
 return {...p,x,y};
}
const preWideSave=saveProgress;
saveProgress=function(quiet=false){journey.extensions.xiaoxiangArt=xiaoWideVersion;return preWideSave(quiet);};
const preWideRestore=restoreGame;
restoreGame=function(v){
 const copy=structuredClone(v),j=copy.journey;
 if(!j.extensions)j.extensions={};
 if(j.extensions.xiaoxiangArt!==xiaoWideVersion){
  const r=j.extensions.residences;
  if((r?.current||'xiaoxiang')==='xiaoxiang')Object.assign(copy,wideSavedSpot(copy));
  if(r?.last?.xiaoxiang)r.last.xiaoxiang=wideSavedSpot(r.last.xiaoxiang);
  if(r?.doors?.xiaoxiang)r.doors.xiaoxiang=wideSavedSpot({...r.doors.xiaoxiang,scene:'courtyard'});
  j.extensions.xiaoxiangArt=xiaoWideVersion;
 }
 preWideRestore(copy);
 if(state.residence==='xiaoxiang'&&!validFoot(state.x,state.y)){state.x=836;state.y=state.scene==='indoor'?807:656;}
 resetView();
};
const preWideNew=newGame;
newGame=function(){if(!preWideNew())return false;state.x=836;state.y=807;roomUI();saveProgress(true);resetView();return true;};
$('new-spring').onclick=()=>{if(newGame()){setFrameAuto(true);fitBrowserFrame();}};
const preWideUI=roomUI;
roomUI=function(){preWideUI();if(state.residence==='xiaoxiang'){
 document.querySelector('.below p').innerHTML=state.scene==='indoor'?'林黛玉的居所<small>左上床榻 · 左下茶桌 · 右侧书案 · 北侧古琴与书架</small>':'林黛玉的庭院<small>一庭竹影，半卷诗书。正房门口按 E 进入内室 · 院门暂闭</small>';
 document.querySelector('.controlbar').style.display='none';$('prompt').style.top='';$('prompt').style.bottom='';
}};
const preWideUpdate=update;
update=function(dt){preWideUpdate(dt);if(state.residence==='xiaoxiang'){
 document.querySelector('.controlbar').style.display='none';$('prompt').style.top='';$('prompt').style.bottom='';southWorld.outside=false;
}};
