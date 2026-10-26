const HOUR_NAMES=['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
function refreshCalendar(){const c=journey.clock;$('calendar').textContent='农历三月'+lunarDay(c.day)+' · '+HOUR_NAMES[c.slot]+'时';$('calendar').title='暮春。本篇以三月循环呈现春日，按自己的心情停留。';}
function advanceTime(amount,reason='停留'){
 amount=Math.max(0,Math.min(360,Math.floor(amount)));burialTick();
 for(let i=0;i<amount;i++){
  journey.clock.slot++;if(journey.clock.slot>=12){journey.clock.slot=0;journey.clock.day++;if(journey.clock.day>30){journey.clock.day=1;journey.clock.cycle++;}}
  burialTick();
 }
 journey.clock.elapsed=0;refreshCalendar();saveProgress(true);
}
function restMenu(){
 showPanel('小憩','窗前歇一歇，时光仍缓缓向前。',[
  choice('歇一阵',()=>{journey.activities.rest++;advanceTime(1,'小憩');closeDialogue();toast('歇过一阵，窗边的光影又移了些。');}),
  choice('歇到晨光',()=>{journey.activities.rest++;advanceTime(journey.clock.slot<3?3-journey.clock.slot:15-journey.clock.slot,'小憩');closeDialogue();toast('晨光重新落在窗边。');}),choice('继续游园',closeDialogue)
 ],{portrait:false});
}
spring.updateHooks.push(dt=>{if(state.dialogue)return;journey.clock.elapsed+=dt;if(journey.clock.elapsed>=120)advanceTime(1,'时辰流转');});
register('rest',restMenu);
const timeRender=render;
render=function(){timeRender();if(spring.mode!=='play')return;const s=journey.clock.slot;if(s>=9||s<3){ctx.fillStyle='rgba(20,32,63,.14)';ctx.fillRect(0,0,W,H);const lights=state.scene==='indoor'?[[873,244],[350,424]]:journey.activities.lampLit?[[76,353]]:[];for(const [x,y]of lights){const g=ctx.createRadialGradient(x,y,2,x,y,48);g.addColorStop(0,'rgba(255,210,111,.22)');g.addColorStop(1,'rgba(255,210,111,0)');ctx.fillStyle=g;ctx.fillRect(x-48,y-48,96,96);}}};
