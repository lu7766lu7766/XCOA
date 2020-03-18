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
					<j-pie
						height="800"
						:title="detailTxt.pie"
						:datas="
							isRegion
								? _.mapKeys(_.groupBy(groupByBaoxiao[baoxiaoName], 'region_type'), (x, id) => indexByRegionID[id].name)
								: _.mapKeys(_.groupBy(groupByBaoxiao[baoxiaoName], 'company_id'), (x, id) => indexByCompanyID[id].name)
						"
					></j-pie>
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
				return this.$route.query.baoxiaoName
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
		},
		async mounted() {
			await this.getOptions()
			this.getList()
		},
	}
</script>
