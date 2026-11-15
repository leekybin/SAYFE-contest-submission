// Prepare only the reviewed submission files. Does not push or rewrite remote history.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function git(args,allowFailure=false){
 const result=spawnSync('git',args,{cwd:root,encoding:'utf8'});
 if(result.status!==0&&!allowFailure)throw Error(result.stderr||'Git failed');
 return result;
}
try{
 if(git(['rev-parse','--is-inside-work-tree'],true).status!==0)throw Error('Run git init -b main first.');
 const origin=git(['remote','get-url','origin'],true);
 if(origin.status===0&&origin.stdout.trim()!=='https://github.com/leekybin/SAYFE-contest-submission.git')throw Error('Unexpected origin; no changes made.');
 if(origin.status!==0)git(['remote','add','origin','https://github.com/leekybin/SAYFE-contest-submission.git']);
 git(['add','--','.gitignore','.gitattributes','.nojekyll','README.md','index.html','docs',
 'app/.gitignore','app/build.gradle.kts','app/src','build.gradle.kts','settings.gradle.kts',
 'gradle.properties','gradle','gradlew','gradlew.bat',
 'demo/.gitignore','demo/index.html','demo/watch.html','demo/sayfe-demo.html',
 'demo/SAYFE_pleos_demo.mp4','demo/SAYFE_concept_demo.mp4',
 'demo/preview-closing.png','demo/preview-collision.png','demo/preview-communication.png',
 'demo/preview-driving.png','demo/preview-evidence.png','demo/preview-handoff.png',
 'demo/preview-safety.png','demo/preview-stopped.png','demo/preview-pleos-composite.png',
 'demo/capture-pleos.cjs','demo/compose-pleos.cjs','demo/export-mp4.cjs',
 'demo/render-demo.cjs','demo/serve-demo.cjs','demo/verify-playback.cjs',
 'demo/verify-local-playback.cjs','demo/verify-submission.cjs','demo/prepare-git.cjs','demo/시연_구성안.md']);
 const names=git(['diff','--cached','--name-only']).stdout.trim().split('\n').filter(Boolean);
 const forbidden=names.filter(name=>/(^|\/)(\.idea|\.gradle|\.kotlin|node_modules|render-tools|build|submission-private)(\/|$)|local\.properties$|\.(jks|keystore|webm)$|pleos-driving-raw\.mp4$/.test(name));
 if(forbidden.length)throw Error('Unexpected public file paths: '+forbidden.join(', '));
 console.log('Reviewed staged files:',names.length);
 console.log(git(['diff','--cached','--stat']).stdout);
 console.log('Origin prepared. No commit or push performed.');
}catch(error){console.error(error.message);process.exitCode=1}
