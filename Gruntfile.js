module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({

    clean: ["dist"],

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.scss'],
        dest: 'dist'
      },
      pluginDef: {
        expand: true,
        src: ['README.md'],
        dest: 'dist'
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*'],
        tasks: ['watchTask'],
        options: {spawn: false}
      }
    },

    babel: {
      options: {
        sourceMap: true,
        presets:  ['es2015']
      },
      dist: {
        options: {
          plugins: ['transform-es2015-modules-systemjs', 'transform-es2015-for-of']
        },
        files: [{
          cwd: 'src',
          expand: true,
          src: ['**/*.js'],
          dest: 'dist',
          ext:'.js'
        }]
      },
      distTestNoSystemJs: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['**/*.js'],
          dest: 'dist/test',
          ext:'.js'
        }]
      },
      distTestsSpecsNoSystemJs: {
        files: [{
          expand: true,
          cwd: 'spec',
          src: ['**/*.js'],
          dest: 'dist/test/spec',
          ext:'.js'
        }]
      }
    },

    jshint: {
      source: {
        files: {
          src: ['src/**/*.js'],
        }
      },
      options: {
        jshintrc: true,
        reporter: require('jshint-stylish'),
        ignores: [
          'node_modules/*',
          'dist/*',
        ]
      }
    },

    jscs: {
      src: ['src/**/*.js'],
      options: {
        config: ".jscs.json",
      },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: [
          'dist/test/spec/test-main.js',
          'dist/test/spec/*_spec.js'
        ]
      }
    }

  });

  grunt.registerTask('default', [
    'copy:src_to_dist',
    'copy:pluginDef',
    'jshint',
    'jscs',
    'babel',
    'mochaTest'
  ]);

  grunt.registerTask('dev', ['default', 'watch']);

  grunt.registerTask('watchTask', [
    // 'clean',
    'copy:src_to_dist',
    'copy:pluginDef',
    'babel',
    'jshint',
    'jscs'
  ]);
};
