module.exports = function(grunt) {

  // Display the elapsed execution time of grunt tasks
  require('time-grunt')(grunt);
  // Load all grunt-* packages from package.json
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    
    // configure grunt to execute jshint
    jshint: {
      files: ['Gruntfile.js', 'app/**/*.js', 'tests/**/*.js'],
      options: {
        ignores: ['app/shared/api.js', 'node_modules/**/*', 'bower_components/**/*', 'tests/reports/**/*'],
        reporterOutput: "",
        force: true,
        esversion: 6,
        globals: {
          //jQuery: true,     // jQuery
          window: true,     // JavaScript
          Buffer: true,     // JavaScript?
          
          require: true,    // nodejs
          
          angular: true,    // angular
          
          module: true,     // angular-mocks
          inject: true,     // angular-mocks
          
          describe: true,   // jasmine
          it: true,         // jasmine
          beforeAll: true,  // jasmine
          beforeEach: true, // jasmine
          afterEach: true,  // jasmine
          afterAll: true,   // jasmine
          expect: true,     // jasmine
          element: true,    // jasmine
          
          browser: true,    // protractor
          by: true,         // protractor
        }
      }
    },
    
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['asset/css/*.css']
      },
      lax: {
        options: {
          import: false
        },
        src: ['asset/css/*.css']
      }
    },

    imagemin: {
       dist: {
          options: {
            optimizationLevel: 5
          },
          files: [{
             expand: true,
             cwd: 'asset/png',
             src: ['**/*.{png,jpg,gif}'],
             dest: 'dist/png'
          }]
       }
    }, 

    cssmin: {
      options:{
        banner: '/*! WARNING: This file is automatically generated by Grunt and should not be modified directly !*/',
        keepSpecialComments: 0,
//        shorthandCompacting: false,
//        roundingPrecision: -1
      },
      target: {
        files: {
          'dist/main.min.css': [ 'asset/css/theme.min.css', 'asset/css/suppl.css', 'asset/css/font-roboto.css', 'asset/css/animations.css'  ],
        }
      }
    },
    
    // configure grunt to minify js / css
    uglify: {
      options: {
        banner: '/*! WARNING: This file is automatically generated by Grunt and should not be modified directly !*/',
        compress: true,
        mangle: true,
        
        // Uncomment these lines to generate a source map
        sourceMap: true,
        sourceMapIncludeSources: true,
        //sourceMapIn: 'dist/main.min.js.map',
      },
      target: {
          src: [
            'app/shared/api.js',
            'app/shared/services.js',
            'app/shared/filters.js',
            'app/shared/directives.js',
            'app/app.js',
            'app/**/*Controller.js',
          ],
          dest: 'dist/main.min.js'
      }
    },
    
    // configure grunt to start the ExpressJS server
    express: {
      options: {
        script: 'server.js',
      },
      prod: {
        options: {
          background: false,
          node_env: 'production'
        }
      },
      test: {
        options: {
          // Print a stack trace whenever a sync function is used
          // NOTE: For debug use only, disable in production
          opts: [ '--trace-sync-io' ],
          background: true,
       }
     }
    },
    
    // configure grunt to run karma unit tests + coverage
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true,        // Stop after running once?
        autoWatch: false,       // Auto-run tests when files change on disk?
        background: false,      // Prevent this task from blocking subsequent tasks?
      }
    },
	  
    // configure grunt to run protractor e2e tests (TODO: coverage)
    protractor: {
      options: {
        configFile: "node_modules/protractor/example/conf.js", // Default config file 
        keepAlive: true, // If false, the grunt process stops when the test fails. 
        noColor: false, // If true, protractor will not use colors in its output. 
      },
      ndslabs: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too. 
        options: {
          configFile: "protractor.conf.js", // Target-specific config file 
          args: {
            
          }, // Target-specific arguments 
        }
      },
    },

    // configure grunt to start / stop xvfb
    shell: {
        runxvfb: {
            command: 'Xvfb :99 -ac -screen 0 1600x1200x24',
            options: {
                async: true
            }
        },
        installxvfb: {
            command: 'bash ./install-headless-deps.sh',
            options: {
                async: false
            }
        },
        runselenium: {
            command: 'webdriver-manager start >/dev/null 2>&1',
            options: {
                async: true,
            }
        },
        webdriverupdate: {
            command: 'webdriver-manager update',
            options: {
                async: false
            }
        },
        options: {
            stdout: true,
            stderr: true,
            failOnError: false
        }
    },

    // configure grunt to set env vars
    env: {
        runxvfb: {
            DISPLAY: ':99'
        }
    },

    // configure Grunt to wait for Selenium to startup
    wait: {
        options: {
            delay: 3000
        },
        runselenium: {      
            options: {
                before : function(options) {
                    console.log('pausing %dms to wait for selenium server to start...', options.delay);
                },
                after : function() {
                    console.log('pause end');
                }
            }
        },
    } 
  });

  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-wait');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-protractor-runner');

  // Adjust task execution order here
  grunt.registerTask('start', [ 'express:prod' ]);
  grunt.registerTask('lint', [ 'jshint', /*'csslint'*/ ]);
  grunt.registerTask('optimize', [ 'imagemin', 'cssmin', 'uglify' ]);

  grunt.registerTask('ship', [ 'lint', 'optimize' ]);

  grunt.registerTask('default', [ 'ship', 'start' ]);

  grunt.registerTask('protractor-xvfb', [
    'shell:installxvfb',
    'shell:runxvfb',
    'env:runxvfb',
    'shell:webdriverupdate',
    'shell:runselenium',
    'wait:runselenium',
    'protractor:ndslabs',
    'shell:runselenium:kill',
    'shell:runxvfb:kill'
  ]);

  // Add an additional task for running unit / e2e tests
  grunt.registerTask('test', [ 'express:test', /*'karma',*/ 'protractor-xvfb' ]);
};
