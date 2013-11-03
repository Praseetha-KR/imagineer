/*jslint node: true */
'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jekyll: {
      options : {
        src: 'src',
        config : '_config.yml'
      },
      serve : {
        options : {
          serve : true,
          port : 8000,
          dest : 'dev'
        }
      },
      dev : {
        options:{
          dest : 'dev'
        }
      },
      prod : {
        options:{
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
