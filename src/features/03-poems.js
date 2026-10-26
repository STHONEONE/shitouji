// Public-domain verse; narration and original selectable lines are kept separate.
const POEMS={
 zanghua:{id:'zanghua',title:'葬花吟',source:'《红楼梦》第二十七回',mood:'sad',review:'再读这些句子，我仍会为落花难过。难过便写下来，不必把每一字都解释给谁听。',text:`花谢花飞花满天，红消香断有谁怜？
游丝软系飘春榭，落絮轻沾扑绣帘。
闺中女儿惜春暮，愁绪满怀无释处，
手把花锄出绣闺，忍踏落花来复去。
柳丝榆荚自芳菲，不管桃飘与李飞。
桃李明年能再发，明年闺中知有谁？
三月香巢已垒成，梁间燕子太无情！
明年花发虽可啄，却不道人去梁空巢也倾。
一年三百六十日，风刀霜剑严相逼，
明媚鲜妍能几时，一朝飘泊难寻觅。
花开易见落难寻，阶前闷杀葬花人，
独倚花锄泪暗洒，洒上空枝见血痕。
杜鹃无语正黄昏，荷锄归去掩重门。
青灯照壁人初睡，冷雨敲窗被未温。
怪奴底事倍伤神，半为怜春半恼春：
怜春忽至恼忽去，至又无言去不闻。
昨宵庭外悲歌发，知是花魂与鸟魂？
花魂鸟魂总难留，鸟自无言花自羞。
愿奴胁下生双翼，随花飞到天尽头。
天尽头，何处有香丘？
未若锦囊收艳骨，一抔净土掩风流。
质本洁来还洁去，强于污淖陷渠沟。
尔今死去侬收葬，未卜侬身何日丧？
侬今葬花人笑痴，他年葬侬知是谁？
试看春残花渐落，便是红颜老死时。
一朝春尽红颜老，花落人亡两不知！`},
 haitang:{id:'haitang',title:'咏白海棠',source:'《红楼梦》第三十七回',mood:'happy',review:'“偷来”与“借得”，原也不必说得郑重。花的颜色、心里的意思，偶然落在一起，读来便有一点欢喜。',text:`半卷湘帘半掩门，碾冰为土玉为盆。
偷来梨蕊三分白，借得梅花一缕魂。
月窟仙人缝缟袂，秋闺怨女拭啼痕。
娇羞默默同谁诉，倦倚西风夜已昏。`},
 tipa:{id:'tipa',title:'题帕三绝',source:'《红楼梦》第三十四回',mood:'default',review:'有些话当面不知怎样说，写在小小一幅纸上，却能慢慢理出一点头绪。如今重看，也容得下当时的自己。',text:`其一
眼空蓄泪泪空垂，暗洒闲抛却为谁？
尺幅鲛绡劳解赠，叫人焉得不伤悲！

其二
抛珠滚玉只偷潸，镇日无心镇日闲，
枕上袖边难拂拭，任他点点与斑斑。

其三
彩线难收面上珠，湘江旧迹已模糊，
窗前亦有千竿竹，不识香痕渍也无？`}
};
function poemEntry(id){const p=POEMS[id];return {id:p.id,title:p.title,text:p.text,source:p.source,type:'poem-note'};}
function openLibrary(){
 showPanel('诗笺','诗笺都在这里，随时可以翻读。',Object.values(POEMS).map(p=>choice('《'+p.title+'》',()=>readPoem(p.id))).concat(choice('回到手札',openHandbook)),{portrait:false,kind:'reader'});
}
function readPoem(id,page=0,session=null){
 const p=POEMS[id];if(!p)return;
 session=session||{finished:false};entry('notes',poemEntry(id));
 const lines=p.text.split('\n'),pages=[];for(let i=0;i<lines.length;i+=4)pages.push(lines.slice(i,i+4).join('\n'));
 page=Math.max(0,Math.min(page,pages.length-1));
 const next=()=>{
  if(page<pages.length-1){readPoem(id,page+1,session);return;}
  if(!session.finished){session.finished=true;if(!journey.memory.readIds.includes(id))journey.memory.readIds.push(id);journey.memory.poemVisits++;
   if(typeof markBurialReading==='function')markBurialReading(id);
   if(typeof advanceTime==='function')advanceTime(1,'读书');saveProgress(true);
  }
  showPanel('林黛玉',p.review,[choice('再读一次',()=>readPoem(id)),choice('说说这首诗',()=>quoteSelf('poem-'+id,'读诗自评 · '+p.title,p.review,p.mood)),choice('换一首',openLibrary),choice('继续游园',closeDialogue)],{emotion:p.mood});
 };
 const buttons=[];if(page>0)buttons.push(choice('上一页',()=>readPoem(id,page-1,session)));buttons.push(choice(page<pages.length-1?'下一页':'合上诗笺',next),choice('换一首',openLibrary));
 showPanel('《'+p.title+'》 · '+(page+1)+' / '+pages.length,pages[page]+'\n\n'+p.source,buttons,{portrait:false,kind:'reader',onE:next});saveProgress(true);
}
register('library',openLibrary);
objectOption('desk','翻读诗笺',openLibrary);objectOption('shelf','翻读诗笺',openLibrary);
