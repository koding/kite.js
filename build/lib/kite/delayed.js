var Delayed,
  __slice = [].slice;

module.exports = Delayed = (function() {
  var mustOverride;

  mustOverride = function() {
    throw new Error('not implemented');
  };

  Delayed.handles = [];

  function Delayed() {
    var fn, ms, params;
    fn = arguments[0], ms = arguments[1], params = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    this.fn = fn;
    this.ms = ms;
    this.params = params;
    Delayed.handles.push(this);
    this.begin();
  }

  Delayed.prototype.begin = mustOverride;

  Delayed.prototype.clear = mustOverride;

  Delayed.clearAll = function() {
    this.handles.forEach(function(h) {
      return h.clear();
    });
    return this.handles.length = 0;
  };

  return Delayed;

})();
