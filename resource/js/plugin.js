import API from 'lib/API'
import numFormat from 'vue-filter-number-format'
import numeral from 'numeral'

export default {
  install: Vue =>
  {
    Vue.prototype.$api = new API()

    Vue.filter('numFormat', numFormat(numeral))
    const moneyFormat = val => isNaN(parseFloat(val))
      ? val
      : numFormat(numeral)(val, '0,0.00')
    Vue.filter('money', moneyFormat)
    Vue.filter('percent', val => numFormat(numeral)(val * 100, '0,0.00'))

    Vue.component('JSelect', require('@/Form/Select').default)
  },
}