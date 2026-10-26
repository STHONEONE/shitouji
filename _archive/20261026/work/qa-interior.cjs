const {chromium}=require('C:/Users/Stone One/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),{pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),url=pathToFileURL(path.join(root,'outputs/潇湘馆-庭院与内室-模块03.html')).href;
(async()=>{let browser;try{
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.stack));await page.goto(url);await page.waitForFunction(()=>state.ready);
 const read=()=>page.evaluate(()=>({scene:state.scene,x:state.x,y:state.y,dir:state.dir,petals:[...state.petals],valid:validFoot(state.x,state.y),dialogue:state.dialogue}));
 const walk=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);await page.waitForTimeout(40)};
 const moveTo=async(x,y)=>{for(const axis of ['x','y']){for(let n=0;n<35;n++){const s=await read(),delta=(axis==='x'?x:y)-s[axis];if(Math.abs(delta)<4)break;await walk(axis==='x'?(delta>0?'d':'a'):(delta>0?'s':'w'),Math.min(180,Math.abs(delta)/103*1000));if(n===34)throw new Error('Movement stuck toward '+x+','+y+' at '+JSON.stringify(await read()));}}};
 assert.equal(await page.title(),'潇湘馆 · 庭院与内室');assert.equal(await page.locator('#loading').isVisible(),false);
 assert.equal((await read()).scene,'indoor');await moveTo(480,549);await page.keyboard.press('e');assert.equal((await read()).scene,'courtyard');await moveTo(480,350);
 await moveTo(340,350);await page.keyboard.press('f');assert.equal((await read()).petals.filter(Boolean).length,1);
 await moveTo(480,350);await moveTo(480,218);await page.keyboard.press('e');assert.equal((await read()).scene,'indoor');assert((await read()).valid);assert.equal((await read()).petals.filter(Boolean).length,1);
 await page.screenshot({path:path.join(root,'outputs/潇湘馆-室内布置-实测.png'),fullPage:true});
 console.log('PASS courtyard -> E at room door -> furnished interior; collected petals preserved');
 const reachability=await page.evaluate(()=>{
  const step=8,cols=120,rows=75,key=(x,y)=>y*cols+x,seen=new Uint8Array(cols*rows),queue=[];
  const sx=Math.floor(state.x/step),sy=Math.floor(state.y/step);queue.push([sx,sy]);seen[key(sx,sy)]=1;
  for(let k=0;k<queue.length;k++){const [x,y]=queue[k];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=cols||ny>=rows||seen[key(nx,ny)]||!roomValidFoot(nx*step+4,ny*step+4))continue;seen[key(nx,ny)]=1;queue.push([nx,ny]);}}
  return {landmarks:roomLandmarks.map(p=>({key:p.key,reachable:queue.some(([x,y])=>Math.hypot(x*step+4-p.x,y*step+4-p.y)<p.radius-6)})),visited:queue.length,propCount:roomProps.length,solid:!roomValidFoot(592,365),walls:!roomValidFoot(40,300)};
 });
 assert(reachability.landmarks.every(p=>p.reachable),JSON.stringify(reachability));assert.equal(reachability.propCount,10);assert(reachability.solid&&reachability.walls);
 console.log('PASS all '+reachability.landmarks.length+' indoor hotspots reachable; desk and room boundaries block walking');
 await moveTo(592,430);await page.keyboard.press('e');assert.equal((await read()).dialogue,true);assert((await page.locator('#dialogue-text').innerText()).includes('诗笺'));
 const paused=await read();await walk('d',200);assert.equal((await read()).x,paused.x);await page.screenshot({path:path.join(root,'outputs/潇湘馆-书案互动-实测.png')});await page.keyboard.press('Escape');
 await moveTo(480,430);await moveTo(480,549);await page.keyboard.press('e');assert.equal((await read()).scene,'courtyard');assert.equal((await read()).petals.filter(Boolean).length,1);
 console.log('PASS actual desk approach / E inspect / dialogue pause / Esc / return door / petals preserved');
 await page.keyboard.press('e');assert.equal((await read()).scene,'indoor');await moveTo(420,385);await walk('s',80);await page.waitForTimeout(2700);await page.screenshot({path:path.join(root,'outputs/潇湘馆-室内布置-实测.png'),fullPage:true});
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.stack));await mobile.goto(url);await mobile.waitForFunction(()=>state.ready);await mobile.evaluate(()=>changeRoomScene('indoor'));
 assert.equal(await mobile.locator('#touch').isVisible(),true);assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const a=await mobile.locator('.place').boundingBox(),b=await mobile.locator('.identity').boundingBox();assert(a.x+a.width<b.x,'mobile plaques must not overlap');
 await mobile.screenshot({path:path.join(root,'work/interior-mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
 fs.writeFileSync(path.join(root,'work/interior-qa-result.json'),JSON.stringify({passed:true,errors,reachability,offline:true},null,2));
 console.log('PASS offline HTML / mobile controls and headings / no runtime exceptions');
}finally{if(browser)await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
