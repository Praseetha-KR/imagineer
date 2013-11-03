/*global module:false*/
module.exports = function(grunt) {

  grunt.initConfig({

    watch: { // for development run 'grunt watch'
      jekyll: {
      files: ['templates/*.html'],
      tasks: ['jekyll:dev']
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['watch']);

};
