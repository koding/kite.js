const define =
  Object.defineProperty ||
  function(ctx, name, _a) {
    var value = _a.value
    // TODO: what should this error message be?
    if (value == null) {
      throw new Error('Unsupported options!')
    }
    return (ctx[name] = value) // just use assignment if defineProperty isn't there
  }

export default define
