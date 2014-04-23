var fs = require('fs');
var joinPath = require('path').join;

var KiteServer = require('../../server');

var math = new KiteServer({

  square: function (x, callback) {
    callback(null, x * x);
  }

});

math.listen(5647);

math.register('ws://localhost:4000',
  fs.createReadStream(joinPath(__dirname, './kite.key'), 'utf-8')
);