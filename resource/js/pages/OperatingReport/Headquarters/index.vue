<template>
  <div class="layui-fluid">
    <div class="layui-card">
      <div class="layui-row layui-col-space10 layui-card-body">
        <div class="layui-form layuiadmin-card-header-auto">
          <div class="layui-form-item search-box">
            <div class="layui-inline">
              <a id="addSurvey" class="layui-btn btn-change" @click="doSwitch">{{ switchTxt }}</a>
            </div>
            <div class="form-box">
              <date-range-picker :start.sync="search.start" :end.sync="search.end"></date-range-picker>
              <date-button :start.sync="search.start" :end.sync="search.end"></date-button>
              <div class="layui-inline multiple-box">
                <label class="layui-form-label">币值：</label>
                <div class="layui-input-inline">
                  <j-select title="币值"
                            :datas="options.currency"
                            valueKey="id"
                            displayKey="zh_name"
                            v-model="search.currency_id" />
                </div>
              </div>
              <div class="layui-inline multiple-box">
                <label class="layui-form-label">公司：</label>
                <div class="layui-input-inline">
                  <multi-select :datas="options.company"
                                valueKey="id"
                                v-model="search.company_id"></multi-select>
                </div>
              </div>
              <div class="layui-inline">
                <button id="InquireSur" class="layui-btn" title="查询" @click="doSearch">
                  <i class="iconfont icon-sousuo"></i></button>
              </div>
            </div>
          </div>
        </div>
        <table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
          <thead>
          <tr>
            <th class="toggle-btn">
              <span class="btn-plus" @click="showAll"><i class="fa fa-plus"></i> 全部展开</span>
              <!-- <span class="btn-minus"><i class="fa fa-minus"></i> 全部收合</span> -->
            </th>
            <th class="text-center">
              <router-link :to="{
                name: 'operating-report-detail',
                query: {
                  currency_id: search.currency_id,
                  start: search.start,
                  end: search.end
                }
              }">总公司
              </router-link>
              <br />{{ currencyTxt }}
            </th>
            <th class="text-center" v-for="(company, index) in showCompany" :key="index">
              <router-link :to="{
                name: 'operating-report-detail',
                query: {
                  company_id: company.id,
                  currency_id: search.currency_id,
                  start: search.start,
                  end: search.end
                }
              }">{{ company.name }}<br />{{ currencyTxt }}
              </router-link>
            </th>
          </tr>
          </thead>
          <!--number-->
          <template v-if="showNumber">
            <tbody
                v-for="(baoxiaoDatas, baoxiao_id) in list"
                :key="baoxiao_id">
            <tr class="tr-main"
                @click="collapse[baoxiao_id] = !collapse[baoxiao_id]">
              <td>{{ _.getVal(idPayout[baoxiao_id], 'name', baoxiao_id) }}</td>
              <td class="text-right">
                {{ _.jSumBy(baoxiaoDatas, 'total_amount') | money }}
              </td>
              <td class="text-right" v-for="(company, index) in showCompany" :key="index">
                {{ _.chain(baoxiaoDatas).filter(x => x.company_id == company.id).jSumBy('total_amount') | money }}
              </td>
            </tr>
            <!-- collapse -->
            <tr class="tr-sub"
                v-show="collapse[baoxiao_id]"
                v-for="(feeDatas, fee_id) in _.groupBy(baoxiaoDatas, 'fee_type')"
                :key="fee_id">
              <td> - {{ _.getVal(idPayout[fee_id], 'name', fee_id) }}</td>
              <td class="text-right">
                {{ _.jSumBy(feeDatas, 'total_amount') | money }}
              </td>
              <td class="text-right" v-for="(company, index) in showCompany" :key="index">
                {{ _.chain(feeDatas).filter(x => x.company_id == company.id).jSumBy('total_amount') | money }}
              </td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
              <td class="text-center">总计</td>
              <td class="text-right">{{ _.jSumBy(datas, 'total_amount') | money }}</td>
              <td class="text-right"
                  v-for="(company, index) in showCompany"
                  :key="index">
                {{ _.chain(datas).filter(x => x.company_id == company.id).jSumBy('total_amount') | money }}
              </td>
            </tr>
            </tfoot>
          </template>
          <!--percent-->
          <template v-else>
            <tbody
                v-for="(baoxiaoDatas, baoxiao_id) in list"
                :key="baoxiao_id">
            <tr class="tr-main"
                role="button"
                data-toggle="collapse"
                @click="collapse[baoxiao_id] = !collapse[baoxiao_id]">
              <td>{{ _.getVal(idPayout[baoxiao_id], 'name', baoxiao_id) }}</td>
              <td class="text-right">
                100.00%
              </td>
              <td class="text-right" v-for="(company, index) in showCompany" :key="index">
                {{
                $decimal(_.chain(baoxiaoDatas).filter(x => x.company_id == company.id).jSumBy('total_amount').value())
                .div(_.jSumBy(baoxiaoDatas, 'total_amount')) | percent
                }}%
              </td>
            </tr>
            <!-- collapse -->
            <tr class="tr-sub"
                v-show="collapse[baoxiao_id]"
                v-for="(feeDatas, fee_id) in _.groupBy(baoxiaoDatas, 'fee_type')"
                :key="fee_id">
              <td> - {{ _.getVal(idPayout[fee_id], 'name', fee_id) }}</td>
              <td class="text-right">
                100%
              </td>
              <td class="text-right" v-for="(company, index) in showCompany" :key="index">
                {{
                $decimal(_.chain(feeDatas).filter(x => x.company_id == company.id).jSumBy('total_amount').value())
                .div(_.jSumBy(feeDatas, 'total_amount')) | percent
                }}%
              </td>
            </tr>
            </tbody>
            <tfoot>
            <tr>
              <td class="text-center">总计</td>
              <td class="text-right">100%</td>
              <td class="text-right"
                  v-for="(company, index) in showCompany"
                  :key="index">
                {{
                $decimal(_.chain(datas).filter(x => x.company_id == company.id).jSumBy('total_amount').value())
                .div(_.jSumBy(datas, 'total_amount')) | percent
                }}%
              </td>
            </tr>
            </tfoot>
          </template>

        </table>
        <!-- <div id="SurveyLietPage"></div> -->
      </div>
    </div>
  </div>
</template>

<script>
  import ListMixins from '../List'

  export default {
    mixins: [ListMixins],
    api: 'operating_report.headquarters',
    async mounted()
    {
      await this.getOptions()
      this.doSearch()
    },
  }
</script>
