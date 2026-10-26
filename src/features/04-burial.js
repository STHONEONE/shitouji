function dayId(){return journey.clock.cycle+':'+journey.clock.day;}
function flowerDay(){const key=dayId();return journey.burial.days[key]||(journey.burial.days[key]={day:journey.clock.day,cycle:journey.clock.cycle,picked:0,dug:false,read:false,offered:false,watched:false,finished:false,route:null});}
function burialActive(){return journey.clock.slot>=7&&journey.clock.slot<9&&!flowerDay().finished;}
function spendTime(slots,reason){if(typeof advanceTime==='function')advanceTime(slots,reason);}
function finishFlowerDay(d){
 if(d.finished)return;
 d.finished=true;d.route=d.dug||d.read||d.offered?'participated':d.watched?'observed':d.picked>0?'picked':'absent';
 entry('notes',poemEntry('zanghua'));saveProgress(true);
}
function burialTick(){if(journey.clock.slot>=9)finishFlowerDay(flowerDay());}
function markBurialReading(id){if(id==='zanghua'&&burialActive())flowerDay().read=true;}
const burialText={
 participated:'那一日曾在花坛前，为落花留过片刻。动手与读诗都是自己的心意，记得这一分郑重便好。',
 observed:'那一日没有动手，只静静看完了花事。看着花瓣被净土轻轻掩住，心里也留下一点安静。',
 absent:'那一日没有往花坛去，花事也随着时辰过去了。诗笺还在案边，想读时仍可慢慢翻开。',
 picked:'拾来的花瓣收在手札里，没有拿去葬。午后的花事照常过去，留花与葬花，都是各自的一种心情。'
};
function burialMemory(d){
 const text=burialText[d.route]||burialText.absent;entry('quotes',{id:'burial-'+d.cycle+'-'+d.day,title:'三月'+lunarDay(d.day)+' · 花事心语',text});saveProgress(true);
 showPanel('林黛玉',text,[choice(d.route==='absent'?'补读《葬花吟》':'读《葬花吟》',()=>readPoem('zanghua')),choice('回到心语',openHeart),choice('继续游园',closeDialogue)],{emotion:'sad'});
}
function lunarDay(day){const a=['','一','二','三','四','五','六','七','八','九','十'];if(day<=10)return day===10?'初十':'初'+a[day];if(day<20)return'十'+a[day-10];if(day===20)return'二十';if(day<30)return'廿'+a[day-20];return'三十';}
function watchBurial(step=0){
 const scenes=['风过花坛，细碎的落花留在草根旁。放下手边的事，任视线随着一片花瓣慢慢落定。','花锄轻轻松开干净的土。几片花瓣被拢到一处，没有人催着这一刻快些过去。','一抔净土覆下，花坛边渐渐安静。读诗的声音收住，竹梢仍随风轻动。'];
 if(!burialActive()){burialMenu();return;}
 showPanel('暮春 · 花坛边',scenes[step],[choice(step<2?'静静看下去':'看完这一段',()=>{if(step<2){watchBurial(step+1);return;}const d=flowerDay();d.watched=true;spendTime(Math.max(1,9-journey.clock.slot),'旁观花事');if(!d.finished)finishFlowerDay(d);burialMemory(d);}),choice('随时离开',closeDialogue)],{portrait:false});
}
function burialMenu(){
 burialTick();const d=flowerDay();
 if(d.finished){showPanel('暮春 · 花坛','花坛边的土已经轻轻拢好。春风仍来去，想起时，可以再读一回诗笺。',[choice('读《葬花吟》',()=>readPoem('zanghua')),choice('记起那一日',()=>burialMemory(d)),choice('看看花坛',()=>observe('花根旁有湿润的新土，细小的花瓣落在草叶之间。','花坛')),choice('继续游园',closeDialogue)],{portrait:false});return;}
 if(!burialActive()){
  showPanel('暮春 · 花坛','暮春的花事在午后自然展开。此刻仍可拾花、读诗，或去做别的事。',[choice('拾取近旁落花',()=>{const before=state.petals.filter(Boolean).length;pickFlower();if(state.petals.filter(Boolean).length===before)toast('走近地上微光，按 F 拾取。');closeDialogue();}),choice('读《葬花吟》',()=>readPoem('zanghua')),choice('继续游园',closeDialogue)],{portrait:false});return;
 }
 showPanel('暮春 · 葬花','花坛边，净土已松。愿意动手、只静静看，或先去做别的事，都由此刻的心情。',[
  choice('拾一片落花',()=>{const i=state.petals.findIndex(v=>!v);d.picked++;if(i>=0){state.petals[i]=true;entry('petals',{id:'court-'+i,title:['阶前落花','竹边花瓣','花坛残红'][i],text:'暮春时，在潇湘馆拾起的一片落花。'});}else entry('petals',{id:'bed-petal',title:'坛边落花',text:'在暮春花坛边拾起的一片落花，轻轻收在手札里。'});refreshSpringUI();saveProgress(true);showPanel('林黛玉','轻轻拾起来，不必急着决定把它留在哪里。',[choice('回到花坛',burialMenu),choice('留在手札里，继续游园',closeDialogue)],{emotion:'default'});}),
  choice('掘一抔净土',()=>{d.dug=true;spendTime(1,'掘土');saveProgress(true);showPanel('林黛玉','花锄只轻轻一掘。土松了，心也像是松开一点。',[choice('读《葬花吟》',()=>readPoem('zanghua')),choice('回到花坛',burialMenu),choice('继续游园',closeDialogue)],{emotion:'sad'});}),
  choice('轻放花瓣',()=>{d.offered=true;saveProgress(true);showPanel('林黛玉','把眼前的落花轻轻拢在一处。手札里留下的是拾花的记忆，不必抹去。',[choice('回到花坛',burialMenu),choice('继续游园',closeDialogue)],{emotion:'default'});}),
  choice('读《葬花吟》',()=>readPoem('zanghua')),choice('只静静旁观',()=>watchBurial()),choice('只拾花，不参与葬花',()=>{closeDialogue();toast('花瓣可以留在手札里，花事照常随着时辰走过。');}),choice('先去做别的事',closeDialogue)
 ],{emotion:'sad'});
}
register('burial-memory',burialMemory);register('burial',burialMenu);
landmarks.push({key:'flowerbed',x:340,y:361,radius:35,label:'查看花坛',text:'花根旁有湿润的新土，细小的花瓣落在草叶之间。'});
objectOption('flowerbed','暮春花事',burialMenu);
pickFlower=function(){
 if(spring.mode!=='play')return;if(state.scene==='indoor'){interact();return;}if(state.dialogue)return;
 const i=nearestFlower();if(i<0){toast('地上的花瓣已随手收好，也可在花坛与池边停留。');return;}
 state.petals[i]=true;flowerDay().picked++;entry('petals',{id:'court-'+i,title:['阶前落花','竹边花瓣','花坛残红'][i],text:'暮春时，在潇湘馆拾起的一片落花。'});refreshSpringUI();saveProgress(true);toast('轻轻拾起落花，记入手札。');
};
$('touch-f').onclick=pickFlower;
