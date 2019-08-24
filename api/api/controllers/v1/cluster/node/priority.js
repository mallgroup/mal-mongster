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

    let cmd = sails.config.ssh.commands.node.changePriority.replace(
      /\$PRIORITY_HOSTNAME/g,
      node.hostname
    )

    cmd = cmd.replace(
      /\$PRIORITY_DIR/g,
      inputs.dir ? 1 : -1
    )

    let result = await sails.helpers.nodeExecute(
      primaryHost.cluster,
      primaryHost.hostname,
      cmd
    )

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    return exits.success(JSend.success(node))
  }
}
