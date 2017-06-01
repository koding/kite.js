const Interval = require('./interval')

module.exports = function (userlandApi = {}) {
  const api = ['error', 'info', 'log', 'warn'].reduce((api, method) => {
    api[method] = console[method].bind(console)
    return api
  }, {})
  api['kite.heartbeat'] = (duration, ping, callback) => {
    this.heartbeatHandle = new Interval(ping, duration * 1000)
    return callback(null)
  }
  for (let method of Object.keys(userlandApi || {})) {
    const fn = userlandApi[method]
    api[method] = fn
  }
  return api
}
