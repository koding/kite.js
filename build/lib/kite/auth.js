var Promise, atob, handleToken, whitelist,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Promise = require('bluebird');

atob = require('atob');

handleToken = require('./token');

whitelist = require('./whitelist');

module.exports = Promise.method(function(method, auth, kiteKey) {
  var key, type, _ref;
  if (auth == null) {
    if ((__indexOf.call(whitelist, method) >= 0) || !((_ref = this.api) != null ? _ref[method].mustAuth : void 0)) {
      return;
    }
    throw new Error("Access denied!");
  }
  type = auth.type, key = auth.key;
  switch (type) {
    case 'token':
      return handleToken(key, kiteKey);
    default:
      throw new Error("Unknown auth type: " + type);
  }
});
