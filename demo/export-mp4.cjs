// Convert the local demo render to a broadly playable MP4 and verify its duration.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const ffmpeg = path.join(__dirname, 'render-tools', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe');
const input = path.join(__dirname, 'SAYFE_concept_demo.webm');
const output = path.join(__dirname, 'SAYFE_concept_demo.mp4');
const convert = spawnSync(ffmpeg, [
    '-hide_banner', '-y', '-i', input,
    '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
    '-pix_fmt', 'yuv420p', '-r', '30', '-movflags', '+faststart', output
], { stdio: 'inherit' });
if (convert.status !== 0) process.exit(convert.status || 1);
const verify = spawnSync(ffmpeg, [
    '-hide_banner', '-i', output, '-f', 'null', '-'
], { stdio: 'inherit' });
if (verify.status !== 0) process.exit(verify.status || 1);
console.log('Verified MP4:', output);
