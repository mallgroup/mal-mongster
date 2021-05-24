<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title>
          Mongster
        </q-toolbar-title>

        <q-space />
        {{ version }}
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item
          clickable
          exact
          :to="{ name: 'home' }"
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            Home
          </q-item-section>
        </q-item>
        <q-item
          clickable
          exact
          :to="{ name: 'cluster.list' }"
        >
          <q-item-section avatar>
            <q-icon name="group_work" />
          </q-item-section>
          <q-item-section>
            Manage Cluster
          </q-item-section>
        </q-item>
      </q-list>
      <div class="fixed-bottom text-center">
        <p>
          <a
            href="http://mallgroup.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="MALL Group"
              src="~assets/mallgroup.svg"
              style="max-width:150px;"
            >
          </a>
        </p>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'LayoutDefault',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      version: 'v4.4.6'
    }
  }
}
</script>

<style>
</style>
