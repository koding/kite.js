var BaseKite, Kite, Promise,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseKite = require('./base');

Promise = require('bluebird');

module.exports = Kite = (function(_super) {
  __extends(Kite, _super);

  function Kite(options) {
    if (!(this instanceof Kite)) {
      return new Kite(options);
    }
    Kite.__super__.constructor.call(this, options);
  }

  Kite.prototype.tell = function(method, params, callback) {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        return Kite.__super__.tell.call(_this, method, params, function(err, result) {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
      };
    })(this)).nodeify(callback);
  };

  Kite.prototype.ready = function(callback) {
    return new Promise((function(_this) {
      return function(resolve) {
        return Kite.__super__.ready.call(_this, resolve);
      };
    })(this)).nodeify(callback);
  };

  Kite.prototype.expireToken = Promise.promisify(Kite.prototype.expireToken);

  return Kite;

})(BaseKite);
