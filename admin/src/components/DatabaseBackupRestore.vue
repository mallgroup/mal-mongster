<template>
  <div>
    <div class="row">
      <div class="col-12">
        <q-banner class="bg-secondary text-white q-mt-sm q-mb-lg">
          Please note that the backup/restore process is executed on the <i>primary</i> node only.
        </q-banner>
      </div>
      <div class="col-12">
        <q-btn
          @click="generate"
          icon="add"
        >
          New Backup
        </q-btn>
      </div>
    </div>
    <div class="row q-mt-lg">
      <div class="col-12">
        <h4 class="text-h5 q-ma-none q-mb-sm">
          List of backups
        </h4>

        <small-loading :visible="loading.items" />

        <p v-if="!loading.items && !dirs.length">
          There are no backups yet.
        </p>

        <q-list
          v-if="!loading.items && dirs.length"
          bordered
          separator
        >
          <q-item
            v-for="(dir, key) in dirs"
            :key="key"
          >
            <q-item-section>
              <q-item-label>{{ dir }}</q-item-label>
              <q-item-label>
                <q-btn-group>
                  <q-btn
                    label="download"
                    size="sm"
                    color="secondary"
                    @click="download(dir)"
                  />
                  <q-btn
                    label="restore"
                    size="sm"
                    color="accent"
                    @click="restore(dir)"
                  />
                  <q-btn
                    label="delete"
                    size="sm"
                    color="red"
                    @click="destroy(dir)"
                  />
                </q-btn-group>
              </q-item-label>

            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import { baseUrl } from '../boot/axios'

import SmallLoading from '../components/SmallLoading'

export default {
  name: 'ComponentDatabaseBackup',
  components: {
    SmallLoading
  },
  data () {
    return {
      loading: {
        items: false
      },
      dirs: []
    }
  },

  created () {
    this.fetchData()
  },

  methods: {
    async fetchData () {
      this.dirs = []
      this.loading.items = true

      try {
        let promise = await this.$axios.get(`v1/cluster/node/${this.$route.params.id}/backup`)

        if (promise.data.data.items.length) {
          this.dirs = promise.data.data.items
        }
      } catch (error) {
        if (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }
      } finally {
        this.loading.items = false
      }
    },

    generate () {
      this.$q.dialog({
        color: 'red',
        title: 'Backup Database',
        html: true,
        message: `Are you sure you want to generate a new backup?
        <br />
        It might take a while based on the size of your database.
        <br />
        Also it consumes some memory on the primary node.`,
        ok: 'Backup',
        cancel: 'Cancel'
      }).onOk(async () => {
        this.$q.loading.show()

        try {
          await this.$axios.post(`/v1/cluster/node/${this.$route.params.id}/backup`)

          this.$notify.positive(`Cluster successfully backed up.`)
          this.$q.loading.hide()

          await this.fetchData()
        } catch (error) {
          this.$q.loading.hide()

          if (error) {
            // eslint-disable-next-line no-console
            console.error(error)
          }
        }
      })
    },

    download (directory) {
      this.$q.dialog({
        color: 'red',
        title: 'Download backup',
        html: true,
        message: `Are you sure you want to download the backup <i>${directory}</i>?
        <br />
        It might take a while to archive all database files.`,
        ok: 'Download',
        cancel: 'Cancel'
      }).onOk(async () => {
        this.$q.loading.show()

        setTimeout(() => {
          try {
            window.location = `${baseUrl}/v1/cluster/node/${this.$route.params.id}/backup/download/${directory}`
          } catch (error) {
            if (error) {
              // eslint-disable-next-line no-console
              console.error(error)
            }
          } finally {
            this.$q.loading.hide()
          }
        }, 2000)
      })
    },

    restore (directory) {
      this.$q.dialog({
        color: 'red',
        title: 'Restore Backup',
        html: true,
        message: `Are you sure you want to restore the whole backup <i>${directory}</i> at once?
        <br />
        It might take a while to restore your data.
        <br />
        Your current data are gonna be destroyed.`,
        ok: 'Restore',
        cancel: 'Cancel'
      }).onOk(async () => {
        this.$q.loading.show()

        try {
          await this.$axios.post(`/v1/cluster/node/${this.$route.params.id}/backup/restore/${directory}`)

          this.$notify.positive(`Cluster successfully restored.`)
        } catch (error) {
          if (error) {
            // eslint-disable-next-line no-console
            console.error(error)
            this.$notify.negative('It is not possible to restore the backup you requested.')
          }
        } finally {
          this.$q.loading.hide()
        }
      })
    },

    destroy (directory) {
      this.$q.dialog({
        color: 'red',
        title: 'Destroy Backup',
        html: true,
        message: `Are you sure you want to destroy the backup <i>${directory}</i>?`,
        ok: 'Destroy',
        cancel: 'Cancel'
      }).onOk(async () => {
        this.$q.loading.show()

        try {
          await this.$axios.post(`/v1/cluster/node/${this.$route.params.id}/backup/destroy/${directory}`)

          this.$notify.positive(`Backup successfully removed.`)
          this.$q.loading.hide()

          await this.fetchData()
        } catch (error) {
          if (error) {
            // eslint-disable-next-line no-console
            console.error(error)
            this.$notify.negative('It is not possible to remove the backup.')
          }
        }
      })
    }
  }
}
</script>
