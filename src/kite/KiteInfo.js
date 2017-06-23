import { Defaults } from '../constants'

export default class KiteInfo {
  constructor(options = {}) {
    this.id = options.id
    this.username = options.username || Defaults.KiteInfo.username
    this.environment = options.environment || Defaults.KiteInfo.environment
    this.name = options.name || Defaults.KiteInfo.name
    this.version = options.version || Defaults.KiteInfo.version
    this.region = options.region || Defaults.KiteInfo.region
    this.hostname = options.hostname || Defaults.KiteInfo.hostname
  }
}
