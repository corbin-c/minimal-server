const fs = require("fs");
let cleanPath = (path) => {
  path = (path[path.length-1] == "/") ? path:path+"/";
  return path;
}
let TreeMaker = (path) => {
  path = cleanPath(path);
  masterList = [];
  let makeTree = (localpath) => {
    localpath = cleanPath(localpath);
    let rootpath = localpath.replace(path,"./");
    let dir = fs.readdirSync(localpath,{withFileTypes:true});
    dir = dir.filter(e => e.name[0] != ".");
    dir = dir.map(e => {
      let name = e.name;
      if (!e.isDirectory()) {
        e = {name:rootpath+e.name,type:"file"};
        masterList.push(e.name);
      } else {
        e = {name:rootpath+e.name,type:"directory",contents:[]};
        e.contents = makeTree(localpath+name);
      }
      return e;
    });
    return dir;
  }; 
  return {tree:[{"type":"directory","name": ".","contents":makeTree(path)}],
    list:masterList};
}
module.exports = TreeMaker;
