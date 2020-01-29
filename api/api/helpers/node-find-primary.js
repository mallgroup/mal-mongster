module.exports = {

  friendlyName: 'Find primary Mongo instance',
  description: '',

  inputs: {
    nodes: {
      type: 'ref',
      required: true
    }
  },

  exits: {
    sshExecutionFailed: {},
    noPrimaryInCluster: {}
  },

  fn: async function (inputs, exits) {
    let primaryNode = null

    async.eachSeries(inputs.nodes, async (node, cb) => {
      if (primaryNode) {
        return cb()
      }

      try {
        let result = await sails.helpers.nodeExecute(
          node.cluster,
          node.hostname,
          `ssh/node-is-primary`,
          null,
          true
        )
          .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
          .intercept(`nodeNotFound`, `nodeNotFound`)

        if (result.split(`:`)[0] !== `success`) {
          return exits.sshExecutionFailed()
        }

        if (result.split(`:`)[1] === `true`) {
          primaryNode = node
        }

        return cb()
      } catch (err) {
        if (err) {
          return cb(err)
        }
      }
    }, (err) => {
      if (err) {
        sails.log.error(err)
      }

      if (!primaryNode) {
        return exits.noPrimaryInCluster()
      }

      return exits.success(primaryNode)
    })
  }
}
