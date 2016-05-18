// @file copy.js
const gulp = require('gulp');
const config = require('../config').copy;

gulp.task('copy', function() {
  gulp.src(config.src)
      .pipe(gulp.dest(config.dest));
});

