let Timeout
const Delayed = require('./delayed')

module.exports = Timeout = class Timeout extends Delayed {
  begin () {
    return (this.handle = setTimeout(this.fn, this.ms, ...Array.from(this.params)))
  }

  clear () {
    return clearTimeout(this.handle)
  }
}
