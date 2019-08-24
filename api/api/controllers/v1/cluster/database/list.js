const JSend = require('jsend')

module.exports = {

  friendlyName: 'List databases',

  description: 'List databases.',

  inputs: {
    cluster: {
      description: 'Cluster ID.',
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
      description: 'Not possible to find a primary node.',
      responseType: 'noPrimaryInCluster'
    },
    notFound: {
      description: 'There are no tables in the collection.',
      responseType: 'notFound'
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

    let primary = await sails.helpers.nodeFindPrimary(cluster.nodes)
      .tolerate(`noPrimaryInCluster`)
      .tolerate('sshExecutionFailed', () => {
        return ''
      })

    if (!primary) {
      return exits.noPrimaryInCluster()
    }

    let result = await sails.helpers.nodeExecute(
      primary.cluster,
      primary.hostname,
      sails.config.ssh.commands.node.database.list
    )
      .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
      .intercept(`nodeNotFound`, `nodeNotFound`)

    if (result.split(`:`)[0] !== `success`) {
      return exits.notFound()
    }

    result = result.split(`:`)
    result.shift() // remove "success" item from the start of the array

    result = JSON.parse(result.join(`:`))

    return exits.success(
      JSend.success(result)
    )
  }
}
