// Local-only player. Serve only the explicitly listed public demo artifacts.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const allowed=new Map([
['/',['watch.html','text/html; charset=utf-8']],
['/watch.html',['watch.html','text/html; charset=utf-8']],
['/sayfe-demo.html',['sayfe-demo.html','text/html; charset=utf-8']],
['/SAYFE_pleos_demo.mp4',['SAYFE_pleos_demo.mp4','video/mp4']],
['/SAYFE_concept_demo.mp4',['SAYFE_concept_demo.mp4','video/mp4']]
]);
http.createServer((req,res)=>{
 const item=allowed.get(new URL(req.url,'http://127.0.0.1').pathname);
 if(!item){res.writeHead(404);return res.end('Not found')}
 const file=path.join(__dirname,item[0]);
 fs.stat(file,(error,stat)=>{
 if(error){res.writeHead(404);return res.end('File not found')}
 let start=0,end=stat.size-1,code=200;
 if(req.headers.range){
 const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
 if(!range){res.writeHead(416,{'Content-Range':'bytes */'+stat.size});return res.end()}
 start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;code=206;
 if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':'bytes */'+stat.size});return res.end()}
 }
 const headers={'Content-Type':item[1],'Accept-Ranges':'bytes','Content-Length':end-start+1,'Cache-Control':'no-store'};
 if(code===206)headers['Content-Range']='bytes '+start+'-'+end+'/'+stat.size;
 res.writeHead(code,headers);
 if(req.method==='HEAD')return res.end();
 fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);
 });
}).listen(8765,'127.0.0.1',()=>console.log('SAYFE player: http://127.0.0.1:8765/'));
