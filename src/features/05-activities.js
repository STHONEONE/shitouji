const qinSound={context:null,voices:[],timer:null};
function stopQinSound(){clearTimeout(qinSound.timer);qinSound.timer=null;for(const n of qinSound.voices){try{n.stop();}catch{}}qinSound.voices=[];}
function pluck(frequency,when){
 const context=qinSound.context;
 for(let h=1;h<=4;h++){
  const osc=context.createOscillator(),gain=context.createGain();osc.type='sine';osc.frequency.value=frequency*h;
  gain.gain.setValueAtTime(.0001,when);gain.gain.exponentialRampToValueAtTime(.115/(h*h),when+.008);gain.gain.exponentialRampToValueAtTime(.0001,when+2.5);
  osc.connect(gain);gain.connect(context.destination);osc.start(when);osc.stop(when+2.6);qinSound.voices.push(osc);
 }
}
async function playQin(){
 const Audio=window.AudioContext||window.webkitAudioContext;
 if(!Audio){showPanel('琴边','这个浏览器暂时无法播放琴音，仍可读谱、品茶或做其他事。',[choice('继续游园',closeDialogue)],{portrait:false});return;}
 try{qinSound.context=qinSound.context||new Audio();await qinSound.context.resume();}catch{toast('轻触“抚一曲”可再次启用琴音。');return;}
 stopQinSound();const band=timeBand();let done=false;
 const finish=()=>{
  if(done)return;done=true;stopQinSound();journey.activities.qin++;
  const score={id:'bamboo-air',title:'竹风小调',text:'听奏简记：宫—角—徵—羽—徵—角—宫。\n琴音取五声意境，自由听奏，不设对错。'};entry('scores',score);
  spendTime(1,'抚琴');
  const lines={morning:'晨光里弹这一段，指下也觉得轻。竹声与琴音相接，倒不必再多添一句话。',day:'午后琴声舒缓，仿佛连窗边的影子也慢下来。今日弹到这里，心里已经很妥帖。',dusk:'薄暮里收住琴音，余声还在耳边。这样淡淡的一段，正好留给自己。',night:'灯下听得见弦音慢慢散去。夜深不必求热闹，一两声，便足够了。'};
  const text=lines[band];entry('quotes',{id:'qin-'+band,title:'抚琴自评 · '+({morning:'晨间',day:'午后',dusk:'薄暮',night:'灯下'}[band]),text});saveProgress(true);
  showPanel('林黛玉',text,[choice('再抚一曲',playQin),choice('继续游园',closeDialogue)],{emotion:band==='dusk'?'sad':'happy'});
 };
 showPanel('抚琴','一段琴音缓缓展开。随心听，不必应拍，也无须分辨对错。',[choice('收住琴音',finish)],{portrait:false,onE:finish,onClose:()=>{if(!done){done=true;stopQinSound();}}});
 const now=qinSound.context.currentTime+.05;[220,277.18,329.63,369.99,329.63,277.18,220].forEach((f,i)=>pluck(f,now+i*.68));qinSound.timer=setTimeout(finish,5600);
}
const writingLines=[
 {id:'bamboo',line:'竹影拂窗书半卷，茶烟绕案日初长。',review:'这一句留着书与茶，不把心事写得太满。我自己读来，便觉得安静。',emotion:'happy'},
 {id:'breeze',line:'一庭新绿分春色，满袖微风带墨香。',review:'既有春色，也有一点墨香。眼前所见写下便是，不必与谁争个高低。',emotion:'default'},
 {id:'petal',line:'阶前片片皆堪惜，纸上行行只自知。',review:'落花使我动心，便写落花。这话是说给自己听的，轻一点、重一点，都容得下。',emotion:'sad'}
];
function writePoem(){
 showPanel('书案 · 写诗','借眼前景色，选一句留在纸上。\n以下为本篇原创意境选句。',writingLines.map(p=>choice(p.line,()=>{
  journey.activities.writing++;const item={id:'own-'+journey.activities.writing,title:'窗前小记 · 三月'+lunarDay(journey.clock.day)+' · '+p.id,text:p.line+'\n\n'+p.review,source:'游园意境选句（本篇原创）'};entry('poems',item);entry('quotes',{id:'writing-'+p.id,title:'写诗自评 · '+p.line.slice(0,7),text:p.review});saveProgress(true);
  showPanel('林黛玉',p.review,[choice('再写一句',writePoem),choice('看看诗集',()=>run('journal','poems')),choice('继续游园',closeDialogue)],{emotion:p.emotion});
 })).concat(choice('继续游园',closeDialogue)),{portrait:false});
}
const teaTopics={
 weather:['说说天气','春日的天色明净，连杯沿的一点水光都好看。风有些凉，茶却温着。'],
 flowers:['说说花事','花落在阶前，不必都说成可惜。愿意拾便拾，愿意看它随风去，也有那样的自在。'],
 books:['说说书','一卷书可以慢慢读，茶也可以慢慢添。今早读到的字，到了灯下，也许又有不同的意思。'],
 qin:['说说琴','听过琴，再听壶里的水轻轻一响，竟也像有余音。原来清静不是一点声音也没有。']
};
function drinkTea(topic=null){
 const ids=Object.keys(teaTopics);topic=topic||ids[journey.activities.tea%ids.length];const [label,base]=teaTopics[topic];journey.activities.tea++;
 const band=timeBand(),suffix={morning:'晨间这一盏，香气尤其轻。',day:'午后的茶，不妨再续一盏。',dusk:'薄暮的光映着杯中水色，且再坐坐。',night:'灯下添茶，暖意便留在手边。'}[band],text=base+'\n\n'+suffix;
 entry('quotes',{id:'tea-'+topic+'-'+band,title:'茶边心语 · '+label.slice(2),text});saveProgress(true);
 showPanel('林黛玉',text,[choice('再品一盏',()=>drinkTea(topic)),...ids.filter(k=>k!==topic).map(k=>choice(teaTopics[k][0],()=>drinkTea(k))),choice('继续游园',closeDialogue)],{emotion:topic==='flowers'?'default':'happy'});
}
register('qin',playQin);register('writing',writePoem);register('tea',drinkTea);
objectOption('qin','抚一曲',playQin);objectOption('desk','写一页诗',writePoem);objectOption('tea','品一盏茶',()=>drinkTea());objectOption('bed','小憩一阵',()=>run('rest'));
