var supertest = require('supertest')

var cluster

describe('Cluster Node Info', () => {
  it('creates cluster', (done) => {
    supertest(sails.hooks.http.app)
      .post('/v1/cluster')
      .send({
        name: `testing cluster`,
        ssh: `ssh`,
        user: `admin`,
        password: `admin`,
        authKey: `authKey`,
        authenticationDatabase: `admin`
      })
      .expect((res) => {
        cluster = res.body.data
      })
      .expect(200, done)
  })

  it('node not found in cluster', (done) => {
    supertest(sails.hooks.http.app)
      .get('/v1/node/878909786907869')
      .expect(404, done)
  })

  it('cluster has nodes', (done) => {
    supertest(sails.hooks.http.app)
      .get('/v1/cluster')
      .expect(200, done)
  })

  it('node exists in cluster', (done) => {
    supertest(sails.hooks.http.app)
      .get(`/v1/cluster/${cluster.id}`)
      .expect(200, done)
  })

  it('delete node in cluster', (done) => {
    supertest(sails.hooks.http.app)
      .delete(`/v1/cluster/${cluster.id}`)
      .expect(200, done)
  })
})
