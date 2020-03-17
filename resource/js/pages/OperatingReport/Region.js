import ListMixins from './List'

export default {
	mixins: [ListMixins],
	components: { JPie: require('@/Chart/Pie').default },
	methods: {
		async getList() {
			const res = await this.$thisApi.getList(this.reqBody)
			_.forEach(res.data, data => {
				const company = _.find(this.options.company, x => x.id === +data.company_id)
				const region = _.find(RegionConstant, x => x.list.indexOf(company.name) > -1) || { id: 1, name: '其他' }
				data.region_type = region.id
			})
			this.datas = res.data
		},
		getUnionCompanyID(datas) {
			return _.union(_.map(datas, 'company_id'))
		},
	},
	computed: {
		showCompanyID() {
			return _.map(this.showCompany, 'id')
		},
		filterCompany() {
			return _.filter(this.datas, x => this.showCompanyID.indexOf(x.company_id) > -1)
		},
		groupByRegion() {
			return _.groupBy(this.filterCompany, 'region_type')
		},
		indexByRegionID() {
			return _.keyBy(this.options.region, 'id')
		},
		currentCompanies() {
			return this.$route.query.region_type ? this.options.company : this.options.company.filter(x => this.companyIDs.indexOf(x.company_id) > -1)
		},
		currentRegion() {
			return this.$route.query.region_type ? _.find(this.options.region, x => x.id === +this.$route.query.region_type) : { id: 0, name: '总公司' }
		},
	},
}
