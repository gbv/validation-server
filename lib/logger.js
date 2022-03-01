const logLevel = {
  silent: -1,
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

class Logger {
  constructor({level}) {
    if (level in logLevel) {
      this.level = logLevel[level]
    } else {
      throw new Error(`Invalid log level ${level}`)
    }
  }

  error(...args) {
    if (this.level >= logLevel.error) {
      console.error(new Date(), ...args)
    }
  }

  warn(...args) {
    if (this.level >= logLevel.warn) {
      console.warn(new Date(), ...args)
    }
  }

  log(...args) {
    this.info(args)
  }

  info(...args) {
    if (this.level >= logLevel.info) {
      console.log(new Date(), ...args)
    }
  }

  debug(...args) {
    if (this.level >= logLevel.debug) {
      console.log(new Date(), ...args)
    }
  }
}

export default options => new Logger(options)
