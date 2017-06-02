class Delayed {
  constructor(fn, ms, ...params) {
    this.fn = fn
    this.ms = ms
    this.params = Array.from(params)
    Delayed.handles.push(this)
    this.begin()
  }

  static clearAll() {
    this.handles.forEach(h => h.clear())
    return (this.handles.length = 0)
  }
}

const mustOverride = () => {
  throw new Error('not implemented')
}

Delayed.handles = []
Delayed.prototype.begin = mustOverride
Delayed.prototype.clear = mustOverride

export default Delayed
