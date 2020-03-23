const fs = require('fs')

module.exports = {

  friendlyName: 'Download a backup',

  description: '',

  inputs: {
    id: {
      description: 'Cluster ID.',
      type: 'string',
      required: true
    },
    directory: {
      description: 'Directory Backup.',
      type: 'string',
      required: true
    }
  },

  exits: {
    clusterNotFound: {
      responseType: 'clusterNotFound'
    },
    sshExecutionFailed: {
      responseType: `sshExecutionFailed`
    },
    noPrimaryFound: {
      responseType: `notFound`
    },
    fileNotFound: {
      responseType: `notFound`
    }
  },

  fn: async function (inputs, exits) {
    // find cluster first by id in requst
    let cluster = await Cluster.findOne(inputs.id).populate('nodes')

    if (!cluster) {
      sails.log.error(`Cluster '${inputs.id}' not found.`)
      return exits.clusterNotFound()
    }

    if (!cluster.nodes.length) {
      return exits.clusterNotFound()
    }

    // find primary server in list of nodes
    let primaryHost = await sails.helpers.nodeFindPrimary(cluster.nodes)

    if (!primaryHost) {
      return exits.noPrimaryFound()
    }

    // first create a tar file
    let result = await sails.helpers.nodeExecute(
      primaryHost.cluster,
      primaryHost.hostname,
      `ssh/cluster-backup-tar`,
      null,
      true,
      {
        BACKUP_DIRECTORY: inputs.directory
      }
    )

    if (result.split(`:`)[0] === `error`) {
      sails.log.error(result.split(`:`)[1])
      return exits.sshExecutionFailed()
    }

    if (result.split(`:`)[0] !== `success`) {
      return exits.sshExecutionFailed()
    }

    const filename = result.split(':')[1]
    const remotePath = `${sails.config.server.output.dir}/${filename}`
    const localPath = `${sails.config.paths.public}/${filename}`

    // result should be the path to the backup to the TAR file we're able to download later
    let transferResult = await sails.helpers.nodeTransfer(
      cluster,
      primaryHost,
      remotePath, // do not forget to append ".tar.gz"
      localPath
    )

    if (!transferResult) {
      // let's assume we don't have any records here
      return exits.sshExecutionFailed()
    }

    // download file
    if (fs.existsSync(localPath)) {
      this.res.setHeader('Content-disposition', 'attachment; filename=' + filename)

      let filestream = fs.createReadStream(localPath)
      filestream.pipe(this.res)
    } else {
      return exits.fileNotFound()
    }
  }
}
