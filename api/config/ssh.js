module.exports.ssh = {
  status: {
    success (message) {
      return this.build(`success`, message)
    },
    error (message) {
      return this.build(`error`, message)
    },
    build (type, message) {
      return `${type}${message ? ':' + message : ``}`
    }
  }
}
