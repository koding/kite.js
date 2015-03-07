var CRITICAL, DEBUG, ERROR, INFO, NOTICE, WARNING, enableLogging, error, info, warn, _ref,
  __slice = [].slice;

_ref = [0, 1, 2, 3, 4, 5], CRITICAL = _ref[0], ERROR = _ref[1], WARNING = _ref[2], NOTICE = _ref[3], INFO = _ref[4], DEBUG = _ref[5];

error = console.error.bind(console);

warn = console.warn.bind(console);

info = console.info.bind(console);

enableLogging = function(name, emitter, logLevel) {
  var createLogger;
  if (name == null) {
    name = "kite";
  }
  if (logLevel == null) {
    logLevel = INFO;
  }
  createLogger = function(category, fn) {
    return function() {
      var messages;
      messages = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return fn("[" + name + "] " + category + "\t" + (messages.join(' ')));
    };
  };
  if (CRITICAL <= logLevel) {
    emitter.on('critical', createLogger('CRITICAL', error));
  }
  if (ERROR <= logLevel) {
    emitter.on('error', createLogger('ERROR', error));
  }
  if (WARNING <= logLevel) {
    emitter.on('warn', createLogger('WARN', warn));
  }
  if (NOTICE <= logLevel) {
    emitter.on('notice', createLogger('NOTICE', info));
  }
  if (INFO <= logLevel) {
    emitter.on('info', createLogger('INFO', info));
  }
  if (DEBUG <= logLevel) {
    return emitter.on('debug', createLogger('DEBUG', info));
  }
};

module.exports = enableLogging;
