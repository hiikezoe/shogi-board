// Karma configuration
// Generated on Mon Sep 29 2014 16:38:22 GMT+0900 (JST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['polymerTest', 'jasmine-jquery', 'jasmine'],

    detectBrowsers: {
      // enable/disable, default is true
      enabled: false,

      // enable/disable phantomjs support, default is true
      usePhantomJS: false
    },

    // list of files / patterns to load in the browser
    files: [
      'test/*.js',
      { pattern: 'test/fixtures/**', included: false, watched: true, served: true },
      { pattern: 'elements/shogi-*.*', included: false, watched: true, served: true },
      { pattern: 'elements/images/*.svg', included: false, watched: true, served: true },
    ],

    // list of files to exclude
    exclude: [
      '**/*.swp',
      'shogi-*.*',
      'images',
      'demo.html'
    ],


    polymerTest: {
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    proxies: {
      '/base/shogi-board.html': '/base/elements/shogi-board.html',
      '/base/shogi-board.js': '/base/elements/shogi-board.js',
      '/base/shogi-board.css': '/base/elements/shogi-board.css',
      '/base/shogi-piece.css': '/base/elements/shogi-piece.css',
      '/base/images': '/base/elements/images',
      '/base/bower_components/bower_components': '/base/bower_components',
      '/test/fixtures': '/base/test/fixtures',
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
