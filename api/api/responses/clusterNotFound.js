const JSend = require('jsend')

module.exports = function (message) {
  let res = this.res
  return res.status(404).send(JSend.error(message || 'Cluster not found.'))
}
