# kite.js

a kite client library for the browser and node.js

# api

## Kite(url)

you can use the kite constructor with a URL:

``` js
var Kite = require('kite')
k = new Kite('ws://my-math-service.com').connect()
k.tell('square', [4], console.log.bind(console));
// logs "null 16"
```

## kite.connect()

Open a connection to the remote service

## kite.disconnect()

Close the connection, if it is open

## kite.tell(method, params, callback)

Send an RPC to the remote service, and receive the response
