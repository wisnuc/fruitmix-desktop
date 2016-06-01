/**
 * @description webpack 生产环境配置
 *
 **/

'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin=require("html-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

    output: {
        publicPath: 'assets/',
        path      : 'dist/assets/',
        filename  : 'bundle.js?[hash:8]',
        hash: true
    },

    debug  : false,
    devtool: false,

    entry: {
        app: './src/app/app.js'
    },

    stats: {
        colors : true,
        reasons: false
    },

    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoErrorsPlugin(),
        new HtmlWebpackPlugin({template: 'src/index.html'}),
        new CopyWebpackPlugin([
            { from:  'src/electron-index.js', to: 'electron-index.js' }
        ])
    ],

    resolve: {
        extensions: ['', '.js', '.json', '.jsx', '.css']
    },

    module: {
        //preLoaders: [
        //    {
        //        test   : /\.(js|jsx)$/,
        //        exclude: /node_modules/,
        //        loader : 'eslint-loader'
        //    }
        //],

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
    }
};
