import Vue from 'vue'
import {JacPlugin} from 'jactools/index'
import _ from 'lodash'
import moment from 'moment'
import MyPlugin from './plugin'
import './css/my.styl'

Vue.use(JacPlugin, {
  _, moment,
})
Vue.use(MyPlugin)
console.log(Vue)
new Vue({
  el: '#app',
  components: {
    Test: () => import('./page/test')
  }
})