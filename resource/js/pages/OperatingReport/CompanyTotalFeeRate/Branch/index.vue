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
								<span class="btn-plus" @click="toggleAll"><i class="fa fa-plus"></i> 全部展开</span>
								<!-- <span class="btn-minus"><i class="fa fa-minus"></i> 全部收合</span> -->
							</th>
							<th class="text-center" v-for="(company, index) in showCompany" :key="index">
								<router-link
									:to="{
										name: 'operating-report-branch-detail',
										query: {
											company_id: company.id,
											currency_id: search.currency_id,
											start: search.start,
											end: search.end,
										},
									}"
									>{{ company.name }}<br />{{ currencyTxt }}
								</router-link>
							</th>
						</tr>
					</thead>
					<!--number-->

					<tbody v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
						<tr class="tr-main" @click="collapse[baoxiaoName] = !collapse[baoxiaoName]">
							<td>{{ baoxiaoName }}</td>
							<td class="text-right" v-for="(company, index) in showCompany" :key="index">
								{{ getSumByListFilter(baoxiaoDatas, [company.id], 'company_id') | money }}
							</td>
						</tr>
						<!-- collapse -->
						<tr class="tr-sub" v-show="collapse[baoxiaoName]" v-for="(feeDatas, feeName) in getGroupByFee(baoxiaoDatas)" :key="feeName">
							<td>- {{ feeName }}</td>
							<td class="text-right" v-for="(company, index) in showCompany" :key="index">
								{{ getSumByListFilter(feeDatas, [company.id], 'company_id') | money }}
							</td>
						</tr>
					</tbody>
					<tfoot>
						<tr>
							<td class="text-center">总计</td>
							<td class="text-right" v-for="(company, index) in showCompany" :key="index">
								{{ getSumByListFilter(datas, [company.id], 'company_id') | money }}
							</td>
						</tr>
					</tfoot>
					<!--percent-->
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
		async mounted() {
			await this.getOptions()
			this.options.company = [this.options.company]
			this.doSearch()
		},
	}
</script>
