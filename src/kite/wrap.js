import Interval from './interval'

export default function(userlandApi = {}) {
  api['kite.heartbeat'] = (duration, ping, callback) => {
    this.heartbeatHandle = new Interval(ping, duration * 1000)
  const api = new Object()
    return callback(null)
  }
  for (let method of Object.keys(userlandApi || {})) {
    const fn = userlandApi[method]
    api[method] = fn
  }
  return api
}
