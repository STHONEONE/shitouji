// Residence maps use the supplied finished artwork at native world dimensions.
state.residence='xiaoxiang';
const residences={
 xiaoxiang:{name:'潇湘馆',entry:{scene:'courtyard',x:480,y:500,dir:'up'},indoor:true},
 yihong:{name:'怡红院',entry:{scene:'courtyard',x:836,y:1250,dir:'up'},indoor:true,houseY:350,houseScale:.65,gateY:1495,gateOval:[836,1446,105,78],
  props:[
   {key:'door',label:'进入正房',rect:{x:768,y:927,w:136,h:20},text:'正房的门就在阶前，花影落在门旁。'},
   {key:'gate',label:'看看院门',rect:{x:728,y:1437,w:216,h:65},text:'院门合着，墙头花枝仍轻轻摇动。今日且在院中停留。'},
   {key:'west-wing',label:'看看西厢房',rect:{x:150,y:977,w:150,h:18},text:'西厢房门扇合着，檐边有几枝花。屋里静静的，便不进去打扰。'},
   {key:'east-wing',label:'看看东厢房',rect:{x:1407,y:990,w:146,h:18},text:'东厢房的门还关着，阶下石板留着一点苔色。'},
   {key:'stone-tea',label:'看看石桌',rect:{x:512,y:1182,w:111,h:51},text:'海棠花下有一方石桌，几只石凳散在桌边。花落时，桌上也沾着一点春色。',action:'tea'},
   {key:'haitang',label:'观海棠',rect:{x:345,y:1168,w:32,h:22},text:'海棠枝叶舒展，花色深浅相映。此处的红与绿，各有各的生意。'},
   {key:'banana',label:'听芭蕉',rect:{x:1180,y:1160,w:44,h:24},text:'芭蕉叶展开，一层叠着一层。无雨的时候，也听得见叶间轻风。'},
   {key:'flower-arch',label:'看看花架',rect:{x:1400,y:1224,w:120,h:16},text:'花架下留着小径，绕过花枝，便能回到正房阶前。'}
  ],solids:[[512,1182,111,51],[476,1232,34,20],[625,1230,34,20],[548,1252,34,20],[345,1168,32,22],[1180,1160,44,24],[1390,1218,18,26],[1523,1218,18,26],[150,977,150,18],[1407,990,146,18]],
  masks:[{poly:[[178,204],[425,204],[500,360],[447,479],[345,507],[204,455],[142,360]],depth:1207},{poly:[[1070,226],[1288,205],[1383,370],[1303,491],[1144,495],[1044,405]],depth:1195}]
 },
 hengwu:{name:'蘅芜苑',entry:{scene:'courtyard',x:836,y:1160,dir:'up'},indoor:false,houseY:390,houseScale:.65,gateY:1432,gateOval:[836,1356,119,92],
  props:[
   {key:'door',label:'看看正房',rect:{x:768,y:927,w:136,h:20},text:'正房门轻掩着，今日且先在院中停留。'},
   {key:'gate',label:'看看院门',rect:{x:714,y:1390,w:244,h:64},text:'院门合着，花草的清香却不因门扇而隔断。'},
   {key:'west-wing',label:'看看西厢房',rect:{x:123,y:958,w:178,h:18},text:'西厢房门扇合着，檐外垂下一串细叶。'},
   {key:'east-wing',label:'看看东厢房',rect:{x:1340,y:970,w:178,h:18},text:'东厢房还关着，绕过阶前便是院中的小径。'},
   {key:'rock',label:'观山石',rect:{x:410,y:1134,w:59,h:27},text:'山石玲珑，草木从石隙间长出。香气并不浓烈，停久了却觉得清远。'},
   {key:'herbs',label:'闻香草',rect:{x:575,y:1100,w:48,h:22},text:'异草依着石边生长，细叶间有一缕幽香。只在这里站一站，心也静了些。'},
   {key:'white-tree',label:'观白花',rect:{x:1205,y:1116,w:36,h:26},text:'枝上的白花疏疏落落，风吹过，叶影便在地上挪动。'},
   {key:'lamp',label:'看看石灯',rect:{x:316,y:1140,w:35,h:22},text:'石灯在山石旁，照着绕行的小径。',action:'lamp'}
  ],solids:[[410,1134,59,27],[575,1100,48,22],[1205,1116,36,26],[316,1140,35,22],[123,958,178,18],[1340,970,178,18]],
  masks:[{poly:[[320,285],[512,268],[615,352],[601,461],[465,481],[330,420]],depth:1170},{poly:[[1040,205],[1270,205],[1384,355],[1325,454],[1170,460],[1075,370]],depth:1150}]
 }
};
const yihongIndoor={
 solids:[[692,255,310,70],[276,263,178,30],[204,525,278,60],[317,383,50,22],[300,619,66,20],[1250,595,132,48],[1207,617,22,16],[1304,702,26,16],[1466,632,63,30],[1090,335,62,26],[1504,300,60,30]],
 props:[
  {key:'exit',label:'回到庭院',rect:{x:744,y:827,w:188,h:57},text:'门外仍是来时的庭院。'},
  {key:'bed',label:'看看床榻',rect:{x:692,y:255,w:310,h:70},text:'床帐已经拢好，素色被褥铺得平整。',action:'bed'},
  {key:'desk',label:'看看书案',rect:{x:204,y:525,w:278,h:60},text:'书卷摊在案上，纸与笔各有位置。窗光移到这里，恰好照见一行字。',action:'desk'},
  {key:'chair',label:'坐到书椅上',rect:{x:317,y:383,w:50,h:22},text:'椅背靠着书案，坐下便能翻书。',action:'chair'},
  {key:'tea',label:'看看茶桌',rect:{x:1250,y:595,w:132,h:48},text:'茶盏留在桌边，屏风隔出了一处安静地方。',action:'tea'},
  {key:'shelf',label:'翻看书架',rect:{x:276,y:263,w:178,h:30},text:'书册按次序收在架上，随手取下一卷，也可慢慢读。',action:'books'},
  {key:'screen',label:'看看屏风',rect:{x:1466,y:632,w:63,h:30},text:'屏风略略折起，隔而不闭，花木纹样在光里更显清楚。'},
  {key:'vase',label:'看看瓶花',rect:{x:1504,y:665,w:65,h:50},text:'瓶中花枝斜出，静静照应着窗外的春光。'}
 ],layers:[
  {poly:[[688,20],[1005,20],[1005,340],[685,340]],depth:340},
  {poly:[[270,118],[455,118],[455,300],[270,300]],depth:300},
  {poly:[[202,410],[480,410],[485,597],[197,597]],depth:597},
  {poly:[[310,335],[372,335],[372,409],[310,409]],depth:409},
  {poly:[[1236,500],[1388,500],[1388,669],[1243,669]],depth:669},
  {poly:[[1400,416],[1494,440],[1576,600],[1570,688],[1458,651],[1400,620]],depth:675},
  {poly:[[1053,216],[1179,139],[1179,310],[1060,381]],depth:365}
 ]
};
function homeState(){return journey.extensions.residences||(journey.extensions.residences={current:state.residence||'xiaoxiang',last:{},doors:{}});}
function homeSpot(){return {scene:state.scene,x:state.pose?.returnX??state.x,y:state.pose?.returnY??state.y,dir:state.dir};}
function activeHome(){return residences[state.residence]||residences.xiaoxiang;}
function homeBounds(){return state.residence==='xiaoxiang'?{w:960,h:state.scene==='indoor'?600:650}:{w:1672,h:state.scene==='indoor'?941:1545};}
const indoorLayouts={yihong:yihongIndoor};
function activeIndoor(){return indoorLayouts[state.residence];}
function homeRects(){return state.scene==='indoor'?activeIndoor().solids:activeHome().solids;}
function blockedBy(rect,x,y){return x+6>rect[0]&&x-6<rect[0]+rect[2]&&y+3>rect[1]&&y-3<rect[1]+rect[3];}
const homesValid=validFoot;
validFoot=function(x,y){
 if(state.residence==='xiaoxiang')return !(state.scene==='courtyard'&&y>545)&&homesValid(x,y);
 const h=activeHome();
 if(state.scene==='indoor'){
  if(!h.indoor)return false;
  const floor=(x>=90&&x<=1585&&y>=305&&y<=740)||(x>=744&&x<=940&&y>=720&&y<=912);
  return floor&&!homeRects().some(r=>blockedBy(r,x,y));
 }
 const floor=x>=94&&x<=1578&&y>=944&&y<=h.gateY-9;
 if(!floor||homeRects().some(r=>blockedBy(r,x,y)))return false;
 const gate=h.props.find(p=>p.key==='gate').rect;
 return !blockedBy([gate.x,gate.y,gate.w,gate.h],x,y);
};
const homesNearest=nearest;
nearest=function(){
 if(state.residence==='xiaoxiang')return homesNearest();
 const props=state.scene==='indoor'?activeIndoor().props:activeHome().props;
 return props.map(p=>{const extra=state.scene==='indoor'?(p.action==='tea'?activeIndoor().teaRects:p.action==='desk'?activeIndoor().deskSeatRects:null):null;return {...p,d:Math.min(...[p.rect,...(extra||[])].map(r=>rectDistance(state.x,state.y,r)))};}).filter(p=>p.d<=36).sort((a,b)=>a.d-b.d)[0]||null;
};
const homesFlower=nearestFlower;
nearestFlower=function(){return state.residence==='xiaoxiang'?homesFlower():-1;};
function switchResidence(id){
 if(spring.mode!=='play'||!residences[id])return;
 closeDialogue();standUp();const data=homeState();data.last[state.residence]=homeSpot();data.current=id;state.residence=id;
 const spot=data.last[id]||residences[id].entry;state.scene=spot.scene;state.x=spot.x;state.y=spot.y;state.dir=spot.dir;keys.clear();state.moving=false;
 if(!validFoot(state.x,state.y)){const p=residences[id].entry;state.scene=p.scene;state.x=p.x;state.y=p.y;state.dir=p.dir;}
 roomUI();saveProgress(true);if(typeof resetView==='function')resetView();
}
function openResidences(){showPanel('园中住所','择一处停留。来时的脚步与春日随记都会记着。',Object.entries(residences).map(([id,h])=>choice(h.name,()=>switchResidence(id))).concat(choice('留在此处',closeDialogue)),{kind:'menu',portrait:false});}
// All homes share the same enter/return rule, including original position/facing.
changeRoomScene=function(scene){
 closeDialogue();standUp();const h=activeHome(),data=homeState();
 if(scene==='indoor'){
  if(!h.indoor){observe('房门轻掩，今日且在庭中停留。','正房');return;}
  data.doors[state.residence]=homeSpot();state.scene='indoor';state.x=state.residence==='xiaoxiang'?480:836;state.y=state.residence==='xiaoxiang'?500:812;state.dir='up';
 }else{
  const p=data.doors[state.residence]||(state.residence==='xiaoxiang'?{x:480,y:244,dir:'down'}:{x:836,y:956,dir:'down'});
  state.scene='courtyard';state.x=p.x;state.y=p.y;state.dir=p.dir;
 }
 keys.clear();state.moving=false;roomUI();if(typeof resetView==='function')resetView();if(spring.mode==='play')saveProgress(true);
};
function homeSeated(kind){
 const indoor=state.scene==='indoor',study=kind==='chair';
 let x,y;if(study){x=342;y=405;}else if(indoor){const seats=[[1219,628],[1315,711]];[x,y]=seats.sort((a,b)=>Math.hypot(state.x-a[0],state.y-a[1])-Math.hypot(state.x-b[0],state.y-b[1]))[0];}else{x=492;y=1250;}
 takePose('seated','residence-seat',x,y,y+.1);
 showPanel(study?'坐在书案旁':'坐下歇一歇',study?'书就在手边，今日不必急着读完。':'风过花叶，坐一会儿也好。',[
  ...(study?[choice('写一页诗',writePoem),choice('翻读诗笺',openLibrary)]:[choice('品一盏茶',()=>drinkTea()),choice('歇一阵',()=>{advanceTime(1,'小憩');closeDialogue();standUp();})]),
  choice('起身',()=>{closeDialogue();standUp();})],{portrait:false,onE:()=>{closeDialogue();standUp();}});
}
function homeObject(n){
 const lines={morning:'晨光还留在窗前。',day:'日光在木纹与花叶间慢慢移动。',dusk:'暮色渐深，灯边的光也暖了些。',night:'灯下静听，风声便更清楚了。'};
 let opts=[];
 if(n.action==='desk')opts=[choice('写一页诗',writePoem),choice('翻读诗笺',openLibrary),choice('坐到案前',()=>homeSeated('desk-front'))];
 if(n.action==='books')opts=[choice('翻读诗笺',openLibrary)];
 if(n.action==='tea')opts=[choice('品一盏茶',()=>drinkTea()),choice('坐下',()=>homeSeated('tea'))];
 if(n.action==='bed')opts=[choice('躺下',()=>{takePose('lying','residence-bed',836,320,341);restMenu();spring.onClose=standUp;spring.onE=closeDialogue;})];
 if(n.action==='lamp')opts=[choice('照看灯芯',()=>{journey.activities.hengwuLamp=true;saveProgress(true);observe('灯芯已照看妥当，入夜时便留一线暖光。','石灯');})];
 showPanel(n.label.replace(/^(看看|观|闻)/,''),n.text+'\n'+lines[timeBand()],opts.concat(choice('继续游园',closeDialogue)),{kind:'menu',portrait:false});
}
const homesInteract=interact;
interact=function(){
 if(state.residence==='xiaoxiang'||state.pose||state.dialogue){homesInteract();return;}
 if(spring.mode!=='play'||!state.ready)return;const n=nearest();if(!n)return;
 if(n.key==='exit'){changeRoomScene('courtyard');return;}
 if(n.key==='door'&&activeHome().indoor){changeRoomScene('indoor');return;}
 if(n.action==='chair'){homeSeated('chair');return;}homeObject(n);
};
const homesPick=pickFlower;
pickFlower=function(){if(state.residence==='xiaoxiang')homesPick();else interact();};
const homesSave=saveProgress;
saveProgress=function(quiet=false){const data=homeState();data.current=state.residence;data.last[state.residence]=homeSpot();return homesSave(quiet);};
const homesRestore=restoreGame;
restoreGame=function(v){state.residence=residences[v.journey?.extensions?.residences?.current]?v.journey.extensions.residences.current:'xiaoxiang';homesRestore(v);if(!validFoot(state.x,state.y)){const p=activeHome().entry;state.scene=p.scene;state.x=p.x;state.y=p.y;state.dir=p.dir;}roomUI();if(typeof resetView==='function')resetView();};
const homesUI=roomUI;
roomUI=function(){homesUI();$('toast').classList.remove('on');$('toast').hidden=true;toastDeadline=0;document.title=activeHome().name+(state.scene==='indoor'?' · 正房':' · 庭院')+'｜石头记';if(state.residence!=='xiaoxiang'){document.querySelector('.place').textContent=activeHome().name+(state.scene==='indoor'?' · 正房':'');document.querySelector('.below p').innerHTML='林黛玉 · '+activeHome().name+'<small>WASD / 方向键行走 · E 调查 · 右侧切换住所 · 院门暂闭</small>';}};
function clipScenePolygon(g,poly,offset=0){g.beginPath();poly.forEach(([x,y],i)=>i?g.lineTo(x,y+offset):g.moveTo(x,y+offset));g.closePath();g.clip();}
function closedGate(image,source,oval){
 const[x,y,rx,ry]=oval;ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.clip();
 const[sx,sy,sw,sh]=source,s=Math.max(2*rx/sw,2*ry/sh);ctx.drawImage(image,sx,sy,sw,sh,x-sw*s/2,y-sh*s/2,sw*s,sh*s);ctx.restore();
}
function drawResidenceWorld(){
 const h=activeHome(),id=state.residence;
 if(state.scene==='indoor'){
  const img=images[state.residence+'-indoor'];ctx.drawImage(img,0,0);const layers=activeIndoor().layers.map(o=>({y:o.depth,draw:()=>{ctx.save();clipScenePolygon(ctx,o.poly);ctx.drawImage(img,0,0);ctx.restore();}}));
  layers.push(...sceneActorLayers(),{y:state.pose?.depth??state.y,draw:drawHero});layers.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 }else{
  const img=images[id+'-courtyard'];
  for(let y=0;y<1641;y+=120)for(let x=0;x<1672;x+=120)ctx.drawImage(southSprites.grass[(x/120+y/120)%3],x,y);
  ctx.save();ctx.beginPath();ctx.rect(0,700,1672,941);ctx.rect(450,700,780,230);ctx.clip('evenodd');ctx.drawImage(img,0,700);ctx.restore();
  ctx.drawImage(images[id+'-house'],(1672-1672*h.houseScale)/2,h.houseY,1672*h.houseScale,941*h.houseScale);
  // Independent wings are cropped from this home's own artwork, never copied
  // from the other residence. Their doors stay closed.
  const wings=id==='yihong'?[[99,79,239,244],[1368,68,235,267]]:[[94,18,254,281],[1310,30,268,270]];
  for(const[x,y,w,hh]of wings)ctx.drawImage(img,x,y,w,hh,x,y+700,w,hh);
  closedGate(images[id+'-house'],id==='yihong'?[736,500,210,205]:[737,485,210,195],h.gateOval);
  const actors=h.masks.map(o=>({y:o.depth,draw:()=>{ctx.save();clipScenePolygon(ctx,o.poly,700);ctx.drawImage(img,0,700);ctx.restore();}}));
  actors.push({y:h.gateY,draw:()=>{const sy=id==='yihong'?563:458;ctx.save();ctx.beginPath();ctx.rect(0,sy+700,1672,941-sy);ctx.ellipse(...h.gateOval,0,0,Math.PI*2);ctx.clip('evenodd');ctx.drawImage(img,0,700);ctx.restore();}});
  actors.push(...sceneActorLayers(),{y:state.pose?.depth??state.y,draw:drawHero});actors.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 }
 const slot=journey.clock.slot;if(slot>=9||slot<3){const b=homeBounds();ctx.fillStyle='rgba(18,29,52,.18)';ctx.fillRect(0,0,b.w,b.h);}
}
