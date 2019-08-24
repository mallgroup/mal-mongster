const JSend = require('jsend')

module.exports = {

  friendlyName: 'Remove a node',

  description: 'Remove node from cluster.',

  inputs: {
    id: {
      description: 'Node ID.',
      type: 'string',
      required: true
    }
  },

  exits: {
    notFound: {
      responseType: 'notFound'
    },
    noNodesInCluster: {
      responseType: 'noNodesInCluster'
    },
    noPrimaryInCluster: {
      responseType: 'noPrimaryInCluster'
    },
    sshExecutionFailed: {
      responseType: 'sshExecutionFailed'
    }
  },

  fn: async function (inputs, exits) {
    let node = await Node.findOne(inputs.id)

    if (!node) {
      sails.log.error(`Node '${inputs.id}' not found.`)
      return exits.notFound('Node not found.')
    }

    // find primary node in cluster, add secondary on it
    let cluster = await Cluster.findOne(node.cluster).populate('nodes')

    if (!cluster.nodes || !cluster.nodes.length) {
      return exits.noNodesInCluster()
    }

    let primaryHost = await sails.helpers.nodeFindPrimary(cluster.nodes).tolerate(`noPrimaryInCluster`, () => false)

    if (primaryHost) {
      // remove replica from cluster on PRIMARY node
      let result = await sails.helpers.nodeExecute(
        primaryHost.cluster,
        primaryHost.hostname,
        sails.config.ssh.commands.node.primary.removeReplica.replace(
          /\$REPLICA_HOST/,
          node.hostname
        ),
        {
          nodeRequired: false
        }
      )
        .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
        .intercept(`nodeNotFound`, `nodeNotFound`)

      if (result.split(`:`)[0] !== `success`) {
        return exits.sshExecutionFailed()
      }

      // now clean up a station on SECONDARY/REPLICA node
      let resultCleanUp = await sails.helpers.nodeExecute(
        node.cluster,
        node.hostname,
        sails.config.ssh.commands.node.cleanup,
        {
          nodeRequired: false
        }
      )
        .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
        .intercept(`nodeNotFound`, `nodeNotFound`)

      if (resultCleanUp.split(`:`)[0] !== `success`) {
        return exits.sshExecutionFailed()
      }
    }

    // finally, remove node from DB
    await Node.destroy(node.id)

    return exits.success(JSend.success(node))
  }
}
