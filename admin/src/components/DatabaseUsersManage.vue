<template>
  <q-dialog
    ref="databaseUserManage"
    @hide="onHide()"
  >
    <q-card
      class="q-dialog-plugin"
      style="min-width: 600px"
    >
      <div class="q-ma-md">
        <h2 class="text-h4">
          New User
        </h2>

        <div class="row">
          <div class="col">
            <q-input
              v-model.trim="form.username"
              autofocus
              :error="$v.form.username.$error"
              label="Username *"
              hint="Username with access to the database."
              error-message="Please check the username."
              @blur="$v.form.username.$touch"
              @keyup.enter="save()"
            />
          </div>
        </div>

        <div class="row">
          <div class="col">
            <q-input
              v-model.trim="form.password"
              :error="$v.form.password.$error"
              type="password"
              label="Password *"
              hint="Password for your user."
              error-message="Please check the password."
              @blur="$v.form.password.$touch"
              @keyup.enter="save()"
            />
          </div>
        </div>

        <div class="row q-mt-lg text-right">
          <div class="col">
            <q-btn
              label="Cancel"
              class="q-mr-sm"
              @click="$refs.databaseUserManage.hide()"
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
  name: 'DatabaseUsersManage',
  validations: {
    form: {
      username: {
        required
      },
      password: {
        required
      }
    }
  },
  props: {
    status: {
      type: Boolean,
      default: false
    },
    database: {
      type: String,
      required: true
    },
    cluster: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  },
  watch: {
    status (status) {
      if (status) {
        this.$refs['databaseUserManage'].show()
      } else {
        this.$refs['databaseUserManage'].hide()
      }
    }
  },
  created () {
    this.form.username = ``
    this.form.password = ``
  },
  methods: {
    save () {
      this.$v.form.$touch()

      if (this.$v.form.$error) {
        this.$notify.negative('Please check all form fields.')
        return false
      }

      this.$q.loading.show()

      let promise = this.$axios.post(`/v1/cluster/${this.cluster}/database/${this.database}/user`, this.form)

      promise.then(() => {
        this.$notify.positive(`User <em>${this.form.username}</em> added to the cluster. It might take a while to propagate.`)
        this.$emit(`onCreated`)
      })

      promise.catch(({ response }) => {
        // already exists
        if (response.status === 409) {
          this.$notify.negative(`User with name <em>${this.form.username}</em> already exists. Please pickup a new user name.`)
          return false
        }

        this.$notify.negative('It is not possible to add a new user. Please try it again.')
        console.error(response)
      })

      promise.finally(() => this.$nextTick(() => this.$q.loading.hide()))
    },

    onHide () {
      this.$emit('onDialogHide')
    }
  }
}
</script>
