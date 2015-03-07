var BaseKontrol, Kite, Kontrol, Promise,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseKontrol = require('./base');

Kite = require('../kite');

Promise = require('bluebird');

module.exports = Kontrol = (function(_super) {
  __extends(Kontrol, _super);

  Kontrol.Kite = Kite;

  function Kontrol(options) {
    if (!(this instanceof Kontrol)) {
      return new Kontrol(options);
    }
    Kontrol.__super__.constructor.call(this, options);
  }

  ['fetchKites', 'fetchKite', 'watchKites', 'cancelWatcher', 'register'].forEach(function(method) {
    return Kontrol.prototype[method] = Promise.promisify(BaseKontrol.prototype[method]);
  });

  return Kontrol;

})(BaseKontrol);
