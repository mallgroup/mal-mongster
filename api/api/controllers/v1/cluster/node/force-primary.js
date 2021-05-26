const JSend = require('jsend')

module.exports = {

  friendlyName: 'Force a member (secondary) to become a primary.',

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
    },
    clusterNotFound: {
      responseType: 'clusterNotFound'
    }
  },

  fn: async function (inputs, exits) {
    let node = await Node.findOne(inputs.id)

    if (!node) {
      sails.log.error(`Node '${inputs.id}' not found.`)
      return exits.notFound('Node not found.')
    }

    // find cluster
    let cluster = await Cluster.findOne(node.cluster).populate(`nodes`)

    if (!cluster) {
      return exits.clusterNotFound()
    }

    let result = await sails.helpers.nodeExecute(
      node.cluster,
      node.hostname,
      `ssh/node-force-primary`,
      null,
      true,
      {
        NODE_HOSTNAME: node.hostname
      }
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    return exits.success(JSend.success(node))
  }
}
