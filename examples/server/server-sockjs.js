var KiteServer = require('../../server');
var SockJsServer = require('../../lib/kite-server/sockjs/server.js');

var math = new KiteServer({
  name: 'math',
  username: 'koding',
  environment: 'vagrant',
  region: 'vagrant',
  version: '1.0.0',
  serverClass: SockJsServer,
  api: {

    square: function (x, callback) {
      callback(null, x * x);
    }

  }
});

math.listen(5647);