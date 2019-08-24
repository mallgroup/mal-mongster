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
          Add a new node
        </h2>

        <q-stepper
          v-model="step"
          vertical
          color="primary"
          animated
        >
          <q-step
            :name="1"
            :done="step > 1"
            class="relative-position"
            title="Setup"
            icon="arrow_forward"
          >
            <p>First we have to connect to the host with FQDN hostname. Do not use IP address as it might have change.</p>
            <p>Server must have the public part of the private SSH key you registered earlier on this cluster. Otherwise Mongster won't be able to connect.</p>

            <div class="row">
              <div class="col">
                <q-input
                  v-model.trim="form.hostname"
                  autofocus
                  :error="$v.form.hostname.$error"
                  label="Hostname (fqdn) *"
                  hint="Hostname (fqdn) of your node."
                  error-message="Please check the hostname (fqdn) of your node."
                  @blur="$v.form.hostname.$touch"
                  @keyup.enter="connect()"
                />
              </div>
            </div>

            <q-stepper-navigation>
              <q-btn
                color="primary"
                label="Connnect"
                @click="connect()"
              />
            </q-stepper-navigation>

            <inner-loading :showing="loading.connect" />
          </q-step>

          <q-step
            :name="2"
            :done="step > 2"
            class="relative-position"
            title="Installation"
            icon="arrow_forward"
          >
            <p>Now we have to install Mongo on your station with Docker. It might take a while.</p>
            <q-banner
              class="bg-accent q-mb-sm"
            >
              <template v-slot:avatar>
                <q-icon
                  name="info"
                />
              </template>
              Make sure you have Docker installed on your server.
            </q-banner>

            <q-banner
              class="bg-accent"
            >
              <template v-slot:avatar>
                <q-icon
                  name="info"
                />
              </template>
              This will also delete existing Docker instances or Mongo data directory.
            </q-banner>

            <q-stepper-navigation>
              <q-btn
                color="primary"
                label="Install secondary"
                class="q-mr-md"
                @click="install()"
              />
              <q-btn
                v-show="!hasArbiterNode"
                color="primary"
                label="Install arbiter"
                @click="install(true)"
              />
            </q-stepper-navigation>

            <inner-loading :showing="loading.install" />
          </q-step>

          <q-step
            :name="3"
            :done="step === 3"
            title="Finish"
            icon="arrow_forward"
          >
            <p>Your station is ready for clustering.</p>

            <q-stepper-navigation>
              <q-btn
                color="primary"
                label="Done"
                @click="$refs.clusterNodeManage.hide()"
              />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>

        <div class="row q-mt-lg text-right">
          <div class="col">
            <q-btn
              label="Cancel"
              class="q-mr-sm"
              @click="$refs.clusterNodeManage.hide()"
            />
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import InnerLoading from './InnerLoading'

export default {
  name: 'ClusterNodeManage',
  validations: {
    form: {
      hostname: {
        required
      }
    }
  },
  components: {
    InnerLoading
  },
  props: {
    cluster: {
      type: Object,
      default () {
        return {}
      }
    },
    status: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      loading: {
        create: false,
        connect: false,
        install: false
      },
      form: {
        hostname: '',
        cluster: ``
      },
      step: 1
    }
  },
  computed: {
    hasArbiterNode () {
      try {
        let nodes = this.$store.state.node.items
        return nodes.some((node) => node.rsState === 7)
      } catch (e) {
        return false
      }
    }
  },
  watch: {
    status (status) {
      if (status) {
        this.form.hostname = ``
        this.form.cluster = ``
        this.$refs['clusterNodeManage'].show()
      }
    }
  },
  methods: {
    connect () {
      this.$v.form.$touch()

      if (this.$v.form.hostname.$error) {
        if (!this.form.hostname) {
          this.$notify.warning('Please enter the hostname (fqdn) address of your node.')
          return false
        }

        return false
      }

      if (this.$v.form.$error) {
        this.$notify.warning('Please check all form fields.')
        return false
      }

      this.loading.connect = true

      // make sure the cluster ID is specified
      this.form.cluster = this.cluster.id

      let promise = this.$axios.post('/v1/cluster/node/connect', this.form)

      promise.then(() => {
        this.loading.connect = false
        this.step = 2
      })

      promise.catch(({ response }) => {
        this.loading.connect = false

        // cluster not found
        if (response.status === 404) {
          this.$notify.negative(`Node not found. Please try again.`)
          return false
        }

        // already exists
        if (response.status === 409) {
          this.$notify.negative(`Node <em>${this.form.hostname}</em> already exists in the cluster. Please enter some new node hostname (fqdn) address.`)
          return false
        }

        this.$notify.negative('It is not possible to add a new node to the cluster. Please try it again.')
        console.error(response)
      })
    },

    install (isArbiter = false) {
      this.$v.form.$touch()

      if (this.$v.form.hostname.$error) {
        if (!this.form.hostname) {
          this.$notify.warning('Please enter the hostname (fqdn) address of your node.')
          return false
        }

        return false
      }

      if (this.$v.form.$error) {
        this.$notify.warning('Please check all form fields.')
        return false
      }

      this.loading.install = true

      // make sure the cluster ID is specified
      this.form.cluster = this.cluster.id

      let promise = this.$axios.post(`/v1/cluster/node/install?arbiter=${isArbiter}`, this.form)

      promise.then(async () => {
        await this.save()
      })

      promise.catch(({ response }) => {
        // cluster not found
        if (response.status === 404) {
          this.$notify.negative(`Node not found. Please try again.`)
          return false
        }

        this.$notify.negative(response.data.message || 'It is not possible to install required software on the server. Please try it again.')
        console.error(response)
      })

      promise.finally(() => {
        this.loading.install = false
      })
    },

    save () {
      this.$v.form.$touch()

      if (this.$v.form.hostname.$error) {
        if (!this.form.hostname) {
          this.$notify.warning('Please enter the hostname (fqdn) address of your node.')
          return false
        }

        return false
      }

      if (this.$v.form.$error) {
        this.$notify.warning('Please check all form fields.')
        return false
      }

      let promise = this.$axios.post('/v1/cluster/node', this.form)

      promise.then(() => {
        this.$notify.positive(`Node <em>${this.form.hostname}<em> added to the cluster.`)

        this.step = 3

        this.$emit(`onSave`)
      })

      promise.catch(({ response }) => {
        // already exists
        if (response.status === 409) {
          this.$notify.negative(`Node <em>${this.form.hostname}</em> already exists in the cluster'. Please pickup a new node hostname.`)
          return false
        }

        this.$notify.negative('It is not possible to add a new node to the cluster. Please try it again.')
        console.error(response)
      })
    },

    onHide () {
      this.$emit('onDialogHide')
      this.step = 1
    }
  }
}
</script>
