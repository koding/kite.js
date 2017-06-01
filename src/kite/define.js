module.exports =
  Object.defineProperty ||
  ((ctx, name, { value }) => {
    // TODO: what should this error message be?
    if (value == null) {
      throw new Error('Unsupported options!')
    }
    return (ctx[name] = value) // just use assignment if defineProperty isn't there
  })
