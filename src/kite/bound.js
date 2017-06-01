const define = require('./define')

module.exports = (method, ctx = this) => {
  if (ctx[method] == null) {
    throw new Error(`Could not bind method: ${method}`)
  }
  const boundMethod = `__bound__${method}`
  boundMethod in ctx || define(ctx, boundMethod, { value: ctx[method].bind(ctx) })
  return ctx[boundMethod]
}
