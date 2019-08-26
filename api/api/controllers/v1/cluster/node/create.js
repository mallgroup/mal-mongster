const JSend = require('jsend')

module.exports = {

  friendlyName: 'Create node',

  description: 'Create new node in cluster.',

  inputs: {
    cluster: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    },
    hostname: {
      description: 'Node hostname.',
      type: 'string',
      required: true
    }
  },

  exits: {
    alreadyExists: {
      description: 'Node already exists.',
      responseType: 'alreadyExists'
    }
  },

  fn: async function (inputs, exits) {
    // find first to avoid duplicates
    let node = await Node.findOne({
      hostname: inputs.hostname,
      cluster: inputs.cluster
    })

    if (node) {
      return exits.alreadyExists('Node already exists.')
    }

    // save new node to db
    node = await Node.create(inputs).fetch()

    return exits.success(
      JSend.success(node || {})
    )
  }
}
