<template>
	<div class="layui-fluid">
		<div class="layui-card">
			<div class="layui-row layui-col-space10 layui-card-body">
				<div class="layui-form layuiadmin-card-header-auto">
					<div class="layui-form-item search-box">
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
					<div class="table-title">依照地区分析</div>
					<table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
						<thead>
							<tr>
								<th class=""></th>
								<th>总费用</th>
								<th v-for="(d, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
									<router-link
										:to="{
											name: 'operating-report-cross-company-detail',
											query: {
												baoxiaoName,
												type: 'region',
												start: search.start,
												end: search.end,
											},
										}"
										>{{ baoxiaoName }}</router-link
									>
								</th>
							</tr>
						</thead>
						<tbody role="tablist" aria-multiselectable="true">
							<tr class="tr-main" v-for="(regionDatas, regionName) in groupByRegionDatas" :key="regionName">
								<td>{{ regionName }}</td>
								<td class="text-right">
									<router-link
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: getUnionCompanyID(groupByRegionName[regionName]).join(','),
												end: search.end,
												start: search.start,
												level1: _.union(_.map(datas, 'process_type')).join(','),
												level2: _.union(_.map(datas, 'baoxiao_type')).join(','),
												level3: '',
											},
										}"
									>
										{{ _.jSumBy(regionDatas, 'total_amount') | money }}
									</router-link>
								</td>
								<td class="text-right" v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
									<template v-for="totalFee in [getSumByListFilter(regionDatas, getUnionBaoxiaoType(baoxiaoDatas), 'baoxiao_type')]">
										<router-link
											:to="{
												name: 'statistics-finance',
												query: {
													company_id: getUnionCompanyID(groupByRegionName[regionName]).join(','),
													currency_id: search.currency_id,
													end: search.end,
													start: search.start,
													level1: _.union(_.map(datas, 'process_type')).join(','),
													level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
													level3: '',
												},
											}"
										>
											{{ totalFee | money }}
										</router-link>
									</template>
								</td>
							</tr>
							<tr class="tr-main">
								<td>总公司</td>
								<td class="text-right">
									<router-link
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: _.union(_.map(datas, 'company_id')).join(','),
												end: search.end,
												start: search.start,
												level1: _.union(_.map(datas, 'process_type')).join(','),
												level2: _.union(_.map(datas, 'baoxiao_type')).join(','),
												level3: '',
											},
										}"
									>
										{{ allDatasTotalFee | money }}
									</router-link>
								</td>
								<td class="text-right" v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
									<router-link
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: _.union(_.map(datas, 'company_id')).join(','),
												currency_id: search.currency_id,
												end: search.end,
												start: search.start,
												level1: _.union(_.map(datas, 'process_type')).join(','),
												level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
												level3: '',
											},
										}"
									>
										{{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}
									</router-link>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<div class="rwd-table">
					<div class="table-title">依照各公司分析</div>
					<table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
						<thead>
							<tr>
								<th class=""></th>
								<th class="">总费用</th>
								<th v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
									<router-link
										:to="{
											name: 'operating-report-cross-company-detail',
											query: {
												baoxiaoName,
												type: 'company',
												start: search.start,
												end: search.end,
											},
										}"
										>{{ baoxiaoName }}</router-link
									>
								</th>
							</tr>
						</thead>
						<tbody role="tablist" aria-multiselectable="true">
							<tr class="tr-main" v-for="(companyDatas, companyName) in groupByCompanyDatas" :key="companyName">
								<td>{{ companyName }}</td>
								<td class="text-right">
									<router-link
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: _.union(_.map(companyDatas, 'company_id')).join(','),
												end: search.end,
												start: search.start,
												level1: _.union(_.map(datas, 'process_type')).join(','),
												level2: _.union(_.map(datas, 'baoxiao_type')).join(','),
												level3: '',
											},
										}"
									>
										{{ _.jSumBy(companyDatas, 'total_amount') | money }}
									</router-link>
								</td>
								<td class="text-right" v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
									<template v-for="totalFee in [getSumByListFilter(companyDatas, getUnionBaoxiaoType(baoxiaoDatas), 'baoxiao_type')]">
										<router-link
											:to="{
												name: 'statistics-finance',
												query: {
													company_id: _.union(_.map(companyDatas, 'company_id')).join(','),
													currency_id: search.currency_id,
													end: search.end,
													start: search.start,
													level1: _.union(_.map(datas, 'process_type')).join(','),
													level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
													level3: '',
												},
											}"
										>
											{{ totalFee | money }}
										</router-link>
									</template>
								</td>
							</tr>
							<tr class="tr-main">
								<td>总公司</td>
								<td class="text-right">
									<router-link
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: _.union(_.map(datas, 'company_id')).join(','),
												end: search.end,
												start: search.start,
												level1: _.union(_.map(datas, 'process_type')).join(','),
												level2: _.union(_.map(datas, 'baoxiao_type')).join(','),
												level3: '',
											},
										}"
									>
										{{ allDatasTotalFee | money }}
									</router-link>
								</td>
								<td class="text-right" v-for="(baoxiaoDatas, baoxiaoName) in groupByBaoxiao" :key="baoxiaoName">
									<router-link
										:to="{
											name: 'statistics-finance',
											query: {
												company_id: _.union(_.map(datas, 'company_id')).join(','),
												currency_id: search.currency_id,
												end: search.end,
												start: search.start,
												level1: _.union(_.map(datas, 'process_type')).join(','),
												level2: _.map(groupByNamePayout[baoxiaoName], 'id').join(','),
												level3: '',
											},
										}"
									>
										{{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}
									</router-link>
								</td>
							</tr>
						</tbody>
					</table>
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
			this.doSearch()
		},
	}
</script>
