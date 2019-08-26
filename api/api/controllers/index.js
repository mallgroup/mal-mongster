const JSend = require('jsend')

module.exports = {

  friendlyName: 'Index',

  description: 'Index page.',

  inputs: {},

  exits: {
    wrongStatus: {
      responseType: `wrongStatus`
    }
  },

  fn: async function (inputs, exits) {
    let db = false
    try {
      await Configuration.find({})
      db = true
    } catch (err) {
      if (err) {
        // do nothing
      }
    }

    let status = {
      db
    }

    if (!db) {
      return exits.wrongStatus(status)
    }

    return exits.success(JSend.success(status))
  }
}
