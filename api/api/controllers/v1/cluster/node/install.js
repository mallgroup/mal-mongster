const JSend = require('jsend')

module.exports = {

  friendlyName: 'Create a Docker station with Mongo',

  description: 'Install Mongo on the node.',

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
    },
    arbiter: {
      description: `Install server as a arbiter instead of secondary.`,
      type: `boolean`,
      defaultsTo: false
    }
  },

  exits: {
    nodeNotFound: {
      responseType: 'nodeNotFound'
    },
    clusterNotFound: {
      responseType: 'clusterNotFound'
    },
    sshExecutionFailed: {
      responseType: `sshExecutionFailed`
    }
  },

  fn: async function (inputs, exits) {
    try {
      // install container
      let resultInstall = await sails.helpers.nodeExecute(
        inputs.cluster,
        inputs.hostname,
        `ssh/node-install`,
        {
          nodeRequired: false
        },
        true
      )
        .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
        .intercept(`nodeNotFound`, `nodeNotFound`)

      let status = resultInstall.split(`:`)[0]

      // end in case we already have some error here
      if (status === `error`) {
        return exits.sshExecutionFailed(resultInstall.split(`:`)[1])
      }

      let cluster = await Cluster.findOne(inputs.cluster).populate(`nodes`)

      // sleep and wait for the container
      /* eslint no-unused-vars: ["error", { "args": "none" }] */
      await new Promise((resolve, reject) => setTimeout(() => { resolve() }, 5000))

      if (!cluster.nodes.length) {
        // first node is always a primary one
        let resultOfPrimary = await sails.helpers.nodeExecute(
          inputs.cluster,
          inputs.hostname,
          `ssh/node-initiate-replica`,
          {
            nodeRequired: false
          },
          true
        )
          .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
          .intercept(`nodeNotFound`, `nodeNotFound`)

        let status = resultOfPrimary.split(`:`)[0]
        if (status === `error`) {
          return exits.sshExecutionFailed(resultOfPrimary.split(`:`)[1])
        }
      } else {
        let primaryHost = await sails.helpers.nodeFindPrimary(cluster.nodes)

        // add secondary/arbiter server
        let resultOfPrimary = await sails.helpers.nodeExecute(
          primaryHost.cluster,
          primaryHost.hostname,
          `ssh/node-add-${inputs.arbiter ? `arbiter` : `secondary`}`,
          {
            nodeRequired: false
          },
          true,
          {
            HOSTNAME: inputs.hostname
          }
        )
          .intercept(`sshExecutionFailed`, `sshExecutionFailed`)
          .intercept(`nodeNotFound`, `nodeNotFound`)

        let status = resultOfPrimary.split(`:`)[0]
        if (status === `error`) {
          return exits.sshExecutionFailed(resultOfPrimary.split(`:`)[1])
        }
      }

      return exits.success(JSend.success(true))
    } catch (err) {
      if (err) {
        sails.log.error(err)
      }
    }

    return exits.sshExecutionFailed()
  }
}
