const JSend = require('jsend')
const strongCrypter = require('strong-cryptor')

let attrs = JSON.parse(JSON.stringify(Cluster.attributes))
delete attrs.id
delete attrs.nodes
delete attrs.databases
delete attrs.authKey

module.exports = {

  friendlyName: 'Create a cluster',

  description: 'Create a new cluster.',

  inputs: attrs,

  exits: {
    alreadyExists: {
      description: 'Cluster already exists.',
      responseType: 'alreadyExists'
    }
  },

  fn: async function (inputs, exits) {
    /* eslint no-unused-vars: ["error", { "args": "none" }] */
    inputs.authKey = [...Array(256)].map(i => (~~(Math.random() * 36)).toString(36)).join('')

    // find first to avoid duplicates
    let cluster = await Cluster.findOne({
      name: inputs.name
    })

    if (cluster) {
      return exits.alreadyExists('Cluster with the name already exists.')
    }

    let key = await Configuration.findOne({
      option: `encryption_key`
    })

    // crypt ssh key and password as well
    inputs.authKey = strongCrypter.encrypt(inputs.authKey, key.value, 'hex')
    inputs.ssh = strongCrypter.encrypt(inputs.ssh, key.value, 'hex')
    inputs.password = strongCrypter.encrypt(inputs.password, key.value, 'hex')

    cluster = await Cluster.create(inputs).fetch()

    return exits.success(
      JSend.success(cluster)
    )
  }
}
