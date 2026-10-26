// User-supplied Hengwu room; no placeholder or reused Yihong room image.
residences.hengwu.indoor=true;
const hengwuIndoor={
 solids:[[695,260,290,72],[675,270,20,76],[985,270,20,76],[755,350,173,48],[267,303,143,25],[230,540,340,69],[405,439,66,23],[342,633,62,20],[1141,575,177,55],[1081,609,30,18],[1344,608,30,18],[1206,671,33,18],[1230,335,65,28],[1325,405,80,24],[1445,498,66,32],[1535,562,55,24],[136,492,24,30]],
 props:[
  {key:'exit',label:'回到庭院',rect:{x:744,y:827,w:188,h:57},text:'门外是清香微起的庭院。'},
  {key:'bed',label:'看看床榻',rect:{x:675,y:260,w:330,h:138},text:'素色床帐拢在两旁，床前脚踏留得平稳。',action:'bed'},
  {key:'desk',label:'看看书案',rect:{x:230,y:540,w:340,h:69},text:'案上书卷与茶盏收得整齐，瓶中菊花静静映着窗光。',action:'desk'},
  {key:'chair',label:'坐到书椅上',rect:{x:405,y:439,w:66,h:23},text:'书椅安放在案后，坐下便能慢慢翻书。',action:'chair'},
  {key:'tea',label:'看看茶桌',rect:{x:1141,y:575,w:177,h:55},text:'圆桌边留着几只矮凳，茶盏安安静静地放着。',action:'tea'},
  {key:'shelf',label:'翻看书架',rect:{x:267,y:303,w:143,h:25},text:'常读的书放在架上，近手的一卷可以随时翻开。',action:'books'},
  {key:'screen',label:'看看屏风',rect:{x:1445,y:498,w:66,h:32},text:'竹纹屏风隔开一角，风从窗下过来，屋里仍很清静。'},
  {key:'lamp',label:'看看灯',rect:{x:136,y:492,w:24,h:30},text:'灯安放在窗边，照着书页，也照着脚下的来路。'},
  {key:'vase',label:'看看盆栽',rect:{x:1535,y:562,w:55,h:24},text:'花叶疏疏，在木色与留白之间添了一点清气。'}
 ],layers:[
  {poly:[[675,20],[1005,20],[1005,346],[675,346]],depth:346},
  {poly:[[750,331],[932,331],[932,405],[750,405]],depth:405},
  {poly:[[263,164],[410,164],[410,333],[263,333]],depth:333},
  {poly:[[230,450],[573,450],[573,613],[230,613]],depth:613},
  {poly:[[395,385],[480,385],[480,463],[395,463]],depth:463},
  {poly:[[328,563],[423,563],[423,658],[328,658]],depth:658},
  {poly:[[1134,475],[1327,475],[1327,641],[1134,641]],depth:641},
  {poly:[[1223,156],[1518,294],[1518,535],[1223,365]],depth:535}
 ],seats:{study:{x:440,y:462,depth:464,variant:'study'},front:{x:374,y:655,drawY:614,depth:659,variant:'back'},tea:[{x:1097,y:634,drawY:606,depth:634,variant:'east'},{x:1360,y:634,drawY:605,depth:634,variant:'west'},{x:1226,y:695,drawY:670,depth:695,variant:'back'}]},bedPose:{x:836,y:330,depth:347}
};
indoorLayouts.hengwu=hengwuIndoor;
hengwuIndoor.teaRects=[{x:1081,y:609,w:30,h:18},{x:1344,y:608,w:30,h:18},{x:1206,y:671,w:33,h:18}];
hengwuIndoor.deskSeatRects=[{x:342,y:633,w:62,h:20}];
// Bed collision includes the mattress supports, both front posts and the
// independent footstep. Walking never uses the lie-down bypass.
yihongIndoor.solids.push([686,270,18,72],[986,270,18,72],[755,327,180,35]);
yihongIndoor.props.find(p=>p.key==='bed').rect.h=107;
yihongIndoor.layers[0].depth=346;
yihongIndoor.layers.push({poly:[[753,311],[936,311],[936,364],[753,364]],depth:364});
yihongIndoor.seats={study:{x:342,y:405,depth:410,variant:'study'},front:{x:334,y:648,drawY:624,depth:650,variant:'back'},tea:[{x:1219,y:628,drawY:605,depth:628,variant:'east'},{x:1315,y:711,drawY:695,depth:711,variant:'back'}]};
yihongIndoor.bedPose={x:836,y:320,depth:347};
yihongIndoor.teaRects=[{x:1207,y:617,w:22,h:16},{x:1304,y:702,w:26,h:16}];
yihongIndoor.deskSeatRects=[{x:300,y:619,w:66,h:20}];
roomSolids.push({x:121,y:274,w:211,h:10},{x:117,y:198,w:12,h:80},{x:325,y:198,w:12,h:80});
const seatSprites={};
const seatPrepare=prepareHeroSprites;
prepareHeroSprites=function(){
 seatPrepare();const img=images['daiyu-seat-directions'],cw=Math.floor(img.width/3),ch=Math.floor(img.height/2),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);const a=g.getImageData(0,0,c.width,c.height).data;
 for(const[name,col,row,height]of [['front',0,0,74],['back',1,0,74],['east',2,0,74],['west',0,1,74],['study',1,1,80],['low',2,1,68]]){
  let l=cw,t=ch,r=0,b=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(a[((row*ch+y)*c.width+col*cw+x)*4+3]>40){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  if(r<=l||b<=t)throw new Error('坐姿素材为空：'+name);
  const s=document.createElement('canvas');s.height=height;s.width=Math.round((r-l+1)*height/(b-t+1));const sg=s.getContext('2d');sg.imageSmoothingEnabled=false;sg.drawImage(img,col*cw+l,row*ch+t,r-l+1,b-t+1,0,0,s.width,s.height);seatSprites[name]=s;
 }
};
function occupySeat(seat,id){takePose('seated',id,seat.x,seat.y,seat.depth??seat.y+.1);state.pose.variant=seat.variant;state.pose.drawY=seat.drawY??seat.y;}
const seatedHero=drawHero;
drawHero=function(){
 if(state.pose?.kind==='seated'&&spring.mode==='play'){
  const img=seatSprites[state.pose.variant]||seatSprites.front;if(img)ctx.drawImage(img,Math.round(state.x-img.width/2),Math.round((state.pose.drawY??state.y)-img.height));return;
 }seatedHero();
};
sitDown=function(chair=false){
 if(chair)occupySeat({x:590,y:284,depth:284,variant:'study'},'chair');
 else{
  const slots=teaStools.map((s,i)=>({...s,drawY:[382,380,427][i],depth:435.1,variant:['east','west','back'][i]}));const s=slots.sort((a,b)=>Math.hypot(state.x-a.x,state.y-a.y)-Math.hypot(state.x-b.x,state.y-b.y))[0];occupySeat(s,s.id);
 }seatedMenu();
};
homeSeated=function(kind){
 const indoor=state.scene==='indoor',study=kind==='chair'||kind==='desk-front';let seat;
 if(indoor){const seats=activeIndoor().seats;seat=kind==='chair'?seats.study:kind==='desk-front'?seats.front:[...seats.tea].sort((a,b)=>Math.hypot(state.x-a.x,state.y-a.y)-Math.hypot(state.x-b.x,state.y-b.y))[0];}
 else seat={x:492,y:1250,drawY:1241,depth:1250,variant:'low'};
 occupySeat(seat,'residence-seat');
 showPanel(study?'坐在书案旁':'坐下歇一歇',study?'书就在手边，今日不必急着读完。':'风过花叶，坐一会儿也好。',[
  ...(study?[choice('写一页诗',writePoem),choice('翻读诗笺',openLibrary)]:[choice('品一盏茶',()=>drinkTea()),choice('歇一阵',()=>{advanceTime(1,'小憩');closeDialogue();standUp();})]),
  choice('起身',()=>{closeDialogue();standUp();})],{portrait:false,onE:()=>{closeDialogue();standUp();}});
};
const seatedObject=homeObject;
homeObject=function(n){
 if(n.action!=='bed'){seatedObject(n);return;}
 showPanel('床榻',n.text,[choice('躺下',()=>{const p=activeIndoor().bedPose;takePose('lying','residence-bed',p.x,p.y,p.depth);restMenu();spring.onClose=standUp;spring.onE=closeDialogue;}),choice('继续游园',closeDialogue)],{kind:'menu',portrait:false});
};
objectOption('tea','坐下',()=>{const s=[{x:128,y:332,depth:333,variant:'low'},{x:218,y:337,depth:338,variant:'west'},{x:176,y:348,depth:349,variant:'back'}].sort((a,b)=>Math.hypot(state.x-a.x,state.y-a.y)-Math.hypot(state.x-b.x,state.y-b.y))[0];occupySeat(s,'courtyard-stool');showPanel('石桌旁','坐一坐，且听这一庭竹声。',[choice('品一盏茶',()=>drinkTea()),choice('起身',()=>{closeDialogue();standUp();})],{portrait:false,onE:()=>{closeDialogue();standUp();}});});
objectOptions.tea[objectOptions.tea.length-1].scene='courtyard';
