/**
 * @description webpack 开发环境配置
 *
 **/

// 'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin=require("html-webpack-plugin");
var MDC_DIR = path.resolve(__dirname, 'node_modules', '@material');

module.exports = {
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
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
  stats: { colors : true, reasons: true },
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
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
        ]
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({ "global.GENTLY": false })
  ]
}
