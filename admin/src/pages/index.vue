<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <div class="col-12 text-h6 text-italic text-grey">
        Are you ready to take your MongoDB experience to the next level?
      </div>
      <div class="col-12">
        <div class="row">
          <div class="col-3">
            <q-card>
              <q-card-section class="text-h4">
                Clusters
              </q-card-section>

              <q-separator />

              <q-card-actions>
                <q-btn
                  type="link"
                  flat
                  class="full-width"
                  :to="{ name: 'cluster.list' }"
                >manage clusters</q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </div>
    <div
      class="fixed-bottom text-right q-ma-md"
    >
      <p>
        <img
          src="~assets/logo-512x512.png"
          style="width:30vw;max-width:150px;"
        >
      </p>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'PageIndex'
}
</script>
