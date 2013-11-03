/*jslint node: true */
'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jekyll: {
      serve : {
        options : {
          serve : true,
          port : 8000,
          src: 'src',
          dest : 'dev'
        }
      },
      dev : {
        options:{
          src: 'src',
          dest : 'dev'
        }
      },
      prod : {
        options:{
          src: 'src',
          dest : 'prod'
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

    concurrent: {
      target: {
        tasks: ['compass','jekyll:serve', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    
    watch: { // for development run 'grunt watch'
      compass : {
        files: ['src/**/*.scss',
                'src/**/*.sass'],
        tasks: ['compass','jekyll:dev']
      },
      jekyll: {
        files: ['src/about/**/*.html',
                'src/blog/**/*.html',
                'src/_layouts/**/*.html',
                'src/_posts/**/*.markdown'],
        tasks: ['jekyll:dev']
      }
    }

  });

  grunt.loadNpmTasks('grunt-jekyll');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concurrent:target']);
  grunt.registerTask('production', ['compass','jekyll:prod']);
};
