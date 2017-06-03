var bb = require('bluebird').Promise.promisify;
var request = require('request');
var fs = require('fs');
exports.upload=(OAuth,filePath,upload_url,name)=>new Promise((done,fail)=>{
    var stats = fs.statSync(filePath);
    var options = {
      uri: upload_url,
      auth: {
        pass: 'x-oauth-basic',
        user: OAuth
      },
      headers: {
        'User-Agent': 'Release-Agent',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/zip',
        'Content-Length': stats.size
      },
      qs: {
        name: name
      }
    };
    fs.createReadStream(filePath).pipe(
    request.post(options, function(err, res){
      if(err)
        return fail(err);
      done(res);
    })
    );
})
//url= "https://api.github.com/repos/:owner/:repo/releases/tags/:tag"
exports.getId=(OAuth,url)=>{
    var options = {
      uri: url,
      auth: {
        pass: 'x-oauth-basic',
        user: OAuth
      },
      headers: {
        'User-Agent': 'Release-Agent',
        'Accept': 'application/vnd.github.v3+json',
      }
    };
    return bb(request)(options);
}

//url= "https://api.github.com/repos/:owner/:repo"
exports.validate=(OAuth,url)=>{
    var options = {
      uri: url,
      auth: {
        pass: 'x-oauth-basic',
        user: OAuth
      },
      headers: {
        'User-Agent': 'Release-Agent',
        'Accept': 'application/vnd.github.v3+json',
      }
    };
    return bb(request)(options)
    .then(response=>{
      if (response.statusCode!=200)
        throw("Error: Invalid repo, token or network issue!")
    });
}
