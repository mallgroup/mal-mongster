let supertest = require('supertest')
let faker = require('faker')
let cluster
let createCluster = require('../../helpers/create-cluster')
let createNodeInCluster = require('../../helpers/create-node-in-cluster')
let clusterParams = {
  name: faker.lorem.words(3),
  ssh: `ssh`,
  user: `admin`,
  password: `admin`,
  authKey: `authKey`,
  authenticationDatabase: `admin`
}

describe('Cluster', () => {
  it('create cluster', (done) => {
    supertest(sails.hooks.http.app)
      .post('/v1/cluster')
      .send(clusterParams)
      .expect((res) => {
        cluster = res.body.data
      })
      .expect(200, done)
  })

  it('create cluster that already exists', (done) => {
    supertest(sails.hooks.http.app)
      .post('/v1/cluster')
      .send(clusterParams)
      .expect(409, done)
  })

  it('find all clusters', (done) => {
    supertest(sails.hooks.http.app)
      .get('/v1/cluster')
      .expect(200, done)
  })

  it(`find one cluster`, (done) => {
    supertest(sails.hooks.http.app)
      .get(`/v1/cluster/${cluster.id}`)
      .expect(200, done)
  })

  it(`update cluster`, (done) => {
    supertest(sails.hooks.http.app)
      .patch(`/v1/cluster`)
      .send({
        ...clusterParams,
        id: cluster.id
      })
      .expect(200, done)
  })

  it(`update cluster that does not exists`, (done) => {
    supertest(sails.hooks.http.app)
      .patch(`/v1/cluster`)
      .send({
        ...clusterParams,
        id: `some random id`
      })
      .expect(404, done)
  })

  it(`delete cluster`, (done) => {
    supertest(sails.hooks.http.app)
      .delete(`/v1/cluster/${cluster.id}`)
      .expect(200, done)
  })

  // just repeat it for the same purpose
  it(`delete cluster that does not exists`, (done) => {
    supertest(sails.hooks.http.app)
      .delete(`/v1/cluster/${cluster.id}`)
      .expect(404, done)
  })

  it(`delete cluster with some nodes within is not possible`, (done) => {
    createCluster().then((cluster) => {
      createNodeInCluster(cluster).then(() => {
        supertest(sails.hooks.http.app)
          .delete(`/v1/cluster/${cluster.id}`)
          .expect(400, done)
      })
    })
  })

  it(`cluster not found`, (done) => {
    supertest(sails.hooks.http.app)
      .get(`/v1/cluster/${cluster.id}`)
      .expect(404, done)
  })
})
