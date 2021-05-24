<template>
  <div class="q-ma-md">
    <h2 class="text-h4">
      {{ isEdit ? 'Cluster info' : 'New cluster' }}
    </h2>
    <div class="row">
      <div class="col">
        <q-input
          v-model="form.name"
          :error="$v.form.name.$error"
          error-message="Check the name of your new cluster."
          label="Name *"
          hint="Name for your cluster."
          autofocus
          maxlength="20"
          @blur="$v.form.name.$touch"
          @keyup.enter="save()"
        />
      </div>
    </div>
    <div class="row q-mb-md">
      <div class="col">
        <q-input
          v-model="form.ssh"
          :error="$v.form.ssh.$error"
          error-message="Please enter your OpenSSH private key."
          type="textarea"
          label="OpenSSH Private Key *"
          hint="We need OpenSSH private key to be able to work with your servers."
          @blur="$v.form.ssh.$touch"
        />
        <div class="q-mt-sm q-mb-sm">
          <q-icon name="info" />
          Your key is going to be encrypted in the database.
        </div>
      </div>
    </div>

    <div
      :class="{ 'shadow-1 q-pa-md' : form.user && form.password && form.authenticationDatabase && form.authKey }"
    >
      <p
        v-if="form.user && form.password && form.authenticationDatabase && form.authKey"
        class="text-red"
      >
        You already configured credentials listed bellow.
        You can not update those values again.
      </p>
      <div class="row q-gutter-sm  q-mt-sm q-mb-md">
        <div class="col">
          <q-input
            v-model="form.user"
            :readonly="isEdit"
            :error="$v.form.user.$error"
            error-message="Check the root user name."
            label="User *"
            :hint="form.id.length ? `Already configured.` : `Root user for your database.`"
            @blur="$v.form.user.$touch"
            @keyup.enter="save()"
          />
        </div>
        <div class="col">
          <q-input
            v-model="form.password"
            :readonly="isEdit"
            :error="$v.form.password.$error"
            error-message="Check the root user's password."
            label="Password *"
            :hint="form.id.length ? `Already configured.` : `Root users's password.`"
            @blur="$v.form.password.$touch"
            @keyup.enter="save()"
          />
        </div>
      </div>
      <div
        v-if="!form.id.length"
        class="row q-mb-md"
      >
        <div class="col">
          <q-icon name="info" />
          Your password is going to be encrypted in the database.
        </div>
      </div>
      <div class="row">
        <div class="col">
          <q-input
            v-model="form.authenticationDatabase"
            readonly
            :error="$v.form.authenticationDatabase.$error"
            error-message="Check the authentication database option."
            label="Authentication Database"
            hint="Admin DB that holds authentication. It is 'admin' by default."
            @blur="$v.form.authenticationDatabase.$touch"
            @keyup.enter="save()"
          />
        </div>
      </div>
      <div class="row">
        <div class="col">
          <q-input
            type="textarea"
            v-model="form.authKey"
            :readonly="isEdit"
            :error="$v.form.authKey.$error"
            error-message="Check the authentication key."
            label="Auth Key *"
            :hint="form.id.length ? `Already configured.` : `Auth key is the key Mongo instances are communicating within each other. It should has 256 characters. We created one for you automatically.`"
            @blur="$v.form.authKey.$touch"
            @keyup.enter="save()"
          />
        </div>
      </div>
    </div>

    <div class="row q-mt-lg text-right">
      <div class="col">
        <q-btn
          label="Cancel"
          class="q-mr-sm"
          @click="dialog.hide()"
        />
        <q-btn
          v-if="!isEdit"
          label="Add cluster"
          color="primary"
          @click="save()"
        />
        <q-btn
          v-if="isEdit"
          label="Update details"
          color="primary"
          @click="save()"
        />
      </div>
    </div>
    <div class="row q-mt-md">
      <div class="col">
        <h6 class="q-ma-none">
          Notes
        </h6>
        <ul>
          <li>
            <strong>Admin Credentials</strong>
            <br>
            You cannot change admin credentials and authentication database once configured.
          </li>
          <li>
            <strong>Volume</strong>
            <br>
            Mongo directory with database is mounted in <em>/data</em> folder on your server.
          </li>
          <li>
            <strong>Backup</strong>
            <br>
            It uses tool mongodump, which saves data into folder <em>/data/backup</em> every day at 00:00
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import passwordGenerator from 'password-generator'

export default {
  name: 'ComponentClusterAdd',
  validations: {
    form: {
      name: {
        required
      },
      ssh: {
        required
      },
      user: {
        required
      },
      password: {
        required
      },
      authenticationDatabase: {
        required
      },
      authKey: {
        required
      }
    }
  },
  props: {
    dialog: {
      type: Object,
      required: true
    },
    cluster: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      form: {
        id: '',
        name: '',
        ssh: '',
        user: '',
        password: '',
        authenticationDatabase: 'admin',
        authKey: passwordGenerator(256, false, '^[a-zA-Z0-9]')
      }
    }
  },
  computed: {
    isEdit () {
      return this.form.id !== ''
    }
  },
  created () {
    if (this.cluster) {
      this.form.id = this.cluster.id
      this.form.name = this.cluster.name
      this.form.authenticationDatabase = this.cluster.authenticationDatabase
      this.form.ssh = this.cluster.ssh
      this.form.user = this.cluster.user
      this.form.password = this.cluster.password
      this.form.authKey = this.cluster.authKey
    }
  },
  methods: {
    async save () {
      this.$v.form.$touch()

      if (this.$v.form.$error) {
        this.$notify.warning('Please check all form fields.')
        return false
      }

      this.$q.loading.show()

      await new Promise((resolve, reject) => setTimeout(() => { resolve() }, 1000))

      let promise = this.$axios[this.cluster ? `patch` : `post`](`/v1/cluster`, this.form)

      promise.then(() => {
        this.$notify.positive(`Cluster <em>${this.form.name}</em> ${this.cluster ? `updated` : `created`}.`)
        this.dialog.hide()
        this.$emit(`onClusterChange`)

        this.$q.loading.hide()
      })

      promise.catch(({ response }) => {
        this.$q.loading.hide()

        // already exists
        if (response.status === 409) {
          this.$notify.negative(`Cluster with name <em>${this.form.name}</em> already exists. Please pickup a new cluster name.`)
          return false
        }

        this.$notify.negative('It is not possible to add a new cluster. Please try it again.')

        // eslint-disable-next-line no-console
        console.error(response)
      })
    }
  }
}
</script>

<style lang="stylus">
  .link
    font-style italic
    text-decoration underline
    cursor pointer
</style>
