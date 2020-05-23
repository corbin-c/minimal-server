const http = require("http");
const fs = require("fs");
const TreeMaker = require("./tree.js");

const TEXT = [ "css", "csv", "htm", "html", "js", "json", "jsonld", "mjs",
"php", "sh", "svg", "txt", "xhtml", "xml" ]; //files read & served as text files;

const MIMES = { //list extracted from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  "aac":"audio/aac",
  "abw":"application/x-abiword",
  "arc":"application/x-freearc",
  "avi":"video/x-msvideo",
  "azw":"application/vnd.amazon.ebook",
  "bin":"application/octet-stream",
  "bmp":"image/bmp",
  "bz":"application/x-bzip",
  "bz2":"application/x-bzip2",
  "csh":"application/x-csh",
  "css":"text/css",
  "csv":"text/csv",
  "doc":"application/msword",
  "docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "eot":"application/vnd.ms-fontobject",
  "epub":"application/epub+zip",
  "gz":"application/gzip",
  "gif":"image/gif",
  "htm":"text/html; charset=utf-8",
  "html":"text/html; charset=utf-8",
  "ico":"image/vnd.microsoft.icon",
  "ics":"text/calendar",
  "jar":"application/java-archive",
  "jpeg":"image/jpeg",
  "jpg":"image/jpeg",
  "js":"text/javascript",
  "json":"application/json",
  "jsonld":"application/ld+json",
  "mid":"audio/midi",
  "midi":"audio/midi",
  "mjs":"text/javascript",
  "mp3":"audio/mpeg",
  "mpeg":"video/mpeg",
  "mpkg":"application/vnd.apple.installer+xml",
  "odp":"application/vnd.oasis.opendocument.presentation",
  "ods":"application/vnd.oasis.opendocument.spreadsheet",
  "odt":"application/vnd.oasis.opendocument.text",
  "oga":"audio/ogg",
  "ogv":"video/ogg",
  "ogx":"application/ogg",
  "opus":"audio/opus",
  "otf":"font/otf",
  "png":"image/png",
  "pdf":"application/pdf",
  "php":"application/php",
  "ppt":"application/vnd.ms-powerpoint",
  "pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "rar":"application/vnd.rar",
  "rtf":"application/rtf",
  "sh":"application/x-sh",
  "svg":"image/svg+xml",
  "swf":"application/x-shockwave-flash",
  "tar":"application/x-tar",
  "tif":"image/tiff",
  "tiff":"image/tiff",
  "ts":"video/mp2t",
  "ttf":"font/ttf",
  "txt":"text/plain",
  "vsd":"application/vnd.visio",
  "wav":"audio/wav",
  "weba":"audio/webm",
  "webm":"video/webm",
  "webp":"image/webp",
  "woff":"font/woff",
  "woff2":"font/woff2",
  "xhtml":"application/xhtml+xml",
  "xls":"application/vnd.ms-excel",
  "xlsx":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "xml":"application/xml",
  "xul":"application/vnd.mozilla.xul+xml",
  "zip":"application/zip",
  "3gp":"video/3gpp",
  "3g2":"video/3gpp2",
  "7z":"application/x-7z-compressed"
}

let getFile = (path,bin=false) => {
  return new Promise((resolve,reject) => {
    fs.readFile(path,(bin)?null:"utf8",(error,data) => {
      if (error) { reject(error); }
      resolve(data);
    });
  });
};

module.exports = class minimalServer {
  constructor(mimes={}) {
    this.port = process.env.PORT || 5000;
    this.routes = [];
    this.MIMES = mimes;
    this.verbose = true;
    this.server = http.createServer((...args) => { this.handler.call(this,...args) });
  }
  errorHandler(...err) {
    console.log(...err);
  }
  async handler(req,res) {
    req.page = new URL("http://"+req.headers.host+req.url);
    if (this.verbose) {
      console.log((new Date()).toISOString()+"\t"+req.url);
    }
    try {
      this.routes.find(e => e.path == req.page.pathname).handler(req,res);
    } catch (e) {
      this.errorHandler("route "+req.page.pathname+" couldn't be followed",e);
    }
  }
  async setStaticFileRoute(routePath,localPath,live=false,binary="auto") {
    let file = { path: localPath };
    file.ext = file.path.split(".")[file.path.split(".").length-1];
    file.bin = (binary == "auto") ?
      !TEXT.some(ext => ext == file.ext)
      : (binary==true)
    file.mime = (MIMES[file.ext] || this.MIMES[file.ext] || "text/plain");
    file.content = (live) ?
      {path: file.path, txt: file.bin}
      : await getFile(file.path,file.bin);
    let route = ((path,mime,content) => {
      return ({
        path:path,
        handler:(async (req,res) => {
          res.writeHead(200, {"Content-Type": mime});
          if (typeof content.txt === "boolean") {
            res.write(await getFile(content.path, content.txt));
          } else {
            res.write(content);
          }
          res.end();
        })
      });
    })(routePath,file.mime,file.content);
    this.route = route;
  }
  json(obj) {
    return ((req,res) => {
      res.writeHead(200, {"Content-Type": "application/json"});
      res.write(JSON.stringify(obj));
      res.end();
    })
  }
  async enableStaticDir(live=false,path="./dist",index="index.html") {
    try {
      (await TreeMaker(path)).list.map(e => {
        e = {path:e.slice(1)};
        this.setStaticFileRoute(e.path,path+e.path,live);
        if (e.path.indexOf(index) >= 0) {
          this.setStaticFileRoute("/",path+e.path,live);
        }
      });
    } catch (e) {
      this.errorHandler("Error building static dir tree",e)
    }
  }
  start() {
    this.server.listen(this.port)
  }
  set route(value) {
    this.routes.push(value);
  }
};
