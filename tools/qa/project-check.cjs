const {chromium,launchOptions,projectRoot,gameUrl,outputPath}=require('./runtime.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const capture=process.argv.includes('--capture-baseline');
const {pathToFileURL}=require('node:url');
const baselineGame='D:/AIcoding/red-dream-backups/snapshot-20261026-121354/red-dream/outputs/潇湘馆-庭院与内室-模块03.html';
(async()=>{
 const browser=await chromium.launch({...launchOptions,headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1536,height:950}}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>requests.push({url:r.url().slice(0,120),error:r.failure()?.errorText}));
  await page.goto(capture?pathToFileURL(baselineGame).href:gameUrl);await page.waitForFunction(()=>state.ready&&spring.ready);await page.click('#new-spring');
  if(capture){
   await page.evaluate(()=>{journey.clock.day=6;journey.clock.slot=4;syncNPCs();npcStory('baoyu',NPC_CONTENT.baoyu.stories[0].id,true);});
   await page.getByRole('button',{name:'记下这一页',exact:true}).click();await page.keyboard.press('Escape');
   const save=await page.evaluate(()=>{closeDialogue();entry('notes',{id:'organization-baseline',title:'整理前存档',text:'验证整理前的日期、人物与阅读记录在整理后仍可读取。'});saveProgress(true);return JSON.parse(localStorage.getItem(SAVE_KEY));});
   fs.writeFileSync(outputPath('reports/qa/organization-baseline-save.json'),JSON.stringify(save,null,2));console.log('Captured pre-rebuild save');return;
  }
  const baseline=JSON.parse(fs.readFileSync(path.join(projectRoot,'reports/qa/organization-baseline-save.json'),'utf8'));
  await page.evaluate(v=>{closeDialogue();restoreGame(v);saveProgress(true);},baseline);
  await page.reload();await page.waitForFunction(()=>state.ready&&spring.ready);await page.click('#continue-spring');
  const restored=await page.evaluate(()=>({day:journey.clock.day,slot:journey.clock.slot,notes:journey.collections.notes.some(n=>n.id==='organization-baseline'),readings:Object.keys(npcState().readings).length,people:Object.keys(npcState().people).length}));
  assert.equal(restored.day,baseline.journey.clock.day);assert.equal(restored.slot,baseline.journey.clock.slot);assert(restored.notes);assert(restored.readings>=1);assert.equal(restored.people,10);
  const imagesReport=await page.evaluate(()=>Object.entries(images).map(([id,im])=>({id,loaded:im.complete&&im.naturalWidth>0,width:im.naturalWidth,height:im.naturalHeight})));
  assert.equal(imagesReport.length,60);assert(imagesReport.every(i=>i.loaded));
  const scenes=[];
  for(const home of ['xiaoxiang','yihong','hengwu'])for(const scene of ['courtyard','indoor']){
   await page.evaluate(([home,scene])=>{closeDialogue();standUp();switchResidence(home);changeRoomScene(scene);keys.clear();roomUI();resetView();},[home,scene]);
   const start=await page.evaluate(()=>{
    // Select a clear horizontal walk segment, then move using real keyboard input.
    const bounds=homeBounds();
    for(let y=400;y<bounds.h-80;y+=36)for(let x=300;x<bounds.w-200;x+=40){
     if([0,10,20,30,40,50,60].every(d=>validFoot(x+d,y))){state.x=x;state.y=y;resetView();return{x,y,valid:true};}
    }return {valid:false};
   });assert(start.valid,home+'/'+scene);
   await page.keyboard.down('ArrowRight');await page.waitForTimeout(260);await page.keyboard.up('ArrowRight');
   const walked=await page.evaluate(()=>({x:state.x,y:state.y,valid:validFoot(state.x,state.y),home:state.residence,scene:state.scene}));
   assert(walked.valid&&walked.x>start.x+2,JSON.stringify({home,scene,start,walked}));
   await page.screenshot({path:outputPath('reports/screenshots/organization/'+home+'-'+scene+'.png')});
   scenes.push({home,scene,walked:walked.x-start.x,valid:walked.valid});
  }
  await page.evaluate(()=>{closeDialogue();standUp();switchResidence('xiaoxiang');changeRoomScene('indoor');state.x=890;state.y=370;});
  // Open the instrument's real object menu. Choose an actual reachable near point.
  const nearQin=await page.evaluate(()=>{const[x,y,w,h]=xiaoWide.indoor.rects.qin;for(const[a,b]of[[x-15,y+h/2],[x+w+15,y+h/2],[x+w/2,y-15],[x+w/2,y+h+15]]){state.x=a;state.y=b;if(validFoot(a,b)&&nearest()?.key==='qin')return true;}return false;});assert(nearQin);
  await page.keyboard.press('e');
  const labels=await page.locator('#spring-choices button').allTextContents();
  const qinLabel=labels.find(s=>/抚|琴/.test(s));assert(qinLabel,JSON.stringify(labels));
  await page.getByRole('button',{name:qinLabel,exact:true}).click();
  const audioBefore=await page.evaluate(()=>({hasContext:!!qinSound.context,state:qinSound.context?.state,buttons:[...document.querySelectorAll('#spring-choices button')].map(b=>b.textContent)}));
  if(!audioBefore.hasContext){const play=audioBefore.buttons.find(s=>/抚|拨|曲/.test(s));assert(play,JSON.stringify(audioBefore));await page.getByRole('button',{name:play,exact:true}).click();}
  await page.waitForTimeout(120);
  const audio=await page.evaluate(()=>({state:qinSound.context?.state,sampleRate:qinSound.context?.sampleRate,voices:qinSound.voices.length,activities:journey.activities.qin}));
  assert.equal(audio.state,'running');assert(audio.sampleRate>0);
  assert(audio.voices>0);await page.getByRole('button',{name:'收住琴音',exact:true}).click();
  audio.completed=await page.evaluate(()=>journey.activities.qin>0);assert(audio.completed);
  await page.keyboard.press('Escape');await page.evaluate(()=>saveProgress(true));
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const result={passed:true,platform:'desktop Chrome',source:gameUrl,restored,images:imagesReport.length,scenes,audio,errors,failedRequests:requests};
  fs.writeFileSync(outputPath('reports/qa/organization-runtime.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
