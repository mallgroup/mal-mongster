const JSend = require('jsend')

module.exports = function (message) {
  let res = this.res
  return res.status(400).send(JSend.error(message || 'Cluster has some nodes.'))
}
