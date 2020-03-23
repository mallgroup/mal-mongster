const JSend = require('jsend')

module.exports = {

  friendlyName: 'Backup a node',

  description: '',

  inputs: {
    id: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    }
  },

  exits: {
    clusterNotFound: {
      responseType: 'clusterNotFound'
    },
    sshExecutionFailed: {
      responseType: `sshExecutionFailed`
    },
    notFound: {
      responseType: `notFound`
    }
  },

  fn: async function (inputs, exits) {
    // find cluster first by id in requst
    let cluster = await Cluster.findOne(inputs.id).populate('nodes')

    if (!cluster) {
      sails.log.error(`Cluster '${inputs.id}' not found.`)
      return exits.clusterNotFound()
    }

    if (!cluster.nodes.length) {
      return exits.clusterNotFound()
    }

    // find primary server in list of nodes
    let primaryHost = await sails.helpers.nodeFindPrimary(cluster.nodes)

    let result = await sails.helpers.nodeExecute(
      primaryHost.cluster,
      primaryHost.hostname,
      `ssh/cluster-backup-generate`,
      null,
      true
    )

    if (!result) {
      // let's assume we don't have any records here
      return exits.notFound()
    }

    if (result.split(`:`)[0] === `error`) {
      sails.log.error(result.split(`:`)[1])
      // let's assume we don't have any records here
      return exits.notFound()
    }

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    const dirs = result.split(`:`)[1]

    return exits.success(JSend.success({
      items: dirs.split('\n').map(item => item.replace(/\/+$/, ''))
    }))
  }
}
