const path = require('path')
const webpack = require('webpack')

module.exports = {
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  target: 'electron',
  devtool: 'eval-source-map',
  entry: [
    'webpack/hot/poll?1000',
    './src/app.js'
  ],
  stats: { colors: true },
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
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({ 'global.GENTLY': false })
  ]
}
