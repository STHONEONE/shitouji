// Persistence and dialogue interfaces are shared by all open-ended activities.
const SAVE_KEY='xiaoxiang-open-spring-v1';
const spring={mode:'title',ready:false,onE:null,onClose:null,handlers:{},updateHooks:[],storageError:false};
function freshJourney(){return {clock:{day:6,slot:3,season:'spring',elapsed:0,cycle:0},memory:{visits:0,readIds:[],poemVisits:0},collections:{petals:[],notes:[],poems:[],scores:[],quotes:[]},burial:{days:{}},activities:{qin:0,tea:0,writing:0,rest:0},extensions:{}};}
let journey=freshJourney();
function register(key,handler){spring.handlers[key]=handler;}
const objectOptions={};
function objectOption(key,label,handler){(objectOptions[key]||(objectOptions[key]=[])).push({label,run:handler});}
function run(key,...args){if(spring.mode!=='play'&&key!=='title')return;return spring.handlers[key]?.(...args);}
function entry(category,item){const list=journey.collections[category];if(!list.some(p=>p.id===item.id)){list.push({...item});return true;}return false;}
function rawSave(){try{return localStorage.getItem(SAVE_KEY);}catch{return null;}}
function savedGame(){try{
 const v=JSON.parse(rawSave());if(!v||v.version!==1||!['courtyard','indoor'].includes(v.scene)||!Number.isFinite(v.x)||!Number.isFinite(v.y)||!Array.isArray(v.petals)||v.petals.length!==3||!v.journey)return null;
 const j=v.journey;if(!j.clock||j.clock.season!=='spring'||!Number.isInteger(j.clock.day)||j.clock.day<1||j.clock.day>30||!Number.isInteger(j.clock.slot)||j.clock.slot<0||j.clock.slot>11||!Number.isInteger(j.clock.cycle)||j.clock.cycle<0)return null;
 if(!Number.isFinite(j.clock.elapsed)||j.clock.elapsed<0)return null;
 for(const k of ['petals','notes','poems','scores','quotes'])if(!Array.isArray(j.collections?.[k])||j.collections[k].some(e=>!e||typeof e.id!=='string'||typeof e.title!=='string'||typeof e.text!=='string'))return null;
 if(!j.memory||!Array.isArray(j.memory.readIds)||!Number.isInteger(j.memory.visits)||j.memory.visits<0||!j.burial?.days||typeof j.burial.days!=='object'||!j.activities)return null;return v;
}catch{return null;}}
function saveProgress(quiet=false){
 if(spring.mode!=='play'||!state.ready)return false;
 const snapshot={version:1,scene:state.scene,x:state.x,y:state.y,dir:state.dir,petals:[...state.petals],journey:structuredClone(journey),extensions:{}};
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot));spring.storageError=false;if(!quiet)toast('这一程已存好。');return true;}
 catch{spring.storageError=true;if(!quiet)toast('浏览器暂未允许本地存档，仍可继续游园。');return false;}
}
function restoreGame(v){
 journey=structuredClone(v.journey);state.scene=v.scene;state.x=v.x;state.y=v.y;state.dir=['down','up','left','right'].includes(v.dir)?v.dir:'down';state.petals=v.petals.map(Boolean);keys.clear();state.moving=false;
 if(!validFoot(state.x,state.y)){state.x=480;state.y=state.scene==='indoor'?500:368;}
 roomUI();refreshSpringUI();
}
function refreshSpringUI(){
 $('petal-count').textContent=state.petals.some(Boolean)?'花瓣已收入手札':'春日随记';
 if(typeof refreshCalendar==='function')refreshCalendar();
}
function newGame(){
 if(rawSave()!==null&&!confirm('开始新游戏会覆盖此浏览器中的原存档。确定重新开始吗？'))return false;
 closeDialogue();state.pose=null;state.residence='xiaoxiang';journey=freshJourney();state.petals=[false,false,false];state.scene='indoor';state.x=480;state.y=500;state.dir='up';spring.mode='play';$('spring-title').hidden=true;roomUI();refreshSpringUI();saveProgress(true);return true;
}
function continueGame(){const v=savedGame();if(!v){$('title-note').textContent='没有可读取的本地存档，可开始新游戏。';return false;}closeDialogue();spring.mode='play';restoreGame(v);$('spring-title').hidden=true;return true;}
function titleScreen(){
 if(spring.mode==='play')saveProgress(true);closeDialogue();spring.mode='title';keys.clear();$('spring-title').hidden=false;$('continue-spring').disabled=!savedGame();
 $('title-note').textContent='存档仅保存在此浏览器；换浏览器或清除数据后会丢失。';
}
function showPanel(title,text,choices=[],options={}){
 $('toast').classList.remove('on');$('toast').hidden=true;toastDeadline=0;
 state.dialogue=true;state.moving=false;keys.clear();spring.onE=options.onE||null;spring.onClose=options.onClose||null;
 $('speaker').textContent=title;$('dialogue-text').textContent=text;$('dialogue').hidden=false;$('dialogue').dataset.kind=options.kind||'talk';$('dialogue').dataset.portrait=options.portrait===false?'none':'present';
 const host=$('spring-choices');host.replaceChildren();
 for(const c of choices){const b=document.createElement('button');b.textContent=c.label;b.onclick=()=>c.run();host.append(b);}
 $('dialogue-close').textContent='收起 · Esc';
 const pc=$('emotion-portrait');pc.hidden=options.portrait===false;
 if(!pc.hidden&&images.expressions){const moods={default:[0,0],happy:[1,0],sad:[0,1],angry:[1,1],surprised:[0,2]},[col,row]=moods[options.emotion]||moods.default;const c=pc.getContext('2d');c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.clearRect(0,0,pc.width,pc.height);c.drawImage(images.expressions,col*images.expressions.width/2,row*images.expressions.height/3,images.expressions.width/2,images.expressions.height/3,0,0,pc.width,pc.height);pc.dataset.emotion=options.emotion||'default';}
}
function choice(label,run){return {label,run};}
const springBaseClose=closeDialogue;
closeDialogue=function(){const clean=spring.onClose;spring.onClose=null;spring.onE=null;springBaseClose();if(clean)clean();};
const springBaseToast=toast;
toast=function(text){$('toast').hidden=state.dialogue;springBaseToast(text);};
say=function(text){showPanel('心语',text,[choice('继续游园',closeDialogue)],{portrait:false});};
function observe(text,title='心语'){showPanel(title,text,[choice('继续游园',closeDialogue)],{portrait:false});}
function refreshTools(){
 const tools=document.querySelector('.tools');tools.replaceChildren();
 for(const [label,key] of [['心语','heart'],['手札','menu'],['小憩','rest'],['保存','save'],['题页','title']]){const b=document.createElement('button');b.textContent=label;b.dataset.action=key;b.onclick=()=>run(key);tools.append(b);}
}
function installSpringUI(){
 const css=document.createElement('style');css.textContent=`
 #dialogue{max-height:77%;overflow:auto;padding-left:115px;bottom:62px}#dialogue[data-kind=reader],#dialogue[data-kind=menu],#dialogue[data-kind=journal]{padding-left:24px}#dialogue-text{white-space:pre-line}#emotion-portrait{position:absolute;left:23px;top:20px;width:72px;height:72px;border:1px solid #9e895d;background:#33434b}#emotion-portrait[hidden]{display:none}#spring-choices{display:flex;gap:7px;flex-wrap:wrap;margin:10px 0}#spring-choices button{font:12px/1.5 'Microsoft YaHei',sans-serif;border:1px solid #ad9870;padding:7px 11px;background:#fff7e5;color:#4a4534}#dialogue[data-kind=reader] #dialogue-text{font:16px/1.9 'SimSun',serif}#spring-title{position:absolute;inset:0;z-index:9;background:#15261ed9;display:grid;place-items:center;padding:20px}#spring-title[hidden]{display:none}.spring-title-card{width:min(460px,94%);background:#f2e8d4;color:#3f4939;padding:28px;text-align:center;border:1px solid #c4ac75;box-shadow:0 10px 50px #0c160c80}.spring-title-card h1{font:34px 'KaiTi','SimSun',serif;letter-spacing:8px;color:#3f5b49;margin:0 0 14px}.spring-title-card p{font:13px/1.9 'Microsoft YaHei',sans-serif}.spring-title-card button{font:14px 'Microsoft YaHei',sans-serif;padding:10px 18px;margin:8px 4px;border:1px solid #b9a06b;background:#36523e;color:#f5ead0}.spring-title-card button:disabled{opacity:.45;cursor:default}#title-note{font-size:11px;color:#80785c}.identity{flex-direction:column;gap:3px;padding:8px 15px;font-size:15px;letter-spacing:1px}#calendar{font:11px 'Microsoft YaHei',sans-serif;color:#d6c7a2}.identity .flower{display:none}.tools{flex-wrap:wrap}.tools button{padding:6px 9px}#dialogue[data-kind=journal] #dialogue-text{font-size:13px}.below small{display:block}@media(max-width:700px){#dialogue{padding:15px 15px 12px 80px;max-height:80%;bottom:10px}#emotion-portrait{width:51px;height:51px;left:14px;top:16px}#dialogue[data-kind=reader],#dialogue[data-kind=menu],#dialogue[data-kind=journal]{padding-left:15px}#dialogue-text{font-size:12px;line-height:1.75}#dialogue[data-kind=reader] #dialogue-text{font-size:13px;line-height:1.7}#spring-choices button{font-size:11px;padding:5px 8px}#spring-title{padding:8px}.spring-title-card{padding:14px}.spring-title-card h1{font-size:25px;margin:0 0 7px}.spring-title-card p{font-size:11px;margin:6px}#calendar{font-size:9px}.identity{font-size:12px;padding:6px 10px;gap:2px}.place{font-size:17px!important;letter-spacing:1px!important}.below{align-items:flex-start}.tools{gap:4px}.tools button{font-size:10px}}`;
 css.textContent+='#touch{display:none!important}#dialogue[data-portrait=none]{padding-left:24px}@media(max-width:700px){#dialogue[data-portrait=none]{padding-left:15px}}';document.head.append(css);
 const portrait=document.createElement('canvas');portrait.id='emotion-portrait';portrait.width=144;portrait.height=144;$('dialogue').prepend(portrait);
 const choices=document.createElement('div');choices.id='spring-choices';$('dialogue-text').after(choices);
 const title=document.createElement('section');title.id='spring-title';title.innerHTML='<div class="spring-title-card"><h1>潇湘馆</h1><p>竹影疏窗，书卷诗心。<br>且随林黛玉，在这一庭春色里慢慢停留。</p><button id="new-spring">新游戏</button><button id="continue-spring">继续</button><p id="title-note"></p></div>';$('scene').append(title);
 $('new-spring').onclick=newGame;$('continue-spring').onclick=continueGame;$('dialogue-close').onclick=closeDialogue;
 const identity=document.querySelector('.identity');identity.innerHTML='<span>林黛玉</span><span id="calendar">暮春 · 三月初六 · 卯时</span>';
 document.querySelector('.controlbar').children[3].innerHTML='<kbd>E</kbd>互动';
 register('save',()=>saveProgress());register('title',titleScreen);refreshTools();
}
const springBaseUpdate=update;
update=function(dt){if(spring.mode!=='play'){keys.clear();return;}springBaseUpdate(dt);spring.updateHooks.forEach(h=>h(dt));};
const springBaseHero=drawHero;
drawHero=function(){if(spring.mode==='play')springBaseHero();};
const springBaseInteract=interact;
interact=function(){
 if(spring.mode!=='play'||!state.ready)return;
 if(state.dialogue){if(spring.onE)spring.onE();else closeDialogue();return;}
 const n=nearest();
 if(n&&(n.key==='door'||n.key==='exit')){springBaseInteract();return;}
 if(n&&spring.handlers['object-menu']){run('object-menu',n);return;}
 if(n?.text){observe(n.text);return;}springBaseInteract();
};
const springBasePick=pickFlower;
pickFlower=function(){if(spring.mode!=='play')return;springBasePick();refreshSpringUI();saveProgress(true);};
const springBaseScene=changeRoomScene;
changeRoomScene=function(scene){springBaseScene(scene);refreshSpringUI();if(spring.mode==='play')saveProgress(true);};
function waitSpring(){if(!state.ready){requestAnimationFrame(waitSpring);return;}spring.ready=true;titleScreen();}
installSpringUI();$('touch-e').onclick=interact;$('touch-f').onclick=pickFlower;requestAnimationFrame(waitSpring);
register('object-menu',n=>{
 const options=(objectOptions[n.key]||[]).filter(o=>!o.scene||o.scene===state.scene);if(!options.length){observe(n.text||'此处静静地留着春日的光景。');return;}
 showPanel(n.label.replace(/^(查看|翻看|看看)/,''),n.text||'在这里停留片刻，随心做一件小事。',options.map(c=>choice(c.label,()=>c.run(n))).concat(choice('静静看看',()=>observe(n.text||'花叶间仍有清风。')),choice('继续游园',closeDialogue)),{portrait:false,kind:'menu'});
});
window.addEventListener('pagehide',()=>saveProgress(true));
document.addEventListener('keydown',e=>{if(spring.mode!=='play'||e.repeat)return;if(e.code==='KeyH'){e.preventDefault();run('heart');}if(e.code==='KeyJ'){e.preventDefault();run('menu');}if(e.code==='KeyP'){e.preventDefault();saveProgress();}});
