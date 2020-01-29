export default {
  inserted: function (el) {
    setTimeout(() => {
      el.getElementsByTagName('input')[0].focus()
    }, 100)
  }
}
