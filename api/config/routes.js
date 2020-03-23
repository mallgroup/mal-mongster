/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
   *                                                                          *
   * More custom routes here...                                               *
   * (See https://sailsjs.com/config/routes for examples.)                    *
   *                                                                          *
   * If a request to a URL doesn't match any of the routes in this file, it   *
   * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
   * not match any of those, it is matched against static assets.             *
   *                                                                          *
   ***************************************************************************/

  //  ╔═╗╔═╗╦  ╔═╗╔╗╔╔╦╗╔═╗╔═╗╦╔╗╔╔╦╗╔═╗
  //  ╠═╣╠═╝║  ║╣ ║║║ ║║╠═╝║ ║║║║║ ║ ╚═╗
  //  ╩ ╩╩  ╩  ╚═╝╝╚╝═╩╝╩  ╚═╝╩╝╚╝ ╩ ╚═╝

  //  ╦ ╦╔═╗╔╗ ╦ ╦╔═╗╔═╗╦╔═╔═╗
  //  ║║║║╣ ╠╩╗╠═╣║ ║║ ║╠╩╗╚═╗
  //  ╚╩╝╚═╝╚═╝╩ ╩╚═╝╚═╝╩ ╩╚═╝

  //  ╔╦╗╦╔═╗╔═╗
  //  ║║║║╚═╗║
  //  ╩ ╩╩╚═╝╚═╝

  '/': 'index',

  // cluster - database
  'GET /v1/cluster/:cluster/database': 'v1/cluster/database/list',
  'POST /v1/cluster/:cluster/database': 'v1/cluster/database/create',
  'DELETE /v1/cluster/:cluster/database/:name': 'v1/cluster/database/destroy',
  'GET /v1/cluster/:cluster/database/:database/user': 'v1/cluster/database/user/find',
  'POST /v1/cluster/:cluster/database/:database/user': 'v1/cluster/database/user/create',
  'DELETE /v1/cluster/:cluster/database/:database/user/:user': 'v1/cluster/database/user/destroy',

  // cluster
  'GET /v1/cluster': 'v1/cluster/find',
  'GET /v1/cluster/:id': 'v1/cluster/find',
  'POST /v1/cluster': 'v1/cluster/create',
  'PATCH /v1/cluster': 'v1/cluster/update',
  'DELETE /v1/cluster/:id': 'v1/cluster/destroy',

  // cluster - node
  'POST /v1/cluster/node/connect': 'v1/cluster/node/connect',
  'POST /v1/cluster/node/install': 'v1/cluster/node/install',
  'POST /v1/cluster/node': 'v1/cluster/node/create',
  'DELETE /v1/cluster/node/:id': 'v1/cluster/node/destroy',
  'PATCH /v1/cluster/node/:id/toggle-vote': 'v1/cluster/node/toggle-vote',
  'PATCH /v1/cluster/node/:id/priority': 'v1/cluster/node/priority',
  'GET /v1/cluster/node/:id/backup/download/:directory': 'v1/cluster/node/backup-download',
  'GET /v1/cluster/node/:id/backup': 'v1/cluster/node/backup-list',
  'POST /v1/cluster/node/:id/backup': 'v1/cluster/node/backup-generate',

  // node
  'GET /v1/node/:id/info': 'v1/node/info',
  'PATCH /v1/node/:id/restart-docker': 'v1/node/restart-docker'
}
