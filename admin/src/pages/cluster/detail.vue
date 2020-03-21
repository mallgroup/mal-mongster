<template>
  <q-page
    padding
  >
    <div class="row">
      <div class="col">
        <h2 class="text-h4 q-mt-none">
          <q-icon name="developer_board" /> Cluster - <em>{{ cluster ? cluster.name : `` }}</em>
        </h2>
      </div>
    </div>

    <q-banner
      v-if="!cluster && !loading.detail"
      class="bg-accent text-white"
    >
      Currently there are no info about the cluster. It might be due the server error.
    </q-banner>

    <template v-if="cluster">
      <q-tabs
        v-model="panel"
        align="left"
      >
        <q-tab
          name="node"
          label="Node"
          icon="apps"
        />
        <q-tab
          v-if="isConfigurable"
          name="database"
          label="Database"
          icon="menu"
        />
        <q-tab
          v-if="isConfigurable"
          name="backup"
          label="Backup"
          icon="storage"
        />
      </q-tabs>

      <q-tab-panels
        v-model="panel"
      >
        <q-tab-panel name="node">
          <div class="row q-mb-md">
            <div class="col text-right">
              <q-btn
                color="primary"
                label="Add node"
                icon="add"
                @click="dialog.nodeManage = true"
              />
            </div>
          </div>

          <node-list
            v-if="cluster.nodes.length"
            :cluster="cluster"
            :loading="loading.detail"
            :is-configurable="isConfigurable"
            :has-primary-node="hasPrimaryNode"
            @onDestroy="destroy"
            @onDockerRestart="restartDocker"
            @onRefresh="fetchData(true)"
          />
          <q-banner
            v-else
            class="bg-accent"
          >
            Currently there are any nodes in your cluster. You should add a new one.
          </q-banner>
        </q-tab-panel>

        <q-tab-panel
          v-if="isConfigurable"
          name="database"
        >
          <database-list
            :cluster="cluster.id"
            @onSave="fetchData(true)"
          />
        </q-tab-panel>
        <q-tab-panel
          v-if="hasPrimaryNode"
          name="backup"
        >
          <database-backup />
        </q-tab-panel>
      </q-tab-panels>
    </template>

    <cluster-node-manage
      :cluster="cluster"
      :status="dialog.nodeManage"
      @onDialogHide="dialog.nodeManage = false"
      @onSave="fetchData(true)"
    />
  </q-page>
</template>

<script>
import DatabaseList from '../../components/DatabaseList'
import ClusterNodeManage from '../../components/ClusterNodeManage'
import DatabaseBackup from '../../components/DatabaseBackup'
import NodeList from '../../components/NodeList'

export default {
  name: 'ClusterDetail',
  components: {
    DatabaseList,
    ClusterNodeManage,
    NodeList,
    DatabaseBackup
  },
  data () {
    return {
      interval: null,
      cluster: null,
      minClusterNode: 3,
      loading: {
        detail: false,
        destroy: false
      },
      step: 1,
      dialog: {
        nodeManage: false
      },
      panel: 'node'
    }
  },
  computed: {
    /**
     * @return {boolean}
     */
    isConfigurable () {
      try {
        return this.$store.state.node.items.some((node) => node.alive)
      } catch (e) {
        return false
      }
    },

    /**
     * @return {boolean}
     */
    hasPrimaryNode () {
      try {
        let nodes = this.$store.state.node.items
        return nodes.some((node) => node.rsState === 1)
      } catch (e) {
        return false
      }
    },

    /**
     * @return {boolean}
     */
    hasSecondaryNode () {
      try {
        let nodes = this.$store.state.node.items
        return nodes.some((node) => node.rsState === 2)
      } catch (e) {
        return false
      }
    }
  },
  watch: {
    'dialog.nodeManage' (state) {
      if (state === false) {
        this.step = 1
      }
    }
  },
  created () {
    this.interval = setInterval(() => {
      this.fetchData(true)
    }, 10 * 1000)

    this.fetchData(false)
  },

  beforeDestroy () {
    clearInterval(this.interval)
  },

  methods: {
    fetchData (silent = false) {
      if (!silent) {
        this.$q.loading.show()
        this.loading.detail = true
      }

      let promise = this.$axios.get(`/v1/cluster/${this.$route.params.id}`)

      promise.then((result) => {
        if (!silent) {
          this.loading.detail = false
        }

        try {
          this.cluster = result.data.data
          this.updateInfo(this.cluster.nodes)
        } catch (err) {
          console.error(err)
        }
      })

      promise.finally(async () => {
        if (!silent) {
          await new Promise((resolve, reject) => setTimeout(() => { resolve() }, 1000))
          this.$q.loading.hide()
          this.loading.detail = false
        }
      })
    },

    async updateInfo (nodes) {
      nodes.forEach((node) => {
        let promise = this.$axios.get(`/v1/node/${node.id}/info`)

        promise.then((result) => {
          try {
            this.$store.commit('node/add', result.data.data)
          } catch (e) {
            console.error(e)
          }
        })
      })
    },

    /**
     * @param node
     */
    destroy (node, index) {
      this.$q.dialog({
        color: 'red',
        title: 'Delete node',
        html: true,
        message: `
          Are you sure you want to delete <em>${node.hostname}</em> node?
          <br />
          All data are going to be deleted. There is also a high risk for your cluster to fall apart.
        `,
        ok: 'Delete',
        cancel: 'Cancel'
      }).onOk(async () => {
        this.$q.loading.show()

        await new Promise((resolve, reject) => setTimeout(() => { resolve() }, 1000))

        let promise = this.$axios.delete(`/v1/cluster/node/${node.id}`)

        promise.then(async (response) => {
          this.$notify.positive(`Node <em>${node.hostname}</em> removed.`)

          this.$store.commit('node/remove', node)

          await this.fetchData(true)

          this.$q.loading.hide()
        })

        promise.catch((response) => {
          this.$notify.negative('It is not possible to remove the node from the cluster. Please try it again.')
          console.error(response)
          this.$q.loading.hide()
        })
      })
    },

    /**
     * @param node
     * @param index
     */
    restartDocker (node, index) {
      this.$q.dialog({
        color: 'red',
        title: 'Restart Docker Container',
        html: true,
        message: `
          Are you sure you want to restart running Docker container on node <em>${node.hostname}</em>?
          <br />
          There is a high risk for your cluster to fall apart.
        `,
        ok: 'Run',
        cancel: 'Cancel'
      }).onOk(() => {
        this.$q.loading.show()

        let promise = this.$axios.patch(`/v1/node/${node.id}/restart-docker`)

        promise.then(() => {
          this.$notify.positive(`Docker on node <em>${node.hostname}</em> restarted.`)
        })

        promise.catch((response) => {
          this.$notify.negative('It is not possible to restart a Docker container on the node. Please try it again.')
          console.error(response)
        })

        promise.finally(() => this.$q.loading.hide())
      })
    }
  }
}
</script>
