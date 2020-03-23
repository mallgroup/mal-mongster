<template>
  <div class="relative-position">
    <h2 class="text-h4 q-mb-none">
      <q-icon name="group" /> Users
    </h2>

    <div
      v-if="database.value"
      class="q-mb-md text-right"
    >
      <q-btn
        color="primary"
        icon="add"
        @click="dialog.user.add = true"
      >
        Add user
      </q-btn>
    </div>

    <database-users-manage
      v-if="database.value"
      :database="database.value"
      :cluster="cluster"
      :status="dialog.user.add"
      @onCreated="userCreated()"
      @onDialogHide="dialog.user.add = false"
    />

    <div
      v-if="databases.length"
      class="row"
    >
      <div class="col-6">
        <q-select
          v-model="database"
          :options="databaseOptions"
          float-label="Select database"
        />
      </div>
    </div>

    <div class="row q-mt-md">
      <div class="col-6">
        <p v-if="databases.length && !database">
          Please select a database from the select box first.
        </p>

        <p v-if="!databases.length">
          There is no configurable database to select from. You should add a new one.
        </p>

        <q-banner
          v-if="databases.length && database && !loading.users && !users.length"
          class="bg-accent"
        >
          There are no users in this database yet. You should add a new one.
        </q-banner>

        <template v-if="!loading.users && users.length">
          <table
            class="pure-table pure-table-bordered"
            aria-describedby="List of users on the node."
          >
            <thead>
              <tr>
                <th>Username</th>
                <th>Roles</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(user, index) in users"
                :key="user._id"
              >
                <td v-text="user.user" />
                <td>
                  <div
                    v-for="role in user.roles"
                    :key="role.role"
                  >
                    {{ role.role }}
                  </div>
                </td>
                <td valign="top">
                  <q-btn
                    color="primary"
                    label="delete"
                    dense
                    size="sm"
                    class="q-mr-sm q-mb-sm full-width"
                    icon="clear"
                    @click.native="destroy(user, index)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </template>
      </div>
    </div>
    <inner-loading :showing="loading.users || loading.delete" />
  </div>
</template>

<script>
import DatabaseUsersManage from '../components/DatabaseUsersManage'
import InnerLoading from '../components/InnerLoading'
export default {
  name: 'ComponentDatabaseUsers',
  components: {
    DatabaseUsersManage,
    InnerLoading
  },
  props: {
    cluster: {
      type: String,
      required: true
    },
    databases: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      loading: {
        users: false,
        delete: false
      },
      database: {
        value: ``
      },
      users: [],
      dialog: {
        user: {
          add: false
        }
      }
    }
  },

  computed: {
    /**
     * @returns {*}
     */
    databaseOptions () {
      let items = []

      this.databases.forEach((db) => {
        if (['admin', 'config', 'local'].indexOf(db) === -1) {
          items.push({
            label: db,
            value: db
          })
        }
      })

      return items
    }
  },

  watch: {
    database (name) {
      if (name) {
        this.$q.localStorage.set(`${this.cluster}.database.selected`, name)
        this.fetchData()
      } else {
        this.users = []
      }
    }
  },

  created () {
    this.database = (() => {
      try {
        let selected = this.$q.localStorage.getItem(`${this.cluster}.database.selected`)

        if (selected) {
          if (this.databases.indexOf(selected.value) > -1) {
            return selected
          }
        }
      } catch (err) {
        if (err) {
          process.env.NODE_ENV === 'development' && console.error(err)
        }
      }

      return ''
    })()
  },

  methods: {
    fetchData () {
      this.loading.users = true

      let promise = this.$axios.get(`/v1/cluster/${this.cluster}/database/${this.database.value}/user`)

      promise.then((result) => {
        if (typeof result.data.data !== 'undefined') {
          this.users = result.data.data
        }
      })

      promise.catch((err) => {
        process.env.NODE_ENV === 'development' && console.error(err)
      })

      promise.finally(() => this.$nextTick(() => {
        this.loading.users = false
      }))
    },

    /**
     * @param user
     * @param index
     */
    destroy (user, index) {
      this.$q.dialog({
        color: 'red',
        title: 'Remove user',
        html: true,
        message: `Are you sure you want to remove <em>${user.user}</em> from the database?`,
        ok: 'Delete',
        cancel: 'Cancel'
      }).onOk(() => {
        this.loading.delete = true

        let promise = this.$axios.delete(`/v1/cluster/${this.cluster}/database/${this.database.value}/user/${user.user}`)

        promise.then(async (result) => {
          if (typeof result.data.data !== 'undefined') {
            // remove user from array
            this.fetchData()
            this.$notify.positive(`User <em>${user.user}</em> removed.`)
          }
        })

        promise.catch((err) => {
          process.env.NODE_ENV === 'development' && console.error(err)

          this.$notify.negative('It is not possible the user from the database. Please try it again.')
        })

        promise.finally(() => {
          this.loading.delete = false
        })
      })
    },

    userCreated () {
      this.dialog.user.add = false
      this.fetchData()
    }
  }
}
</script>
