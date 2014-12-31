module.exports = function(grunt) {
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      clean: ['dist/'],

      uglify: {
         options: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
               '<%= grunt.template.today("yyyy-mm-dd") %> */'
         },
         src: {
            files: {
               'dist/<%= pkg.name %>.js': ['src/**.*js'],
            }
         }
      },

      metalsmith: {
        content: {
          options: {
            metadata: {
              pkg: grunt.file.readJSON('package.json'),
              env: process.env,
            },

            plugins: {
              'metalsmith-in-place': {
                engine: 'swig',
              },
              
              'metalsmith-templates': {
                engine: 'swig',
              }
            }
          },

          src: 'content',
          dest: 'dist'
        }
      },

      copy: {
         html: {
            expand: true,
            cwd: 'src/',
            src: ['*.html'],
            dest: 'dist/',
         },

         asset: {
            expand: true,
            cwd: 'asset/',
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

         html: {
            files: ['src/*.html'],
            tasks: ['copy:html'],
         },

         asset: {
            files: ['asset/**/*'],
            tasks: ['copy:asset'],
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
   grunt.loadNpmTasks('grunt-metalsmith');
   grunt.loadNpmTasks('grunt-contrib-uglify');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-compress');
   grunt.loadNpmTasks('grunt-contrib-connect');

   grunt.registerTask('build', ['metalsmith', 'uglify', 'copy']);
   grunt.registerTask('server', ['connect', 'watch']);
   grunt.registerTask('default', ['build', 'server']);
};
