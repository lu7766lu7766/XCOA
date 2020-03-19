<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
						<div class="layui-inline">
							詳細數據(
							{{ $route.query.company_id ? findRegion(currentCompany.name).name : currentCompany.name }}- {{ currentCompany.name }}
							)
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
				<table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
					<thead>
						<tr>
							<th></th>
							<th>费用</th>
							<th>类型百分点</th>
							<th>公司总费用百分点</th>
							<th v-if="$route.query.company_id">总公司子类型百分点</th>
						</tr>
					</thead>
					<tbody v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
						<tr class="tr-main" v-if="!$route.query.company_id">
							<td>{{ baoxiaoName }}</td>
							<td class="text-right">
								<span :class="_.jSumBy(baoxiaoDatas, 'total_amount') > 0 ? 'text-green' : ''">
									{{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}
								</span>
							</td>
							<td class="text-right">100.00%</td>
							<td class="text-right">{{ (_.jSumBy(baoxiaoDatas, 'total_amount') / allDatasTotalFee) | percent }}%</td>
						</tr>
						<tr class="tr-main" v-else>
							<td>{{ baoxiaoName }}</td>
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
								<td class="text-right">{{ (totalFee / totalFee) | percent }}%</td>
								<td class="text-right">{{ (totalFee / allDatasTotalFee) | percent }}%</td>
								<td class="text-right">{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</td>
							</template>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td class="text-center">总计</td>
							<td class="text-right">
								<span v-if="!$route.query.company_id">{{ allDatasTotalFee | money }}</span>
								<span v-else>{{ getSumByListFilter(datas, this.companyIDs, 'company_id') | money }}</span>
							</td>
							<td class="text-right"></td>
							<td class="text-right"></td>
							<td class="text-right" v-if="$route.query.company_id"></td>
						</tr>
					</tfoot>
				</table>
				<!-- <div id="SurveyLietPage"></div> -->
			</div>
			<div class="chart-box">
				<div class="chart-box">
					<!-- <div ref="chart-container" style="min-height:350px;height: 100%"></div> -->
					<j-pie
						:datas="_.mapValues(groupByBaoxiao, datas => datas.filter(x => !$route.query.company_id || x.company_id === +$route.query.company_id))"
					></j-pie>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import DetailMixins from '../../Detail'

	export default {
		mixins: [DetailMixins],
		api: 'operating_report.headquarters',
		async mounted() {
			await this.getOptions()
			this.getList()
		},
	}
</script>
