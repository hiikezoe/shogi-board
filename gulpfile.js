var gulp = require('gulp');
var karma = require('karma').server;
var replace = require('gulp-replace');

var paths = {
  src: 'elements',
  dist: './'
};

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

gulp.task('copy', function(done) {
  return gulp.src(paths.src)
    .pipe(gulp.dest(paths.dist));
});

gulp.task('dist', ['copy'], function(cb) {
  return gulp.src('shogi-board.html')
    .pipe(replace(/..\/bower_components\//g,
                  '../../'));
});
