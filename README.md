# kite.js

_Warning:_ This is not yet stable, and should not be depended upon at this time.

A [Kite](https://github.com/koding/kite) client library for the browser and node.js

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

## params
``` javascript
var params = {
  query: { /* kontrol query */ }
  who: { /* kite.who query */  }
}
```

## kontrol query

The kontrol query is used by kontrol to select matching kites by the following criteria, which are order from general to specific:
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
The order matters, and more general criteria cannot be omitted.  In other words, if you want to query by `name`, you must also provide values for `username` and `environment`; if you want to query by region, you need to provide values for all of `username`, `environment`, `name` and `version`.

## kite descriptors

Kite descriptors are provided by kontrol, and look like this:

``` javascript
var kiteDescriptor = {
  kite: {
    name: "A Kite Name",
    version: "1.0.0"
  },
  token: "A token provided by kontrol",
  url: "wss://example.com/sample-kite"
};
```

## kite.who query

Kites can implement custom load-balancing strategies for other instances of their kind.  This works by delegation: First kontrol will query for any kite matching the given criteria; If it matches one, it will forward the kite.who query to the `kite.who` method a matching kite.  The contents of the kite.who query are application-layer concerns, and are not scrutinized by kontrol, which merely forwards them along to the target kite.  The target kite can treat this information however it likes, but is required to respond to the `kite.who` method with a new query that will match the kite which is designated to be the new target kite.  It is acceptable for the kite to respond with a query matching itself.

This can be useful if the kite is using some kind of session state.  If a given kite has already allocated resources or has some state stored locally, the user can be reconnected to that instance via this mechanism.

## k.fetchKites(params, callback)

This method will respond with any kites that matched the query, after any potential load balancing negotiation.

The matching kites will not be connected.  You can connect to one by calling its `.connect()` method.

## k.fetchKite(params, callback)

This works by querying using fetchKites, and then simply choosing one of the kites matching the given query, after load balancing negotiation.

## k.watchKites(params, callback)

This works like `fetchKites`, but will also stream through any updates matching the query as they occur.  It will respond with an additional parameter, the `watcherID` which is a numeric handle that can be used to cancel that `watchKites` operation.

This feature won't work in conjunction with `kite.who`

## k.cancelWatcher(id, callback)

Given the numeric `watcherID` handle provided by `watchKites`, `cancelWatcher` can be used to clear the associated watch operation.

## k.createKite(kiteDescriptor) : Kite

Given a kite descriptor, this method will instantiate a proper `Kite` instance.
