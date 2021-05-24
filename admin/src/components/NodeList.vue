<template>
  <div>
    <div
      v-if="!loading && cluster.nodes.length"
    >
      <table class="pure-table pure-table-bordered full-width">
        <thead>
          <tr>
            <th>Mongo</th>
            <th style="width: 300px">
              Replica
            </th>
            <th>Hostname</th>
            <th>Metrics</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(node, index) in cluster.nodes"
            :key="node.id"
          >
            <td valign="top">
              <node-alive :node="node.id" />
            </td>
            <td valign="top">
              <node-rs-state :node="node.id" />
            </td>
            <td
              valign="top"
              v-text="node.hostname"
            />
            <td valign="top">
              <node-metrics :node="node.id" />
            </td>
            <td
              style="vertical-align: top"
            >
              <q-btn
                color="primary"
                icon="clear"
                label="delete"
                dense
                size="sm"
                class="q-mr-sm q-mb-sm full-width"
                @click.native="$emit(`onDestroy`, node, index)"
              />
              <template v-if="nodeState(node) && isConfigurable">
                <template v-if="nodeState(node) && nodeState(node).rsConfig && [1, 7].indexOf(nodeState(node).rsState) === -1">
                  <q-btn
                    v-if="nodeState(node).rsConfig.votes === 1"
                    color="secondary"
                    label="voting off"
                    dense
                    size="sm"
                    class="q-mr-sm q-mb-sm full-width"
                    @click.native="vote(node, false)"
                  />
                  <q-btn
                    v-if="nodeState(node).rsConfig.votes === 0"
                    color="secondary"
                    label="voting on"
                    dense
                    size="sm"
                    class="q-mr-sm q-mb-sm full-width"
                    @click.native="vote(node, true)"
                  />
                </template>

                <div
                  v-if="nodeState(node) && nodeState(node).rsConfig && [7].indexOf(nodeState(node).rsState) === -1"
                  class="row"
                >
                  <div class="col q-mr-sm">
                    <q-btn
                      icon="add"
                      color="secondary"
                      label="priority"
                      dense
                      size="sm"
                      class="q-mr-sm q-mb-sm full-width"
                      @click.native="priority(node, true)"
                    />
                  </div>
                  <div class="col">
                    <q-btn
                      :disabled="nodeState(node).rsConfig.priority < 1 && nodeState(node).rsState > 0"
                      icon="remove"
                      color="secondary"
                      label="priority"
                      dense
                      size="sm"
                      class="q-mr-sm q-mb-sm full-width"
                      @click.native="priority(node, false)"
                    />
                  </div>
                </div>

                <q-btn
                  v-if="nodeState(node).alive"
                  color="secondary"
                  icon="refresh"
                  label="restart Docker"
                  dense
                  size="sm"
                  class="q-mr-sm q-mb-sm full-width"
                  @click.native="$emit(`onDockerRestart`, node, index)"
                />
              </template>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="q-mt-sm">
        <a
          href="#"
          style="font-size: 12px"
          @click.prevent="connectionStringDialog = true"
        >Connection string generator</a>

        <q-dialog
          v-model="connectionStringDialog"
          title="Connection String Generator"
        >
          <q-card class="q-pa-md">
            <h2 class="text-h4 q-ma-none q-mb-sm">
              Connection string
            </h2>
            <div class="q-mb-md">
              <q-select
                v-model="readPreference"
                :options="readPreferenceOptions"
                float-label="Read Preference"
              />
            </div>
            <p>{{ buildConnectionString() }}</p>
            <p><em>Note: Connection string does not include arbiter node.</em></p>
          </q-card>
        </q-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import NodeRsState from './NodeRsState'
import NodeAlive from './NodeAlive'
import NodeMetrics from './NodeMetrics'

export default {
  name: 'ComponentNodeList',
  components: {
    NodeRsState,
    NodeAlive,
    NodeMetrics
  },
  props: {
    cluster: {
      type: Object,
      default: () => {}
    },
    loading: {
      type: Boolean,
      default: false
    },
    isConfigurable: {
      type: Boolean,
      default: false
    },
    hasPrimaryNode: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      connectionStringDialog: false,
      readPreference: {
        value: 'primary',
        label: 'primary'
      },
      readPreferenceOptions: [
        {
          label: 'primary',
          value: 'primary'
        },
        {
          label: 'primaryPreferred',
          value: 'primaryPreferred'
        },
        {
          label: 'secondary',
          value: 'secondary'
        },
        {
          label: 'secondaryPreferred',
          value: 'secondaryPreferred'
        },
        {
          label: 'nearest',
          value: 'nearest'
        }
      ]
    }
  },

  computed: {
    voting: {
      get () {
        let voting = []
        for (let node of this.cluster.nodes) {
          if (this.nodeState(node).rsConfig.votes) {
            voting.push(node.id)
          }
        }

        return voting
      },

      set (nodes) {
        for (let activeNode of nodes) {
          if (!this.voting.includes(activeNode)) {
            this.voting.push(activeNode)
          }
        }
      }
    }
  },

  methods: {
    buildConnectionString () {
      let url = `mongodb://USER:PASSWORD@`
      let nodes = []
      if (this.cluster.nodes.length) {
        for (let clusterKey in this.cluster.nodes) {
          // do not include arbiter
          if (this.nodeState(this.cluster.nodes[clusterKey]) && this.nodeState(this.cluster.nodes[clusterKey]).rsState !== 7) {
            nodes.push(`${this.cluster.nodes[clusterKey].hostname}:27017`)
          }
        }

        url += nodes.join(`,`)
      }

      url += `/admin?replicaSet=rs0`

      if (this.readPreference) {
        url += `&readPreference=${this.readPreference.value}`
      }

      return url
    },

    /**
     * @param node
     * @returns {Array}
     */
    nodeState (node) {
      let dummy = {
        alive: 0,
        rsState: 0,
        id: ''
      }

      if (!node) {
        return dummy
      }

      try {
        return this.$store.getters['node/findById'](node.id)
      } catch (e) {
        if (e) {
          // do nothing useful
        }
        return dummy
      }
    },

    /**
     * @param node
     * @param state
     */
    vote (node, state) {
      this.$q.dialog({
        color: 'red',
        title: `${state ? `Enable` : `Disable`}  voting`,
        html: true,
        message: `
          <p>
            Are you sure you want to <strong>${state ? `enable` : `disable`}</strong> Mongo voting on node <em>${node.hostname}</em>?
          </p>
          <p>
            This will change the way how Mongo will count the final election <a href="https://docs.mongodb.com/manual/reference/replica-configuration/#rsconf.members[n].votes" target="_blank" rel="noopener noreferrer">(further details)</a>.
          </p>
          <p>It might take a while to propagate.</p>
        `,
        ok: 'Run',
        cancel: 'Cancel'
      }).onOk(() => {
        this.$q.loading.show()

        let promise = this.$axios.patch(`/v1/cluster/node/${node.id}/toggle-vote`)

        promise.then(() => {
          this.$notify.positive(`Vote on node <em>${node.hostname}</em> changed.`)
          this.$nextTick(() => this.$emit(`onRefresh`))
        })

        promise.catch((response) => {
          this.$notify.negative('It is not possible to change the vote on the node. Please try it again.')

          // eslint-disable-next-line no-console
          console.error(response)
        })

        promise.finally(() => this.$q.loading.hide())
      }).onCancel(() => {
        this.voting = this.voting.map((votingNode) => votingNode.id !== node.id)
      })
    },

    /**
     * @param node
     * @param state
     */
    priority (node, state) {
      this.$q.dialog({
        color: 'red',
        title: `${state ? `Increase` : `Decrease`}  priority`,
        html: true,
        message: `
          <p>
            Are you sure you want to <strong>${state ? `increase` : `decrease`}</strong> Mongo priority on node <em>${node.hostname}</em>?
          </p>
          <p>
            This will change the way how Mongo will count the final election <a href="https://docs.mongodb.com/manual/reference/replica-configuration/#rsconf.members[n].priority" target="_blank" rel="noopener noreferrer">(further details)</a>.
          </p>
          <p>It might take a while to propagate.</p>
        `,
        ok: 'Run',
        cancel: 'Cancel'
      }).onOk(() => {
        this.$q.loading.show()

        let promise = this.$axios.patch(`/v1/cluster/node/${node.id}/priority`, {
          dir: state
        })

        promise.then(() => {
          this.$notify.positive(`Priority on node <em>${node.hostname}</em> changed.`)
          this.$nextTick(() => this.$emit(`onRefresh`))
        })

        promise.catch((response) => {
          this.$notify.negative('It is not possible to change the priority on the node. Please try it again.')

          // eslint-disable-next-line no-console
          console.error(response)
        })

        promise.finally(() => this.$q.loading.hide())
      }).onCancel(() => {
        this.voting = this.voting.map((votingNode) => votingNode.id !== node.id)
      })
    }
  }
}
</script>
