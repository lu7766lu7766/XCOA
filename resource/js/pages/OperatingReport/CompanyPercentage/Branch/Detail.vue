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
              <th
                class="text-center"
                v-for="name in _.keys(getGroupByProcess())"
                :key="name"
              >
                {{ name }}
              </th>
              <th class="text-center">总计</th>
            </tr>
          </thead>
          <tbody
            v-for="(baoxiaoDatas, baoxiaoName) in getGroupByBaoxiao()"
            :key="baoxiaoName"
          >
            <tr>
              <td>
                <b>{{ baoxiaoName }}</b>
              </td>
              <td
                class="text-right"
                v-for="(processIDList, name) in getGroupByProcess()"
                :key="name"
              >
                <span
                  v-for="money in [
                    getSumByListFilter(
                      baoxiaoDatas,
                      processIDList,
                      'process_type'
                    )
                  ]"
                  :key="money"
                >
                  <router-link
                    class="text-green"
                    v-if="money > 0 && $route.query.company_id"
                    :to="{
                      name: 'statistics-finance',
                      query: {
                        company_id: $route.query.company_id,
                        currency_id: $route.query.currency_id,
                        end: $route.query.end,
                        start: $route.query.start,
                        level1: processIDList.join(','),
                        level2: _.map(
                          groupByNamePayout[baoxiaoName],
                          'id'
                        ).join(','),
                        level3: ''
                      }
                    }"
                  >
                    {{ money | money }}</router-link
                  >
                  <span v-else :class="money > 0 ? 'text-green' : ''">{{
                    money | money
                  }}</span>
                </span>
              </td>
              <td class="text-right">
                <span
                  v-for="money in [_.jSumBy(baoxiaoDatas, 'total_amount')]"
                  :key="money"
                >
                  <span :class="money > 0 ? 'text-green' : ''">{{
                    money | money
                  }}</span>
                </span>
              </td>
            </tr>
            <tr
              v-for="(feeDatas, feeName) in getGroupByFee(baoxiaoDatas)"
              :key="feeName"
            >
              <td>- {{ feeName }}</td>
              <td
                class="text-right"
                v-for="(processIDList, name) in getGroupByProcess()"
                :key="name"
              >
                <span
                  v-for="money in [
                    getSumByListFilter(feeDatas, processIDList, 'process_type')
                  ]"
                  :key="money"
                >
                  <router-link
                    class="text-green"
                    v-if="money > 0 && $route.query.company_id"
                    :to="{
                      name: 'statistics-finance',
                      query: {
                        company_id: $route.query.company_id,
                        currency_id: $route.query.currency_id,
                        end: $route.query.end,
                        start: $route.query.start,
                        level1: processIDList.join(','),
                        level2: _.map(
                          groupByNamePayout[baoxiaoName],
                          'id'
                        ).join(','),
                        level3: _.map(groupByNamePayout[feeName], 'id').join(
                          ','
                        )
                      }
                    }"
                  >
                    {{ money | money }}</router-link
                  >
                  <span v-else :class="money > 0 ? 'text-green' : ''">{{
                    money | money
                  }}</span>
                </span>
              </td>
              <td class="text-right">
                <span
                  v-for="money in [_.jSumBy(feeDatas, 'total_amount')]"
                  :key="money"
                >
                  <span :class="money > 0 ? 'text-green' : ''">{{
                    money | money
                  }}</span>
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="text-center">总计</td>
              <td
                class="text-right"
                v-for="(processIDList, name) in getGroupByProcess()"
                :key="name"
              >
                <span
                  v-for="money in [
                    _.chain(datas)
                      .filter(x => processIDList.indexOf(x.process_type) > -1)
                      .jSumBy('total_amount')
                  ]"
                  :key="money"
                >
                  {{ money | money }}
                </span>
              </td>
              <td class="text-right">
                <span
                  v-for="money in [_.jSumBy(datas, 'total_amount')]"
                  :key="money"
                >
                  {{ money | money }}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
        <!-- <div id="SurveyLietPage"></div> -->
      </div>
    </div>
  </div>
</template>

<script>
import DetailMixins from '../../Detail'

export default {
  mixins: [DetailMixins],
  api: 'operating_report.headquarters',
  async mounted()  {
    await this.getOptions()
    this.getDetail()
  },
}
</script>
