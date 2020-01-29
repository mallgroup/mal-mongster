const JSend = require('jsend')

module.exports = function (message) {
  let res = this.res
  return res.status(500).send(JSend.error(message || 'SSH execution failed.'))
}
