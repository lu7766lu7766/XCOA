<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
						<div class="layui-inline">
							<a id="addSurvey" class="layui-btn btn-change" @click="switchType">{{ txt.typeRegion }}</a>
						</div>
						<div class="form-box">
							<date-range-picker :start.sync="search.start" :end.sync="search.end"></date-range-picker>
							<date-button :start.sync="search.start" :end.sync="search.end"></date-button>
							<div class="layui-inline">
								<button id="InquireSur" class="layui-btn" title="查询" @click="doSearch">
									<i class="iconfont icon-sousuo"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
				<div class="rwd-table">
					<table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
						<thead>
							<tr>
								<th class="toggle-btn">
									<span class="btn-plus" @click="toggleAll"> <i class="fa fa-plus"></i> {{ txt.switch }} </span>
									<!-- <span class="btn-minus"><i class="fa fa-minus"></i> 全部收合</span> -->
								</th>
								<th class="text-center">
									<router-link
										:to="{
											name: 'operating-report-region-fee-detail',
											query: {
												currency_id: search.currency_id,
												start: search.start,
												end: search.end,
											},
										}"
										>总公司
									</router-link>
									<br />{{ txt.currency }}
								</th>
								<th class="text-center" v-for="region in options.region" :key="region.id">
									<router-link
										:to="{
											name: 'operating-report-region-fee-detail',
											query: {
												company_id: getUnionCompanyID(groupByRegionID[region.id]).join(','),
												currency_id: search.currency_id,
												region_type: region.id,
												start: search.start,
												end: search.end,
											},
										}"
										>{{ indexByRegionID[region.id].name }}<br />{{ txt.currency }}
									</router-link>
								</th>
							</tr>
						</thead>
						<template v-if="showNumber">
							<tbody v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
								<tr class="tr-main" @click="collapse[baoxiaoName] = !collapse[baoxiaoName]">
									<td>{{ baoxiaoName }}</td>
									<td class="text-right">
										{{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}
									</td>
									<template v-for="region in options.region">
										<template v-for="totalFee in [getSumByListFilter(baoxiaoDatas, getUnionCompanyID(groupByRegionID[region.id]), 'company_id')]">
											<td class="text-right">
												<router-link
													class="text-green"
													v-if="totalFee > 0"
													:to="{
														name: 'statistics-finance',
														query: {
															company_id: getUnionCompanyID(groupByRegionID[region.id]).join(','),
															currency_id: search.currency_id,
															end: search.end,
															start: search.start,
															level1: getUnionProcessByFilterCompanyID(baoxiaoDatas, getUnionCompanyID(groupByRegionID[region.id])).join(','),
															level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
															level3: '',
														},
													}"
												>
													{{ totalFee | money }}
												</router-link>
												<span v-else>{{ totalFee | money }}</span>
											</td>
										</template>
									</template>
								</tr>
								<!-- collapse -->
								<tr class="tr-sub" v-show="collapse[baoxiaoName]" v-for="(feeDatas, feeName) in getGroupByFee(baoxiaoDatas)" :key="feeName">
									<td>- {{ feeName }}</td>
									<td class="text-right">
										{{ _.jSumBy(feeDatas, 'total_amount') | money }}
									</td>
									<template v-for="region in options.region">
										<template v-for="totalFee in [getSumByListFilter(feeDatas, getUnionCompanyID(groupByRegionID[region.id]), 'company_id')]">
											<td class="text-right">
												<router-link
													class="text-green"
													v-if="totalFee > 0"
													:to="{
														name: 'statistics-finance',
														query: {
															company_id: getUnionCompanyID(groupByRegionID[region.id]).join(','),
															currency_id: search.currency_id,
															end: search.end,
															start: search.start,
															level1: getUnionProcessByFilterCompanyID(feeDatas, getUnionCompanyID(groupByRegionID[region.id])).join(','),
															level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
															level3: _.map(groupByNamePayout[feeName], 'id').join(','),
														},
													}"
												>
													{{ totalFee | money }}
												</router-link>
												<span v-else>{{ totalFee | money }}</span>
											</td>
										</template>
									</template>
								</tr>
							</tbody>
						</template>
						<template v-else>
							<tbody v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
								<tr class="tr-main" @click="collapse[baoxiaoName] = !collapse[baoxiaoName]">
									<td>{{ baoxiaoName }}</td>
									<td class="text-right">
										100.00%
									</td>
									<template v-for="region in options.region">
										<template v-for="totalFee in [getSumByListFilter(baoxiaoDatas, getUnionCompanyID(groupByRegionID[region.id]), 'company_id')]">
											<td class="text-right">
												<router-link
													class="text-green"
													v-if="totalFee > 0"
													:to="{
														name: 'statistics-finance',
														query: {
															company_id: getUnionCompanyID(groupByRegionID[region.id]).join(','),
															currency_id: search.currency_id,
															end: search.end,
															start: search.start,
															level1: getUnionProcessByFilterCompanyID(feeDatas, getUnionCompanyID(groupByRegionID[region.id])).join(','),
															level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
															level3: '',
														},
													}"
												>
													{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%
												</router-link>
												<span v-else>{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</span>
											</td>
										</template>
									</template>
								</tr>
								<!-- collapse -->
								<tr class="tr-sub" v-show="collapse[baoxiaoName]" v-for="(feeDatas, feeName) in getGroupByFee(baoxiaoDatas)" :key="feeName">
									<td>- {{ feeName }}</td>
									<td class="text-right">
										100.00%
									</td>
									<template v-for="region in options.region">
										<template v-for="totalFee in [getSumByListFilter(feeDatas, getUnionCompanyID(groupByRegionID[region.id]), 'company_id')]">
											<td class="text-right">
												<router-link
													class="text-green"
													v-if="totalFee > 0"
													:to="{
														name: 'statistics-finance',
														query: {
															company_id: getUnionCompanyID(groupByRegionID[region.id]).join(','),
															currency_id: search.currency_id,
															end: search.end,
															start: search.start,
															level1: getUnionProcessByFilterCompanyID(feeDatas, getUnionCompanyID(groupByRegionID[region.id])).join(','),
															level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
															level3: _.map(groupByNamePayout[feeName], 'id').join(','),
														},
													}"
												>
													{{ (totalFee / _.jSumBy(feeDatas, 'total_amount')) | percent }}%
												</router-link>
												<span v-else>{{ (totalFee / _.jSumBy(feeDatas, 'total_amount')) | percent }}%</span>
											</td>
										</template>
									</template>
								</tr>
							</tbody>
						</template>

						<tfoot>
							<tr v-if="showNumber">
								<td class="text-center">总计</td>
								<td class="text-right">
									{{ allDatasTotalFee | money }}
								</td>
								<template v-for="region in options.region">
									<td class="text-right">
										{{ getSumByListFilter(datas, getUnionCompanyID(groupByRegionID[region.id]), 'company_id') | money }}
									</td>
								</template>
							</tr>
							<tr v-else>
								<td class="text-center">总计</td>
								<td class="text-right">
									100.00%
								</td>
								<template v-for="region in options.region">
									<td class="text-right">
										{{ (getSumByListFilter(datas, getUnionCompanyID(groupByRegionID[region.id]), 'company_id') / allDatasTotalFee) | percent }}%
									</td>
								</template>
							</tr>
						</tfoot>
					</table>
				</div>

				<!-- <div id="SurveyLietPage"></div> -->
			</div>
		</div>
	</div>
</template>

<script>
	import RegionMixins from '../Region'

	export default {
		mixins: [RegionMixins],
		api: 'operating_report.headquarters',
		async mounted() {
			await this.getOptions()
			this.doSearch()
		},
	}
</script>
