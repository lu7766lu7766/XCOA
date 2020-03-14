<template>
  <div class="layui-fluid">
    <div class="layui-card">
      <div class="layui-row layui-col-space10 layui-card-body">
        <div class="layui-form layuiadmin-card-header-auto">
          <div class="layui-form-item search-box">
            <div class="layui-inline">詳細數據({{ currentCompany.name }})</div>
            <div class="form-box">
              <div class="layui-inline">
                <button
                  id="toCompanyList"
                  class="layui-btn fr"
                  @click="$router.back()"
                >
                  返回
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="layui-card-body">
        <table
          class="layui-table statisics-table"
          id="SurveyLiet"
          lay-filter="SurveyLiet"
        >
          <thead>
            <tr>
              <th></th>
              <th>费用</th>
              <th>类型百分点</th>
              <th>公司总费用百分点</th>
              <th>总公司类型百分点</th>
            </tr>
          </thead>
          <tbody
            v-for="(baoxiaoDatas, baoxiaoName) in getGroupByBaoxiao()"
            :key="baoxiaoName"
          >
            <tr class="tr-main" v-if="!$route.query.company_id">
              <td class="text-right">
                {{ _.jSumBy(baoxiaoDatas, "total_amount") | money }}
              </td>
              <td class="text-right">100.00%</td>
              <td class="text-right">
                {{
                  (_.jSumBy(baoxiaoDatas, "total_amount") / allDatasTotalFee)
                    | percent
                }}%
              </td>
              <td>100.00%</td>
            </tr>
            <tr class="tr-main" v-else>
              <td>
                {{ baoxiaoName }}
              </td>
              <template
                v-for="totalFee in [
                  getSumByListFilter(
                    baoxiaoDatas,
                    [+$route.query.company_id],
                    'company_id'
                  )
                ]"
              >
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
                        level1: getUnionProcessByFilterCompanyID(
                          baoxiaoDatas,
                          $route.query.company_id
                        ).join(','),
                        level2: _.map(
                          groupByNamePayout[baoxiaoName],
                          'id'
                        ).join(','),
                        level3: ''
                      }
                    }"
                  >
                    {{ totalFee | money }}
                  </router-link>
                  <span v-else :class="totalFee > 0 ? 'text-green' : ''">
                    {{ totalFee | money }}
                  </span>
                </td>
                <td class="text-right">100.00%</td>
                <td class="text-right">
                  {{ (totalFee / allDatasTotalFee) | percent }}%
                </td>
                <td class="text-right">
                  {{
                    (totalFee / _.jSumBy(baoxiaoDatas, "total_amount"))
                      | percent
                  }}%
                </td>
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
    </div>
  </div>
</template>

<script>
import ListMixins from '../../List'

export default {
  mixins: [ListMixins],
  api: 'operating_report.headquarters',
  computed: {
    currentCompany() {
      return _.find(this.options.company, x => x.id === +this.$route.query.company_id) || { name: '总公司' }
    },
  },
  async mounted() {
    await this.getOptions()
    this.getList()
  },
}
</script>
