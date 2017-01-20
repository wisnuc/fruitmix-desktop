/**
 * @description webpack 开发环境配置
 *
 **/

'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin=require("html-webpack-plugin");

module.exports = {

    output: {
        path: 'public',
        filename  : 'bundle.js',
        hash: true
    },

    cache  : true,
    debug  : true,
    target: 'electron',
    watchOptions: {
        poll: true
    },
    debug: true,
    devtool: 'eval-source-map',
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
            },
            {
                test  : /\.(css|sass)$/,
                loader: 'style-loader!css-loader'
            },
            {
                test  : /\.(png|jpg|jpeg|ico|gif|woff|woff2|ttf|eot|svg)$/,
                loader: 'url-loader?limit=8192'
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        // new HtmlWebpackPlugin({template: path.resolve(__dirname, 'src/index.html')}),
        new webpack.DefinePlugin({ "global.GENTLY": false })
    ]

};
