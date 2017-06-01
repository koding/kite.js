let Interval
const Delayed = require('./delayed')

module.exports = Interval = class Interval extends Delayed {
  begin () {
    return (this.handle = setInterval(this.fn, this.ms, ...Array.from(this.params)))
  }

  clear () {
    return clearInterval(this.handle)
  }
}
