<template>
  <q-spinner-gears
    v-if="visible"
    color="primary"
    size="30px"
    class="q-mt-md q-mb-md"
  />
</template>

<script>
export default {
  name: 'ComponentSmallLoading',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  }
}
</script>
