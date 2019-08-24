const JSend = require('jsend')

module.exports = {

  friendlyName: 'Toggle votes on Mongo node',

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
      sails.config.ssh.commands.node.toggleVote.replace(
        /\$VOTING_HOSTNAME/,
        node.hostname
      )
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    return exits.success(JSend.success(node))
  }
}
