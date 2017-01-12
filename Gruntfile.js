/**
 * @description grunt 配置
 *
 **/
'use strict'
    // webpackDevConfig = require('./webpack.config.js');
module.exports = function (grunt) {
    // Let *load-grunt-tasks* require everything
    grunt.loadNpmTasks('grunt-contrib-clean')
    // Read configuration from package.json
    var pkgConfig = grunt.file.readJSON('package.json');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
        clean: ["<%= pkg.download %>", "a.txt.txt"]
    });
    // grunt.registerTask('serve', function (target) {
    //     if (target === 'dist') {
    //         return grunt.task.run(['build', 'open:dist', 'connect:dist']);
    //     }
    //     grunt.task.run([
    //         'open:dev',
    //         'webpack-dev-server'
    //     ]);
    // });
    // grunt.registerTask('build', ['clean', 'webpack', 'htmlmin']);
    // grunt.registerTask('default', []);
    grunt.registerTask('clean', ['clean']);
};