<template>
  <select class="form-control"
          v-model="data"
          :style="{color: data === '' ? '#c9c9c9' : 'black'}"
          :disabled="disabled">
    <option value="" v-if="title">{{ title }}</option>
    <option v-for="(data, index) in list" :key="index" :value="data.code">
      {{ getTranslate(data.name) }}
    </option>
  </select>
</template>

<script>
  export default {
    props: {
      datas: {
        type: Object | Array,
        required: true,
      },
      translate: {
        type: Object,
      },
      title: {
        type: String,
      },
      value: '',
      valueKey: {
        default: 'code',
      },
      displayKey: {
        default: 'name',
      },
      disabled: {
        default: false,
      },
    },
    data: () => ({
      data: '',
    }),
    watch: {
      data()
      {
        this.$emit('input', this.data)
      },
    },
    methods: {
      getTranslate(key)
      {
        return this.translate
          ? this.translate[key]
            ? this.translate[key]
            : key
          : key
      },
    },
    computed: {
      list()
      {
        if (this.datas)
        {
          if (this.datas.constructor === Object)
          {
            return _.reduce(this.datas, (result, name, code) =>
            {
              result.push({code, name})
              return result
            }, [])
          }
          else
          {
            return _.reduce(this.datas, (result, data) =>
            {
              if (typeof data === 'object')
              {
                result.push({
                  code: data[this.valueKey],
                  name: data[this.displayKey],
                })
              }
              else
              {
                result.push({
                  code: data,
                  name: data,
                })
              }
              return result
            }, [])
          }
        }
      },
    },
    mounted()
    {
      this.data = this.value
    },
  }
</script>

<style scoped>

</style>
