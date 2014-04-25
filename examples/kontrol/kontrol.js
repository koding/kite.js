var fs = require('fs');
var joinPath = require('path').join;

var log = console.log.bind(console)
  , warn = console.warn.bind(console)
;

var KiteServer = require('../../server');

var fetchRegistrationIp = require('../fetch-registration-ip.js')

var math = new KiteServer({
  name: 'math',
  username: 'koding',
  environment: 'vagrant',
  region: 'vagrant',
  version: '1.0.0',
  api: {

    square: function (x, callback) {
      callback(null, x * x);
    }

  }
});

math.listen(5647);

math.register('ws://localhost:4000',
  fetchRegistrationIp('vagrant'),
  fs.createReadStream(joinPath(__dirname, './kite.key'), 'utf-8')
).then(log, warn);
