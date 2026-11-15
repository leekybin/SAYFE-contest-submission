// Verify the local, public submission page without using an existing browser profile.
const {chromium}=require('./render-tools/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
 await page.evaluate(()=>document.fonts.ready);
 for(const video of await page.locator('video').all()){
 await video.evaluate(v=>new Promise((resolve,reject)=>{
 if(v.readyState>=1)return resolve();
 v.addEventListener('loadedmetadata',resolve,{once:true});
 v.addEventListener('error',()=>reject(Error('Video load failed')),{once:true});
 }));
 await video.evaluate(v=>v.play());
 await page.waitForTimeout(900);
 if(await video.evaluate(v=>v.currentTime)<.3)throw Error('Video did not advance');
 await video.evaluate(v=>v.pause());
 }
 await page.locator('#screens').scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('#screens img')].every(i=>i.complete&&i.naturalWidth>0));
 console.log('Four screen concepts and both videos loaded.');
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:path.join(__dirname,'preview-submission.png')});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(200);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
 if(overflow)throw Error('Mobile horizontal overflow');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('Submission page passed: video playback, gallery, JavaScript, mobile layout.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
