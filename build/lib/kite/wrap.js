var Interval,
  __hasProp = {}.hasOwnProperty;

Interval = require('./interval');

module.exports = function(userlandApi) {
  var api, fn, method;
  if (userlandApi == null) {
    userlandApi = {};
  }
  api = ['error', 'info', 'log', 'warn'].reduce(function(api, method) {
    api[method] = console[method].bind(console);
    return api;
  }, {});
  api['kite.heartbeat'] = (function(_this) {
    return function(duration, ping, callback) {
      _this.heartbeatHandle = new Interval(ping, duration * 1000);
      return callback({
        error: null
      });
    };
  })(this);
  for (method in userlandApi) {
    if (!__hasProp.call(userlandApi, method)) continue;
    fn = userlandApi[method];
    api[method] = fn;
  }
  return api;
};
