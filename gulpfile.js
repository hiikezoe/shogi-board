var concat = require('gulp-concat');
var gulp = require('gulp');
var karma = require('karma').server;
var replace = require('gulp-replace');

var paths = {
  src: ['elements/*.js', 'elements/*.css', 'elements/*.html'],
  scripts: ['elements/shogi-board.js', 'elements/kif-parser/kif-parser.js'],
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

gulp.task('dist', ['scripts'], function(cb) {
  return gulp.src('./shogi-board.html')
    .pipe(replace(/..\/bower_components\//g,
                  '../'))
    .pipe(replace(/<(script src="kif-parser\/kif-parser\.js.*script)>/g,
                  '<!--$1-->'))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('scripts', ['copy'], function() {
  return gulp.src(paths.scripts)
    .pipe(concat('shogi-board.js'))
    .pipe(gulp.dest(paths.dist));
});
