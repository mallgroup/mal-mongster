import { Notify } from 'quasar'

export default ({ Vue }) => {
  let notify = {
    config: {
      timeout: 4000,
      html: true,
      actions: [
        {
          icon: `close`,
          color: `white`
        }
      ]
    },
    positive (message) {
      this._notify(message, {
        color: `green`
      })
    },
    warning (message) {
      this._notify(message, {
        color: `orange`
      })
    },
    negative (message) {
      this._notify(message, {
        color: `red`
      })
    },
    info (message) {
      this._notify(message, {
        color: `blue`
      })
    },
    _notify (message, options = {}) {
      Notify.create({
        message,
        ...options,
        ...this.config
      })
    }
  }

  Vue.prototype.$notify = notify
}
