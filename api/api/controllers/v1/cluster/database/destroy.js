const JSend = require('jsend')

module.exports = {

  friendlyName: 'Remove database',

  description: '',

  inputs: {
    cluster: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    },
    name: {
      description: 'Database name.',
      type: 'string',
      required: true
    }
  },

  exits: {
    clusterNotFound: {
      responseType: 'clusterNotFound'
    },
    noPrimaryInCluster: {
      responseType: 'noPrimaryInCluster'
    },
    sshExecutionFailed: {
      responseType: 'sshExecutionFailed'
    }
  },

  fn: async function (inputs, exits) {
    // find first to avoid duplicates
    let cluster = await Cluster.findOne({
      id: inputs.cluster
    }).populate('nodes')

    if (!cluster) {
      return exits.clusterNotdFound('Cluster not found.')
    }

    // find primary server
    let primaryHost = await sails.helpers.nodeFindPrimary(cluster.nodes)

    if (!primaryHost) {
      return exits.noPrimaryInCluster()
    }

    let result = await sails.helpers.nodeExecute(
      primaryHost.cluster,
      primaryHost.hostname,
      sails.config.ssh.commands.node.database.delete.replace(
        /\$DB_NAME/,
        inputs.name
      )
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed(result.split(`:`)[1])
    }

    return exits.success(
      JSend.success(true)
    )
  }
}
