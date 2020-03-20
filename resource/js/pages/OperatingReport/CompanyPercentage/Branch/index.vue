<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
						<div class="form-box">
							<date-range-picker :start.sync="search.start" :end.sync="search.end"></date-range-picker>
							<date-button :start.sync="search.start" :end.sync="search.end"></date-button>
							<div class="layui-inline multiple-box">
								<label class="layui-form-label">币值：</label>
								<div class="layui-input-inline">
									<j-select title="币值" :datas="options.currency" valueKey="id" displayKey="zh_name" v-model="search.currency_id" />
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
								<span class="btn-plus" @click="toggleAll"><i class="fa fa-plus"></i> {{ txt.switch }}</span>
								<!-- <span class="btn-minus"><i class="fa fa-minus"></i> 全部收合</span> -->
							</th>
							<th class="text-center" colspan="4" v-for="(company, index) in showCompany" :key="index">
								<router-link
									:to="{
										name: 'operating-report-branch-company-percentage-detail',
										query: {
											company_id: company.id,
											currency_id: search.currency_id,
											start: search.start,
											end: search.end,
										},
									}"
									>{{ findRegion(company.name).name }}<br />{{ company.name }}<br />{{ txt.currency }}
								</router-link>
							</th>
						</tr>
						<tr>
							<th></th>
							<template v-for="company in showCompany">
								<th>费用</th>
								<th>类型百分点</th>
								<th>公司总费用百分点</th>
								<th>总公司子类型百分点</th>
							</template>
						</tr>
					</thead>
					<!--number-->
					<tbody v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
						<tr class="tr-main" @click="collapse[baoxiaoName] = !collapse[baoxiaoName]">
							<td>{{ baoxiaoName }}</td>
							<template v-for="company in showCompany">
								<template v-for="totalFee in [getSumByListFilter(baoxiaoDatas, [company.id], 'company_id')]">
									<td class="text-right">
										<span :class="totalFee > 0 ? 'text-green' : ''">{{ totalFee | money }}</span>
									</td>
									<td class="text-right">{{ (totalFee / totalFee) | percent }}%</td>
									<td class="text-right">{{ (totalFee / getSumByListFilter(datas, [company.id], 'company_id')) | percent }}%</td>
									<td class="text-right">{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</td>
								</template>
							</template>
						</tr>
						<!-- collapse -->
						<tr class="tr-sub" v-show="collapse[baoxiaoName]" v-for="(feeDatas, feeName) in getGroupByFee(baoxiaoDatas)" :key="feeName">
							<td>- {{ feeName }}</td>
							<template v-for="company in showCompany">
								<template v-for="totalFee in [getSumByListFilter(feeDatas, [company.id], 'company_id')]">
									<td class="text-right">
										<span :class="totalFee > 0 ? 'text-green' : ''">{{ totalFee | money }}</span>
									</td>
									<td class="text-right">{{ (totalFee / _.jSumBy(baoxiaoDatas, 'total_amount')) | percent }}%</td>
									<td class="text-right">{{ (totalFee / getSumByListFilter(datas, [company.id], 'company_id')) | percent }}%</td>
									<td class="text-right">{{ (totalFee / _.jSumBy(feeDatas, 'total_amount')) | percent }}%</td>
								</template>
							</template>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td class="text-center">总计</td>
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
		api: 'operating_report.branch',
		methods: {
			async getOptions() {
				const res = await axios.all([this.$thisApi.getCompany(), this.$thisApi.getCurrency(), this.$thisApi.getHeadquartersPayout()])
				this.options.company = res[0].data
				this.options.currency = res[1].data
				this.options.payout = res[2].data
			},
			async getList() {
				const res = await this.$thisApi.getHeadquarters(this.reqBody)
				this.datas = res.data
			},
		},
		async mounted() {
			await this.getOptions()
			// const res = await this.$api.operating_report.branch.getCompany()
			this.options.company = [this.options.company] //[res.data]
			this.doSearch()
		},
	}
</script>
