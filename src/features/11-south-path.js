// Stage 1a: courtyard and south path share world coordinates and one scene.
const southWorld={width:960,height:1580,cameraY:0,previousScene:null,visibleProps:0};
const southSprites={};
const southWalkable=[{x:437,y:555,w:104,h:92},{x:16,y:610,w:928,h:900}];
const southObjects=[
 {id:'south-bamboo',name:'路边竹丛',art:'bamboo',x:357,y:714,w:104,h:126,body:[-15,-18,30,18],tree:true,text:'粉墙外仍有竹丛相伴。风过竹叶，院里院外的声音原是连着的。'},
 {id:'south-lamp',name:'石灯',art:'lamp',x:410,y:777,w:35,h:65,body:[-9,-12,18,12],text:'石灯立在路沿，底座有些青苔。白日看得清纹理，入夜便留下一点暖光。'},
 {id:'south-flowers',name:'花坛',art:'flowerbed',x:575,y:843,w:102,h:70,body:[-42,-33,84,33],text:'花坛沿石板路留出了一段空隙。白花与粉花相间，落下的花瓣便停在草叶上。'},
 {id:'south-bench',name:'石凳',art:'bench',x:375,y:935,w:106,h:60,body:[-43,-18,86,18],text:'石凳旁可以略坐一阵。回头还看得见来时的路，竹声随着风慢慢近了又远。'},
 {id:'south-wildflowers',name:'野花丛',art:'wildflowers',x:580,y:1026,w:79,h:63,body:[-20,-13,40,13],text:'路边的小花无须人照看，春风来时，便也开得自在。草间藏着一片浅粉色花瓣。'},
 {id:'south-peach',name:'桃树',art:'peach',x:345,y:1166,w:143,h:155,body:[-14,-19,28,19],tree:true,text:'桃枝向路边斜来，花影落在石缝间。今日的风很轻，枝上的花还愿意多停一会儿。'},
 {id:'south-lamp-far',name:'石灯',art:'lamp',x:550,y:1211,w:35,h:65,body:[-9,-12,18,12],text:'又一盏石灯守在路旁。即使独自散步，夜里也能循着暖光走回院中。'},
 {id:'south-willow',name:'柳树',art:'willow',x:628,y:1348,w:152,h:158,body:[-15,-19,30,19],tree:true,text:'细柳垂在路旁，叶子一层浅、一层深。风一动，枝梢便轻轻擦过春光。'},
 {id:'south-bamboo-far',name:'竹丛',art:'bamboo-small',x:336,y:1455,w:94,h:112,body:[-14,-16,28,16],tree:true,text:'竹影又在前面聚拢。今日走到这里，回去读一页诗，或再听一阵风，都由自己。'},
 {id:'south-border-bamboo',name:'夹路翠竹',art:'bamboo',x:685,y:730,w:104,h:126,body:[-15,-18,30,18],tree:true,text:'翠竹夹着小径，石缝间有一点苔色。隔着竹叶，仍听得见院中风声。'},
 {id:'south-border-peach',name:'桃枝',art:'peach',x:264,y:948,w:143,h:155,body:[-14,-19,28,19],tree:true,text:'几枝桃花从草间探来。并不急着走远，停在这里，也是一段春光。'},
 {id:'south-border-willow',name:'柳影',art:'willow',x:697,y:1080,w:152,h:158,body:[-15,-19,30,19],tree:true,text:'柳影一丝一丝垂到地上，路就在浓淡之间。绕过树干，便又回到石板旁。'},
 {id:'south-border-bamboo-far',name:'路侧竹丛',art:'bamboo',x:261,y:1322,w:104,h:126,body:[-15,-18,30,18],tree:true,text:'几竿竹子守着路边，风来时也只轻轻作声。走远了，回去的路却并不难寻。'},
 {id:'south-end-flowers',name:'路尽花丛',art:'flowerbed',x:485,y:1552,w:102,h:70,body:[-42,-33,84,33],text:'石板路在花木间收拢，花香里还留着一阵竹风。转身沿来路走，便能回到潇湘馆。'}
];
for(const p of southObjects)landmarks.push({key:p.id,x:p.x,y:p.y,radius:36,label:'看看'+p.name,text:p.text});
const gateLandmark=landmarks.find(p=>p.key==='gate');
gateLandmark.label='在月洞门边停留';gateLandmark.text='月洞门内外接着同一条路。往南可以沿石板路散步，回头便是潇湘馆的粉墙与竹影。';
function southRect(p){const[dx,dy,w,h]=p.body;return{x:p.x+dx,y:p.y+dy,w,h};}
const southInteractionRects=interactionRects;
interactionRects=function(n){const p=state.scene==='courtyard'&&southObjects.find(p=>p.id===n.key);return p?[southRect(p)]:southInteractionRects(n);};
const southValidFoot=validFoot;
validFoot=function(x,y){
 if(state.scene!=='courtyard')return southValidFoot(x,y);
 const inSouth=[[-6,-3],[6,-3],[-6,3],[6,3]].every(([dx,dy])=>southWalkable.some(r=>x+dx>=r.x&&x+dx<=r.x+r.w&&y+dy>=r.y&&y+dy<=r.y+r.h));
 if(!inSouth&&!southValidFoot(x,y))return false;
 return !southObjects.some(p=>{const r=southRect(p);return x+6>r.x&&x-6<r.x+r.w&&y+3>r.y&&y-3<r.y+r.h;});
};
// Crops are taken from the supplied reference sheets. Flood only the connected
// pale page background, preserving light petals enclosed by the artwork.
function sheetSprite(key,rect,w,h,removePage=false){
 const[sx,sy,sw,sh]=rect,c=document.createElement('canvas');c.width=sw;c.height=sh;
 const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(images[key],sx,sy,sw,sh,0,0,sw,sh);
 if(removePage){
  const data=g.getImageData(0,0,sw,sh),a=data.data,seen=new Uint8Array(sw*sh),q=new Int32Array(sw*sh);let head=0,tail=0;
  function add(x,y){if(x<0||y<0||x>=sw||y>=sh)return;const i=y*sw+x;if(seen[i])return;seen[i]=1;const k=i*4,lo=Math.min(a[k],a[k+1],a[k+2]),hi=Math.max(a[k],a[k+1],a[k+2]);if(lo>217&&hi-lo<36){q[tail++]=i;a[k+3]=0;}}
  for(let x=0;x<sw;x++){add(x,0);add(x,sh-1);}for(let y=0;y<sh;y++){add(0,y);add(sw-1,y);}
  while(head<tail){const i=q[head++],x=i%sw,y=Math.floor(i/sw);add(x-1,y);add(x+1,y);add(x,y-1);add(x,y+1);}g.putImageData(data,0,0);
 }
 const s=document.createElement('canvas');s.width=w;s.height=h;const sg=s.getContext('2d');sg.imageSmoothingEnabled=false;sg.drawImage(c,0,0,w,h);return s;
}
const southPrepare=prepareHeroSprites;
prepareHeroSprites=function(){
 southPrepare();
 southSprites.grass=[sheetSprite('outer-terrain',[65,491,200,196],120,120),sheetSprite('outer-terrain',[327,491,198,196],120,120),sheetSprite('outer-terrain',[587,491,198,196],120,120)];
 southSprites.path=sheetSprite('outer-terrain',[44,144,168,171],104,112);
 const ground=document.createElement('canvas');ground.width=W;ground.height=H;const gc=ground.getContext('2d');gc.drawImage(images.ground,0,0,W,H);
 const fade=gc.createLinearGradient(0,550,0,600);fade.addColorStop(0,'#fff');fade.addColorStop(1,'#fff0');gc.globalCompositeOperation='destination-in';gc.fillStyle=fade;gc.fillRect(0,0,W,H);southSprites.courtyardGround=ground;
 const defs={bamboo:['outer-plants',[20,80,222,258],104,126], 'bamboo-small':['outer-plants',[244,96,165,241],94,112],
  peach:['outer-plants',[690,82,300,290],143,155],willow:['outer-plants',[1166,81,321,293],152,158],
  wildflowers:['outer-plants',[26,708,228,173],79,63],flowerbed:['outer-plants',[1072,695,295,208],102,70],
  lamp:['outer-props',[29,153,99,179],35,65],'lamp-lit':['outer-props',[393,150,103,181],35,65],bench:['outer-props',[29,588,225,141],106,60]};
 for(const[k,[sheet,rect,w,h]]of Object.entries(defs))southSprites[k]=sheetSprite(sheet,rect,w,h,true);
};
function southOnScreen(p){return p.y>=southWorld.cameraY-12&&p.y-p.h<=southWorld.cameraY+(southWorld.viewHeight||H)+12;}
function drawSouthGround(){
 const lo=Math.max(480,Math.floor(southWorld.cameraY/120)*120),hi=Math.min(southWorld.height,southWorld.cameraY+(southWorld.viewHeight||H)+120);
 for(let y=lo;y<hi;y+=120)for(let x=0;x<W;x+=120){const i=((x/120)*7+(y/120)*11)%3;ctx.drawImage(southSprites.grass[Math.floor(i)],x,y);}
 // The same stone path runs through the existing opening; the first paving
 // section covers the ground-image seam without touching the wall artwork.
 for(let y=558;y<1510;y+=112)if(y+112>=southWorld.cameraY&&y<=southWorld.cameraY+(southWorld.viewHeight||H)){const h=Math.min(112,1510-y);ctx.drawImage(southSprites.path,0,0,104,h,437,y,104,h);}
}
function drawSouthObject(p,part='whole'){
 const night=journey.clock.slot>=9||journey.clock.slot<3;
 const sprite=southSprites[p.art==='lamp'&&night&&journey.activities.southLampLit?'lamp-lit':p.art];
 const sway=p.tree&&!reduceMotion?Math.sin(state.time*1.2+p.y)*.7:0,x=Math.round(p.x-p.w/2+sway),y=p.y-p.h;
 if(part==='trunk'){const h=Math.round(p.h*.28);ctx.drawImage(sprite,0,p.h-h,p.w,h,x,p.y-h,p.w,h);}
 else if(part==='canopy'){const h=p.h-Math.round(p.h*.28);ctx.drawImage(sprite,0,0,p.w,h,x,y,p.w,h);}
 else ctx.drawImage(sprite,x,y);
}
const southRender=render;
function drawXiaoxiangCourtyardWorld(){
 drawSouthGround();
 if(southWorld.cameraY<H){ctx.drawImage(southSprites.courtyardGround,0,0);drawArchitecture(false);drawFlowers();}
 if(typeof drawMoonRoad==='function'){drawMoonRoad();drawMoonFootShadow();}
 if(typeof drawCourtyardClosedGate==='function')drawCourtyardClosedGate();
 const actors=courtyardProps.filter(p=>p.y>=southWorld.cameraY&&p.y-p.sprite.height<=southWorld.cameraY+(southWorld.viewHeight||H)).map(p=>({y:p.y,draw:()=>{ctx.drawImage(p.sprite,Math.round(p.x-p.sprite.width/2),Math.round(p.y-p.sprite.height));if(p.effect)p.effect();}}));
 const visible=southObjects.filter(southOnScreen);southWorld.visibleProps=visible.length;
 for(const p of visible){ctx.fillStyle='#203c3442';ctx.beginPath();ctx.ellipse(p.x,p.y-5,p.w*.35,8,0,0,Math.PI*2);ctx.fill();
  if(p.tree){actors.push({y:p.y-18,draw:()=>drawSouthObject(p,'trunk')},{y:p.y+2,draw:()=>drawSouthObject(p,'canopy')});}
  else actors.push({y:p.y,draw:()=>drawSouthObject(p)});
 }
 actors.push({y:state.y,draw:drawHero});
 // Wall is depth-sorted at the threshold. Its arch covers the head while
 // crossing; once outside the character is in front of the exterior wall.
 if(southWorld.cameraY<625)actors.push({y:568,draw:()=>drawArchitecture(true)});
 actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
 const night=journey.clock.slot>=9||journey.clock.slot<3;
 if(spring.mode==='play'&&night){ctx.fillStyle='rgba(20,32,63,.14)';ctx.fillRect(0,0,W,southWorld.height);
  const lights=journey.activities.southLampLit?southObjects.filter(p=>p.art==='lamp'):[];
  if(journey.activities.lampLit)lights.push({x:76,y:395});
  for(const p of lights){const y=p.y-42,g=ctx.createRadialGradient(p.x,y,1,p.x,y,44);g.addColorStop(0,'rgba(255,207,104,.34)');g.addColorStop(1,'rgba(255,207,104,0)');ctx.fillStyle=g;ctx.fillRect(p.x-44,y-44,88,88);}
  // Existing house windows glow at their original world coordinates.
  if(southWorld.cameraY<250){ctx.fillStyle='rgba(255,205,111,.10)';ctx.fillRect(300,105,66,60);ctx.fillRect(604,105,66,60);}
 }
}
render=function(){if(state.scene!=='courtyard'){southRender();return;}ctx.fillStyle='#24392d';ctx.fillRect(0,0,W,H);ctx.save();ctx.translate(0,-Math.round(southWorld.cameraY));drawXiaoxiangCourtyardWorld();ctx.restore();drawAir();};
const southUpdate=update;
update=function(dt){
 southUpdate(dt);
 // Looking north keeps more of the real courtyard in view, without scaling it.
 const followLine=state.dir==='up'?.94:.80;
 const target=state.scene==='courtyard'?Math.max(0,Math.min(southWorld.height-H,state.y-H*followLine)):0;
 if(southWorld.previousScene!==state.scene){southWorld.cameraY=target;southWorld.previousScene=state.scene;}
 else southWorld.cameraY+=(target-southWorld.cameraY)*(1-Math.exp(-9*dt));
 const outside=state.scene==='courtyard'&&state.y>568;
 if(southWorld.outside!==outside){southWorld.outside=outside;document.querySelector('.controlbar').style.display=outside?'none':'';$('prompt').style.top=outside?'76px':'';$('prompt').style.bottom=outside?'auto':'';}
};
objectOption('south-bench','歇一阵',()=>{journey.activities.rest++;advanceTime(1,'石凳小憩');observe('在石凳上歇过一阵，花影已经慢慢移到了另一块石板上。','路边小憩');});
for(const id of ['south-lamp','south-lamp-far'])objectOption(id,'点亮石灯',()=>{journey.activities.southLampLit=true;saveProgress(true);observe('灯芯已经照看妥当。入夜后，石板路旁便有暖光相伴。','石灯');});
objectOption('south-wildflowers','拾一片花瓣',()=>{entry('petals',{id:'south-path-petal',title:'园路上的花瓣',text:'月洞门外的草叶间，一片花瓣落得很轻。转身时，来路仍在身后。'});saveProgress(true);observe('将花瓣轻轻收在手札里，花丛仍随着风摇动。','路边拾花');});
objectOption('south-peach','花下心语',()=>quoteSelf('south-peach-'+timeBand(),'花下心语',timeBand()==='night'?'夜里花色淡了，花影却还陪着人。往回走，院里的灯应当也亮着。':'走出院门，原来春天还在一路相随。花开在枝上，也落在来路上。','default'));
const southRoomUI=roomUI;
roomUI=function(){southRoomUI();if(state.scene==='courtyard')document.querySelector('.below p').innerHTML='林黛玉的庭院与园路<small style="display:block">月洞门已通行 · 向南沿石板路散步 · 回头可见潇湘馆 · 正房门口按 E 进屋</small>';};
const southRestore=restoreGame;
restoreGame=function(v){southRestore(v);southWorld.previousScene=null;};
