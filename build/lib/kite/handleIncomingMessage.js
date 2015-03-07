var handleAuth, mungeCallbacks, parse,
  __hasProp = {}.hasOwnProperty,
  __slice = [].slice;

parse = require('try-json-parse');

handleAuth = require('./auth');

mungeCallbacks = function(callbacks, n) {
  var c, k;
  for (k in callbacks) {
    if (!__hasProp.call(callbacks, k)) continue;
    c = callbacks[k];
    if ((c.join('.')) === '0.responseCallback') {
      callbacks[k] = [n];
    }
    if (c[1] === 'withArgs') {
      callbacks[k] = c.slice(2);
    }
  }
  return callbacks;
};

module.exports = function(proto, message) {
  var args, auth, callbacks, kite, links, method, req, responseCallback, withArgs, _ref;
  this.emit('debug', "Receiving: " + message);
  req = parse(message);
  if (req == null) {
    this.emit('warning', new KiteError("Invalid payload! (" + message + ")"));
    return;
  }
  args = req["arguments"], links = req.links, callbacks = req.callbacks, method = req.method, auth = req.authentication;
  if (args.length > 0) {
    _ref = args[0], withArgs = _ref.withArgs, responseCallback = _ref.responseCallback, kite = _ref.kite, auth = _ref.authentication;
  }
  if ((withArgs == null) && (responseCallback == null)) {
    this.emit('debug', "Handling a normal dnode message");
    return proto.handle(req);
  }
  this.emit('debug', "Authenticating request");
  return handleAuth.call(this, method, auth, this.key).then((function(_this) {
    return function(token) {
      _this.emit('debug', "Authentication passed");
      if (withArgs == null) {
        withArgs = [];
      }
      if (!Array.isArray(withArgs)) {
        withArgs = [withArgs];
      }
      mungeCallbacks(callbacks, withArgs.length);
      _this.currentToken = token;
      proto.handle({
        method: method,
        "arguments": __slice.call(withArgs).concat([responseCallback]),
        links: links,
        callbacks: callbacks
      });
      return _this.currentToken = null;
    };
  })(this))["catch"]((function(_this) {
    return function(err) {
      _this.emit('debug', "Authentication failed");
      mungeCallbacks(callbacks, 1);
      return proto.handle({
        method: 'kite.echo',
        "arguments": [err, responseCallback],
        links: links,
        callbacks: callbacks
      });
    };
  })(this));
};
