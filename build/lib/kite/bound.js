var define;

define = require('./define');

module.exports = function(method, ctx) {
  var boundMethod;
  if (ctx == null) {
    ctx = this;
  }
  if (ctx[method] == null) {
    throw new Error("Could not bind method: " + method);
  }
  boundMethod = "__bound__" + method;
  boundMethod in ctx || define(ctx, boundMethod, {
    value: ctx[method].bind(ctx)
  });
  return ctx[boundMethod];
};
