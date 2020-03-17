import ListMixins from 'mixins/List'

export default {
	mixins: [ListMixins],
	components: {
		MultiSelect: require('@/Form/MultiSelect').default,
		DateRangePicker: require('@/DateRangePicker').default,
		DateButton: require('@/DateButton').default,
	},
	data() {
		return {
			search: {
				start:
					this.$route.query.start ||
					moment()
						.startOf('month')
						.getDate(), //moment().subtract(365, 'days').startOf('month').getDate(),//moment().startOf('month').getDate(), //
				end:
					this.$route.query.end ||
					moment()
						.endOf('day')
						.getDate(),
				company_id: this.$route.query.company_id ? this.$route.query.company_id.split(',') : [],
				currency_id: this.$route.query.currency_id || '',
			},
			switch: {
				type: 'number',
				collapse: false,
			},
			collapse: {},
			options: {
				company: [],
				currency: [],
				payout: [],
			},
			showCompany: [],
			txt: {
				switch: '全部展开',
				currency: '',
				type: '总公司比例',
			},
		}
	},
	methods: {
		async getOptions() {
			const res = await axios.all([this.$thisApi.getCompany(), this.$thisApi.getCurrency(), this.$thisApi.getPayout()])
			this.options.company = res[0].data
			this.options.currency = res[1].data
			this.options.payout = res[2].data
		},
		switchType() {
			this.switch.type = this.showNumber ? 'percent' : 'number'
			this.txt.type = this.showNumber ? '总公司比例' : '总公司数值'
		},
		toggleAll() {
			this.switch.collapse = !this.switch.collapse
			_.forEach(this.collapse, (res, baoxiaoName) => {
				this.collapse[baoxiaoName] = this.switch.collapse
			})
			this.txt.switch = this.switch.collapse ? '全部收合' : '全部展开'
		},
		setCollapse() {
			this.collapse = _.reduce(
				this.groupByBaoxiao,
				(result, d, baoxiaoName) => {
					result[baoxiaoName] = false
					return result
				},
				{}
			)
		},
		setShowCompany() {
			this.showCompany = _.chain(this.options.company)
				.filter(x => !this.search.company_id.length || this.search.company_id.indexOf('' + x.id) > -1)
				.value()
		},
		setCurrency() {
			this.txt.currency = this.search.currency_id
				? '(' + _.find(this.options.currency, x => '' + x.id === this.search.currency_id)['zh_name'] + ')'
				: ''
		},
		async doSearch() {
			await this.getList()
			this.setCollapse()
			this.setShowCompany()
			this.setCurrency()
			this.onQueryChange({
				...this.search,
				company_id: this.search.company_id.join(','),
			})
		},
		getGroupByBaoxiao() {
			return this.getGroupByNameDatas(this.datas, 'baoxiao_type')
		},
		getGroupByFee(datas) {
			return this.getGroupByNameDatas(datas, 'fee_type')
		},
		getGroupByNameDatas(datas, prop, unionProp) {
			return _.pickBy(
				_.mapValues(this.groupByNamePayout, payouts => {
					const ids = _.map(payouts, 'id')
					return !unionProp
						? _.filter(datas, x => ids.indexOf(x[prop]) > -1)
						: _.chain(this.datas)
								.filter(x => ids.indexOf(x[prop]) > -1)
								.map(unionProp)
								.union()
								.value()
				}),
				x => x.length > 0
			)
		},
		getSumByListFilter(datas, list, prop, amountProp = 'total_amount') {
			return _.chain(datas)
				.filter(x => list.indexOf(x[prop]) > -1)
				.jSumBy(amountProp)
				.value()
		},
		getUnionProcessByFilterCompanyID(datas, companyID) {
			return _.chain(datas)
				.filter(x => (_.isArray(companyID) ? companyID.indexOf(x.company_id) > -1 : x.company_id === companyID))
				.map('process_type')
				.union()
				.value()
		},
	},
	computed: {
		groupByNamePayout() {
			return _.groupBy(this.options.payout, 'name')
		},
		showNumber() {
			return this.switch.type === 'number'
		},
		allDatasTotalFee() {
			return _.jSumBy(this.datas, 'total_amount')
		},
		groupByBaoxiao() {
			return this.getGroupByBaoxiao()
		},
	},
}
