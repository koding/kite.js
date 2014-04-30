var argv = require('minimist')(process.argv);
var fs = require('fs');
var joinPath = require('path').join;

var log = console.log.bind(console);
var warn = console.warn.bind(console);

var logLevels = require('../../logging').logLevels;

var KiteServer = require('../../server');

var math = new KiteServer({
  name:         'math',
  username:     'koding',
  environment:  'vagrant',
  region:       'vagrant',
  version:      '1.0.0',
  api: {

    square: function (x, callback) {
      callback(null, x * x);
    }

  },
  logLevel: argv.v ? logLevels.DEBUG : logLevels.INFO
});

math.listen(5647);

var registationIp = require('../fetch-registration-ip.js')(argv.c ? argv.c : 'vagrant');

var kiteKey = fs.createReadStream(joinPath(__dirname, './kite.key'), 'utf-8');

math.register('ws://localhost:4000', registationIp, kiteKey);
