
var SockJS = require('node-sockjs-client');

var argv = require('minimist')(process.argv);
var Kite = require('../../promises.js');

var log = console.log.bind(console);
var error = console.error.bind(error);

var n = argv.n ? argv.n : 42

console.log('squaring a number! ' + (
  argv.n
    ? 'you chose ' + argv.n
    : 'defaulting to 42'
));

var math = new Kite({
  url: 'http://localhost:5647',
  transportClass: SockJS
})
  .on('error', error)
;

math.tell('kite.ping')
  .then(function () {
    console.info('received a pong!');
  })
  .then(function () {
    return math.tell('square', [n]);
  })
  .then(function (squared) {
    console.log('the square is ' + squared + '!');
  })
  .catch(error)
  .finally(function () {
    math.disconnect();
  })
;
