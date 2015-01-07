module.exports = function(grunt) {
   grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),

      clean: ['dist/'],

      browserify: {
         options: {
            banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
               '<%= grunt.template.today("yyyy-mm-dd") %> */',

            browserifyOptions: {
              standalone: 'flappy',
              transform: ['6to5ify']
            },
         },
         src: {
            files: {
               'dist/<%= pkg.name %>.js': ['src/index.js'],
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
            tasks: ['browserify'],
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
   grunt.loadNpmTasks('grunt-browserify');
   grunt.loadNpmTasks('grunt-contrib-copy');
   grunt.loadNpmTasks('grunt-contrib-watch');
   grunt.loadNpmTasks('grunt-contrib-compress');
   grunt.loadNpmTasks('grunt-contrib-connect');

   grunt.registerTask('build', ['browserify', 'copy']);
   grunt.registerTask('server', ['connect', 'watch']);
   grunt.registerTask('default', ['build', 'server']);
};
