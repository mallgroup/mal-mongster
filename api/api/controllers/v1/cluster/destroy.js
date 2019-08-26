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
      description: 'Cluster has nodes.',
      responseType: 'clusterHasNodes'
    }
  },

  fn: async function (inputs, exits) {
    let cluster = await Cluster.findOne(inputs.id).populate('nodes')

    if (cluster && cluster.nodes.length) {
      return exits.clusterHasNodes()
    }

    cluster = await Cluster.destroy(inputs.id).fetch()

    return exits.success(JSend.success(cluster[0]))
  }
}
