/*jslint node: true */
'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        jekyll: {
            options: {
                src: 'src',
                config: '_config.yml'
            },
            serve: {
                options: {
                    serve: true,
                    port: 9000,
                    dest: 'dev'
                }
            },
            dev: {
                options: {
                    dest: 'dev'
                }
            },
            prod: {
                options: {
                    dest: 'prod'
                }
            }
        },

        compass: {
            dist: {
                options: {
                    config: 'config.rb'
                }
            }
        },

        concat: {
            js: {
                src: ['src/assets/js/vendor/*.js', 'src/assets/js/scripts.js'],
                dest: 'src/assets/js/main.js'
            },
            css: {
                src: ['src/assets/css/vendor/*.css', 'src/assets/css/app.css'],
                dest: 'src/assets/css/main.css'
            }
        },

        concurrent: {
            target: {
                tasks: ['compass', 'jekyll:serve', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },

        watch: { // for development run 'grunt watch'
            compass: {
                files: ['src/**/*.scss',
                    'src/**/*.sass'
                    ],
                tasks: ['compass', 'jekyll:dev']
            },
            jekyll: {
                files: ['src/**/*.html',
                    'src/**/*.markdown'
                    ],
                tasks: ['jekyll:dev']
            }
        },

    });

    grunt.loadNpmTasks('grunt-jekyll');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['concat', 'concurrent:target']);
    grunt.registerTask('production', ['compass', 'jekyll:prod']);
};