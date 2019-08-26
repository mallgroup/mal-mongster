const JSend = require('jsend')

module.exports = {

  friendlyName: 'Remove user from database',

  description: 'Remove user from database.',

  inputs: {
    cluster: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    },
    database: {
      description: 'Database name.',
      type: 'string',
      required: true
    },
    user: {
      description: 'Database user.',
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
      return exits.clusterNotFound('Cluster not found.')
    }

    // find primary server
    let primaryHost = await sails.helpers.nodeFindPrimary(cluster.nodes)

    if (!primaryHost) {
      return exits.noPrimaryInCluster()
    }

    let result = await sails.helpers.nodeExecute(
      primaryHost.cluster,
      primaryHost.hostname,
      `ssh/user-destroy`,
      null,
      true,
      {
        DATABASE: inputs.database,
        USERNAME: inputs.user
      }
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    return exits.success(
      JSend.success(true)
    )
  }
}
