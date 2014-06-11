var Kite = require('../../promises.js');
var SockJS = require('../../../sockjs-client/lib/sockjs.js');

var logging = require('../../lib/logging/logging.js');

var k = new Kite({
  url: 'http://0.0.0.0:4000/kite',
  logLevel: logging.logLevels.DEBUG,
  transportClass: SockJS
});


k.ping().then(console.log);
