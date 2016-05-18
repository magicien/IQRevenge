// @file watch.js
const gulp = require('gulp');
const watch = require('gulp-watch');
const config = require('../config').watch;

gulp.task('watch', function() {
  // js
  watch(config.js, function() {
    gulp.start(['webpack']);
  });

  // styl
  watch(config.styl, function() {
    gulp.start(['stylus']);
  });

  // www
  watch(config.www, function() {
    gulp.start(['copy']);
  });
});

