var Timeout;

Timeout = require('./timeout');

module.exports = function(options) {
  var backoff, initalDelayMs, maxDelayMs, maxReconnectAttempts, multiplyFactor, totalReconnectAttempts, _ref, _ref1, _ref2, _ref3, _ref4;
  if (options == null) {
    options = {};
  }
  backoff = (_ref = options.backoff) != null ? _ref : {};
  totalReconnectAttempts = 0;
  initalDelayMs = (_ref1 = backoff.initialDelayMs) != null ? _ref1 : 700;
  multiplyFactor = (_ref2 = backoff.multiplyFactor) != null ? _ref2 : 1.4;
  maxDelayMs = (_ref3 = backoff.maxDelayMs) != null ? _ref3 : 1000 * 15;
  maxReconnectAttempts = (_ref4 = backoff.maxReconnectAttempts) != null ? _ref4 : 50;
  this.clearBackoffTimeout = function() {
    return totalReconnectAttempts = 0;
  };
  this.clearBackoffHandle = function() {
    if (this.backoffHandle != null) {
      this.backoffHandle.clear();
      return this.backoffHandle = null;
    }
  };
  return this.setBackoffTimeout = (function(_this) {
    return function(fn) {
      var timeout;
      _this.clearBackoffHandle();
      if (totalReconnectAttempts < maxReconnectAttempts) {
        timeout = Math.min(initalDelayMs * Math.pow(multiplyFactor, totalReconnectAttempts), maxDelayMs);
        _this.backoffHandle = new Timeout(fn, timeout);
        return totalReconnectAttempts++;
      } else {
        return _this.emit("backoffFailed");
      }
    };
  })(this);
};
