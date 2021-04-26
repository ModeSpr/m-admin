import Vue from 'vue'

import Antd from 'ant-design-vue'
Vue.use(Antd)
import 'ant-design-vue/dist/antd.css'

import '@/styles/index.scss'

// 高精度权限控制
function checkArray(key) {
  let arr = ['1', '2', '3', '4', 'demo']
  let index = arr.indexOf(key)
  if (index > -1) {
    return true // 有权限
  } else {
    return false // 无权限
  }
}
Vue.directive("permission", {
  inserted(el, binding) {
    let permission = binding.value; // 获取到 v-permission的值
    if (permission) {
      let hasPermission = checkArray(permission);
      if (!hasPermission) { // 没有权限 移除Dom元素
        el.parentNode && el.parentNode.removeChild(el);
      }
    }
  }
});