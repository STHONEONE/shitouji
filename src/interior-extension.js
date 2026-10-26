// Module 03: an independently furnished room; courtyard logic remains reusable.
state.scene='courtyard';
const courtyard={validFoot,nearest,nearestFlower,render,interact,pickFlower,reset,prepareHeroSprites};
const roomWalkable=[{x:62,y:165,w:839,h:359},{x:432,y:518,w:96,h:61}];
const roomProps=[
 {id:'bed',name:'床榻',source:[29,30,406,399],x:226,y:278,box:[282,214],body:[-106,-80,212,80]},
 {id:'desk',name:'书案',source:[472,158,370,281],x:592,y:394,box:[220,143],body:[-94,-62,188,62]},
 {id:'shelf',name:'书架',source:[892,26,324,398],x:666,y:190,box:[115,158],body:[-54,-43,108,43]},
 {id:'tea',name:'会客茶桌',source:[25,500,450,352],x:224,y:435,box:[202,150],body:[-45,-94,90,52]},
 {id:'chair',name:'书椅',source:[585,492,158,291],x:590,y:283,box:[58,80],body:[-18,-18,36,18]},
 {id:'screen',name:'屏风',source:[864,446,358,383],x:812,y:378,box:[122,182],body:[-43,-59,86,59]},
 {id:'qin',name:'琴桌',source:[41,978,500,210],x:555,y:236,box:[184,83],body:[-82,-29,164,29]},
 {id:'lamp-east',name:'宫灯',source:[596,808,143,415],x:873,y:287,box:[45,124],body:[-10,-17,20,17]},
 {id:'bamboo-vase',name:'竹枝插瓶',source:[909,834,263,387],x:855,y:461,box:[66,134],body:[-16,-23,32,23]},
 {id:'lamp-entry',name:'宫灯',source:[596,808,143,415],x:350,y:466,box:[40,115],body:[-10,-18,20,18]}
];
const roomLandmarks=[
 {key:'exit',x:480,y:552,radius:27,label:'回到庭院'},
 {key:'bed',x:298,y:300,radius:38,label:'查看床榻',text:'纱帐已经拢好，薄被与绣枕放在榻边。床前的小块空地留着，起身便能走到窗边。'},
 {key:'desk',x:592,y:425,radius:40,label:'查看书案',text:'案上摊着诗笺，砚中余墨尚润。笔筒、书册各有位置，窗边的光正好落在纸上。'},
 {key:'shelf',x:675,y:220,radius:35,label:'翻看书架',text:'诗集与卷轴按次序收在架上。常读的几册摆在外侧，伸手便能取到。'},
 {key:'tea',x:258,y:457,radius:40,label:'查看会客区',text:'小圆桌上摆着茶壶与茶盏，几张圆凳围在桌边。会客区与书案之间留着通路，来去不必绕过家具。'},
 {key:'qin',x:510,y:256,radius:34,label:'查看古琴',text:'古琴安放在窄长的琴桌上，避开入口来往的动线。弦下无声，窗外却有细细竹声。'},
 {key:'window',x:426,y:183,radius:34,label:'看看窗边',text:'格窗透进一片淡光，映出地板上的纹理。风从竹梢过来，屋里仍是清清静静。'},
 {key:'screen',x:743,y:384,radius:34,label:'查看屏风',text:'竹纹屏风沿右侧陈设，稍稍折起，隔而不闭。它与书案之间留出了一人通行的位置。'},
 {key:'vase',x:824,y:485,radius:34,label:'看看竹枝插瓶',text:'青花瓷瓶里斜插着几枝新竹，旁边宫灯的暖光照着深色木纹。'}
];
const roomSolids=roomProps.map(p=>({x:p.x+p.body[0],y:p.y+p.body[1],w:p.body[2],h:p.body[3]}));
// Separate stool feet leave the visible floor between the seats traversable.
const teaStools=[
 {id:'tea-left',x:151,y:390,body:{x:139,y:380,w:24,h:15}},
 {id:'tea-right',x:300,y:388,body:{x:288,y:378,w:24,h:15}},
 {id:'tea-front',x:224,y:427,body:{x:211,y:416,w:26,h:16}}
];
roomSolids.push(...teaStools.map(s=>s.body));
const roomExtras=[];
function prepareInterior(){
 const atlas=images['room-furniture'];
 for(const p of roomProps){
  const [sx,sy,sw,sh]=p.source;
  if(sx+sw>atlas.width||sy+sh>atlas.height)throw new Error('室内物件裁切超出图集：'+p.name);
  const scale=Math.min(p.box[0]/sw,p.box[1]/sh),sprite=document.createElement('canvas');
  sprite.width=Math.round(sw*scale);sprite.height=Math.round(sh*scale);
  const c=sprite.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  c.drawImage(atlas,sx,sy,sw,sh,0,0,sprite.width,sprite.height);p.sprite=sprite;
 }
}
function roomValidFoot(x,y){
 return [[-6,-3],[6,-3],[-6,3],[6,3]].every(([dx,dy])=>roomWalkable.some(r=>x+dx>=r.x&&x+dx<=r.x+r.w&&y+dy>=r.y&&y+dy<=r.y+r.h))&&!roomSolids.some(r=>x+6>r.x&&x-6<r.x+r.w&&y+3>r.y&&y-3<r.y+r.h);
}
function roomUI(){
 const indoor=state.scene==='indoor',place=document.querySelector('.place');
 place.textContent=indoor?'潇湘馆 · 内室':'潇湘馆';place.style.fontSize=indoor?'18px':'';place.style.letterSpacing=indoor?'2px':'';
 document.querySelector('.controlbar').children[4].innerHTML=indoor?'<kbd>F</kbd>调查':'<kbd>F</kbd>拾花';
 document.querySelector('.below p').innerHTML=indoor?'林黛玉的居所<small style="display:block">南侧入口 · 左上床榻 · 左下会客 · 中央书案 · 北侧书架 · 右侧陈设</small>':'林黛玉的庭院<small style="display:block">一庭竹影，半卷诗书。走近正房门口，按 E 进入内室。</small>';
 lastNear='';$('prompt').style.display='none';
}
function changeRoomScene(scene){
 closeDialogue();state.scene=scene;state.moving=false;
 state.x=480;state.y=scene==='indoor'?500:244;state.dir=scene==='indoor'?'up':'down';
 roomUI();toast(scene==='indoor'?'进入潇湘馆内室 · 走近家具按 E 查看':'回到潇湘馆庭院');
}
prepareHeroSprites=function(){courtyard.prepareHeroSprites();prepareInterior();};
validFoot=function(x,y){return state.scene==='indoor'?roomValidFoot(x,y):courtyard.validFoot(x,y);};
nearest=function(){
 if(state.scene!=='indoor'){
  const p=courtyard.nearest();return p?.key==='door'?{...p,label:'进入潇湘馆内室'}:p;
 }
 return roomLandmarks.map(p=>({...p,d:Math.hypot(state.x-p.x,state.y-p.y)})).filter(p=>p.d<p.radius).sort((a,b)=>a.d-b.d)[0]||null;
};
nearestFlower=function(){return state.scene==='indoor'?-1:courtyard.nearestFlower();};
interact=function(){
 if(!state.ready)return;
 if(state.dialogue){closeDialogue();return;}
 const near=nearest();
 if(state.scene==='courtyard'&&near?.key==='door'){changeRoomScene('indoor');return;}
 if(state.scene==='indoor'){
  if(near?.key==='exit'){changeRoomScene('courtyard');return;}
  if(near){say(near.text);$('speaker').textContent='林黛玉 · '+near.label.replace(/^(查看|翻看|看看)/,'');return;}
  toast('走近书案、书架、床榻或茶桌，按 E 查看。');return;
 }
 $('speaker').textContent='林黛玉';courtyard.interact();
};
pickFlower=function(){if(state.scene==='indoor')interact();else courtyard.pickFlower();};
reset=function(){courtyard.reset();state.scene='courtyard';roomUI();};
render=function(){
 if(state.scene!=='indoor'){courtyard.render();return;}
 ctx.imageSmoothingEnabled=false;ctx.drawImage(images['room-shell'],0,0,W,H);
 const layers=roomProps.concat(roomExtras).map(p=>({y:p.y,draw:()=>ctx.drawImage(p.sprite,Math.round(p.x-p.sprite.width/2),Math.round(p.y-p.sprite.height))}));
 layers.push({y:state.pose?.depth??state.y,draw:drawHero});layers.sort((a,b)=>a.y-b.y).forEach(p=>p.draw());
};
$('touch-e').onclick=interact;$('touch-f').onclick=pickFlower;$('reset').onclick=reset;
$('help').onclick=()=>{
 $('speaker').textContent='林黛玉';
 say(state.scene==='indoor'?'用 WASD 或方向键在室内走动，按住 Shift 疾走。走近床榻、书案、书架、古琴、窗边或陈设，按 E／F 查看。南侧入口处按 E 返回庭院；Esc 收起心语。':'你正在操控林黛玉。用 WASD 或方向键行走，Shift 疾走；靠近正房门口按 E 进入内室。地上的微光可按 F 拾取。Esc 收起心语。');
};
roomUI();
// This module opens in the furnished room for review; the south exit returns to the courtyard.
if(location.hash!=='#courtyard')changeRoomScene('indoor');
