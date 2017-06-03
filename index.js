var homedir=require("os").homedir;
var path = require("path");
var exec = require("child_process").exec;
var fs = require("fs");

var bb = require('bluebird').Promise.promisify;
var cpy = require('cpy');

var ghu = require("./gh-upload");
var npm = require("./npm-platform").npm;

function load_oauth(){
  var oauth_file_name = ".github.json";
  var oauth_file=path.join(homedir(),oauth_file_name);
  function sample(){
      console.log("sample of file:")
      console.log('{ "OAuth":"xxxxxxxxxxxxxxKEYxxxxxxxxxxxxxx" }')
  }
  return Promise.resolve(oauth_file)
    .then(bb(fs.stat))
    .catch(a=>{
      console.error("ERROR: not found file at home dir",oauth_file_name)
      sample();
      throw {error:"no OAuth file"};
    })
    .then(a=>oauth_file)
    .then(require)
    .catch(a=>{
      if (a.error)
        throw a;
      console.error("ERROR: wrong file format of",oauth_file_name)
      sample();
      throw {error:"wrong OAuth file"};
    })
}

function upload(owner,repo,tag,file){
  var api="https://api.github.com/repos/"+owner+"/"+repo;
  return load_oauth()
  .then(private=>{
    return ghu.validate(private.OAuth,api)
    .then(a=>ghu.getId(private.OAuth,api+"/releases/tags/"+tag))
    .then(a=>JSON.parse(a.body))
    .then(tag=>ghu.upload(
        private.OAuth,
        file,
        "https://uploads.github.com/repos/"+owner+"/"+repo+"/releases/"+tag.id+"/assets",
        path.basename(file)
    ))
    .then(a=>{
      if(a.statusCode != 201)
        return console.error(a.statusCode);
      console.log(a.statusCode)
      return a;
    })
  })
}

var pkg=require(path.join(process.cwd(),"package.json"));
var pgp=pkg['pre-gyp-pack'];
var platforms=pkg['pre-gyp-pack'].platforms

Promise.resolve(path.join(".","dists"))
.then(bb(fs.stat))
.catch(stat=>bb(fs.mkdir)(stat.path))
.then(a=>{
  var chain=Promise.resolve();
  function runner(chain,platform,version,arch){
    var r=npm(platform,version,arch)
    return chain
      .then(a=>console.log(platform,version,arch))
      .then(a=>r('node-gyp rebuild --build-from-source'))
      .then(a=>r('node-pre-gyp package'))
      .then(a=>cpy([path.join(".","build","stage","*")],path.join(".","dists")))
  }
  for (platform in platforms )
    for (version in platforms[platform])
      for (arch in platforms[platform][version]){
        chain = runner(chain,platform,version,platforms[platform][version][arch])
      }
  return chain;
})
.then(a=>console.log("uploading files...."))
.then(a=>bb(fs.readdir)(path.join(".","dists")))
.then(files=>{
  var chain=Promise.resolve();
  function scope(chain,file){
    return chain
    .then(a=>console.log(file))
    .then(a=>upload(pgp.owner,pgp.repo,pgp.version||pkg.version,path.join(".","dists",file)))
  }
  files.forEach(file => {
    chain=scope(chain,file);
  });
  return chain;
})
.catch(a=>console.log("Error",a))
//console.log(pgp.version||pkg.version);
