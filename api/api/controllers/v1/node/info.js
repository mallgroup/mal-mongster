const JSend = require('jsend')
const fs = require('fs')

module.exports = {

  friendlyName: 'Node info',

  description: 'Retrieve info about the node.',

  inputs: {
    id: {
      description: 'Node ID.',
      type: 'string'
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs, exits) {
    let node = await Node.findOne(inputs.id).populate(`cluster`)

    if (!node) {
      sails.log.error(`Node '${inputs.id}' not found.`)
      return exits.notFound('Node not found.')
    }

    let info = {}

    let result = await sails.helpers.nodeExecute(
      node.cluster.id,
      node.hostname,
      `ssh/info`,
      null,
      true
    )

    try {
      if (result.trim()) {
        result = result.split(`:`)
        result.shift() // remove "success" item from the start of the array

        info = JSON.parse(result.join(`:`))
      } else {
        throw Error(`Missing JSON.`)
      }
    } catch (err) {
      if (err) {
        sails.log.error(err)
        // do nothing useful
      }
      info.alive = 0
      info.rsState = 0
    }

    info.id = node.id

    return exits.success(JSend.success(info))
  }
}
