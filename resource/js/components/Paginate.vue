<template>
  <div class="layui-table-page">
    <div id="layui-table-page1">
      <div class="layui-box layui-laypage layui-laypage-default" id="layui-laypage-1">
        <a href="javascript:;" class="layui-laypage-prev "
           :class="page === 1 ? 'layui-disabled' : ''"
           @click="page === 1 ? '' : pageChange(page-1)">
          <i class="layui-icon"></i></a>

        <span v-for="p in _.range(startPage, endPage+1)"
              :key="p"
              @click="pageChange(p)">
          <span class="layui-laypage-curr" v-if="p === page">
            <em class="layui-laypage-em"></em><em>{{ p }}</em>
          </span>
          <a href="javascript:;" v-else>{{ p }}</a>
        </span>

        <a href="javascript:;" class="layui-laypage-next"
           :class="page === lastPage ? 'layui-disabled' : ''"
           @click="page === lastPage ? '' : pageChange(page+1)">
          <i class="layui-icon"></i></a>

        <span class="layui-laypage-skip">到第<input type="text" min="1" v-model="myPage" class="layui-input">页
          <button type="button" class="layui-laypage-btn" @click="pageChange(myPage)">确定</button></span>

        <span class="layui-laypage-count">共 {{ total }} 条</span>
        <span class="layui-laypage-limits">
          <select lay-ignore @change="pageChange(myPage, $event.target.value)">
            <option v-for="per in [10,20,30,40,50,60,70,80,90,100,200,500,1000,2000]"
                    :value="per"
                    :selected="perpage === per">{{ per }} 条/页</option>
          </select>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      page: {
        type: Number,
        required: true,
      },
      lastPage: {
        type: Number,
        required: true,
      },
      total: {
        type: Number,
        require: true,
      },
      perpage: {
        type: Number,
        require: true,
      },
    },
    data: () => ({
      myPage: 1,
    }),
    computed: {
      startPage()
      {
        const start = this.page - 3
        return start > 1
          ? start
          : 1
      },
      endPage()
      {
        const end = this.page + 3
        return end < this.lastPage
          ? end
          : this.lastPage
      },
    },
    methods: {
      pageChange(targetPage, targetPerpage)
      {
        this.$emit('pageChange', +targetPage, +targetPerpage)
      },
    },
  }
</script>

<style lang="stylus" scoped>
  select[lay-ignore]
    text-align-last center
    /*line-height 21px*/
    line-height 100%

  input, button
    color #333
</style>