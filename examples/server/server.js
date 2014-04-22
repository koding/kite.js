var KiteServer = require('../../server');

var math = new KiteServer({

  square: function (x, callback) {
    callback(null, x * x);
  }

});

math.listen(5647);