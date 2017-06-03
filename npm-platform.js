var homedir= require("os").homedir;
var path= require("path");
var exec= require("child_process").exec;

function envElectron(version,arch,platform,buildFromSource){
  arch=arch||process.arch;
  const gypHome = path.join(homedir(), ".electron-gyp")
  return Object.assign({}, process.env, {
    npm_config_disturl: "https://atom.io/download/electron",
    npm_config_target: version,
    npm_config_runtime: "electron",
    npm_config_arch: arch,
    npm_config_target_arch: arch,
    npm_config_platform: platform,
    npm_config_build_from_source: buildFromSource,
    HOME: gypHome,
    USERPROFILE: gypHome,
  })
}
function envNode(version,arch,platform,buildFromSource){
  arch=arch||process.arch;
  const gypHome = path.join(homedir(), ".node-gyp")
  return Object.assign({}, process.env, {
    npm_config_disturl: "http://nodejs.org/dist",
    npm_config_target: version,
    npm_config_runtime: "node",
    npm_config_arch: arch,
    npm_config_target_arch: arch,
    npm_config_platform: platform,
    npm_config_build_from_source: buildFromSource,
    HOME: gypHome,
    USERPROFILE: gypHome,
  })
}
// main process: main/index.js
function run(cmd,arch,cwd){return new Promise((done,fail)=>{
    var params={env:env(appVersion,arch)};
console.log("CWD",params.cwd);
    if (cwd)
      params.cwd=cwd;
    console.log('RUN',cmd)
    exec(cmd,params,function(err,stdout,stderr){
      if (err)
        return fail(stderr)
      done(stdout);
    })
  })
}
var runner=(platform,version,arch)=>(cmd,cwd)=>new Promise((done,fail)=>{
    var params={env:(platform=="node"?envNode:envElectron)(version,arch)};
    if (cwd)
      params.cwd=cwd;
//console.log("CWD",process.cwd());
    console.log('RUN',cmd)
    exec(cmd,params,function(err,stdout,stderr){
      if (err)
        return fail(stderr)
      done(stdout);
    })
  })

exports.npm=runner;
