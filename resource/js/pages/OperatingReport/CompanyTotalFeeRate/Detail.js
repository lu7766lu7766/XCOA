import ListMixins from '../List'

export default {
	mixins: [ListMixins],
	methods: {
		async getDetail() {
			let body = _.pickBy({ ...this.$route.query })
			if (this.$route.query.company_id) {
				body = Object.assign(body, { company_id: [this.$route.query.company_id] })
			}
			const res = await this.$thisApi.getDetail(body)
			this.datas = res.data
		},
		async getList() {
			const res = await this.$thisApi.getList({ ..._.pickBy({ ...this.$route.query }), company_id: [] })
			this.datas = res.data
		},
		getGroupByProcess() {
			return this.getGroupByNameDatas(this.datas, 'process_type', 'process_type')
		},
	},
	computed: {
		currentCompany() {
			return _.find(this.options.company, x => x.id === +this.$route.query.company_id) || { name: '总公司' }
		},
	},
}
