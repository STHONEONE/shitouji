const selfLines={
 morning:['晨光落在窗纸上，还带着一点凉意。今日不必急着把诗读完，先听一阵竹声也好。','default'],
 day:['春色到了浓处，连茶烟都像是慢慢的。我倒愿意把这半日留给一页书、一盏茶。','happy'],
 dusk:['看着花影一寸寸挪过去，白日里的话忽然都轻了。留几句给自己，便已经很好。','sad'],
 night:['灯下听风，倒觉得屋里比白日更静。有些心事不必说得太满，慢慢想也就是了。','default']
};
function timeBand(){const s=journey.clock.slot;return s>=3&&s<6?'morning':s>=6&&s<9?'day':s>=9&&s<11?'dusk':'night';}
function quoteSelf(id,title,text,emotion='default',back=openHeart){
 entry('quotes',{id,title,text});saveProgress(true);showPanel('林黛玉',text,[choice('再想一想',back),choice('继续游园',closeDialogue)],{emotion});
}
function dailyHeart(){journey.memory.visits++;const [text,mood]=selfLines[timeBand()];quoteSelf('daily-'+timeBand(),'春日心语 · '+({morning:'晨间',day:'午后',dusk:'薄暮',night:'灯下'}[timeBand()]),text,mood);}
function poemSelf(){
 const ids=journey.memory.readIds;
 if(!ids.length){quoteSelf('before-reading','翻书之前','书还没有翻开，心里也不必先有一个答案。愿意读的时候，随手拣一首就是。','default');return;}
 const options=ids.filter(id=>typeof POEMS!=='undefined'&&POEMS[id]).map(id=>choice('说说《'+POEMS[id].title+'》',()=>quoteSelf('poem-'+id,'读诗自评 · '+POEMS[id].title,POEMS[id].review,POEMS[id].mood||'default',poemSelf)));
 showPanel('林黛玉','诗里有些字，再读一遍，意思便与方才不同。',options.concat(choice('回到心语',openHeart)),{emotion:'default'});
}
function openHeart(){
 const options=[choice('此刻的心语',dailyHeart),choice('谈谈诗文',poemSelf),choice('说起风急时',()=>quoteSelf('wind','花事心语','风过得急，我偶尔也要恼它一恼。并不是怨春天，只是见不得花瓣沾在泥水里。','angry')),choice('看看新光景',()=>quoteSelf('new-light','窗前心语','方才还不曾留意，这窗格的影子竟已移到了书边。原来静静坐着，也能遇见一点新鲜事。','surprised'))];
 if(journey.memory.visits>=3&&Object.values(journey.burial.days).some(d=>d.finished))options.push(choice('再说一点心事',()=>quoteSelf('deep-spring','暮春深谈','有时我并不盼谁替我把心事说清。那一日，去过花坛也好，没有去也好，花开花落都在。如今能把当时的心情留在纸上，便不算辜负自己。','sad')));
 const past=Object.values(journey.burial.days).filter(d=>d.finished).at(-1);
 if(past)options.push(choice('记起那一日的花事',()=>run('burial-memory',past)));
 options.push(choice('继续游园',closeDialogue));showPanel('林黛玉','此刻想留哪一句给自己？',options,{emotion:'default'});
}
function openHandbook(){
 const opts=[choice('日常心语',openHeart)];
 for(const [label,key]of [['翻读诗笺','library'],['查看图鉴','journal'],['小憩一阵','rest']])if(spring.handlers[key])opts.push(choice(label,()=>run(key)));
 opts.push(choice('操作说明',()=>observe('WASD／方向键行走，Shift 疾走。靠近物件按 E 互动；F 拾花或调查。H 心语，J 手札，P 保存，Esc 收起。各项活动随时可做，按自己的心情停留。','游园手札')),choice('回到游园',closeDialogue));
 showPanel('游园手札','这里收着随手可做的几件小事。',opts,{portrait:false,kind:'menu'});
}
register('heart',openHeart);register('menu',openHandbook);
