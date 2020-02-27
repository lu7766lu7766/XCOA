<template>
  <div class="layui-inline">
    <label class="layui-form-label">日期：</label>
    <div class="layui-input-inline">
      <input type="text" class="layui-input" ref="picker" />
    </div>
  </div>
</template>

<script>

  export default {
    props: ['start', 'end'],
    watch: {
      start()
      {
        $(this.$refs['picker']).data('daterangepicker').setStartDate(this.start)
      },
      end()
      {
        $(this.$refs['picker']).data('daterangepicker').setEndDate(this.end)
      },
    },
    mounted()
    {
      this.$nextTick(() =>
      {
        $(this.$refs['picker']).daterangepicker({
          startDate: this.start,
          endDate: this.end,
          locale: {
            format: 'YYYY-MM-DD',
            applyLabel: '确定',
            cancelLabel: '取消',
            fromLabel: '开始日期',
            toLabel: '结束日期',
            customRangeLabel: '自订日期区间',
            daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
            monthNames: [
              '1月', '2月', '3月', '4月', '5月', '6月',
              '7月', '8月', '9月', '10月', '11月', '12月',
            ],
            firstDay: 1,
          },
        }).on('hide.daterangepicker', (e, picker) =>
        {
          this.$emit('update:start', picker.startDate.format('YYYY-MM-DD'))
          this.$emit('update:end', picker.endDate.format('YYYY-MM-DD'))
        })
      })
    },
  }
</script>