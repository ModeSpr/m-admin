import Vue from 'vue'
import axios from 'axios'
import store from '@/store'
import qs from 'qs'
import router from '@/router'
import { tokenName } from '@/config'

const instance = axios.create({
  baseURL: process.env.VUE_APP_URL,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

instance.interceptors.request.use(
  config => {
    if (store.getters['user/accessToken']) {
      config.headers[tokenName] = store.getters['user/accessToken']
    }
    if (
      config.data &&
      config.headers['Content-Type'] === 'application/x-www-form-urlencoded;charset=UTF-8'
    )
      config.data = qs.stringify(config.data)
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  response => {
    const { data, config } = response
    return data
  },
  error => {
    const { response, message } = error
    if (error.response && error.response.data) {
      const { status, data } = response
      handleCode(status, data.msg || message)
      return Promise.reject(error)
    } else {
      let { message } = error
      if (message === 'Network Error') {
        message = '后端接口连接异常'
      }
      if (message.includes('timeout')) {
        message = '后端接口请求超时'
      }
      if (message.includes('Request failed with status code')) {
        const code = message.substr(message.length - 3)
        message = '后端接口' + code + '异常'
      }
      Vue.prototype.$message(message || `后端接口未知异常`, 'error')
      return Promise.reject(error)
    }
  }
)

/**
 * @description 处理code异常
 * @param {*} code
 * @param {*} msg
 */
const handleCode = (code, msg) => {
  switch (code) {
    case 402:
      Vue.prototype.$message(msg || `后端接口${code}异常`, 'error')
      store.dispatch('user/resetAccessToken').catch(() => {})
      location.reload()
      break
    case 401:
      router.push({ path: '/401' }).catch(() => {})
      break
    default:
      Vue.prototype.$message(msg || `后端接口${code}异常`, 'error')
      break
  }
}

export default instance
