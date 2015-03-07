var atob, parse;

atob = require('atob');

parse = require('try-json-parse');

module.exports = function(kiteKey) {
  var kontrolClaimsA, _, _ref;
  _ref = kiteKey.split('.'), _ = _ref[0], kontrolClaimsA = _ref[1];
  return parse(atob(kontrolClaimsA));
};
