export default {
  components: {
    Paginate: require('@/Paginate').default,
  },
  data: () => ({
    paginate: {
      perpage: 10,
      page: 1,
      total: 0,
    },
  }),
  computed: {
    lastPage()
    {
      return Math.ceil(this.paginate.total / this.paginate.perpage)
    },
  },
}