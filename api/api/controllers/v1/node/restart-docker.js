const JSend = require('jsend')

module.exports = {

  friendlyName: 'Restart Docker container',

  description: '',

  inputs: {
    id: {
      description: 'Node ID.',
      type: 'string'
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    },
    sshExecutionFailed: {
      responseType: 'sshExecutionFailed'
    }
  },

  fn: async function (inputs, exits) {
    let node = await Node.findOne(inputs.id).populate(`cluster`)

    if (!node) {
      sails.log.error(`Node '${inputs.id}' not found.`)
      return exits.notFound('Node not found.')
    }

    let result = await sails.helpers.nodeExecute(
      node.cluster.id,
      node.hostname,
      `ssh/restart-docker`,
      null,
      true
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    return exits.success(JSend.success(node))
  }
}
