import Delayed from './delayed'

export default class Timeout extends Delayed {
  begin() {
    return (this.handle = setTimeout(
      this.fn,
      this.ms,
      ...Array.from(this.params)
    ))
  }

  clear() {
    return clearTimeout(this.handle)
  }
}
