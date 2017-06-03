### node-pre-gyp
This is dev-tool for automatical packaging and uploading to GitHub a release files prebuil with node-pre-gyp 
for any platform/version/arch
### Instalation
`npm i -D pre-gyp-pack`
### Configuration
add to package.json
* OWNER is owner from github
* REPO is a repository name
* VERSION is a tag name
* NPM-NAME package name from npmjs.com

```
  "pre-gyp-pack":{
    "owner":"OWNER",
    "repo":"REPO",
    "platforms":{
      "electron":{
        "1.6.10":["x64","ia32"],
        "1.5.0":["ia32","x64"]
      },
      "node":{
        "6.10.2":["x64","ia32"]
      }
    }
  },
  "scripts": {
    "package":"pre-gyp-pack",
```
do not forget to change this lines
```
  "binary": {
    "module_name": "NPM-NAME",
    "host": "https://github.com/OWNER/REPO/releases/download/VERSION"
  },
```
