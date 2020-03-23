<template>
  <q-dialog
    ref="clusterNodeManage"
    @hide="onHide()"
  >
    <q-card
      class="q-dialog-plugin"
      style="min-width: 600px"
    >
      <div class="q-ma-md">
        <h2 class="text-h4">
          Add a new database
        </h2>

        <div class="row">
          <div class="col">
            <q-input
              v-model.trim="form.name"
              autofocus
              :error="$v.form.name.$error"
              label="Database Name *"
              hint="Name for your database."
              error-message="Please check the name of the database."
              @blur="$v.form.name.$touch"
              @keyup.enter="save()"
            />
          </div>
        </div>

        <div
          class="row justify-center q-mt-xl"
        >
          <div class="col-12 note">
            <q-banner
              class="bg-accent"
            >
              This will also create a dummy collection (called "bootstrap") inside your database.
            </q-banner>
          </div>
        </div>

        <div class="row q-mt-lg text-right">
          <div class="col">
            <q-btn
              label="Cancel"
              class="q-mr-sm"
              @click="$refs.clusterNodeManage.hide()"
            />
            <q-btn
              label="Add"
              color="primary"
              @click="save()"
            />
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

export default {
  name: 'DatabaseManage',
  validations: {
    form: {
      name: {
        required
      }
    }
  },
  props: {
    status: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      form: {
        name: ''
      }
    }
  },
  watch: {
    status (status) {
      if (status) {
        this.form.name = ``
        this.$refs['clusterNodeManage'].show()
      } else {
        this.$refs['clusterNodeManage'].hide()
      }
    }
  },
  methods: {
    save () {
      this.$v.form.$touch()

      if (this.$v.form.name.$error) {
        if (!this.form.name) {
          this.$notify.warning('Please enter the name of the database.')
          return false
        }

        return false
      }

      if (this.$v.form.$error) {
        this.$notify.warning('Please check all form fields.')
        return false
      }

      this.$q.loading.show()

      let promise = this.$axios.post(`/v1/cluster/${this.$route.params.id}/database`, this.form)

      promise.then(() => {
        this.$notify.positive(`Database <em>${this.form.name}</em> added to the cluster. It might take a while to propagate.`)
        this.$emit(`onCreated`)
      })

      promise.catch(({ response }) => {
        // cluster not found
        if (response.status === 404) {
          this.$notify.negative(`Cluster related to the database not found.`)
          return false
        }

        // already exists
        if (response.status === 409) {
          this.$notify.negative(`Database with name <em>${this.form.name}</em> already exists. Please pickup a new database name.`)
          return false
        }

        this.$notify.negative('It is not possible to add a new database. Please try it again.')
        process.env.NODE_ENV === 'development' && console.error(response)
      })

      promise.finally(() => this.$nextTick(() => this.$q.loading.hide()))
    },

    onHide () {
      this.$emit('onDialogHide')
    }
  }
}
</script>
