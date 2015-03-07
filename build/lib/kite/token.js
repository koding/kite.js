var atob, getKontrolClaims, jwt, parse;

jwt = require('jwt-simple');

atob = require('atob');

parse = require('try-json-parse');

getKontrolClaims = require('./claims');

module.exports = function(tokenString, kiteKey) {
  var claims, headers, headersA, kontrolClaims, publicClaimsA, _ref;
  _ref = tokenString.split('.'), headersA = _ref[0], publicClaimsA = _ref[1];
  kontrolClaims = getKontrolClaims(kiteKey);
  headers = parse(atob(headersA));
  claims = jwt.decode(tokenString, kontrolClaims.kontrolKey);
  return {
    headers: headers,
    claims: claims
  };
};
