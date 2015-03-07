var Delayed, Timeout,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Delayed = require('./delayed');

module.exports = Timeout = (function(_super) {
  __extends(Timeout, _super);

  function Timeout() {
    return Timeout.__super__.constructor.apply(this, arguments);
  }

  Timeout.prototype.begin = function() {
    return this.handle = setTimeout.apply(null, [this.fn, this.ms].concat(__slice.call(this.params)));
  };

  Timeout.prototype.clear = function() {
    return clearTimeout(this.handle);
  };

  return Timeout;

})(Delayed);
