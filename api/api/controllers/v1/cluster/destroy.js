const JSend = require('jsend')

module.exports = {

  friendlyName: 'Remove a cluster',

  description: 'Remove a cluster.',

  inputs: {
    id: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    }
  },

  exits: {
    clusterHasNodes: {
      responseType: 'clusterHasNodes'
    },
    notFound: {
      responseType: 'notFound'
    }
  },

  fn: async function (inputs, exits) {
    let cluster = await Cluster.findOne(inputs.id).populate('nodes')

    if (cluster && cluster.nodes.length) {
      return exits.clusterHasNodes()
    }

    cluster = await Cluster.destroy(inputs.id).fetch()

    if (!cluster) {
      return exits.notFound()
    }

    return exits.success(JSend.success(cluster[0]))
  }
}
