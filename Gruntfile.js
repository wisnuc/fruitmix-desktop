'use strict';

module.exports = (grunt) => {
    require('load-grunt-tasks')(grunt)
    require('time-grunt')(grunt)
    var config = {
        app: 'app',
        dist: 'dist',
        public: 'public'
    }

    grunt.initConfig({
        config: config,

        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: '*.html',
                        dest: '<%= config.dist %>/',
                        ext: '.min.html',//替换后缀
                        extDot: 'first',//从第几个点开始替换
                    },
                    {
                        expand: true,
                        cwd: '<%= config.app %>/',
                        src: '**/*.js',
                        dest: '<%= config.dist %>/',
                        ext:'.js',
                        extDot: 'last',
                        flatten: true,//会将中间目录去除
                        rename: (dest, src) => {
                            return dest + 'js/' + src
                        }
                    }
                ]
            }
        },

        clean: {
            dist: {
                src: ['<%= config.public%>/**.js'],
                filter: 'isFile',
                // filter: (filepath) => {
                //  return !grunt.file.isDir(filepath)
                // }
                dot: true ,//同时命中以点开头的目标
                matchBase:true, //a?b 会命中 /xyz/123/acb   不会命中//xyz/acb/123
                expand:true 
            }
        }
    })
}