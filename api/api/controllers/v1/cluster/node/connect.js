const JSend = require('jsend')

module.exports = {

  friendlyName: 'Test connection to node',

  description: '',

  inputs: {
    cluster: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    },
    hostname: {
      description: 'Node hostname.',
      type: 'string',
      required: true
    }
  },

  exits: {
    nodeNotFound: {
      responseType: 'nodeNotFound'
    },
    alreadyExists: {
      responseType: 'alreadyExists'
    },
    sshExecutionFailed: {
      responseType: `sshExecutionFailed`
    }
  },

  fn: async function (inputs, exits) {
    // avoid node duplicates
    let node = await Node.findOne({
      cluster: inputs.cluster,
      hostname: inputs.hostname
    })

    if (node) {
      return exits.alreadyExists(`Node already exists.`)
    }

    let result = await sails.helpers.nodeExecute(
      inputs.cluster,
      inputs.hostname,
      `hostname`,
      {
        nodeRequired: false
      }
    )
      .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
      .intercept(`nodeNotFound`, `nodeNotFound`)

    if (!result) {
      return exits.sshExecutionFailed()
    }

    return exits.success(JSend.success({
      hostname: result
    }))
  }
}
