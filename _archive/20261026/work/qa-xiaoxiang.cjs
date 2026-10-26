const {chromium}=require('C:/Users/Stone One/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..'),html=path.join(root,'outputs/潇湘馆-林黛玉-模块02.html');
(async()=>{let browser;try{
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 await page.goto(pathToFileURL(html).href);
 await page.waitForFunction(()=>state.ready);
 assert.equal(await page.title(),'潇湘馆 · 林黛玉');
 assert.equal(await page.locator('#loading').isVisible(),false);
 const actor=await page.locator('.identity').innerText();assert(actor.includes('林黛玉'));
 await page.screenshot({path:path.join(root,'outputs/潇湘馆-实测.png'),fullPage:true});
 const read=()=>page.evaluate(()=>({x:state.x,y:state.y,dir:state.dir,petals:[...state.petals],dialogue:state.dialogue,valid:validFoot(state.x,state.y)}));
 const walk=async(key,ms)=>{await page.keyboard.down(key);await page.waitForTimeout(ms);await page.keyboard.up(key);await page.waitForTimeout(80)};
 let before=await read();assert(before.valid);
 for(const [key,axis,sign] of [['w','y',-1],['s','y',1],['a','x',-1],['d','x',1],['ArrowUp','y',-1],['ArrowDown','y',1],['ArrowLeft','x',-1],['ArrowRight','x',1]]){
  await walk(key,250);const after=await read();assert((after[axis]-before[axis])*sign>12,key+' moves protagonist');assert(after.valid);console.log('PASS movement '+key);before=after;
 }
 await page.locator('#reset').click();await walk('w',2400);const door=await read();assert(door.y>=210&&door.y<220,'solid door boundary');
 await page.keyboard.press('e');assert.equal((await read()).dialogue,true);assert((await page.locator('#dialogue-text').innerText()).includes('诗稿'));
 await page.screenshot({path:path.join(root,'outputs/潇湘馆-房门互动.png')});
 const paused=await read();await walk('d',200);assert.equal((await read()).x,paused.x,'dialogue pauses movement');await page.keyboard.press('Escape');
 await page.locator('#reset').click();await walk('a',2300);await walk('w',1000);const tea=await read();assert(tea.y>=343&&tea.y<352,'tea table collision');console.log('PASS door / table collisions and room-threshold monologue');
 await page.locator('#reset').click();await walk('a',1300);await walk('w',140);await page.keyboard.press('f');assert.equal((await read()).petals.filter(Boolean).length,1,'Daiyu picks the first flower');await page.keyboard.press('f');assert.equal((await read()).petals.filter(Boolean).length,1,'no double collection');
 await page.locator('#help').click();assert((await page.locator('#dialogue-text').innerText()).includes('林黛玉'));await page.locator('#dialogue-close').click();
 await page.locator('#reset').click();assert.equal((await read()).petals.filter(Boolean).length,0);console.log('PASS flower collection / no duplicates / help / reset');
 const imageInfo=await page.evaluate(()=>{const d=ctx.getImageData(0,0,W,H).data;let bright=0;for(let i=0;i<d.length;i+=400)if(d[i]+d[i+1]+d[i+2]>100)bright++;return{assets:Object.keys(images).length,smoothing:ctx.imageSmoothingEnabled,bright}});
 assert.equal(imageInfo.assets,3);assert.equal(imageInfo.smoothing,false);assert(imageInfo.bright>3000);
 const sprites=await page.evaluate(()=>Object.entries(heroSprites).map(([dir,s])=>({dir,w:s.width,h:s.height})));
 assert.equal(sprites.length,4);assert(sprites.every(s=>s.h===84&&s.w>25&&s.w<85));console.log('PASS reference-card four-direction sprites: '+JSON.stringify(sprites));
 const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});mobile.on('pageerror',e=>errors.push(e.stack));await mobile.goto(pathToFileURL(html).href);await mobile.waitForFunction(()=>state.ready);
 assert.equal(await mobile.locator('#touch').isVisible(),true);assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await mobile.screenshot({path:path.join(root,'work/xiaoxiang-mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
 console.log('PASS offline file launch / 3 embedded assets / no blank canvas / mobile controls / zero runtime exceptions');
 fs.writeFileSync(path.join(root,'work/qa-result.json'),JSON.stringify({passed:true,offline:true,checks:22,errors,imageInfo},null,2));
}finally{if(browser)await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
