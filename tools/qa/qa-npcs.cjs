const {chromium,launchOptions,projectRoot,gameUrl,outputPath}=require('./runtime.cjs'),assert=require('node:assert/strict'),fs=require('node:fs');
const root=projectRoot.replaceAll('\\','/')+'/';
(async()=>{const b=await chromium.launch({...launchOptions,headless:true});try{
const p=await b.newPage({viewport:{width:1536,height:950}}),errors=[];p.on('pageerror',e=>errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await p.goto(gameUrl);await p.waitForFunction(()=>state.ready&&spring.ready);await p.click('#new-spring');
console.log('loaded');
const frames=await p.evaluate(()=>Object.fromEntries(Object.entries(npcSprites).map(([id,v])=>[id,Object.fromEntries(Object.entries(v).map(([dir,a])=>[dir,a.map(s=>[s.width,s.height])]))])));assert.equal(Object.keys(frames).length,10);for(const v of Object.values(frames))for(const a of Object.values(v))assert.equal(a.length,3);
for(const[home,id]of[['yihong','baoyu'],['hengwu','baochai']]){
 await p.evaluate(h=>{closeDialogue();journey.clock.slot=3;switchResidence(h);state.x=836;state.y=966;},home);await p.keyboard.press('e');assert(await p.evaluate(()=>state.scene==='indoor'));
 const present=await p.evaluate(()=>currentNPCs().map(n=>n.id));assert(present.includes(id),JSON.stringify(present));if(home==='yihong')assert(present.includes('xiren'));
 await p.screenshot({path:root+'outputs/NPC-'+home+'-入驻.png'});
 await p.evaluate(id=>{const n=npcState().people[id];n.pause=30;closeDialogue();standUp();for(const[dx,dy]of[[0,26],[26,0],[-26,0],[0,-26]])if(validFoot(n.x+dx,n.y+dy)){state.x=n.x+dx;state.y=n.y+dy;if(nearest()?.npc===id)break;}},id);
 assert.equal(await p.evaluate(()=>nearest()?.npc),id);await p.keyboard.press('e');assert(await p.getByRole('button',{name:'说些心事',exact:true}).isVisible());
 for(const name of['日常寒暄','诗文与闲谈','说些心事']){await p.getByRole('button',{name,exact:true}).click();assert((await p.locator('#dialogue-text').innerText()).includes('原著情境'));await p.getByRole('button',{name:'再说几句',exact:true}).click();}
 await p.keyboard.press('Escape');
}
console.log('PASS owners / real E / three layers');
const schedules=await p.evaluate(()=>Object.keys(NPC_CONTENT).map(id=>{const slots=[];for(let day=1;day<=30;day++)for(let slot=0;slot<12;slot++)if(npcSchedule(id,day,slot))slots.push([day,slot]);return{id,count:slots.length,first:slots[0]};}));assert(schedules.every(n=>n.count>0));
const storyResults=[];
for(const a of schedules){
 await p.evaluate(a=>{closeDialogue();journey.clock.cycle=0;journey.clock.day=a.first[0];journey.clock.slot=a.first[1];syncNPCs();const n=npcState().people[a.id];switchResidence(n.place.home);changeRoomScene(n.place.scene);},a);
 const ok=await p.evaluate(id=>{const n=npcState().people[id];return n.present&&npcTerrain(n.place,n.x,n.y)&&npcSprites[id].down.length===3;},a.id);assert(ok,a.id);
 const stories=await p.evaluate(id=>NPC_CONTENT[id].stories.map(s=>s.id),a.id);
 for(const sid of stories){await p.evaluate(([id,sid])=>npcStory(id,sid),[a.id,sid]);await p.getByRole('button',{name:'记下这一页',exact:true}).click();await p.keyboard.press('Escape');assert(await p.evaluate(sid=>!!npcState().readings[sid],sid));storyResults.push(sid);}
}
assert.equal(storyResults.length,20);console.log('PASS all10 schedules /20 repeatable stories');
await p.evaluate(()=>{closeDialogue();journey.clock.day=6;journey.clock.slot=4;switchResidence('xiaoxiang');changeRoomScene('indoor');state.x=836;state.y=620;syncNPCs();resetView();});await p.waitForTimeout(120);await p.screenshot({path:root+'reports/screenshots/npc-xiaoxiang-visitors.png'});
const snapshot=await p.evaluate(()=>{saveProgress(true);return JSON.parse(localStorage.getItem(SAVE_KEY));});await p.reload();await p.waitForFunction(()=>state.ready&&spring.ready);await p.click('#continue-spring');
const saved=await p.evaluate(()=>({readings:Object.keys(npcState().readings).length,people:Object.keys(npcState().people).length,player:state.residence,notes:journey.collections.notes.filter(n=>n.id.startsWith('npc-story-')).length}));assert.equal(saved.readings,20);assert.equal(saved.people,10);assert.equal(saved.notes,20);
await p.evaluate(()=>{journey.clock.day=1;journey.clock.slot=0;closeDialogue();syncNPCs();openNPCRoster();});const visits=await p.evaluate(()=>npcState().people.miaoyu.visits);await p.getByRole('button',{name:/妙玉 ·/}).click();await p.getByRole('button',{name:'梅雪一页',exact:true}).click();assert((await p.locator('#dialogue-text').innerText()).includes('补读'));assert.equal(await p.evaluate(()=>npcState().people.miaoyu.visits),visits);await p.keyboard.press('Escape');
assert.deepEqual(errors,[]);const report={passed:true,owners:true,schedules,storyCount:20,saveReload:saved,absentReading:true,errors};fs.writeFileSync(root+'reports/qa/npc-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
