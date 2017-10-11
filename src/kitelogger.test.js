import expect from 'expect'
import Logger from './kitelogger'
import { DebugLevel } from './constants'

describe('Logger', () => {
  it('works', () => {
    const logs = {
      error: [],
      warn: [],
      info: [],
    }

    const logger = new Logger({
      name: 'foobar',
      level: DebugLevel.DEBUG,
      error: (...args) => logs.error.push(args),
      warn: (...args) => logs.warn.push(args),
      info: (...args) => logs.info.push(args),
    })

    logger.critical('one')
    logger.error('two')
    logger.warning('three')
    logger.notice('four')
    logger.info('five')
    logger.debug('six')

    expect(logs.error[0]).toEqual(['[foobar]', 'CRITICAL', 'one'])
    expect(logs.error[1]).toEqual(['[foobar]', 'ERROR', 'two'])
    expect(logs.warn[0]).toEqual(['[foobar]', 'WARNING', 'three'])
    expect(logs.info[0]).toEqual(['[foobar]', 'NOTICE', 'four'])
    expect(logs.info[1]).toEqual(['[foobar]', 'INFO', 'five'])
    expect(logs.info[2]).toEqual(['[foobar]', 'DEBUG', 'six'])
  })
})
