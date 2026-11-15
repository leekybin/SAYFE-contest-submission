// Package an already built release variant. Signing secrets stay in ignored .private-tools/.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
function run(command, args, env = process.env) {
    const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8' });
    if (result.status !== 0) throw Error(path.basename(command) + ' failed: ' + (result.stderr || result.error?.message || 'unknown error'));
    return result.stdout;
}
try {
    const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME ||
        path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk');
    const jdk = process.env.SAYFE_JAVA_HOME || path.join(process.env.ProgramFiles || 'C:/Program Files', 'Android', 'Android Studio', 'jbr');
    const java = path.join(jdk, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
    const keytool = path.join(jdk, 'bin', process.platform === 'win32' ? 'keytool.exe' : 'keytool');
    const tools = path.join(sdk, 'build-tools', '36.0.0');
    const signer = path.join(tools, 'lib', 'apksigner.jar');
    const zipalign = path.join(tools, process.platform === 'win32' ? 'zipalign.exe' : 'zipalign');
    const aapt = path.join(tools, process.platform === 'win32' ? 'aapt.exe' : 'aapt');
    const unsigned = path.join(root, 'app/build/outputs/apk/release/app-release-unsigned.apk');
    for (const file of [java, keytool, signer, zipalign, aapt, unsigned]) {
        if (!fs.existsSync(file)) throw Error('Required build tool or release artifact missing: ' + file);
    }
    const secretDir = path.join(root, '.private-tools', 'release-signing');
    fs.mkdirSync(secretDir, { recursive: true });
    const secretFile = path.join(secretDir, 'signing.json');
    const keyFile = path.join(secretDir, 'sayfe-release.p12');
    if (!fs.existsSync(secretFile)) {
        if (fs.existsSync(keyFile)) throw Error('Existing signing key has no credential file. Restore credentials instead of replacing the key.');
        fs.writeFileSync(secretFile, JSON.stringify({password: crypto.randomBytes(32).toString('hex')}), {flag: 'wx', mode: 0o600});
    }
    const password = JSON.parse(fs.readFileSync(secretFile, 'utf8')).password;
    if (typeof password !== 'string' || password.length < 32) throw Error('Invalid local signing credentials.');
    const env = {...process.env, SAYFE_SIGNING_PASSWORD: password};
    if (!fs.existsSync(keyFile)) {
        run(keytool, ['-genkeypair','-keystore',keyFile,'-storetype','PKCS12',
            '-storepass:env','SAYFE_SIGNING_PASSWORD','-keypass:env','SAYFE_SIGNING_PASSWORD',
            '-alias','sayfe-release','-keyalg','RSA','-keysize','3072','-validity','10000',
            '-dname','CN=SAYFE Contest, O=SAYFE, C=KR'], env);
    }
    const aligned = path.join(root, 'app/build/outputs/apk/release/submission-aligned.apk');
    const outputDir = path.join(root, 'apk');
    fs.mkdirSync(outputDir, {recursive: true});
    const output = path.join(outputDir, '보이소_SAYFE_release.apk');
    run(zipalign, ['-f','-p','4',unsigned,aligned]);
    run(java, ['-jar',signer,'sign','--ks',keyFile,'--ks-key-alias','sayfe-release',
        '--ks-pass','env:SAYFE_SIGNING_PASSWORD','--key-pass','env:SAYFE_SIGNING_PASSWORD',
        '--out',output,aligned], env);
    console.log(run(java, ['-jar',signer,'verify','--verbose','--print-certs',output]));
    console.log(run(zipalign, ['-c','-p','4',output]));
    // Windows aapt cannot reliably open Korean filenames. Inspect an identical build-only copy.
    const inspectionCopy = path.join(root, 'app/build/outputs/apk/release/submission-signed-check.apk');
    fs.copyFileSync(output, inspectionCopy);
    const badging = run(aapt, ['dump','badging',inspectionCopy]);
    if (badging.includes('application-debuggable')) throw Error('Release APK must not be debuggable.');
    console.log(badging.split('\n').filter(line=>/^(package:|sdkVersion:|targetSdkVersion:|launchable-activity:)/.test(line)).join('\n'));
    const buffer = fs.readFileSync(output);
    console.log(JSON.stringify({
        path:'apk/보이소_SAYFE_release.apk',
        bytes:buffer.length,
        sha256:crypto.createHash('sha256').update(buffer).digest('hex'),
        debuggable:false
    }));
    console.log('Keep .private-tools/release-signing backed up privately. Never commit its contents.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
