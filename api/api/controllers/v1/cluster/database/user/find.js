const JSend = require('jsend')

module.exports = {

  friendlyName: 'Find all users in database',

  description: 'Find all users in database.',

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
    }
  },

  exits: {
    clusterNotFound: {
      description: 'Cluster not found.',
      responseType: 'clusterNotFound'
    },
    noPrimaryInCluster: {
      responseType: 'noPrimaryInCluster'
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
      sails.config.ssh.commands.node.database.user.find.replace(
        /\$DB_NAME/g,
        inputs.database
      )
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    result = result.split(`:`)
    result.shift() // remove "success" item from the start of the array

    result = JSON.parse(result.join(`:`))

    return exits.success(JSend.success(result))
  }
}
