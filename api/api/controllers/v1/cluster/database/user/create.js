const JSend = require('jsend')

module.exports = {

  friendlyName: 'Create user in database',

  description: 'Add an user to database.',

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
    username: {
      description: 'User name.',
      type: 'string',
      required: true
    },
    password: {
      description: `User's password.`,
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
    // find cluster with nodes first
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

    let cmd = sails.config.ssh.commands.node.database.user.create.replace(
      /\$DATABASE/g,
      inputs.database
    )

    cmd = cmd.replace(
      /\$USERNAME/g,
      inputs.username
    )

    cmd = cmd.replace(
      /\$PASSWORD/g,
      inputs.password
    )

    let result = await sails.helpers.nodeExecute(
      primaryHost.cluster,
      primaryHost.hostname,
      cmd
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    return exits.success(JSend.success(true))
  }
}
