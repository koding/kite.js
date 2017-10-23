import Interval from './interval'
import os from 'os'

export default function(userlandApi = {}) {
  const api = {}

  api['kite.heartbeat'] = (duration, ping, callback) => {
    this.heartbeatHandle = new Interval(ping, duration * 1000)
    return callback(null)
  }

  api['kite.ping'] = callback => {
    return callback(null, 'pong')
  }

  api['kite.tunnel'] = callback => {
    return callback(new Error({ message: 'not supported' }))
  }

  api['kite.echo'] = (message, callback) => {
    return callback(null, message)
  }

  api['kite.log'] = (message, callback) => {
    this.emit('info', message)
    return callback(null)
  }

  api['kite.print'] = (message, callback) => {
    console.log(message)
    return callback(null)
  }

  api['kite.prompt'] = (message, callback) => {
    try {
      callback(null, global.prompt(message))
    } catch (err) {
      const readline = require('readline')
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      rl.question(message, answer => {
        callback(null, answer)
        rl.close()
      })
    }
  }

  api['kite.getPass'] = api['kite.prompt']

  api['kite.systemInfo'] = callback => {
    const memTotal = os.totalmem()
    const platform = process.version
      ? `Node.js ${process.version}`
      : navigator ? navigator.userAgent : 'JS Platform'

    const info = {
      diskTotal: 0,
      diskUsage: 0,
      state: 'RUNNING',
      uname: os.platform(),
      homeDir: os.homedir(),
      memoryUsage: memTotal - os.freemem(),
      totalMemoryLimit: memTotal,
      platform,
    }
    return callback(null, info)
  }

  for (let method of Object.keys(userlandApi || {})) {
    api[method] = userlandApi[method]
  }

  return api
}
