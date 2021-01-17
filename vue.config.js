/**
 * vue 全局 CLI 配置
 * https://cli.vuejs.org/zh/config/#vue-config-js
 */
// 环境变量设置
process.env.VUE_APP_TITLE = 'Admin'
process.env.VUE_APP_VERSION = require('./package.json').version
// 是否为生产环境
const isProduction = process.env.NODE_ENV === 'production'
// gzip压缩 vue-cli
const CompressionWebpackPlugin = require('compression-webpack-plugin')
// 打包进度条
const Webpack = require('webpack')
const WebpackBar = require('webpackbar')
// 代码压缩 vue-cli
const TerserPlugin = require('terser-webpack-plugin')
// 抽离注入
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
// mock服务
function mockServer() {
  if (process.env.NODE_ENV === 'development') {
    const mockServer = require('./mock/mock-server.js')
    return mockServer
  } else {
    return ''
  }
}
// const cdn = {
//   externals: {
//     'vue': "Vue",
//     "vue-router": "VueRouter",
//     'axios': "axios"
//   },
//   js: {
//     Vue: ['https://cdn.bootcss.com/vue/2.6.10/vue.min.js', '/static/vue.min.js'],
//     VueRouter: ['https://cdn.bootcss.com/vue-router/3.0.4/vue-router.min.js', '/static/vue-router.min.js'],
//     axios: ['https://cdn.bootcss.com/axios/0.18.0/axios.min.js', '/static/axios.min.js']
//   }
// }

module.exports = {
  // 部署时的URL
  publicPath: isProduction ? './admin' : '/',
  lintOnSave: true,
  productionSourceMap: false,
  // 进行编译的依赖
  transpileDependencies: [],
  // 在 Vue 组件中使用 template 选项
  runtimeCompiler: true,
  devServer: {
    hot: true,
    port: 999,
    open: true,
    noInfo: false,
    overlay: {
      warnings: true,
      errors: true
    },
    before: mockServer()
  },
  css: {
    // 为 CSS 开启 source map
    sourceMap: true,
    loaderOptions: {
      less: {
        // 设置全局 style 变量
        // additionalData: `@import "~@/styles/variables.less";`
      },
      scss: {
        /*sass-loader 8.0语法 */
        //prependData: '@import "~@/styles/variables.scss";',

        /*sass-loader 9.0写法，感谢github用户 shaonialife*/
        additionalData(content, loaderContext) {
          const { resourcePath, rootContext } = loaderContext
          const relativePath = path.relative(rootContext, resourcePath)
          if (relativePath.replace(/\\/g, '/') !== 'src/styles/variables.scss') {
            return '@import "~@/styles/variables.scss";' + content
          }
          return content
        }
      }
    }
  },
  chainWebpack: config => {
    config.when(process.env.NODE_ENV === 'development', config => {
      config.devtool('source-map') // cheap-module-eval-source-map
    })
    // 设置别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('^', resolve('src/components'))
      .set('styles', resolve('src/styles'))

    if (isProduction) {
      // cdn 注入
      // config.plugin('html')
      //   .tap(args => {
      //     args[0].cdn = cdn;
      //     return args;
      //   })

      // 移除 prefetch 插件
      config.plugins.delete('prefetch')

      // 把 runtime 从 preload 去除
      config.plugin('preload').tap(args => {
        args[0].fileBlacklist.push(/runtime~.+\.js$/)
        return args
      })

      // 分析打包文件 npm run build --report
      if (process.env.npm_config_report) {
        config
          .plugin('webpack-bundle-analyzer')
          .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
          .end()
      }
    }
  },
  configureWebpack: config => {
    config.plugins.push(
      // 需要自动注入并加载的模块
      new Webpack.ProvidePlugin({}),
      // 添加打包进度条
      new WebpackBar({
        name: `\u7ba1\u7406\u540e\u53f0` // 管理后台
      })
    )

    if (isProduction) {
      // 生成环境取消打包的依赖，改为cdn
      // config.externals = cdn.externals

      config.plugins.push(
        // gzip 压缩
        new CompressionWebpackPlugin({
          algorithm: 'gzip',
          test: /\.js$|\.html$|.\css/, // 匹配文件名
          threshold: 10240, // 对超过10k的数据压缩
          minRatio: 0.8,
          deleteOriginalAssets: false // 不删除源文件
        }),
        // 抽离 runtime
        new ScriptExtHtmlWebpackPlugin({
          inline: /runtime~.+\.js$/
        })
      )

      config.performance.set('hints', false)

      // webpack 优化
      config.optimization = {
        runtimeChunk: 'single', // 单独抽离，利用缓存优化
        // 公共代码抽离
        splitChunks: {
          chunks: 'all', // 代码块类型 “initial”（初始化） | “all”(默认就是 all) | async （动态加载）
          // minSize: 30000, // （默认是 30000 ）生成块的最小大小（以字节为单位）
          // minChunks: 2, // （默认是1）在分割之前，这个代码块最小应该被引用的次数
          // name: true,
          // maxAsyncRequests: 5,      // 按需加载时候最大的并行请求数
          // maxInitialRequests: 30,      // 入口点的最大并行请求数
          // enforceSizeThreshold: 50000,      // 强制执行拆分的大小阈值和其他限制（minRemainingSize，maxAsyncRequests，maxInitialRequests）将被忽略
          // automaticNameDelimiter: '_',
          // automaticNamePrefi: 'ven',
          cacheGroups: {
            libs: {
              name: 'chunk-libs',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              chunks: 'initial'
            },
            UI: {
              name: 'chunk-UI',
              priority: 20,
              test: /[\\/]node_modules[\\/]_?ant-design-vue(.*)/
            },
            components: {
              name: 'chunk-components',
              test: resolve('src/components'),
              minChunks: 3,
              priority: 5,
              reuseExistingChunk: true
            }
          }
        },

        // 压缩优化
        minimizer: [
          new TerserPlugin({
            sourceMap: false,
            parallel: true,
            cache: true,
            terserOptions: {
              warnings: false,
              compress: {
                drop_debugger: true // remove debugger
                // drop_console: true,           // 注释console.*
                // pure_funcs: ['console.log']   // 移除 console.log
              }
            }
          })
        ]
      }
    }
  }
}
