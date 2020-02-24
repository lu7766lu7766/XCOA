const mix = require('laravel-mix')

const rm = require('rimraf')
rm(path.join(__dirname, 'public/vue/vendor'), err => {
})

mix.webpackConfig({
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      // 'vue$': 'vue/dist/vue.esm.js',
      '~': __dirname + '/node_modules',
      '@': __dirname + '/resource/js/components',
      'mixins': __dirname + '/resource/js/mixins',
      'config': __dirname + '/resource/js/config',
      'lib': __dirname + '/resource/js/lib',
      'constants': __dirname + '/resource/js/constants',
    },
  },
  output: {
    path: path.resolve(__dirname, 'public/vue'),
    publicPath: '/public/vue/',
    chunkFilename: 'vendor/[name].js',
  },
})

mix.js('resource/js/View.js', './')
  .autoload({
    // jquery: ['$', 'window.jQuery', 'jQuery'],
    moment: 'moment',
    axios: 'axios',
    _: 'lodash'
  })
  .extract(['vue', 'lodash', 'moment'])

require('simple-server')('.')