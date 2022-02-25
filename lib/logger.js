const logLevel = {
  silent: -1,
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
}

class Logger {
  constructor({level}) {
    this.level = logLevel[level] || logLevel.info
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
