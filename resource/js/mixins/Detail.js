export default {
  components: {
    Detail: require('@/Container/Detail').default,
  },
  data: () => ({
    data: {},
  }),
  methods: {
    show()
    {
      console.log(this.$children[0])
      this.$modal.show()
      // this.$refs.modal.show()
    },
    hide()
    {
      this.$modal.hide()
    },
    createSuccess()
    {
      this.doSuccess('新增')
    },
    updateSuccess()
    {
      this.doSuccess('编辑')
    },
    doSuccess(msg)
    {
      this.$alert.success(`${msg}成功`)
      this.$modal.hide()
      this.$parent.doRefresh()
    },
  },
  computed: {
    $modal()
    {
      return this.$children[0]
    },
    options()
    {
      return this.$parent.options
    },
    translate()
    {
      return this.$parent.translate
    },
    $thisApi()
    {
      return this.$parent.$thisApi
    },
  },
}
