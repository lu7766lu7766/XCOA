<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
						<div class="layui-card-header">
							{{ detailTxt.title }}
						</div>
						<div class="form-box">
							<div class="layui-inline">
								<button id="toCompanyList" class="layui-btn fr" @click="$router.back()">
									返回
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="layui-card-body">
				<div class="chart-box">
					<j-pie height="800" :title="detailTxt.pie" :datas="pieDatas"></j-pie>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import RegionMixins from '../../Region'

	export default {
		mixins: [RegionMixins],
		api: 'operating_report.headquarters',
		computed: {
			type() {
				return this.$route.query.type
			},
			baoxiaoName() {
				return this.$route.query.baoxiaoName || '总费用'
			},
			isRegion() {
				return this.type === 'region'
			},
			isCompany() {
				return this.type === 'company'
			},
			detailTxt() {
				return {
					title: this.isRegion ? `依照地区分析(${this.baoxiaoName})` : `依照各公司分析(${this.baoxiaoName})`,
					pie: this.isRegion ? `各地区总费用百分比` : `总公司${this.baoxiaoName}分析`,
				}
			},
			pieDatas() {
				const datas = !this.$route.query.baoxiaoName ? this.datas : this.groupByBaoxiao[this.baoxiaoName]
				return this.isRegion
					? _.mapKeys(_.groupBy(datas, 'region_type'), (x, id) => this.indexByRegionID[id].name)
					: _.mapKeys(_.groupBy(datas, 'company_id'), (x, id) => this.indexByCompanyID[id].name)
			},
		},
		async mounted() {
			await this.getOptions()
			this.getList()
		},
	}
</script>
