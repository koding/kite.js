var Kite = require('../../promises.js');

var log = console.log.bind(console);
var error = console.error.bind(error);

var math = new Kite('ws://localhost:5647')
  .on('error', error)
;

math.tell('square', [44])
  .then(log)
  .catch(error)
  .finally(function () {
    math.disconnect();
  })
;
