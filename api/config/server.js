/**
 * Configuration for server like paths
 * (sails.config.server)
 */

let server = {
  datadir: '/data'
}

server.backup = {
  dir: `${server.datadir}/backup`
}

server.output = {
  dir: `${server.datadir}/output`
}

server.scripts = {
  dir: `${server.datadir}/scripts`
}

server.mongo = {
  dump: {
    script: {
      path: `${server.scripts.dir}/mongodump.sh`
    }
  },
  restore: {
    script: {
      path: `${server.scripts.dir}/mongorestore.sh`
    }
  }
}

module.exports.server = server
