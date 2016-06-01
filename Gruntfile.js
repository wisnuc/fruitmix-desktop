/**
 * @description grunt 配置
 *
 **/

'use strict';

var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};
var webpackDistConfig = require('./webpack.dist.config.js'),
    webpackDevConfig = require('./webpack.config.js');
module.exports = function (grunt) {
    // Let *load-grunt-tasks* require everything
    require('load-grunt-tasks')(grunt);
    // Read configuration from package.json
    var pkgConfig = grunt.file.readJSON('package.json');
    grunt.initConfig({
        pkg: pkgConfig,
        webpack: {
            options: webpackDistConfig,
            dist   : {
                cache: false
            }
        },
        'webpack-dev-server': {
            options: {
                hot        : true,
                port       : 8000,
                webpack    : webpackDevConfig,
                contentBase: './<%= pkg.src %>/'
            },
            start: {
                keepAlive: true
            }
        },
        connect: {
            options: {
                hostname: 'localhost',
                port    : 8000
            },
            dist: {
                options: {
                    keepalive : true,
                    open      : true,
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, pkgConfig.dist)
                        ];
                    }
                }
            }
        },
        open: {
            options: {
                delay: 500
            },
            dev    : {
                path: 'http://localhost:<%= connect.options.port %>/webpack-dev-server/'
            },
            dist   : {
                path: 'http://localhost:<%= connect.options.port %>/'
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments    : true,
                    collapseWhitespace: true
                },
                files  : {
                    'dist/index.html': 'dist/assets/index.html'
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= pkg.dist %>'
                    ]
                }]
            }
        }
    });
    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:dist', 'connect:dist']);
        }
        grunt.task.run([
            // 'open:dev',
            'webpack-dev-server'
        ]);
    });
    grunt.registerTask('build', ['clean', 'webpack', 'htmlmin']);
    grunt.registerTask('default', []);
};
