const {chromium,launchOptions,projectRoot,gameUrl,outputPath}=require('./runtime.cjs');
const {pathToFileURL}=require('url');
const dir=outputPath('outputs/playwright/npc-closeout/');
(async()=>{
 const browser=await chromium.launch({...launchOptions,headless:true});
 const page=await browser.newPage({viewport:{width:1536,height:950}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(gameUrl);
 await page.waitForFunction(()=>state.ready&&spring.ready);
 await page.click('#new-spring');await page.waitForTimeout(200);
 const initial=await page.evaluate(()=>({bounds:homeBounds(),scene:state.scene,x:state.x,y:state.y,valid:validFoot(state.x,state.y),zoom:gameView.zoom,ready:state.ready,canvas:[canvas.width,canvas.height]}));
 if(initial.bounds.w!==1672||initial.scene!=='indoor'||!initial.valid)throw Error('initial '+JSON.stringify(initial));
 await page.screenshot({path:dir+'xiao-wide-indoor.png'});
 // Actual E flow at object footprints, time/collection use unchanged handlers.
 async function spot(scene,x,y){await page.evaluate(([scene,x,y])=>{closeDialogue();standUp();state.scene=scene;state.x=x;state.y=y;keys.clear();roomUI();resetView();},[scene,x,y]);}
 await spot('indoor',347,400);await page.keyboard.press('e');
 await page.getByRole('button',{name:'躺下',exact:true}).click();
 if(!await page.evaluate(()=>state.pose?.kind==='lying'))throw Error('lying');
 await page.screenshot({path:dir+'xiao-wide-bed.png'});
 const time=await page.evaluate(()=>journey.clock.slot);
 await page.getByRole('button',{name:'歇一阵',exact:true}).click();
 if(!await page.evaluate(t=>!state.pose&&validFoot(state.x,state.y)&&journey.clock.slot!==t,time))throw Error('rest stand');
 const seats=await page.evaluate(()=>xiaoWide.indoor.seats.map(p=>({x:p.x,y:p.y})));
 for(let i=0;i<seats.length;i++){
  await spot('indoor',seats[i].x,seats[i].y+28);
  await page.evaluate(()=>sitDown(false));
  if(!await page.evaluate(()=>state.pose?.kind==='seated'))throw Error('sit');
  if(i===0)await page.screenshot({path:dir+'xiao-wide-seat.png'});
  await page.getByRole('button',{name:'品一盏茶',exact:true}).click();
  await page.keyboard.press('ArrowDown');
  if(!await page.evaluate(()=>!state.pose&&validFoot(state.x,state.y)))throw Error('seat stand '+i);
 }
 await spot('indoor',1047,469);await page.keyboard.press('e');
 if(!await page.evaluate(()=>state.pose?.id==='chair'))throw Error('study E');
 if(!await page.getByRole('button',{name:'写一页诗',exact:true}).isVisible())throw Error('write');
 await page.keyboard.press('ArrowDown');
 await spot('courtyard',836,400);await page.keyboard.press('e');
 if(!await page.evaluate(()=>state.scene==='indoor'&&state.x===836&&state.y===807))throw Error('enter');
 await page.keyboard.press('e');
 if(!await page.evaluate(()=>state.scene==='courtyard'&&state.x===836&&state.y===400))throw Error('return');
 await page.screenshot({path:dir+'xiao-wide-courtyard.png'});
 // Grid connectivity ensures a real route between entry, bed, tea, desk, qin.
 const paths=await page.evaluate(()=>{
  state.scene='indoor';const step=8,start=[836,807],queue=[start],seen=new Set(['836,807']);
  for(let i=0;i<queue.length;i++){const[x,y]=queue[i];for(const[dx,dy]of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(!seen.has(k)&&validFoot(nx,ny)){seen.add(k);queue.push([nx,ny]);}}}
  return {visited:queue.length,targets:[[356,400],[356,625],[1047,475],[890,350],[1180,310]].map(([x,y])=>queue.some(([a,b])=>Math.hypot(a-x,b-y)<18))};
 });
 if(paths.targets.some(v=>!v))throw Error('path '+JSON.stringify(paths));
 const rings=await page.evaluate(()=>{
  state.scene='indoor';return ['desk','tea','qin'].map(key=>{
   const[x,y,w,h]=xiaoWide.indoor.rects[key];
   return {key,sides:[[x-14,y+h/2],[x+w+14,y+h/2],[x+w/2,y-14],[x+w/2,y+h+14]].map(([xx,yy])=>{state.x=xx;state.y=yy;return{valid:validFoot(xx,yy),near:nearest()?.key};})};
  });
 });
 if(rings.some(r=>r.sides.some(s=>!s.valid||s.near!==r.key)))throw Error('ring '+JSON.stringify(rings));
 await spot('courtyard',836,650);
 const picked=await page.evaluate(()=>{state.x=flowers[0].x;state.y=flowers[0].y;pickFlower();saveProgress(true);return journey.collections.petals.length;});
 await page.reload();await page.waitForFunction(()=>state.ready&&spring.ready);await page.click('#continue-spring');
 if(!await page.evaluate(n=>journey.collections.petals.length===n&&state.scene==='courtyard'&&validFoot(state.x,state.y),picked))throw Error('save reload');
 const oldSave=await page.evaluate(()=>{const v=savedGame();delete v.journey.extensions.xiaoxiangArt;v.scene='indoor';v.x=480;v.y=500;v.journey.extensions.residences.current='xiaoxiang';restoreGame(v);return{valid:validFoot(state.x,state.y),clock:journey.clock.slot,petals:journey.collections.petals.length};});
 if(!oldSave.valid||oldSave.petals!==picked)throw Error('migration');
 for(const id of ['yihong','hengwu','xiaoxiang']){await page.evaluate(id=>switchResidence(id),id);if(!await page.evaluate(()=>validFoot(state.x,state.y)))throw Error('travel '+id);}
 await page.setViewportSize({width:1920,height:1080});await page.waitForTimeout(150);
 await spot('indoor',836,807);await page.evaluate(()=>fitBrowserFrame());
 await page.screenshot({path:dir+'xiao-wide-1920.png'});
 if(errors.length)throw Error(errors.join('\n'));
 console.log(JSON.stringify({initial,paths,rings,saveReload:true,migration:oldSave,errors}));await browser.close();
})();

