<template>
  <div class="layui-inline layui-day-btn">
    <button class="layui-btn layui-btn-normal" @click="yesterday()">昨日</button>
    <button class="layui-btn layui-btn-normal" @click="today()">今日</button>
    <button class="layui-btn layui-btn-normal" @click="lastWeek()">上周</button>
    <button class="layui-btn layui-btn-normal" @click="thisWeek()">本周</button>
    <button class="layui-btn layui-btn-normal month-btn" @click="lastMonth()">上月</button>
    <button class="layui-btn layui-btn-normal month-btn" @click="thisMonth()">本月</button>
  </div>
</template>

<script>
  export default {
    props: ['start', 'end'],
    methods: {
      yesterday()
      {
        this.$emit('update:start', moment().subtract(1, 'days').startOf('day').getDate())
        this.$emit('update:end', moment().subtract(1, 'days').endOf('day').getDate())
      },
      today()
      {
        this.$emit('update:start', moment().startOf('day').getDate())
        this.$emit('update:end', moment().endOf('day').getDate())
      },
      lastWeek()
      {
        this.$emit('update:start', moment().subtract(1, 'weeks').startOf('isoWeek').getDate())
        this.$emit('update:end', moment().subtract(1, 'weeks').endOf('isoWeek').getDate())
      },
      thisWeek()
      {
        this.$emit('update:start', moment().startOf('isoWeek').getDate())
        this.$emit('update:end', moment().endOf('isoWeek').getDate())
      },
      lastMonth()
      {
        this.$emit('update:start', moment().subtract(1, 'months').startOf('month').getDate())
        this.$emit('update:end', moment().subtract(1, 'months').endOf('month').getDate())
      },
      thisMonth()
      {
        this.$emit('update:start', moment().startOf('month').getDate())
        this.$emit('update:end', moment().endOf('month').getDate())
      },
    },
  }
</script>