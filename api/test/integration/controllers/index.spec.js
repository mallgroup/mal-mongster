var supertest = require('supertest')

describe('IndexController.index', () => {
  it('should show status info', (done) => {
    supertest(sails.hooks.http.app)
      .post('/')
      .expect(200, {
        status: `success`,
        data: {
          db: true
        }
      }, done)
  })
})
