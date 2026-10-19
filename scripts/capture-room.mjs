import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const out=process.argv[2]||'test-results/review';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const metrics=[];
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{new MutationObserver(()=>{if(document.querySelector('[data-status="ready"]')&&!window.firstRoomFrame)window.firstRoomFrame=performance.now()}).observe(document,{subtree:true,attributes:true,childList:true})});
 await page.goto('http://127.0.0.1:5173/'+(process.env.ROOM_QUERY||''));
 await page.locator('[data-status="ready"]').waitFor({timeout:60000});
 if(await page.locator('.room-canvas[data-quality]').count()) await page.waitForFunction(()=>['low','high'].includes(document.querySelector('.room-canvas')?.dataset.quality),{},{timeout:60000});
 await page.waitForTimeout(900);
 await page.screenshot({path:out+'/'+name+'.png'});
 metrics.push({name,...await page.evaluate(()=>({firstRenderMs:window.firstRoomFrame,resources:performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0),quality:document.querySelector('[data-quality]')?.getAttribute('data-quality'),sampleFps:document.querySelector('[data-quality]')?.getAttribute('data-sample-fps')})),errors});
 await page.close();
}
await fs.writeFile(out+'/metrics.json',JSON.stringify(metrics,null,2));console.log(JSON.stringify({out,metrics}));await browser.close();
