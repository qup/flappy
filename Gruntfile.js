module.exports = function(grunt) {
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      clean: ['dist/'],

      uglify: {
         src: {
            options: {
               sourceMap: true,
            },
            files: {
               'dist/<%= pkg.name %>.js': ['src/**.*js'],
            }
         }
      },

      copy: {
         html: {
            expand: true,
            cwd: 'src/',
            src: ['*.html'],
            dest: 'dist/',
         },

         assets: {
            expand: true,
            cwd: 'assets/',
            src: ['**'],
            dest: 'dist/',
         }
      },

      watch: {
         options: {
            livereload: true,
         },

         src: {
            files: ['src/**/*.js'],
            tasks: ['uglify:src'],
         },

         assets: {
            files: ['src/*.html'],
            tasks: ['copy:html'],
         },

         assets: {
            files: ['assets/**/*'],
            tasks: ['copy:assets'],
         },
      },

      connect: {
         dist: {
            options: {
               base: 'dist/'
            },
         },
      },

      compress: {
         dist: {
            options: {
               archive: '<%= pkg.name %>-<%= pkg.version %>.zip'
            },
            files : [{
               expand: true,
               src : "**/*",
               cwd : "dist/"
            }],
         },
      }
   });

   grunt.loadNpmTasks('grunt-contrib-clean');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-compress');
   grunt.loadNpmTasks('grunt-contrib-connect');

   grunt.registerTask('default', ['connect', 'watch']);
};
