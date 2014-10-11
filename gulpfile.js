var gulp = require('gulp');
var karma = require('karma').server;

gulp.task('test', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('serve', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
  }, done);
});
