/**
 * @description webpack 开发环境配置
 *
 **/

'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin=require("html-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ELE_PATH = path.resolve(__dirname, 'ele');
var SRC_PATH = path.resolve(__dirname, 'src');

module.exports = {

    output: {
        path: 'ele',
        filename  : 'bundle.js',
        hash: true
    },

    cache  : true,
    debug  : true,
    target: 'electron',

    entry: [
        'webpack/hot/poll?1000',
        // 'webpack/hot/only-dev-server',
        './src/app/app.js'
    ],

    stats: {
        colors : true,
        reasons: true
    },

    resolve: {
        extensions: ['', '.js', '.json', '.jsx', '.css']
    },

    module: {

        loaders: [

            {
                test   : /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader : 'react-hot!babel-loader'
            }, {
                test  : /\.css$/,
                loader: 'style-loader!css-loader'
            }, {
                test  : /\.(png|jpg|jpeg|ico|gif|woff|woff2|ttf|eot|svg)$/,
                loader: 'url-loader?limit=8192'
            }
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({template: 'src/index.html'}),
        new CopyWebpackPlugin([
            { from:  path.resolve(SRC_PATH,'electron-index.js'), to: 'electron-index.js' }
        ])
    ]

};
