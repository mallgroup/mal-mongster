const errors = require('./errors').errors
const containerName = 'mall_mongo'
const removeDocker = `docker rm ${containerName} -f &> /dev/null`
const pruneVolumes = `docker volume prune -f  &> /dev/null`
const dataDir = `/data`
const cleanupDataDir = `rm -Rf ${dataDir} &> /dev/null`
const authKeyFileName = `.authkey`
const authKeyFilePath = `${dataDir}/${authKeyFileName}`

const cleanup = `
  ${removeDocker} || true
  ${pruneVolumes} || true
  ${cleanupDataDir} || true
`

const baseMongo = `docker exec ${containerName} mongo -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase "$AUTHENTICATION_DATABASE" --quiet`

const evalNodeInfo = `
  var status = {};
  status.alive = db.runCommand('ping').ok || 0

  if (status.alive) {
    status.rsState = rs.status().myState || false

    var serverStatus = db.runCommand('serverStatus')
    if (serverStatus) {
      status.uptime = serverStatus.uptime || 0
      status.asserts = serverStatus.asserts || 0
      status.connections = serverStatus.connections || 0
      status.opcounters = serverStatus.opcounters || 0
      status.globalLock = {
        activeClients: {
          readers: serverStatus.globalLock.activeClients.readers || 0,
          writers: serverStatus.globalLock.activeClients.writers || 0
        }
      };
    }

    if (rs.status().ok) {
      var getReplicationInfo = db.getReplicationInfo()

      if (getReplicationInfo && !getReplicationInfo.errmsg) {
        status.getReplicationInfo = {}

        if (getReplicationInfo.logSizeMB) {
          status.getReplicationInfo.logSizeMB = getReplicationInfo.logSizeMB
        }

        if (getReplicationInfo.timeDiff) {
          status.getReplicationInfo.timeDiff = getReplicationInfo.timeDiff
        }
      }

      var rsStatus = rs.status()
      if (rsStatus.set) {
        status.rsName = rsStatus.set
      }

      var rsConfig = rs.config()

      if (rsConfig) {
        var members = rsConfig.members.filter((member) => member.host === '$HOSTNAME:$MONGO_PORT')

        if (members.length) {
          status.rsConfig = {
            priority: members[0].priority,
            votes: members[0].votes
          }
        }
      }
    }
  }

  status
`

const status = {
  success (message) {
    return this.build(`success`, message)
  },
  error (message) {
    return this.build(`error`, message)
  },
  build (type, message) {
    return `${type}${message ? ':' + message : ``}`
  }
}

module.exports.ssh = {
  commands: {
    node: {
      cleanup: `
        ${cleanup}
        echo "${status.success(`ok`)}"
      `,
      install: {
        container: `
          ${cleanup}
          mkdir -p "${dataDir}" &> /dev/null
          touch "${authKeyFilePath}" &> /dev/null
          echo "$AUTH_KEY" > "${authKeyFilePath}"
          chmod 400 "${authKeyFilePath}"
          chown 999:999 "${authKeyFilePath}"

          if [ ! -x "$(command -v docker)" ]; then
            echo "${status.error(errors.DOCKER_NOT_INSTALLED.message)}"
            exit 1
          fi

          docker run -d --name ${containerName}  \
          --network "host" \
          --restart "always" \
          -v ${dataDir}/db:${dataDir}/db \
          -v ${dataDir}/configdb:${dataDir}/configdb \
          -e MONGO_INITDB_ROOT_USERNAME=$MONGO_INITDB_ROOT_USERNAME \
          -e MONGO_INITDB_ROOT_PASSWORD=$MONGO_INITDB_ROOT_PASSWORD \
          mongo:4.0.12-xenial &> /dev/null || (echo "${status.error(errors.DOCKER_RUN_ERROR.message)}" && exit 1)

          docker cp ${authKeyFilePath} ${containerName}:/${authKeyFilePath} &> /dev/null
          sleep 1

          docker exec ${containerName} bash -c 'chown -R 999:999 "${dataDir}"' &> /dev/null

          ${removeDocker}

          docker run -d --name ${containerName}  \
          --restart "always" \
          --network "host" \
          -v ${authKeyFilePath}:${authKeyFilePath} \
          -v ${dataDir}/db:${dataDir}/db \
          -v ${dataDir}/configdb:${dataDir}/configdb \
          mongo:4.0.12-xenial \
            --keyFile "${authKeyFilePath}" \
            --replSet "$REPLICA_SET" &> /dev/null || (echo "${status.error(errors.DOCKER_RUN_ERROR.message)}" && exit 1)

          echo "${status.success(`ok`)}"
          exit 0
        `
      },
      info: `
        RESULT=$(${baseMongo} --eval "
          ${evalNodeInfo}
        ") &> /dev/null

        if [ "$?" -eq 1 ]; then
          echo "${status.error(errors.NODE_INFO.message)}" && exit 1
        fi

        echo "${status.success(`$RESULT`)}"
      `,

      primary: {
        is: `
          ${baseMongo} --eval "db.isMaster().ismaster" 2> /dev/null || (echo "${status.error(errors.NODE_IS_MASTER.message)}" && exit 1)
        `,

        // by "rs.initiate()" we also force the node to be primary
        setPrimary: `
          ${baseMongo} --eval "
            rs.initiate().ok
          " &> /dev/null

          if [ "$?" -eq 1 ]; then
            echo "${status.error(errors.REPLICA_ADD_PRIMARY_FAILED.message)}" && exit 1
          fi

          echo "${status.success(`ok`)}"
        `,

        // Every secondary node have to have 0 priority and votes as well. We can adjust it later.
        // Note: Data directory must be empty.
        addSecondary: `
          ${baseMongo} --eval "
            rs.add( { host: '$HOSTNAME:$MONGO_PORT', priority: 0, votes: 0 } ).ok
          " &> /dev/null

          if [ "$?" -eq 1 ]; then
            echo "${status.error(errors.REPLICA_ADD_SECONDARY_FAILED.message)}" && exit 1
          fi

          echo "${status.success(`ok`)}"
        `,

        addArbiter: `
          ${baseMongo} --eval "
            rs.addArb('$HOSTNAME:$MONGO_PORT').ok
          " &> /dev/null

          if [ "$?" -eq 1 ]; then
            echo "${status.error(errors.REPLICA_ADD_ARBITER_FAILED.message)}" && exit 1
          fi

          echo "${status.success(`ok`)}"
        `,

        removeReplica: `
          ${baseMongo} --eval "
            rs.remove('$REPLICA_HOST:$MONGO_PORT').ok
          " &> /dev/null

          if [ "$?" -eq 1 ]; then
            echo "${status.error(errors.REPLICA_REMOVE_REPLICA_FAILED.message)}" && exit 1
          fi

          echo "${status.success(`ok`)}"
        `
      },

      restartDocker: `
        docker restart ${containerName} &> /dev/null || echo "${status.error(errors.NODE_RESTART_DOCKER.message)} && exit 1"
        echo "${status.success(`ok`)}"
      `,

      toggleVote: `
        RESULT=$(${baseMongo} --eval "
          var cfg = rs.config()
          cfg.members = cfg.members.map((node) => {
            if (node.host === '$VOTING_HOSTNAME:$MONGO_PORT') {
              node.votes = (Number(node.votes) ? 0 : 1)
              node.priority = (Number(node.votes) ? node.priority : 0)
            }
            return node
          })

          rs.reconfig(cfg).ok === 0 ? 1 : 0 // we have to convert to unix based result
        ") &> /dev/null

        if [ "$RESULT" -eq 1 ]; then
          echo "${status.error(errors.NODE_CHANGE_VOTE.message)} && exit 1"
        fi

        echo "${status.success(`ok`)}"
      `,

      changePriority: `
        RESULT=$(${baseMongo} --eval "
          var cfg = rs.config()
          cfg.members = cfg.members.map((node) => {
            if (node.host === '$PRIORITY_HOSTNAME:$MONGO_PORT') {
              node.priority = node.priority + $PRIORITY_DIR
              node.votes = node.priority > 0 ? 1 : 0
            }
            return node
          })

          rs.reconfig(cfg).ok === 0 ? 1 : 0 // we have to convert to unix based result
        ") &> /dev/null

        if [ "$RESULT" -eq 1 ]; then
          echo "${status.error(errors.NODE_CHANGE_PRIORITY.message)} && exit 1"
        fi

        echo "${status.success(`ok`)}"
      `,

      database: {
        list: `
          RESULT=$(${baseMongo} --eval "
            var dbs = db.adminCommand( { listDatabases: 1 } );
            var result = {};
            result.databases = dbs.databases.filter((db) => ['admin', 'config', 'local'].indexOf(db.name) === -1) || [];
            result.totalSize = dbs.totalSize;
            result
          ") &> /dev/null

          if [ "$?" -eq 1 ]; then
            echo "${status.error(errors.NODE_CHANGE_PRIORITY.message)}" && exit 1
          fi

          echo "${status.success(`$RESULT`)}"
        `,

        add: `
          RESULT=$(${baseMongo} --eval "
            var db = db.getSiblingDB('$DB_NAME');
            db.bootstrap.insert({bootstrap: 1}).nInserted;
          ") &> /dev/null

          if [ ! "$RESULT" -eq 1 ]; then
            echo "${status.error(errors.NODE_DATABASE_ADD.message)}" && exit 1
          fi

          echo "${status.success(`ok`)}"
        `,

        delete: `
          RESULT=$(${baseMongo} --eval "
            var db = db.getSiblingDB('$DB_NAME');
            db.runCommand( { dropAllUsersFromDatabase: 1 }).ok;
            db.dropDatabase().ok;
          ") &> /dev/null

          if [ ! "$RESULT" -eq 1 ]; then
            echo "${status.error(errors.NODE_DATABASE_DELETE.message)}" && exit 1
          fi

          echo "${status.success(`ok`)}"
        `,

        user: {
          find: `
            RESULT=$(${baseMongo} --eval "
              var db = db.getSiblingDB('$DB_NAME');
              db.getUsers().map((user) => {
                return {
                  user: user.user,
                  roles: user.roles
                }
              })
            ") &> /dev/null

            if [ "$?" -eq 1 ]; then
              echo "${status.error(errors.NODE_USER_LIST.message)}" && exit 1
            fi

            echo "${status.success(`$RESULT`)}"
          `,

          create: `
            ${baseMongo} --eval "
              var db = db.getSiblingDB('$DATABASE');
              db.createUser({
                user: '$USERNAME',
                pwd: '$PASSWORD',
                roles: [ { role: 'readWrite', db: '$DATABASE' } ]
              });
            " &> /dev/null

            if [ "$?" -eq 1 ]; then
              echo "${status.error(errors.NODE_USER_CREATE.message)}" && exit 1
            fi

            echo "${status.success(`ok`)}"
          `,

          remove: `
            ${baseMongo} --eval "
              var db = db.getSiblingDB('$DATABASE');
              db.removeUser('$USERNAME')
            " &> /dev/null

            if [ "$?" -eq 1 ]; then
              echo "${status.error(errors.NODE_USER_REMOVE.message)}" && exit 1
            fi

            echo "${status.success(`ok`)}"
          `
        }
      },

      backup: {
        listDir: 'ls /data/backup'
      }
    }
  }
}
