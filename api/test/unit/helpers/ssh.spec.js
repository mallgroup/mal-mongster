const sinon = require('sinon')
const ssh = require('../../../config/ssh')

describe('SSH', () => {
  it(`success message`, (done) => {
    sinon.assert.match(ssh.ssh.status.success(`message`), `success:message`)
    done()
  })

  it(`error message`, (done) => {
    sinon.assert.match(ssh.ssh.status.error(`message`), `error:message`)
    done()
  })

  it(`build message with empty`, (done) => {
    sinon.assert.match(ssh.ssh.status.build(`success`, ``), `success`)
    done()
  })

  it(`build message with null`, (done) => {
    sinon.assert.match(ssh.ssh.status.build(`success`, null), `success`)
    done()
  })

  it(`build message with undefined`, (done) => {
    sinon.assert.match(ssh.ssh.status.build(`success`, undefined), `success`)
    done()
  })
})
