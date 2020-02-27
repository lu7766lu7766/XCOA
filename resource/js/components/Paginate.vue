<template>
    <ul class="pagination pagination-box m-t-0 m-b-5" v-if="lastPage > 1">

      <li class="page-item previous"
          :class="{
            disabled: page === 1
          }"
          @click="page === 1 ? '' : pageChange(1)">
        <a href="javascript:;" class="page-link">«</a>
      </li>

      <li class="page-item"
          v-for="p in _.range(startPage, endPage+1)"
          :key="p"
          :class="{active : p === page}"
          @click="p === page ? '' : pageChange(p)">
        <a href="javascript:void(0)" class="page-link">{{ p }}</a>
      </li>

      <li class="page-item next"
          :class="{
            disabled: page === lastPage
          }"
          @click="page === lastPage ? '' : pageChange(lastPage)">
        <a href="javascript:;" class="page-link">»</a>
      </li>
    </ul>
</template>

<script>
  export default {
    props: {
      page: {
        type: Number,
        required: true
      },
      lastPage: {
        type: Number,
        required: true
      }
    },
    computed: {
      startPage() {
        const start = this.page - 3
        return start > 1
          ? start
          : 1
      },
      endPage() {
        const end = this.page + 3
        return end < this.lastPage
          ? end
          : this.lastPage
      }
    },
    methods: {
      pageChange(targetPage) {
        this.$emit('pageChange', targetPage)
      }
    }
  }
</script>
