import VueBus from 'vue-bus'
import VModal from 'vue-js-modal'
import API from 'lib/API'
import numFormat from 'vue-filter-number-format'
import numeral from 'numeral'

export default {
	install: Vue => {
		Vue.use(VueBus)
		Vue.use(VModal)
		Vue.prototype.$api = new API()

		Vue.filter('numFormat', numFormat(numeral))
		const moneyFormat = val => (isNaN(parseFloat(val)) ? val : numFormat(numeral)(val, '0,0.00'))
		Vue.filter('money', moneyFormat)
		Vue.filter('percent', val => numFormat(numeral)(val * 100, '0,0.00'))

		Vue.component('JSelect', require('@/Form/Select').default)

		Vue.prototype.$getScript = src => new Promise(resolve => $.getScript(src, () => resolve(1)))
	},
}

Number.prototype.split = function(str) {
	return ('' + this).split(str)
}
