const JSend = require('jsend')

module.exports = {

  friendlyName: 'Increase / Decrease a priority',

  description: '',

  inputs: {
    id: {
      description: 'Node ID.',
      type: 'string'
    },
    dir: {
      description: 'Direction (true, false = up / down).',
      type: 'boolean'
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
    },
    noPrimaryInCluster: {
      responseType: 'noPrimaryInCluster'
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

    // find primary server
    let primaryHost = await sails.helpers.nodeFindPrimary(cluster.nodes)

    if (!primaryHost) {
      return exits.noPrimaryInCluster()
    }

    let result = await sails.helpers.nodeExecute(
      primaryHost.cluster,
      primaryHost.hostname,
      `ssh/node-change-priority`,
      null,
      true,
      {
        PRIORITY_HOSTNAME: node.hostname,
        PRIORITY_DIR: inputs.dir ? 1 : -1
      }
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    return exits.success(JSend.success(node))
  }
}
