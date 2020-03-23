<template>
  <div>
    <database-manage
      :status="dialog.database.add"
      @onCreated="dbCreated()"
      @onDialogHide="dialog.database.add = false"
    />

    <div
      class="relative-position"
    >
      <div class="row">
        <div class="col">
          <h2 class="text-h4 q-mt-none">
            <q-icon name="list" /> Databases
          </h2>
        </div>
        <div class="col text-right">
          <q-btn
            color="primary"
            label="Add database"
            icon="add"
            @click="dialog.database.add = true"
          />
        </div>
      </div>

      <q-banner
        v-if="!loading.data && (!info || !info.databases.length)"
        class="bg-accent"
      >
        Currently there are any public databases to list.
      </q-banner>

      <template v-if="info && Object.keys(info).length">
        <table
          v-if="info.databases.length"
          class="pure-table pure-table-bordered"
          aria-describedby="List of databases on the node."
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Size</th>
              <th>Has Data</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(database, index) in info.databases"
              :key="database.name"
            >
              <td>{{ database.name }}</td>
              <td>{{ database.sizeOnDisk | HumanBytes }}</td>
              <td>
                {{ database.isEmpty ? "no" : "yes" }}
              </td>
              <td>
                <template v-if="['admin', 'config', 'local'].indexOf(database.name) === -1">
                  <q-btn
                    color="primary"
                    label="delete"
                    dense
                    size="sm"
                    class="q-mr-sm q-mb-sm full-width"
                    icon="clear"
                    @click.native="destroy(database, index)"
                  />
                </template>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="q-mt-sm">
          <em>Total DB size: {{ info.totalSize | HumanBytes }}</em>
        </div>
      </template>

      <inner-loading :showing="loading.data" />
    </div>

    <database-users
      v-if="info && info.databases.length"
      :cluster="cluster"
      :databases="databaseList(info.databases)"
    />
  </div>
</template>

<script>
import DatabaseUsers from '../components/DatabaseUsers'
import DatabaseManage from '../components/DatabaseManage'
import HumanBytes from '../filters/HumanBytes'
import InnerLoading from './InnerLoading'

export default {
  name: 'ComponentNodeDatabaseList',
  components: {
    DatabaseUsers,
    DatabaseManage,
    InnerLoading
  },
  filters: {
    HumanBytes
  },
  props: {
    cluster: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      interval: null,
      info: null,
      dialog: {
        database: {
          add: false
        }
      },
      loading: {
        data: false
      }
    }
  },

  computed: {
    databases () {
      try {
        return this.info.databases
      } catch (e) {
        return []
      }
    }
  },

  created () {
    this.fetchData()
  },

  methods: {
    fetchData () {
      this.loading.data = true

      let promise = this.$axios.get(`/v1/cluster/${this.cluster}/database`)

      promise.then((result) => {
        if (typeof result.data.data !== 'undefined') {
          this.info = result.data.data
        }
      })

      promise.catch((err) => {
        process.env.NODE_ENV === 'development' && console.error(err)
      })

      promise.finally(() => this.$nextTick(() => {
        this.loading.data = false
      }))
    },

    /**
     * @param database
     * @param index
     */
    destroy (database, index) {
      this.$q.dialog({
        color: 'red',
        title: 'Delete database',
        html: true,
        message: `
          Are you sure you want to delete <em>${database.name}</em> database?
          <br />
          This will also drop all users and related collections.
        `,
        ok: 'Delete',
        cancel: 'Cancel'
      }).onOk(() => {
        this.loading.data = true

        let promise = this.$axios.delete(`/v1/cluster/${this.cluster}/database/${database.name}`)

        promise.then(() => {
          this.$notify.positive(`Database <em>${database.name}</em> removed. It might take a while to propagate.`)

          this.fetchData()
        })

        promise.catch(({ response }) => {
          process.env.NODE_ENV === 'development' && console.error(response)

          this.$notify.negative('It is not possible to remove the database. Please try it again.')
        })

        promise.finally(() => this.$nextTick(() => {
          this.loading.data = false
        }))
      })
    },

    databaseList (databases) {
      return databases.map((db) => {
        return db.name
      })
    },

    dbCreated () {
      this.$nextTick(() => {
        this.dialog.database.add = false
        this.fetchData()
      })
    }
  }
}
</script>
