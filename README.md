# kite.js

_Warning:_ This is not yet stable, and should not be depended upon at this time.

a kite client library for the browser and node.js

# installation

``` sh
npm install kite.js
```

# requiring kite.js

In node:
``` js
var Kite = require('kite.js');
```
Or, alternatively, if you want to use the promises-based api:
``` js
var Kite = require('kite.js/promises');
```

In the browser:
``` html
<script src="./browser/kite-bundle.js"></script>
```
Or:
``` html
<script src="./browser/kite-bundle-promises.js"></script>
```
After which point you can require it like this:
``` javascript
var Kite = require('kite');
```
# api

## Kite(url)

you can use the `Kite` constructor with a URL:

``` js
var Kite = require('kite');
k = new Kite('ws://my-math-service.com');
k.tell('square', [4], console.log.bind(console));
// logs "null 16"
```

## kite.connect()

Open a connection to the remote service.  Called the first time in the constructor.

## kite.disconnect()

Close the connection, if it is open.

## kite.tell(method, params, callback)

Send an RPC to the remote service, and receive the response.

## kite.tell(method, params[, callback])

If you are using the promisified library, the callback is optional.  Of course, you should use promises instead of passing callbacks if you choose to use the promisified library.

# kontrol api

getKites Calls the callback function with the list of NewKite instances.
The returned kites are not connected. You must connect with
NewKite.connect().

Query parameters are below from general to specific:

``` go
type KontrolQuery struct {
  username    string
  environment string
  name        string
  version     string
  region      string
  hostname    string
  id          string
}
```

## k.fetchKites(selector, callback)

## k.fetchKite(selector, callback)

## k.watchKites(selector, callback)

## k.cancelWatcher(id, callback)

## k.createKite(kiteDescriptor) : Kite


