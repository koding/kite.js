let KiteError
module.exports = KiteError = class KiteError extends Error {
  constructor (message) {
    Error.call(this)
    this.message = message
    this.name = 'KiteError'
  }

  // the predicates these factories make are useful as bluebird catch guards:
  static codeIs (code) {
    return err => code === err.code
  }

  static codeIsnt (code) {
    return err => code !== err.code
  }
}
