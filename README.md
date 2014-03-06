# kite.js

a kite client library for the browser and node.js

# installation

For the time being, installation can be accomplished like this:

``` sh
git clone git@github.com:koding/kite.js.git
cd kite.js
npm install
make
```

# requiring kite.js

In node:
``` js
var Kite = require('kite');
```
Or, alternatively, if you want to use the promises-based api:
``` js
var Kite = require('kite/promises');
```

In the browser:
``` html
<script src="./bundle.js"></script>
```
Or:
``` html
<script src="./bundle-promises.js"></script>
```
After which point the global symbol `Kite` will be exposed.

# api

## Kite(url)

you can use the kite constructor with a URL:

``` js
var Kite = require('kite')
k = new Kite('ws://my-math-service.com')
k.connect()
k.tell('square', [4], console.log.bind(console));
// logs "null 16"
```

## kite.connect()

Open a connection to the remote service

## kite.disconnect()

Close the connection, if it is open

## kite.tell(method, params, callback)

Send an RPC to the remote service, and receive the response.

## kite.tell(method, params[, callback])

If you are using the promisified library, the callback is optional.  Of course, you should use promises instead of passing callbacks if you choose to use the promisified library.

