var atob, parse;

atob = require('atob');

parse = require('try-json-parse');

module.exports = Object.defineProperty || function(ctx, name, _arg) {
  var value;
  value = _arg.value;
  if (value == null) {
    throw new Error("Unsupported options!");
  }
  return ctx[name] = value;
};
