const {chromium}=require('./render-tools/node_modules/playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage();
 await page.goto(pathToFileURL(path.join(__dirname,'watch.html')).href);
 for(const id of ['pleos','concept']){
 const v=page.locator('#'+id);
 await v.evaluate(video=>new Promise((resolve,reject)=>{
 if(video.readyState>=1)return resolve();
 video.addEventListener('loadedmetadata',resolve,{once:true});
 video.addEventListener('error',()=>reject(Error('Video error '+video.error.code)),{once:true});
 }));
 console.log(id,await v.evaluate(video=>({width:video.videoWidth,height:video.videoHeight,duration:video.duration})));
 await v.evaluate(video=>video.play());
 await page.waitForTimeout(1500);
 const progress=await v.evaluate(video=>({time:video.currentTime,error:video.error?.code||null,decoded:video.getVideoPlaybackQuality().totalVideoFrames}));
 if(progress.time<.5||progress.error||progress.decoded<1)throw Error('Playback failed: '+JSON.stringify(progress));
 console.log('Playback passed:',id,JSON.stringify(progress));
 await v.evaluate(video=>video.pause());
 }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
