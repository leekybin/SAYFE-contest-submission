const {spawnSync} = require('node:child_process');
const path = require('node:path');
const ffmpeg=path.join(__dirname,'render-tools/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');
const target=path.join(__dirname,'SAYFE_pleos_demo.mp4');
const font="fontfile='C\\:/Windows/Fonts/malgun.ttf'";
const enabled="enable='lt(t,26)'";
const label=(value,x,y,size)=>"drawtext="+font+":text='"+value+"':x="+x+":y="+y+":fontsize="+size+":fontcolor=white:box=1:boxcolor=0x102234cc:boxborderw=12:"+enabled;
const filter=[
'[1:v]split=2[base][diagramSource]',
'[diagramSource]crop=1792:610:64:120,scale=660:225[diagram]',
'[0:v]setpts=PTS-STARTPTS,scale=1084:610[actual]',
"[base]drawbox=x=64:y=120:w=1792:h=610:color=0x102234:t=fill:"+enabled+'[background]',
'[background][actual]overlay=x=64:y=120:'+enabled+'[left]',
'[left][diagram]overlay=x=1184:y=260:'+enabled+'[pair]',
'[pair]'+label('Pleos 에뮬레이터 실녹화',600,142,26)+','+
label('다른 차량과의 접촉 재현',1196,162,30)+','+
label('별도 애니메이션 연출',1196,218,25)+','+
label('민트색 내 차량 / 주황색 상대 차량',1196,548,24)+','+
label('충돌 물리는 실제 SDK 기능이 아닙니다',1196,604,23)+'[out]'
].join(';');
let result=spawnSync(ffmpeg,['-hide_banner','-loglevel','warning','-y',
'-i',path.join(__dirname,'pleos-driving-raw.mp4'),
'-i',path.join(__dirname,'SAYFE_concept_demo.mp4'),
'-filter_complex',filter,'-map','[out]','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',target],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
result=spawnSync(ffmpeg,['-hide_banner','-i',target,'-f','null','-'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-ss','14.5','-i',target,'-frames:v','1',path.join(__dirname,'preview-pleos-composite.png')],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
console.log('Verified composite:',target);
