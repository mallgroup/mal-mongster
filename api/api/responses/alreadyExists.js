const JSend = require('jsend')

module.exports = function (message) {
  let res = this.res
  return res.status(409).send(JSend.error(message || 'Item already exists.'))
}
