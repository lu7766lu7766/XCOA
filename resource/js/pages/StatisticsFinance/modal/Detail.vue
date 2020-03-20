<template>
  <detail title="报销付款单详情">
    <div class="layui-fluid" v-if="data.created_at">
      <div class="layui-form" ref="printHtml">
        <div class="layui-form-item">
          <div class="layui-inline layui-word-aux"><label class="layui-form-label modify-layui-label ">填写时间</label>
            <div class="layui-input-block layui-input-lineHeight"><span>{{ data.created_at }}</span></div>
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">姓名</label>
            <div class="layui-input-block layui-input-lineHeight"><span>{{ data.creator }}</span></div>
          </div>
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">部门</label>
            <div class="layui-input-block layui-input-lineHeight"><span>{{ data.dept_name }}</span></div>
          </div>
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">列支年月</label>
            <div class="layui-input-block layui-input-lineHeight"><span>{{ data.liezhi_month }}</span></div>
          </div>
          <div class="layui-inline fr">
            <button id="printId" class="no-print layui-btn" @click="print">打印</button>
          </div>
        </div>
        <div class="layui-form-item">
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">流程类型</label>
            <div class="layui-input-block layui-input-lineHeight"><span>{{ data.process_type_name }}</span></div>
          </div>
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">类型</label>
            <div class="layui-input-block layui-input-lineHeight"><span>{{ data.baoxiao_type_name }}</span></div>
          </div>
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">费用部门</label>
            <div class="layui-input-block layui-input-lineHeight">
              <span>{{ (data.finan_dept_name ? data.finan_dept_name : '暂无')}}</span>
            </div>
          </div>
        </div>
        <div class="layui-form-item"><label class="layui-form-label modify-layui-label">支付明细</label>
          <div class="layui-input-block">
            <table class="layui-table" id="lzmFormData">
              <thead>
              <tr></tr>
              </thead>
              <tbody>
              <tr>
                <td>暂无</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="layui-form-item"><label class="layui-form-label modify-layui-label">费用明细</label>
          <div class="layui-input-block">
            <table class="layui-table">
              <colgroup>
                <col width="150">
                <col>
                <col width="150">
                <col width="150">
                <col width="130">
              </colgroup>
              <thead>
              <tr>
                <th>费用类型</th>
                <th>费用摘要</th>
                <th>单据数量</th>
                <th>金额 {{ data.zh_name + '(' + data.short_code + ')' }}</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="detail in data.details" :key="detail.id">
                <td>{{ detail.fee_type_name }}</td>
                <td class="expandingArea ">
                  <pre style="display:block;visibility:hidden;"><span>{{ detail.remark }}</span><br></pre>
                  <textarea readonly="" class="layui-textarea Remark">{{ detail.remark }}</textarea></td>
                <td>{{ detail.receipt_count }}</td>
                <td>{{ detail.amount }}</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="layui-form-item" v-if="data.financial_type_code === 'FK'">
          <label class="layui-form-label">付款信息</label>
          <div class="layui-input-block">
            <table class="layui-table">
              <tr>
                <td>
                  <div class="layui-form-item">
                    <div class="layui-inline">
                      <label class="layui-form-label"><span class="red"> ＊</span>银行</label>
                      <div class="layui-input-inline">
                        <input type="text"
                               readonly
                               class="layui-input"
                               name="BankName"
                               id="BankName"
                               :value="data.bank_name"></div>
                    </div>
                    <div class="layui-inline">
                      <label class="layui-form-label">开户支行</label>
                      <div class="layui-input-inline">
                        <input type="text"
                               readonly
                               name="Branch"
                               id="Branch"
                               class="layui-input"
                               :value="data.branch"></div>
                    </div>
                    <div class="layui-inline">
                      <label class="layui-form-label"><span class="red"> ＊</span> 银行账号</label>
                      <div class="layui-input-inline">
                        <input type="text"
                               readonly
                               name="BankAccount"
                               id="BankAccount"
                               class="layui-input"
                               :value="data.bank_account"></div>
                    </div>
                    <div class="layui-inline">
                      <label class="layui-form-label"><span class="red"> ＊</span> 开户人</label>
                      <div class="layui-input-inline">
                        <input type="text"
                               readonly
                               name="AccountName"
                               id="AccountName"
                               class="layui-input"
                               :value="data.account_name"></div>
                    </div>
                    <div class="layui-inline">
                      <label class="layui-form-label">省份</label>
                      <div class="layui-input-inline">
                        <input type="text"
                               readonly
                               name="Province"
                               id="Province"
                               class="layui-input"
                               :value="data.province"></div>
                    </div>
                    <div class="layui-inline">
                      <label class="layui-form-label">城市</label>
                      <div class="layui-input-inline">
                        <input type="text"
                               readonly
                               name="City"
                               id="City"
                               class="layui-input"
                               :value="data.city"></div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div class="layui-form-item">
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">总金额</label>
            <div class="layui-input-block layui-input-lineHeight">
              <span>{{ data.short_code + ' ' + data.amount + '' + data.symbol + '，' + data.capital_amount + '' + data.zh_name }}</span>
            </div>
          </div>
          <div class="layui-inline"><label class="layui-form-label modify-layui-label">单据总数</label>
            <div class="layui-input-block layui-input-lineHeight"><span>{{ data.receipt_count }}</span></div>
          </div>
        </div>

        <div class="layui-form-item"><label class="layui-form-label modify-layui-label">附件</label>
          <div class="layui-input-block layui-input-lineHeight UploadNames-box">
            <span v-if="data.attaches.length">
              <a title="点击下载"
                 v-for="(attache, index) in data.attaches" :key="index"
                 href="javascript:;"
                 @click="previewOpen((data.is_fixed_costs == 1 ? '/gateway/financial/downloadfixedcost/' : '/gateway/financial/download/') + attache.id)">
                {{ attache.original_name }}
              </a>
              <!-- target="_blank" -->
              <!-- :href="(data.is_fixed_costs == 1 ? '/gateway/financial/downloadfixedcost/' : '/gateway/financial/download/') + attache.id" -->
            </span>
            <span v-else>无附件</span>
          </div>
        </div>

        <div class="layui-form-item" v-if="data.cancel_remark">
          <label class="layui-form-label modify-layui-label">取消原因</label>
          <div class="layui-input-block layui-input-lineHeight UploadNames-box">
            {{ data.cancel_remark }}
          </div>
        </div>


        <div class="layui-form-item">
          <label class="layui-form-label modify-layui-label layui-overflow-lineHeight">审批历史</label>
          <div class="layui-input-block layui-input-lineHeight UploadNames-box layui-overflow-lineHeight">
            <span v-if="!data.approval_history.length">暂无</span>
            <span v-else>
              <span v-for="(approval, index) in data.approval_history" :key="index">
                <p v-if="approval.is_forward === 1">
                  【{{ approval.username }}--转发-->
                  <em class="green"> {{ approval.forward_username + ' ' + approval.approval_time }}</em>】：
                </p>
                <p v-else>
                  <span> 【{{ approval.username}} <em :class="approval.approval_result == 1 ? 'red' : 'green'">
                    {{ approval.approval_time }}</em>】
                  </span>{{ approval.content }}
                </p>
              </span>
            </span>
          </div>
        </div>
        <div class="layui-form-item"><label class="layui-form-label modify-layui-label label-six">出纳审批记录</label>
          <div class="layui-input-block layui-input-lineHeight layui-overflow-lineHeight">
            <p v-if="data.cashier_approval">
              <span>【{{ data.cashier_approval.name }}:<em>
                {{ data.cashier_approval.approval_result == 0
                    ? '待审批'
                    : data.cashier_approval.approval_result == 1
                      ? '未通过'
                      : data.cashier_approval.approval_result == 2
                        ? '已同意'
                        : ''}}
                {{ data.cashier_approval.approval_time }}</em>】</span>
              {{ data.cashier_approval.content }}
            </p>
          </div>
        </div>
      </div>
      <div class="layui-form-item" style="margin-left:118px;">
        <div class="layui-input-blocklayui-input-lineHeight">
          <button id="closeId" class=" layui-btn layui-btn-primary" @click="hide">关闭</button>
        </div>
      </div>
    </div>
  </detail>
</template>

<script>
  import DetailMixins from 'mixins/Detail'
  import WindowMiins from 'mixins/Window'

  export default {
    mixins: [DetailMixins, WindowMiins],
    methods: {
      async getDetail(ID)
      {
        const res = await this.$thisApi.getDetail({ID})
        this.data = res.data
      },
      print()
      {
        $(this.$refs['printHtml']).jqprint({
          debug: false,
          importCSS: true,
          printContainer: true,
          operaSupport: false,
        })
      },
    },
    mounted()
    {
      // $('#printId').on('click', function ()
      // {
      //   // var index = layer.load(2, {time: 2000})
      //
      // })
      this.$bus.on('detail.show', data =>
      {
        this.getDetail(data.id)
        this.show()
      })
    },
    destroyed()
    {
      this.$bus.off('detail.show')
    },
  }
</script>

<style lang="stylus" scoped>
  .layui-form-label
    width 80px

  .label-six
    width 85px

</style>