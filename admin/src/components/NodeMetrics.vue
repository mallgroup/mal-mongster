<template>
  <div>
    <p v-if="uptime">
      <strong>Node uptime:</strong> {{ uptime }}
    </p>
    <div
      v-if="opcounters"
    >
      <div><strong>Read/Write</strong></div>
      <div>opcounters.query: {{ opcounters.query | HumanNumber }}</div>
      <div>opcounters.getmore: {{ opcounters.getmore | HumanNumber }}</div>
      <hr>
      <div>opcounters.insert: {{ opcounters.insert | HumanNumber }}</div>
      <div>opcounters.update: {{ opcounters.update | HumanNumber }}</div>
      <div>opcounters.delete: {{ opcounters.delete | HumanNumber }}</div>
      <hr>
      <div>globalLock.activeClients.readers: {{ globalLock.activeClients.readers | HumanNumber }}</div>
      <div>globalLock.activeClients.writers: {{ globalLock.activeClients.writers | HumanNumber }}</div>
    </div>
  </div>
</template>

<script>
import DurationHuman from '../filters/DurationHuman'
import HumanNumber from '../filters/HumanNumber'
export default {
  name: 'ComponentMetrics',
  filters: {
    HumanNumber
  },
  props: {
    node: {
      type: String,
      required: true
    }
  },
  computed: {
    opcounters () {
      try {
        return this.$store.getters['node/findById'](this.node).opcounters
      } catch (e) {
        return false
      }
    },
    globalLock () {
      try {
        return this.$store.getters['node/findById'](this.node).globalLock
      } catch (e) {
        return false
      }
    },
    uptime () {
      try {
        let uptime = this.$store.getters['node/findById'](this.node).uptime

        let formatSeconds = DurationHuman(uptime, 'seconds')
        let formatMinutes = DurationHuman(uptime, 'minutes')
        let formatHours = DurationHuman(uptime, 'hours')
        let formatDays = DurationHuman(uptime, 'days')

        let format = ''

        if (formatDays) {
          format = `${formatDays}d`
        } else if (formatHours) {
          format = `${formatHours}h`
        } else if (formatMinutes) {
          format = `${formatMinutes}m`
        } else if (formatSeconds) {
          format = `${formatSeconds}m`
        }

        return format
      } catch (e) {
        return false
      }
    }
  }
}
</script>
