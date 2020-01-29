<template>
  <div>
    <q-icon
      :color="color"
      :name="icon"
      size="2em"
    >
      <q-tooltip>
        <template v-if="alive">
          Connection to Mongo is up.
        </template>
        <template v-else>
          Connection to Mongo is down.
        </template>
      </q-tooltip>
    </q-icon>
  </div>
</template>

<script>
export default {
  name: 'ComponentNodeAlive',
  props: {
    node: {
      type: String,
      required: true
    }
  },
  computed: {
    alive () {
      try {
        return this.$store.getters['node/findById'](this.node).alive
      } catch (e) {
        return false
      }
    },
    /**
     * @returns {string}
     */
    color () {
      if (this.alive) {
        return 'green'
      }

      if (!this.alive) {
        return 'red'
      }

      return ``
    },

    /**
      * @returns {string}
     */
    icon () {
      if (this.alive) {
        return 'cloud_done'
      }

      return 'cloud_off'
    }
  }
}
</script>
