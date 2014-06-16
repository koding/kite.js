var argv = require('minimist')(process.argv);
var fs = require('fs');
var joinPath = require('path').join;

var log = console.log.bind(console);
var warn = console.warn.bind(console);

var kiteKey = fs.createReadStream(joinPath(process.env.HOME, './.kite/kite.key'), 'utf-8');

var logLevels = require('../../logging').logLevels;

var KiteServer = require('../../server');

var SockJs = require('node-sockjs-client');
var SockJsServer = require('../../extras/sockjs-server/server.js');

console.log('running node SockJs version: ', SockJs.version);

var math = new KiteServer({
  name:           'math',
  username:       'koding',
  environment:    'vagrant',
  region:         'vagrant',
  version:        '1.0.0',
  prefix:         'kite',
  logLevel:       argv.v ? logLevels.DEBUG : logLevels.INFO,
  transportClass: SockJs,
  serverClass:    SockJsServer
});

math.methods({

  square: function (x, callback) {
    callback(null, x * x);
  },

  pow: function (x, y, callback) {
    callback(null, Math.pow(x, y));
  }

});

math.listen(5647);

math.register({
  to:       'http://0.0.0.0:4000',
  host:     '0.0.0.0',
  kiteKey:  kiteKey
});
