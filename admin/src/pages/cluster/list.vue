<template>
  <q-page padding>
    <q-dialog
      ref="clusterDialog"
    >
      <q-card
        class="q-dialog-plugin"
        style="min-width: 600px"
      >
        <cluster-manage
          :dialog="$refs.clusterDialog"
          :cluster="activeCluster"
          @onClusterChange="fetchData"
        />
      </q-card>
    </q-dialog>

    <h2 class="text-h4 q-mt-sm">
      List of clusters
    </h2>

    <p class="text-right">
      <q-btn
        icon="add"
        color="primary"
        label="New cluster"
        @click="clusterDialog()"
      />
    </p>

    <div>
      <q-banner
        v-if="!loading.items && !items.length"
        class="bg-accent"
      >
        <template v-slot:avatar>
          <q-icon name="group_work" />
        </template>
        There are no clusters to display yet. You should start by creating
        <a
          href="javascript:void(0)"
          @click="clusterDialog()"
        >
          creating a new one</a>.
      </q-banner>
    </div>

    <div v-if="items.length">
      <q-table
        :data="items"
        :columns="columns"
        :filter="filter.name"
      >
        <template v-slot:top-right>
          <q-input
            v-model="filter.name"
            borderless
            dense
            debounce="300"
            placeholder="Search"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              key="options"
              :props="props"
            >
              <q-btn
                color="accent"
                icon="search"
                dense
                label="detail"
                size="sm"
                class="q-mr-sm"
                @click="goToDetail(props.row)"
              />
              <q-btn
                color="secondary"
                label="info"
                icon="help"
                dense
                size="sm"
                class="q-mr-sm"
                @click="clusterDialog(props.row)"
              />
              <q-btn
                color="primary"
                label="delete"
                icon="clear"
                dense
                size="sm"
                @click="destroy(props.row, props.row.__index)"
              />
            </q-td>
            <q-td
              key="name"
              :props="props"
            >
              {{ props.row.name }}
            </q-td>
            <q-td
              key="nodes"
              :props="props"
              v-html="nodesWithLineBreak(props.row.nodes)"
            />
          </q-tr>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import ClusterManage from '../../components/ClusterManage'

export default {
  name: 'PageClusterList',
  components: {
    ClusterManage
  },
  data () {
    return {
      loading: {
        items: false
      },
      items: [],
      filter: {
        name: ''
      },
      dialog: {
        cluster: {
          add: false
        }
      },
      activeCluster: null,
      columns: [
        {
          name: `options`,
          label: `Options`,
          align: `left`
        },
        {
          name: `name`,
          label: `Name`,
          field: `name`,
          align: `left`
        },
        {
          name: `nodes`,
          label: `Nodes`,
          field: `nodes`,
          align: `left`
        }
      ]
    }
  },
  computed: {
    filteredItems () {
      let items = this.items

      items = items.filter((item) => {
        if (this.filter.name) {
          return item.name.toLowerCase().indexOf(this.filter.name.toLowerCase()) > -1
        }

        return true
      })

      return items
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    clusterDialog (cluster) {
      this.activeCluster = cluster || null
      this.$nextTick(() => this.$refs.clusterDialog.show())
    },
    fetchData () {
      this.$q.loading.show()
      this.loading.items = true
      let promise = this.$axios.get('/v1/cluster')

      promise.then((result) => {
        this.loading.items = false
        if (typeof result.data.data !== 'undefined') {
          this.items = result.data.data
        }
      })

      promise.catch((err) => {
        this.loading.items = false
        console.error(err)
      })

      promise.finally(() => this.$q.loading.hide())
    },

    /**
     * @param cluster
     * @param index
     */
    destroy (cluster, index) {
      this.$q.dialog({
        color: 'red',
        title: 'Delete cluster',
        message: cluster.nodes.length > 0 ? `You have servers in your cluster. You have to remove them first.` : `Are you sure you want to delete '${cluster.name}' cluster?`,
        ok: cluster.nodes.length > 0 ? 'ok' : `Delete`,
        cancel: 'Cancel'
      }).onOk(async () => {
        if (cluster.nodes.length > 0) {
          return false
        }

        this.$q.loading.show()

        await new Promise((resolve, reject) => setTimeout(() => { resolve() }, 1000))

        let promise = this.$axios.delete(`/v1/cluster/${cluster.id}`)

        promise.then((response) => {
          this.$q.loading.hide()
          this.$notify.positive(`Cluster '${response.data.data.name}' removed.`)

          this.items.splice(index, 1)
        })

        promise.catch(({ response }) => {
          this.$q.loading.hide()

          console.error(response)

          if (response.status === 400) {
            // node has some clusters
            this.$notify.negative('The cluster has nodes assigned. You have to remove nodes first.')
            return false
          }

          this.$notify.negative('It is not possible to remove this cluster. Please try it again.')
        })
      })
    },

    goToDetail (cluster) {
      return this.$router.push({
        name: 'cluster.detail',
        params: {
          id: cluster.id
        }
      })
    },

    nodesWithLineBreak (nodes) {
      return nodes.map((node) => node.hostname).join(`<br />`)
    }
  }
}
</script>

<style lang="stylus">
  .infoicon
    font-size 500%
</style>
