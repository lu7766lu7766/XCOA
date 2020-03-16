<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
						<div class="layui-inline">詳細數據({{ currentCompany.name }})</div>
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
				<table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
					<thead>
						<tr>
							<th></th>
							<th>费用</th>
							<th>类型百分点</th>
							<th>公司总费用百分点</th>
							<th>总公司类型百分点</th>
						</tr>
					</thead>
					<tbody v-for="(baoxiaoDatas, baoxiaoName) in getGroupByBaoxiao()" :key="baoxiaoName">
						<tr class="tr-main" v-if="!$route.query.company_id">
							<td class="text-right">{{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}</td>
							<td class="text-right">100.00%</td>
							<td class="text-right">{{ (_.jSumBy(baoxiaoDatas, 'total_amount') / allDatasTotalFee) | percent }}%</td>
							<td>100.00%</td>
						</tr>
						<tr class="tr-main" v-else>
							<td>
								{{ baoxiaoName }}
							</td>
							<template v-for="totalFee in [getSumByListFilter(baoxiaoDatas, [+$route.query.company_id], 'company_id')]">
								<td class="text-right">
									<router-link
										class="text-green"
										v-if="totalFee > 0 && $route.query.company_id"
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: $route.query.company_id,
												currency_id: search.currency_id,
												end: search.end,
												start: search.start,
												level1: getUnionProcessByFilterCompanyID(baoxiaoDatas, $route.query.company_id).join(','),
												level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
												level3: '',
											},
										}"
									>
										{{ totalFee | money }}
									</router-link>
									<span v-else :class="totalFee > 0 ? 'text-green' : ''">
										{{ totalFee | money }}
									</span>
								</td>
								<td class="text-right">100.00%</td>
								<td class="text-right">{{ (totalFee / allDatasTotalFee) | percent }}%</td>
								<td class="text-right">{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</td>
							</template>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td class="text-center">总计</td>
							<td class="text-right">
								{{ allDatasTotalFee | money }}
							</td>
							<td class="text-right"></td>
							<td class="text-right"></td>
							<td class="text-right"></td>
						</tr>
					</tfoot>
				</table>
				<!-- <div id="SurveyLietPage"></div> -->
			</div>
			<div class="chart-box">
				<div class="chart-box">
					<div ref="chart-container" style="min-height:350px;height: 100%"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import ListMixins from '../../List'

	export default {
		mixins: [ListMixins],
		api: 'operating_report.headquarters',
		methods: {
			draw() {
				const groupByBaxiao = this.getGroupByBaoxiao()
				var dom = this.$refs['chart-container'] //document.getElementById('chart-container')
				var myChart = echarts.init(dom)
				var option = null
				option = {
					title: {
						text: '',
						left: 'center',
					},
					tooltip: {
						trigger: 'item',
						formatter: '{b}: {c} ({d}%)',
					},
					legend: {
						orient: 'vertical',
						left: 10,
						data: Object.keys(groupByBaxiao), //['费用', '类型百分点', '公司总费用百分点', '总公司类型百分点'],
					},
					series: [
						{
							name: '访问来源',
							type: 'pie',
							selectedMode: 'single',
							radius: [0, '30%'],

							label: {
								position: 'inner',
							},
							labelLine: {
								show: false,
							},
						},
						{
							name: '访问来源',
							type: 'pie',
							type: 'pie',
							radius: '65%',
							center: ['50%', '50%'],
							label: {
								formatter: '{hr|}\n  {b|{b}：}{c}  {per|{d}%} ',
								backgroundColor: '#eee',
								borderColor: '#aaa',
								borderWidth: 1,
								borderRadius: 4,
								rich: {
									a: {
										color: '#999',
										lineHeight: 22,
										align: 'center',
									},
									hr: {
										borderColor: '#aaa',
										width: '100%',
										borderWidth: 0.5,
										height: 0,
									},
									b: {
										fontSize: 16,
										lineHeight: 33,
									},
									per: {
										color: '#eee',
										backgroundColor: '#334455',
										padding: [2, 4],
										borderRadius: 2,
									},
								},
							},
							data: _.reduce(
								groupByBaxiao,
								(result, datas, name) => {
									result.push({
										value: _.jSumBy(datas, 'total_amount'),
										name,
									})
									return result
								},
								[]
							),
						},
					],
				}
				if (option && typeof option === 'object') {
					myChart.setOption(option, true)
				}
			},
		},
		computed: {
			currentCompany() {
				return _.find(this.options.company, x => x.id === +this.$route.query.company_id) || { name: '总公司' }
			},
		},
		async mounted() {
			await this.getOptions()
			await axios.all([this.getList(), this.$getScript('/js/echarts/dist/echarts.min.js')])
			this.draw()
		},
	}
</script>
