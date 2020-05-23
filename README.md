# minimal-server

This packages provides a minimal server.

How to use it:

```javascript
const minimalServer = require("@corbin-c/minimal-server");
let server = new minimalServer();
//one might want to define a static dir:
server.enableStaticDir("./path-to-static-dir");
//eventually start listening on port 5000 or on PORT env var, if defined:
server.start();
```

Custom routes may be defined simply, by setting a path and a handler function:

```javascript
server.route = {
  path:"/path-to-custom-route",
  handler: async (req,res) => {
    //do something here
  }
```

Additionally, this package contains a `TreeMaker` module, used to build the
static directory definition. It's used this way:

```javascript
const TreeMaker = require("@corbin-c/minimal-server/tree.js");
(async () => {
  let tree = await TreeMaker("./path-to-analyze");
});
```

The resulting `tree` variable is structured as follows:

```javascript
{
  tree: [ { type: 'directory', name: '.', contents: [Array] } ],
  list: [Array]
}
```
