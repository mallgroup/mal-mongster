<template>
  <q-inner-loading :showing="showing">
    <q-spinner-gears
      size="50px"
      color="secondary"
    />
  </q-inner-loading>
</template>

<script>
export default {
  name: 'ComponentInnerLoading',
  props: {
    showing: {
      type: Boolean,
      default: false
    }
  }
}
</script>
