const JSend = require('jsend')

module.exports = {

  friendlyName: 'Destroy a backup',

  description: '',

  inputs: {
    id: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    },
    directory: {
      description: 'Directory to destroy.',
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
      `ssh/cluster-backup-destroy`,
      null,
      true,
      {
        DIRECTORY_TO_DESTROY: inputs.directory
      }
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

    return exits.success(JSend.success(true))
  }
}
