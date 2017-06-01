# Kite.js

[![Build Status](https://travis-ci.org/koding/kite.js.svg?branch=master)](https://travis-ci.org/koding/kite.js)
[![NPM version](https://img.shields.io/npm/v/kite.js.svg?style=flat-square)](https://www.npmjs.com/package/kite.js)

[kite](https://github.com/koding/kite) for node.js and browser.

# Installation

```sh
npm install kite.js
```

or via git:

```sh
git clone git://github.com/koding/kite.js.git
npm i
```

This would automatically fire the initial build for you. Or else once you clone the repository you can do:

```sh
npm run bundle
```

which generates a bundle for the browser, and you can find the output under `./dist/`

# Getting started

In node:
``` js
const { Kite, Kontrol } = require('kite.js');
```

In the browser:
``` html
<script src="./dist/bundle.js"></script>
```
will expose `Kite` and `Kontrol` over `window`

# API

## Kite

You can use the `Kite` constructor with a URL:

```js
const { Kite } = require('kite');
let k = new Kite('ws://my-math-service.com');
k.tell('square', 4).then(console.log.bind(console));
// logs "16"
```

### `kite.connect()`

Open a connection to the remote service.  Called the first time in the constructor.

### `kite.disconnect()`

Close the connection, if it is open.

### `kite.tell(method, params)`

Send an RPC to the remote service, and receive the response. Returns a Promise.


## Kontrol

Parameters can be like following for `Kontrol`;

```javascript
var params = {
  query: { /* kontrol query */ }
  who: { /* kite.who query */  }
}
```

You need a valid query object to work with Kontrol; The kontrol query is used by kontrol to select matching kites by the following criteria, which are order from general to specific:

```go
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

### Kite Descriptors

Kite Descriptors are provided by Kontrol, and looks like this:

```javascript
let kiteDescriptor = {
  kite: {
    name: "A Kite Name",
    version: "1.0.0"
  },
  token: "A token provided by kontrol",
  url: "wss://example.com/sample-kite"
};
```

### `kite.who`

Kites can implement custom load-balancing strategies for other instances of their kind.  This works by delegation: First kontrol will query for any kite matching the given criteria; If it matches one, it will forward the kite.who query to the `kite.who` method a matching kite.  The contents of the kite.who query are application-layer concerns, and are not scrutinized by kontrol, which merely forwards them along to the target kite.  The target kite can treat this information however it likes, but is required to respond to the `kite.who` method with a new query that will match the kite which is designated to be the new target kite.  It is acceptable for the kite to respond with a query matching itself.

This can be useful if the kite is using some kind of session state.  If a given kite has already allocated resources or has some state stored locally, the user can be reconnected to that instance via this mechanism.

### `kontrol.fetchKites(params)`

This method will respond with any kites that matched the query, after any potential load balancing negotiation.
The matching kites will not be connected.  You can connect to one by calling its `.connect()` method.

### `kontrol.fetchKite(params)`

This works by querying using fetchKites, and then simply choosing one of the kites matching the given query, after load balancing negotiation.

### `kontrol.watchKites(params)`

This works like `fetchKites`, but will also stream through any updates matching the query as they occur.  It will respond with an additional parameter, the `watcherID` which is a numeric handle that can be used to cancel that `watchKites` operation.

This feature won't work in conjunction with `kite.who`

### `kontrol.cancelWatcher(id)`

Given the numeric `watcherID` handle provided by `watchKites`, `cancelWatcher` can be used to clear the associated watch operation.

### `kontrol.createKite(kiteDescriptor)`

Given a kite descriptor, this method will instantiate a proper `Kite` instance.


# License

MIT (c) 2017 Koding
