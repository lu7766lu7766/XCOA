import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'history',
  scrollBehavior(to, from, savedPosition)
  {
    if (savedPosition)
    {
      return savedPosition
    }
    else
    {
      return {x: 0, y: 0}
    }
  },
  routes: require('./routes').default,
})

const routerReplace = Router.prototype.replace
Router.prototype.replace = function replace(location)
{
  return routerReplace.call(this, location).catch(error => error)
}