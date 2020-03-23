import Vue from 'vue'
import { JacPlugin } from 'jactools/index'
import _ from 'lodash'
import moment from 'moment'
import MyPlugin from './plugin'
import router from './router'
import App from './App.vue'
import './css/my.styl'

Vue.use(JacPlugin, {
	_,
	moment,
})
Vue.use(MyPlugin)

new Vue({
	router,
	render: h => h(App),
	mounted() {
		setTimeout(() => {
			if (!$('#app').children().length) {
				location.href = location.href.replace(location.origin, window.urls)
			}
		}, 300)
	},
}).$mount('#app')
