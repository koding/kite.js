let Delayed
module.exports = Delayed = (() => {
  let mustOverride
  Delayed = class Delayed {
    static initClass () {
      mustOverride = () => {
        throw new Error('not implemented')
      }

      this.handles = []

      this.prototype.begin = mustOverride

      this.prototype.clear = mustOverride
    }

    constructor (fn, ms, ...rest) {
      this.fn = fn
      this.ms = ms;
      [...this.params] = Array.from(rest)
      Delayed.handles.push(this)
      this.begin()
    }

    static clearAll () {
      this.handles.forEach(h => h.clear())
      return (this.handles.length = 0)
    }
  }
  Delayed.initClass()
  return Delayed
})()
