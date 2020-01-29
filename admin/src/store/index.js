import Vue from 'vue'
import Vuex from 'vuex'
import node from './node'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    node
  }
})

export default store
