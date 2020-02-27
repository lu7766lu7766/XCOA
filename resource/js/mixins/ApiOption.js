export default {
  computed: {
    $thisApi()
    {
      return this.$options.api
        ? _.getVal(this.$api, this.$options.api)
        : {}
    },
  },
}