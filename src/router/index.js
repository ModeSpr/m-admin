import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// webpackChunkName: "home"

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/index'),
    hidden: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
