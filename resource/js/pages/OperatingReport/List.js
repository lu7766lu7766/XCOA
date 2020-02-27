import ListMixins from 'mixins/List'

export default {
  mixins: [ListMixins],
  components: {
    MultiSelect: require('@/Form/MultiSelect').default,
    DateRangePicker: require('@/DateRangePicker').default,
    DateButton: require('@/DateButton').default,
  },
  data: () => ({
    search: {
      start: moment().startOf('month').getDate(), // moment().subtract(365, 'days').startOf('month').getDate(),//
      end: moment().endOf('day').getDate(),
      company_id: [],
      currency_id: '',
    },
    switch: {
      type: 'number',
    },
    collapse: {},
    options: {
      company: [],
      currency: [],
      payout: [],
    },
    showCompany: [],
    currencyTxt: '',
  }),
  methods: {
    async getOptions()
    {
      const res = await axios.all([
        this.$thisApi.getCompany(),
        this.$thisApi.getCurrency(),
        this.$thisApi.getPayout(),
      ])
      this.options.company = res[0].data
      this.options.currency = res[1].data
      this.options.payout = res[2].data
    },
    doSwitch()
    {
      this.switch.type = this.showNumber
        ? 'percent'
        : 'number'
    },
    showAll()
    {
      _.forEach(this.collapse, (res, id) =>
      {
        this.collapse[id] = true
      })
    },
    setCollapse()
    {
      this.collapse = _.reduce(this.list, (result, d, baoxiao_type) =>
      {
        result[baoxiao_type] = false
        return result
      }, {})
    },
    setShowCompany()
    {
      this.showCompany = _.chain(this.options.company)
        .filter(x => !this.search.company_id.length || this.search.company_id.indexOf('' + x.id) > -1)
        .value()
    },
    setCurrency()
    {
      this.currencyTxt = this.search.currency_id
        ? ('(' + _.find(this.options.currency, {id: this.search.currency_id}).zh_name + ')')
        : ''
    },
    async doSearch()
    {
      await this.getList()
      this.setCollapse()
      this.setShowCompany()
      this.setCurrency()
    },
  },
  computed: {
    idPayout()
    {
      return _.keyBy(this.options.payout, 'id')
    },
    list()
    {
      return _.chain(this.datas)
        .orderBy('baoxiao_type')
        .groupBy('baoxiao_type')
        .value()
    },
    showNumber()
    {
      return this.switch.type === 'number'
    },
    switchTxt()
    {
      return this.showNumber
        ? '总公司比例'
        : '总公司数值'
    },
  },
}