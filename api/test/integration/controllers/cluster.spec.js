let supertest = require('supertest')
let faker = require('faker')
let cluster

describe('Cluster', () => {
  it('create cluster', (done) => {
    supertest(sails.hooks.http.app)
      .post('/v1/cluster')
      .send({
        name: faker.lorem.words(3),
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
        id: cluster.id,
        name: faker.lorem.words(4),
        ssh: `ssh`,
        user: `admin`,
        password: `admin`,
        authKey: `authKey`,
        authenticationDatabase: `admin`
      })
      .expect(200, done)
  })

  it(`delete cluster`, (done) => {
    supertest(sails.hooks.http.app)
      .delete(`/v1/cluster/${cluster.id}`)
      .expect(200, done)
  })

  it(`cluster not found`, (done) => {
    supertest(sails.hooks.http.app)
      .get(`/v1/cluster/${cluster.id}`)
      .expect(404, done)
  })
})
