// Spring NPCs: the player always remains Daiyu. Text is sourced narrative and
// marked excerpts; simulation schedules are not claims about the novel's dates.
const npcSprites={},npcRuntime={owner:null,stamp:'',talking:null};
function npcState(){
 const ext=journey.extensions;
 if(!ext.npcs||ext.npcs.version!==1)ext.npcs={version:1,people:{},readings:{},encounters:{}};
 return ext.npcs;
}
function npcDay(){return journey.clock.cycle*30+journey.clock.day;}
function npcSchedule(id,day=npcDay(),slot=journey.clock.slot){
 if(id==='xiren')return{home:'yihong',scene:'indoor',anchor:1};
 if(id==='baoyu'||id==='baochai')return{home:id==='baoyu'?'yihong':'hengwu',scene:slot>=6&&slot<=8?'courtyard':'indoor',anchor:0};
 const visits={
  xiangyun:[true,4,8,day%2?'xiaoxiang':'yihong',0],
  tanchun:[day%3===0,4,6,day%2?'yihong':'xiaoxiang',1],
  xichun:[day%3===1,5,7,'xiaoxiang',2],
  xifeng:[day%5===1,5,5,'yihong',2],
  miaoyu:[day%5===2,7,7,'xiaoxiang',0],
  jiamu:[day%6===0,4,4,'xiaoxiang',2],
  wangfuren:[day%6===3,5,5,'hengwu',2]
 };
 const a=visits[id];if(!a||!a[0]||slot<a[1]||slot>a[2])return null;
 return{home:a[3],scene:slot===6?'courtyard':'indoor',anchor:a[4]};
}
function npcPoints(id,place){
 if(place.scene==='courtyard')return place.home==='xiaoxiang'?[[785,520],[855,565],[805,635]]:[[785,1070],[880,1130],[810,1210]];
 if(id==='xiren')return[[1020,500],[1090,560],[1020,620]];
 if(id==='baoyu')return[[630,470],[650,530],[730,560]];
 if(id==='baochai')return[[730,490],[810,540],[875,490]];
 const k=place.anchor||0;return place.home==='xiaoxiang'?[[675+k*53,465],[700+k*45,520],[745+k*35,580]]:[[590+k*65,465],[650+k*65,520],[720+k*50,565]];
}
const npcStaticFoot=validFoot;
function npcTerrain(place,x,y){
 const home=state.residence,scene=state.scene;
 try{state.residence=place.home;state.scene=place.scene;return npcStaticFoot(x,y);}finally{state.residence=home;state.scene=scene;}
}
function syncNPCs(){
 const data=npcState(),stamp=npcDay()+':'+journey.clock.slot;
 if(npcRuntime.owner===data&&npcRuntime.stamp===stamp)return;
 npcRuntime.owner=data;npcRuntime.stamp=stamp;
 for(const id of Object.keys(NPC_CONTENT)){
  const p=data.people[id]||(data.people[id]={seconds:0,visits:0,topics:{},moving:false,dir:'down',waypoint:0,pause:0});
  const next=npcSchedule(id),same=next&&p.place&&next.home===p.place.home&&next.scene===p.place.scene;
  if(next){
   if(!same||!Number.isFinite(p.x)||!npcTerrain(next,p.x,p.y)){
    const points=npcPoints(id,next);let spot=points.find(([x,y])=>npcTerrain(next,x,y));
    if(!spot)continue;p.x=spot[0];p.y=spot[1];p.waypoint=1;p.pause=3;p.dir='down';
   }
   p.place=next;p.present=true;p.moving=false;
   data.encounters[id]=data.encounters[id]||{firstDay:npcDay()};
  }else{p.present=false;p.moving=false;}
 }
}
function currentNPCs(){
 if(!state.ready||spring.mode!=='play')return[];syncNPCs();
 return Object.entries(npcState().people).filter(([,p])=>p.present&&p.place?.home===state.residence&&p.place.scene===state.scene).map(([id,p])=>({id,...p}));
}
const npcPrepare=prepareHeroSprites;
prepareHeroSprites=function(){
 npcPrepare();
 for(const[id,art]of Object.entries(NPC_ART)){
  npcSprites[id]={};const im=images['npc-'+id];
  for(const[dir,frames]of Object.entries(art.frames))npcSprites[id][dir]=frames.map(([sx,sy,sw,sh])=>{
   const c=document.createElement('canvas');c.height=art.height;c.width=Math.round(sw*art.height/sh);const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);return c;
  });
 }
};
function drawNPC(id,p){
 const sprites=npcSprites[id]?.[p.dir]||npcSprites[id]?.down;if(!sprites)return;
 const i=p.moving?[0,1,2,1][Math.floor((p.anim||0)*6)%4]:1,im=sprites[i]||sprites[0];
 ctx.drawImage(im,Math.round(p.x-im.width/2),Math.round(p.y-im.height));
}
function sceneActorLayers(){return currentNPCs().map(n=>({id:'npc-'+n.id,x:n.x,y:n.y,draw:()=>drawNPC(n.id,n)}));}
validFoot=function(x,y){
 if(!npcStaticFoot(x,y))return false;
 return !currentNPCs().some(n=>Math.abs(x-n.x)<12&&Math.abs(y-n.y)<8);
};
spring.updateHooks.push(dt=>{
 syncNPCs();const all=npcState().people;
 for(const[id,p]of Object.entries(all)){
  if(!p.present)continue;
  const here=p.place.home===state.residence&&p.place.scene===state.scene;
  if(here&&Math.hypot(p.x-state.x,p.y-state.y)<105)p.seconds=Math.min(86400,(p.seconds||0)+dt);
  if(state.dialogue){p.moving=false;continue;}
  p.anim=(p.anim||0)+dt;p.pause=Math.max(0,(p.pause||0)-dt);p.moving=false;
  if(p.pause>0)continue;
  const pts=npcPoints(id,p.place),target=pts[p.waypoint%pts.length],dx=target[0]-p.x,dy=target[1]-p.y,len=Math.hypot(dx,dy);
  if(len<3){p.waypoint=(p.waypoint+1)%pts.length;p.pause=4;continue;}
  p.dir=Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';
  const speed=(id==='jiamu'?18:27)*Math.min(dt,.05),mx=dx/len*speed,my=dy/len*speed;
  const free=(x,y)=>npcTerrain(p.place,x,y)&&!(here&&Math.abs(x-state.x)<15&&Math.abs(y-state.y)<10)&&!Object.entries(all).some(([other,n])=>other!==id&&n.present&&n.place.home===p.place.home&&n.place.scene===p.place.scene&&Math.abs(x-n.x)<14&&Math.abs(y-n.y)<9);
  if(free(p.x+mx,p.y)){p.x+=mx;p.moving=true;}if(free(p.x,p.y+my)){p.y+=my;p.moving=true;}
  if(!p.moving){p.waypoint=(p.waypoint+1)%pts.length;p.pause=1;}
 }
});
const npcPriorNearest=nearest;
nearest=function(){
 const old=npcPriorNearest();if(old&&['exit','door'].includes(old.key))return old;
 const n=currentNPCs().map(n=>({...n,d:rectDistance(state.x,state.y,{x:n.x-8,y:n.y-5,w:16,h:10})})).filter(n=>n.d<=36).sort((a,b)=>a.d-b.d)[0];
 return n&&(!old||n.d<=old.d)?{key:'npc:'+n.id,npc:n.id,label:'与'+NPC_CONTENT[n.id].name+'说话',d:n.d}:old;
};
function npcPortrait(id){
 const pc=$('emotion-portrait'),s=npcSprites[id]?.down?.[1];if(!s)return;pc.hidden=false;const g=pc.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,pc.width,pc.height);const size=Math.min(s.width,s.height*.6);g.drawImage(s,(s.width-size)/2,0,size,size,0,0,pc.width,pc.height);
}
function npcPanel(id,text,opts){showPanel(NPC_CONTENT[id].name,text,opts,{portrait:false});$('dialogue').dataset.portrait='present';npcPortrait(id);}
function npcTopic(id,index){
 const n=NPC_CONTENT[id],t=n.topics[index],p=npcState().people[id];p.topics[index]=true;
 const extra=index===2&&p.seconds>=120?'\n\n'+n.deepExtra:'';
 const text=t.text+extra+'\n\n〔原著情境 · 第'+t.chapter+'回〕';
 entry('quotes',{id:'npc-topic-'+id+'-'+index,title:n.name+' · '+t.title,text});saveProgress(true);
 npcPanel(id,text,[choice('再说几句',()=>openNPC(id)),choice('继续游园',closeDialogue)]);
}
function npcStory(id,storyId,reading=false){
 const n=NPC_CONTENT[id],s=n.stories.find(s=>s.id===storyId);if(!s)return;
 const here=currentNPCs().some(p=>p.id===id),mode=reading||!here?'补读':'相谈';
 const text=s.text+'\n\n〔原著片段 · 第'+s.chapter+'回 · '+mode+'〕';
 function remember(style,linger=false){
  const memory=npcState();memory.readings[s.id]={day:npcDay(),slot:journey.clock.slot,mode};
  memory.readings[s.id].style=style;
  entry('notes',{id:'npc-story-'+s.id,title:n.name+' · '+s.title,text});
  if(linger)advanceTime(1,'翻读往来');
  saveProgress(true);observe(style==='linger'?'翻过这一页，窗光也移了一点。这段旧事已留在手札里。':'这一页已收在手札里，想读时还可再翻。',s.title);
 }
 npcPanel(id,text,[choice('记下这一页',()=>remember('listen')),choice('坐读片刻',()=>remember('linger',true)),choice('在物件旁停留',()=>{closeDialogue();toast('可在书案、书架、茶桌或窗前，翻看相关的往来旧记。');}),choice('收起',closeDialogue)]);
}
function openNPC(id){
 const p=npcState().people[id];if(!currentNPCs().some(n=>n.id===id)){openNPCRoster();return;}
 p.visits++;npcRuntime.talking=id;saveProgress(true);
 npcPanel(id,'愿意说些平日的话，或翻读一段旧事，都可在这里停留。',[
  choice('日常寒暄',()=>npcTopic(id,0)),choice('诗文与闲谈',()=>npcTopic(id,1)),choice('说些心事',()=>npcTopic(id,2)),
  ...NPC_CONTENT[id].stories.map(s=>choice(s.title,()=>npcStory(id,s.id))),choice('继续游园',closeDialogue)]);
}
function openNPCRoster(){
 syncNPCs();const options=Object.values(NPC_CONTENT).map(n=>{
  const p=npcState().people[n.id],where=p?.present?residences[p.place.home].name+(p.place.scene==='indoor'?'内室':'庭院'):'暂未在三处住所停留';
  return choice(n.name+' · '+where,()=>showPanel(n.name+' · 往来旧记','人不在眼前时，也可以翻读书中的片段。',n.stories.map(s=>choice(s.title,()=>npcStory(n.id,s.id,true))).concat(choice('回到人物往来',openNPCRoster)),{portrait:false}));
 });showPanel('园中人物','主人留在各自住所；来客随春日时辰往来。',options.concat(choice('收起',closeDialogue)),{portrait:false,kind:'journal'});
}
const npcOldHandbook=openHandbook;
openHandbook=function(){npcOldHandbook();const b=document.createElement('button');b.textContent='人物往来与补读';b.onclick=openNPCRoster;$('spring-choices').prepend(b);};
register('menu',openHandbook);
const npcPriorInteract=interact;
interact=function(){
 if(spring.mode==='play'&&!state.pose&&!state.dialogue){const n=nearest();if(n?.npc){openNPC(n.npc);return;}}
 const near=!state.dialogue?nearest():null;npcPriorInteract();
 if(near&&!near.npc&&state.dialogue){
  const related=[];
  for(const n of Object.values(NPC_CONTENT))for(const s of n.stories)if(s.focus===near.key||s.focus==='herbs'&&['bamboo','flowerbed','haitang','herbs','white-tree'].includes(near.key)||s.focus==='white-tree'&&['peach','white-tree'].includes(near.key))related.push({n,s});
  if(related.length){const b=document.createElement('button');b.textContent='翻读相关往来';b.onclick=()=>showPanel('物旁旧记','在这一处，看见书中的一点日常。',related.map(({n,s})=>choice(n.name+' · '+s.title,()=>npcStory(n.id,s.id,!currentNPCs().some(p=>p.id===n.id)))).concat(choice('收起',closeDialogue)),{portrait:false});$('spring-choices').append(b);}
 }
};
const npcRestore=restoreGame;
restoreGame=function(v){npcRuntime.owner=null;npcRuntime.stamp='';npcRestore(v);syncNPCs();};
