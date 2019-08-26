<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/mallgroup.svg"
        style="width:30vw;max-width:250px;"
        alt="MALL Group"
      >
    </p>
    <p class="text-faded">
      Sorry, nothing here...<strong>(404)</strong>
    </p>
    <q-btn
      color="secondary"
      style="width: 200px;"
      @click="$router.push('/')"
    >
      Go back
    </q-btn>
  </div>
</template>
