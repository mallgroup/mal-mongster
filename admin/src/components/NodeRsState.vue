<template>
  <div>
    <q-chip style="cursor: help">
      <template
        v-if="rsName"
      >
        {{ rsName }} :
      </template>
      <template v-if="rsState === 1">
        primary
        <q-icon name="info">
          <q-tooltip>
            The member in state primary is the only member that can accept write operations. Eligible to vote.
          </q-tooltip>
        </q-icon>
      </template>
      <template v-else-if="rsState === 2">
        secondary
        <q-icon name="info">
          <q-tooltip>
            A member in state secondary is replicating the data store. Eligible to vote.
          </q-tooltip>
        </q-icon>
      </template>
      <template v-else-if="rsState === 7">
        arbiter
        <q-icon name="info">
          <q-tooltip>
            Arbiters do not replicate data and exist solely to participate in elections.
          </q-tooltip>
        </q-icon>
      </template>
      <template v-else-if="rsState === 5">
        startup2
        <q-icon name="info">
          <q-tooltip>
            The member has joined the set and is running an initial sync.
          </q-tooltip>
        </q-icon>
      </template>
      <template v-else-if="rsState === 3">
        recovering
        <q-icon name="info">
          <q-tooltip>
            Members either perform startup self-checks, or transition from completing a rollback or resync. Eligible to vote.
          </q-tooltip>
        </q-icon>
      </template>
      <template v-else-if="rsState === 'NOT_ALIVE'">
        not alive
        <q-icon name="info">
          <q-tooltip>
            Node is not alive so the node is not part of any replica.
          </q-tooltip>
        </q-icon>
      </template>
      <template v-else>
        other
        <q-icon name="info">
          <q-tooltip>
            It is not possible to say what this node is doing.
          </q-tooltip>
        </q-icon>
      </template>
    </q-chip>
    <p
      v-if="rsConfig"
      class="q-pt-sm"
    >
      Priority: {{ rsConfig.priority || 0 }}
      |
      Votes: {{ rsConfig.votes || 0 }}

      <!-- Votes plus priority has to be greater or equal to 2 -->
      <q-icon
        v-if="!rsConfig.votes"
        style="font-size: 150%; cursor: help"
        name="warning"
        class="text-red"
      >
        <q-tooltip>
          Your node is a part of a replica (you can read from it).
          But it is not eligible to vote in case of failure (split brain).
        </q-tooltip>
      </q-icon>
    </p>
  </div>
</template>

<script>
export default {
  name: 'ComponentNodeRsState',
  props: {
    node: {
      type: String,
      required: true
    }
  },
  computed: {
    color () {
      if (this.rsState === 1) {
        return 'primary'
      }

      if (this.rsState === 2) {
        return 'secondary'
      }

      if (this.rsState === 7) {
        return 'accent'
      }

      return ''
    },
    rsState () {
      try {
        if (!this.$store.getters['node/findById'](this.node).alive) {
          return 'NOT_ALIVE'
        }

        return this.$store.getters['node/findById'](this.node).rsState
      } catch (e) {
        return false
      }
    },

    rsName () {
      try {
        return this.$store.getters['node/findById'](this.node).rsName
      } catch (e) {
        return false
      }
    },

    /**
     * @returns {*}
     */
    rsConfig () {
      try {
        return this.$store.getters['node/findById'](this.node).rsConfig
      } catch (e) {
        return false
      }
    }
  }
}
</script>
