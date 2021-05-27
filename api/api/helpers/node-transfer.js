const Client = require('ssh2-sftp-client')
const strongCrypter = require('strong-cryptor')

module.exports = {

  friendlyName: 'Download remote file from remote server.',

  description: 'Connect and run some command on the station',

  inputs: {
    cluster: {
      description: 'Cluster.',
      type: 'ref',
      required: true
    },
    node: {
      description: 'Node.',
      type: 'ref',
      required: true
    },
    remotePath: {
      type: 'string',
      required: true
    },
    localPath: {
      type: 'string',
      required: true
    }
  },

  exits: {
    sshExecutionFailed: {}
  },

  fn: async function (inputs, exits) {
    // decrypt ssh key
    let key = await Configuration.findOne({
      option: `encryption_key`
    })

    try {
      inputs.cluster.authKey = strongCrypter.decrypt(inputs.cluster.authKey, key.value, `hex`)
      inputs.cluster.ssh = strongCrypter.decrypt(inputs.cluster.ssh, key.value, `hex`)
      inputs.cluster.password = strongCrypter.decrypt(inputs.cluster.password, key.value, `hex`)
    } catch (err) {
      if (err) {
        sails.log.error(err)
      }
      return exits.sshExecutionFailed()
    }

    let conn = new Client()
    conn
      .connect({
        readyTimeout: 30000,
        host: inputs.node.hostname,
        port: 22,
        username: 'root',
        privateKey: inputs.cluster.ssh
      })
      .then(() => {
        return conn.fastGet(inputs.remotePath, inputs.localPath)
      })
      .then(() => {
        conn.end()
        return exits.success(true)
      })
      .catch(err => {
        sails.log.error(err.message)
        return exits.sshExecutionFailed()
      })
  }
}
