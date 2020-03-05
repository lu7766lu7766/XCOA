<template>
  <modal :name="name" :height="height" :width="width" :adaptive="true" style="z-index: 2000">
    <div class="layui-layer-title" style="cursor: move;">{{ title }}</div>

    <span class="layui-layer-setwin">
      <a class="layui-layer-ico layui-layer-close layui-layer-close1"
         href="javascript:;"
         @click="hide"></a></span>

    <div class="layui-layer-content" :style="{
        'height': height - 30 + 'px',
        'overflow': 'scroll'
      }">
      <div class="tab-pane active">
        <div class="block-content">
          <slot></slot>
        </div>
      </div>
    </div>
  </modal>
</template>

<script>
  export default {
    props: {
      name: {
        type: String,
        default: 'modal' + Math.random(Math.random() * 10000),
      },
      title: {
        type: String,
        default: '修改',
      },
      width: {
        type: Number | String,
        default: 1280,
      },
      height: {
        type: Number | String,
        default: 800,
      },
    },
    methods: {
      show()
      {
        this.$modal.show(this.name)
      },
      hide()
      {
        this.$modal.hide(this.name)
      },
    },
  }
</script>
