var Delayed, Interval,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Delayed = require('./delayed');

module.exports = Interval = (function(_super) {
  __extends(Interval, _super);

  function Interval() {
    return Interval.__super__.constructor.apply(this, arguments);
  }

  Interval.prototype.begin = function() {
    return this.handle = setInterval.apply(null, [this.fn, this.ms].concat(__slice.call(this.params)));
  };

  Interval.prototype.clear = function() {
    return clearInterval(this.handle);
  };

  return Interval;

})(Delayed);
