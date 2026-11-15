// Capture this emulator only, using the Virtual Console's observed local HTTP API.
const { spawn, spawnSync } = require('node:child_process');
const path = require('node:path');
const base = 'http://127.0.0.1:8088';
const client = 'sayfe-demo-capture';
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function api(endpoint, method = 'GET') {
    const response = await fetch(base + endpoint, { method });
    const body = await response.text();
    if (!response.ok) throw Error(endpoint + ': ' + body);
    return JSON.parse(body || '{}');
}
(async () => {
    const original = await api('/vehicle/state');
    console.log('Initial state:', original.gear.actual.value, original.controls.speed_kph);
    let heartbeat;
    try {
        await api('/browser/session?client=' + client, 'POST');
        heartbeat = setInterval(() => api('/browser/session?client=' + client, 'POST').catch(console.error), 700);
        await pause(1500);
        await api('/vehicle/controls?speed=0&accelerator=0&brake=0&steering=0', 'PUT');
        await api('/vehicle/gear?gear=Drive', 'PUT');
        const remote = '/sdcard/sayfe-pleos-' + Date.now() + '.mp4';
        const record = spawn('adb', ['-s', 'emulator-5554', 'shell', 'screenrecord', '--size', '1920x1080', '--bit-rate', '8000000', '--time-limit', '27', remote]);
        record.stderr.on('data', d => console.log(String(d)));
        const done = new Promise((resolve, reject) => {
            record.on('error', reject);
            record.on('exit', code => code === 0 ? resolve() : reject(Error('screenrecord: ' + code)));
        });
        const started = Date.now();
        while (Date.now() - started < 25500) {
            const seconds = (Date.now() - started) / 1000;
            const speed = seconds < 5 ? Math.round(seconds * 9) :
                seconds < 13 ? 45 : seconds < 18 ? Math.round(45 * (18 - seconds) / 5) : 0;
            await api('/vehicle/controls?' + new URLSearchParams({
                speed: String(speed), accelerator: seconds < 5 ? '35' : '0',
                brake: seconds >= 13 && seconds < 18 ? '40' : '0', steering: '0'
            }), 'PUT');
            if (seconds >= 18) await api('/vehicle/gear?gear=Park', 'PUT');
            const state = await api('/vehicle/state');
            console.log(seconds.toFixed(1), state.gear.actual.value, state.controls.speed_kph);
            await pause(500);
        }
        await done;
        const local = path.join(__dirname, 'pleos-driving-raw.mp4');
        const pulled = spawnSync('adb', ['-s', 'emulator-5554', 'pull', remote, local], {stdio:'inherit'});
        if (pulled.status !== 0) throw Error('Video pull failed');
        console.log('Captured:', local);
    } finally {
        try {
            await api('/vehicle/controls?speed=0&accelerator=0&brake=0&steering=0', 'PUT');
            await api('/vehicle/gear?gear=Park', 'PUT');
            console.log('Emulator left stopped in Park.');
        } finally {
            clearInterval(heartbeat);
            await api('/browser/session?client=' + client + '&closing=1', 'POST').catch(console.error);
        }
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
