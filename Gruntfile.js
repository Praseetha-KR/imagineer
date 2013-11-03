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

    concurrent: {
      target: {
        tasks: ['jekyll:serve', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    
    watch: { // for development run 'grunt watch'
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
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concurrent:target']);
  grunt.registerTask('production', ['jekyll:prod']);
};
