const JSend = require('jsend')
const strongCrypter = require('strong-cryptor')

module.exports = {

  friendlyName: 'Find clusters',

  description: '',

  inputs: {
    id: {
      type: 'string'
    }
  },

  exits: {
    clusterNotFound: {
      responseType: 'clusterNotFound'
    }
  },

  fn: async function (inputs, exits) {
    // decrypt ssh key
    let key = await Configuration.findOne({
      option: `encryption_key`
    })

    if (inputs.id) {
      let item = await Cluster.findOne({
        id: inputs.id
      }).populate('nodes')

      if (!item) {
        return exits.clusterNotFound()
      }

      item.ssh = strongCrypter.decrypt(item.ssh, key.value, `hex`)
      item.password = strongCrypter.decrypt(item.password, key.value, `hex`)

      return exits.success(JSend.success(item))
    } else {
      // find all
      let items = await Cluster.find().populate('nodes').sort(`createdAt DESC`)

      items = items.map((item) => {
        try {
          item.ssh = strongCrypter.decrypt(item.ssh, key.value, `hex`)
          item.password = strongCrypter.decrypt(item.password, key.value, `hex`)
        } catch (err) {
          if (err) {
            // do nothing
          }
        }

        return item
      })

      return exits.success(JSend.success(items))
    }
  }
}
