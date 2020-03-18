<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
						<div class="layui-inline">詳細數據({{ currentRegion.name }})</div>
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
					<tbody v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
						<tr class="tr-main" v-if="!$route.query.company_id">
							<td>{{ baoxiaoName }}</td>
							<td class="text-right" :class="_.jSumBy(baoxiaoDatas, 'total_amount') > 0 ? 'text-green' : ''">
								{{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}
							</td>
						</tr>
						<tr class="tr-main" v-else>
							<td>{{ baoxiaoName }}</td>
							<template v-for="totalFee in [getSumByListFilter(baoxiaoDatas, companyIDs, 'company_id')]">
								<td class="text-right">
									<router-link
										class="text-green"
										v-if="totalFee > 0 && $route.query.region_type"
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: companyIDs.join(','),
												currency_id: search.currency_id,
												end: search.end,
												start: search.start,
												level1: getUnionProcessByFilterCompanyID(baoxiaoDatas, companyIDs).join(','),
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
							</template>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td class="text-center">总计</td>
							<td class="text-right">
								<span v-if="!$route.query.region_type">{{ allDatasTotalFee | money }}</span>
								<span v-else>{{ getSumByListFilter(datas, this.companyIDs, 'company_id') | money }}</span>
							</td>
						</tr>
					</tfoot>
				</table>
				<!-- <div id="SurveyLietPage"></div> -->
			</div>
			<div class="chart-box">
				<div class="chart-box">
					<j-pie
						:datas="_.mapValues(groupByBaoxiao, datas => datas.filter(x => currentRegion.id === 0 || currentRegion.id === x.region_type))"
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
		async mounted() {
			await this.getOptions()
			this.getList()
		},
	}
</script>
