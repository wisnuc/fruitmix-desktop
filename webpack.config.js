/**
 * @description webpack 开发环境配置
 *
 **/
const path = require('path')
const webpack = require('webpack')

module.exports = {
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  cache: true,
  target: 'electron',
  watchOptions: {
    poll: true
  },
  devtool: 'eval-source-map',
  entry: [
    'webpack/hot/poll?1000',
    './src/app.js'
  ],
  stats: { colors: true, minimal: true },
  resolve: { extensions: ['.js', '.jsx', '.css', '.json'] },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'react-hot-loader!babel-loader'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({ 'global.GENTLY': false }),
    new webpack.ProvidePlugin({
      'fetch': 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch'
    })
  ]
}
