const Client = require('ssh2').Client
const strongCrypter = require('strong-cryptor')

module.exports = {

  friendlyName: 'Connect to station',

  description: 'Connect and run some command on the station',

  inputs: {
    cluster: {
      description: 'Cluster',
      type: 'string',
      required: true
    },
    hostname: {
      description: 'Node hostname.',
      type: 'string',
      required: true
    },
    command: {
      description: 'Command.',
      type: 'string',
      required: true
    },
    validationRules: {
      description: 'Validation rules.',
      type: 'json',
      defaultsTo: {
        nodeRequired: true
      }
    },
    isTemplate: {
      type: `boolean`,
      defaultsTo: false
    },
    additionalParamsToTemplate: {
      type: `json`,
      defaultsTo: {}
    }
  },

  exits: {
    clusterNotFound: {},
    sshExecutionFailed: {},
    nodeNotFound: {}
  },

  fn: async function (inputs, exits) {
    let data = ``
    let cmd = inputs.command
    let node = null

    let cluster = await Cluster.findOne(inputs.cluster)

    if (!cluster) {
      return exits.clusterNotFound('Cluster not found.')
    }

    // one exception node is not required is first adding
    if (inputs.validationRules && inputs.validationRules.nodeRequired) {
      node = await Node.findOne({
        hostname: inputs.hostname,
        cluster: inputs.cluster
      }).populate(`cluster`)

      if (!node) {
        return exits.nodeNotFound('Node not found.')
      }
    }

    // decrypt ssh key
    let key = await Configuration.findOne({
      option: `encryption_key`
    })

    try {
      cluster.authKey = strongCrypter.decrypt(cluster.authKey, key.value, `hex`)
      cluster.ssh = strongCrypter.decrypt(cluster.ssh, key.value, `hex`)
      cluster.password = strongCrypter.decrypt(cluster.password, key.value, `hex`)
    } catch (err) {
      if (err) {
        sails.log.error(err)
      }
      return exits.sshExecutionFailed()
    }

    if (inputs.isTemplate === true) {
      // template engine
      cmd = await sails.renderView(cmd, {
        layout: false,
        CONTAINER_NAME: `mall_mongo`,
        DATA_DIR: `/data`,
        AUTH_KEY_FILENAME: `.authkey`,
        AUTH_KEY_FILE_PATH: `/data/.authkey`,
        AUTH_KEY: cluster.authKey,
        HOSTNAME: inputs.hostname,
        MONGO_PORT: 27017,
        MONGO_INITDB_ROOT_USERNAME: cluster.user,
        MONGO_INITDB_ROOT_PASSWORD: cluster.password,
        AUTHENTICATION_DATABASE: cluster.authenticationDatabase,
        REPLICA_SET: `rs0`,
        status: sails.config.ssh.status,
        errors: sails.config.errors,
        ...inputs.additionalParamsToTemplate
      })
    } else {
      // string command
      // replace some variables in command
      cmd = cmd.replace(/\$AUTH_KEY/g, cluster.authKey)
      cmd = cmd.replace(/\$HOSTNAME/g, inputs.hostname)
      cmd = cmd.replace(/\$MONGO_PORT/g, 27017) // mongo port
      cmd = cmd.replace(/\$MONGO_INITDB_ROOT_USERNAME/g, cluster.user)
      cmd = cmd.replace(/\$MONGO_INITDB_ROOT_PASSWORD/g, cluster.password)
      cmd = cmd.replace(/\$AUTHENTICATION_DATABASE/g, cluster.authenticationDatabase)
      cmd = cmd.replace(/\$REPLICA_SET/g, `rs0`)
    }

    cmd = `
      set -euo pipefail
      ${cmd}
    `

    let conn = new Client()
    conn.on('ready', () => {
      conn.exec(cmd.trim(), (err, stream) => {
        if (err) {
          sails.log.error(err)
          return exits.sshExecutionFailed()
        }

        stream.on('close', () => {
          conn.end()

          // everything is "success" so we have to deal with it later in the code
          return exits.success(data)
        }).on('data', (result) => {
          data += result.toString().trim()
        }).stderr.on('data', (data) => {
          sails.log.error('STDERR: ' + data)
        })
      })
    }).on('error', (err) => {
      sails.log.error(err)
      if (err.code === `ENOTFOUND`) {
        return exits.nodeNotFound()
      }

      return exits.sshExecutionFailed()
    }).connect({
      readyTimeout: 10000,
      host: inputs.hostname,
      port: 22,
      username: 'root',
      privateKey: cluster.ssh
    })
  }
}
