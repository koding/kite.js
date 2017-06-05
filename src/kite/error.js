export default class KiteError extends Error {
  constructor(message) {
    super()

    Error.call(this)

    this.message = message
    this.name = 'KiteError'
  }

  // the predicates these factories make are useful as bluebird catch guards:
  static codeIs(code) {
    return err => code === err.code
  }

  static codeIsnt(code) {
    return err => code !== err.code
  }

  static makeProperError({ type, message, code }) {
    const err = new KiteError(message)
    err.type = type
    err.code = code
    return err
  }
}
