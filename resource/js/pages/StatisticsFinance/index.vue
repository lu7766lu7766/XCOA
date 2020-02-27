<template>
  <div class="layui-fluid">
    <div class="layui-card">
      <div class="layui-card-header">
        财务统计
      </div>
      <div class="layui-card-body">
        <div class="rwd-table">
          <table class="layui-table statisticsDetail-table">
            <thead>
            <tr>
              <th data-field="applyUserName" data-key="4-0-0" rowspan="2" class=" layui-unselect">
                <div class="layui-table-cell laytable-cell-4-0-0">
                  <span>申请人</span>
                  <span class="layui-table-sort layui-inline">
                    <i class="layui-edge layui-table-sort-asc" title="升序" @click="setOrder('applyUserName')"></i>
                    <i class="layui-edge layui-table-sort-desc"
                       title="降序"
                       @click="setOrder('applyUserName', 1)"></i></span>
                </div>
              </th>
              <th data-field="created_at" data-key="4-0-1" rowspan="2" data-unresize="true"
                  class=" layui-unselect">
                <div class="layui-table-cell laytable-cell-4-0-1">
                  <span>申请时间</span>
                  <span class="layui-table-sort layui-inline">
                    <i class="layui-edge layui-table-sort-asc" title="升序" @click="setOrder('created_at')"></i>
                    <i class="layui-edge layui-table-sort-desc" title="降序" @click="setOrder('created_at', 1)"></i>
                  </span></div>
              </th>
              <th data-field="2" data-key="4-0-2" colspan="3" data-unresize="true"
                  class=" layui-table-col-special">
                <div class="layui-table-cell laytable-cell-group" align="center"><span>类型</span></div>
              </th>
              <th data-field="finan_dept_name" data-key="4-0-3" rowspan="2" data-unresize="true"
                  class=" layui-unselect">
                <div class="layui-table-cell laytable-cell-4-0-3">
                  <span>费用部门</span>
                  <span class="layui-table-sort layui-inline">
                    <i class="layui-edge layui-table-sort-asc" title="升序" @click="setOrder('finan_dept_name')"></i>
                    <i class="layui-edge layui-table-sort-desc" title="降序" @click="setOrder('finan_dept_name', 1)"></i>
                  </span></div>
              </th>
              <th data-field="fee_remark2" data-key="4-0-4" rowspan="2" class="">
                <div class="layui-table-cell laytable-cell-4-0-4"><span>费用摘要</span></div>
              </th>
              <th data-field="cashierUserName" data-key="4-0-5" rowspan="2" class="">
                <div class="layui-table-cell laytable-cell-4-0-5"><span>出纳审核人</span></div>
              </th>
              <th data-field="cashierTime" data-key="4-0-6" rowspan="2" data-unresize="true"
                  class=" layui-unselect">
                <div class="layui-table-cell laytable-cell-4-0-6">
                  <span>出纳审核时间</span>
                  <span class="layui-table-sort layui-inline">
                    <i class="layui-edge layui-table-sort-asc" title="升序" @click="setOrder('cashierTime')"></i>
                    <i class="layui-edge layui-table-sort-desc" title="降序" @click="setOrder('cashierTime', 1)"></i>
                  </span></div>
              </th>
              <th data-field="fee_receipt_count" data-key="4-0-7" rowspan="2" data-unresize="true"
                  class=" layui-unselect">
                <div class="layui-table-cell laytable-cell-4-0-7">
                  <span>单据数量</span>
                  <span class="layui-table-sort layui-inline">
                    <i class="layui-edge layui-table-sort-asc" title="升序" @click="setOrder('fee_receipt_count')"></i>
                    <i class="layui-edge layui-table-sort-desc"
                       title="降序"
                       @click="setOrder('fee_receipt_count', 1)"></i>
                  </span></div>
              </th>
              <th data-field="8" data-key="4-0-8" colspan="3" data-unresize="true"
                  class=" layui-table-col-special">
                <div class="layui-table-cell laytable-cell-group" align="center"><span>金额</span></div>
              </th>
            </tr>
            <tr>
              <th data-field="oneCateName" data-key="4-1-0" data-parentkey="0-2" class="">
                <div class="layui-table-cell laytable-cell-4-1-0"><span>流程类型</span></div>
              </th>
              <th data-field="twoCateName" data-key="4-1-1" data-parentkey="0-2" class="">
                <div class="layui-table-cell laytable-cell-4-1-1"><span>费用类型</span></div>
              </th>
              <th data-field="threeCateName" data-key="4-1-2" data-parentkey="0-2" class="">
                <div class="layui-table-cell laytable-cell-4-1-2"><span>费用子类型</span></div>
              </th>
              <th data-field="zh_name" data-key="4-1-3" data-parentkey="0-8" class="">
                <div class="layui-table-cell laytable-cell-4-1-3"><span>原币种名称</span></div>
              </th>
              <th data-field="fee_amount" data-key="4-1-4" data-parentkey="0-8" class=" layui-unselect">
                <div class="layui-table-cell laytable-cell-4-1-4">
                  <span>原币种金额</span>
                  <span class="layui-table-sort layui-inline">
                    <i class="layui-edge layui-table-sort-asc" title="升序" @click="setOrder('fee_amount')"></i>
                    <i class="layui-edge layui-table-sort-desc"
                       title="降序"
                       @click="setOrder('fee_amount', 1)"></i></span></div>
              </th>
              <th data-field="rmb_amount" data-key="4-1-5" data-parentkey="0-8" class=" layui-unselect">
                <div class="layui-table-cell laytable-cell-4-1-5">
                  <span>换算人民币</span>
                  <span class="layui-table-sort layui-inline">
                    <i class="layui-edge layui-table-sort-asc" title="升序" @click="setOrder('rmb_amount')"></i>
                    <i class="layui-edge layui-table-sort-desc" title="降序" @click="setOrder('rmb_amount', 1)"></i>
                  </span></div>
              </th>
            </tr>
            </thead>
            <tbody>
            <tr class="" v-for="(data, index) in orderDatas" :key="index">
              <td data-field="applyUserName" data-key="4-0-0" class="">
                <div class="layui-table-cell laytable-cell-4-0-0">
                  {{ data.applyUserName }}
                </div>
              </td>
              <td data-field="created_at" data-key="4-0-1" class="">
                <div class="layui-table-cell laytable-cell-4-0-1" style="white-space: inherit;">
                  {{ data.created_at }}
                </div>
              </td>
              <td data-field="oneCateName" data-key="4-1-0" class="">
                <div class="layui-table-cell laytable-cell-4-1-0">
                  {{ data.oneCateName }}
                </div>
              </td>
              <td data-field="twoCateName" data-key="4-1-1" class="">
                <div class="layui-table-cell laytable-cell-4-1-1">
                  {{ data.twoCateName }}
                </div>
              </td>
              <td data-field="threeCateName" data-key="4-1-2" class="">
                <div class="layui-table-cell laytable-cell-4-1-2">
                  {{ data.threeCateName }}
                </div>
              </td>
              <td data-field="finan_dept_name" data-key="4-0-3" class="">
                <div class="layui-table-cell laytable-cell-4-0-3">
                  {{ data.finan_dept_name }}
                </div>
              </td>
              <td data-field="fee_remark2" data-key="4-0-4" class="">
                <div class="layui-table-cell laytable-cell-4-0-4">
                  {{ data.fee_remark2 }}
                </div>
              </td>
              <td data-field="cashierUserName" data-key="4-0-5" class="">
                <div class="layui-table-cell laytable-cell-4-0-5">
                  {{ data.cashierUserName }}
                </div>
              </td>
              <td data-field="cashierTime" data-key="4-0-6" data-minwidth="130" class="">
                <div class="layui-table-cell laytable-cell-4-0-6" style="white-space: inherit;">
                  {{ data.cashierTime }}
                </div>
              </td>
              <td data-field="fee_receipt_count" data-key="4-0-7" class="">
                <div class="layui-table-cell laytable-cell-4-0-7">
                  {{ data.fee_receipt_count }}
                </div>
              </td>
              <td data-field="zh_name" data-key="4-1-3" class="">
                <div class="layui-table-cell laytable-cell-4-1-3">
                  {{ data.zh_name }}
                </div>
              </td>
              <td data-field="fee_amount" data-key="4-1-4" class="">
                <div class="layui-table-cell laytable-cell-4-1-4">
                  {{ data.fee_amount | money }}
                </div>
              </td>
              <td data-field="rmb_amount" data-key="4-1-5" class="">
                <div class="layui-table-cell laytable-cell-4-1-5">
                  {{ data.rmb_amount | money }}
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
        <!-- <div id="SurveyLietPage"></div> -->
      </div>
    </div>

  </div>
</template>

<script>
  import ListMixins from 'mixins/List'

  export default {
    mixins: [ListMixins],
    data: () => ({
      search: {},
      order: {
        key: '',
        type: 'asc',
      },
    }),
    api: 'statistics_finance',
    methods: {
      async getList()
      {
        const res = await this.$thisApi.getList(this.reqBody)
        this.datas = res.data.data_list
        this.paginate.total = res.data.total_count
      },
      setOrder(key, type)
      {
        this.order.key = key
        this.order.type = type
          ? 'desc'
          : 'asc'
      },
    },
    computed: {
      orderDatas()
      {
        return this.order.key
          ? _.orderBy(this.datas, x => +x[this.order.key], this.order.type)
          : this.datas
      },
    },
    mounted()
    {
      this.search = {
        CompanyId: this.$route.query.company_id,
        CurrencyUnitId: this.$route.query.currency_id,
        EndTime: this.$route.query.end,
        StartTime: this.$route.query.start,
        OneLevelId: this.$route.query.level1,
        TwoLevelId: this.$route.query.level2,
        ThreeLevelId: this.$route.query.level3,
        currentIndex: this.paginate.page,
        pageSize: this.paginate.perpage,
      }
      this.getList()
    },
  }
</script>

<style scoped>
</style>