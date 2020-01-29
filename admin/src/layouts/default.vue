<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        :inverted="$q.theme === 'ios'"
        color="primary"
      >
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
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-item
          :to="{ name: 'home' }"
          exact
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            Home
          </q-item-section>
        </q-item>
        <q-item
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
      leftDrawerOpen: this.$q.platform.is.desktop
    }
  }
}
</script>

<style>
</style>
