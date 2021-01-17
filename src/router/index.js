import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/layouts'

Vue.use(VueRouter)

// webpackChunkName: "home"

export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  // {
  //   path: '/register',
  //   component: () => import('@/views/register/index'),
  //   hidden: true
  // },
  {
    path: '/401',
    name: '401',
    component: () => import('@/views/default/401'),
    hidden: true
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/default/404'),
    hidden: true
  }
]

export const asyncRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: 'Index',
        component: () => import('@/views/index/index'),
        meta: {
          title: '首页',
          icon: 'home',
          affix: true,
          noKeepAlive: true
        }
      }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior: () => ({
    y: 0
  }),
  routes: [...constantRoutes, ...asyncRoutes]
})

// 允许路由重复点击
/* const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch((err) => err);
}; */

export function resetRouter() {
  router.matcher = new VueRouter({
    base: routerMode === 'history' ? publicPath : '',
    mode: routerMode,
    scrollBehavior: () => ({
      y: 0
    }),
    routes: constantRoutes
  }).matcher
}

export default router
