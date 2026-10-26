const springProps=[
 {id:'lotus-pond',scene:'courtyard',x:753,y:414,source:[36,182,627,407],box:[112,73],body:[-44,-48,88,48]},
 {id:'flower-bed',scene:'courtyard',x:340,y:350,source:[645,748,593,388],box:[80,53],body:[-28,-26,56,22]},
 {id:'ink-scroll',scene:'indoor',x:769,y:159,source:[826,39,243,613],box:[38,96]},
 {id:'narcissus',scene:'indoor',x:408,y:226,source:[90,729,468,396],box:[54,46],body:[-18,-17,36,17]}
];
for(const p of springProps)(p.scene==='indoor'?roomExtras:courtyardProps).push(p);
const objectsPrepare=prepareHeroSprites;
prepareHeroSprites=function(){
 objectsPrepare();const atlas=images['spring-objects'];
 for(const p of springProps){const [sx,sy,sw,sh]=p.source;if(sx+sw>atlas.width||sy+sh>atlas.height)throw new Error('物件图集区域无效：'+p.id);const s=Math.min(p.box[0]/sw,p.box[1]/sh),c=document.createElement('canvas');c.width=Math.round(sw*s);c.height=Math.round(sh*s);const cc=c.getContext('2d');cc.imageSmoothingEnabled=true;cc.imageSmoothingQuality='high';cc.drawImage(atlas,sx,sy,sw,sh,0,0,c.width,c.height);p.sprite=c;}
 const bed=springProps.find(p=>p.id==='flower-bed');bed.effect=()=>{const d=journey.burial.days[dayId()];if(d?.dug){ctx.fillStyle='#76583f';ctx.fillRect(333,331,15,4);ctx.fillStyle='#927149';ctx.fillRect(336,330,7,2);}};
};
const objectsValid=validFoot;
validFoot=function(x,y){return objectsValid(x,y)&&!springProps.filter(p=>p.scene===state.scene&&p.body).some(p=>{const [dx,dy,w,h]=p.body;return x+6>p.x+dx&&x-6<p.x+dx+w&&y+3>p.y+dy&&y-3<p.y+dy+h;});};
landmarks.push(
 {key:'lotus',x:695,y:390,radius:31,label:'观荷',text:'池中的荷叶尚小，水纹绕过叶缘。几片花瓣浮在石沿旁，随一阵微风轻轻转动。'},
 {key:'stone-lamp',x:137,y:350,radius:27,label:'看看石灯',text:'石灯安放在院路边。白日看它朴拙，夜里点起，暖光便留在脚边。'},
 {key:'rockery',x:796,y:347,radius:28,label:'看看假山',text:'山石的孔隙间藏着细小青苔，风从石后绕过来，竹叶也跟着轻响。'},
 {key:'peach',x:266,y:278,radius:28,label:'观桃花',text:'桃花开在院角，颜色浅浅深深。近枝的花还在，远处已有几片随风落下。'}
);
roomLandmarks.push(
 {key:'scroll',x:756,y:194,radius:29,label:'观画',text:'挂轴画的是竹与石，笔色淡，留白多。看久了，竟像能听见画外的一点风声。'},
 {key:'narcissus',x:400,y:252,radius:29,label:'看看水仙',text:'水仙养在小瓷盆里，细叶托着白花，花心一点淡黄。它不占多少地方，却让窗边多了几分清雅。'},
 {key:'rug',x:470,y:405,radius:25,label:'看看织毯',text:'脚下的织毯铺在书案前，蓝纹与素色边缘相映。深木色因它显得柔和，房间也多了一分安静。'},
 {key:'lamp-east',x:850,y:310,radius:25,label:'看看宫灯',text:'宫灯悬在陈设一侧，暖色灯光照着纸与木纹。白日不显张扬，入夜便分外温柔。'},
 {key:'lamp-entry',x:379,y:467,radius:25,label:'看看宫灯',text:'入口旁留着一盏宫灯，照亮来往脚步，也照着这一室书香。'},
 {key:'chair',x:625,y:304,radius:25,label:'看看书椅',text:'书椅收在案后，椅背的花纹已经看惯了。读书写字时坐下，便觉得这一处很妥帖。'}
);
objectOption('lotus','拾一片水边花瓣',()=>{const added=entry('petals',{id:'pond-petal',title:'水边花瓣',text:'在荷花池石沿旁拾到的一片花瓣，带着一点清润水意。'});if(added)flowerDay().picked++;saveProgress(true);observe('将水边的花瓣轻轻拾起，收在手札里。池中水纹仍慢慢散开。','荷花池');});
objectOption('lotus','观一会儿荷',()=>quoteSelf('lotus-'+timeBand(),'荷边心语','荷叶还小，水光却已满池。许多好景不必等它长成，此刻看着，也自有此刻的好。','happy'));
objectOption('stone-lamp','点亮石灯',()=>{journey.activities.lampLit=true;saveProgress(true);observe(journey.clock.slot>=9||journey.clock.slot<3?'灯光暖暖地落在石沿上，夜色也柔和了些。':'灯芯已经安放妥当。入夜时，院路边会留着一点暖光。','石灯');});
objectOption('peach','说起花事',()=>quoteSelf('peach-'+timeBand(),'桃花心语','近枝的花还在，风里又有新落的花瓣。开与落各有时候，今日只看今日这一枝。','default'));
objectOption('scroll','说说画里的竹',()=>quoteSelf('scroll','观画心语','画里只画了几竿竹，纸上却留得住一庭清气。那些未画满的地方，也都是意思。','default'));
