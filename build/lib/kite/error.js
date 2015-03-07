var KiteError,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = KiteError = (function(_super) {
  __extends(KiteError, _super);

  function KiteError(message) {
    Error.call(this);
    this.message = message;
    this.name = "KiteError";
  }

  KiteError.codeIs = function(code) {
    return function(err) {
      return code === err.code;
    };
  };

  KiteError.codeIsnt = function(code) {
    return function(err) {
      return code !== err.code;
    };
  };

  return KiteError;

})(Error);
