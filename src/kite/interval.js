const Delayed = require('./delayed')

export default class Interval extends Delayed {
  begin() {
    return (this.handle = setInterval(
      this.fn,
      this.ms,
      ...Array.from(this.params)
    ))
  }

  clear() {
    return clearInterval(this.handle)
  }
}
