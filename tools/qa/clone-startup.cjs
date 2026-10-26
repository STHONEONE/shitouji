const{chromium,launchOptions,gameUrl,outputPath}=require('./runtime.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({...launchOptions,headless:true});try{
 const p=await b.newPage({viewport:{width:1536,height:950}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(gameUrl);await p.waitForFunction(()=>state.ready&&spring.ready);await p.click('#new-spring');
 const stateResult=await p.evaluate(()=>({scene:state.scene,residence:state.residence,valid:validFoot(state.x,state.y),images:Object.values(images).length,loaded:Object.values(images).every(im=>im.complete&&im.naturalWidth>0),npcs:Object.keys(npcState().people).length}));
 assert(stateResult.valid&&stateResult.loaded);assert.equal(stateResult.images,60);assert.equal(stateResult.npcs,10);assert.deepEqual(errors,[]);
 const result={passed:true,source:gameUrl,...stateResult,errors};fs.writeFileSync(outputPath('reports/qa/repository-startup.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
