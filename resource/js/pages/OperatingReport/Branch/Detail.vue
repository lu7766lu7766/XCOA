<template>
  <div class="layui-fluid">
    <div class="layui-card">
      <div class="layui-card-header">
        詳細數據({{ currentCompany.name }})
      </div>
      <div class="layui-card-body">
        <table class="layui-table statisics-table" id="SurveyLiet" lay-filter="SurveyLiet">
          <thead>
          <tr>
            <th></th>
            <th class="text-center"
                v-for="id in processIDList" :key="id">
              {{ idPayout[id].name }}
            </th>
            <th class="text-center">总计</th>
          </tr>
          </thead>
          <tbody
              v-for="(baoxiaoDatas, baoxiao_id) in list"
              :key="baoxiao_id">
          <tr>
            <td><b>{{ _.getVal(idPayout[baoxiao_id], 'name', baoxiao_id) }}</b></td>
            <td class="text-right"
                v-for="processID in processIDList" :key="processID">
              <span v-for="money in [_.chain(baoxiaoDatas).filter(x => x.process_type == processID).jSumBy('total_amount')]">
                <a class="text-green" v-if="money > 0">{{ money | money }}</a>
                <span v-else>{{ money | money }}</span>
              </span>
            </td>
            <td class="text-right">
              <span v-for="money in [_.jSumBy(baoxiaoDatas, 'total_amount')]">
                <a class="text-green" v-if="money > 0">{{ money | money }}</a>
                <span v-else>{{ money | money }}</span>
              </span>
            </td>
          </tr>
          <tr v-for="(feeDatas, fee_id) in _.groupBy(baoxiaoDatas, 'fee_type')"
              :key="fee_id">
            <td> - {{ _.getVal(idPayout[fee_id], 'name', fee_id) }}</td>
            <td class="text-right"
                v-for="processID in processIDList" :key="processID">
          <span v-for="money in [_.chain(feeDatas).filter(x => x.process_type == processID).jSumBy('total_amount')]">
            <a class="text-green" v-if="money > 0">{{ money | money }}</a>
            <span v-else>{{ money | money }}</span>
          </span>
            </td>
            <td class="text-right">
              <span v-for="money in [_.jSumBy(feeDatas, 'total_amount')]">
                <a class="text-green" v-if="money > 0">{{ money | money }}</a>
                <span v-else>{{ money | money }}</span>
              </span>
            </td>
          </tr>
          </tbody>
          <tfoot>
          <tr>
            <td class="text-center">总计</td>
            <td class="text-right" v-for="processID in processIDList" :key="processID">
              <span v-for="money in [_.chain(datas).filter(x => x.process_type == processID).jSumBy('total_amount')]">
                {{ money | money }}
              </span>
            </td>
            <td class="text-right">
              <span v-for="money in [_.jSumBy(datas, 'total_amount')]">
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
  import DetailMixins from '../Detail'

  export default {
    mixins: [DetailMixins],
    api: 'operating_report.branch',
    async mounted()
    {
      await this.getOptions()
      this.options.company = [this.options.company]
      this.getDetail()
    },
  }
</script>
