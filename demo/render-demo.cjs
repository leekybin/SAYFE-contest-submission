// Render only the local demo artifact; no existing browser profile or tabs are accessed.
const { chromium } = require('./render-tools/node_modules/playwright');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

(async () => {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1320 },
            acceptDownloads: true,
            deviceScaleFactor: 1,
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(pathToFileURL(path.join(__dirname, 'sayfe-demo.html')).href);
        await page.evaluate(() => document.fonts.ready);
        for (const [second, name] of [[5,'driving'],[14.5,'collision'],[23,'stopped'],[32,'safety'],[42,'communication'],[55,'evidence'],[68,'handoff'],[77,'closing']]) {
            await page.locator('#seek').fill(String(second));
            await page.locator('#seek').dispatchEvent('input');
            await page.waitForTimeout(100);
            await page.locator('#scene').screenshot({ path: path.join(__dirname, 'preview-' + name + '.png') });
            console.log('Preview:', name, second);
        }
        if (errors.length) throw new Error(errors.join('\n'));
        console.log('Local demo frames rendered without JavaScript errors.');
        const downloadPromise = page.waitForEvent('download', { timeout: 120000 });
        await page.locator('#record').click();
        console.log('Recording 80-second canvas video...');
        const download = await downloadPromise;
        const destination = path.join(__dirname, 'SAYFE_concept_demo.webm');
        await download.saveAs(destination);
        if (await download.failure()) throw new Error(await download.failure());
        console.log('Saved:', destination);
        if (errors.length) throw new Error(errors.join('\n'));
        // Verify that the resulting file is decodable and has the expected dimensions.
        const videoPage = await context.newPage();
        await videoPage.goto(pathToFileURL(destination).href);
        const metadata = await videoPage.locator('video').evaluate(video => new Promise((resolve, reject) => {
            function ready() {
                if (video.readyState < 1) return;
                resolve({ width: video.videoWidth, height: video.videoHeight, duration: video.duration });
            }
            video.addEventListener('loadedmetadata', ready, {once: true});
            video.addEventListener('error', () => reject(new Error('Video decode failed')), {once: true});
            ready();
        }));
        if (metadata.width !== 1920 || metadata.height !== 1080) throw new Error('Unexpected video dimensions');
        console.log('Decoded video metadata:', JSON.stringify(metadata));
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exitCode = 1; });
