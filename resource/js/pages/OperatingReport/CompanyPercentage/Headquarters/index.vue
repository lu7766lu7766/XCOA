<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
						<div class="layui-inline">
							<a id="addSurvey" class="layui-btn btn-change" @click="switchType">{{ txt.type }}</a>
						</div>
						<div class="form-box">
							<date-range-picker :start.sync="search.start" :end.sync="search.end"></date-range-picker>
							<date-button :start.sync="search.start" :end.sync="search.end"></date-button>
							<div class="layui-inline multiple-box">
								<label class="layui-form-label">币值：</label>
								<div class="layui-input-inline">
									<j-select title="币值" :datas="options.currency" valueKey="id" displayKey="zh_name" v-model="search.currency_id" />
								</div>
							</div>
							<div class="layui-inline multiple-box">
								<label class="layui-form-label">公司：</label>
								<div class="layui-input-inline">
									<multi-select :datas="options.company" valueKey="id" v-model="search.company_id"></multi-select>
								</div>
							</div>
							<div class="layui-inline">
								<button id="InquireSur" class="layui-btn" title="查询" @click="doSearch">
									<i class="iconfont icon-sousuo"></i>
								</button>
							</div>
						</div>
					</div>
				</div>
				<table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
					<thead>
						<tr>
							<th class="toggle-btn">
								<span class="btn-plus" @click="toggleAll"> <i class="fa fa-plus"></i> {{ txt.switch }} </span>
								<!-- <span class="btn-minus"><i class="fa fa-minus"></i> 全部收合</span> -->
							</th>
							<th class="text-center" colspan="3">
								<router-link
									:to="{
										name: 'operating-report-company-percentage-detail',
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
							<th class="text-center" colspan="4" v-for="(company, index) in showCompany" :key="index">
								<router-link
									:to="{
										name: 'operating-report-company-percentage-detail',
										query: {
											company_id: company.id,
											currency_id: search.currency_id,
											start: search.start,
											end: search.end,
										},
									}"
									>{{ company.name }}<br />{{ txt.currency }}
								</router-link>
							</th>
						</tr>
						<tr>
							<th></th>
							<th>费用</th>
							<th>类型百分点</th>
							<th>公司总费用百分点</th>
							<template v-for="company in showCompany">
								<th>费用</th>
								<th>类型百分点</th>
								<th>公司总费用百分点</th>
								<th>总公司类型百分点</th>
							</template>
						</tr>
					</thead>

					<tbody v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
						<tr class="tr-main" @click="collapse[baoxiaoName] = !collapse[baoxiaoName]">
							<td>{{ baoxiaoName }}</td>
							<td class="text-right">
								{{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}
							</td>
							<td class="text-right">100.00%</td>
							<td class="text-right">{{ (_.jSumBy(baoxiaoDatas, 'total_amount') / allDatasTotalFee) | percent }}%</td>
							<template v-for="company in showCompany">
								<template v-for="totalFee in [getSumByListFilter(baoxiaoDatas, [company.id], 'company_id')]">
									<td class="text-right">
										<router-link
											:to="{
												name: 'statistics-finance',
												query: {
													company_id: company.id,
													currency_id: search.currency_id,
													end: search.end,
													start: search.start,
													level1: getUnionProcessByFilterCompanyID(baoxiaoDatas, company.id).join(','),
													level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
													level3: '',
												},
											}"
										>
											{{ totalFee | money }}
										</router-link>
									</td>
									<td class="text-right">100.00%</td>
									<td class="text-right">{{ (totalFee / allDatasTotalFee) | percent }}%</td>
									<td class="text-right">{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</td>
								</template>
							</template>
						</tr>
						<!-- collapse -->
						<tr class="tr-sub" v-show="collapse[baoxiaoName]" v-for="(feeDatas, feeName) in getGroupByFee(baoxiaoDatas)" :key="feeName">
							<td>- {{ feeName }}</td>
							<td class="text-right">
								{{ _.jSumBy(feeDatas, 'total_amount') | money }}
							</td>
							<td class="text-right">{{ (_.jSumBy(feeDatas, 'total_amount') / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</td>
							<td class="text-right">{{ (_.jSumBy(feeDatas, 'total_amount') / allDatasTotalFee) | percent }}%</td>
							<template v-for="company in showCompany">
								<template v-for="totalFee in [getSumByListFilter(feeDatas, [company.id], 'company_id')]">
									<td class="text-right">
										<router-link
											:to="{
												name: 'statistics-finance',
												query: {
													company_id: company.id,
													currency_id: search.currency_id,
													end: search.end,
													start: search.start,
													level1: getUnionProcessByFilterCompanyID(feeDatas, company.id).join(','),
													level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
													level3: _.map(groupByNamePayout[feeName], 'id').join(','),
												},
											}"
										>
											{{ totalFee | money }}
										</router-link>
									</td>
									<td class="text-right">{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</td>
									<td class="text-right">{{ (totalFee / allDatasTotalFee) | percent }}%</td>
									<td class="text-right">{{ (totalFee / _.jSumBy(feeDatas, 'total_amount')) | percent }}%</td>
								</template>
							</template>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td class="text-center">总计</td>
							<td class="text-right">
								{{ allDatasTotalFee | money }}
							</td>
							<td></td>
							<td></td>
							<template v-for="company in showCompany">
								<td class="text-right">
									{{ getSumByListFilter(datas, [company.id], 'company_id') | money }}
								</td>
								<td></td>
								<td></td>
								<td></td>
							</template>
						</tr>
					</tfoot>
				</table>
				<!-- <div id="SurveyLietPage"></div> -->
			</div>
		</div>
	</div>
</template>

<script>
	import ListMixins from '../../List'

	export default {
		mixins: [ListMixins],
		api: 'operating_report.headquarters',
		async mounted() {
			await this.getOptions()
			this.doSearch()
		},
	}
</script>
