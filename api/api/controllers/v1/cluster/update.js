const JSend = require('jsend')
const strongCrypter = require('strong-cryptor')
let attrs = JSON.parse(JSON.stringify(Cluster.attributes))
delete attrs.nodes
delete attrs.databases
delete attrs.authKey

module.exports = {

  friendlyName: 'Update cluster',

  description: '',

  inputs: attrs,

  exits: {
    clusterNotFound: {
      description: 'Cluster not found.',
      responseType: 'clusterNotFound'
    }
  },

  fn: async function (inputs, exits) {
    // find first to avoid duplicates
    let cluster = await Cluster.findOne({
      id: inputs.id
    })

    if (!cluster) {
      return exits.clusterNotFound('Cluster does not exists.')
    }

    if (!inputs.authKey || !cluster.authKey || cluster.authKey === `required`) {
      /* eslint no-unused-vars: ["error", { "args": "none" }] */
      inputs.authKey = [...Array(256)].map(i => (~~(Math.random() * 36)).toString(36)).join('')
    }

    // make sure ssh is crypted
    let key = await Configuration.findOne({
      option: `encryption_key`
    })

    inputs.ssh = strongCrypter.encrypt(inputs.ssh, key.value, 'hex')
    inputs.password = strongCrypter.encrypt(inputs.password, key.value, 'hex')

    cluster = await Cluster.update({
      id: inputs.id
    }, inputs).fetch()

    return exits.success(
      JSend.success(cluster)
    )
  }
}
