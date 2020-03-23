<template>
  <div>
    <div class="row">
      <div class="col-12">
        <q-banner class="bg-secondary text-white q-mt-sm q-mb-lg">
          Please note that all items here are taken from <b>primary</b> server.
          Mongo is not able to create a backup from other than primary node.
        </q-banner>
      </div>
      <div class="col-12">
        <h4
          class="text-h5 q-ma-none q-mb-sm"
        >
          New Backup
        </h4>
        <q-btn
          :loading="loading.generate"
          @click="generate"
        >
          Create
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
          padding
          class="rounded-borders"
          style="max-width: 50%"
        >
          <q-item
            v-for="(dir, key) in dirs"
            :key="key"
            v-ripple
            clickable
            @click="download(dir)"
          >
            <q-item-section
              avatar
              top
            >
              <q-avatar
                icon="get_app"
                color="secondary"
                text-color="white"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label
                lines="1"
              >
                {{ dir }}
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
        items: false,
        generate: false
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
        It might take a while based on the size of your database.`,
        ok: 'Backup',
        cancel: 'Cancel'
      }).onOk(async () => {
        this.loading.generate = true

        let status = false

        try {
          await this.$axios.post(`/v1/cluster/node/${this.$route.params.id}/backup`)

          status = true

          this.$notify.positive(`Cluster successfully backed up.`)
        } catch (error) {
          if (error) {
            // eslint-disable-next-line no-console
            console.error(error)
          }
        } finally {
          this.loading.generate = false
        }

        if (status) {
          // load dirs again
          await this.fetchData()
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
        It might take a while based on the size of your database.`,
        ok: 'Download',
        cancel: 'Cancel'
      }).onOk(async () => {
        setTimeout(() => {
          try {
            window.location = `${baseUrl}/v1/cluster/node/${this.$route.params.id}/backup/download/${directory}`
          } catch (error) {
            if (error) {
              // eslint-disable-next-line no-console
              console.error(error)
            }
          } finally {
            this.loading.items = false
          }
        }, 2000)
      })
    }
  }
}
</script>
