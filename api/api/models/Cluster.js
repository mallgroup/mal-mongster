/**
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true
    },

    ssh: {
      type: 'string',
      required: true
    },

    user: {
      type: 'string',
      required: true
    },

    password: {
      type: 'string',
      required: true
    },

    authKey: {
      type: `string`,
      required: true
    },

    authenticationDatabase: {
      type: `string`,
      required: true
    },

    nodes: {
      collection: 'node',
      via: 'cluster'
    },

    databases: {
      collection: 'database',
      via: 'cluster'
    }
  }
}
