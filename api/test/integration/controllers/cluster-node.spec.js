let supertest = require('supertest')
let mochaAsync = require('../../helpers/async')
let createCluster = require('../../helpers/create-cluster')
let cluster
let node

describe('Node', () => {
  before(mochaAsync(async () => {
    // node requires a cluster first
    cluster = await createCluster()
  }))

  it('node not found in cluster', (done) => {
    supertest(sails.hooks.http.app)
      .get('/v1/node/878909786907869') // random ID
      .expect(404, done)
  })

  it('create a node', (done) => {
    supertest(sails.hooks.http.app)
      .post('/v1/cluster/node')
      .send({
        hostname: `127.0.0.1`,
        cluster: cluster.id
      })
      .expect((res) => {
        node = res.body.data
      })
      .expect(200, done)
  })

  it('connect to node and avoid duplicats', (done) => {
    supertest(sails.hooks.http.app)
      .post(`/v1/cluster/node/connect`)
      .send({
        cluster: node.cluster,
        hostname: node.hostname
      })
      .expect(409, done)
  })

  it('delete a node', (done) => {
    supertest(sails.hooks.http.app)
      .delete(`/v1/cluster/node/${node.id}`)
      .expect(200, done)
  })
})
