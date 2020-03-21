module.exports.errors = {
  DOCKER_NOT_INSTALLED: {
    message: `Docker is not installed on the node. Please install Docker first.`
  },
  DOCKER_RUN_ERROR: {
    message: `It is not possible to start a Docker container from some reason.`
  },
  NODE_INFO: {
    message: `It is not possible to get info about the node.`
  },
  REPLICA_ADD_PRIMARY_FAILED: {
    message: `It is not possible to add a primary node.`
  },
  REPLICA_ADD_SECONDARY_FAILED: {
    message: `It is not possible to add a secondary server.`
  },
  REPLICA_ADD_ARBITER_FAILED: {
    message: `It is not possible to add a arbiter server.`
  },
  REPLICA_REMOVE_REPLICA_FAILED: {
    message: `It is not possible to remove a replica server.`
  },
  NODE_CHANGE_VOTE: {
    message: `It is not possible to change voting on the node.`
  },
  NODE_CHANGE_PRIORITY: {
    message: `It is not possible to change priority on the node.`
  },
  NODE_DATABASE_LIST: {
    message: `It is not possible to list databases on the node.`
  },
  NODE_IS_MASTER: {
    message: `It is not possible to find the master node.`
  },
  NODE_DATABASE_ADD: {
    message: `It is not possible to add a new database.`
  },
  NODE_DATABASE_DELETE: {
    message: `It is not possible to delete a database.`
  },
  NODE_USER_LIST: {
    message: `It is not possible to list users in database.`
  },
  NODE_USER_CREATE: {
    message: `It is not possible to create a user in database.`
  },
  NODE_USER_REMOVE: {
    message: `It is not possible to remove a user in database.`
  },
  NODE_RESTART_DOCKER: {
    message: `It is not possible to restart a Docker instance.`
  },
  CLUSTER_BACKUP_LIST: {
    message: `It is not possible to retrieve a list of backups from cluster.`
  },
  CLUSTER_BACKUP: {
    message: `It is not possible to backup a cluster.`
  },
  CLUSTER_TAR: {
    message: `It is not possible to archive the folder.`
  }
}
