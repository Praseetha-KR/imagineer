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

        concat: { // concatenate files to single file
            js: {
                src: ['src/assets/js/vendor/*.js', 'src/assets/js/scripts.js'],
                dest: 'src/assets/js/app.js'
            },
            css: {
                src: ['src/assets/css/vendor/*.css', 'src/assets/css/main.css'],
                dest: 'src/assets/css/app.css'
            }
        },

        cssmin: {
            css: {
                src: 'src/assets/css/app.css',
                dest: 'src/assets/css/app.min.css'
            }
        },

        uglify: {
            js: {
                src: 'src/assets/js/app.js',
                dest: 'src/assets/js/app.min.js'
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
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'cssmin', 'uglify', 'concurrent:target']);
    grunt.registerTask('production', ['compass', 'jekyll:prod']);
};